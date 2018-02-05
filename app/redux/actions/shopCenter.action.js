// 所有操作，查看商铺的操作，包括收藏的店铺

import Rx from 'rxjs/Rx';
import hllMallfetch, { hllFetch }from '../../utils/fetchUtils';

// 公用方法 --- 设置店铺详情的请求信息
export const SET_MAININFO_TO_GET_SHOP_INFO = 'set mainInfo to get shopInfo';

// 搜索店铺
export const SERARCH_SHOP_LIST_START = 'search shop list start';
export const SERARCH_SHOP_LIST_SUCCESS = 'search shop list success';
export const SERARCH_SHOP_LIST_FAIL = 'search shop list fail';
export const SERARCH_SHOP_LIST_CANCEL = 'search shop list cancel';

export const searchShopList = opts => ({type: SERARCH_SHOP_LIST_START, payload: opts})
export const searchShopListCancel = opts => ({type: SERARCH_SHOP_LIST_CANCEL, payload: opts})
export const searchShopListEpic = action$ => action$.ofType(SERARCH_SHOP_LIST_START).mergeMap(
  hllFetch({
    service: 'searchShopList',
    successAC: payload => ({type: SERARCH_SHOP_LIST_SUCCESS, payload}),
    failAC: () => ({type: SERARCH_SHOP_LIST_FAIL}),
    cancelAC: searchShopListCancel,
    action$
  })
)

// 获取店铺详情--不包括商品列表--包含基本信息，认证信息
export const GET_SHOPINFO_START = 'get shopInfo start';
export const GET_SHOPINFO_SUCCESS = 'get shopInfo success';
export const GET_SHOPINFO_FAIL = 'get shopInfo fail';
export const GET_SHOPINFO_CANCEL = 'get shopInfo cancel';

export const getShopInfo = opts => ({type: GET_SHOPINFO_START, payload: opts})
export const getShopInfoCancel = opts => ({type: GET_SHOPINFO_CANCEL, payload: opts})
export const getShopInfoEpic = action$ => action$.ofType(GET_SHOPINFO_START).mergeMap(
  hllFetch({
    service: 'getShopInfo',
    successAC: payload => ({type: GET_SHOPINFO_SUCCESS, payload}),
    failAC: () => ({type: GET_SHOPINFO_FAIL}),
    cancelAC: getShopInfoCancel,
    action$
  })
)

// 获取店铺详情--获取商品列表
export const GET_PRODUCTLIST_FROM_SHOPINFO_START = 'get productList from shopInfo start';
export const GET_PRODUCTLIST_FROM_SHOPINFO_SUCCESS = 'get productList from shopInfo success';
export const GET_PRODUCTLIST_FROM_SHOPINFO_FAIL = 'get productList from shopInfo fail';
export const GET_PRODUCTLIST_FROM_SHOPINFO_CANCEL = 'get productList from shopInfo cancel';
// TODO:: delete this function
export const getProductListFromShopInfo = opts => ({type: GET_PRODUCTLIST_FROM_SHOPINFO_START, payload: opts})
export const getProductListFromShopInfoCancel = opts => ({type: GET_PRODUCTLIST_FROM_SHOPINFO_CANCEL, payload: opts})
export const getProductListFromShopInfoEpic = action$ => action$.ofType(GET_PRODUCTLIST_FROM_SHOPINFO_START).mergeMap(
  hllFetch({
    service: 'getProductListFromShopInfo',
    successAC: payload => ({type: GET_PRODUCTLIST_FROM_SHOPINFO_SUCCESS, payload}),
    failAC: opts => ({type: GET_PRODUCTLIST_FROM_SHOPINFO_FAIL, payload: opts}),
    cancelAC: getProductListFromShopInfoCancel,
    action$
  })
)

// 获取收藏的店铺collectShop
export const GET_COLLECT_SHOP_START = 'get collectShop start';
export const GET_COLLECT_SHOP_SUCCESS = 'get collectShop success';
export const GET_COLLECT_SHOP_FAIL = 'get collectShop fail';
export const GET_COLLECT_SHOP_CANCEL = 'get collectShop cancel';

export const getCollectShop = opts => ({type: GET_COLLECT_SHOP_START, payload: opts})
export const getCollectShopCancel = opts => ({type: GET_COLLECT_SHOP_CANCEL, payload: opts})
export const getCollectShopEpic = action$ => action$.ofType(GET_COLLECT_SHOP_START).mergeMap(
  hllFetch({
    service: 'getCollectShop',
    successAC: payload => ({type: GET_COLLECT_SHOP_SUCCESS, payload}),
    failAC: () => ({type: GET_COLLECT_SHOP_FAIL}),
    cancelAC: getCollectShopCancel,
    action$
  })
)

// 改变店铺收藏状态 -- 加入收藏
export const CHANGE_COLLECTSHOP_STATUS_START = 'change collectShop status start';
export const CHANGE_COLLECTSHOP_STATUS_SUCCESS = 'change collectShop status success';
export const CHANGE_COLLECTSHOP_STATUS_FAIL = 'change collectShop status fail';
export const CHANGE_COLLECTSHOP_STATUS_CANCEL = 'change collectShop status cancel';

export const changeCollectShopStatus = opts => ({type: CHANGE_COLLECTSHOP_STATUS_START, payload: opts})
export const changeCollectShopStatusCancel = opts => ({type: CHANGE_COLLECTSHOP_STATUS_CANCEL, payload: opts})
export const changeCollectShopStatusEpic = action$ => action$.ofType(CHANGE_COLLECTSHOP_STATUS_START).mergeMap(
  hllFetch({
    service: 'changeCollectShopStatus',
    successAC: payload => ({type: CHANGE_COLLECTSHOP_STATUS_SUCCESS, payload}),
    failAC: () => ({type: CHANGE_COLLECTSHOP_STATUS_FAIL}),
    cancelAC: changeCollectShopStatusCancel,
    action$
  })
)

// 改变店铺收藏状态 -- 取消收藏
export const CANCEL_COLLECTSHOP_STATUS_START = 'cancel collectShop status start';
export const CANCEL_COLLECTSHOP_STATUS_SUCCESS = 'cancel collectShop status success';
export const CANCEL_COLLECTSHOP_STATUS_FAIL = 'cancel collectShop status fail';
export const CANCEL_COLLECTSHOP_STATUS_CANCEL = 'cancel collectShop status cancel';

export const cancelCollectShopStatus = opts => ({type: CANCEL_COLLECTSHOP_STATUS_START, payload: opts})
export const cancelCollectShopStatusCancel = opts => ({type: CANCEL_COLLECTSHOP_STATUS_CANCEL, payload: opts})
export const cancelCollectShopStatusEpic = action$ => action$.ofType(CANCEL_COLLECTSHOP_STATUS_START).mergeMap(
  hllFetch({
    service: 'cancelCollectShopStatus',
    successAC: payload => ({type: CANCEL_COLLECTSHOP_STATUS_SUCCESS, payload}),
    failAC: () => ({type: CANCEL_COLLECTSHOP_STATUS_FAIL}),
    cancelAC: cancelCollectShopStatusCancel,
    action$
  })
)


// 某个店铺下二级分类
export const FETCH_SHOP_CATEGORY_START = 'fetch shop category start';
export const FETCH_SHOP_CATEGORY_SUCCESS = 'fetch shop category success';
export const FETCH_SHOP_CATEGORY_FAIL = 'fetch shop category fail';
export const FETCH_SHOP_CATEGORY_CANCEL = 'fetch shop category cancel';

export const fetchShopCategoryAC = opts => ({ type: FETCH_SHOP_CATEGORY_START, payload: opts});
export const fetchShopCategoryCancel = () => ({ type: FETCH_SHOP_CATEGORY_CANCEL });
export const fetchShopCategoryEpic = action$ => action$.ofType(FETCH_SHOP_CATEGORY_START)
  .mergeMap(
    hllFetch({
        service: 'fetchShopCategory',
        successAC: payload => ({type: FETCH_SHOP_CATEGORY_SUCCESS, payload}),
        failAC: () => ({type: FETCH_SHOP_CATEGORY_FAIL}),
        cancelAC: fetchShopCategoryCancel,
        action$
    })
  )


// 店铺下某个分类下商品列表
export const FETCH_SHOP_PRODUCT_LIST_START = 'fetch shop product list start';
export const FETCH_SHOP_PRODUCT_LIST_SUCCESS = 'fetch shop product list success';
export const FETCH_SHOP_PRODUCT_LIST_FAIL = 'fetch shop product list fail';
export const FETCH_SHOP_PRODUCT_LIST_CANCEL = 'fetch shop product list cancel';

export const fetchShopProductListAC = opts => ({ type: FETCH_SHOP_PRODUCT_LIST_START, payload: opts });
export const fetchShopProductListCancel = () => ({ type: FETCH_SHOP_PRODUCT_LIST_CANCEL });
export const fetchShopProductListEpic = action$ => action$.ofType(FETCH_SHOP_PRODUCT_LIST_START)
    .mergeMap(
      hllFetch({
          service: 'fetchProductList',
          successAC: payload => ({type: FETCH_SHOP_PRODUCT_LIST_SUCCESS, payload}),
          failAC: () => ({type: FETCH_SHOP_PRODUCT_LIST_FAIL}),
          cancelAC: fetchShopProductListCancel,
          action$
      })
    )