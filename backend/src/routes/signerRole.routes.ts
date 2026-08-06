import { Router } from "express";

import SignerRoleController from "../controllers/signerRole.controller.js";

import catchAsync from "../middlewares/catchAsync.js";
import authenticate from "../middlewares/authenticate.js";
import { userOnly } from "../middlewares/general.js";
import validateSchema from "../middlewares/validateSchema.js";

import signerRoleValidationSchemas from "../schemas/signerRole.schema.js";

import { SIGNER_ROLE_ROUTES } from "../utils/constants.js";

const router = Router();

/* ===========================
   Protected Routes
=========================== */

// Create Signer Role
router.post(
    SIGNER_ROLE_ROUTES.CREATE,
    authenticate,
    userOnly,
    validateSchema(signerRoleValidationSchemas.createSignerRoleSchema),
    catchAsync(SignerRoleController.createSignerRole)
);

// Get all Signer Roles
router.get(
    SIGNER_ROLE_ROUTES.GET_ALL,
    authenticate,
    userOnly,
    catchAsync(SignerRoleController.getSignerRoles)
);

// Get Signer Role by ID
router.get(
    SIGNER_ROLE_ROUTES.GET_BY_ID,
    authenticate,
    userOnly,
    catchAsync(SignerRoleController.getSignerRoleById)
);

// Update Signer Role
router.put(
    SIGNER_ROLE_ROUTES.UPDATE,
    authenticate,
    userOnly,
    validateSchema(signerRoleValidationSchemas.updateSignerRoleSchema),
    catchAsync(SignerRoleController.updateSignerRole)
);

// Delete Signer Role
router.delete(
    SIGNER_ROLE_ROUTES.DELETE,
    authenticate,
    userOnly,
    catchAsync(SignerRoleController.deleteSignerRole)
);

export default router;