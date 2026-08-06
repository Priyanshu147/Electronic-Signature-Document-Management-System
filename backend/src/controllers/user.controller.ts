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
     * Admin Profile
     * ===========================================================
     */
    async profile(req: AuthRequest, res: Response) {
        const data = await UserService.profile(req.user!.id);

        res.status(200).json({
            success: true,
            data,
        });
    },
}

export default UserController;