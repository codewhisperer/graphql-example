import React from 'react';
import { IndexRoute, Route } from 'react-router';
import App from './components/app';
import Users from './pages/users';

export default () => {
  return (
    <Route>
      <Route path="/" component={App}>
        <IndexRoute component={Users} />
      </Route>
      <Route path="*" component={Users} />
    </Route>
  );
};
