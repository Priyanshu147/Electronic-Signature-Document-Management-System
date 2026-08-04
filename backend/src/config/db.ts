import mysql from "mysql2";
import {DB_CONFIG} from "../utils/constants.js";

const pool = mysql.createPool(DB_CONFIG).promise();
export default pool;