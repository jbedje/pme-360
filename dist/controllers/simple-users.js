"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleUsersController = void 0;
const users_1 = require("../services/users");
const logger_1 = require("../config/logger");
class SimpleUsersController {
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
                res.status(400).json({
                    success: false,
                    error: 'ID utilisateur requis',
                });
                return;
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
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié',
                });
                return;
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
                res.status(400).json({
                    success: false,
                    error: 'Aucune donnée valide à mettre à jour',
                });
                return;
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
    static async addExpertise(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: 'Utilisateur non authentifié',
                });
                return;
            }
            const { name, level } = req.body;
            if (!name || !level) {
                res.status(400).json({
                    success: false,
                    error: 'Nom et niveau de l\'expertise requis',
                });
                return;
            }
            if (level < 1 || level > 5) {
                res.status(400).json({
                    success: false,
                    error: 'Le niveau doit être entre 1 et 5',
                });
                return;
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
}
exports.SimpleUsersController = SimpleUsersController;
