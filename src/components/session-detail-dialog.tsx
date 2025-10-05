import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { type SessionDetail, type Booking } from '@/lib/api';
import { DataEncryption } from '@/lib/encryption';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/loading-spinner';
import { MemberSearch } from '@/components/member-search';
import { Users, Clock, MapPin, Calendar, Phone, Mail, UserCheck, Eye, EyeOff } from 'lucide-react';

interface SessionDetailDialogProps {
  session: SessionDetail | null;
  bookings: Booking[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  onCheckIn: (bookingId: number) => Promise<void>;
  onCheckOut: (bookingId: number) => Promise<void>;
  onCancelBooking: (bookingId: number, isLateCancellation?: boolean) => Promise<void>;
}

export function SessionDetailDialog({
  session,
  bookings,
  open,
  onOpenChange,
  loading,
  onCheckIn,
  onCheckOut,
  onCancelBooking
}: SessionDetailDialogProps) {
  const [cancelingBookingId, setCancelingBookingId] = useState<number | null>(null);
  const [decryptionKey, setDecryptionKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isDataUnlocked, setIsDataUnlocked] = useState(DataEncryption.isDataUnlocked());
  
  const handleUnlockData = () => {
    if (DataEncryption.unlock(decryptionKey)) {
      setIsDataUnlocked(true);
      setShowKeyInput(false);
      setDecryptionKey('');
    } else {
      alert('Invalid decryption key');
    }
  };
  
  const handleLockData = () => {
    DataEncryption.lock();
    setIsDataUnlocked(false);
  };
  if (!session && !loading) {
    return null;
  }

  const checkedInCount = bookings.filter(booking => booking.checkedIn).length;
  const activeBookings = bookings.filter(booking => !booking.cancelledAt);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : session ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">{session.name}</DialogTitle>
              <DialogDescription>
                {session.description ? (
                  <p className="mt-2 text-base text-gray-600">{session.description}</p>
                ) : (
                  <p className="mt-2 text-base text-gray-600">Class details and member management</p>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Session Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5" />
                    <span>Session Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {format(parseISO(session.startsAt), 'EEEE, MMMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(parseISO(session.startsAt), 'h:mm a')} - {format(parseISO(session.endsAt), 'h:mm a')}
                        <span className="ml-2">({session.durationInMinutes} minutes)</span>
                      </p>
                    </div>
                  </div>

                  {session.inPersonLocation && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{session.inPersonLocation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.isInPerson ? 'In-Person Class' : 'Online Class'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Capacity: {session.capacity} students</p>
                      <p className="text-sm text-muted-foreground">
                        {session.bookingCount} booked • {checkedInCount} checked in
                      </p>
                      {session.waitlistCapacity && session.waitlistCapacity > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Waitlist: {session.waitlistBookingCount || 0} / {session.waitlistCapacity}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-muted-foreground">Session ID: {session.id}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant={session.type === 'fitness' ? 'default' : 'secondary'}>
                      {session.type}
                    </Badge>
                    {session.isRecurring && (
                      <Badge variant="outline">Recurring</Badge>
                    )}
                    {session.isCancelled && (
                      <Badge variant="destructive">Cancelled</Badge>
                    )}
                    {session.isDraft && (
                      <Badge variant="outline">Draft</Badge>
                    )}
                    {session.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Instructor Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5" />
                    <span>Instructor</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-32 w-32 border-4 border-gradient-to-r from-blue-400 to-purple-500 shadow-2xl">
                      <AvatarImage src={session.teacher.pictureUrl} className="object-cover" />
                      <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {session.teacher.firstName[0]}{session.teacher.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {session.teacher.firstName} {session.teacher.lastName}
                      </h3>
                      {session.teacher.email && (
                        <div className="flex items-center space-x-2 mt-1">
                          <Mail className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{session.teacher.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {session.additionalTeachers && session.additionalTeachers.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="font-medium text-sm mb-2">Additional Instructors</h4>
                      <div className="space-y-2">
                        {session.additionalTeachers.map((teacher) => (
                          <div key={teacher.id} className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={teacher.pictureUrl} />
                              <AvatarFallback className="text-xs">
                                {teacher.firstName[0]}{teacher.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {teacher.firstName} {teacher.lastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Members List */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Registered Members ({activeBookings.length})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isDataUnlocked ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLockData}
                        className="text-xs text-red-600 hover:bg-red-50"
                      >
                        <EyeOff className="w-3 h-3 mr-1" />
                        Lock Data
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {showKeyInput ? (
                          <>
                            <input
                              type="password"
                              placeholder="Enter key..."
                              value={decryptionKey}
                              onChange={(e) => setDecryptionKey(e.target.value)}
                              className="w-24 px-2 py-1 text-xs border rounded"
                              onKeyPress={(e) => e.key === 'Enter' && handleUnlockData()}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleUnlockData}
                              className="text-xs text-blue-600 hover:bg-blue-50"
                            >
                              Unlock
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowKeyInput(false)}
                              className="text-xs"
                            >
                              ✕
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowKeyInput(true)}
                            className="text-xs text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Unlock Details
                          </Button>
                        )}
                      </div>
                    )}
                    {checkedInCount > 0 && (
                      <Badge variant="outline">
                        {checkedInCount} checked in
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activeBookings.length > 0 ? (
                  <div className="space-y-3">
                    {activeBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-4 rounded-lg border ${
                          booking.checkedIn ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={booking.member.pictureUrl} />
                              <AvatarFallback>
                                {booking.member.firstName[0]}{booking.member.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium">
                                  {booking.member.firstName} {booking.member.lastName}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  {!booking.checkedIn ? (
                                    <Button
                                      size="sm"
                                      onClick={() => onCheckIn(booking.id)}
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      Check In
                                    </Button>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => onCheckOut(booking.id)}
                                    >
                                      Check Out
                                    </Button>
                                  )}
                                  
                                  {/* Cancel Booking with Late Option */}
                                  {cancelingBookingId === booking.id ? (
                                    <div className="flex items-center space-x-1">
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          onCancelBooking(booking.id, false);
                                          setCancelingBookingId(null);
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                          onCancelBooking(booking.id, true);
                                          setCancelingBookingId(null);
                                        }}
                                      >
                                        Late Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setCancelingBookingId(null)}
                                      >
                                        ✕
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => setCancelingBookingId(booking.id)}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                                <div className="flex items-center space-x-1 text-muted-foreground">
                                  <Mail className="w-3 h-3" />
                                  <span>{DataEncryption.getSecureData(booking.member.email)}</span>
                                </div>
                                {booking.member.phoneNumber && (
                                  <div className="flex items-center space-x-1 text-muted-foreground">
                                    <Phone className="w-3 h-3" />
                                    <span>{isDataUnlocked ? booking.member.phoneNumber : DataEncryption.maskPhone(booking.member.phoneNumber)}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">Booking ID: </span>
                                  <span>{booking.id}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Tickets: </span>
                                  <span>{booking.ticketsBought || 1}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Created: </span>
                                  <span>{format(parseISO(booking.createdAt), 'MMM dd, yyyy')}</span>
                                </div>
                                {booking.isRecurring && (
                                  <div>
                                    <span className="text-muted-foreground">Recurring ID: </span>
                                    <span>{booking.recurringBookingId}</span>
                                  </div>
                                )}
                                {booking.cancelledAt && (
                                  <div>
                                    <span className="text-muted-foreground">Cancelled: </span>
                                    <span>{format(parseISO(booking.cancelledAt), 'MMM dd, yyyy')}</span>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 mt-3">
                                {booking.checkedIn ? (
                                  <Badge className="bg-green-100 text-green-800">
                                    Checked In
                                  </Badge>
                                ) : (
                                  <Badge variant="outline">
                                    Registered
                                  </Badge>
                                )}
                                {booking.isRecurring && (
                                  <Badge variant="secondary">Recurring</Badge>
                                )}
                                {booking.roomSpotId && (
                                  <Badge variant="outline">
                                    Spot {booking.roomSpotId}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-medium text-muted-foreground mb-1">No members registered</h3>
                    <p className="text-sm text-muted-foreground">
                      This class doesn't have any registered members yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Member Search Component */}
            <div className="mt-6">
              <MemberSearch 
                sessionId={session.id} 
                onMemberAdded={() => {
                  // Optionally refresh the session data here
                  console.log('Member added to session');
                }} 
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}