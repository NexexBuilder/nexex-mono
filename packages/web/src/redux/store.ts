import {Dex} from '@nexex/api';
import {OrderbookWsClient} from '@nexex/orderbook-client';
import {connectRouter, routerMiddleware} from 'connected-react-router';
import {createBrowserHistory} from 'history';
import {
    applyMiddleware,
    compose,
    createStore,
    Middleware,
    StoreEnhancer
} from 'redux';
import {createEpicMiddleware, Epic} from 'redux-observable';
import storage from 'redux-storage';
import filter from 'redux-storage-decorator-filter';
// import createEngine from 'redux-storage-engine-indexed-db';
import {BehaviorSubject} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import epics from './epics';
import createEngine from './indexdb.storage';
import rootReducer from './reducers';
import {
    actionBlackList,
    actionWhiteList,
    filterBlackList,
    filterWhiteList
} from './storage';
// import ErrorReporter from './utils/errorReporter';

declare const process: any;
declare const module: any;
declare const require;

// const provider = new Web3.providers.HttpProvider(window.config.providers[0]);
// if (!(provider as any).sendAsync) {
//     (provider as any).sendAsync = provider.send;
// }
const epicMiddleware = createEpicMiddleware({
    dependencies: {
        dexPromise: Dex.create(window.config.dexConfig),
        obClient: new OrderbookWsClient({
            url: window.config.dexOrderbook.url
        })
    }
});

export const history = createBrowserHistory();

const errorLogger: Middleware = (/* store */) => next => action => {
    if (action.type && action.type.endsWith('_FAILED')) {
    }
    return next(action);
};

const reducer = storage.reducer(rootReducer);
const engine = filter(
    createEngine('nexex-web'),
    filterWhiteList,
    filterBlackList
);
const storageMiddleware = storage.createMiddleware(
    engine,
    actionBlackList,
    actionWhiteList
);
const enhancers: StoreEnhancer[] = [applyMiddleware(storageMiddleware)];

const middleware = [epicMiddleware, routerMiddleware(history), errorLogger];

const devToolEnhancer = [];

if (process.env.NODE_ENV === 'development') {
    const {devToolsExtension} = window;
    if (typeof devToolsExtension === 'function') {
        devToolEnhancer.push(devToolsExtension());
    }
}

const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers,
    ...devToolEnhancer
);

const store = createStore(
    connectRouter(history)(reducer),
    composedEnhancers as any
);

/** hot replacement of epic */
const epic$ = new BehaviorSubject(epics);
const hotReloadingEpic: Epic = (...args) =>
    epic$.pipe(
        switchMap((epic: any) => {
            return epic(...args);
        })
    );
epicMiddleware.run(hotReloadingEpic);

if ((module).hot) {
    (module).hot.accept('./epics', () => {
        const nextRootEpic = require('./epics').default;
        epic$.next(nextRootEpic);
    });
}

const load = storage.createLoader(engine);
load(store);

export default store;
