import {ofType} from 'redux-observable';
import {of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';
import {Action} from 'redux-actions';

export const chainEpics = (fromType, toType) => action$ =>
    action$.pipe(
        ofType(fromType),
        mergeMap((action: Action<any>) =>
            of({type: toType, payload: action.payload})
        )
    );
