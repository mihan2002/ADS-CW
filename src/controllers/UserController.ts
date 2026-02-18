import type { Request, Response } from 'express';
import { User } from '../models/User.js';

export class UserController {
  // Get all users
  static getAll(req: Request, res: Response): void {
    try {
      const users = User.getAll();
      res.status(200).json({
        success: true,
        data: users,
        message: 'Users retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving users',
      });
    }
  }

  // Get user by ID
  static getById(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const user = User.getById(parseInt(id));

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
        message: 'User retrieved successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving user',
      });
    }
  }

  // Create new user
  static create(req: Request, res: Response): void {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        res.status(400).json({
          success: false,
          message: 'Name and email are required',
        });
        return;
      }

      const user = User.create(name, email);

      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
      });
    }
  }

  // Update user
  static update(req: Request, res: Response): void {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      if (!name || !email) {
        res.status(400).json({
          success: false,
          message: 'Name and email are required',
        });
        return;
      }

      const user = User.update(parseInt(id), name, email);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
        message: 'User updated successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
      });
    }
  }

  // Delete user
  static delete(req: Request, res: Response): void {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'User ID is required',
        });
        return;
      }

      const deleted = User.delete(parseInt(id));

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'User not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
      });
    }
  }
}

