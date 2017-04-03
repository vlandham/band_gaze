import React from 'react';
import ReactDOM from 'react-dom';

import store from './state/store';
import Root from './containers/Root';


ReactDOM.render(
  <Root store={store} />,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    const RootReloaded = require('./containers/Root').default; // eslint-disable-line global-require

    ReactDOM.render(
      <RootReloaded store={store} />,
      document.getElementById('root')
    );
  });
}
