# Contribution Guide

Thank you for considering contributing to the Dockmate project! Your help is greatly appreciated. Please follow the guidelines below to ensure a smooth contribution process.

## Getting Started

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
## How to contribute

1. **Fork the repository**: Create a personal fork of the project on GitHub.
2. **Clone the repository**: Clone your fork to your local machine.
    ```sh
    git clone https://github.com/your-username/Dockmate.git
    ```
3. **Create a branch**: Create a new branch for your work.
    ```sh
    git checkout -b feature/your-feature-name
    ```

## Making Changes

1. **Code style**: Ensure your code adheres to the project's coding standards.
2. **Write tests and Run Tests**: Add tests for your changes to ensure they work as expected and test your changes locally to make sure nothing breaks.
3. **Commit messages**: Write clear and concise commit messages.
    ```sh
    git commit -m "Add feature X"
    ```

## Submitting Changes

1. **Push your branch**: Push your changes to your fork on GitHub.
    ```sh
    git push origin feature/your-feature-name
    ```
2. **Create a pull request**: Open a pull request from your branch to the main repository. Provide a detailed description of your changes and Reference any related issues using keywords like ```Closes #issue-number``` .
3. **Review process**: Be responsive to feedback and make necessary changes.

## Do's and Don'ts

### Do's
- Always run npm install after pulling the latest changes.
- Use the interactive mode if you’re unsure about Docker configurations.
- Follow the contribution guidelines for pull requests.
- Test your changes thoroughly before submitting.
- Do follow the coding standards and guidelines.
- Do write clear and concise commit messages.
- Do write tests for your changes.
- Do keep your pull requests focused and small.
- Do be respectful and considerate in your communication.

### Don'ts
- Don’t hardcode paths or sensitive data into the project.
- Avoid making breaking changes without discussing them in an issue or pull request.
- Don’t ignore linting errors; ensure your code adheres to the project’s style guide.
- Don't submit untested code.
- Don't make unrelated changes in a single pull request.
- Don't ignore feedback from reviewers.
- Don't use offensive or inappropriate language.


### Need Help?
Feel free to open an issue or reach out to us if you’re stuck or have questions. We’re here to help!
Thank you for contributing to Dockmate and helping us make Docker management easier for everyone. 🚀

Let me know if you’d like to tweak this further! 😊
