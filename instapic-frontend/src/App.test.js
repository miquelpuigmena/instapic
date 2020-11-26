import React from "react";
import { ConnectedRouter as Router } from 'connected-react-router';

import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import store, {history} from './features/store';
import App from './App';


describe('Unit Test App', () => {
  it('Should render', () => {
    const {container} = render(
      <Provider store={store}>
        <Router history={history}>
          <App />
        </Router>
      </Provider>
    );
    expect(container.querySelectorAll('#app').length).toBe(1);
  });
});