import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getAdminBlog,
  listAdminBlogs,
  togglePublishBlog,
  updateBlog
} from "../controllers/blogController.js";
import { approveComment, listAdminComments, rejectComment } from "../controllers/commentController.js";
import { upload } from "../utils/uploads.js";

export const adminRoutes = Router();

const blogUpload = upload.fields([
  { name: "coverImage", maxCount: 1 },
  { name: "images", maxCount: 6 }
]);

adminRoutes.get("/blogs", listAdminBlogs);
adminRoutes.get("/blogs/:id", getAdminBlog);
adminRoutes.post("/blogs", blogUpload, createBlog);
adminRoutes.put("/blogs/:id", blogUpload, updateBlog);
adminRoutes.delete("/blogs/:id", deleteBlog);
adminRoutes.patch("/blogs/:id/publish", togglePublishBlog);

adminRoutes.get("/comments", listAdminComments);
adminRoutes.patch("/comments/:id/approve", approveComment);
adminRoutes.patch("/comments/:id/reject", rejectComment);
