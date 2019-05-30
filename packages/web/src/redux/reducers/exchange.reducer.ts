import update from 'immutability-helper';
import * as R from 'ramda';
import {handleActions} from 'redux-actions';
import {LogFillEvent} from '../../types';
import {EventMergeAction, EventSyncFinishAction, ExchangeActionType} from '../actions/exchange.action';

export interface ExchangeState {
    events: {
        [marketId: string]: {
            fillEvents: LogFillEvent[];
            lastBlock: number;
        }
    }
}

const defaultState: ExchangeState = {
    events: {}
};

export default handleActions<ExchangeState, any>(
    {
        [ExchangeActionType.EVENT_MERGE]: (state, action: EventMergeAction) => {
            const {events, marketId} = action.payload;
            const marketEvents = state.events[marketId] || {fillEvents: []};
            const merged = R.compose(
                R.uniqBy<LogFillEvent, string>(R.prop('id')),
                R.sortWith([R.descend(R.prop('blockNumber'))])
            )(R.concat(events, marketEvents.fillEvents));
            if (state.events[marketId]) {
                return update(state, {
                    events: {
                        [marketId]: {
                            fillEvents: {$set: merged}
                        }
                    }
                });
            } else {
                return update(state, {
                    events: {
                        [marketId]: {
                            $set: {fillEvents: merged, lastBlock: 1}
                        }
                    }
                });
            }
        },
        [ExchangeActionType.EVENT_SYNC_FINISH]: (state, action: EventSyncFinishAction) => {
            const {marketId, startBlock} = action.payload;
            if (state.events[marketId]) {
                return update(state, {
                    events: {
                        [marketId]: {
                            lastBlock: {$set: startBlock}
                        }
                    }
                });
            } else {
                return update(state, {
                    events: {
                        [marketId]: {
                            $set: {fillEvents: [], lastBlock: startBlock}
                        }
                    }
                });
            }
        }
    }, defaultState
)
