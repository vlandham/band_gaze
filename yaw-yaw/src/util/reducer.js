import { deepFreeze } from './object';

export function newState(...partialStates) {
  return deepFreeze(Object.assign.apply(null, [{}].concat(partialStates)));
}
