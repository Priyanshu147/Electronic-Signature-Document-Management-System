import httpStatus from "http-status";

import db from "../config/db.js";

import APIError from "../errors/APIError.js";

import {
    comparePassword,
    getAuthToken,
    hashPassword,
} from "../utils/helper.js";

import {
    ERROR_MESSAGES,
    TABLES,
} from "../utils/constants.js";

const SignerRoleService = {
    /**
     * ===========================================================
     * create Signer Role 
     * ===========================================================
     */
    async createSignerRole(
        roleName: string,
        description: string
    ) {
        const query = `
            INSERT INTO ${TABLES.SIGNER_ROLE} (role_name, description)
            VALUES (?, ?)
        `;
        const [result]: any = await db.query(query, [roleName, description]);
        return {
            id: result.insertId,
            roleName,
            description,
        };
    },
    /**
     * ===========================================================
     * get all Signer Roles
     * ===========================================================
     */
    async getSignerRoles() {
        const query = `
            SELECT id, role_name, description
            FROM ${TABLES.SIGNER_ROLE}
        `;
        const [rows]: any = await db.query(query);
        return {
            success: true,
            data: rows,
        };
    },
    /**
     * ===========================================================
     * get Signer Role by ID
     * ===========================================================
     */
    async getSignerRoleById(id: number) {
        const query = `
            SELECT id, role_name, description
            FROM ${TABLES.SIGNER_ROLE}
            WHERE id = ?
            LIMIT 1
        `;
        const [rows]: any = await db.query(query, [id]);
        if (rows.length === 0) {
            throw new APIError(
                ERROR_MESSAGES.RESOURCE_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }
        return rows[0];
    },

    /**
     * ===========================================================
     * update Signer Role
     * ===========================================================
     */
    async updateSignerRole(
        id: number,
        roleName: string,
        description: string
    ) {
        
        const query = `
            UPDATE ${TABLES.SIGNER_ROLE}
            SET role_name = ?, description = ?
            WHERE id = ?
        `;
        const [result]: any = await db.query(query, [roleName, description, id]);
        if (result.affectedRows === 0) {
            throw new APIError(
                ERROR_MESSAGES.RESOURCE_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }
        return {
            id,
            roleName,
            description,
        };
    },

    /**
     * ===========================================================
     * delete Signer Role
     * ===========================================================
     */
    async deleteSignerRole(id: number) {
        const query = `
            DELETE FROM ${TABLES.SIGNER_ROLE}
            WHERE id = ?
        `;
        const [result]: any = await db.query(query
            , [id]);
        if (result.affectedRows === 0) {
            throw new APIError(
                ERROR_MESSAGES.RESOURCE_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }

        return {
            success: true,
            message: "Signer role deleted successfully.",
        };
    }

};

export default SignerRoleService;