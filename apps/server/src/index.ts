import "dotenv/config";
import { prisma } from "@repo/db/client";
import express from "express";

const app = express()

app.get("/", async (req, res) => {
    console.log("database url ===> ", process.env.DATABASE_URL)
    const users = await prisma.user.findMany();
    console.log("minor chnage ==> ", users)
    res.status(200).json({message: "hello world", users})
})

app.listen(8000)