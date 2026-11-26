import type { Request, Response, NextFunction } from "express";
import { signupSchema, signinSchema } from "@repo/zod"
import { AppError } from "../utils/errorClasses";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt"
import { signToken } from "../utils/jwt";
import passport from "passport";

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
        domain: process.env.NODE_ENV === "production" ? ".araina.in" : undefined,
        maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
        path: "/",
    });

    res.status(201).json({ success: true, data: { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl } });
};

export const signin = async (req: Request, res: Response) => {
  const parsed = signinSchema.safeParse(req.body);
  
  if (!parsed.success) throw new AppError("Invalid inputs", 400);

  const { email, password } = parsed.data;

  const user = await prisma.user.findFirst({
    where: {
        email
    }
  });

  if (!user) throw new AppError("Email not found", 401);

  if (!user.password) {
    throw new AppError("Please sign in with Google", 401);
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new AppError("Password is incorrect", 401);

  const token = signToken({ userId: user.id, email: user.email });

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain: process.env.NODE_ENV === "production" ? ".araina.me" : undefined,
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.status(200).json({ success: true, data: { id: user.id, name: user.name, email: user.email, imageUrl: user.imageUrl } });
};

export const signout = async (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, {
    path: "/",
    domain: process.env.NODE_ENV === "production" ? ".araina.in" : undefined,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true });
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as Request & { user: { id: string } }).user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const user = await prisma.user.findFirst({
    where: {
        id: userId
    },
    select: {
        id: true,
        name: true,
        email: true,
        imageUrl: true
    }
  });

  if (!user) throw new AppError("User not found", 404);
  res.status(200).json({ success: true, data: user });
};

export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })(req, res, next);
};

export const googleAuthCallback = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("google", { session: false }, (err: Error | null, user: any, info: any) => {
    if (err) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
    }
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
    }

    const token = signToken({ userId: user.id, email: user.email });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? ".araina.in" : undefined,
      maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.redirect(`${process.env.FRONTEND_URL}`);
  })(req, res, next);
};