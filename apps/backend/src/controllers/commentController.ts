import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { commentInputSchema } from "../validators/commentValidator.js";

function isPrismaNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export async function createComment(req: Request, res: Response) {
  const blogId = Number(req.params.id);
  const parsed = commentInputSchema.safeParse(req.body);

  if (!Number.isInteger(blogId)) {
    res.status(400).json({ message: "Invalid blog id" });
    return;
  }

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid comment" });
    return;
  }

  const blog = await prisma.blog.findUnique({ where: { id: blogId }, select: { id: true } });
  if (!blog) {
    res.status(404).json({ message: "Blog not found" });
    return;
  }

  await prisma.comment.create({
    data: {
      blogId,
      name: parsed.data.name,
      message: parsed.data.message,
      approved: false
    }
  });

  res.status(201).json({ message: "ส่ง comment แล้ว รอการอนุมัติจากแอดมิน" });
}

export async function listAdminComments(_req: Request, res: Response) {
  const comments = await prisma.comment.findMany({
    include: {
      blog: {
        select: {
          id: true,
          title: true,
          slug: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  res.json({ data: comments });
}

export async function approveComment(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid comment id" });
    return;
  }

  try {
    const comment = await prisma.comment.update({
      where: { id },
      data: { approved: true }
    });

    res.json({ data: comment });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    throw error;
  }
}

export async function rejectComment(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid comment id" });
    return;
  }

  try {
    const comment = await prisma.comment.update({
      where: { id },
      data: { approved: false }
    });

    res.json({ data: comment });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({ message: "Comment not found" });
      return;
    }

    throw error;
  }
}
