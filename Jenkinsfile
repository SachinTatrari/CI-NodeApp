pipeline {
  agent any

  environment {
    DOCKER_IMAGE = "my-node-app"
    COMPOSE_FILE = "docker-compose.yml"
    NODE_ENV = "test"
  }

  stages {
    
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
