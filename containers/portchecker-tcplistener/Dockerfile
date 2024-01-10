# Use the official Nginx image as a parent image
FROM nginx:latest

# Copy a custom HTML file into the Nginx default HTML directory
COPY index.html /usr/share/nginx/html/
COPY favicon.png /usr/share/nginx/html/

# Replace the default Nginx configuration with the custom one
COPY nginx.conf /etc/nginx/nginx.conf
