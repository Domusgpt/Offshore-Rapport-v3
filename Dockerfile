FROM nginx:alpine

# Copy static files from the build context to the nginx html directory
COPY . /usr/share/nginx/html

# Copy custom nginx configuration
# This ensures SPA routing (try_files) and basic settings are applied
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 (standard HTTP port)
EXPOSE 80

# Command to start nginx in the foreground when the container launches
CMD ["nginx", "-g", "daemon off;"]