import { Router } from "express";

import AdminController from "../controller/admin.controller.js";

import catchAsync from "../middlewares/catchAsync.js";
import authenticate from "../middlewares/authenticate.js";
import { adminOnly } from "../middlewares/general.js";
import validateSchema from "../middlewares/validateSchema.js";

import AdminValidationSchemas from "../schema/admin.schema.js";

import { ADMIN_ROUTES } from "../utils/constants.js";

const router = Router();

/* ===========================
   Public Routes
=========================== */

// Admin Login
router.post(
  ADMIN_ROUTES.LOGIN,
  validateSchema(AdminValidationSchemas.loginSchema),
  catchAsync(AdminController.login)
);

/* ===========================
   Protected Routes
=========================== */

// Dashboard
router.get(
  ADMIN_ROUTES.DASHBOARD,
  authenticate,
  adminOnly,
  catchAsync(AdminController.dashboard)
);

// Profile
router.get(
  ADMIN_ROUTES.PROFILE,
  authenticate,
  adminOnly,
  catchAsync(AdminController.profile)
);

// Create User
router.post(
  ADMIN_ROUTES.CREATE_USER,
  authenticate,
  adminOnly,
  validateSchema(AdminValidationSchemas.createUserSchema),
  catchAsync(AdminController.createUser)
);

// Get All Users
router.get(
  ADMIN_ROUTES.GET_USERS,
  authenticate,
  adminOnly,
  catchAsync(AdminController.getUsers)
);

// Get User By Id
router.get(
  ADMIN_ROUTES.GET_USER,
  authenticate,
  adminOnly,
  catchAsync(AdminController.getUserById)
);

// Update User
router.put(
  ADMIN_ROUTES.UPDATE_USER,
  authenticate,
  adminOnly,
  validateSchema(AdminValidationSchemas.updateUserSchema),
  catchAsync(AdminController.updateUser)
);

// Delete User
router.delete(
  ADMIN_ROUTES.DELETE_USER,
  authenticate,
  adminOnly,
  catchAsync(AdminController.deleteUser)
);

// Logout
router.post(
  ADMIN_ROUTES.LOGOUT,
  authenticate,
  adminOnly,
  catchAsync(AdminController.logout)
);

export default router;