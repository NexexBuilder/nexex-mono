import {AnyAction} from 'redux';
import {Action} from 'redux-actions';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {Observable} from 'rxjs/internal/Observable';
import {of} from 'rxjs/internal/observable/of';
import {filter, mergeMap} from 'rxjs/operators';
import {EthTransaction} from '../../../types';
import {EthereumActionType} from '../../actions/ethereum.action';
import {closeDialog} from '../../actions/ui/eth_unwrap_dialog.action';

const handleCloseDialog = (action$: Observable<AnyAction>, state$: StateObservable<any>): Observable<AnyAction> =>
    action$.pipe(
        ofType(EthereumActionType.TX_TXHASH),
        filter((action: Action<EthTransaction<any>>) => action.payload.type === 'ETH_UNWRAP'),
        mergeMap((action) => {
            return of(closeDialog());
        })
    );

export default combineEpics(handleCloseDialog);
