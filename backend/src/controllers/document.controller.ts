import { Response } from "express";

import DocumentService from "../services/document.service.js";

import { AuthRequest } from "../middlewares/authenticate.js";

import {
    clearCookies,
    getFilterParams,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "../utils/helper.js";

import fs from "fs";
import { PDFDocument } from "pdf-lib";

const DocumentController = {
    /**
     * ===========================================================
     * upload Document
     * ==========================================================
     * */
    async uploadDocument(
        req: AuthRequest,
        res: Response
    ) {
        const { documentName } = req.body;

        const file = req.file!;

        const userId = req.user!.id;

        // Read uploaded PDF
        const pdfBytes = fs.readFileSync(file.path);

        // Load PDF
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Get page count
        const pageCount = pdfDoc.getPageCount();

        const result =
            await DocumentService.uploadDocument(
                userId,
                documentName,
                file.originalname,
                file.filename,
                file.path,
                file.size,
                pageCount
            );

        res.status(201).json({
            success: true,
            message: "Document uploaded successfully.",
            data: result,
        });
    },
    async deleteDocument(
        req: AuthRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        const result =
            await DocumentService.deleteDocument(id);

        res.status(200).json(result);
    }
};

export default DocumentController;