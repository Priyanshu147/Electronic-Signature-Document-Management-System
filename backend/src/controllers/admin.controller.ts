import { Response } from "express";

import AdminService from "../services/admin.service.js";

import { AuthRequest } from "../middlewares/authenticate.js";

import {
  clearCookies,
  getFilterParams,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "../utils/helper.js";

const AdminController = {
  /**
   * ===========================================================
   * Admin Login
   * ===========================================================
   */
  async login(req: AuthRequest, res: Response) {
    const { email, password } = req.body;

    const { accessToken, refreshToken } =
      await AdminService.login(email, password);

    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      success: true,
      message: "Login successful.",
    });
  },

  /**
   * ===========================================================
   * Logout
   * ===========================================================
   */
  async logout(req: AuthRequest, res: Response) {
    clearCookies(res);

    res.status(200).json({
      success: true,
      message: "Logout successful.",
    });
  },

  /**
   * ===========================================================
   * Dashboard
   * ===========================================================
   */
  async dashboard(req: AuthRequest, res: Response) {
    const data = await AdminService.dashboard();

    res.status(200).json({
      success: true,
      data,
    });
  },

  /**
   * ===========================================================
   * Admin Profile
   * ===========================================================
   */
  async profile(req: AuthRequest, res: Response) {
    const data = await AdminService.profile(req.user!.id);

    res.status(200).json({
      success: true,
      data,
    });
  },

  /**
   * ===========================================================
   * Create User
   * ===========================================================
   */
  async createUser(req: AuthRequest, res: Response) {
    const data = await AdminService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data,
    });
  },

  /**
   * ===========================================================
   * Get Users
   * ===========================================================
   */
  async getUsers(req: AuthRequest, res: Response) {
    const {
      page,
      limit,
      searchText,
      status,
    } = getFilterParams(req.query);

    const data = await AdminService.getUsers({
      page,
      limit,
      searchText,
      status,
    });

    res.status(200).json({
      success: true,
      ...data,
    });
  },

  /**
   * ===========================================================
   * Get User By Id
   * ===========================================================
   */
  async getUserById(
    req: AuthRequest,
    res: Response
  ) {
    const id = Number(req.params.id);

    const data =
      await AdminService.getUserById(id);

    res.status(200).json({
      success: true,
      data,
    });
  },

  /**
   * ===========================================================
   * Update User
   * ===========================================================
   */
  async updateUser(
    req: AuthRequest,
    res: Response
  ) {
    const id = Number(req.params.id);

    const data =
      await AdminService.updateUser(
        id,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data,
    });
  },

  /**
   * ===========================================================
   * Delete User
   * ===========================================================
   */
  async deleteUser(
    req: AuthRequest,
    res: Response
  ) {
    const id = Number(req.params.id);

    await AdminService.deleteUser(id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  },

  /**
   * ===========================================================
   * Reset Admin Password
   * ===========================================================
   */
  async resetPassword(
    req: AuthRequest,
    res: Response
  ) {
    const { oldPassword, newPassword } = req.body;
    await AdminService.resetPassword(req.user!.id, oldPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Admin password reset successfully.",
    });
  },
};

export default AdminController;