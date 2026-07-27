# 构建阶段
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

# 空字符串：走同源相对路径，由 nginx 反代到后端
ARG REACT_APP_API_URL=
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# 运行阶段
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
