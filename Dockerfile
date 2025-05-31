# Stage 1: Build the React app
FROM node:20.15.1 AS build

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy all project files
COPY . .

# Install dependencies
RUN npm install

# Build the React app
RUN npm run build

# Stage 2: Serve the built app with a lightweight web server
FROM nginx:alpine

# Copy the built React app to Nginx's web directory
COPY --from=build /app/build /usr/share/nginx/html

# COPY ./src/assets/images/applogo.png /usr/share/nginx/html/src/assets/images/applogo.png

COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]