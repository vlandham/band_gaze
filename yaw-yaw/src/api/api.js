import fetch from 'isomorphic-fetch';

// TODO: Load as environment var
const HOST = 'http://localhost:5000';

// const publicRoot = process.env.{[Object]}  ;

/**
 * Returns data for all cities.
 * @return {String} city data in csv format
 */
export function getCityData() {
  const url = `${HOST}/place_data?normalized=true`;
  return fetch(url)
    .then((response) => {
      return response.text();
    });
}

/**
 * Return similar cities to a given named city.
 * @param  {String} placeId      e.g. boston-ma
 * @param  {Number} [num=10]     how many cities to return
 * @param  {Object} [weights={}] a weight to apply to each feature when calculating features
 * @return {Object[]}            an array of objects representing cities sorted by similarity
 */
export function getSimilarById(placeId, num = 11, weights = {}) {
  const wString = JSON.stringify(weights);
  const url = `${HOST}/similar_by_id?id=${placeId}&num=${num}&weights=${wString}`;
  return fetch(url)
    .then((response) => {
      return response.json();
    });
}

/**
 * [getSimilarByFeatures description]
 * @param  {Object} [features={}] key-value map of search features.
 * @param  {Number} [num=10]      how many cities to return
 * @param  {Object} [weights={}]  a weight to apply to each feature when calculating features
 * @return {Object[]}             an array of objects representing cities sorted by similarity
 */
export function getSimilarByFeatures(features = {}, num = 11, weights = {}) {
  const wString = JSON.stringify(weights);
  const fString = JSON.stringify(features);
  const url = `${HOST}/similar_by_features?features=${fString}&num=${num}&weights=${wString}`;
  return fetch(url)
    .then((response) => {
      return response.json();
    });
}

/**
 * Returns the cluster mapping for a set of features.
 * @return {Object} An object { clusters: [{ id: 0, cities: [cityId1, ...]}, ...] }
 */
export function getClusters(features) {
  const url = `${HOST}/clusters${features ? `?features=${JSON.stringify(features)}` : ''}`;
  return fetch(url)
    .then((response) => {
      return response.json();
    });
}
