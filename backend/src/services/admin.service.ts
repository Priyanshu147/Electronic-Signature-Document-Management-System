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

const AdminService = {
  /**
   * ===========================================================
   * Admin Login
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
        password_hash
      FROM ${TABLES.ADMIN}
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

    const admin = rows[0];

    const isPasswordCorrect =
      await comparePassword(
        password,
        admin.password_hash
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
      UPDATE ${TABLES.ADMIN}
      SET last_login = NOW()
      WHERE id = ?
      `,
      [admin.id]
    );

    return getAuthToken(
      admin.id,
      USER_ROLE.ADMIN
    );
  },
  /**
 * ===========================================================
 * Dashboard
 * ===========================================================
 */
  async dashboard() {
    const [[totalUsers]]: any = await db.query(
      `
      SELECT COUNT(*) AS totalUsers
      FROM ${TABLES.USER}
      `
    );

    const [[activeUsers]]: any = await db.query(
      `
      SELECT COUNT(*) AS activeUsers
      FROM ${TABLES.USER}
      WHERE status = 'Active'
      `
    );

    const [[inactiveUsers]]: any = await db.query(
      `
      SELECT COUNT(*) AS inactiveUsers
      FROM ${TABLES.USER}
      WHERE status = 'Inactive'
      `
    );

    return {
      totalUsers: totalUsers.totalUsers,
      activeUsers: activeUsers.activeUsers,
      inactiveUsers: inactiveUsers.inactiveUsers,
    };
  },
  /**
 * ===========================================================
 * Create User
 * ===========================================================
 */
  async createUser(userData: {
    fullName: string;
    email: string;
    password: string;
    status?: string;
  }) {
    const {
      fullName,
      email,
      password,
      status = "Active",
    } = userData;

    // Check if email already exists
    const [existingUsers]: any = await db.query(
      `
      SELECT id
      FROM ${TABLES.USER}
      WHERE email = ?
      LIMIT 1
      `,
      [email]
    );

    if (existingUsers.length > 0) {
      throw new APIError(
        ERROR_MESSAGES.DUPLICATE_EMAIL,
        httpStatus.CONFLICT
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Insert new user
    const [result]: any = await db.query(
      `
      INSERT INTO ${TABLES.USER}
      (
        full_name,
        email,
        password,
        status
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        fullName,
        email,
        passwordHash,
        status,
      ]
    );

    // Return created user
    return {
      id: result.insertId,
      fullName,
      email,
      status,
    };
  },
  /**
 * ===========================================================
 * Get Admin Profile
 * ===========================================================
 */
  async profile(adminId: number) {
    const [rows]: any = await db.query(
      `
    SELECT
      id,
      email,
      last_login,
      created_at
    FROM ${TABLES.ADMIN}
    WHERE id = ?
    LIMIT 1
    `,
      [adminId]
    );

    if (rows.length === 0) {
      throw new APIError(
        ERROR_MESSAGES.ADMIN_NOT_FOUND,
        httpStatus.NOT_FOUND
      );
    }

    return rows[0];
  },
  /**
   * ===========================================================
   * Get Users
   * ===========================================================
   */
  async getUsers(filters: {
    page?: number;
    limit?: number;
    searchText?: string;
    status?: string | null;
  }) {
    const {
      page = 1,
      limit = 10,
      searchText = "",
      status = null,
    } = filters;

    const offset = (page - 1) * limit;

    const where: string[] = [];
    const params: any[] = [];

    if (searchText) {
      where.push("(full_name LIKE ? OR email LIKE ?)");
      params.push(
        `%${searchText}%`,
        `%${searchText}%`
      );
    }

    if (status) {
      where.push("status = ?");
      params.push(status);
    }

    const whereClause =
      where.length > 0
        ? `WHERE ${where.join(" AND ")}`
        : "";

    const [rows]: any = await db.query(
      `
    SELECT
      id,
      full_name,
      email,
      status,
      last_login,
      created_at
    FROM ${TABLES.USER}
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT ?
    OFFSET ?
    `,
      [...params, limit, offset]
    );

    const [[count]]: any = await db.query(
      `
    SELECT COUNT(*) AS total
    FROM ${TABLES.USER}
    ${whereClause}
    `,
      params
    );

    return {
      users: rows,
      total: count.total,
      page,
      limit,
      totalPages: Math.ceil(count.total / limit),
    };
  },
  /**
   * ===========================================================
   * Get User By Id
   * ===========================================================
   */
  async getUserById(id: number) {
    const [rows]: any = await db.query(
      `
    SELECT
      id,
      full_name,
      email,
      status,
      last_login,
      created_at,
      updated_at
    FROM ${TABLES.USER}
    WHERE id = ?
    LIMIT 1
    `,
      [id]
    );

    if (rows.length === 0) {
      throw new APIError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        httpStatus.NOT_FOUND
      );
    }

    return rows[0];
  },
  /**
   * ===========================================================
   * Update User
   * ===========================================================
   */
  async updateUser(
    id: number,
    userData: {
      fullName: string;
      email: string;
      status: string;
    }
  ) {
    const { fullName, email, status } =
      userData;

    const [existing]: any = await db.query(
      `
    SELECT id
    FROM ${TABLES.USER}
    WHERE email = ?
      AND id <> ?
    LIMIT 1
    `,
      [email, id]
    );

    if (existing.length) {
      throw new APIError(
        ERROR_MESSAGES.DUPLICATE_EMAIL,
        httpStatus.CONFLICT
      );
    }

    const [result]: any = await db.query(
      `
    UPDATE ${TABLES.USER}
    SET
      full_name = ?,
      email = ?,
      status = ?
    WHERE id = ?
    `,
      [
        fullName,
        email,
        status,
        id,
      ]
    );

    if (!result.affectedRows) {
      throw new APIError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        httpStatus.NOT_FOUND
      );
    }

    return this.getUserById(id);
  },
  /**
   * ===========================================================
   * Delete User
   * ===========================================================
   */
  async deleteUser(id: number) {
    const [result]: any = await db.query(
      `
    DELETE FROM ${TABLES.USER}
    WHERE id = ?
    `,
      [id]
    );

    if (!result.affectedRows) {
      throw new APIError(
        ERROR_MESSAGES.USER_NOT_FOUND,
        httpStatus.NOT_FOUND
      );
    }

    return {
      success: true,
    };
  },
};


export default AdminService;