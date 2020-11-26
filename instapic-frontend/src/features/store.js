import { applyMiddleware } from '@reduxjs/toolkit';
import { combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware, connectRouter } from 'connected-react-router';
import { createLogger } from 'redux-logger';
import { createBrowserHistory } from 'history';

import {signupReducer} from './Signup';
import {loginReducer} from './Login';
import {authReducer} from './Auth';
import {uploadReducer} from './Upload';


export const history = createBrowserHistory();
const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  signup: signupReducer,
  login: loginReducer,
  auth: authReducer,
  upload: uploadReducer,
});

let MWs = [thunk, routerMiddleware(history)]
if (process.env.NODE_ENV == 'development') {
  const loggerMiddleware = createLogger();
  MWs = [...MWs, loggerMiddleware]
}

export default createStore(
  createRootReducer(history), 
  applyMiddleware(...MWs)
);