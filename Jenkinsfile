@Library('pipeline-shared-lib@main') _

import org.myorg.Utils

pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        APP_NAME    = 'sample-node-app'
        BRANCH_TYPE = "${Utils.getBranchType(env.BRANCH_NAME)}"
        DOCKER_TAG  = "${Utils.getDockerTag(env.BRANCH_NAME, env.BUILD_NUMBER)}"
        SHOULD_DEPLOY = "${Utils.shouldDeploy(env.BRANCH_TYPE)}"
    }

    stages {

        stage('Checkout & Info') {
            steps {
                script {
                    echo "Branch: ${env.BRANCH_NAME}"
                    echo "Branch type: ${env.BRANCH_TYPE}"
                    echo "Docker tag: ${env.DOCKER_TAG}"
                    echo "Will deploy: ${env.SHOULD_DEPLOY}"

                    // Load defaults from shared library resource
                    def defaultsYaml = libraryResource('config/defaults.yaml')
                    writeFile file: 'build-defaults.yaml', text: defaultsYaml
                    echo "Loaded build defaults"
                }
            }
        }

        stage('Install & Build') {
            steps {
                // Calling the shared library buildApp step
                buildApp(nodeVersion: '18', archive: true)
            }
        }

        stage('Quality Gates') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        runTests(
                            testCmd:     'npm test -- --coverage --ci',
                            coverageDir: 'coverage'
                        )
                    }
                }
                stage('Lint') {
                    steps {
                        script {
                            try {
                                sh 'npm run lint'
                            } catch (err) {
                                echo "Lint issues found: ${err.message}"
                                currentBuild.result = 'UNSTABLE'
                            }
                        }
                    }
                }
                stage('Security Scan') {
                    steps {
                        script {
                            sh 'npm audit --audit-level=high || echo "Audit warnings present"'
                        }
                    }
                }
            }
        }

        stage('Docker Build') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                    branch pattern: 'feature/*', comparator: 'GLOB'
                }
            }
            steps {
                script {
                    echo "Building Docker image: ${APP_NAME}:${DOCKER_TAG}"
                    // sh "docker build -t ${APP_NAME}:${DOCKER_TAG} ."
                    sh "echo 'docker build simulated for tag ${DOCKER_TAG}'"
                }
            }
        }

        stage('Deploy') {
            when {
                expression { return SHOULD_DEPLOY == 'true' }
            }
            steps {
                script {
                    def targetEnv = (BRANCH_TYPE == 'production') ? 'production' : 'staging'
                    echo "Deploying to ${targetEnv}..."

                    // Calling an external shell script
                    sh """
                        chmod +x scripts/deploy.sh 2>/dev/null || true
                        echo "Simulating deploy to ${targetEnv}"
                        echo "App: ${APP_NAME}, Tag: ${DOCKER_TAG}"
                    """

                    if (targetEnv == 'production') {
                        input message: "Confirm production deploy of ${DOCKER_TAG}?", ok: 'Deploy'
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
        success {
            echo "Build ${env.BUILD_NUMBER} succeeded on ${env.BRANCH_NAME}"
        }
        unstable {
            echo "Build unstable — check test/lint results"
        }
        failure {
            echo "Build failed — check logs"
        }
    }
}