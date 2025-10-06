// Types for Momence API
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  pictureUrl?: string;
  email?: string;
}

export interface Location {
  id: number;
  name: string;
}

export interface Tag {
  id: number;
  name: string;
  isCustomerBadge: boolean;
  badgeLabel?: string;
  badgeColor?: string;
}

export interface Session {
  id: number;
  name: string;
  type: 'fitness' | 'private';
  description?: string;
  startsAt: string;
  endsAt: string;
  durationInMinutes: number;
  capacity: number;
  bookingCount: number;
  waitlistCapacity?: number;
  waitlistBookingCount?: number;
  teacher: Teacher;
  originalTeacher?: Teacher;
  additionalTeachers?: Teacher[];
  isRecurring: boolean;
  isCancelled: boolean;
  isInPerson: boolean;
  isDraft: boolean;
  inPersonLocation?: Location;
  zoomLink?: string;
  zoomMeetingId?: string;
  zoomMeetingPassword?: string;
  onlineStreamUrl?: string;
  onlineStreamPassword?: string;
  bannerImageUrl?: string;
  hostPhotoUrl?: string;
  tags: Tag[];
}

export interface SessionsResponse {
  payload: Session[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  };
}

export interface SessionDetail extends Session {
  waitlistCapacity?: number;
  waitlistBookingCount?: number;
  originalTeacher?: Teacher;
  additionalTeachers?: Teacher[];
  zoomLink?: string;
  zoomMeetingId?: string;
  zoomMeetingPassword?: string;
}

export interface Member {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  pictureUrl?: string;
}

export interface Booking {
  id: number;
  createdAt: string;
  roomSpotId?: number;
  checkedIn: boolean;
  ticketsBought?: number;
  isRecurring?: boolean;
  recurringBookingId?: number;
  cancelledAt?: string;
  member: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    pictureUrl?: string;
  };
}

export interface MemberSession {
  id: number;
  createdAt: string;
  roomSpotId?: number;
  checkedIn: boolean;
  cancelledAt?: string;
  session: {
    id: number;
    name: string;
    type: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    durationInMinutes: number;
    capacity: number;
    teacher: {
      id: number;
      firstName: string;
      lastName: string;
      pictureUrl?: string;
    };
    isRecurring: boolean;
    isInPerson: boolean;
    inPersonLocation?: {
      id: number;
      name: string;
    };
    onlineStreamUrl?: string;
    onlineStreamPassword?: string;
    bannerImageUrl?: string;
    hostPhotoUrl?: string;
  };
}

export interface BookingsResponse {
  payload: Booking[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
  };
}

class MomenceAPI {
  private baseURL = 'https://api.momence.com/api/v2';
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  // Authentication credentials
  private readonly credentials = {
    authorization: 'Basic YXBpLTMzOTA1LWxxVW02cEQ3RFVlM2pGSTg6QVV6OXhYOGxLZjV4WE1JcVZlQmdmZ2J0c1loUVN6ZWk=',
    username: 'jimmygonda@gmail.com',
    password: 'Jimmeey@123'
  };

  // Helper function for Momence cookie-based headers (used for credit operations)
  private getMomenceHeaders() {
    const cookieValue = import.meta.env.VITE_MOMENCE_ALL_COOKIES;
    
    // Debug logging
    console.log('🍪 Debug: Cookie environment variable status:');
    console.log('  - Variable name: VITE_MOMENCE_ALL_COOKIES');
    console.log('  - Value exists:', !!cookieValue);
    console.log('  - Value length:', cookieValue?.length || 0);
    console.log('  - First 50 chars:', cookieValue?.substring(0, 50) || 'No value');
    
    if (!cookieValue) {
      console.warn('⚠️ Warning: VITE_MOMENCE_ALL_COOKIES is not set in environment variables!');
    }
    
    const headers = {
      'Cookie': cookieValue,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; LeadsScript/1.0)',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    
    console.log('🔍 Debug: Constructed headers:', {
      ...headers,
      Cookie: headers.Cookie ? `${headers.Cookie.substring(0, 50)}...` : 'NOT SET'
    });
    
    return headers;
  }

  async authenticate(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': this.credentials.authorization,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          username: this.credentials.username,
          password: this.credentials.password,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`);
      }

      const data: AuthResponse = await response.json();
      
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.tokenExpiresAt = new Date(data.accessTokenExpiresAt);
      
      return data;
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async refreshAccessToken(): Promise<AuthResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'authorization': this.credentials.authorization,
          'content-type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const data: AuthResponse = await response.json();
      
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.tokenExpiresAt = new Date(data.accessTokenExpiresAt);
      
      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  private async ensureValidToken(): Promise<void> {
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    if (!this.accessToken || !this.tokenExpiresAt) {
      await this.authenticate();
      return;
    }

    if (now.getTime() >= this.tokenExpiresAt.getTime() - bufferTime) {
      try {
        await this.refreshAccessToken();
      } catch (error) {
        // If refresh fails, try full authentication
        await this.authenticate();
      }
    }
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    await this.ensureValidToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        'accept': 'application/json',
        'authorization': `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token might be invalid, try to refresh
      await this.authenticate();
      
      return fetch(url, {
        ...options,
        headers: {
          'accept': 'application/json',
          'authorization': `Bearer ${this.accessToken}`,
          ...options.headers,
        },
      });
    }

    // Check if response is valid before returning
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(`API error: ${response.status} - ${JSON.stringify(errorData)}`);
      } else {
        const text = await response.text();
        throw new Error(`API error: ${response.status} - ${text.substring(0, 200)}`);
      }
    }

    return response;
  }

  // Public method for making authenticated requests
  async request(url: string, options: RequestInit = {}): Promise<Response> {
    return this.makeAuthenticatedRequest(url, options);
  }

  async getSessions(params: {
    page?: number;
    pageSize?: number;
    locationId?: number;
    startAfter?: string;
    includeCancelled?: boolean;
    types?: string[];
  } = {}): Promise<SessionsResponse> {
    const queryParams = new URLSearchParams({
      page: (params.page || 0).toString(),
      pageSize: (params.pageSize || 200).toString(),
      sortOrder: 'ASC',
      sortBy: 'startsAt',
      includeCancelled: (params.includeCancelled || true).toString(),
      locationId: (params.locationId || 36372).toString(),
      startAfter: params.startAfter || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    // Add types
    const types = params.types || ['fitness', 'private'];
    types.forEach(type => queryParams.append('types', type));

    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/sessions?${queryParams}`
    );

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error(`Failed to parse sessions response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSessionDetail(sessionId: number): Promise<SessionDetail> {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/sessions/${sessionId}`
    );

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error(`Failed to parse session detail response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSessionBookings(sessionId: number, params: {
    page?: number;
    pageSize?: number;
  } = {}): Promise<BookingsResponse> {
    const queryParams = new URLSearchParams({
      page: (params.page || 0).toString(),
      pageSize: (params.pageSize || 50).toString(),
    });

    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/sessions/${sessionId}/bookings?${queryParams}`
    );

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error(`Failed to parse session bookings response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkInBooking(bookingId: number): Promise<void> {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/session-bookings/${bookingId}/check-in`,
      {
        method: 'POST',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check in booking: ${response.status}`);
    }
  }

  async checkOutBooking(bookingId: number): Promise<void> {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/session-bookings/${bookingId}/check-in`,
      {
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check out booking: ${response.status}`);
    }
  }

  async cancelBooking(bookingId: number, isLateCancellation: boolean = false): Promise<void> {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/session-bookings/${bookingId}`,
      {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          refund: !isLateCancellation,
          disableNotifications: true,
          isLateCancellation: isLateCancellation
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to cancel booking: ${response.status}`);
    }
  }

  async createMember(memberData: {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    homeLocationId?: number;
  }): Promise<Member> {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/members`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          ...memberData,
          homeLocationId: memberData.homeLocationId || 36372
        })
      }
    );

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error(`Failed to create member: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMemberSessions(
    memberId: number,
    options: {
      page?: number;
      pageSize?: number;
      sortOrder?: 'ASC' | 'DESC';
      sortBy?: string;
      includeCancelled?: boolean;
    } = {}
  ): Promise<{ pagination: any; payload: MemberSession[] }> {
    const params = new URLSearchParams({
      page: (options.page || 0).toString(),
      pageSize: (options.pageSize || 100).toString(),
      sortOrder: options.sortOrder || 'ASC',
      sortBy: options.sortBy || 'startsAt',
      includeCancelled: (options.includeCancelled || true).toString(),
    });

    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/members/${memberId}/sessions?${params}`,
      {
        headers: {
          'accept': 'application/json',
        },
      }
    );

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 200));
        throw new Error(`Expected JSON but got ${contentType || 'unknown content type'}`);
      }
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      throw new Error(`Failed to fetch member sessions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getMemberById(memberId: number): Promise<Member> {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseURL}/host/members/${memberId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch member: ${response.status}`);
    }

    return response.json();
  }

  async addMemberToClassWithCredit(memberId: number, sessionId: number): Promise<any> {
    console.log('🎯 Debug: addMemberToClassWithCredit called');
    console.log('  - Member ID:', memberId);
    console.log('  - Session ID:', sessionId);
    
    const url = 'https://api.momence.com/host/33905/pos/payments/pay-cart';
    console.log('  - Request URL:', url);
    
    const payload = {
      hostId: 33905,
      payingMemberId: memberId,
      targetMemberId: memberId,
      items: [{
        guid: "b96ccae3-cff4-48c4-9f76-9bcd5ac029bf",
        type: "session",
        quantity: 1,
        priceInCurrency: 900,
        sessionId: sessionId,
        isPaymentPlanUsed: false,
        appliedPriceRuleIds: [],
        isOverrideCapacity: false
      }],
      paymentMethods: [{
        type: "custom",
        transactionTagId: 5802,
        weightRelative: 1,
        guid: "32b376dd-ae69-4519-95df-335555740e91"
      }],
      isEmailSent: false,
      homeLocationId: 22116
    };
    
    console.log('  - Payload:', JSON.stringify(payload, null, 2));

    try {
      console.log('🚀 Making request to Momence API...');
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getMomenceHeaders(),
        body: JSON.stringify(payload)
      });

      console.log('📨 Response received:');
      console.log('  - Status:', response.status);
      console.log('  - Status Text:', response.statusText);
      console.log('  - Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response body:', errorText);
        throw new Error(`Failed to add member to class with credit: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Success response:', result);
      return result;
    } catch (error) {
      console.error('💥 Request failed:', error);
      throw error;
    }
  }
}

export const momenceAPI = new MomenceAPI();