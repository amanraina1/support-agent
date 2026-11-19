import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  imageUrl: z.url().optional(),
});

export const signinSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});