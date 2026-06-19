import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    res.status(400).json({ message: "Username and password are required" });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    res.status(401).json({ message: "Invalid username or password" });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, admin.password);
  if (!passwordMatches) {
    res.status(401).json({ message: "Invalid username or password" });
    return;
  }

  const token = jwt.sign({ sub: admin.id, username: admin.username }, process.env.JWT_SECRET ?? "change-this-secret", {
    expiresIn: "1d"
  });

  res.json({ token });
}
