/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-24T10:09:28+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: configureStore.js
 * @Last modified by:   xf
 * @Last modified time: 2017-07-25T13:59:54+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import {
  compose,
  createStore,
  applyMiddleware,
} from 'redux'
import thunk from 'redux-thunk'
import {
  createLogger,
} from 'redux-logger'
import rootReducer from './reducers'
import Immutable from 'immutable'
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './modules'

// config middleware redux-logger
// const stateTransformer = states => {
//   let finalStates = {};
//   for (let key in states) {
//     if (states.hasOwnProperty(key)) {
//       let state = states[key];
//       if (Immutable.Map.isMap(state)) {
//         finalStates[key] = state.toJS();
//       }
//     }
//   }
//   return finalStates;
// }
// const args = {
//   stateTransformer,
//   collapsed: true,
//   colors: {
//     title: () => `red`,
//     prevState: () => `blue`,
//     action: () => `orange`,
//     nextState: () => `green`,
//     error: () => `#F20404`
//   }
// }

const logger = createLogger(/*args*/)

const middlewares = [thunk]
// middlewares.push(logger)
middlewares.push(createEpicMiddleware(rootEpic));


function configureStore(initialState) {

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(...middlewares),
  );

  if (module.hot) {
    module.hot.accept(() => {
      const nextRootReducer = require('./reducers/index').default;
      store.replaceReducer(nextRootReducer);
    })
  }

  return store;
}

export default configureStore()
