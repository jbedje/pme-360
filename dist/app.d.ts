import { Application } from 'express';
declare class App {
    app: Application;
    constructor();
    private initializeMiddlewares;
    private initializeRoutes;
    private initializeErrorHandling;
    private gracefulShutdown;
    initialize(): Promise<void>;
    getExpressApp(): Application;
}
export default App;
//# sourceMappingURL=app.d.ts.map