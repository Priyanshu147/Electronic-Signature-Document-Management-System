import { Response } from "express";

import UserService from "../services/user.service.js";

import { AuthRequest } from "../middlewares/authenticate.js";

import {
    clearCookies,
    getFilterParams,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "../utils/helper.js";

const UserController = {
    /**
     * ===========================================================
     * User Login
     * ===========================================================
     */
    async login(req: AuthRequest, res: Response) {
        const { email, password } = req.body;

        const { accessToken, refreshToken } =
            await UserService.login(email, password);

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
     * User Profile
     * ===========================================================
     */
    async profile(req: AuthRequest, res: Response) {
        const data = await UserService.profile(req.user!.id);

        res.status(200).json({
            success: true,
            data,
        });
    },

    /**
     * ===========================================================
     * Reset Password
     * ===========================================================
     */
    async resetPassword(req: AuthRequest, res: Response) {
        const { oldPassword, newPassword } = req.body;
        await UserService.resetPassword(req.user!.id, oldPassword, newPassword);

        res.status(200).json({
            success: true,
            message: "Password reset successfully.",
        });
    },
};

export default UserController;