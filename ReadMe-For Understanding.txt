Here I will be keeping all the understanding I will be getting from the project.

------------------Docker Commands:
docker ps : Shows all the running containers
docker ps -a : Shows all the containers along with the images attached to them
docker rm [containerId]: Removes the given container
docker stop [containerId]: Stops the given container
docker start [containerId]: Starts it
docker rmi [imageId]: Removes the given image
docker run [imageName]: runs the image or pulls the image to local from dockerHub

docker build: docker build -t [app name] .
ex. docker build -t minimal-node-app .

Run docker : docker run -p yourport:yourport [app name]
ex: docker run -p 3000:3000 minimal-node-app

--------------------

Use Case	Benefit
docker inspect	Shows which ports are intended to be exposed
docker-compose	Reads this as a hint when configuring services
Documentation	Tells others what ports your app expects

--------------Dockerfile:

EXPOSE 3000 does NOT do any actual port mapping. 
It's for Informational only

A way to document which port the app inside the container listens on

Helpful when using tools like docker-compose, or when other developers read your Dockerfile

----------------Sample of a docker file:
# Use an official Node.js image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app’s code
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your app
CMD [ "node", "index.js" ]


-------------------Why do we copy package first and then install npm and then copy everything from our folder to /app directory in container?
Ans: 
It’s all about Docker layer caching:
Docker builds images in layers, and it caches each step unless something changes. That means:

If you change a file that comes after COPY package*.json ./, Docker will reuse the earlier cached layers and not re-run npm install (which saves time).

If you copied the entire app first (COPY . .) before npm install, then any code change, even a small one, would break the cache and force a full reinstall of dependencies.


----------------Sample example:

In the current structure if you:

Change a JS file → only COPY . . and later steps run. npm install is cached 

Change package.json → cache is invalidated, and Docker runs npm install again 

If you only do: COPY . . and then npm install :

Then any change in your codebase, even a single console.log, would force Docker to re-run npm install every time — slower, inefficient.

---------------------------------------------------------
Docker Compose: Run multiple containers 

Sample of a docker compose.yml file

version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongo

  mongo:
    image: mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:

> depends_on:

Declares a dependency on the mongo service, meaning Docker Compose will start mongo before app.
 Note: This does not wait for MongoDB to be "ready to accept connections" — only that the container has started. You'll still want retry logic or proper error handling in your app.


docker-compose up --build

docker-compose up: will start up the multiple containers assigned in the docker-compose.yml file
docker-compose build: Will build the specified images 



--------------------------------
You can run your Node.js app and MongoDB without Docker.

You could:

Run MongoDB locally on your machine.

Use npm start to run your Node app.

Connect to MongoDB via localhost and everything would still work.

But Docker brings a lot of important benefits in real-world scenarios — especially in DevOps, cloud, and production environments.

 Why Docker Is Significant Here
1. Environment Consistency
“It works on my machine!” — not a valid excuse anymore.

Docker ensures that your app always runs in the same environment, regardless of your OS or dependencies.

No more system-specific bugs, missing Node versions, or MongoDB setup issues.

2. Quick Setup & Teardown
With docker-compose up, you can start your whole app with one command.

No need to install Mongo, Node, or anything else manually.

3. Isolation
Your Node app and MongoDB run in separate containers, isolated from your system.

They don’t interfere with other versions or processes running on your machine.

4. Portability & Sharing
You can package your app and share it with anyone or deploy it to any server — just with your Dockerfile and docker-compose.yml.

No setup headaches.

5. Infrastructure as Code
Your entire app setup — including MongoDB — is now version-controlled and reproducible.

This is a best practice in DevOps and CI/CD.

6. Easier CI/CD & Cloud Deployment
Most cloud platforms, like AWS, GCP, Azure, and Kubernetes, expect apps to be containerized.

Your app is now ready for production pipelines.

🧠 Quick Analogy
Think of Docker like a shipping container for your software.

Without Docker: You hand someone a loose pile of software, hoping they install it the right way.

With Docker: You hand them a sealed, self-contained unit that works the same on every ship, truck, or platform.


----------------------------------------------------
Was facing the build failure with github action when I committed the file after creating setup for docker compose
1st fail was eslint, since the argument in catch block for err was not used in the routes file.
Fix: Just added a console.log so that err gets called.
2nd fail is interesting, it is failing in the Test, since in my app.test.js, req.send('Hello from CI') but in my index.js it is 'Welcome to notesAPI', so changed that
Along with it, mongoDB server connection was not happening, so added an if condition in db.js to skip connecting to db when in test mode using, process.ENV.NODE_ENV==='test'. Added the same var in package.json also.


----------------------------------------------------
 Best Practice (for real-world CI/CD):
Export just the app from your index.js or app.js

Skip app.listen() entirely during tests — using:


if (process.env.NODE_ENV !== 'test') {
  app.listen(3000, () => { ... });
}
In tests, just:


const request = require('supertest');
const app = require('../index');
This:

Prevents Jest from hanging

Avoids port conflicts

Keeps tests fast and isolated

Works cleanly in CI/CD pipelines (like GitHub Actions)


-------------------------------------------------------------------------------------------------------
BIG UPDATE:

Now as the time went by, I will update here what we have done:
1. Created another jenkins container, that has docker running inside it.
2. Created a Jenkinsfile in this repo, which will be used by the jenkins pipeline of the above jenkins container.
3. This Jenkinsfile is used to build, test and deploy app. So basically all CI/CD.
This is the Jenkinsfile:
pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "my-node-app"
    COMPOSE_FILE = "docker-compose.yml"
    NODE_ENV = "test"
  }

  stages {
    stage('Checkout') {
      steps {
        git url: 'https://github.com/SachinTatrari/CI-NodeApp.git'
      }
    }

    stage('Start Services (Mongo + App)') {
      steps {
        sh 'docker-compose -f $COMPOSE_FILE up -d'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'docker-compose exec -T app npm install'
      }
    }

    stage('Lint Code') {
      steps {
        sh 'docker-compose exec -T app npm run lint'
      }
    }

    stage('Run Tests') {
      steps {
        sh 'docker-compose exec -T app npm test'
      }
    }

    stage('Stop Test Containers') {
      steps {
        sh 'docker-compose -f $COMPOSE_FILE down'
      }
    }

    stage('Build Production Docker Image') {
      steps {
        sh 'docker build -t $DOCKER_IMAGE .'
      }
    }

    stage('Deploy Container') {
      steps {
        sh 'docker run -d -p 3000:3000 --name my-node-mongo-container $DOCKER_IMAGE'
      }
    }
  }

  post {
    always {
      echo 'Cleaning up unused containers/images/volumes...'
      sh 'docker system prune -f || true'
    }
  }
}

