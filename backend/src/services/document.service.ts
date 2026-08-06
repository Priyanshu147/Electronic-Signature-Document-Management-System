import httpStatus from "http-status";

import db from "../config/db.js";

import APIError from "../errors/APIError.js";

import fs from "fs/promises";
import {
    comparePassword,
    getAuthToken,
    hashPassword,
} from "../utils/helper.js";

import {
    ERROR_MESSAGES,
    TABLES,
    USER_ROLE,
} from "../utils/constants.js";

const DocumentService = {
    /**
     * ===========================================================
     * upload Document
     * ===========================================================
     **/
    async uploadDocument(
        userId: number,
        documentName: string,
        originalFileName: string,
        storedFileName: string,
        filePath: string,
        fileSize: number,
        pageCount: number
    ) {
        const query = `
            INSERT INTO ${TABLES.DOCUMENT} 
            (uploaded_by, document_name, original_file_name, stored_file_name, file_path, file_size, page_count)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result]: any = await db.query(query, [
            userId,
            documentName,
            originalFileName,
            storedFileName,
            filePath,
            fileSize,
            pageCount
        ]);
        return {
            id: result.insertId,
            documentName,
            originalFileName,
            fileSize,
        };
    },

    /**
     * ===========================================================
     * delete Document
     * ===========================================================
     **/
    async deleteDocument(documentId: number) {
        // Find document
        const [rows]: any = await db.query(
            `
        SELECT id, file_path
        FROM ${TABLES.DOCUMENT}
        WHERE id = ?
        `,
            [documentId]
        );

        if (rows.length === 0) {
            throw new APIError(
                ERROR_MESSAGES.DOCUMENT_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }

        const document = rows[0];

        // Delete PDF from uploads folder
        try {
            await fs.unlink(document.file_path);
        } catch (error) {
            console.warn("File already deleted:", error);
        }

        // Delete database record
        await db.query(
            `
        DELETE FROM ${TABLES.DOCUMENT}
        WHERE id = ?
        `,
            [documentId]
        );

        return {
            success: true,
            message: "Document deleted successfully."
        };
    }
};

export default DocumentService;