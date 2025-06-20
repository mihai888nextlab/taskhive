<div id="top">

<!-- HEADER STYLE: CLASSIC -->
<div align="center">


# TASKHIVE

<em>Empowering Teams to Achieve More, Faster</em>

<!-- BADGES -->
<img src="https://img.shields.io/github/last-commit/mihai888nextlab/taskhive?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/mihai888nextlab/taskhive?style=flat&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/mihai888nextlab/taskhive?style=flat&color=0080ff" alt="repo-language-count">

<em>Built with the tools and technologies:</em>

<img src="https://img.shields.io/badge/JSON-000000.svg?style=flat&logo=JSON&logoColor=white" alt="JSON">
<img src="https://img.shields.io/badge/Markdown-000000.svg?style=flat&logo=Markdown&logoColor=white" alt="Markdown">
<img src="https://img.shields.io/badge/Socket.io-010101.svg?style=flat&logo=socketdotio&logoColor=white" alt="Socket.io">
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">
<img src="https://img.shields.io/badge/Autoprefixer-DD3735.svg?style=flat&logo=Autoprefixer&logoColor=white" alt="Autoprefixer">
<img src="https://img.shields.io/badge/Mongoose-F04D35.svg?style=flat&logo=Mongoose&logoColor=white" alt="Mongoose">
<img src="https://img.shields.io/badge/PostCSS-DD3A0A.svg?style=flat&logo=PostCSS&logoColor=white" alt="PostCSS">
<img src="https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black" alt="JavaScript">
<img src="https://img.shields.io/badge/PrimeReact-03C4E8.svg?style=flat&logo=PrimeReact&logoColor=white" alt="PrimeReact">
<br>
<img src="https://img.shields.io/badge/React-61DAFB.svg?style=flat&logo=React&logoColor=black" alt="React">
<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/tsnode-3178C6.svg?style=flat&logo=ts-node&logoColor=white" alt="tsnode">
<img src="https://img.shields.io/badge/ESLint-4B32C3.svg?style=flat&logo=ESLint&logoColor=white" alt="ESLint">
<img src="https://img.shields.io/badge/Socket-C93CD7.svg?style=flat&logo=Socket&logoColor=white" alt="Socket">
<img src="https://img.shields.io/badge/datefns-770C56.svg?style=flat&logo=date-fns&logoColor=white" alt="datefns">
<img src="https://img.shields.io/badge/Chart.js-FF6384.svg?style=flat&logo=chartdotjs&logoColor=white" alt="Chart.js">
<img src="https://img.shields.io/badge/Jest-C21325.svg?style=flat&logo=Jest&logoColor=white" alt="Jest">

</div>
<br>

---

## 📄 Table of Contents

- [Overview](#-overview)
- [Getting Started](#-getting-started)
    - [Prerequisites](#-prerequisites)
    - [Installation](#-installation)
    - [Usage](#-usage)
    - [Testing](#-testing)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Roadmap](#-roadmap)
- [Acknowledgment](#-acknowledgment)

---

## ✨ Overview

TaskHive is a comprehensive, scalable web platform designed to enhance team collaboration, organization, and task management through hierarchical structures, real-time communication, and AI-driven features. Built with Next.js, React, and MongoDB, it provides a robust foundation for managing complex workflows and organizational roles.

**Why TaskHive?**

This project empowers developers to build dynamic, multi-tenant applications with features like role-based access control, organizational visualization, and seamless communication. The core features include:

- 🎯 **🧩 Role & Organization Management:** Define and visualize hierarchical roles with dynamic organizational charts.
- 🚀 **🌐 Real-Time Communication:** Enable instant messaging and live chat for team collaboration.
- 🤖 **🧠 AI Integration:** Leverage Google Gemini AI for natural language task processing and automation.
- 📊 **📁 Data & File Management:** Handle files, announcements, and structured data models efficiently.
- ⚙️ **🔧 Modular & Extensible Architecture:** Built with modern tools supporting customization and scalability.

---

## 📌 Features

|      | Component            | Details                                                                                     |
| :--- | :------------------- | :------------------------------------------------------------------------------------------ |
| ⚙️  | **Architecture**     | <ul><li>Next.js framework for server-side rendering and static site generation</li><li>TypeScript for type safety</li><li>Modular folder structure separating components, pages, and services</li></ul> |
| 🔩 | **Code Quality**     | <ul><li>ESLint configured with Next.js recommended rules</li><li>Prettier for code formatting</li><li>TypeScript strict mode enabled</li></ul> |
| 📄 | **Documentation**    | <ul><li>README.md with project overview and setup instructions</li><li>Inline JSDoc comments for functions and components</li><li>Generated API docs via TypeDoc (implied)</li></ul> |
| 🔌 | **Integrations**     | <ul><li>Amazon S3 via '@aws-sdk/client-s3' and '@aws-sdk/s3-request-presigner' for file storage</li><li>Socket.io for real-time communication</li><li>PrimeReact and TailwindCSS for UI components and styling</li><li>JWT and 'jsonwebtoken' for authentication</li></ul> |
| 🧩 | **Modularity**       | <ul><li>Component-based React architecture with reusable components</li><li>Separation of concerns between API handlers, UI, and services</li><li>Use of hooks for state and side effects</li></ul> |
| 🧪 | **Testing**          | <ul><li>Jest and '@testing-library/react' for unit and integration tests</li><li>Mocking with 'identity-obj-proxy'</li><li>Tests cover components, hooks, and API interactions</li></ul> |
| ⚡️  | **Performance**      | <ul><li>Next.js static generation and server-side rendering optimize load times</li><li>Code splitting via dynamic imports</li><li>Image optimization with Next/Image (implied)</li></ul> |
| 🛡️ | **Security**         | <ul><li>JWT tokens for authentication and authorization</li><li>Secure cookie handling with 'nookies'</li><li>Input validation and sanitization implied via TypeScript and ESLint</li></ul> |
| 📦 | **Dependencies**     | <ul><li>Core dependencies include React, Next.js, TypeScript, TailwindCSS, PrimeReact</li><li>Supporting libraries: socket.io, bcryptjs, uuid, chart.js, mongoose</li><li>Dev dependencies for testing, linting, and build tools</li></ul> |

---

## 📁 Project Structure

```sh
└── taskhive/
    ├── README.md
    ├── eslint.config.mjs
    ├── next.config.ts
    ├── orgchart-payload.json
    ├── orgchart-with-admin.json
    ├── orgchart.json
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.mjs
    ├── public
    │   ├── favicon.ico
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── logo.png
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    ├── src
    │   ├── components
    │   ├── db
    │   ├── pages
    │   ├── styles
    │   ├── types
    │   └── utlis
    └── tsconfig.json
```

---

## 🚀 Getting Started

### 📋 Prerequisites

This project requires the following dependencies:

- **Programming Language:** TypeScript
- **Package Manager:** Npm

### ⚙️ Installation

Build taskhive from the source and install dependencies:

1. **Clone the repository:**

    ```sh
    ❯ git clone https://github.com/mihai888nextlab/taskhive
    ```

2. **Navigate to the project directory:**

    ```sh
    ❯ cd taskhive
    ```

3. **Install the dependencies:**

**Using [npm](https://www.npmjs.com/):**

```sh
❯ npm install
```

### 💻 Usage

Run the project with:

**Using [npm](https://www.npmjs.com/):**

```sh
npm start
```

### 🧪 Testing

Taskhive uses the {__test_framework__} test framework. Run the test suite with:

**Using [npm](https://www.npmjs.com/):**

```sh
npm test
```
---