FROM nginx:alpine

# Copy all static assets into Nginx webroot
COPY . /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
