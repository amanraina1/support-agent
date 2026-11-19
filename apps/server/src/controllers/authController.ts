import type { Request, Response } from "express";
import { signupSchema, signinSchema } from "@repo/zod"
import { AppError } from "../utils/errorClasses";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt"
import { signToken } from "../utils/jwt";

const COOKIE_NAME = process.env.COOKIE_NAME ?? "session_token";
const COOKIE_MAX_AGE_DAYS = 7;
const SALT_ROUNDS = 10;

export const signup = async (req: Request, res: Response) => {
    const parsed = signupSchema.safeParse(req.body);

    if(!parsed.success) throw new AppError(parsed.error.message, 400);

    const { email, name, password, imageUrl } = parsed.data;

    const existing = await prisma.user.findFirst({
        where: {
            email
        }
    });
    if(existing) throw new AppError("Email already registered", 409);

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            imageUrl: imageUrl ?? ""
        },
        omit: {
            password: true
        }
    });
    if(!user) throw new AppError("Failed to create user", 500);

    const token = signToken({ userId: user.id, email: user.email });

    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        domain: process.env.NODE_ENV === "production" ? ".hrsht.me" : undefined,
        maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
        path: "/",
    });

    res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl } });
};
export const signin = async (req: Request, res: Response) => {};
export const signout = async (req: Request, res: Response) => {};
