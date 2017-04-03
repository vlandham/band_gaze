import { newState } from '../util/reducer';

import {
  FETCH_CLUSTERS,
  FETCH_CLUSTERS_SUCCESS,
  FETCH_CLUSTERS_FAILURE,
} from '../actions/actions';


const INITAL_STATE = newState({
  // Map + Cluster state
  isFetching: false,
  currSeq: Number.NEGATIVE_INFINITY,
  clusters: [],
  features: null,
});

export default function reducer(state = INITAL_STATE, action) {
  switch (action.type) {
    case FETCH_CLUSTERS:
      // These are dispatched synchronously in order
      return newState(state, {
        isFetching: true,
        currSeq: action.seq,
        features: action.payload.features,
      });
    case FETCH_CLUSTERS_SUCCESS:
      if (action.seq >= state.currSeq) {
        return newState(state, {
          clusters: action.payload.clusters,
          features: action.payload.features,
          isFetching: false,
        });
      }
      return state;
    case FETCH_CLUSTERS_FAILURE:
      return newState(state, {
        isFetching: false,
        clusters: [],
        features: null,
      });

    default:
      return state;
  }
}
