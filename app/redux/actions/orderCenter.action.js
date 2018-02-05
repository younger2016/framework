// 订单管理

import Rx from 'rxjs/Rx';
import hllMallfetch, { hllFetch }from '../../utils/fetchUtils';

// 获取订单两类数量---lxz

export const FETCH_ORDERSOME_NUMS_START = 'fetch order some nums start';
export const FETCH_ORDERSOME_NUMS_SUCCESS = 'fetch order some nums success';
export const FETCH_ORDERSOME_NUMS_FAIL = 'fetch order some nums fail';
export const FETCH_ORDERSOME_NUMS_CANCEL = 'fetch order some nums cancel';

export const fetchOrderSomeNum = opts => ({type: FETCH_ORDERSOME_NUMS_START, payload: opts})
export const fetchOrderSomeNumCancel = opts => ({type: FETCH_ORDERSOME_NUMS_CANCEL, payload: opts})

export const fetchOrderSomeNumEpic = action$ => action$.ofType(FETCH_ORDERSOME_NUMS_START).mergeMap(
  hllFetch({
    service: 'fetchOrderSomeNum',
    successAC: payload => ({type: FETCH_ORDERSOME_NUMS_SUCCESS, payload}),
    failAC: () => ({type: FETCH_ORDERSOME_NUMS_FAIL}),
    cancelAC: fetchOrderSomeNumCancel,
    action$
  })
)
//提交订单
export const COMMIT_BILL_START = 'hll mall: commit bill start';
export const COMMIT_BILL_SUCCESS = 'hll mall: commit bill success';
export const COMMIT_BILL_FAIL = 'hll mall: commit bill fail';
export const COMMIT_BILL_CANCEL = 'hll mall: commit bill cancel';

export const commitBillAC = opts => ({type: COMMIT_BILL_START, payload: opts})
export const commitBillEpic = action$ => action$.ofType(COMMIT_BILL_START).mergeMap(
  hllFetch({
    service: 'commitBill',
    successAC: payload => ({type: COMMIT_BILL_SUCCESS, payload}),
    failAC: () => ({type: COMMIT_BILL_FAIL}),
    cancelAC: () => ({type: COMMIT_BILL_CANCEL}),
    action$
  })
)

//提交订单之后查看订单信息
export const SHOW_THE_COMMIT_BILL_START = 'hll mall:show the commit bill start';
export const SHOW_THE_COMMIT_BILL_SUCCESS = 'hll mall:show the commit bill success';
export const SHOW_THE_COMMIT_BILL_FAIL = 'hll mall:show the commit bill fail';
export const SHOW_THE_COMMIT_BILL_CANCEL = 'hll mall:show the commit bill cancel';

export const showTheCommitBillAC = opts => ({type: SHOW_THE_COMMIT_BILL_START, payload: opts})
export const showTheCommitBillEpic = action$ => action$.ofType(SHOW_THE_COMMIT_BILL_START).mergeMap(
  hllFetch({
    service: 'afterCommitBill',
    successAC: payload => ({type: SHOW_THE_COMMIT_BILL_SUCCESS, payload}),
    failAC: () => ({type: SHOW_THE_COMMIT_BILL_FAIL}),
    cancelAC: () => ({type: SHOW_THE_COMMIT_BILL_CANCEL}),
    action$
  })
)

//查询订单列表
export const FETCH_BILL_LIST_START = 'hll mall:fetch bill list start';
export const FETCH_BILL_LIST_SUCCESS = 'hll mall:fetch bill list success';
export const FETCH_BILL_LIST_FAIL = 'hll mall:fetch bill list fail';
export const FETCH_BILL_LIST_CANCEL = 'hll mall:fetch bill list cancel';

export const fetchBillListAC = opts => ({type: FETCH_BILL_LIST_START, payload: opts})
export const fetchBillListEpic = action$ => action$.ofType(FETCH_BILL_LIST_START).mergeMap(
  hllFetch({
    service: 'fetchBillList',
    successAC: payload => ({type: FETCH_BILL_LIST_SUCCESS, payload}),
    failAC: () => ({type: FETCH_BILL_LIST_FAIL}),
    cancelAC: () => ({type: FETCH_BILL_LIST_CANCEL}),
    action$
  })
)

//查询订单详情
export const FETCH_BILL_INFO_START = 'hll mall:fetch bill info start';
export const FETCH_BILL_INFO_SUCCESS = 'hll mall:fetch bill info success';
export const FETCH_BILL_INFO_FAIL = 'hll mall:fetch bill info fail';
export const FETCH_BILL_INFO_CANCEL = 'hll mall:fetch bill info cancel';

export const fetchBillInfoAC = opts => ({type: FETCH_BILL_INFO_START, payload: opts})
export const fetchBillInfoEpic = action$ => action$.ofType(FETCH_BILL_INFO_START).mergeMap(
  hllFetch({
    service: 'fetchBillInfo',
    successAC: payload => ({type: FETCH_BILL_INFO_SUCCESS, payload}),
    failAC: () => ({type: FETCH_BILL_INFO_FAIL}),
    cancelAC: () => ({type: FETCH_BILL_INFO_CANCEL}),
    action$
  })
);

//验货
export const CHECK_PRODUCT_START = 'hll mall:check product start';
export const CHECK_PRODUCT_SUCCESS = 'hll mall:check product success';
export const CHECK_PRODUCT_FAIL = 'hll mall:check product fail';
export const CHECK_PRODUCT_CANCEL = 'hll mall:check product cancel';

export const checkProductAC = opts => ({type: CHECK_PRODUCT_START, payload: opts})
export const checkProductEpic = action$ => action$.ofType(CHECK_PRODUCT_START).mergeMap(
  hllFetch({
    service: 'checkProduct',
    successAC: payload => ({type: CHECK_PRODUCT_SUCCESS, payload}),
    failAC: () => ({type: CHECK_PRODUCT_FAIL}),
    cancelAC: () => ({type: CHECK_PRODUCT_CANCEL}),
    action$
  })
);

//修改订单状态(取消订单)
export const CHANGE_BILL_STATUS_START = 'hll mall:change bill status start';
export const CHANGE_BILL_STATUS_SUCCESS = 'hll mall:change bill status success';
export const CHANGE_BILL_STATUS_FAIL = 'hll mall:change bill status fail';
export const CHANGE_BILL_STATUS_CANCEL = 'hll mall:change bill status cancel';

export const changeBillStatusAC = opts => ({type: CHANGE_BILL_STATUS_START, payload: opts})
export const changeBillStatusEpic = action$ => action$.ofType(CHANGE_BILL_STATUS_START).mergeMap(
  hllFetch({
    service: 'changeBillStatus',
    successAC: payload => ({type: CHANGE_BILL_STATUS_SUCCESS, payload}),
    failAC: () => ({type: CHANGE_BILL_STATUS_FAIL}),
    cancelAC: () => ({type: CHANGE_BILL_STATUS_CANCEL}),
    action$
  })
);

 export const SET_NOFICTION_TO_ORDERLIST = 'set notification to orderList'
