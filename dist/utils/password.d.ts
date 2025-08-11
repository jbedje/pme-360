export declare class PasswordService {
    private static readonly SALT_ROUNDS;
    static hash(password: string): Promise<string>;
    static verify(password: string, hashedPassword: string): Promise<boolean>;
    static validatePasswordStrength(password: string): {
        isValid: boolean;
        errors: string[];
        score: number;
    };
    static generateTempPassword(length?: number): string;
    static checkSecurityPolicy(password: string): {
        isCompliant: boolean;
        violations: string[];
    };
}
//# sourceMappingURL=password.d.ts.map