
import { hllFetch } from '../../utils/fetchUtils';

// 商品分类
export const FETCH_CATEGORYS_START = 'fetch categorys start';
export const FETCH_CATEGORYS_SUCCESS = 'fetch categorys success';
export const FETCH_CATEGORYS_FAIL = 'fetch categorys fail';
export const FETCH_CATEGORYS_CANCEL = 'fetch categorys cancel';

// 分类中商品列表
export const FETCH_CATEGORY_PRODUCT_LIST_START = 'fetch category product list start';
export const FETCH_CATEGORY_PRODUCT_LIST_SUCCESS = 'fetch category product list success';
export const FETCH_CATEGORY_PRODUCT_LIST_FAIL = 'fetch category product list fail';
export const FETCH_CATEGORY_PRODUCT_LIST_CANCEL = 'fetch category product list cancel';

// 商品详情
export const FETCH_PRODUCT_DETAIL_INFO_START = 'fetch product detail info start';
export const FETCH_PRODUCT_DETAIL_INFO_SUCCESS = 'fetch product detail info success';
export const FETCH_PRODUCT_DETAIL_INFO_FAIL = 'fetch product detail info fail';
export const FETCH_PRODUCT_DETAIL_INFO_CANCEL = 'fetch product detail info cancel';

// 保存商品ID
export const SAVE_PRODUCT_ID = 'save product id';

// 采购清单
export const FETCH_PURCHASE_LIST_START = 'fetch purchase list start';
export const FETCH_PURCHASE_LIST_SUCCESS = 'fetch purchase list success';
export const FETCH_PURCHASE_LIST_FAIL = 'fetch purchase list fail';
export const FETCH_PURCHASE_LIST_CANCELT = 'fetch purchase list cancel';

// 加采购清单
export const ADD_PURCHASE_START = 'add purchase start';
export const ADD_PURCHASE_SUCCESS = 'add purchase success';
export const ADD_PURCHASE_FAIL = 'add purchase fail';
export const ADD_PURCHASE_CANCEL = 'add purchase cancel';

// 删除采购清单
export const DELETE_PURCHASE_START = 'delete purchase start';
export const DELETE_PURCHASE_SUCCESS = 'delete purchase success';
export const DELETE_PURCHASE_FAIL = 'delete purchase fail';
export const DELETE_PURCHASE_CANCEL = 'delete purchase cancel';

// 批量删除采购清单
export const DELETE_MORE_PURCHAS_START = 'delete more purchase start';
export const DELETE_MORE_PURCHAS_SUCCESS = 'delete more purchase success';
export const DELETE_MORE_PURCHAS_FAIL = 'delete more purchase fail';
export const DELETE_MORE_PURCHAS_CANCEL = 'delete more purchase cancel';

// 商品搜索结果页
export const FETCH_PRODUCT_LIST_BT_KEYBORD_START = 'fetch product list by keybord start';
export const FETCH_PRODUCT_LIST_BT_KEYBORD_SUCCESS = 'fetch product list by keybord success';
export const FETCH_PRODUCT_LIST_BT_KEYBORD_FAIL = 'fetch product list by keybord fail';
export const FETCH_PRODUCT_LIST_BT_KEYBORD_CANCEL = 'fetch product list by keybord cancel';

// 获取采购清单分类
export const FETCH_PURCHASE_LIST_CATEGORY_START = 'fetch purchase list category start';
export const FETCH_PURCHASE_LIST_CATEGORY_SUCCESS = 'fetch purchase list category success';
export const FETCH_PURCHASE_LIST_CATEGORY_FAIL = 'fetch purchase list category fail';
export const FETCH_PURCHASE_LIST_CATEGORY_CANCEL = 'fetch purchase list category cancel';



// 商品分类
export const fetchCategorysAC = opts => ({type: FETCH_CATEGORYS_START, payload: opts});
export const fetchCategorysCancel = () => ({type: FETCH_CATEGORYS_CANCEL});
export const fetchCategorysEpic = action$ => action$.ofType(FETCH_CATEGORYS_START)
  .mergeMap(
    hllFetch({
      service: 'fetchCategorys',
      successAC: payload => ({type: FETCH_CATEGORYS_SUCCESS, payload}),
      failAC: () => ({type: FETCH_CATEGORYS_FAIL,}),
      cancelAC: fetchCategorysCancel,
      action$,
    })
  );

// 商品列表
export const fetchCategoryProductListAC = opts => ({type: FETCH_CATEGORY_PRODUCT_LIST_START, payload: opts});
export const fetchCategoryProductListCancel = () => ({type: FETCH_CATEGORY_PRODUCT_LIST_CANCEL});
export const fetchCategoryProductListEpic = action$ => action$.ofType(FETCH_CATEGORY_PRODUCT_LIST_START)
  .mergeMap(
    hllFetch({
      service: 'fetchProductList',
      successAC: payload => ({type: FETCH_CATEGORY_PRODUCT_LIST_SUCCESS, payload}),
      failAC: () => ({type: FETCH_CATEGORY_PRODUCT_LIST_FAIL}),
      cancelAC: fetchCategoryProductListCancel,
      action$,
    })
  );

// 商品详情
export const fetchProductDetailInfoAC = opts => ({type: FETCH_PRODUCT_DETAIL_INFO_START, payload: opts});
export const fetchProductDetailInfoCancel = () => ({type: FETCH_PRODUCT_DETAIL_INFO_CANCEL});
export const fetchProductDetailInfoEpic = action$ => action$.ofType(FETCH_PRODUCT_DETAIL_INFO_START)
  .mergeMap(
    hllFetch({
      service: 'fetchProductDetailInfo',
      successAC: payload => ({type: FETCH_PRODUCT_DETAIL_INFO_SUCCESS, payload}),
      failAC: () => ({type: FETCH_PRODUCT_DETAIL_INFO_FAIL}),
      cancelAC: fetchProductDetailInfoCancel,
      action$
    })
  );

// 采购清单
export const fetchPurchaseListAC = opts => ({type: FETCH_PURCHASE_LIST_START, payload: opts});
export const fetchPurchaseListCancel = () => ({type: FETCH_PURCHASE_LIST_CANCELT});
export const fetchPurchaseListEpic = action$ => action$.ofType(FETCH_PURCHASE_LIST_START)
  .mergeMap(
    hllFetch({
      service: 'fetchPurchaseList',
      successAC: payload => ({type: FETCH_PURCHASE_LIST_SUCCESS, payload}),
      failAC: () => ({type: FETCH_PURCHASE_LIST_FAIL,}),
      cancelAC: fetchPurchaseListCancel,
      action$,
    })
  );

// 加采购清单
export const addPurchaseAC = opts => ({type: ADD_PURCHASE_START, payload: opts});
export const addPurchaseCancel = () => ({type: ADD_PURCHASE_CANCEL});
export const addPurchaseEpic = action$ => action$.ofType(ADD_PURCHASE_START)
  .mergeMap(
    hllFetch({
      service: 'addPurchase',
      successAC: payload => ({type: ADD_PURCHASE_SUCCESS, payload}),
      failAC: () => ({type: ADD_PURCHASE_FAIL,}),
      cancelAC: addPurchaseCancel,
      action$,
    })
  );

// 删除采购清单
export const deletePurchaseAC = opts => ({type: DELETE_PURCHASE_START, payload: opts});
export const deletePurchaseCancel = () => ({type: DELETE_PURCHASE_CANCEL});
export const deletePurchaseEpic = action$ => action$.ofType(DELETE_PURCHASE_START)
  .mergeMap(
    hllFetch({
      service: 'deletePurchase',
      successAC: payload => ({type: DELETE_PURCHASE_SUCCESS, payload}),
      failAC: () => ({type: DELETE_PURCHASE_FAIL}),
      cancelAC: deletePurchaseCancel,
      action$,
    })
  );

// 批量删除采购清单
export const deleteMorePurchaseAC = opts => ({type: DELETE_MORE_PURCHAS_START, payload: opts});
export const deleteMorePurchaseCancel = () => ({type: DELETE_MORE_PURCHAS_CANCEL});
export const deleteMorePurchaseEpic = (action$) => action$.ofType(DELETE_MORE_PURCHAS_START)
  .mergeMap(
    hllFetch({
      service: 'deleteMorePurchase',
      successAC: payload => ({type: DELETE_MORE_PURCHAS_SUCCESS, payload}),
      failAC: () => ({type: DELETE_MORE_PURCHAS_FAIL}),
      cancelAC: deleteMorePurchaseCancel,
      action$,
    })
  );

// 商品搜索结果页
export const fetchProductListByKeybordAC = opts => ({type: FETCH_PRODUCT_LIST_BT_KEYBORD_START, payload: opts});
export const fetchProductListByKeybordCancel = () => ({type: FETCH_PRODUCT_LIST_BT_KEYBORD_CANCEL});
export const fetchProductListByKeybordEpic = action$ => action$.ofType(FETCH_PRODUCT_LIST_BT_KEYBORD_START)
  .mergeMap(
    hllFetch({
      service: 'fetchProductList',
      successAC: payload => ({type: FETCH_PRODUCT_LIST_BT_KEYBORD_SUCCESS, payload}),
      failAC: () => ({type: FETCH_PRODUCT_LIST_BT_KEYBORD_FAIL}),
      cancelAC: fetchProductListByKeybordCancel,
      action$,
    })
  );

// 获取采购清单分类
// TODO:: 这次不做，下次迭代再做
export const fetchPurcahseListCategoryAC = opts => ({ type: FETCH_PURCHASE_LIST_CATEGORY_START, payload: opts });
export const fetchPurcahseListCategoryCancel = () => ({ type: FETCH_PURCHASE_LIST_CATEGORY_CANCEL });
export const fetchPurcahseListCategoryEpic = action$ => action$.ofType(FETCH_PURCHASE_LIST_CATEGORY_START)
  .mergeMap(
    hllFetch({
      service: 'purcahseListCategory',
      successAC: payload => ({type: FETCH_PURCHASE_LIST_CATEGORY_SUCCESS, payload}),
      failAC: () => ({type: FETCH_PURCHASE_LIST_CATEGORY_FAIL,}),
      cancelAC: fetchPurcahseListCategoryCancel,
      action$,
    })
  );