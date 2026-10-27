pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Run Tests') {
            steps {
                sh 'python -m unittest discover -v'
            }
        }
    }

    post {
        success {
            echo 'FSD project pipeline completed successfully.'
        }
        failure {
            echo 'FSD project pipeline failed.'
        }
    }
}
