import { newState } from '../util/reducer';

import {
  CLEAR_SIMILAR_CITIES,
  FETCH_SIMILAR_BY_ID,
  FETCH_SIMILAR_BY_ID_SUCCESS,
  FETCH_SIMILAR_BY_ID_FAILURE,
  FETCH_SIMILAR_BY_FEATURES,
  FETCH_SIMILAR_BY_FEATURES_SUCCESS,
  FETCH_SIMILAR_BY_FEATURES_FAILURE,
} from '../actions/actions';


const INITIAL_STATE = newState({
  // Map + Cluster state
  isFetching: false,
  currSeq: Number.NEGATIVE_INFINITY,
  // TODO: Possibly fetch from server via an action
  cityFeatures: [
    // Census Based
    { id: 'pop', label: 'Population' },
    { id: 'transport_publictrans', label: 'Public Transport' },
    { id: 'median_property_value', label: 'Property Value' },
    { id: 'non_eng_speakers_pct', label: 'Non Engl Speakers' },
    { id: 'age', label: 'Median Age' },

    // POI Based
    { id: 'entertainment', label: 'Entertainment' },
    { id: 'education', label: 'Education' },
    { id: 'nature', label: 'Nature' },
  ],
  // Map mode
  similarCities: [],
  searchId: undefined,
  searchVector: {},
  searchWeights: {},
});

export default function reducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case CLEAR_SIMILAR_CITIES:
      return newState(state, {
        isFetching: false,
        similarCities: [],
        searchId: undefined,
      });
    case FETCH_SIMILAR_BY_ID:
      // These are dispatched synchronously in order
      return newState(state, {
        isFetching: true,
        currSeq: action.seq,
        // optimistic update to show current city
        similarCities: [action.payload.city],
      });
    case FETCH_SIMILAR_BY_ID_SUCCESS:
      if (action.seq >= state.currSeq) {
        return newState(state, {
          similarCities: action.payload.res,
          searchWeights: action.payload.q.weights,
          searchId: action.payload.q.id,
          searchVector: action.payload.q.features,
          isFetching: false,
        });
      }
      return state;
    case FETCH_SIMILAR_BY_ID_FAILURE:
      return newState(state, {
        isFetching: false,
        similarCities: [],
      });

    case FETCH_SIMILAR_BY_FEATURES:
      // These are dispatched synchronously in order
      return newState(state, { isFetching: true, currSeq: action.seq });
    case FETCH_SIMILAR_BY_FEATURES_SUCCESS:
      if (action.seq >= state.currSeq) {
        return newState(state, {
          similarCities: action.payload.res,
          searchWeights: action.payload.q.weights,
          searchVector: action.payload.q.features,
          searchId: undefined,
          isFetching: false,
        });
      }
      return state;
    case FETCH_SIMILAR_BY_FEATURES_FAILURE:
      return newState(state, {
        isFetching: false,
        similarCities: [],
      });

    default:
      return state;
  }
}
