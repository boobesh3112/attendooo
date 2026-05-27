// Face Authentication using Web Authentication API (WebAuthn)
// Supports biometric authentication including Face ID, Touch ID, Windows Hello, etc.

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

class FaceAuthManager {
  private isAvailable: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability() {
    if (typeof window === 'undefined') {
      this.isAvailable = false;
      return;
    }

    // Check if WebAuthn is supported
    this.isAvailable = !!(
      window.PublicKeyCredential &&
      navigator.credentials &&
      navigator.credentials.create
    );
  }

  async isSupported(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      if (!window.PublicKeyCredential) return false;

      // Check if platform authenticator is available
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      this.isAvailable = available;
      return available;
    } catch {
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Register biometric authentication for a user
   */
  async register(userId: string, userName: string): Promise<BiometricAuthResult> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        return {
          success: false,
          error: 'Biometric authentication is not supported on this device'
        };
      }

      // Generate a challenge (in production, this should come from your server)
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'ClassRep Attendance Manager',
          id: window.location.hostname
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userName,
          displayName: userName
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },  // ES256
          { alg: -257, type: 'public-key' } // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          requireResidentKey: false
        },
        timeout: 60000,
        attestation: 'none'
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        return {
          success: false,
          error: 'Failed to create credential'
        };
      }

      // Store credential ID for later authentication
      localStorage.setItem('biometric_credential_id', credential.id);
      localStorage.setItem('biometric_user_id', userId);
      localStorage.setItem('biometric_enabled', 'true');

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Biometric registration failed'
      };
    }
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(): Promise<BiometricAuthResult> {
    try {
      const supported = await this.isSupported();
      if (!supported) {
        return {
          success: false,
          error: 'Biometric authentication is not supported on this device'
        };
      }

      const credentialId = localStorage.getItem('biometric_credential_id');
      const userId = localStorage.getItem('biometric_user_id');

      if (!credentialId || !userId) {
        return {
          success: false,
          error: 'No biometric credentials found. Please set up face authentication first.'
        };
      }

      // Generate a challenge
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!assertion) {
        return {
          success: false,
          error: 'Authentication failed'
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      // User cancelled or authentication failed
      if (error.name === 'NotAllowedError') {
        return {
          success: false,
          error: 'Authentication was cancelled'
        };
      }

      return {
        success: false,
        error: error.message || 'Biometric authentication failed'
      };
    }
  }

  /**
   * Check if biometric authentication is enabled for current user
   */
  isEnabled(): boolean {
    return localStorage.getItem('biometric_enabled') === 'true';
  }

  /**
   * Disable biometric authentication
   */
  disable() {
    localStorage.removeItem('biometric_credential_id');
    localStorage.removeItem('biometric_user_id');
    localStorage.removeItem('biometric_enabled');
  }

  /**
   * Simplified authentication method that handles fallback
   */
  async quickAuth(): Promise<BiometricAuthResult> {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: 'Biometric authentication is not set up'
      };
    }

    return this.authenticate();
  }
}

export const faceAuth = new FaceAuthManager();
