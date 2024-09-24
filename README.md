# Smart Reviser

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
