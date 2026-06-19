import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const header = req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const token = header.replace("Bearer ", "");

  try {
    jwt.verify(token, process.env.JWT_SECRET ?? "change-this-secret");
    next();
  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
}
