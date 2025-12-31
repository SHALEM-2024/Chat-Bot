# ---------- Build stage ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copy frontend files
COPY rag-frontend/package*.json /app/
RUN npm ci

COPY rag-frontend/ /app/

# IMPORTANT: build so frontend calls /api (nginx proxy)
# This sets VITE_API_BASE_URL at build time
ENV VITE_API_BASE_URL=/api

RUN npm run build

# ---------- Run stage ----------
FROM nginx:1.24-alpine

# Copy nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
