# Dockmate
Dockmate is a versatile CLI tool designed to simplify Docker workflows for JavaScript-based projects. It streamlines tasks like generating Dockerfiles, building Docker images, and running containers. With support for frameworks such as React, Angular, Next.js, Vue.js, and more, Dockmate is your go-to helper for containerizing applications effortlessly.
<p align="center">
    <img src="https://github.com/user-attachments/assets/c127ef8a-4551-48ef-8600-8d40f5bda463" alt="Dockmate" width="30%" height="30%">
</p>

## Installation
```
npm i dockmate
```
**OR**
If dockmate doesn't work then install it globally.
```
npm i -g dockmate
```

## Features
- **Framework Detection**: Automatically detects the framework of your project and generates a tailored Dockerfile.
- **Interactive UI**: Step-by-step guided Dockerfile creation for users new to Docker.
- **Custom Dockerfile Generation**: Supports React, Angular, Node.js, Next.js, Vue.js, and other major JavaScript frameworks.
- **Docker Image Management**: Build Docker images directly from your project’s Dockerfile or generate one if missing.
- **Container Management**: Easily run Docker containers with custom configurations for ports, environment variables, and more.
- **Extensibility**: Plugin architecture allows adding new features effortlessly.

## Commands
## CLI Usage
Dockmate offers several commands to manage Docker workflows. Below is a list of commands, their descriptions, and example outputs:

### 1. Interactive Dockerfile Initialization
Guides you through an interactive setup to generate a Dockerfile.
#### Command :
```
dockmate init
```
#### Output :
```
? What framework does your project use? (Use arrow keys)
  react
  angular
  vuejs
  nextjs
  node
? What port does your application listen on? 3000
? What is the entry point for your application? index.js
? What version of Node.js should be used? 18
? Does your project use a .env file? Yes
[INFO] Dockerfile created successfully!
```

### 2. Generate Dockerfile
Automatically generates a Dockerfile based on project dependencies.
#### Command :
```
dockmate generate
```
#### Options
- ```--framework``` Specify the framework (react, angular, node, nextjs, vuejs, sevelte, gatsby).
- ```--nodeVersion``` Specify Node.js version (default: 18).
- ```--port``` Specify application port (default: 3000).
- ```--entryPoint``` Specify entry point file (default: index.js).
#### Example
```
dockmate generate --framework=node --nodeVersion=16 --port=4000 --entryPoint=app.js
```
#### Output
```
[INFO] Generating Dockerfile for node...
[INFO] Dockerfile created successfully!
```

### 3. Build Docker Image
Builds a Docker image for your project.
#### Command :
```
dockmate build
```
#### Options
- ```--tag``` Specify image tag (default: latest).
- ```--framework``` Specify framework for the Dockerfile.
- ```--dockerfilePresent``` Indicate if the Dockerfile is already present (default: true).
- ```--name``` Specify Docker image name (default: dockmate-image-<timestamp>).
#### Example
```
dockmate build --tag=myapp:1.0 --framework=react --name=myapp-image
```
#### Output
```
[INFO] Building Docker image with tag: myapp:1.0...
[INFO] Docker image built successfully!
```

### 4. Run Docker Container
#### Command :
```
dockmate run --image=<imageName>
```
#### Options
- ```--port``` Specify port mapping (host:container format).
- ```--env``` Set environment variables (KEY=value format).
- ```--name``` Specify container name.
#### Example
```
dockmate run --image=myapp:1.0 --port=8080:3000 --env=NODE_ENV=production --name=myapp-container
```
#### Output
```
[INFO] Starting container myapp-container...
[INFO] Container started successfully!
```

### 5. Development Mode (Live Reload)
#### Command :
```
dockmate dev
```
#### Interactive Options :
```
? Enter the files or directories to watch: ./src, ./index.js
? Enter the path to the Dockerfile: ./Dockerfile
? Enter the Docker image name: dockmate-dev
? Enter the name of the Docker container: dockmate-dev-container
? Should the container restart automatically on changes? Yes
[INFO] Development mode started. Watching files for changes...
```
## Programmatic Usage
Dockmate provides several utility functions that can be integrated into your <JS> projects. Below is a structured way to use them programmatically:
### 1. Detect Framework
Automatically detect the framework your project uses.
```
// import module
const { detectFramework } = require('dockmate/src/framework-detector');

// detect the framework of the working project
(async () => {
  try {
    const framework = await detectFramework();
    console.log(`Detected Framework: ${framework}`);
  } catch (error) {
    console.error(`[ERROR] Framework detection failed: ${error.message}`);
  }
})();
```
### 2. Generate Dockerfile
Generate a Dockerfile for your project based on options.
```
// import module
const { generateDockerfile } = require('dockmate/src/dockerfile-generator');

// generate the dockerfile based on the framework and options
(async () => {
  try {
    const options = {
      nodeVersion: '18',          // Node.js version
      port: 3000,                // Application port
      entryPoint: 'index.js',    // Application entry point
      useEnv: true,              // Whether to include .env file
    };

    await generateDockerfile('react', options);
    console.log('[INFO] Dockerfile created successfully!');
  } catch (error) {
    console.error(`[ERROR] Dockerfile generation failed: ${error.message}`);
  }
})();
```
### 3. Build Docker Image
Build a Docker image for your project.
```
// import module
const { buildImage } = require('dockmate/src/image-builder');

// build docker image using the options
(async () => {
  try {
    const options = {
      tag: 'myapp:1.0',          // Image tag
      framework: 'react',        // Framework used
      dockerfilePresent: true,   // Whether Dockerfile already exists
      imageName: 'myapp-image',  // Image name
    };

    await buildImage(options);
    console.log('[INFO] Docker image built successfully!');
  } catch (error) {
    console.error(`[ERROR] Image build failed: ${error.message}`);
  }
})();
```

### 4. Run Docker Container
Run a Docker container from an image with customizable options. 
```
// import module
const { runContainer } = require('dockmate/src/container-runner');

// runContainer using options
(async () => {
  try {
    const options = {
      imageName: 'myapp:1.0',              // Image name
      ports: [{ host: 8080, container: 3000 }], // Port mapping
      env: { NODE_ENV: 'production' },    // Environment variables
      containerName: 'myapp-container',   // Name of the container
    };

    await runContainer(options);
    console.log('[INFO] Docker container started successfully!');
  } catch (error) {
    console.error(`[ERROR] Container start failed: ${error.message}`);
  }
})();
```

### 5. Development Mode (Live Reload)
Run a Docker container in development mode with live reload for specified paths.
```
// import module
const { startDevMode } = require('dockmate/src/docker-dev');

// use options to start the dev mode
(async () => {
  try {
    const options = {
      watchPaths: ['./src', './index.js'], // Files or directories to watch
      dockerfilePath: './Dockerfile',      // Path to Dockerfile
      imageName: 'dev-image',             // Image name for development
      containerName: 'dev-container',     // Container name
      autoRestart: true,                  // Auto-restart on changes
    };

    await startDevMode(options);
    console.log('[INFO] Development mode started. Watching for changes...');
  } catch (error) {
    console.error(`[ERROR] Development mode failed: ${error.message}`);
  }
})();
```

**Again prefer using dockmate CLI**

## Contributing
Contributions are welcome! Here’s how you can help, read the **Contribution-guide.md** file.
Feel free to report bugs or suggest new features by opening an issue.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
Big thanks to the open-source community for inspiration and support. Let’s build something amazing together!

Happy coding! 🚀

