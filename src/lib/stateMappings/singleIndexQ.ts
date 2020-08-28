import { StateMapping, IndexUiState } from '../../types';

function getIndexStateWithoutConfigure(uiState: IndexUiState): IndexUiState {
  const { configure, ...trackedUiState } = uiState;
  return trackedUiState;
}

export default function singleIndexQStateMapping(
  indexName: string
): StateMapping {
  return {
    stateToRoute(uiState) {
      const state = uiState[indexName] || {};
      if (state.query) {
        state.q = state.query;
        delete state.query;
      }
      return getIndexStateWithoutConfigure(state);
    },
    routeToState(routeState = {}) {
      const state = routeState;
      if (state.q) {
        state.query = state.q;
        delete state.q;
      }
      return {
        [indexName]: getIndexStateWithoutConfigure(state),
      };
    },
  };
}
