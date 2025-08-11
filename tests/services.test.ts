import { testPrisma } from './setup';
import { SimpleAuthService } from '../src/services/simple-auth';
import { UsersService } from '../src/services/users';
import { SimpleMessagingService } from '../src/services/simple-messaging';
import { NotificationsService } from '../src/services/notifications';

describe('Services Tests', () => {
  
  describe('SimpleAuthService', () => {
    const testUser = {
      name: 'Service Test User',
      email: 'service@example.com',
      password: 'ServiceTest123!',
      profileType: 'STARTUP' as const,
      company: 'Test Company'
    };
    
    it('should hash password during registration', async () => {
      const result = await SimpleAuthService.register(testUser);
      
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.user).not.toHaveProperty('password');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });
    
    it('should validate password during login', async () => {
      // Register user first
      await SimpleAuthService.register(testUser);
      
      // Login with correct password
      const loginResult = await SimpleAuthService.login({
        email: testUser.email,
        password: testUser.password
      });
      
      expect(loginResult.user.email).toBe(testUser.email);
      expect(loginResult.accessToken).toBeDefined();
    });
    
    it('should throw error for invalid login', async () => {
      await expect(
        SimpleAuthService.login({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Identifiants invalides');
    });
  });
  
  describe('UsersService', () => {
    let testUserId: string;
    
    beforeEach(async () => {
      // Create a test user
      const result = await SimpleAuthService.register({
        name: 'Users Service Test',
        email: 'users@example.com',
        password: 'UsersTest123!',
        profileType: 'EXPERT'
      });
      testUserId = result.user.id;
    });
    
    it('should get user by ID', async () => {
      const user = await UsersService.getUserById(testUserId);
      
      expect(user.id).toBe(testUserId);
      expect(user.email).toBe('users@example.com');
      expect(user.profileType).toBe('EXPERT');
      expect(user).not.toHaveProperty('password');
    });
    
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        company: 'Updated Company',
        location: 'Updated Location'
      };
      
      const updatedUser = await UsersService.updateUser(testUserId, updateData);
      
      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.company).toBe(updateData.company);
      expect(updatedUser.location).toBe(updateData.location);
    });
    
    it('should get users with pagination', async () => {
      // Create additional users
      for (let i = 1; i <= 5; i++) {
        await SimpleAuthService.register({
          name: `Test User ${i}`,
          email: `test${i}@example.com`,
          password: 'Test123!',
          profileType: 'STARTUP'
        });
      }
      
      const result = await UsersService.getUsers({
        page: 1,
        limit: 3,
        profileType: 'STARTUP'
      });
      
      expect(result.data.length).toBeLessThanOrEqual(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(3);
      expect(result.pagination.total).toBeGreaterThan(0);
    });
  });
  
  describe('SimpleMessagingService', () => {
    let senderId: string;
    let recipientId: string;
    
    beforeEach(async () => {
      // Create sender
      const sender = await SimpleAuthService.register({
        name: 'Message Sender',
        email: 'sender@example.com',
        password: 'Sender123!',
        profileType: 'STARTUP'
      });
      senderId = sender.user.id;
      
      // Create recipient
      const recipient = await SimpleAuthService.register({
        name: 'Message Recipient',
        email: 'recipient@example.com',
        password: 'Recipient123!',
        profileType: 'EXPERT'
      });
      recipientId = recipient.user.id;
    });
    
    it('should send a message', async () => {
      const messageData = {
        recipientId,
        content: 'Hello, this is a test message!',
        type: 'TEXT' as const
      };
      
      const message = await SimpleMessagingService.sendMessage(senderId, messageData);
      
      expect(message.senderId).toBe(senderId);
      expect(message.recipientId).toBe(recipientId);
      expect(message.content).toBe(messageData.content);
      expect(message.type).toBe(messageData.type);
    });
    
    it('should get messages for user', async () => {
      // Send a few messages
      await SimpleMessagingService.sendMessage(senderId, {
        recipientId,
        content: 'Message 1',
        type: 'TEXT'
      });
      
      await SimpleMessagingService.sendMessage(recipientId, {
        recipientId: senderId,
        content: 'Reply message',
        type: 'TEXT'
      });
      
      const messages = await SimpleMessagingService.getMessagesForUser(senderId, {
        page: 1,
        limit: 10
      });
      
      expect(messages.data.length).toBeGreaterThan(0);
      expect(messages.pagination.total).toBeGreaterThan(0);
    });
  });
  
  describe('NotificationsService', () => {
    let testUserId: string;
    
    beforeEach(async () => {
      const user = await SimpleAuthService.register({
        name: 'Notification Test User',
        email: 'notifications@example.com',
        password: 'Notifications123!',
        profileType: 'MENTOR'
      });
      testUserId = user.user.id;
    });
    
    it('should create a notification', async () => {
      const notificationData = {
        userId: testUserId,
        type: 'MESSAGE' as const,
        title: 'Test Notification',
        message: 'This is a test notification'
      };
      
      const notification = await NotificationsService.createNotification(notificationData);
      
      expect(notification.userId).toBe(testUserId);
      expect(notification.type).toBe(notificationData.type);
      expect(notification.title).toBe(notificationData.title);
      expect(notification.message).toBe(notificationData.message);
      expect(notification.read).toBe(false);
    });
    
    it('should get user notifications', async () => {
      // Create a few notifications
      await NotificationsService.createNotification({
        userId: testUserId,
        type: 'MESSAGE',
        title: 'Notification 1',
        message: 'Message 1'
      });
      
      await NotificationsService.createNotification({
        userId: testUserId,
        type: 'SYSTEM',
        title: 'Notification 2',
        message: 'Message 2'
      });
      
      const result = await NotificationsService.getUserNotifications(testUserId, {
        page: 1,
        limit: 10
      });
      
      expect(result.data.length).toBe(2);
      expect(result.pagination.total).toBe(2);
      expect(result.data[0].userId).toBe(testUserId);
    });
    
    it('should mark notification as read', async () => {
      const notification = await NotificationsService.createNotification({
        userId: testUserId,
        type: 'MESSAGE',
        title: 'Test Read',
        message: 'Test read functionality'
      });
      
      expect(notification.read).toBe(false);
      
      const updatedNotification = await NotificationsService.markAsRead(notification.id);
      
      expect(updatedNotification.read).toBe(true);
      expect(updatedNotification.readAt).toBeDefined();
    });
  });
});