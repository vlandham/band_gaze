import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from './containers/App';
import ParticlesSandbox from './containers/ParticlesSandbox';
import Explore from './containers/Explore';
import HomePage from './containers/HomePage';

export default () => (
  /**
   * Please keep routes in alphabetical order
   */
  <Route path="/" component={App}>
    { /* Home (main) route */ }
    <IndexRoute component={HomePage} />

    { /* Explore view route */ }
    <Route path="/explore" component={Explore} />

    <Route path="/particles" component={ParticlesSandbox} />


    { /* Catch all route (typically for 404) */ }
    <Route path="*" component={HomePage} />
  </Route>
);
