import { useState, useEffect, useMemo } from 'react';
import { parseISO, isAfter, isBefore } from 'date-fns';
import { momenceAPI, type Session, type SessionDetail, type Booking } from '@/lib/api';
import { SessionsTable } from '@/components/sessions-table';
import { CalendarView } from '@/components/calendar-view';
import { MonthlyView } from '@/components/monthly-view';
import { KanbanView } from '@/components/kanban-view';
import { FilterPanel, type SessionFilters } from '@/components/filter-panel';
import { SessionDetailDialog } from '@/components/session-detail-dialog';
import { ReportsPanel } from '@/components/reports-panel';
import { Header } from '@/components/header';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { List, Calendar, Grid3X3, LayoutGrid, BarChart3 } from 'lucide-react';

type ViewType = 'table' | 'calendar' | 'monthly' | 'kanban' | 'reports';
type SessionsTab = 'upcoming' | 'past';

function App() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionDetail | null>(null);
  const [sessionBookings, setSessionBookings] = useState<Booking[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingSessionDetail, setLoadingSessionDetail] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('table');
  const [currentTab, setCurrentTab] = useState<SessionsTab>('upcoming');
  const [filters, setFilters] = useState<SessionFilters>({});

  useEffect(() => {
    loadSessions();
  }, []);

  const filteredSessions = useMemo(() => {
    let filtered = [...sessions];
    const now = new Date();




    // First apply tab filter (upcoming vs past)
    if (currentTab === 'upcoming') {
      filtered = filtered.filter(session => {
        const endTime = parseISO(session.endsAt);
        // Include sessions that haven't ended yet (both upcoming and in-progress)
        return !session.isCancelled && now <= endTime;
      });
    } else if (currentTab === 'past') {
      filtered = filtered.filter(session => {
        const endTime = parseISO(session.endsAt);
        // Include sessions that have ended or are cancelled
        return now > endTime || session.isCancelled;
      });
    }
    
    // Apply search filter
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(session => 
        session.name.toLowerCase().includes(searchTerm) ||
        session.description?.toLowerCase().includes(searchTerm) ||
        `${session.teacher.firstName} ${session.teacher.lastName}`.toLowerCase().includes(searchTerm)
      );
    }

    // Apply date range filter
    if (filters.dateRange?.start) {
      filtered = filtered.filter(session => 
        isAfter(parseISO(session.startsAt), new Date(filters.dateRange!.start))
      );
    }
    if (filters.dateRange?.end) {
      filtered = filtered.filter(session => 
        isBefore(parseISO(session.startsAt), new Date(filters.dateRange!.end))
      );
    }

    // Apply class type filter
    if (filters.classType) {
      filtered = filtered.filter(session => session.type === filters.classType);
    }

    // Apply instructor filter
    if (filters.instructor) {
      filtered = filtered.filter(session => 
        `${session.teacher.firstName} ${session.teacher.lastName}` === filters.instructor
      );
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(session => 
        session.inPersonLocation?.name === filters.location
      );
    }

    // Apply status filter
    if (filters.status) {
      const now = new Date();
      filtered = filtered.filter(session => {
        const startTime = parseISO(session.startsAt);
        const endTime = parseISO(session.endsAt);
        
        switch (filters.status) {
          case 'upcoming': return !session.isCancelled && now < startTime;
          case 'completed': return !session.isCancelled && now > endTime;
          case 'cancelled': return session.isCancelled;
          default: return true;
        }
      });
    }

    // Apply capacity filter
    if (filters.capacity) {
      filtered = filtered.filter(session => {
        const availableSpots = session.capacity - session.bookingCount;
        switch (filters.capacity) {
          case 'available': return availableSpots > 0;
          case 'full': return availableSpots <= 0 && !session.waitlistCapacity;
          case 'waitlist': return availableSpots <= 0 && session.waitlistCapacity && session.waitlistCapacity > 0;
          default: return true;
        }
      });
    }

    return filtered;
  }, [sessions, filters, currentTab]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await momenceAPI.getSessions();
      setSessions(response.payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = async (sessionId: number) => {
    try {
      setLoadingSessionDetail(true);
      setDialogOpen(true);
      
      const [sessionDetail, bookingsResponse] = await Promise.all([
        momenceAPI.getSessionDetail(sessionId),
        momenceAPI.getSessionBookings(sessionId)
      ]);
      
      setSelectedSession(sessionDetail);
      setSessionBookings(bookingsResponse.payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session details');
    } finally {
      setLoadingSessionDetail(false);
    }
  };



  const handleCheckIn = async (bookingId: number) => {
    try {
      await momenceAPI.checkInBooking(bookingId);
      // Refresh the session bookings to show updated status
      if (selectedSession) {
        const bookingsResponse = await momenceAPI.getSessionBookings(selectedSession.id);
        setSessionBookings(bookingsResponse.payload);
      }
    } catch (error) {
      console.error('Failed to check in booking:', error);
    }
  };

  const handleCheckOut = async (bookingId: number) => {
    try {
      await momenceAPI.checkOutBooking(bookingId);
      // Refresh the session bookings to show updated status
      if (selectedSession) {
        const bookingsResponse = await momenceAPI.getSessionBookings(selectedSession.id);
        setSessionBookings(bookingsResponse.payload);
      }
    } catch (error) {
      console.error('Failed to check out booking:', error);
    }
  };

  const handleCancelBooking = async (bookingId: number, isLateCancellation?: boolean) => {
    try {
      await momenceAPI.cancelBooking(bookingId, isLateCancellation || false);
      // Refresh the session bookings to show updated status
      if (selectedSession) {
        const bookingsResponse = await momenceAPI.getSessionBookings(selectedSession.id);
        setSessionBookings(bookingsResponse.payload);
      }
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/30 flex items-center justify-center">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20">
          <LoadingSpinner size="xl" variant="luxury" />
          <p className="mt-6 text-xl font-semibold text-luxury-gradient">Loading class schedule...</p>
          <p className="mt-2 text-gray-600">Preparing your premium experience</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-rose-50/20 flex items-center justify-center">
        <div className="text-center p-8 max-w-md bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200/30">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Connection Error</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button 
            onClick={loadSessions}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 via-white to-purple-50/20">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Class Schedule
              </h1>
              <p className="text-lg text-muted-foreground">
                Manage your fitness classes • {filteredSessions.length} classes found
                {(() => {
                  const now = new Date();
                  const inProgressCount = sessions.filter(s => {
                    const startTime = parseISO(s.startsAt);
                    const endTime = parseISO(s.endsAt);
                    return !s.isCancelled && now >= startTime && now <= endTime;
                  }).length;
                  const upcomingCount = sessions.filter(s => {
                    const startTime = parseISO(s.startsAt);
                    return !s.isCancelled && now < startTime;
                  }).length;
                  const pastCount = sessions.filter(s => {
                    const endTime = parseISO(s.endsAt);
                    return now > endTime || s.isCancelled;
                  }).length;
                  
                  return inProgressCount > 0 ? (
                    <div className="mt-2 text-sm">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full font-medium">
                        🔴 {inProgressCount} Live Now
                      </span>
                      <span className="ml-2 text-gray-600">
                        • {upcomingCount} Upcoming • {pastCount} Past
                      </span>
                    </div>
                  ) : null;
                })()}
              </p>
            </div>
            
            {/* View Switcher */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-2">
                <div className="flex items-center space-x-2">
                  <Button
                    variant={currentView === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('table')}
                    className={currentView === 'table' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                      : 'hover:bg-blue-50 text-gray-700'
                    }
                  >
                    <List className="w-4 h-4 mr-2" />
                    Table
                  </Button>
                  <Button
                    variant={currentView === 'calendar' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('calendar')}
                    className={currentView === 'calendar' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                      : 'hover:bg-blue-50 text-gray-700'
                    }
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Timeline
                  </Button>
                  <Button
                    variant={currentView === 'monthly' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('monthly')}
                    className={currentView === 'monthly' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                      : 'hover:bg-blue-50 text-gray-700'
                    }
                  >
                    <Grid3X3 className="w-4 h-4 mr-2" />
                    Monthly
                  </Button>
                  <Button
                    variant={currentView === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('kanban')}
                    className={currentView === 'kanban' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                      : 'hover:bg-blue-50 text-gray-700'
                    }
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Board
                  </Button>
                  <Button
                    variant={currentView === 'reports' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentView('reports')}
                    className={currentView === 'reports' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg' 
                      : 'hover:bg-blue-50 text-gray-700'
                    }
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Selector - Show only for non-reports views */}
          {currentView !== 'reports' && (
            <div className="flex justify-center mb-6">
              <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                <Button
                  variant={currentTab === 'upcoming' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentTab('upcoming')}
                  className={currentTab === 'upcoming' 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg' 
                    : 'hover:bg-green-50 text-gray-700'
                  }
                >
                  Upcoming & Live ({(() => {
                    const now = new Date();
                    const upcomingCount = sessions.filter(s => !s.isCancelled && now <= parseISO(s.endsAt)).length;
                    const liveCount = sessions.filter(s => {
                      const startTime = parseISO(s.startsAt);
                      const endTime = parseISO(s.endsAt);
                      return !s.isCancelled && now >= startTime && now <= endTime;
                    }).length;
                    return liveCount > 0 ? `${upcomingCount} • ${liveCount} LIVE` : upcomingCount;
                  })()})
                </Button>
                <Button
                  variant={currentTab === 'past' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentTab('past')}
                  className={currentTab === 'past' 
                    ? 'bg-gradient-to-r from-gray-500 to-slate-600 text-white hover:from-gray-600 hover:to-slate-700 shadow-lg' 
                    : 'hover:bg-gray-50 text-gray-700'
                  }
                >
                  Past Classes ({sessions.filter(s => new Date() > parseISO(s.endsAt) || s.isCancelled).length})
                </Button>
              </div>
            </div>
          )}


          

          {/* Filters */}
          <div className="mb-6">
            <FilterPanel 
              sessions={sessions}
              currentFilters={filters}
              onFilterChange={setFilters}
            />
          </div>
        </div>

        {/* Dynamic View Rendering */}
        <div className="mb-8">
          {currentView === 'table' && (
            <SessionsTable 
              sessions={filteredSessions} 
              onSessionClick={handleSessionClick}
            />
          )}
          {currentView === 'calendar' && (
            <CalendarView 
              sessions={filteredSessions} 
              onSessionClick={handleSessionClick}
            />
          )}
          {currentView === 'monthly' && (
            <MonthlyView 
              sessions={filteredSessions} 
              onSessionClick={handleSessionClick}
            />
          )}
          {currentView === 'kanban' && (
            <KanbanView 
              sessions={filteredSessions} 
              onSessionClick={handleSessionClick}
              onSessionMove={() => {
                // Here you could implement API calls to update session status
              }}
            />
          )}
          {currentView === 'reports' && (
            <ReportsPanel />
          )}
        </div>

        <SessionDetailDialog
          session={selectedSession}
          bookings={sessionBookings}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          loading={loadingSessionDetail}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onCancelBooking={handleCancelBooking}
          onMemberAdded={async () => {
            await loadSessions();
            if (selectedSession) {
              const sessionDetail = await momenceAPI.getSessionDetail(selectedSession.id);
              setSelectedSession(sessionDetail);
              const bookingsResponse = await momenceAPI.getSessionBookings(selectedSession.id);
              setSessionBookings(bookingsResponse.payload);
            }
          }}
        />
      </main>
    </div>
  );
}

export default App;