# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install --omit=dev

# Bundle app source
COPY . .

# Expose backend port
EXPOSE 8080

# Run the app
CMD ["npm", "start"]
