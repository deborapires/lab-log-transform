### LAB LOG TRANSFORM

## Description

Project responsible for importing and processing customer order data. Developed with the NestJs framework in the TypeScript language. A txt file is expected, which is read, parsed and the data is persisted in a PostgreSQL database. Data that can later be consulted is made available by some filters, with the return in JSON. Data import and reading are performed through the provided endpoints (GET/POST).

## Project setup

```bash
$ npm install
```

## Compile and run the project local

```bash

# run db
$ npm run start:db

# run docker
$ npm run docker:up

# run application 
$ npm run start

```

## Swagger 
```bash

POST /user-orders
GET /user-orders

# localhost:3000/api#

```

## Run tests

```bash
# unit tests
$ npm run test

# test coverage
$ npm run test:cov

# e2e tests
$ npm run test:e2e
```
