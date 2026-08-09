import { Router } from "express";

import UserController from "../controllers/user.controller.js";

import catchAsync from "../middlewares/catchAsync.js";
import authenticate from "../middlewares/authenticate.js";
import { userOnly } from "../middlewares/general.js";
import validateSchema from "../middlewares/validateSchema.js";

import UserValidationSchemas from "../schemas/user.schema.js";

import { USER_ROUTES } from "../utils/constants.js";

const router = Router();

/* ===========================
   Public Routes
=========================== */

// User Login
router.post(
    USER_ROUTES.LOGIN,
    validateSchema(UserValidationSchemas.loginSchema),
    catchAsync(UserController.login)
);

/* ===========================
   Protected Routes
=========================== */

// Profile
router.get(
    USER_ROUTES.PROFILE,
    authenticate,
    userOnly,
    catchAsync(UserController.profile)
);

// Reset Password
router.post(
    "/reset-password",
    authenticate,
    userOnly,
    validateSchema(UserValidationSchemas.resetPasswordSchema),
    catchAsync(UserController.resetPassword)
);

// Logout
router.post(
    USER_ROUTES.LOGOUT,
    authenticate,
    userOnly,
    catchAsync(UserController.logout)
);

export default router;