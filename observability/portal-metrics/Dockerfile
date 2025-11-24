FROM node:20-alpine

WORKDIR /app

# Install only prom-client and express
RUN npm install --omit=dev prom-client@15.1.0 express@4.18.2

# Copy metrics exporter
COPY metrics-exporter.js .

EXPOSE 9100

CMD ["node", "metrics-exporter.js"]
