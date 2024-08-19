# GraphQL JWT Auth with NestJS

## Requirements

- __Node JS__ (Latest Version)
- __MySQL Server__

## Install All Dependencies

```bash
$ npm install
```

## Setup Environment
- Copy file name of '.env.example' to '.env'
- You can change the environment contents according to your preferences.

## Setup Database
Create database named 'graphql_jwt_auth' or as you had been defined in '.env'

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## GraphQL Playground
Open `https://localhost:{APP_PORT}/graphql`
## Test

```bash
# e2e tests
$ npm run test:e2e
```