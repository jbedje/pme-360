"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../config/logger");
class PasswordService {
    static async hash(password) {
        try {
            if (!password || password.length < 6) {
                throw new Error('Le mot de passe doit contenir au moins 6 caractères');
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, this.SALT_ROUNDS);
            logger_1.logger.debug('✅ Password hashed successfully');
            return hashedPassword;
        }
        catch (error) {
            logger_1.logger.error('❌ Error hashing password:', error);
            throw error;
        }
    }
    static async verify(password, hashedPassword) {
        try {
            if (!password || !hashedPassword) {
                return false;
            }
            const isValid = await bcryptjs_1.default.compare(password, hashedPassword);
            logger_1.logger.debug(`✅ Password verification: ${isValid ? 'success' : 'failed'}`);
            return isValid;
        }
        catch (error) {
            logger_1.logger.error('❌ Error verifying password:', error);
            return false;
        }
    }
    static validatePasswordStrength(password) {
        const errors = [];
        let score = 0;
        if (!password) {
            errors.push('Le mot de passe est requis');
            return { isValid: false, errors, score: 0 };
        }
        if (password.length < 6) {
            errors.push('Le mot de passe doit contenir au moins 6 caractères');
        }
        else if (password.length >= 6) {
            score += 1;
        }
        if (/[a-z]/.test(password)) {
            score += 1;
        }
        else {
            errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
        }
        if (/[A-Z]/.test(password)) {
            score += 1;
        }
        else {
            errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
        }
        if (/\d/.test(password)) {
            score += 1;
        }
        else {
            errors.push('Le mot de passe doit contenir au moins un chiffre');
        }
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
            score += 1;
        }
        if (password.length >= 12) {
            score += 1;
        }
        const commonSequences = ['123', 'abc', 'qwe', 'password', 'admin'];
        const lowerPassword = password.toLowerCase();
        if (commonSequences.some(seq => lowerPassword.includes(seq))) {
            errors.push('Le mot de passe ne doit pas contenir de séquences communes');
            score = Math.max(0, score - 1);
        }
        const isValid = errors.length === 0 && score >= 3;
        return { isValid, errors, score: Math.min(5, score) };
    }
    static generateTempPassword(length = 12) {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*';
        const allChars = lowercase + uppercase + numbers + symbols;
        let password = '';
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];
        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }
    static checkSecurityPolicy(password) {
        const violations = [];
        if (password.length < 8) {
            violations.push('Le mot de passe doit contenir au moins 8 caractères');
        }
        const { isValid, errors } = this.validatePasswordStrength(password);
        if (!isValid) {
            violations.push(...errors);
        }
        if (/\s/.test(password)) {
            violations.push('Le mot de passe ne doit pas contenir d\'espaces');
        }
        return {
            isCompliant: violations.length === 0,
            violations,
        };
    }
}
exports.PasswordService = PasswordService;
PasswordService.SALT_ROUNDS = 12;
