import { useState, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { format, parseISO } from 'date-fns';
import { type Session } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AnimatedBadge, StatusIndicator } from '@/components/animated-badge';
import { Clock, Users, MapPin, Calendar, Settings2, Filter } from 'lucide-react';
import { getClassColor } from '@/lib/colors';

interface KanbanViewProps {
  sessions: Session[];
  onSessionClick: (sessionId: number) => void;
  onSessionMove?: (sessionId: number, newStatus: string) => void;
}

type GroupingOption = 'status' | 'instructor' | 'type' | 'location' | 'date';

export function KanbanView({ sessions, onSessionClick, onSessionMove }: KanbanViewProps) {
  const [groupBy, setGroupBy] = useState<GroupingOption>('status');
  const [showGroupingOptions, setShowGroupingOptions] = useState(false);

  const groupedSessions = useMemo(() => {
    const grouped: Record<string, Session[]> = {};
    const now = new Date();

    sessions.forEach(session => {
      let groupKey: string;

      switch (groupBy) {
        case 'status':
          const startTime = parseISO(session.startsAt);
          const endTime = parseISO(session.endsAt);
          if (session.isCancelled) {
            groupKey = 'cancelled';
          } else if (now < startTime) {
            groupKey = 'upcoming';
          } else if (now >= startTime && now <= endTime) {
            groupKey = 'in-progress';
          } else {
            groupKey = 'completed';
          }
          break;
        case 'instructor':
          groupKey = `${session.teacher.firstName} ${session.teacher.lastName}`;
          break;
        case 'type':
          groupKey = session.type;
          break;
        case 'location':
          groupKey = session.inPersonLocation?.name || 'Online';
          break;
        case 'date':
          groupKey = format(parseISO(session.startsAt), 'MMM dd, yyyy');
          break;
        default:
          groupKey = 'unknown';
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(session);
    });

    // Sort sessions within each group
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => 
        new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );
    });

    return grouped;
  }, [sessions, groupBy]);

  const getColumnConfig = (columnKey: string) => {
    if (groupBy === 'status') {
      const configs = {
        upcoming: { 
          title: 'Upcoming Classes', 
          color: 'from-blue-500 to-blue-600', 
          bg: 'from-blue-50 to-blue-100',
          icon: Calendar 
        },
        'in-progress': { 
          title: 'In Progress', 
          color: 'from-green-500 to-emerald-600', 
          bg: 'from-green-50 to-emerald-100',
          icon: Clock 
        },
        completed: { 
          title: 'Completed', 
          color: 'from-gray-500 to-gray-600', 
          bg: 'from-gray-50 to-gray-100',
          icon: Users 
        },
        cancelled: { 
          title: 'Cancelled', 
          color: 'from-red-500 to-red-600', 
          bg: 'from-red-50 to-red-100',
          icon: MapPin 
        }
      };
      return configs[columnKey as keyof typeof configs] || { 
        title: columnKey, 
        color: 'from-gray-400 to-gray-500', 
        bg: 'from-gray-50 to-gray-100',
        icon: Settings2 
      };
    }
    
    return { 
      title: columnKey, 
      color: 'from-purple-500 to-indigo-600', 
      bg: 'from-purple-50 to-indigo-100',
      icon: Filter 
    };
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    const sessionId = parseInt(draggableId);
    onSessionMove?.(sessionId, destination.droppableId);
  };

  const groupingOptions = [
    { value: 'status', label: 'Status', icon: Calendar },
    { value: 'instructor', label: 'Instructor', icon: Users },
    { value: 'type', label: 'Class Type', icon: Filter },
    { value: 'location', label: 'Location', icon: MapPin },
    { value: 'date', label: 'Date', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Grouping Controls */}
      <Card className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border border-gray-200/50 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
                <Settings2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-luxury-gradient font-semibold text-xl">Kanban Board</span>
            </CardTitle>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGroupingOptions(!showGroupingOptions)}
                className="bg-white/80 border-gray-300 hover:bg-blue-50 transition-all duration-200"
              >
                <Filter className="w-4 h-4 mr-2" />
                Group by: {groupingOptions.find(opt => opt.value === groupBy)?.label}
              </Button>
            </div>
          </div>
          
          {showGroupingOptions && (
            <div className="mt-4 p-4 bg-white/60 rounded-lg border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Group sessions by:</h4>
              <div className="flex flex-wrap gap-2">
                {groupingOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.value}
                      variant={groupBy === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setGroupBy(option.value as GroupingOption);
                        setShowGroupingOptions(false);
                      }}
                      className={`transition-all duration-200 ${
                        groupBy === option.value 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Drag and Drop Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Object.entries(groupedSessions).map(([columnKey, columnSessions]) => {
            const config = getColumnConfig(columnKey);
            const Icon = config.icon;
            
            return (
              <div key={columnKey} className="flex flex-col">
                {/* Column Header */}
                <div className={`mb-4 p-4 rounded-xl bg-gradient-to-r ${config.bg} border border-gray-200/50 shadow-sm`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${config.color} shadow-lg`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-800">{config.title}</h3>
                    </div>
                    <Badge className="bg-white/80 text-gray-700 border border-gray-300">
                      {columnSessions.length}
                    </Badge>
                  </div>
                </div>

                {/* Droppable Column */}
                <Droppable droppableId={columnKey}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 min-h-[200px] p-3 rounded-xl transition-colors duration-200 ${
                        snapshot.isDraggingOver 
                          ? 'bg-gradient-to-br from-blue-100/80 to-purple-100/80 border-2 border-dashed border-blue-400' 
                          : 'bg-gradient-to-br from-gray-50/50 to-white/50'
                      }`}
                    >
                      {columnSessions.map((session, index) => (
                        <Draggable
                          key={session.id}
                          draggableId={session.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onSessionClick(session.id)}
                              className={`transition-all duration-300 ${
                                snapshot.isDragging 
                                  ? 'rotate-3 scale-105 shadow-2xl z-50' 
                                  : 'hover:shadow-xl hover:scale-102'
                              }`}
                            >
                              <Card className={`cursor-pointer border border-gray-200/50 ${getClassColor(session.type, 'bg')} backdrop-blur-sm`}>
                                <CardContent className="p-4 space-y-3">
                                  {/* Session Header */}
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-semibold text-white text-sm leading-tight mb-1 truncate">
                                        {session.name}
                                      </h4>
                                      <p className="text-xs text-white/90 font-medium">
                                        {format(parseISO(session.startsAt), 'MMM dd • h:mm a')}
                                      </p>
                                    </div>
                                    <StatusIndicator 
                                      status={session.isCancelled ? 'cancelled' : 'upcoming'} 
                                      size="sm" 
                                    />
                                  </div>

                                  {/* Session Details */}
                                  <div className="space-y-2">
                                    {/* Instructor */}
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="h-6 w-6 border border-white/30">
                                        <AvatarImage src={session.teacher.pictureUrl} />
                                        <AvatarFallback className="text-xs bg-white/20 text-white">
                                          {session.teacher.firstName[0]}{session.teacher.lastName[0]}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-white/90 truncate">
                                        {session.teacher.firstName} {session.teacher.lastName}
                                      </span>
                                    </div>

                                    {/* Capacity and Type */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-1 text-white/80">
                                        <Users className="w-3 h-3" />
                                        <span className="text-xs font-medium">
                                          {session.bookingCount}/{session.capacity}
                                        </span>
                                      </div>
                                      <AnimatedBadge status={session.bookingCount >= session.capacity ? 'full' : 'available'}>
                                        {session.type}
                                      </AnimatedBadge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {columnSessions.length === 0 && (
                        <div className="flex items-center justify-center h-32 text-gray-400">
                          <div className="text-center">
                            <Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No sessions</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}