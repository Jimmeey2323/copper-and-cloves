// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  CLIENT_SECRET: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "",
  REFRESH_TOKEN: import.meta.env.VITE_GOOGLE_REFRESH_TOKEN || "",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

// Google OAuth utility functions
export class GoogleOAuth {
  private static config = GOOGLE_CONFIG;

  static async getAccessToken(): Promise<string> {
    try {
      const response = await fetch(this.config.TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.CLIENT_ID,
          client_secret: this.config.CLIENT_SECRET,
          refresh_token: this.config.REFRESH_TOKEN,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status}`);
      }

      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  static async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();
    
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }
}
