# Use Node.js 20 on Alpine Linux (required by dependencies)
FROM node:20-alpine

# Install system dependencies
# python3: Required for some yt-dlp operations
# ffmpeg: Required for media processing/merging
RUN apk add --no-cache python3 ffmpeg

# Set working directory
WORKDIR /app

# Copy package files and scripts first
COPY package*.json ./
COPY scripts/ ./scripts/

# Install dependencies
# This will also trigger the 'postinstall' script to download yt-dlp
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
