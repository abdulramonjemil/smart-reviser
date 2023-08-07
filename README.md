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
