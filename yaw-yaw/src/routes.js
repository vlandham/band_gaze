import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from './containers/App';
import HomePage from './containers/HomePage';

export default () => (
  /**
   * Please keep routes in alphabetical order
   */
  <Route path="/" component={App}>
    { /* Home (main) route */ }
    <IndexRoute component={HomePage} />


    { /* Catch all route (typically for 404) */ }
    <Route path="*" component={HomePage} />
  </Route>
);
