interface Config {
    NODE_ENV: string;
    PORT: number;
    API_PREFIX: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    FRONTEND_URL: string;
    REDIS_URL: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    SENDGRID_API_KEY: string;
    FROM_EMAIL: string;
    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX_REQUESTS: number;
    LOG_LEVEL: string;
    ADMIN_EMAIL: string;
}
export declare const config: Config;
export declare const logConfig: () => void;
export default config;
//# sourceMappingURL=index.d.ts.map