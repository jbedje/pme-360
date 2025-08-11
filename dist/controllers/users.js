"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const users_1 = require("../services/users");
const logger_1 = require("../config/logger");
class UsersController {
    static async getAllUsers(req, res) {
        try {
            const { page = '1', limit = '10', sortBy = 'createdAt', sortOrder = 'desc', profileType, location, verified, search, } = req.query;
            const filters = {
                profileType: profileType,
                location: location,
                verified: verified === 'true' ? true : verified === 'false' ? false : undefined,
                search: search,
            };
            const pagination = {
                page: parseInt(page),
                limit: Math.min(parseInt(limit), 50),
                sortBy: sortBy,
                sortOrder: sortOrder,
            };
            const result = await users_1.UsersService.getAllUsers(filters, pagination);
            res.json({
                success: true,
                data: result.users,
                meta: result.meta,
            });
        }
        catch (error) {
            logger_1.logger.error('❌ Get all users error:', error);
            res.status(500).json({
                success: false,
                error: error.message || 'Erreur lors de la récupération des utilisateurs',
            });
        }
    }
    static async getUserById(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID utilisateur requis',
                });
            }
            const user = await users_1.UsersService.getUserById(userId);
            res.json({
                success: true,
                data: user,
            });
        }
        catch (error) {
            if (error.message === 'Utilisateur non trouvé') {
                res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                logger_1.logger.error('❌ Get user by ID error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erreur lors de la récupération de l\'utilisateur',
                });
            }
        }
    }
    static async updateCurrentUser(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié',
                });
            }
            const updateData = req.body;
            const allowedFields = ['name', 'company', 'location', 'description', 'website', 'linkedin', 'phone'];
            const filteredData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }
            if (Object.keys(filteredData).length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Aucune donnée valide à mettre à jour',
                });
            }
            const updatedUser = await users_1.UsersService.updateUser(req.user.id, filteredData);
            res.json({
                success: true,
                message: 'Profil mis à jour avec succès',
                data: updatedUser,
            });
        }
        catch (error) {
            if (error.message === 'Utilisateur non trouvé') {
                res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                logger_1.logger.error('❌ Update current user error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erreur lors de la mise à jour du profil',
                });
            }
        }
    }
    static async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updateData = req.body;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID utilisateur requis',
                });
            }
            if (!req.user || req.user.id !== userId) {
                return res.status(403).json({
                    success: false,
                    error: 'Vous ne pouvez modifier que votre propre profil',
                });
            }
            const allowedFields = ['name', 'company', 'location', 'description', 'website', 'linkedin', 'phone'];
            const filteredData = {};
            for (const field of allowedFields) {
                if (updateData[field] !== undefined) {
                    filteredData[field] = updateData[field];
                }
            }
            const updatedUser = await users_1.UsersService.updateUser(userId, filteredData);
            res.json({
                success: true,
                message: 'Utilisateur mis à jour avec succès',
                data: updatedUser,
            });
        }
        catch (error) {
            if (error.message === 'Utilisateur non trouvé') {
                res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                logger_1.logger.error('❌ Update user error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erreur lors de la mise à jour de l\'utilisateur',
                });
            }
        }
    }
    static async deleteCurrentUser(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié',
                });
            }
            await users_1.UsersService.deleteUser(req.user.id);
            res.json({
                success: true,
                message: 'Compte supprimé avec succès',
            });
        }
        catch (error) {
            logger_1.logger.error('❌ Delete current user error:', error);
            res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression du compte',
            });
        }
    }
    static async addExpertise(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié',
                });
            }
            const { name, level } = req.body;
            if (!name || !level) {
                return res.status(400).json({
                    success: false,
                    error: 'Nom et niveau de l\'expertise requis',
                });
            }
            if (level < 1 || level > 5) {
                return res.status(400).json({
                    success: false,
                    error: 'Le niveau doit être entre 1 et 5',
                });
            }
            const expertise = await users_1.UsersService.addExpertise(req.user.id, { name, level });
            res.status(201).json({
                success: true,
                message: 'Expertise ajoutée avec succès',
                data: expertise,
            });
        }
        catch (error) {
            if (error.message.includes('existe déjà')) {
                res.status(409).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                logger_1.logger.error('❌ Add expertise error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erreur lors de l\'ajout de l\'expertise',
                });
            }
        }
    }
    static async removeExpertise(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié',
                });
            }
            const { expertiseId } = req.params;
            if (!expertiseId) {
                return res.status(400).json({
                    success: false,
                    error: 'ID de l\'expertise requis',
                });
            }
            await users_1.UsersService.removeExpertise(req.user.id, expertiseId);
            res.json({
                success: true,
                message: 'Expertise supprimée avec succès',
            });
        }
        catch (error) {
            if (error.message === 'Expertise non trouvée') {
                res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }
            else {
                logger_1.logger.error('❌ Remove expertise error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Erreur lors de la suppression de l\'expertise',
                });
            }
        }
    }
}
exports.UsersController = UsersController;
