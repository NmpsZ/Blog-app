export type BlogSummary = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
  viewCount: number;
};

export type Comment = {
  id: number;
  blogId: number;
  name: string;
  message: string;
  approved: boolean;
  createdAt: string;
};

export type Blog = BlogSummary & {
  content: string;
  images: string[];
  published: boolean;
  updatedAt: string;
  comments?: Comment[];
};

export type AdminComment = Comment & {
  blog: {
    id: number;
    title: string;
    slug: string;
  };
};

export type PaginatedBlogs = {
  data: BlogSummary[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
  };
};

export type ApiResponse<T> = {
  data: T;
};
