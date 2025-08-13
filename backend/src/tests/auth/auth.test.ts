import request from 'supertest';
import app from '../../app';
import { prisma } from '../setup';
import { hashPassword } from '../../utils';

describe('Auth Routes', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify user was created in database
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(user).toBeTruthy();
      expect(user?.name).toBe(userData.name);
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123',
        name: 'Test User',
      };

      // Create user first
      await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: await hashPassword(userData.password),
          name: userData.name,
        },
      });

      const response = await request(app)
        .post('/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // Too short
        name: '', // Empty name
      };

      const response = await request(app)
        .post('/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /auth/login', () => {
    let testUser: any;

    beforeEach(async () => {
      // Create test user
      testUser = await prisma.user.create({
        data: {
          email: 'login@example.com',
          passwordHash: await hashPassword('password123'),
          name: 'Login Test User',
          status: 'ACTIVE',
        },
      });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(loginData.email);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
    });

    it('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return error for inactive user', async () => {
      // Update user status to banned
      await prisma.user.update({
        where: { id: testUser.id },
        data: { status: 'BANNED' },
      });

      const loginData = {
        email: 'login@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not active');
    });
  });
});
