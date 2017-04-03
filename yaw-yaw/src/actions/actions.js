//
//  Action Creators
//

import * as d3 from 'd3';
import { nextSeq } from '../util/number';

import {
  getSimilarById,
  getSimilarByFeatures,
  getCityData,
  getClusters,
} from '../api/api';

export const CLEAR_SIMILAR_CITIES = 'CLEAR_SIMILAR_CITIES';

export const FETCH_SIMILAR_BY_FEATURES = 'FETCH_SIMILAR_BY_FEATURES';
export const FETCH_SIMILAR_BY_FEATURES_SUCCESS = 'FETCH_SIMILAR_BY_FEATURES_SUCCESS';
export const FETCH_SIMILAR_BY_FEATURES_FAILURE = 'FETCH_SIMILAR_BY_FEATURES_FAILURE';

export const FETCH_SIMILAR_BY_ID = 'FETCH_SIMILAR_BY_ID';
export const FETCH_SIMILAR_BY_ID_SUCCESS = 'FETCH_SIMILAR_BY_ID_SUCCESS';
export const FETCH_SIMILAR_BY_ID_FAILURE = 'FECTH_SIMILAR_BY_ID_FAILURE';

export const FETCH_CITY_DATA = 'FETCH_CITY_DATA';
export const FETCH_CITY_DATA_SUCCESS = 'FETCH_CITY_DATA_SUCCESS';
export const FETCH_CITY_DATA_FAILURE = 'FETCH_CITY_DATA_FAILURE';


export const FETCH_CLUSTERS = 'FETCH_CLUSTERS';
export const FETCH_CLUSTERS_SUCCESS = 'FETCH_CLUSTERS_SUCCESS';
export const FETCH_CLUSTERS_FAILURE = 'FETCH_CLUSTERS_FAILURE';

/**
 * Does a bulk fetch of data associated with cities.
 *
 * Should be triggered once near the start of the application.
 * @return {Object} map of city ids to city data.
 */
export function fetchCityData() {
  const type = FETCH_CITY_DATA;

  return (dispatch, getState) => {
    const seq = nextSeq();
    const state = getState();
    if (Object.keys(state.shared.cityData).length > 0) {
      // We only need to get this once.
      dispatch({ type: FETCH_CITY_DATA_SUCCESS, payload: state.shared.cityData, seq });
    } else {
      dispatch({ type, payload: {}, seq });

      getCityData()
        .then((payload) => {
          const rowsArr = d3.csvParse(payload, (row) => {
            return {
              id: row.id,
              city: row.city,
              state: row.state,
              lat: +row.lat,
              lon: +row.lon,
              pop: +row.pop,
              median_property_value: +row.median_property_value,
              non_eng_speakers_pct: +row.non_eng_speakers_pct,
              age: +row.age,
              entertainment: +row.entertainment,
              education: +row.education,
              transport_publictrans: +row.transport_publictrans,
              nature: +row.nature,
            };
          });

          const idToCity = rowsArr.reduce((memo, obj) => {
            memo[obj.id] = obj;
            return memo;
          }, {});

          dispatch({ type: FETCH_CITY_DATA_SUCCESS, payload: idToCity, seq });
        }, (error) => {
          dispatch({ type: FETCH_CITY_DATA_FAILURE, error, seq });
        });
    }
  };
}

/**
 * Clear similar cities
 */
export function clearSimilarCities() {
  const type = CLEAR_SIMILAR_CITIES;
  return { type };
}

/**
 * Find similar cities to a given target id.
 * @param {String} placeId e.g. boston-ma
 * @param {Number} num     Number of similar cities to find
 * @param {Object} weights feature weight map
 */
export function fetchSimilarById(placeId, weights, num) {
  const type = FETCH_SIMILAR_BY_ID;
  const seq = nextSeq();

  return (dispatch, getState) => {
    const city = getState().shared.cityData[placeId];
    dispatch({ type, payload: { city }, seq });

    // Request data
    getSimilarById(placeId, num, weights)
      .then((payload) => {
        const cityData = getState().shared.cityData;
        payload.res = payload.res.map(r => Object.assign(r, cityData[r.id]));

        dispatch({ type: FETCH_SIMILAR_BY_ID_SUCCESS, payload, seq });
      }, (error) => {
        dispatch({ type: FETCH_SIMILAR_BY_ID_FAILURE, error, seq });
      });
  };
}

/**
 * Find cities similar to a given feature vector
 * @param {Object} features key value map of feature names to values
 * @param {Number} num      Number of similar cities to find
 * @param {Object} weights  feature weight map
 */
export function fetchSimilarByFeatures(features, weights, num) {
  const type = FETCH_SIMILAR_BY_FEATURES;
  const seq = nextSeq();

  return (dispatch, getState) => {
    dispatch({ type, payload: {}, seq });

    // Request data
    getSimilarByFeatures(features, num, weights)
      .then((payload) => {
        const cityData = getState().shared.cityData;
        payload.res = payload.res.map(r => Object.assign(r, cityData[r.id]));

        dispatch({ type: FETCH_SIMILAR_BY_FEATURES_SUCCESS, payload, seq });
      }, (error) => {
        dispatch({ type: FETCH_SIMILAR_BY_FEATURES_FAILURE, error, seq });
      });
  };
}


/**
 * Fetches the mapping of clusters for a given set of features
 * If no features are provided, it will get for all of them.
 *
 * @return {Object[]} Array of { id: 0, cities: [cityId1, cityId2] }
 *   representing clusters.
 */
export function fetchClusters(features) {
  const type = FETCH_CLUSTERS;

  return (dispatch, getState) => {
    const seq = nextSeq();
    const state = getState();
    // Check if we need to fetch this data or not:
    // - do we have it already for the selected query features?
    const shouldFetchClusters = !state.clusters.clusters.length || state.clusters.features !== features;

    if (shouldFetchClusters) {
      dispatch({ type, payload: { features }, seq });

      getClusters(features)
        .then((payload) => {
          // NOTE: We could eventually expand these here to contain references to the
          // city objects if it is helpful.
          const clusters = payload.clusters;

          dispatch({ type: FETCH_CLUSTERS_SUCCESS, payload: { clusters, features }, seq });
        }, (error) => {
          dispatch({ type: FETCH_CLUSTERS_FAILURE, error, seq });
        });
    }
  };
}
