import {createSelector} from 'reselect';
import {ExchangeState} from '../reducers/exchange.reducer';
import {getSelectedMarket} from './index';

export const allEvents = (state) => (state.exchange as ExchangeState).events;

export const getLogFillEvents = createSelector(
    [getSelectedMarket, allEvents],
    (selectedMarket, events) => {
        const marketEvents = events[selectedMarket.marketId] || {fillEvents: []};
        return marketEvents.fillEvents;
    }
);
