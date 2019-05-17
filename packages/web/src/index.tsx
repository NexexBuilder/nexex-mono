import React from 'react';
import ReactDOM from 'react-dom';
import {hot} from 'react-hot-loader';
import {LocalizeProvider} from 'react-localize-redux';
import {Provider} from 'react-redux';
import {ConnectedRouter} from 'connected-react-router';
import App from './App';
import {default as store, history} from './redux/store';

declare let module: any;

const AppWithProviders = () => (
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <LocalizeProvider>
                <App/>
            </LocalizeProvider>
        </ConnectedRouter>
    </Provider>
);

const AppContainer = hot(module)(AppWithProviders);

const initRender = (): void => {
    ReactDOM.render(<AppContainer/>, document.getElementById('root'));
};

window.addEventListener('DOMContentLoaded', () => {
    initRender();
});
