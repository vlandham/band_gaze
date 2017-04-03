import { combineReducers } from 'redux';

import clustersReducer from '../reducers/clusters';
import sharedReducer from '../reducers/shared';
import similarCitiesReducer from '../reducers/similarCities';

export default combineReducers({
  clusters: clustersReducer,
  shared: sharedReducer,
  similarCities: similarCitiesReducer,
});
