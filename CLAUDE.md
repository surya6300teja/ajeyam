# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ajeyam is a full-stack MERN blogging platform focused on Indian history. Monorepo with `client/` (React/Vite) and `server/` (Express/MongoDB).

**Production domain**: ajeyam.in (frontend), api.ajeyam.in (backend)

## Development Commands

```bash
# Full stack dev (tmux split-pane with both servers)
./dev.sh

# Frontend only (port 5173)
cd client && npm run dev

# Backend only (port 4000)
cd server && npm run dev

# Install all dependencies
./install.sh

# Lint frontend
cd client && npm run lint

# Production build
cd client && npm run build

# Docker deployment
docker-compose up -d
```

No automated tests exist yet. `npm test` in server is a placeholder.

## Architecture

### Client (`client/`)
- **React 19** with **Vite 6**, **Tailwind CSS 4**, **React Router 7**
- Rich text editor: **TipTap** with image, link, text-align, font-family extensions
- Auth state managed via `AuthContext` (`client/src/context/AuthContext.jsx`) — JWT stored in localStorage
- API layer in `client/src/services/api.js` — Axios instance with token interceptor and 401 auto-logout
- `VITE_API_URL` env var sets API base (defaults to `http://localhost:4000/api/v1`)
- Protected routes use `client/src/components/auth/ProtectedRoute.jsx`

### Server (`server/`)
- **Express 4** on port 4000 (configurable via `PORT` env)
- **MongoDB** via **Mongoose 7** — connection string in `MONGO_URI` env var
- JWT auth via `server/src/middleware/authMiddleware.js`: `protect` (verify token) and `restrictTo(...roles)` (RBAC)
- Global error handling in `server/src/middleware/errorMiddleware.js`
- File uploads via Multer (`server/src/utils/fileUpload.js`)
- Email via Nodemailer (`server/src/utils/emailService.js`)

### API Routes (all prefixed `/api/v1`)
| Prefix | File | Key patterns |
|--------|------|-------------|
| `/auth` | authRoutes.js | register, login, forgot/reset password, email verify |
| `/blogs` | blogRoutes.js | CRUD, publish workflow (draft→pending→published), likes, featured |
| `/blogs/:blogId/comments` | commentRoutes.js | Nested comments with replies, likes |
| `/users` | userRoutes.js | Profile, saved blogs, follow authors, admin user mgmt |
| `/categories` | categoryRoutes.js | Hierarchical categories with parent/sub |
| `/reviews` | bookReviewRoutes.js | Book reviews with admin approval workflow |

### Database Models (`server/src/models/`)
- **Blog**: title, slug, content, author→User, category→Category, status enum (draft/pending/published/rejected), likes array, auto-calculated readTime
- **User**: name, email, hashed password, role (user/admin), savedBlogs, following, email verification & password reset tokens
- **Category**: hierarchical (parentCategory self-ref), slug, order for sorting
- **Comment**: content, author→User, blog→Blog, parentComment for threading
- **BookReview**: title, content, rating 1-5, approval status

### Deployment
- Docker Compose orchestrates: backend, frontend (Nginx-served build), Nginx reverse proxy, Certbot (Let's Encrypt SSL)
- Nginx config in `nginx/conf.d/app.conf` — 50MB upload limit, gzip, static asset caching (30 days)

## Design System
- Primary: `#E78C3D` (golden orange), Secondary: `#264653` (dark blue), Accent: `#FFD700` (gold), Background: `#F9F5ED` (cream)
- Fonts: Merriweather (serif, headings), Inter (sans, body)
- Global styles: `client/src/styles/index.css`
