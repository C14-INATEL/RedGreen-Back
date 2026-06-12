pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 5, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                echo 'Disparando o deploy no Render'
                withCredentials([string(credentialsId: 'render-deploy-hook', variable: 'RENDER_DEPLOY_HOOK')]) {
                    sh 'curl -fsS -X POST "$RENDER_DEPLOY_HOOK"'
                }
            }
        }
    }

    post {
        success {
            script {
                if (env.BRANCH_NAME == 'main') {
                    echo 'Deploy disparado e estara disponivel no Render em breve'
                    currentBuild.description = 'Render deploy iniciado'
                }
            }
        }
        failure {
            echo 'Falha no deploy'
            script { currentBuild.description = 'Falha no deploy' }
        }
    }
}
