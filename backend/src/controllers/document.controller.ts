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

        const isRaw = req.query.raw === "true";

        let pdfBuffer = fs.readFileSync(filePath);

        // Only burn signature box overlay if raw=true is NOT requested (editor needs clean unburned raw PDF)
        if (!isRaw) {
            const fields = await DocumentService.getSignatureFields(id);

            if (fields && fields.length > 0) {
                try {
                    const pdfDoc = await PDFDocument.load(pdfBuffer);
                    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
                    const pages = pdfDoc.getPages();

                    for (const field of fields) {
                        const pageIdx = field.page_number - 1;

                        if (pageIdx < 0 || pageIdx >= pages.length) {
                            continue;
                        }

                        const page = pages[pageIdx];
                        const { width: pageW, height: pageH } = page.getSize();

                        const boxW = Math.max((field.width / 100) * pageW, 170);
                        const boxH = Math.max((field.height / 100) * pageH, 65);

                        const pdfX = Math.max(
                            0,
                            (field.x_position / 100) * pageW
                        );

                        const pdfY = Math.max(
                            0,
                            pageH -
                            ((field.y_position / 100) * pageH) -
                            boxH
                        );

                        const BLACK = rgb(0, 0, 0);
                        const DARK = rgb(0.25, 0.25, 0.25);
                        const LIGHT = rgb(0.55, 0.55, 0.55);

                        // Outer border
                        page.drawRectangle({
                            x: pdfX,
                            y: pdfY,
                            width: boxW,
                            height: boxH,
                            borderColor: BLACK,
                            borderWidth: 0.8,
                        });

                        // Title
                        page.drawText("SIGNATURE", {
                            x: pdfX + 8,
                            y: pdfY + boxH - 14,
                            size: 8,
                            font,
                            color: BLACK,
                        });

                        // Assigned signer
                        page.drawText(`Signer: ${field.role_name}`, {
                            x: pdfX + 8,
                            y: pdfY + boxH - 28,
                            size: 7,
                            font,
                            color: DARK,
                        });

                        // Signature line
                        const lineY = pdfY + 18;

                        page.drawLine({
                            start: {
                                x: pdfX + 8,
                                y: lineY,
                            },
                            end: {
                                x: pdfX + boxW - 8,
                                y: lineY,
                            },
                            thickness: 0.8,
                            color: BLACK,
                        });

                        // Caption
                        page.drawText("Signature", {
                            x: pdfX + 8,
                            y: pdfY + 5,
                            size: 6,
                            font,
                            color: LIGHT,
                        });

                        // Optional date line
                        page.drawLine({
                            start: {
                                x: pdfX + boxW * 0.65,
                                y: lineY,
                            },
                            end: {
                                x: pdfX + boxW - 8,
                                y: lineY,
                            },
                            thickness: 0.8,
                            color: BLACK,
                        });

                        page.drawText("Date", {
                            x: pdfX + boxW * 0.75,
                            y: pdfY + 5,
                            size: 6,
                            font,
                            color: LIGHT,
                        });
                    }

                    const modifiedBytes = await pdfDoc.save();
                    pdfBuffer = Buffer.from(modifiedBytes);
                } catch (err) {
                    console.error("Failed to render signature boxes on downloaded PDF:", err);
                }
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