import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createComment } from "../controllers/commentController.js";
import { getPublicBlog, listPublicBlogs } from "../controllers/blogController.js";

const commentLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false
});

export const blogRoutes = Router();

blogRoutes.get("/", listPublicBlogs);
blogRoutes.get("/:slug", getPublicBlog);
blogRoutes.post("/:id/comments", commentLimiter, createComment);
