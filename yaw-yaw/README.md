# datavis-portfolio-2016
Bocoup Datavis Portfolio Project 2016

# Installing

This project uses [Yarn](https://yarnpkg.com/en/docs/install) instead of npm. To install type:

```
yarn
```

# Development

All of the main code for development falls under the src directory. The following commands should be run from the root directory.

## Running the Server

To start a local development server at http://localhost:3000, run

```
yarn start
```

The server does hot reloading when CSS or JS changes. It is built with webpack, see the config directory for the webpack configuration.

## Building for Production

To build a production version, run

```
yarn build
```

## Running Tests

To test the app, run

```
yarn test
```

## Linting Code

To lint the code, run

```
yarn lint
```


## Running the data server

This app requests data from a small app server, currently expected to be running at http://localhost:5000. You can find the server in https://github.com/bocoup/datavis-portfolio-2016-data/tree/master/server instructions for its setup will be in that repo.

---

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
