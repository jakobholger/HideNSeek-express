# Use an existing Docker image as a base
FROM node:18.17.1

# Set the working directory inside the container
WORKDIR /myapp/src

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run the application
CMD ["node", "app.js"]
