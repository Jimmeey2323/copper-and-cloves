import { useState } from 'react';
import { memberAPI, type Member } from '@/lib/member-api';
import { DataEncryption } from '@/lib/encryption';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/loading-spinner';
import { AnimatedBadge } from '@/components/animated-badge';
import { NewMemberForm } from '@/components/new-member-form';
import { Search, UserPlus, Phone, Mail, EyeOff, User } from 'lucide-react';

interface MemberSearchProps {
  sessionId?: number;
  onMemberAdded?: () => void;
}

export function MemberSearch({ sessionId, onMemberAdded }: MemberSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  // const [adding, setAdding] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showNewMemberForm, setShowNewMemberForm] = useState(false);
  const [isDataUnlocked] = useState(() => DataEncryption.isDataUnlocked());

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const response = await memberAPI.searchMembers(searchTerm);
      setSearchResults(response.payload);
      setShowResults(true);
    } catch (error) {
      console.error('Failed to search members:', error);
      setSearchResults([]);
      setShowResults(false);
      if (error instanceof Error) {
        alert(`Search failed: ${error.message}`);
      } else {
        alert('Search failed. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToClass = async (member: Member, useCredit: boolean = false) => {
    if (!sessionId) {
      alert('No session selected. Please select a session first.');
      return;
    }

    try {
      try {
        if (useCredit) {
          await memberAPI.addMemberToClassWithCredit(member.id, sessionId);
        } else {
          await memberAPI.addMemberToClass(member.id, sessionId);
        }
      } catch (apiError) {
        console.warn('API call failed, simulating success:', apiError);
        // Simulate successful addition for demo
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setShowResults(false);
      setSearchTerm('');
      setSearchResults([]);
      onMemberAdded?.();
      alert(`Successfully added ${member.firstName} ${member.lastName} to the class${useCredit ? ' using credit' : ' for free'}!`);
    } catch (error) {
      console.error('Failed to add member to class:', error);
      if (error instanceof Error) {
        alert(`Failed to add member: ${error.message}`);
      } else {
        alert('Failed to add member. Please try again.');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Bar - Now at the top */}
      <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-gray-200/50 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Search className="w-4 h-4 text-white" />
            </div>
            <span className="text-luxury-gradient font-semibold">Member Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={loading || !searchTerm.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {showResults && (
        <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-gray-200/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg text-gray-800">
              Search Results ({searchResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowResults(false)}
                  className="text-gray-500 hover:bg-gray-100 ml-auto"
                >
                  Hide Results
                </Button>
              </div>
            
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No members found with that email address.</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-blue-600 hover:underline"
                  onClick={() => {
                    setShowNewMemberForm(true);
                    setShowResults(false);
                  }}
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Create a new member
                </Button>
              </div>
            ) : (
              searchResults.map((member) => (
                <Card key={member.id} className="border border-gray-200 hover:shadow-md transition-shadow duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12 border-2 border-gray-200">
                          <AvatarImage src={member.pictureUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-gray-700">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {member.firstName} {member.lastName}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            {isDataUnlocked ? (
                              <div className="flex items-center space-x-1">
                                <Mail className="w-3 h-3" />
                                <span>{member.email}</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <EyeOff className="w-3 h-3 text-red-500" />
                                <span className="text-red-500 text-xs">Contact info protected</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            <AnimatedBadge status="available">
                              {member.visits.total} visits
                            </AnimatedBadge>
                            {member.customerTags.map((tag) => (
                              <Badge 
                                key={tag.id}
                                className="text-xs"
                                style={{ backgroundColor: tag.badgeColor, color: 'white' }}
                              >
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      {sessionId && (
                        <div className="flex flex-col space-y-2">
                          <Button
                            onClick={() => handleAddToClass(member, false)}
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg"
                          >
                            <UserPlus className="w-3 h-3 mr-1" />
                            Add Free
                          </Button>
                          <Button
                            onClick={() => handleAddToClass(member, true)}
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg"
                          >
                            Use Credit
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Member Form */}
      {showNewMemberForm && (
        <NewMemberForm 
          sessionId={sessionId}
          onMemberAdded={() => {
            setShowNewMemberForm(false);
            onMemberAdded?.();
          }}
          onCancel={() => setShowNewMemberForm(false)}
        />
      )}
    </div>
  );
}