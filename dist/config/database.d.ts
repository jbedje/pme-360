import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    log: ({
        level: "info";
        emit: "event";
    } | {
        level: "warn";
        emit: "event";
    } | {
        level: "error";
        emit: "event";
    })[];
    errorFormat: "colorless";
}, "error" | "warn" | "info", import("@prisma/client/runtime/library").DefaultArgs>;
export declare const connectDatabase: () => Promise<void>;
export declare const disconnectDatabase: () => Promise<void>;
export declare const cleanupDatabase: () => Promise<void>;
export { prisma };
export default prisma;
//# sourceMappingURL=database.d.ts.map