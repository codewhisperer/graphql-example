import 'babel-polyfill';
import path from 'path';
import express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import ContextHolder from './core/ContextHolder';
import routes from './routes';
import PrettyError from 'pretty-error';
import assets from './assets';
import Html from './components/html';
import theme from './styles/theme.scss';
import constants from './constants/main';
import { port } from './config';
import { match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';
import { getStore } from './store';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import graphqlHTTP from 'express-graphql';
let testData = require('./content/users.json');

const server = global.server = express();
const currentNodeEnv = process.env.NODE_ENV;

// GraphQL
let userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString }
  }
});
let schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: userType,
        // `args` describes the arguments that the `user` query accepts
        args: {
          id: { type: GraphQLString }
        },
        // The resolve function describes how to "resolve" or fulfill
        // the incoming query.
        // In this case we use the `id` argument from above as a key
        // to get the User from `data`
        resolve: (_, args) => {
          return testData[args.id];
        }
      }
    }
  })
});

// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

// Register Node.js middleware
// -----------------------------------------------------------------------------
server.use(express.static(path.join(__dirname, 'public')));
server.use(cookieParser());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use('/graphql', graphqlHTTP({ schema, pretty: true }));

// create redux store
const store = getStore(true);

// Register server-side rendering middleware
// -----------------------------------------------------------------------------
server.get('*', async (req, res, next) => {
  try {
    match({ routes: routes(store), location: req.url }, (error, redirectLocation, renderProps) => {
      if (error) {
        throw error;
      }
      let statusCode = 200;
      const data = {
        title: '',
        description: '',
        css: '',
        body: '',
        entry: '',
        production: ''
      };
      const context = {
        constants,
        insertCss: styles => css.push(styles._getCss()),
        onSetTitle: value => (data.title = value),
        onSetMeta: (key, value) => (data[key] = value),
        onPageNotFound: () => (statusCode = 404)
      };

      data.body = ReactDOM.renderToString(
        <Provider store={store}>
          <ContextHolder context={context}>
            <RouterContext {...renderProps} />
          </ContextHolder>
        </Provider>
      );

      data.css = (currentNodeEnv === 'development') ? theme._getCss() : assets.main.css;
      data.entry = assets.main.js;
      data.production = (currentNodeEnv !== 'development');

      const html = ReactDOM.renderToStaticMarkup(<Html
        openTagUrl={constants.openTagUrl}
        bvJsApiUrl={constants.bvJsApiUrl}
        dtmUrl={constants.dtmUrl} {...data} />);

      res.status(statusCode);
      res.send(`<!doctype html>\n${html}`);
    });
  } catch (err) {
    next(err);
  }
});

// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

server.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.log(pe.render(err)); // eslint-disable-line no-console
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.send(`<!doctype html>\n${err.message}`);
});

// Launch the server
// -----------------------------------------------------------------------------
server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://localhost:${port}/`);
});
