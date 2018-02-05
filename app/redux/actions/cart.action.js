/**
 * Created by chenshuang on 2017/9/19.
 */
import { hllFetch } from '../../utils/fetchUtils';    //  自定义请求 fetch

export const FETCH_CART_LIST_START = 'hll mall:fetch cart list start';
export const FETCH_CART_LIST_SUCCESS = 'hll mall:fetch cart list success';
export const FETCH_CART_LIST_CANCEL = 'hll mall:fetch cart list cancel';
export const FETCH_CART_LIST_FAIL = 'hll mall:fetch cart list fail';

// 获取进货单列表信息
export const fetchCartListAC = opts => ({type: FETCH_CART_LIST_START, payload: opts});
export const cancelFetchCartListAC = () => ({type: FETCH_CART_LIST_CANCEL});
export const fetchCartListEpic = action$ => action$.ofType(FETCH_CART_LIST_START).mergeMap(
  hllFetch({
    service: 'getCartList',
    successAC: (payload) => ({type: FETCH_CART_LIST_SUCCESS, payload}),
    failAC: () => ({type: FETCH_CART_LIST_FAIL}),
    cancelAC: cancelFetchCartListAC,
    action$
  })
);

export const CHANGE_CART_INFO_START = 'hll mall:change cart info start';
export const CHANGE_CART_INFO_SUCCESS = 'hll mall:change cart info success';
export const CHANGE_CART_INFO_CANCEL = 'hll mall:change cart info cancel';
export const CHANGE_CART_INFO_FAIL = 'hll mall:change cart info fail';

// 修改购物车数量
export const changeCartInfoAC = opts => ({type: CHANGE_CART_INFO_START, payload: opts});
export const changeCartInfoEpic = action$ => action$.ofType(CHANGE_CART_INFO_START).mergeMap(
  hllFetch({
    service: 'changeCartInfo',
    successAC: (payload) => ({type: CHANGE_CART_INFO_SUCCESS, payload}),
    failAC: () => ({type: CHANGE_CART_INFO_FAIL}),
    cancelAC: () => ({type: CHANGE_CART_INFO_CANCEL}),
    action$
  })
);

export const CHANGE_CART_INFO_FOR_CART_PAGE_START = 'hll mall:change cart info for cart page start';
export const CHANGE_CART_INFO_FOR_CART_PAGE_SUCCESS = 'hll mall:change cart info for cart page success';
export const CHANGE_CART_INFO_FOR_CART_PAGE_CANCEL = 'hll mall:change cart info for cart page cancel';
export const CHANGE_CART_INFO_FOR_CART_PAGE_FAIL = 'hll mall:change cart info for cart page fail';


// 修改购物车数量(购物车页面专用)
export const changeCartInfoForCartPageAC = opts => ({type: CHANGE_CART_INFO_FOR_CART_PAGE_START, payload: opts});
export const changeCartInfoForCartPageEpic = action$ => action$.ofType(CHANGE_CART_INFO_FOR_CART_PAGE_START).mergeMap(
  hllFetch({
    service: 'changeCartInfo',
    successAC: (payload) => ({type: CHANGE_CART_INFO_FOR_CART_PAGE_SUCCESS, payload}),
    failAC: () => ({type: CHANGE_CART_INFO_FOR_CART_PAGE_FAIL}),
    cancelAC: () => ({type: CHANGE_CART_INFO_FOR_CART_PAGE_CANCEL}),
    action$
  })
);

export const DELETE_CART_PRODUCT_START = 'hll mall:delete cart product start';
export const DELETE_CART_PRODUCT_SUCCESS = 'hll mall:delete cart product success';
export const DELETE_CART_PRODUCT_CANCEL = 'hll mall:delete cart product cancel';
export const DELETE_CART_PRODUCT_FAIL = 'hll mall:delete cart product fail';

// 删除购物车商品
export const deleteCartProductAC = opts => ({type: DELETE_CART_PRODUCT_START, payload: opts});
export const deleteCartProductEpic = action$ => action$.ofType(DELETE_CART_PRODUCT_START).mergeMap(
  hllFetch({
    service: 'deleteCartProduct',
    successAC: (payload) => ({type: DELETE_CART_PRODUCT_SUCCESS, payload}),
    failAC: () => ({type: DELETE_CART_PRODUCT_FAIL}),
    cancelAC: () => ({type: DELETE_CART_PRODUCT_CANCEL}),
    action$
  })
);
export const DELETE_CART_SPEC_START = 'hll mall:delete cart spec start';
export const DELETE_CART_SPEC_SUCCESS = 'hll mall:delete cart spec success';
export const DELETE_CART_SPEC_CANCEL = 'hll mall:delete cart spec cancel';
export const DELETE_CART_SPEC_FAIL = 'hll mall:delete cart spec fail';
// 删除购物车商品规格
export const deleteCartSpecAC = opts => ({type: DELETE_CART_SPEC_START, payload: opts});
export const deleteCartSpecEpic = action$ => action$.ofType(DELETE_CART_SPEC_START).mergeMap(
  hllFetch({
    service: 'deleteCartProduct',
    successAC: (payload) => ({type: DELETE_CART_SPEC_SUCCESS, payload}),
    failAC: () => ({type: DELETE_CART_SPEC_FAIL}),
    cancelAC: () => ({type: DELETE_CART_SPEC_CANCEL}),
    action$
  })
);
//去结算
export const GO_TO_SETTLEMENT_START = 'hll mall:go to settlement start';
export const GO_TO_SETTLEMENT_SUCCESS = 'hll mall:go to settlement success';
export const GO_TO_SETTLEMENT_CANCEL = 'hll mall:go to settlement cancel';
export const GO_TO_SETTLEMENT_FAIL = 'hll mall:go to settlement fail';

export const goToSettlementAC = opts => ({type: GO_TO_SETTLEMENT_START, payload: opts});
export const goToSettlementEpic = action$ => action$.ofType(GO_TO_SETTLEMENT_START).mergeMap(
  hllFetch({
    service: 'goToSettlement',
    successAC: (payload) => ({type: GO_TO_SETTLEMENT_SUCCESS, payload}),
    failAC: () => ({type: GO_TO_SETTLEMENT_FAIL}),
    cancelAC: () => ({type: GO_TO_SETTLEMENT_CANCEL}),
    action$
  })
);
//去结算商品列表
export const SETTLEMENT_PRODUCT_LIST_START = 'hll mall: settlement product list start';
export const SETTLEMENT_PRODUCT_LIST_SUCCESS = 'hll mall: settlement product list success';
export const SETTLEMENT_PRODUCT_LIST_CANCEL = 'hll mall: settlement product list cancel';
export const SETTLEMENT_PRODUCT_LIST_FAIL = 'hll mall: settlement product list fail';

export const settlementProductListAC = opts => ({type: SETTLEMENT_PRODUCT_LIST_START, payload: opts});
export const settlementProductListEpic = action$ => action$.ofType(SETTLEMENT_PRODUCT_LIST_START).mergeMap(
  hllFetch({
    service: 'settlementProductList',
    successAC: (payload) => ({type: SETTLEMENT_PRODUCT_LIST_SUCCESS, payload}),
    failAC: () => ({type: SETTLEMENT_PRODUCT_LIST_FAIL}),
    cancelAC: () => ({type: SETTLEMENT_PRODUCT_LIST_CANCEL}),
    action$
  })
);
//清空失效商品
export const CLEAR_INVALID_PRODUCT_START = 'hll mall: clear invalid product start';
export const CLEAR_INVALID_PRODUCT_SUCCESS = 'hll mall: clear invalid product success';
export const CLEAR_INVALID_PRODUCT_CANCEL = 'hll mall: clear invalid product cancel';
export const CLEAR_INVALID_PRODUCT_FAIL = 'hll mall: clear invalid product fail';

export const clearInvalidProductAC = opts => ({type: CLEAR_INVALID_PRODUCT_START, payload: opts});
export const clearInvalidProductEpic = action$ => action$.ofType(CLEAR_INVALID_PRODUCT_START).mergeMap(
  hllFetch({
    service: 'clearInvalidProduct',
    successAC: (payload) => ({type: CLEAR_INVALID_PRODUCT_SUCCESS, payload}),
    failAC: () => ({type: CLEAR_INVALID_PRODUCT_FAIL}),
    cancelAC: () => ({type: CLEAR_INVALID_PRODUCT_CANCEL}),
    action$
  })
);


// 购物车数量
export const FETCH_CART_PRODUCT_SPECS_NUM_START = 'fetch cart product specs num start'
export const FETCH_CART_PRODUCT_SPECS_NUM_SUCCESS = 'fetch cart product specs num success'
export const FETCH_CART_PRODUCT_SPECS_NUM_FAIL = 'fetch cart product specs num fail'
export const FETCH_CART_PRODUCT_SPECS_NUM_CANCEL = 'fetch cart product specs num cancel'

export const fetchCartSpecsNumAC = (opts) => ({ type: FETCH_CART_PRODUCT_SPECS_NUM_START, payload: opts })
export const fetchCartSpecsNumCancel = () => ({ type: FETCH_CART_PRODUCT_SPECS_NUM_CANCEL })
export const fetchCartSpecsNumEpic = action$ => action$.ofType(FETCH_CART_PRODUCT_SPECS_NUM_START).mergeMap(
  hllFetch({
      service: 'fetchCartSpecsNum',
      successAC: (payload) => ({type: FETCH_CART_PRODUCT_SPECS_NUM_SUCCESS, payload}),
      failAC: () => ({type: FETCH_CART_PRODUCT_SPECS_NUM_FAIL}),
      cancelAC: fetchCartSpecsNumCancel,
      action$
  })
);