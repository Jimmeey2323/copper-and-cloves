// Simple encryption utilities for sensitive data
export class DataEncryption {
  private static readonly DECRYPT_KEY = '2303';
  private static isUnlocked = false;
  
  static unlock(key: string): boolean {
    if (key === this.DECRYPT_KEY) {
      this.isUnlocked = true;
      return true;
    }
    return false;
  }
  
  static lock(): void {
    this.isUnlocked = false;
  }
  
  static isDataUnlocked(): boolean {
    return this.isUnlocked;
  }
  
  static encrypt(data: string): string {
    // Simple base64 encoding with obfuscation (for demo purposes)
    // In production, use proper encryption like AES
    const encoded = btoa(data);
    return encoded.split('').reverse().join('');
  }
  
  static decrypt(encryptedData: string): string {
    if (!this.isUnlocked) {
      return '***';
    }
    try {
      const reversed = encryptedData.split('').reverse().join('');
      return atob(reversed);
    } catch {
      return '***';
    }
  }
  
  static getSecureData(data: string): string {
    return this.isUnlocked ? data : this.maskEmail(data);
  }
  
  static maskEmail(email: string): string {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!domain) return '***@***.***';
    
    const maskedUsername = username.length > 3 
      ? username.substring(0, 2) + '•'.repeat(username.length - 2)
      : '•'.repeat(username.length);
    
    return `${maskedUsername}@${domain}`;
  }
  
  static maskPhone(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 4) return '•'.repeat(cleaned.length);
    
    return cleaned.substring(0, 3) + '•'.repeat(cleaned.length - 6) + cleaned.slice(-3);
  }
}