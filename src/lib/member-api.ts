import { momenceAPI } from './api';

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  pictureUrl?: string;
  firstSeen: string;
  lastSeen: string;
  visits: {
    appointments: number;
    appointmentsVisits: number;
    bookings: number;
    bookingsVisits: number;
    openAreaVisits: number;
    total: number;
    totalVisits: number;
  };
  customerFields: any[];
  customerTags: {
    id: number;
    name: string;
    isCustomerBadge: boolean;
    badgeLabel: string;
    badgeColor: string;
  }[];
}

export interface MemberSearchResponse {
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  };
  payload: Member[];
}

export interface AddMemberToClassResponse {
  isSuccessful: boolean;
  payload?: any;
  errorMessage?: string;
}

// No need for a separate base URL, use momenceAPI directly

const redactData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(redactData);
  }
  
  if (data && typeof data === 'object' && data !== null) {
    const redacted = { ...data };
    
    if (redacted.email && typeof redacted.email === 'string') {
      const [localPart, domain] = redacted.email.split('@');
      if (localPart && domain) {
        const redactedLocal = localPart.substring(0, 2) + '****';
        redacted.email = `${redactedLocal}@${domain}`;
      } else {
        redacted.email = '****@****';
      }
    }
    
    if (redacted.phoneNumber && typeof redacted.phoneNumber === 'string') {
      redacted.phoneNumber = '**********' + redacted.phoneNumber.slice(-2);
    }
    
    Object.keys(redacted).forEach(key => {
      if (typeof redacted[key] === 'object') {
        redacted[key] = redactData(redacted[key]);
      }
    });
    
    return redacted;
  }
  
  return data;
};

export const memberAPI = {
  async searchMembers(searchTerm: string): Promise<MemberSearchResponse> {
    try {
      console.log('Searching for members with term:', searchTerm);
      
      // Use the correct API format - query parameter expects name/email search term
      const url = `https://api.momence.com/api/v2/host/members?page=0&pageSize=100&sortOrder=DESC&sortBy=firstSeenAt&query=${encodeURIComponent(searchTerm)}`;
      console.log('Member search URL:', url);
      
      const response = await momenceAPI.request(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Member search response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Member search error response:', errorText);
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Member search success, found members:', data.payload?.length || 0);
      
      return {
        ...data,
        payload: redactData(data.payload || [])
      };
    } catch (error) {
      console.error('Member search failed:', error);
      // Return empty result instead of crashing
      return {
        pagination: {
          page: 0,
          pageSize: 100,
          totalCount: 0,
          sortBy: 'firstSeenAt',
          sortOrder: 'DESC'
        },
        payload: []
      };
    }
  },

  async getMemberById(memberId: number): Promise<Member> {
    try {
      console.log('Getting member details for ID:', memberId);
      
      const response = await momenceAPI.request(
        `https://api.momence.com/api/v2/host/members/${memberId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get member: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return redactData(data);
    } catch (error) {
      console.error('Failed to get member by ID:', error);
      throw error;
    }
  },

  async addMemberToClass(memberId: number, sessionId: number): Promise<AddMemberToClassResponse> {
    const response = await momenceAPI.request(
      `https://api.momence.com/api/v2/host/sessions/${sessionId}/bookings/free`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          memberId: memberId,
          createRecurringBooking: false
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add member to class: ${response.statusText}`);
    }

    const data = await response.json();
    return redactData(data);
  },
  
  async addMemberToClassWithCredit(memberId: number, sessionId: number): Promise<AddMemberToClassResponse> {
    const result = await momenceAPI.addMemberToClassWithCredit(memberId, sessionId);
    return result;
  },

  async createNewMember(memberDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
  }): Promise<{ memberId: number }> {
    const response = await momenceAPI.request('https://api.momence.com/api/v2/host/members', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        ...memberDetails,
        homeLocationId: 36372, // As specified in the request
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create new member: ${errorText}`);
    }

    return response.json();
  },
};
