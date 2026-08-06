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
    USER_ROLE,
} from "../utils/constants.js";

const UserService = {
     /**
     * ===========================================================
     * User Login
     * ===========================================================
     */
    async login(
        email: string,
        password: string
    ) {
        const query = `
            SELECT
                id,
                email,
                password
            FROM ${TABLES.USER}
            WHERE email = ?
            LIMIT 1
        `;
        const [rows]: any = await db.query(query, [email]);
        if (rows.length === 0) {
            throw new APIError(
                ERROR_MESSAGES.INVALID_CREDENTIALS,
                httpStatus.UNAUTHORIZED
            );
        }

        const user = rows[0];

        const isPasswordCorrect =
            await comparePassword(
                password,
                user.password
            );

        if (!isPasswordCorrect) {
            throw new APIError(
                ERROR_MESSAGES.INVALID_CREDENTIALS,
                httpStatus.UNAUTHORIZED
            );
        }

        // Optional
        await db.query(
            `
            UPDATE ${TABLES.USER}
            SET last_login = NOW()
            WHERE id = ?
            `,
            [user.id]
        );

        return getAuthToken(
            user.id,
            USER_ROLE.USER
        );
    },

    /**
     * ===========================================================
     * User Profile
     * ===========================================================
     */
    async profile(userId: number) {
        const query = `
            SELECT
                id,
                email,
                full_name,
                status,
                last_login,
                created_at,
                updated_at
            FROM ${TABLES.USER}
            WHERE id = ?
            LIMIT 1
        `;
        const [rows]: any = await db.query(query, [userId]);
        if (rows.length === 0) {
            throw new APIError(
                ERROR_MESSAGES.USER_NOT_FOUND,
                httpStatus.NOT_FOUND
            );
        }

        return rows[0];
    },

    
};

export default UserService;