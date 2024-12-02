
# Alkimia Framework CLI

## Overview

The **Alkimia Framework CLI** is a command-line tool designed to enhance the development experience within the Alkimia framework. Alkimia is a JavaScript framework that strives to minimize abstraction, encouraging developers to work directly with JavaScript and the HTML DOM. Unlike frameworks such as React, Alkimia emphasizes simplicity and direct manipulation of the DOM, making it easier to build dynamic web applications without the overhead of heavy abstractions.

### Key Principles

- **Direct JavaScript Usage**: By advocating the closest usage of JavaScript, Alkimia minimizes syntactic sugar, such as classical object creation. This approach enhances transparency and simplicity in code.
- **Function Factory Approach**: The CLI generates modules that use the function factory pattern to expose public methods while keeping properties and methods private.
- **Singleton and Instance Constructors**: Each module provides both a singleton and an instance constructor, offering flexibility in managing unique and multiple instances as needed.
- **Encouraged Verbosity**: To further reduce abstractions, the framework encourages verbosity. This ensures that the code remains clear and understandable, even for complex applications.
- **View Module Creation**: The CLI offers the option to create modules that require a view. In such cases, HTML and SCSS placeholder files are added automatically. Additionally, a playground folder is included in each module, providing an introduction to the component's usage, including data binding.

### Features

- **Component Creation**: Effortlessly generate new components with predefined structures tailored to your project.
- **State Management**: Seamlessly integrate state management using Alkimia's built-in utilities.
- **Resource Management**: Efficiently import and manage various resources with ease.
## Features

- **Component Creation**: Easily generate new components with predefined structures.
- **State Management**: Utilize built-in state management utilities.
- **Resource Management**: Import and manage various resources with ease.
- **View Module Creation**: Create modules that require a view, including automatic generation of HTML and SCSS placeholder files and a playground folder for component usage and data binding.

## Directory Structure

```
alkimia-framework-cli/
├── apptest/
│   └── InputElement/
│       ├── InputElement.js
│       ├── InputElement.html
│       ├── InputElement.scss
│       └── playground/
│           ├── index.mjs
│           └── package.json
├── src/
│   ├── createComponent.js
│   ├── libs/
│       └── StatesFactory.js
│   └── makeResourcesImportable.js
├── cli.js
├── index.mjs
└── README.md
```

## Installation

To install the Alkimia Framework CLI, you need to have Node.js and npm installed on your machine. Then, run the following command:

```bash
npm install -g alkimia-framework-cli
```

## Usage

Usage instructions for the CLI tool go here. For example:

### Creating a New Component

To create a new component, run:

```bash
alkimia create-component <component-name>
```

### Managing States

Documentation for managing states using the `StatesFactory` utility.

### Importing Resources

Instructions for using the `makeResourcesImportable` function to manage your resources efficiently.

## Contributing

If you wish to contribute to the Alkimia Framework CLI, please follow the guidelines below:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Make your changes and commit them with descriptive messages.
4. Push your changes to your fork.
5. Create a pull request.

## Authors

- [InterSides (Marco Falsitta)](https://github.com/intersides) - *Initial work*

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

