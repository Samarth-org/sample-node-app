@Library('pipeline-shared-lib@main') _

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME  = 'sample-node-app'
        DOCKER_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
    }

    stages {

        stage('Build') {
            steps {
                buildApp(nodeVersion: '18', archive: true)
            }
        }

        stage('Test') {
            steps {
                runTests(
                    testCmd:     'npm test -- --coverage --ci',
                    coverageDir: 'coverage'
                )
            }
        }

        stage('Complex Script') {
            steps {
                script {
                    def branchName = env.BRANCH_NAME
                    def shouldDeploy = (branchName == 'main' || branchName == 'develop')

                    echo "Branch: ${branchName}"
                    echo "Should deploy: ${shouldDeploy}"

                    if (shouldDeploy) {
                        sh """
                            chmod +x scripts/deploy.sh
                            ./scripts/deploy.sh ${branchName} ${env.DOCKER_TAG}
                        """
                    } else {
                        echo "Skipping deploy for branch: ${branchName}"
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished: ${currentBuild.result ?: 'SUCCESS'}"
            cleanWs()
        }
        success  { echo "Build succeeded on ${env.BRANCH_NAME}" }
        unstable { echo "Build unstable — check test results" }
        failure  { echo "Build failed — check logs" }
    }
}