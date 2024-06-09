# Stage 1: Build the application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Stage 2: Run the application
FROM node:20-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app .

# Install only production dependencies
RUN npm install --only=production

# Expose the necessary port
EXPOSE 8001

# Command to run the application
CMD ["node", "dist/server.js"]
