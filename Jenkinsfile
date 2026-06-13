pipeline {
    agent any

    tools {
        nodejs 'node-24'
    }

    options {
        timestamps()
        timeout(time: 5, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Dependencies') {
            steps {
                sh 'HUSKY=0 npm ci'
                sh 'npm audit --audit-level=high'
            }
        }

        stage('Lint and Format') {
            steps {
                sh 'npm run lint:check'
                sh 'npm run format:check'
            }
        }

        stage('Tests') {
            steps {
                sh 'npm run test:cov'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Triggering deploy on Render'
                withCredentials([string(credentialsId: 'render-deploy-hook', variable: 'RENDER_DEPLOY_HOOK')]) {
                    sh 'curl -fsS -X POST "$RENDER_DEPLOY_HOOK"'
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    echo 'Deploy triggered, will be available on Render shortly'
                    currentBuild.description = 'Render deploy triggered'
                }
            }
        }
        failure {
            echo 'Pipeline failed'
            script { currentBuild.description = 'Pipeline failed' }
        }
    }
}
