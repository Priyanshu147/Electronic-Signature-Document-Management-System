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

const DocumentService = {}

export default DocumentService;