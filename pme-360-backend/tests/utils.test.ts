import { SimpleJWTService } from '../src/utils/simple-jwt';
import { PasswordService } from '../src/utils/password';

describe('Utilities Tests', () => {
  
  describe('SimpleJWTService', () => {
    const testPayload = {
      userId: 'test-user-id',
      email: 'test@example.com',
      profileType: 'STARTUP',
      verified: true
    };
    
    describe('Access Token', () => {
      it('should generate a valid access token', () => {
        const token = SimpleJWTService.generateAccessToken(testPayload);
        
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
      });
      
      it('should verify a valid access token', () => {
        const token = SimpleJWTService.generateAccessToken(testPayload);
        const decoded = SimpleJWTService.verifyAccessToken(token);
        
        expect(decoded).toBeDefined();
        expect(decoded?.userId).toBe(testPayload.userId);
        expect(decoded?.email).toBe(testPayload.email);
        expect(decoded?.profileType).toBe(testPayload.profileType);
      });
      
      it('should return null for invalid token', () => {
        const invalidToken = 'invalid.token.here';
        const decoded = SimpleJWTService.verifyAccessToken(invalidToken);
        
        expect(decoded).toBeNull();
      });
      
      it('should return null for empty token', () => {
        const decoded = SimpleJWTService.verifyAccessToken('');
        
        expect(decoded).toBeNull();
      });
    });
    
    describe('Refresh Token', () => {
      it('should generate a valid refresh token', () => {
        const token = SimpleJWTService.generateRefreshToken(testPayload);
        
        expect(token).toBeDefined();
        expect(typeof token).toBe('string');
        expect(token.length).toBeGreaterThan(0);
      });
      
      it('should verify a valid refresh token', () => {
        const token = SimpleJWTService.generateRefreshToken(testPayload);
        const decoded = SimpleJWTService.verifyRefreshToken(token);
        
        expect(decoded).toBeDefined();
        expect(decoded?.userId).toBe(testPayload.userId);
      });
    });
    
    describe('Token Extraction', () => {
      it('should extract token from Bearer header', () => {
        const token = 'sample.jwt.token';
        const authHeader = `Bearer ${token}`;
        
        const extracted = SimpleJWTService.extractTokenFromHeader(authHeader);
        
        expect(extracted).toBe(token);
      });
      
      it('should return null for invalid header format', () => {
        const invalidHeader = 'Invalid token format';
        
        const extracted = SimpleJWTService.extractTokenFromHeader(invalidHeader);
        
        expect(extracted).toBeNull();
      });
      
      it('should return null for empty header', () => {
        const extracted = SimpleJWTService.extractTokenFromHeader(undefined);
        
        expect(extracted).toBeNull();
      });
    });
  });
  
  describe('PasswordService', () => {
    const testPassword = 'TestPassword123!';
    
    describe('Password Hashing', () => {
      it('should hash a password', async () => {
        const hashedPassword = await PasswordService.hashPassword(testPassword);
        
        expect(hashedPassword).toBeDefined();
        expect(typeof hashedPassword).toBe('string');
        expect(hashedPassword).not.toBe(testPassword);
        expect(hashedPassword.length).toBeGreaterThan(testPassword.length);
      });
      
      it('should generate different hashes for same password', async () => {
        const hash1 = await PasswordService.hashPassword(testPassword);
        const hash2 = await PasswordService.hashPassword(testPassword);
        
        expect(hash1).not.toBe(hash2);
      });
    });
    
    describe('Password Verification', () => {
      it('should verify correct password', async () => {
        const hashedPassword = await PasswordService.hashPassword(testPassword);
        const isValid = await PasswordService.comparePassword(testPassword, hashedPassword);
        
        expect(isValid).toBe(true);
      });
      
      it('should reject incorrect password', async () => {
        const hashedPassword = await PasswordService.hashPassword(testPassword);
        const isValid = await PasswordService.comparePassword('WrongPassword123!', hashedPassword);
        
        expect(isValid).toBe(false);
      });
      
      it('should reject empty password', async () => {
        const hashedPassword = await PasswordService.hashPassword(testPassword);
        const isValid = await PasswordService.comparePassword('', hashedPassword);
        
        expect(isValid).toBe(false);
      });
    });
    
    describe('Password Validation', () => {
      it('should validate strong password', () => {
        const strongPasswords = [
          'StrongPass123!',
          'MySecure@2024',
          'Complex#Password9'
        ];
        
        strongPasswords.forEach(password => {
          const isValid = PasswordService.validatePasswordStrength(password);
          expect(isValid).toBe(true);
        });
      });
      
      it('should reject weak passwords', () => {
        const weakPasswords = [
          '123456',           // Too simple
          'password',         // No numbers/symbols
          'PASSWORD123',      // No lowercase
          'password123',      // No uppercase
          'Password',         // No numbers
          'Pass1!',          // Too short
          ''                 // Empty
        ];
        
        weakPasswords.forEach(password => {
          const isValid = PasswordService.validatePasswordStrength(password);
          expect(isValid).toBe(false);
        });
      });
    });
  });
});