import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { blogInputSchema, blogUpdateInputSchema } from "../validators/blogValidator.js";
import { uploadToSupabase } from "../utils/uploads.js";

type BlogFiles = {
  coverImage?: Express.Multer.File[];
  images?: Express.Multer.File[];
};

function parseExistingImages(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return value ? [value] : [];
  }
}

function isPrismaNotFound(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

function isUniqueError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

export async function listPublicBlogs(req: Request, res: Response) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const search = String(req.query.search ?? "").trim();
  const take = 10;
  const skip = (page - 1) * take;

  const where: Prisma.BlogWhereInput = {
    published: true,
    ...(search
      ? {
          title: {
            contains: search,
            mode: "insensitive"
          }
        }
      : {})
  };

  const [items, total] = await Promise.all([
    prisma.blog.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        createdAt: true,
        viewCount: true
      }
    }),
    prisma.blog.count({ where })
  ]);

  res.json({
    data: items,
    meta: {
      page,
      perPage: take,
      total,
      totalPages: Math.ceil(total / take)
    }
  });
}

export async function getPublicBlog(req: Request, res: Response) {
  const existing = await prisma.blog.findUnique({
    where: { slug: req.params.slug },
    select: { id: true, published: true }
  });

  if (!existing?.published) {
    res.status(404).json({ message: "Blog not found" });
    return;
  }

  try {
    const blog = await prisma.blog.update({
      where: { id: existing.id },
      data: {
        viewCount: {
          increment: 1
        }
      },
      include: {
        comments: {
          where: { approved: true },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    res.json({ data: blog });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    throw error;
  }
}

export async function listAdminBlogs(_req: Request, res: Response) {
  const blogs = await prisma.blog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { comments: true }
      }
    }
  });

  res.json({ data: blogs });
}

export async function getAdminBlog(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid blog id" });
    return;
  }

  const blog = await prisma.blog.findUnique({ where: { id } });

  if (!blog) {
    res.status(404).json({ message: "Blog not found" });
    return;
  }

  res.json({ data: blog });
}

export async function createBlog(req: Request, res: Response) {
  const parsed = blogInputSchema.safeParse(req.body);
  const files = req.files as BlogFiles | undefined;
  
  let coverImage = String(req.body.coverImage ?? "");
  let images: string[] = [];
  try {
    if (files?.coverImage?.[0]) {
      coverImage = await uploadToSupabase(files.coverImage[0]);
    }
    if (files?.images?.length) {
      images = await Promise.all(files.images.map(uploadToSupabase));
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to upload image" });
    return;
  }

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid blog" });
    return;
  }

  if (!coverImage) {
    res.status(400).json({ message: "Cover image is required" });
    return;
  }

  if (images.length > 6) {
    res.status(400).json({ message: "Extra images must not exceed 6 files" });
    return;
  }

  try {
    const blog = await prisma.blog.create({
      data: {
        ...parsed.data,
        coverImage,
        images
      }
    });

    res.status(201).json({ data: blog });
  } catch (error) {
    if (isUniqueError(error)) {
      res.status(409).json({ message: "Slug already exists" });
      return;
    }

    throw error;
  }
}

export async function updateBlog(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parsed = blogUpdateInputSchema.safeParse(req.body);
  const files = req.files as BlogFiles | undefined;

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid blog id" });
    return;
  }

  if (!parsed.success) {
    res.status(400).json({ message: parsed.error.issues[0]?.message ?? "Invalid blog" });
    return;
  }

  const existingImages = parseExistingImages(req.body.existingImages);
  
  const data: Prisma.BlogUpdateInput = {
    ...parsed.data,
  };

  let uploadedImages: string[] = [];
  try {
    if (files?.images?.length) {
      uploadedImages = await Promise.all(files.images.map(uploadToSupabase));
    }
    
    if (files?.coverImage?.[0]) {
      data.coverImage = await uploadToSupabase(files.coverImage[0]);
    } else if (req.body.coverImage) {
      data.coverImage = String(req.body.coverImage);
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Failed to upload image" });
    return;
  }
  
  const images = [...existingImages, ...uploadedImages];

  if (images.length > 6) {
    res.status(400).json({ message: "Extra images must not exceed 6 files" });
    return;
  }

  data.images = images;

  try {
    const blog = await prisma.blog.update({
      where: { id },
      data
    });

    res.json({ data: blog });
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    if (isUniqueError(error)) {
      res.status(409).json({ message: "Slug already exists" });
      return;
    }

    throw error;
  }
}

export async function deleteBlog(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid blog id" });
    return;
  }

  try {
    await prisma.blog.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    if (isPrismaNotFound(error)) {
      res.status(404).json({ message: "Blog not found" });
      return;
    }

    throw error;
  }
}

export async function togglePublishBlog(req: Request, res: Response) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    res.status(400).json({ message: "Invalid blog id" });
    return;
  }

  const current = await prisma.blog.findUnique({
    where: { id },
    select: { published: true }
  });

  if (!current) {
    res.status(404).json({ message: "Blog not found" });
    return;
  }

  const blog = await prisma.blog.update({
    where: { id },
    data: { published: !current.published }
  });

  res.json({ data: blog });
}
