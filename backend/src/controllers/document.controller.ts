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
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

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
        const { documentName, status } = req.body;

        const result = await DocumentService.updateDocument(
            id,
            documentName,
            status
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

        const sortBy = req.query.sortBy ? String(req.query.sortBy) : undefined;
        const sortOrder = req.query.sortOrder ? (String(req.query.sortOrder).toLowerCase() === "asc" ? "asc" : "desc") : undefined;

        const data =
            await DocumentService.getDocuments({
                page,
                limit,
                searchText,
                status,
                sortBy,
                sortOrder,
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
            return;
        }

        // Fetch saved signature fields for this document
        const fields = await DocumentService.getSignatureFields(id);

        let pdfBuffer = fs.readFileSync(filePath);

        if (fields && fields.length > 0) {
            try {
                const pdfDoc = await PDFDocument.load(pdfBuffer);
                const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                const pages = pdfDoc.getPages();

                for (const field of fields) {
                    const pageIdx = field.page_number - 1;
                    if (pageIdx >= 0 && pageIdx < pages.length) {
                        const page = pages[pageIdx];
                        const { width: pageW, height: pageH } = page.getSize();

                        const boxW = Math.max((field.width / 100) * pageW, 100);
                        const boxH = Math.max((field.height / 100) * pageH, 35);
                        const pdfX = Math.max(0, (field.x_position / 100) * pageW);
                        const pdfY = Math.max(0, pageH - ((field.y_position / 100) * pageH) - boxH);

                        // Draw signature field background box
                        page.drawRectangle({
                            x: pdfX,
                            y: pdfY,
                            width: boxW,
                            height: boxH,
                            borderColor: rgb(0, 0, 0), // #000000ff (indigo)
                            borderWidth: 2,
                            color: rgb(0.93, 0.93, 0.99), // light indigo tint
                            opacity: 0.9,
                        });

                        // Draw Signer Role title
                        const text = `${field.role_name}`;
                        const fontSize = Math.max(8, Math.min(12, boxH * 0.28));

                        page.drawText(text, {
                            x: pdfX + 8,
                            y: pdfY + boxH - fontSize - 6,
                            size: fontSize,
                            font,
                            color: rgb(0, 0, 0),
                        });

                        // Draw "Sign Here" label
                        page.drawText("Sign Here", {
                            x: pdfX + 8,
                            y: pdfY + 6,
                            size: Math.max(7, fontSize - 2),
                            font,
                            color: rgb(0, 0, 0),
                        });
                    }
                }

                const modifiedBytes = await pdfDoc.save();
                pdfBuffer = Buffer.from(modifiedBytes);
            } catch (err) {
                console.error("Failed to render signature boxes on downloaded PDF:", err);
            }
        }

        const fileName = document.document_name.endsWith(".pdf")
            ? document.document_name
            : `${document.document_name}.pdf`;

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.send(pdfBuffer);
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