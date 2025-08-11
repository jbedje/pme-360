"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketNotificationService = void 0;
const ws_1 = require("ws");
const simple_jwt_1 = require("../utils/simple-jwt");
class WebSocketNotificationService {
    constructor(server) {
        this.clients = new Map();
        console.log('🔌 Initializing WebSocket server for notifications...');
        this.wss = new ws_1.WebSocketServer({
            server,
            path: '/ws/notifications',
        });
        this.wss.on('connection', this.handleConnection.bind(this));
        console.log('✅ WebSocket server initialized on /ws/notifications');
    }
    handleConnection(ws, request) {
        console.log('👋 New WebSocket connection attempt');
        const url = new URL(request.url || '', 'http://localhost');
        const token = url.searchParams.get('token') || request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            console.log('❌ WebSocket connection rejected: No token provided');
            ws.close(4001, 'Authentication required');
            return;
        }
        const payload = simple_jwt_1.SimpleJWTService.verifyAccessToken(token);
        if (!payload) {
            console.log('❌ WebSocket connection rejected: Invalid token');
            ws.close(4001, 'Invalid token');
            return;
        }
        ws.userId = payload.userId;
        ws.email = payload.email;
        this.clients.set(payload.userId, ws);
        console.log(`✅ WebSocket authenticated for user: ${payload.email} (${payload.userId})`);
        console.log(`👥 Connected clients: ${this.clients.size}`);
        this.sendToClient(payload.userId, {
            type: 'connected',
            message: 'Connecté aux notifications temps réel',
            timestamp: new Date().toISOString(),
        });
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleClientMessage(ws, message);
            }
            catch (error) {
                console.error('❌ Invalid WebSocket message:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Message invalide',
                }));
            }
        });
        ws.on('close', () => {
            if (ws.userId) {
                this.clients.delete(ws.userId);
                console.log(`👋 WebSocket disconnected: ${ws.email} (${ws.userId})`);
                console.log(`👥 Connected clients: ${this.clients.size}`);
            }
        });
        ws.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
            if (ws.userId) {
                this.clients.delete(ws.userId);
            }
        });
    }
    handleClientMessage(ws, message) {
        console.log(`📨 WebSocket message from ${ws.userId}:`, message);
        switch (message.type) {
            case 'ping':
                ws.send(JSON.stringify({
                    type: 'pong',
                    timestamp: new Date().toISOString(),
                }));
                break;
            case 'subscribe':
                console.log(`📡 User ${ws.userId} subscribed to: ${message.topics?.join(', ') || 'all'}`);
                ws.send(JSON.stringify({
                    type: 'subscribed',
                    topics: message.topics || ['all'],
                }));
                break;
            default:
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Type de message non reconnu',
                }));
        }
    }
    sendNotificationToUser(userId, notification) {
        const client = this.clients.get(userId);
        if (client && client.readyState === ws_1.WebSocket.OPEN) {
            const message = {
                type: 'notification',
                data: notification,
                timestamp: new Date().toISOString(),
            };
            client.send(JSON.stringify(message));
            console.log(`🔔 Notification sent to user ${userId}: ${notification.title}`);
            return true;
        }
        console.log(`📭 User ${userId} not connected to WebSocket`);
        return false;
    }
    sendToClient(userId, message) {
        const client = this.clients.get(userId);
        if (client && client.readyState === ws_1.WebSocket.OPEN) {
            client.send(JSON.stringify(message));
            return true;
        }
        return false;
    }
    broadcast(message) {
        let sentCount = 0;
        this.clients.forEach((client, userId) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(message));
                sentCount++;
            }
            else {
                this.clients.delete(userId);
            }
        });
        console.log(`📢 Broadcast message sent to ${sentCount} clients`);
        return sentCount;
    }
    getStats() {
        return {
            connectedClients: this.clients.size,
            clientIds: Array.from(this.clients.keys()),
        };
    }
    close() {
        console.log('🔌 Closing WebSocket server...');
        this.wss.close(() => {
            console.log('✅ WebSocket server closed');
        });
    }
}
exports.WebSocketNotificationService = WebSocketNotificationService;
