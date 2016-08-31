import 'babel-polyfill';
import React from 'react';
import localStorage from 'localStorage';
import FastClick from 'fastclick';
import ContextHolder from './core/ContextHolder';
import theme from './styles/theme.scss';
import constants from './constants/main';
import routes from './routes';
import { Router, browserHistory, applyRouterMiddleware } from 'react-router';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { getStore } from './store';
import useScroll from 'react-router-scroll';

let cssContainer = document.getElementById('css');
const appContainer = document.getElementById('app');
const currentNodeEnv = process.env.NODE_ENV;

// This is need here so AdobeDTM can use it for tracking
window.jQuery = require('jquery');

// `WindowBase64.btoa()` polyfill
if (typeof window.btoa === 'undefined') {
  window.btoa = require('btoa');
}

// get redux store
const store = getStore();

const context = {
  constants,
  insertCss: styles => styles._insertCss(),
  onSetTitle: value => (document.title = value),
  onSetMeta: (name, content) => {
    // Remove and create a new <meta /> tag in order to make it work
    // with bookmarks in Safari
    const elements = document.getElementsByTagName('meta');
    Array.from(elements).forEach((element) => {
      if (element.getAttribute('name') === name) {
        element.parentNode.removeChild(element);
      }
    });
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    document
      .getElementsByTagName('head')[0]
      .appendChild(meta);
  }
};

function run() {
  // Make taps on links and buttons work fast on mobiles
  FastClick.attach(document.body);

  // const {pathname, search, hash} = window.location;
  // const location = `${pathname}${search}${hash}`;

  // loading CSS for dev mode
  if (currentNodeEnv === 'development') {
    theme._insertCss();
    localStorage.setItem('debug', true);
  }

  function customScrollBehavior(prevLoc, loc) {
    let query = loc.location.query,
      scrollToCoord = [0, 0],
      hasScrollToBrand = loc.routes.some(route => { return route.scrollToBrand; });

    if (hasScrollToBrand && query.hasOwnProperty('brand')) {
      let el = document.getElementById(query.brand),
        top = el.getBoundingClientRect().top;
      scrollToCoord = [0, top];
      return scrollToCoord;
    }

    if (prevLoc && prevLoc.pathname === loc.pathname) {
      return false;
    }

    return scrollToCoord;
  }

  render(
    <Provider store={store}>
      <ContextHolder context={context}>
        <Router
          history={browserHistory}
          routes={routes(store)}
          render={applyRouterMiddleware(useScroll(customScrollBehavior))}
        />
      </ContextHolder>
    </Provider>,
    appContainer
  );
  // Remove the pre-rendered CSS because it's no longer used
  // after the React app is launched
  // This is for DEV mode only since we generate a css file in production
  if (cssContainer && currentNodeEnv === 'development') {
    cssContainer.parentNode.removeChild(cssContainer);
    cssContainer = null;
  }
}

// Run the application when both DOM is ready and page content is loaded
if (['complete', 'loaded', 'interactive'].includes(document.readyState) && document.body) {
  run();
} else {
  document.addEventListener('DOMContentLoaded', () => {
    run();
  }, false);
}
