import {AnyAction} from 'redux';
import {Action} from 'redux-actions';
import {combineEpics, ofType, StateObservable} from 'redux-observable';
import {Observable} from 'rxjs/internal/Observable';
import {of} from 'rxjs/internal/observable/of';
import {filter, mergeMap} from 'rxjs/operators';
import {EthTransaction} from '../../../types';
import {EthereumActionType} from '../../actions/ethereum.action';
import {closeDialog, ETHWrapDialogActionType, showDialog} from '../../actions/ui/eth_wrap_dialog.action';

const handleOpenDialog = (action$: Observable<AnyAction>, state$: StateObservable<any>): Observable<AnyAction> =>
    action$.pipe(
        ofType(ETHWrapDialogActionType.DIALOG_SHOW),
        mergeMap((action) => {
            return of(showDialog());
        })
    );

const handleCloseDialog = (action$: Observable<AnyAction>, state$: StateObservable<any>): Observable<AnyAction> =>
    action$.pipe(
        ofType(EthereumActionType.TX_TXHASH),
        filter((action: Action<EthTransaction<any>>) => action.payload.type === 'ETH_WRAP'),
        mergeMap((action) => {
            return of(closeDialog());
        })
    );

export default combineEpics(handleCloseDialog);
