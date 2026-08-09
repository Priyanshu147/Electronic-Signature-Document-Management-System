import { Router } from "express";

import DocumentController from "../controllers/document.controller.js";

import catchAsync from "../middlewares/catchAsync.js";
import authenticate from "../middlewares/authenticate.js";
import { userOnly } from "../middlewares/general.js";
import validateSchema from "../middlewares/validateSchema.js";

import documentValidationSchemas from "../schemas/document.schema.js";

import { DOCUMENT_ROUTES, } from "../utils/constants.js";

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

router.get(
    DOCUMENT_ROUTES.GET_BY_ID,
    authenticate,
    userOnly,
    catchAsync(DocumentController.getDocumentById)
);

router.get(
    DOCUMENT_ROUTES.GET_ALL,
    authenticate,
    userOnly,
    catchAsync(DocumentController.getDocuments)
);

router.put(
    DOCUMENT_ROUTES.UPDATE,
    authenticate,
    userOnly,
    validateSchema(documentValidationSchemas.updateDocumentSchema),
    catchAsync(DocumentController.updateDocument)
);

router.get(
    DOCUMENT_ROUTES.DOWNLOAD,
    authenticate,
    userOnly,
    catchAsync(DocumentController.downloadDocument)
);

router.put(
    DOCUMENT_ROUTES.SAVE_SIGNATURE_FIELDS,
    authenticate,
    userOnly,
    catchAsync(DocumentController.saveSignatureFields)
);

router.get(
    DOCUMENT_ROUTES.GET_SIGNATURE_FIELDS,
    authenticate,
    userOnly,
    catchAsync(DocumentController.getSignatureFields)
);

export default router;  