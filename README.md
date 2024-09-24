## Introduction

This is a simple app that's meant to help you revise. It is created with React,
Next.js, SCSS, Chakra UI, and AWS Amplify on the backend.

## Getting Started

Clone the project however you want to, either by running `git clone` directly on
this repo, or forking it and then cloning that instead.

You have to clone both the project source code AND the structure of your AWS
resources to their own account. For this, you can run the following command and
pass in your github URL e.g [this repo's
URL](https://github.com/abdulramon-jemil/smart-reviser):

```bash
amplify init --app <YOUR_GITHUB_URL>
amplify push
```

You also need to set up the prompts used to generate the quizzes on MindsDB. For
this, you have to create a MindsDB account, and run the sql query in the
`src/quiz-gen-prompt.sql` in their SQL editor to create the model. After this
completes successfully, you can go on to start the Next.js development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

## Environment Variables

For this project to work correctly, you have to supply the required environment
variables. An example can be found in `.env.example` in the root of the project.
Use [Next.js
patterns](https://nextjs.org/docs/basic-features/environment-variables) for the
`.env` file.

## Tech Stack

This project uses the following technologies:

- Next.js
- AWS Amplify
- SCSS
- MindsDB

## Contributing

This project is currently not accepting contributions.

---

---

---

---

---

---

# Smart Reviser

## Introduction

**Smart Reviser** is a web application designed to enhance the revision
experience for users. Built with **React**, **Next.js**, **SCSS**, **Chakra UI**
for the frontend, and **AWS Amplify** for the backend, the app features core
functionalities such as user authentication, lesson creation, and lesson
revision. However, it is important to note that this project is **fully
abandoned** and not intended for future updates. The user interface is
unpolished, and the project remains incomplete.

## Current Features

- **User Authentication**: Fully operational sign-in and sign-up functionality.
- **Lesson Management**: Ability to create and revise lessons.

### Planned but Not Implemented

Several features were intended to be included but remain incomplete:

- Lesson deletion and additional management features.
- Comprehensive account management functionalities.
- Enhanced user experience features.

## Getting Started

To get started with the project, clone it using either of the following methods:

1. Run `git clone` directly on this repository.
2. Fork the repository and clone your fork.

After cloning, set up the AWS resources associated with this project by running
the following commands. Replace `<YOUR_GITHUB_URL>` with your GitHub URL (e.g.,
[this repo's URL](https://github.com/abdulramon-jemil/smart-reviser)):

```bash
amplify init --app <YOUR_GITHUB_URL>
amplify push
```

You also need to configure the prompts used to generate quizzes in MindsDB.
Follow these steps:

1. Create a MindsDB account.
2. Run the SQL query found in src/quiz-gen-prompt.sql in the MindsDB SQL editor
   to create the model. Once this is complete, start the Next.js development
   server:
   ```bash
   npm run dev
   ```

Then, open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

To run this project correctly, you will need to provide the necessary
environment variables. An example configuration can be found in `.env.example`
located in the root of the project. Please refer to the [Next.js
documentation](https://nextjs.org/docs/basic-features/environment-variables) for
guidance on setting up your `.env` file.

## Tech Stack

This project utilizes the following technologies:

- **Next.js**
- **AWS Amplify**
- **SCSS**
- **MindsDB**

## Contributing

This project is currently not accepting contributions.

## Note

Please note that this project is fully abandoned. While it contains functional
components, significant portions of the planned features and enhancements are
incomplete, and there will be no future updates or maintenance.
