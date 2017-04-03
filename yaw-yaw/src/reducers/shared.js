import { newState } from '../util/reducer';

import {
  FETCH_CITY_DATA,
  FETCH_CITY_DATA_SUCCESS,
  FETCH_CITY_DATA_FAILURE,
} from '../actions/actions';


const INITAL_STATE = newState({
  // Map + Cluster state
  isFetching: false,
  currSeq: Number.NEGATIVE_INFINITY,
  cityData: {},
});

export default function reducer(state = INITAL_STATE, action) {
  switch (action.type) {
    case FETCH_CITY_DATA:
      // These are dispatched synchronously in order
      return newState(state, { isFetching: true, currSeq: action.seq });
    case FETCH_CITY_DATA_SUCCESS:
      if (action.seq >= state.currSeq) {
        return newState(state, {
          cityData: action.payload,
          isFetching: false,
        });
      }
      return state;
    case FETCH_CITY_DATA_FAILURE:
      return newState(state, {
        isFetching: false,
        similarCities: [],
      });

    default:
      return state;
  }
}
