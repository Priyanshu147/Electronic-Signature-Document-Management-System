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
    },

    /**
     * ===========================================================
     * get Document by ID
     * ===========================================================
     **/
    async getDocumentById(documentId: number) {

        const [rows]: any = await db.query(
            `
        SELECT *
        FROM ${TABLES.DOCUMENT}
        WHERE id=?
        `,
            [documentId]
        );

        if (rows.length === 0) {
            throw new APIError(
                ERROR_MESSAGES.DOCUMENT_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }

        return rows[0];
    },
    /**
     * ===========================================================
     * update Document
     * ===========================================================
     **/
    async updateDocument(
        id: number,
        documentName: string,
        status?: string
    ) {
        let query = `UPDATE ${TABLES.DOCUMENT} SET document_name = ?`;
        const params: any[] = [documentName];

        if (status) {
            query += `, status = ?`;
            params.push(status);
        }

        query += ` WHERE id = ?`;
        params.push(id);

        const [result]: any = await db.query(query, params);

        if (result.affectedRows === 0) {
            throw new APIError(
                ERROR_MESSAGES.DOCUMENT_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }

        return {
            success: true
        };
    },
    /**
     * ===========================================================
     * Get All Documents
     * ===========================================================
     */

    async getDocuments(filters: {
        page: number;
        limit: number;
        searchText?: string;
        status?: string;
        sortBy?: string;
        sortOrder?: "asc" | "desc" | "ASC" | "DESC";
    }) {
        const {
            page,
            limit,
            searchText = "",
            status = "",
            sortBy,
            sortOrder,
        } = filters;

        const sortMap: Record<string, string> = {
            document_name: "d.document_name",
            original_file_name: "d.original_file_name",
            file_size: "d.file_size",
            page_count: "d.page_count",
            status: "d.status",
            created_at: "d.created_at",
            uploaded_by: "u.full_name",
            number_of_signers: "number_of_signers",
        };

        const orderByCol = (sortBy && sortMap[sortBy]) ? sortMap[sortBy] : "d.created_at";
        const orderDir = (sortOrder && String(sortOrder).toLowerCase() === "asc") ? "ASC" : "DESC";

        const offset = (page - 1) * limit;

        let whereClause = `
        WHERE u.is_deleted = 0
    `;

        const params: any[] = [];

        if (searchText.trim()) {
            whereClause += `
            AND (
                d.document_name LIKE ?
                OR d.original_file_name LIKE ?
                OR u.full_name LIKE ?
            )
        `;

            const keyword = `%${searchText}%`;

            params.push(
                keyword,
                keyword,
                keyword
            );
        }

        if (status.trim()) {
            whereClause += `
            AND d.status = ?
        `;

            params.push(status);
        }

        /* ==========================================
           Total Records
        ========================================== */

        const countQuery = `
        SELECT COUNT(DISTINCT d.id) AS totalRecords

        FROM ${TABLES.DOCUMENT} d

        INNER JOIN ${TABLES.USER} u
            ON d.uploaded_by = u.id

        ${whereClause}
    `;

        const [[countResult]]: any = await db.query(
            countQuery,
            params
        );

        /* ==========================================
           Document List
        ========================================== */

        const query = `
        SELECT
            d.id,
            d.document_name,
            d.original_file_name,
            d.file_size,
            d.page_count,
            d.status,
            d.created_at,

            u.full_name AS uploaded_by,

            COUNT(dsf.id) AS number_of_signers

        FROM ${TABLES.DOCUMENT} d

        INNER JOIN ${TABLES.USER} u
            ON d.uploaded_by = u.id

        LEFT JOIN document_signature_fields dsf
            ON dsf.document_id = d.id

        ${whereClause}

        GROUP BY
            d.id,
            d.document_name,
            d.original_file_name,
            d.file_size,
            d.page_count,
            d.status,
            d.created_at,
            u.full_name

        ORDER BY ${orderByCol} ${orderDir}

        LIMIT ?

        OFFSET ?
    `;

        const [rows]: any = await db.query(
            query,
            [
                ...params,
                limit,
                offset,
            ]
        );

        return {
            documents: rows,
            pagination: {
                page,
                limit,
                totalRecords: countResult.totalRecords,
                totalPages: Math.ceil(
                    countResult.totalRecords / limit
                ),
            },
        };
    },
    /**
 * ===========================================================
 * Download Document
 * ===========================================================
 */
    async downloadDocument(documentId: number) {
        const query = `
        SELECT
            id,
            document_name,
            stored_file_name,
            file_path
        FROM ${TABLES.DOCUMENT}
        WHERE id = ?
        LIMIT 1
    `;

        const [rows]: any = await db.query(query, [documentId]);

        if (rows.length === 0) {
            throw new APIError(
                ERROR_MESSAGES.DOCUMENT_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }

        return rows[0];
    },
    /**
 * ===========================================================
 * Save Document Signature Fields
 * ===========================================================
 */
    async saveSignatureFields(
        documentId: number,
        fields: {
            signerRoleId: number;
            pageNumber: number;
            xPosition: number;
            yPosition: number;
            width: number;
            height: number;
            required: boolean;
        }[]
    ) {
        // Check document exists
        const [documents]: any = await db.query(
            `
        SELECT id
        FROM ${TABLES.DOCUMENT}
        WHERE id = ?
        `,
            [documentId]
        );

        if (documents.length === 0) {
            throw new APIError(
                ERROR_MESSAGES.DOCUMENT_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }

        // Remove old fields
        await db.query(
            `
        DELETE
        FROM ${TABLES.DOCUMENT_SIGNER_FIELDS}
        WHERE document_id = ?
        `,
            [documentId]
        );

        // Nothing to save
        if (fields.length === 0) {
            return {
                success: true,
                message: "Signature fields updated."
            };
        }

        const values = fields.map(field => [
            documentId,
            field.signerRoleId,
            field.pageNumber,
            field.xPosition,
            field.yPosition,
            field.width,
            field.height,
            field.required
        ]);

        await db.query(
            `
        INSERT INTO ${TABLES.DOCUMENT_SIGNER_FIELDS}
        (
            document_id,
            signer_role_id,
            page_number,
            x_position,
            y_position,
            width,
            height,
            required
        )
        VALUES ?
        `,
            [values]
        );

        return {
            success: true,
            message: "Signature fields saved successfully."
        };
    },
    /**
     * ===========================================================
     * Get Signature Fields
     * ===========================================================
     */
    async getSignatureFields(documentId: number) {

        const [rows]: any = await db.query(
            `
        SELECT

            dsf.id,

            dsf.page_number,

            dsf.x_position,

            dsf.y_position,

            dsf.width,

            dsf.height,

            dsf.required,

            sr.id AS signer_role_id,

            sr.role_name

        FROM ${TABLES.DOCUMENT_SIGNER_FIELDS} dsf

        INNER JOIN ${TABLES.SIGNER_ROLE} sr
            ON sr.id = dsf.signer_role_id

        WHERE dsf.document_id = ?

        ORDER BY
            dsf.page_number,
            dsf.id
        `,
            [documentId]
        );

        return rows;
    }

};

export default DocumentService;