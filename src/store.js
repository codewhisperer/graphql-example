import ReduxThunk from 'redux-thunk';
import persistState from 'redux-localstorage';
import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { queryReducer } from './reducers/dataRequest.reducer';

export function getStore(server = false) {
  let storeEnhancer;

  if (server) {
    storeEnhancer = compose(applyMiddleware(ReduxThunk));
  } else {
    storeEnhancer = compose(
      applyMiddleware(ReduxThunk),
      persistState(),
      // chrome debugger
      typeof window === 'object' && typeof window.devToolsExtension !== 'undefined'
        ? window.devToolsExtension()
        : f => f
    );
  }

  // create redux store adding localStorage persistence
  const combinedReducers = combineReducers({
    query: queryReducer
  });

  return createStore(combinedReducers, storeEnhancer);
}
