import { Response } from "express";

import DocumentService from "../services/document.service.js";

import { AuthRequest } from "../middlewares/authenticate.js";

import {
    clearCookies,
    getFilterParams,
    setAccessTokenCookie,
    setRefreshTokenCookie,
} from "../utils/helper.js";

import path from "path";
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
    /**
     * ===========================================================
     * delete Document
     * ===========================================================
     */
    async deleteDocument(
        req: AuthRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        const result =
            await DocumentService.deleteDocument(id);

        res.status(200).json(result);
    },

    /**
     * ===========================================================
     * Get Document by ID
     *  ===========================================================
     */
    async getDocumentById(
        req: AuthRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        const result = await DocumentService.getDocumentById(id);

        res.status(200).json({
            success: true,
            data: result,
        });
    },

    /**
    * ===========================================================
    * update Document
    * ===========================================================
    **/
    async updateDocument(
        req: AuthRequest,
        res: Response
    ) {
        const id = Number(req.params.id);
        const { documentName } = req.body;

        const result = await DocumentService.updateDocument(
            id,
            documentName
        );

        res.status(200).json({
            success: true,
            data: result,
        });
    },

    /**
     * ===========================================================
     * Get All Documents
     * ===========================================================
     */
    async getDocuments(
        req: AuthRequest,
        res: Response
    ) {
        const page =
            Number(req.query.page) || 1;

        const limit =
            Number(req.query.limit) || 10;

        const searchText =
            String(req.query.searchText || "");

        const status =
            String(req.query.status || "");

        const data =
            await DocumentService.getDocuments({
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
     * Download Document
     * ===========================================================
     */
    async downloadDocument(
        req: AuthRequest,
        res: Response
    ) {
        const id = Number(req.params.id);

        const document =
            await DocumentService.downloadDocument(id);

        const filePath = path.resolve(
            document.file_path
        );

        if (!fs.existsSync(filePath)) {
            res.status(404).json({
                success: false,
                message: "File not found.",
            });
        }

        res.download(
            filePath,
            document.document_name
        );
    },
    /**
     * ===========================================================
     * Save Signature Fields
     * ===========================================================
     */
    async saveSignatureFields(
        req: AuthRequest,
        res: Response
    ) {
        const documentId = Number(req.params.id);

        const result =
            await DocumentService.saveSignatureFields(
                documentId,
                req.body.fields
            );

        res.status(200).json(result);
    },
    /**
     * ==========================================================
     *  Get Signature Fields
     * =========================================================
     * */
    async getSignatureFields(
        req: AuthRequest,
        res: Response
    ) {
        const documentId = Number(req.params.id);

        const data =
            await DocumentService.getSignatureFields(
                documentId
            );

        res.status(200).json({
            success: true,
            data
        });
    },
};

export default DocumentController;