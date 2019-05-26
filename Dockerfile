# Build stage
# =============================================================================
FROM node:10 AS builder

WORKDIR /builder
COPY . .

# Pull dependencies and build.
# Comment these 2 lines and uncomment the tar command to disable build.
RUN npm ci
RUN npm run ng -- build --prod
# Uncomment this line to use a local workshops.tar.gz with a dist/ folder in it
#RUN tar -xf workshops.tar.gz

# Serve stage
# =============================================================================
FROM nginx:stable

# Set up nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copy build artifacts
COPY --from=builder /builder/dist/workshops/* /data/www/
RUN chmod -R a+r /data/www

# Run nginx
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]

