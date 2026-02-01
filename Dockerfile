# =========================
# 1️⃣ Build Stage
# =========================
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build-time args
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Make them available to the app at build-time
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

# Build the Next.js frontend
RUN npm run build

# =========================
# 2️⃣ Production Stage
# =========================
FROM node:18-alpine AS runner
WORKDIR /app

# Copy only what’s needed for production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts

# Production environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose the port for Traefik
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
