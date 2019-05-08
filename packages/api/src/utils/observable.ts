// import {
//     TransactionEvents,
//     TransactionEventTypes,
//     EthTransactionHashEvents,
//     EthReceiptEvents,
//     EthErrorEvents,
//     EthConfirmationEvents
// } from '@nexex/types';
// import {merge, Observable, fromEvent, of} from 'rxjs';
// import {filter, switchMap, take} from 'rxjs/operators';
// import PromiEvent from 'web3/promiEvent';
// import {TransactionReceipt} from 'web3/types';
//
// export function fromPromiEvent(promi: PromiEvent<TransactionReceipt>): Observable<TransactionEvents> {
//     const transactionHashStream = fromEvent(<any>promi, TransactionEventTypes.TransactionHash).pipe(
//         switchMap<string, TransactionEvents>((txHash: string) =>
//             of({
//                 type: TransactionEventTypes.TransactionHash,
//                 payload: txHash
//             } as EthTransactionHashEvents)
//         )
//     );
//     const receiptStream = fromEvent(<any>promi, TransactionEventTypes.Receipt).pipe(
//         switchMap<TransactionReceipt, TransactionEvents>((receipt: TransactionReceipt) =>
//             of({
//                 type: 'receipt',
//                 payload: receipt
//             } as EthReceiptEvents)
//         )
//     );
//     const errorStream = fromEvent(<any>promi, TransactionEventTypes.Error).pipe(
//         switchMap<Error, TransactionEvents>((evt: Error | Array<any>) => {
//             if (evt instanceof Array) {
//                 return of({
//                     type: 'error',
//                     payload: {error: evt[0], receipt: evt[1]}
//                 } as EthErrorEvents);
//             } else {
//                 return of({
//                     type: 'error',
//                     payload: {error: evt}
//                 } as EthErrorEvents);
//             }
//         })
//     );
//     const confirmationStream = fromEvent(<any>promi, TransactionEventTypes.Confirmation).pipe(
//         // map((args: {confirmationNumber: number; receipt: TransactionReceipt}) => args),
//         switchMap<any, TransactionEvents>(args =>
//             of({
//                 type: 'confirmation',
//                 payload: {confirmationNumber: args[0], receipt: args[1]}
//             } as EthConfirmationEvents)
//         )
//     );
//
//     return merge(transactionHashStream, receiptStream, errorStream, confirmationStream);
// }
//
// export async function toReceiptPromise(stream: Observable<TransactionEvents>): Promise<any> {
//     return stream
//         .pipe(
//             filter(({type}) => type === TransactionEventTypes.Receipt),
//             take(1)
//         )
//         .toPromise();
// }
//
// export function toTxHashPromise(stream: Observable<TransactionEvents>): Promise<any> {
//     return stream
//         .pipe(
//             filter(({type}) => type === TransactionEventTypes.TransactionHash),
//             take(1)
//         )
//         .toPromise();
// }
