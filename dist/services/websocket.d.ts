export declare class WebSocketNotificationService {
    private wss;
    private clients;
    constructor(server: any);
    private handleConnection;
    private handleClientMessage;
    sendNotificationToUser(userId: string, notification: any): boolean;
    sendToClient(userId: string, message: any): boolean;
    broadcast(message: any): number;
    getStats(): {
        connectedClients: number;
        clientIds: string[];
    };
    close(): void;
}
//# sourceMappingURL=websocket.d.ts.map