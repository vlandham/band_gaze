import React, { PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { configureUrlQuery } from 'react-url-query';
import routes from '../routes';

import '../assets/base.scss';

// enable debug mode globals while developing
if (process.env.NODE_ENV === 'development') {
  window.Perf = require('react-addons-perf'); // eslint-disable-line
  // for debug convenience
  window.d3 = require('d3').default; // eslint-disable-line
}

// set-up react-url-query
configureUrlQuery({ history: browserHistory });

const Root = ({ store }) => (
  <Provider store={store}>
    <Router history={browserHistory}>
      {routes()}
    </Router>
  </Provider>
);

Root.propTypes = {
  store: PropTypes.object,
};

export default Root;
