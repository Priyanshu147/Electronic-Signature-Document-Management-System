import { Router } from "express";

import DocumentController from "../controllers/document.controller.js";

import catchAsync from "../middlewares/catchAsync.js";
import authenticate from "../middlewares/authenticate.js";
import { userOnly } from "../middlewares/general.js";
import validateSchema from "../middlewares/validateSchema.js";

import documentValidationSchemas from "../schemas/document.schema.js";

import { DOCUMENT_ROUTES,  } from "../utils/constants.js";

import upload from "../config/multerConfig.js";

const router = Router();

router.post(
    DOCUMENT_ROUTES.UPLOAD,
    authenticate,
    userOnly,
    upload.single("file"),
    catchAsync(DocumentController.uploadDocument)
);

router.delete(
    DOCUMENT_ROUTES.DELETE,
    authenticate,
    userOnly,
    catchAsync(DocumentController.deleteDocument)
);
export default router;  