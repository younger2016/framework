// 处理订单
import Immutable from 'immutable';

import {
  // 获取订单数量 --- lxz
  FETCH_ORDERSOME_NUMS_START,
  FETCH_ORDERSOME_NUMS_SUCCESS,
  FETCH_ORDERSOME_NUMS_FAIL,
  FETCH_ORDERSOME_NUMS_CANCEL,
  SHOW_THE_COMMIT_BILL_SUCCESS,
  FETCH_BILL_LIST_SUCCESS,
  FETCH_BILL_INFO_SUCCESS,
  CHANGE_BILL_STATUS_SUCCESS,
  CHECK_PRODUCT_SUCCESS,
  SET_NOFICTION_TO_ORDERLIST,
} from '../actions/orderCenter.action'

const $initialState = Immutable.fromJS({
  orderNUm: {
    status: 'start',
    list: [0, 0],
  }, // 订单数量组合

  commitBillInfo: [],
  billList: [],
  billInfo: [],
  // 通知栏消息
  notification: {
    status: ""
  },

});

export const orderCenter = ($$state = $initialState, action) => {

  switch (action.type) {
    case FETCH_ORDERSOME_NUMS_START:
      return $$state.setIn(['orderNUm', 'status'], 'pending')
      break;
    case FETCH_ORDERSOME_NUMS_SUCCESS:
      $$state =  $$state.setIn(['orderNUm', 'status'], 'success')
      if(action.payload.data instanceof Array){
        let numList = [0, 0];
        action.payload.data.map(({billNum = 0,subBillStatus = 1}) => {
          numList[subBillStatus - 1] = billNum;
        })
        $$state =  $$state.setIn(['orderNUm', 'list'], Immutable.fromJS(numList))
      }
      return $$state;
      break;
    case FETCH_ORDERSOME_NUMS_FAIL:
      return $$state.setIn(['orderNUm', 'status'], 'fail')
      break;
    case FETCH_ORDERSOME_NUMS_CANCEL:
      return $$state.setIn(['orderNUm', 'status'], 'cancel')
      break;
    case SHOW_THE_COMMIT_BILL_SUCCESS:
      return $$state.set('commitBillInfo', Immutable.fromJS(action.payload.data));
      break;
    case FETCH_BILL_LIST_SUCCESS:
      if(action.payload.reqPayload.data.pageNum == 1){
        return $$state.set('billList', Immutable.fromJS(Array.isArray(action.payload.data) ? action.payload.data: []));
      }
      return $$state.update('billList', (old)=>{
        return old.concat(Immutable.fromJS(Array.isArray(action.payload.data) ? action.payload.data: []))
      });
      break;
    case FETCH_BILL_INFO_SUCCESS:
      return $$state.set('billInfo', Immutable.fromJS(Array.isArray(action.payload.data) ? action.payload.data: []));
      break;
    case CHECK_PRODUCT_SUCCESS:
      return $$state.update('billList', (old) => {
        return old.filter((bill) => {
          return bill.get('subBillID') !== action.payload.reqPayload.data.subBillID
        })
      });
    case CHANGE_BILL_STATUS_SUCCESS:
      return $$state.update('billList', (old) => {
        return old.filter((bill) => {
          return bill.get('subBillID') !== action.payload.reqPayload.data.subBillIds
        })
      });
      break;

    case SET_NOFICTION_TO_ORDERLIST : // 设置通知栏数据
          $$state = $$state.set('notification', Immutable.fromJS(action.payload))
    default:
      return $$state
      break;
  }
}
