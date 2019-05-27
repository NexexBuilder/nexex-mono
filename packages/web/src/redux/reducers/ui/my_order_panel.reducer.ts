// import {OrderSide} from '@nexex/types/index';
// import update from 'immutability-helper';
// import {handleActions} from 'redux-actions';
// import {NewOrderPanelActionType, UpdateFormFieldAction} from '../../actions/ui/new_order_panel.action';
// import {NewOrderPanelState} from './new_order_panel.reducer';
//
// export interface MyTradeWidgetState {
//     selectedTab: string;
// }
//
// const defaultState: MyTradeWidgetState = {
//     selectedTab: 'myOrder',
// };
//
// export default handleActions<MyTradeWidgetState, any>(
//     {
//         [NewOrderPanelActionType.FORM_FIELD_UPDATE]: (
//             state,
//             action: UpdateFormFieldAction
//         ) => {
//             if (action.payload.side === OrderSide.ASK) {
//                 return update(state, {
//                     formDataForSell: {$merge: action.payload.formData}
//                 });
//             } else {
//                 return update(state, {
//                     formDataForBuy: {$merge: action.payload.formData}
//                 });
//             }
//         }
//     },
//     defaultState
// );
