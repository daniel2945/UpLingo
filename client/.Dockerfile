FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# פורט 5173 הוא ברירת המחדל של Vite (React)
EXPOSE 5173

# מפעילים את האתר
CMD ["npm", "run", "dev"]