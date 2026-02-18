FROM node:18-alpine AS builder
ARG VITE_BACKEND_URL=/dilowa/api
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM httpd:2.4-alpine
WORKDIR /usr/local/apache2
# Copy built static files into Apache htdocs
COPY --from=builder /app/dist/ /usr/local/apache2/htdocs/dilowa/
# Load proxy modules BEFORE the vhost config
COPY docker/load-proxy.conf /usr/local/apache2/conf/extra/load-proxy.conf
RUN echo "Include conf/extra/load-proxy.conf" >> /usr/local/apache2/conf/httpd.conf
# If you provided a site-specific Apache config, copy it. Fall back to a simple proxy config otherwise.
# Don't overwrite Apache's main httpd.conf (it loads the MPM).
COPY docker/docker-local.conf /usr/local/apache2/conf/extra/httpd-vhosts.conf
RUN echo "Include conf/extra/httpd-vhosts.conf" >> /usr/local/apache2/conf/httpd.conf
# Also copy the site-specific conf supplied by the project (kept for reference)
COPY docker/digital-lotse-wasser.conf /usr/local/apache2/conf/extra/digital-lotse-wasser.conf
EXPOSE 80
CMD ["httpd-foreground"]
