# # Stage 1: Build
# FROM node:16 as build
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .

# # Stage 2: Run
# FROM node:16-alpine
# WORKDIR /app
# COPY --from=build /app .
# CMD ["npm", "start"]

# Stage 1: Build
FROM node:16 as build
WORKDIR /app
COPY package*.json ./

# بازگشت به رجیستری اصلی npm
RUN npm config set registry https://registry.npmjs.org

# به‌روزرسانی گواهی‌های SSL (اختیاری)
RUN apt-get update && apt-get install -y ca-certificates && update-ca-certificates

# نصب وابستگی‌ها
RUN npm install

COPY . .

# Stage 2: Run
FROM node:16-alpine
WORKDIR /app
COPY --from=build /app .
CMD ["npm", "start"]