FROM node:20-alpine

WORKDIR /app

# Install the project's runtime/test dependencies exactly as defined by package.json.
COPY package*.json ./
RUN npm install

# Copy application source.
COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Docker-native health check without requiring curl/wget in the image.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["npm", "start"]
