import React, { useState } from 'react';
import { type Session } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, X, Search } from 'lucide-react';

interface FilterPanelProps {
  sessions: Session[];
  onFilterChange: (filters: SessionFilters) => void;
  currentFilters: SessionFilters;
}

export interface SessionFilters {
  dateRange?: {
    start: string;
    end: string;
  };
  classType?: string;
  instructor?: string;
  location?: string;
  status?: 'upcoming' | 'completed' | 'cancelled' | 'all';
  searchTerm?: string;
  capacity?: 'available' | 'full' | 'waitlist' | 'all';
}

export const FilterPanel = React.memo(function FilterPanel({ sessions, onFilterChange, currentFilters }: FilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract unique values for filter options
  const uniqueTypes = Array.from(new Set(sessions.map(s => s.type)));
  const uniqueInstructors = Array.from(new Set(sessions.map(s => `${s.teacher.firstName} ${s.teacher.lastName}`)));
  const uniqueLocations = Array.from(new Set(sessions.map(s => s.inPersonLocation?.name).filter(Boolean))) as string[];

  const updateFilter = (key: keyof SessionFilters, value: any) => {
    const newFilters = { ...currentFilters, [key]: value };
    if (value === '' || value === 'all') {
      delete newFilters[key];
    }
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(currentFilters).length > 0;

  return (
    <Card className="bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border border-gray-200/50 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Filter className="w-4 h-4 text-white" />
            </div>
            <span className="text-luxury-gradient font-semibold">Advanced Filters</span>
            {hasActiveFilters && (
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
                {Object.keys(currentFilters).length} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearFilters(); }} className="text-red-600 hover:bg-red-50">
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:bg-gray-50"
            >
              {isExpanded ? '▲ Collapse' : '▼ Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6 pt-0">
        {/* Quick Search */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Classes
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              id="search"
              type="text"
              placeholder="Search by name or description..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentFilters.searchTerm || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('searchTerm', e.target.value)}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentFilters.dateRange?.start || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('dateRange', {
                ...currentFilters.dateRange,
                start: e.target.value
              })}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentFilters.dateRange?.end || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateFilter('dateRange', {
                ...currentFilters.dateRange,
                end: e.target.value
              })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Class Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Type</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentFilters.classType || ''} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('classType', e.target.value)}
            >
              <option value="">All Types</option>
              {uniqueTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentFilters.status || ''} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentFilters.instructor || ''} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('instructor', e.target.value)}
            >
              <option value="">All Instructors</option>
              {uniqueInstructors.map(instructor => (
                <option key={instructor} value={instructor}>{instructor}</option>
              ))}
            </select>
          </div>

          {/* Capacity Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentFilters.capacity || ''} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('capacity', e.target.value)}
            >
              <option value="">All Capacities</option>
              <option value="available">Available Spots</option>
              <option value="full">Full Classes</option>
              <option value="waitlist">Waitlist Available</option>
            </select>
          </div>
        </div>

        {/* Location */}
        {uniqueLocations.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={currentFilters.location || ''} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateFilter('location', e.target.value)}
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
          </div>
        )}
        </CardContent>
      )}
    </Card>
  );
});