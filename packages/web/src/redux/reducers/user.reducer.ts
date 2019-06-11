import update from 'immutability-helper';
import * as R from 'ramda';
import {handleActions} from 'redux-actions';
import {FtOrder} from '../../types';
import {UserActionType, UserOrderInsertAction, UserOrderUpdateAction} from '../actions/user.action';

export interface UserState {
    orders: FtOrder[];
}

const defaultState: UserState = {
    orders: []
};

const MAX_ORDERS = 200;

export default handleActions<UserState, any>(
    {
        [UserActionType.USER_ORDER_INSERT]: (state, {payload}: UserOrderInsertAction) => {
            state.orders.push(payload);
            return update(state, {orders: {$set: R.slice(-R.min(MAX_ORDERS, state.orders.length), Infinity, state.orders)}});
        },
        [UserActionType.USER_ORDER_UPDATE]: (state, {payload}: UserOrderUpdateAction) => {
            return update(state, {
                orders: {
                    $set:
                    R.compose(
                        R.map<FtOrder[], FtOrder>(R.last),
                        R.values,
                        R.groupBy<FtOrder>(R.prop('orderHash')),
                        R.concat(R.__, payload)
                    )(state.orders)
                }
            });
        }
    }
    , defaultState);
