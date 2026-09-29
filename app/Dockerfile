# ---------- Runtime ----------
FROM alpine:3.24.2

WORKDIR /app

# Node.js runtime dependencies
RUN apk add --no-cache \
    libstdc++ \
    libgcc

# Copy Node runtime from official Node image
COPY --from=node:22-alpine /usr/local/bin/node /usr/local/bin/node

# Copy application
COPY server.js .

ENV NODE_ENV=production
ENV PORT=3000

# Non-root user
RUN addgroup -S appgroup \
    && adduser -S appuser -G appgroup \
    && chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]