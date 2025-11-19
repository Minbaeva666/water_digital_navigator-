const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
import {prisma} from '../../prisma/prisma'

require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

async function loginUser(email: string, password: string, userAgent: string, ipAddress: string) {

    return { };
}

module.exports = { loginUser };