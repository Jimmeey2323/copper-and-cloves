import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { type Session } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedBadge } from '@/components/animated-badge';

interface SessionsTableProps {
  sessions: Session[];
  onSessionClick: (sessionId: number) => void;
}

export function SessionsTable({ sessions, onSessionClick }: SessionsTableProps) {
  const [sortBy, setSortBy] = useState<'startsAt' | 'name' | 'bookingCount'>('startsAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filter, setFilter] = useState<'all' | 'fitness' | 'private'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { paginatedSessions, totalPages, totalItems } = useMemo(() => {
    let filtered = sessions;
    
    if (filter !== 'all') {
      filtered = sessions.filter(session => session.type === filter);
    }

    const sorted = filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'startsAt':
          aValue = new Date(a.startsAt).getTime();
          bValue = new Date(b.startsAt).getTime();
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'bookingCount':
          aValue = a.bookingCount;
          bValue = b.bookingCount;
          break;
        default:
          aValue = a.startsAt;
          bValue = b.startsAt;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedSessions = sorted.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sorted.length / itemsPerPage);

    return {
      paginatedSessions,
      totalPages,
      totalItems: sorted.length
    };
  }, [sessions, sortBy, sortOrder, filter, currentPage, itemsPerPage]);

  const handleSort = (column: 'startsAt' | 'name' | 'bookingCount') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };



  const getStatusText = (session: Session) => {
    const now = new Date();
    const startTime = parseISO(session.startsAt);
    const endTime = parseISO(session.endsAt);
    
    if (session.isCancelled) return 'Cancelled';
    if (session.isDraft) return 'Draft';
    
    // Check if session is currently in progress
    if (now >= startTime && now <= endTime) {
      return 'Live Now';
    }
    
    if (session.bookingCount >= session.capacity) return 'Full';
    if (session.bookingCount === 0) return 'Available';
    return `${session.capacity - session.bookingCount} spots left`;
  };

  return (
    <div className="space-y-6">
      {/* Filters and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            All Classes ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('fitness')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'fitness'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Fitness ({sessions.filter(s => s.type === 'fitness').length})
          </button>
          <button
            onClick={() => setFilter('private')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'private'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Private ({sessions.filter(s => s.type === 'private').length})
          </button>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:border-blue-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} classes
          </div>
        </div>
      </div>

      {/* Enhanced Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-6 p-6 bg-gradient-to-r from-gray-100 via-blue-50 to-purple-50 rounded-xl border border-gray-200/50 shadow-sm font-bold text-sm">
        <button 
          onClick={() => handleSort('startsAt')}
          className="col-span-3 text-left hover:text-blue-600 transition-colors flex items-center space-x-1"
        >
          <span>📅 Schedule</span>
          {sortBy === 'startsAt' && (
            <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
        <button 
          onClick={() => handleSort('name')}
          className="col-span-4 text-left hover:text-blue-600 transition-colors flex items-center space-x-1"
        >
          <span>🎯 Class Details</span>
          {sortBy === 'name' && (
            <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
        <div className="col-span-2 text-left">👨‍🏫 Instructor</div>
        <button 
          onClick={() => handleSort('bookingCount')}
          className="col-span-2 text-center hover:text-blue-600 transition-colors flex items-center justify-center space-x-1"
        >
          <span>👥 Capacity</span>
          {sortBy === 'bookingCount' && (
            <span className="text-blue-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
        <div className="col-span-1 text-center">⚡ Status</div>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {paginatedSessions.map((session) => {
          const now = new Date();
          const startTime = parseISO(session.startsAt);
          const endTime = parseISO(session.endsAt);
          const isInProgress = !session.isCancelled && now >= startTime && now <= endTime;
          
          return (
          <Card 
            key={session.id} 
            className={`cursor-pointer transition-all duration-300 border ${
              isInProgress 
                ? 'bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-green-300 shadow-lg shadow-green-200/50 hover:shadow-xl hover:shadow-green-300/50 animate-pulse' 
                : 'hover:shadow-lg hover:border-blue-400/50 bg-gradient-to-r from-white via-blue-50/20 to-purple-50/20 border-gray-200/50'
            }`}
            onClick={() => onSessionClick(session.id)}
          >
            <CardContent className="p-4 md:p-6">
              {/* Mobile Layout */}
              <div className="md:hidden space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    {isInProgress && (
                      <div className="mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse shadow-lg">
                          🔴 LIVE NOW
                        </span>
                      </div>
                    )}
                    <h3 className="font-semibold text-lg">{session.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(parseISO(session.startsAt), 'MMM dd, yyyy • h:mm a')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <Badge 
                      variant={session.type === 'fitness' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {session.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.teacher.pictureUrl} />
                      <AvatarFallback>
                        {session.teacher.firstName[0]}{session.teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {session.teacher.firstName} {session.teacher.lastName}
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {session.bookingCount}/{session.capacity}
                    </div>
                    <AnimatedBadge status={(() => {
                      const now = new Date();
                      const startTime = parseISO(session.startsAt);
                      const endTime = parseISO(session.endsAt);
                      
                      if (session.isCancelled) return 'cancelled';
                      if (now >= startTime && now <= endTime) return 'in-progress';
                      if (session.bookingCount >= session.capacity) return 'full';
                      if (session.bookingCount === 0) return 'available';
                      return 'upcoming';
                    })()}>
                      {getStatusText(session)}
                    </AnimatedBadge>
                  </div>
                </div>
              </div>

              {/* Desktop Layout - Professional Row */}
              <div className="hidden md:grid grid-cols-12 gap-6 items-center min-h-[80px] py-4">
                <div className="col-span-3">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900">
                      {format(parseISO(session.startsAt), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-blue-600 font-medium">
                      {format(parseISO(session.startsAt), 'h:mm a')} - {format(parseISO(session.endsAt), 'h:mm a')}
                    </div>
                    <div className="text-xs text-gray-500">
                      {session.durationInMinutes} minutes
                    </div>
                  </div>
                </div>
                
                <div className="col-span-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{session.name}</h3>
                      {isInProgress && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-500 text-white animate-pulse shadow-lg">
                          🔴 LIVE NOW
                        </span>
                      )}
                    </div>
                    {session.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {session.description.length > 100 
                          ? `${session.description.substring(0, 100)}...` 
                          : session.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2">
                      <AnimatedBadge status={session.type === 'fitness' ? 'upcoming' : 'available'}>
                        {session.type}
                      </AnimatedBadge>
                      {session.tags?.map((tag) => (
                        <Badge key={tag.id} variant="outline" className="text-xs bg-gray-50">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12 border-2 border-gray-200 shadow-sm">
                      <AvatarImage src={session.teacher.pictureUrl} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700 font-semibold">
                        {session.teacher.firstName[0]}{session.teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {session.teacher.firstName} {session.teacher.lastName}
                      </div>
                      <div className="text-xs text-blue-600 font-medium">
                        Instructor
                      </div>
                      {session.inPersonLocation && (
                        <div className="text-xs text-gray-500 truncate">
                          {session.inPersonLocation.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-span-2">
                  <div className="text-center space-y-2">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-gray-900">
                        {session.bookingCount}<span className="text-lg text-gray-500">/{session.capacity}</span>
                      </div>
                      <div className="text-xs text-gray-600 font-medium">
                        {session.capacity - session.bookingCount} spots left
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(session.bookingCount / session.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="col-span-1 flex justify-center">
                  <div className="text-center space-y-1">
                    <AnimatedBadge status={(() => {
                      const now = new Date();
                      const startTime = parseISO(session.startsAt);
                      const endTime = parseISO(session.endsAt);
                      
                      if (session.isCancelled) return 'cancelled';
                      if (now >= startTime && now <= endTime) return 'in-progress';
                      if (session.bookingCount >= session.capacity) return 'full';
                      if (session.bookingCount === 0) return 'available';
                      return 'upcoming';
                    })()}>
                      {getStatusText(session)}
                    </AnimatedBadge>
                    {session.inPersonLocation && (
                      <div className="text-xs text-gray-500">
                        In-Person
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })}
      </div>

      {totalItems === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No classes found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your filters to see more classes.</p>
        </div>
      )}

      {/* Pagination Navigation */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-sm"
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 p-0 text-sm ${
                      currentPage === pageNum 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-sm"
            >
              Next
            </Button>
          </div>
          
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}
    </div>
  );
}