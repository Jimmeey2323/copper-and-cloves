import { useState, useMemo } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth,
  parseISO, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { type Session } from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthlyViewProps {
  sessions: Session[];
  onSessionClick: (sessionId: number) => void;
}

export function MonthlyView({ sessions, onSessionClick }: MonthlyViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const sessionsByDate = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    
    sessions.forEach(session => {
      const sessionDate = format(parseISO(session.startsAt), 'yyyy-MM-dd');
      if (!grouped[sessionDate]) {
        grouped[sessionDate] = [];
      }
      grouped[sessionDate].push(session);
    });

    return grouped;
  }, [sessions]);

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader className="pb-2">
          <div className="grid grid-cols-7 gap-2">
            {weekdays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-2">
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(day => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const daySessions = sessionsByDate[dateKey] || [];
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);

              return (
                <div
                  key={dateKey}
                  className={`min-h-[120px] p-2 border rounded-lg ${
                    isToday 
                      ? 'bg-blue-50 border-blue-200' 
                      : isCurrentMonth 
                        ? 'bg-white border-gray-200 hover:bg-gray-50' 
                        : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday 
                      ? 'text-blue-600' 
                      : isCurrentMonth 
                        ? 'text-gray-900' 
                        : 'text-gray-400'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {daySessions.slice(0, 3).map(session => (
                      <div
                        key={session.id}
                        onClick={() => onSessionClick(session.id)}
                        className="text-xs p-1 bg-blue-100 hover:bg-blue-200 rounded cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-blue-900 truncate">
                          {format(parseISO(session.startsAt), 'HH:mm')}
                        </div>
                        <div className="text-blue-800 truncate">
                          {session.name}
                        </div>
                      </div>
                    ))}
                    {daySessions.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{daySessions.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}