FROM node:alpine

#Make app directory in container
RUN mkdir /app

#Identify working directory
WORKDIR /app

#Copy package
COPY package.json ./
COPY package-lock.json ./
COPY ./ ./

#Install rpm packages from package.json
RUN npm i

#Expose server at port ( accessible outside of container)
EXPOSE 8080 

CMD ["npm", "run", "start"]
