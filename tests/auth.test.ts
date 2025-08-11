import request from 'supertest';
import { Express } from 'express';
import { testPrisma } from './setup';

// Create a test app instance
function createTestApp(): Express {
  // We'll use a lightweight version for testing
  const express = require('express');
  const cors = require('cors');
  const { SimpleAuthService } = require('../src/services/simple-auth');
  const { SimpleJWTService } = require('../src/utils/simple-jwt');
  
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Health endpoint
  app.get('/health', (req: any, res: any) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });
  
  // Auth endpoints
  app.post('/api/v1/auth/register', async (req: any, res: any) => {
    try {
      const { name, email, password, profileType, company, location, phone } = req.body;
      
      if (!name || !email || !password || !profileType) {
        return res.status(400).json({
          success: false,
          error: 'Nom, email, mot de passe et type de profil sont requis'
        });
      }
      
      const result = await SimpleAuthService.register({
        name, email, password, profileType, company, location, phone
      });
      
      res.status(201).json({
        success: true,
        message: 'Inscription réussie',
        data: result
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  });
  
  app.post('/api/v1/auth/login', async (req: any, res: any) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email et mot de passe requis'
        });
      }
      
      const result = await SimpleAuthService.login({ email, password });
      
      res.json({
        success: true,
        message: 'Connexion réussie',
        data: result
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message
      });
    }
  });
  
  return app;
}

describe('Authentication API', () => {
  let app: Express;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
  
  describe('POST /api/v1/auth/register', () => {
    const validUserData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'TestPassword123!',
      profileType: 'STARTUP',
      company: 'Test Company',
      location: 'Paris, France',
      phone: '+33123456789'
    };
    
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Inscription réussie');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
    });
    
    it('should return error for missing required fields', async () => {
      const invalidData = { ...validUserData };
      delete invalidData.name;
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requis');
    });
    
    it('should return error for duplicate email', async () => {
      // First registration
      await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);
      
      // Second registration with same email
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUserData, name: 'Another User' })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('existe déjà');
    });
    
    it('should return error for invalid profile type', async () => {
      const invalidData = { ...validUserData, profileType: 'INVALID_TYPE' };
      
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('POST /api/v1/auth/login', () => {
    const userData = {
      name: 'Login Test User',
      email: 'login@example.com',
      password: 'LoginPassword123!',
      profileType: 'EXPERT'
    };
    
    beforeEach(async () => {
      // Register user before each login test
      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);
    });
    
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Connexion réussie');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(userData.email);
    });
    
    it('should return error for missing email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: userData.password })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requis');
    });
    
    it('should return error for missing password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: userData.email })
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requis');
    });
    
    it('should return error for wrong email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          password: userData.password
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('invalide');
    });
    
    it('should return error for wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'WrongPassword123!'
        })
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('invalide');
    });
  });
});