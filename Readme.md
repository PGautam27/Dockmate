# Dockmate
![WhatsApp Image 2024-12-24 at 10 50 25 AM](https://github.com/user-attachments/assets/4ebd536b-2e50-48d0-8b7c-3fd515678a4b)
Dockmate is a versatile CLI tool designed to simplify Docker workflows for JavaScript-based projects. It streamlines tasks like generating Dockerfiles, building Docker images, and running containers. With support for frameworks such as React, Angular, Next.js, Vue.js, and more, Dockmate is your go-to helper for containerizing applications effortlessly.

## Features
- **Framework Detection**: Automatically detects the framework of your project and generates a tailored Dockerfile.
- **Interactive UI**: Step-by-step guided Dockerfile creation for users new to Docker.
- **Custom Dockerfile Generation**: Supports React, Angular, Node.js, Next.js, Vue.js, and other major JavaScript frameworks.
- **Docker Image Management**: Build Docker images directly from your project’s Dockerfile or generate one if missing.
- **Container Management**: Easily run Docker containers with custom configurations for ports, environment variables, and more.
- **Extensibility**: Plugin architecture allows adding new features effortlessly.

## Installation
1. Clone the Repository:
   ```
    git clone https://github.com/yourusername/dockmate.git
    cd dockmate
   ```
2. Install dependencies:
   ```
    npm install
   ```
3. Install globally:
   ```
    npm link
   ```
4. Add /bin/cli.js to your /usr/local/bin/dockmate (optional : only if dockmate doesn't work after npm link) :
   ```
    // do npm link everytime if any changes in the code
    sudo ln /yourpath/dockmate/bin/cli.js /usr/local/bin/dockmate
    npm link
   ```
5. If cli.js changes isn't reflected in dockmate cli (optional) :
   ```
    sudo rm /usr/local/bin/dockamte
    sudo ln /yourpath/dockmate/bin/cli.js /usr/local/bin/dockmate
    npm link
   ```
## Commands

### Generate Dockerfile
Command:
```
dockmate generate --framework=<framework>
```

Example:
```
dockmate generate --framework=node --nodeVersion=18 --port=3000 --entryPoint=index.js
```

### Build Docker Image
Command:
```
dockmate build --tag=<image_tag> [--dockerfilepresent]
```

Example:
```
dockmate build --tag=my-app:latest --dockerfilepresent
```

### Run Docker Container
Command:
```
dockmate run --image=<image_name> --port=<host_port>:<container_port>
```

Example:
```
dockmate run --image=my-app:latest --port=8080:80
```

### Interactive Mode
Command:
```
dockmate init
```

Use the guided interface to create a Dockerfile step-by-step.

## Contributing
Contributions are welcome! Here’s how you can help:
1. Fork the repository on GitHub.
2. Create a feature branch:
   ```
   git checkout -b feature/your-feature-name
   ```
4. Commit your changes:
   ```
    git commit -m "Add your feature description"
   ```
5. Push to your branch:
   ```
   git push origin feature/your-feature-name
   ```
7. Open a pull request and provide a detailed description.

Feel free to report bugs or suggest new features by opening an issue. Read the **Contribution-guide.md** file for more information.

## Do's and Don'ts

### Do's
- Always run npm install after pulling the latest changes.
- Use the interactive mode if you’re unsure about Docker configurations.
- Follow the contribution guidelines for pull requests.
- Test your changes thoroughly before submitting.

### Don'ts
- Don’t hardcode paths or sensitive data into the project.
- Avoid making breaking changes without discussing them in an issue or pull request.
- Don’t ignore linting errors; ensure your code adheres to the project’s style guide.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
Big thanks to the open-source community for inspiration and support. Let’s build something amazing together!

Happy coding! 🚀

