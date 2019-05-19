import {Action} from 'redux-actions';
import {ofType} from 'redux-observable';
import {of} from 'rxjs';
import {mergeMap} from 'rxjs/operators';

export const chainEpics = (fromType, toType) => action$ =>
    action$.pipe(
        ofType(fromType),
        mergeMap((action: Action<any>) =>
            of({type: toType, payload: action.payload})
        )
    );
