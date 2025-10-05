import { useState } from 'react';
import { memberAPI } from '@/lib/member-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoadingSpinner } from '@/components/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';

interface NewMemberFormProps {
  sessionId?: number;
  onMemberAdded?: () => void;
  onCancel: () => void;
}

export function NewMemberForm({ sessionId, onMemberAdded, onCancel }: NewMemberFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email) {
      setError('First Name, Last Name, and Email are required.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const newMember = await memberAPI.createNewMember({
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      if (sessionId) {
        await memberAPI.addMemberToClass(newMember.memberId, sessionId);
        alert(`Successfully created and added ${firstName} ${lastName} to the class!`);
        onMemberAdded?.();
      } else {
        alert(`Successfully created ${firstName} ${lastName}!`);
      }
      
      // Reset form
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhoneNumber('');

    } catch (err) {
      console.error('Failed to create or add member:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      alert(`Operation failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 border border-gray-200/50 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <UserPlus className="w-4 h-4 text-white" />
          </div>
          <span className="text-luxury-gradient font-semibold">Create New Member</span>
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            {loading ? <LoadingSpinner size="sm" /> : 'Create & Add Member'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
