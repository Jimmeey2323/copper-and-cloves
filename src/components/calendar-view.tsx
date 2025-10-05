import { useState, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import { type Session } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { getClassColor, getTimeSlotColor } from '@/lib/colors';

interface CalendarViewProps {
  sessions: Session[];
  onSessionClick: (sessionId: number) => void;
}

export function CalendarView({ sessions, onSessionClick }: CalendarViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    
    sessions.forEach(session => {
      const sessionDate = format(parseISO(session.startsAt), 'yyyy-MM-dd');
      if (!grouped[sessionDate]) {
        grouped[sessionDate] = [];
      }
      grouped[sessionDate].push(session);
    });

    // Sort sessions by time for each date
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );
    });

    return grouped;
  }, [sessions]);

  const goToPreviousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
  const goToNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));
  const goToToday = () => setCurrentWeek(new Date());

  // Generate time slots (7 AM to 9 PM)
  const timeSlots = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  return (
    <div className="space-y-6">
      {/* Enhanced Calendar Header */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 via-white to-purple-50 rounded-2xl border border-gray-200/50 shadow-sm">
        <div>
          <h2 className="text-3xl font-bold text-luxury-gradient">
            {format(weekStart, 'MMMM dd, yyyy')}
          </h2>
          <p className="text-gray-600 mt-1 font-medium">
            {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={goToToday} className="bg-white/80 border-gray-300 hover:bg-blue-50 transition-all duration-200">
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToPreviousWeek} className="bg-white/80 border-gray-300 hover:bg-blue-50 transition-all duration-200">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextWeek} className="bg-white/80 border-gray-300 hover:bg-blue-50 transition-all duration-200">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Timeline Calendar */}
      <Card className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20">
        <CardContent className="p-0">
          {/* Header with Day Names */}
          <div className="grid grid-cols-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="p-4 text-center font-semibold text-gray-600 bg-gradient-to-r from-blue-100 to-purple-100 border-r border-gray-200">
              Time
            </div>
            {weekDays.map(day => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={format(day, 'yyyy-MM-dd')}
                  className={`p-4 text-center border-r border-gray-200 last:border-r-0 ${
                    isToday 
                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-bold' 
                      : 'text-gray-700 font-semibold'
                  }`}
                >
                  <div className="text-sm">{format(day, 'EEE')}</div>
                  <div className={`text-lg ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                    {format(day, 'd')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="relative">
            {timeSlots.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-100 min-h-[80px]">
                {/* Time Label */}
                <div className={`p-3 text-center border-r border-gray-200 flex items-center justify-center ${getTimeSlotColor(hour)}`}>
                  <div className="text-sm font-medium text-gray-700">
                    {format(new Date().setHours(hour, 0, 0, 0), 'h:mm a')}
                  </div>
                </div>

                {/* Day Columns */}
                {weekDays.map(day => {
                  const dateKey = format(day, 'yyyy-MM-dd');
                  const daySessions = sessionsByDate[dateKey] || [];
                  const isToday = isSameDay(day, new Date());
                  
                  // Filter sessions for this hour
                  const hourSessions = daySessions.filter(session => {
                    const sessionHour = parseISO(session.startsAt).getHours();
                    return sessionHour === hour;
                  });

                  return (
                    <div
                      key={`${dateKey}-${hour}`}
                      className={`p-2 border-r border-gray-100 last:border-r-0 relative ${
                        isToday ? 'bg-blue-50/30' : 'bg-white hover:bg-gray-50/50'
                      } transition-colors duration-200`}
                    >
                      {hourSessions.map(session => {
                        const sessionStart = parseISO(session.startsAt);
                        const minutes = sessionStart.getMinutes();
                        const duration = session.durationInMinutes;
                        const heightPercent = Math.min((duration / 60) * 100, 100);
                        const topOffset = (minutes / 60) * 100;
                        
                        return (
                          <div
                            key={session.id}
                            onClick={() => onSessionClick(session.id)}
                            className={`group absolute left-1 right-1 rounded-lg cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-110 hover:z-30 border-l-4 ${getClassColor(session.type, 'bg')} ${getClassColor(session.type, 'border')} backdrop-blur-sm overflow-hidden`}
                            style={{
                              top: `${topOffset}%`,
                              height: `${heightPercent}%`,
                              minHeight: '40px'
                            }}
                          >
                            {/* Collapsed state */}
                            <div className="group-hover:hidden p-1.5 h-full flex flex-col justify-center">
                              <div className="text-xs font-bold text-white truncate">
                                {session.name}
                              </div>
                              <div className="text-xs text-white/80 flex items-center justify-between mt-1">
                                <span>{format(parseISO(session.startsAt), 'HH:mm')}</span>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-2.5 h-2.5" />
                                  <span>{session.bookingCount}/{session.capacity}</span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Expanded state on hover */}
                            <div className="hidden group-hover:flex p-3 h-full flex-col justify-between bg-gradient-to-br from-black/20 to-black/40 backdrop-blur-md">
                              <div>
                                <div className="text-sm font-bold text-white mb-2 leading-tight">
                                  {session.name}
                                </div>
                                <div className="text-xs text-white/90 font-medium mb-2">
                                  {format(parseISO(session.startsAt), 'HH:mm')} - {format(parseISO(session.endsAt), 'HH:mm')}
                                </div>
                                <div className="text-xs text-white/80 mb-2">
                                  with {session.teacher.firstName} {session.teacher.lastName}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <Badge className={`text-xs ${getClassColor(session.type, 'badge')} border-0 animate-pulse`}>
                                  {session.type}
                                </Badge>
                                <div className="text-xs text-white/90 flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
                                  <Users className="w-3 h-3" />
                                  <span className="font-semibold">{session.bookingCount}/{session.capacity}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}