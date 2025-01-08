module.exports = {
    buildImage: require('./core/image-builder'),
    detectFramework: require('./core/framework-detector'),
    generateDockerfile: require('./core/dockerfile-generator'),
    runContainer: require('./core/container-runner'),
    startDevMode: require('./core/docker-dev'),
    backupUtils: require('./utils/backup-utils'),
};