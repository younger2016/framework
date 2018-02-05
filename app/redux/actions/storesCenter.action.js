// 门店中心
import Rx from 'rxjs/Rx';
import hllMallfetch, { hllFetch }from '../../utils/fetchUtils.js';

// 公用方法 设置门店主信息，以及当前操作模式
export const SET_MAININFO_TO_STORES = 'set mianInfo to SomeOnestores'
export const DELETE_STORES_CENTER_SYNC = 'delete stores center sync'; // 删除非同步标志

// 获取门店列表
export const GET_STORESLIST_START = 'get stores list start';
export const GET_STORESLIST_SUCCESS = 'get stores list success';
export const GET_STORESLIST_FAIL = 'get stores list fail';
export const GET_STORESLIST_CANCEL = 'get stores list cancel';

export const getSotresList = opts => ({type: GET_STORESLIST_START, payload: opts})
export const getSotresListCancel = opts => ({type: GET_STORESLIST_CANCEL, payload: opts})
export const getSotresListEpic = action$ => action$.ofType(GET_STORESLIST_START).mergeMap(
  hllFetch({
    service: 'getSotresList',
    successAC: payload => ({type: GET_STORESLIST_SUCCESS, payload}),
    failAC: () => ({type: GET_STORESLIST_FAIL}),
    cancelAC: getSotresListCancel,
    action$
  })
)

// 获取门店详情
export const GET_SOMEONE_STORESINFO_START = 'get storesInfo list start';
export const GET_SOMEONE_STORESINFO_SUCCESS = 'get storesInfo list success';
export const GET_SOMEONE_STORESINFO_FAIL = 'get storesInfo list fail';
export const GET_SOMEONE_STORESINFO_CANCEL = 'get storesInfo list cancel';

export const getSomeOneStoresInfo = opts => ({type: GET_SOMEONE_STORESINFO_START, payload: opts})
export const getSomeOneStoresInfoCancel = opts => ({type: GET_SOMEONE_STORESINFO_CANCEL, payload: opts})
export const getSomeOneStoresInfoEpic = action$ => action$.ofType(GET_SOMEONE_STORESINFO_START).mergeMap(
  hllFetch({
    service: 'getSomeOneStoresInfo',
    successAC: payload => ({type: GET_SOMEONE_STORESINFO_SUCCESS, payload}),
    failAC: () => ({type: GET_SOMEONE_STORESINFO_FAIL}),
    cancelAC: getSomeOneStoresInfoCancel,
    action$
  })
)

// 删除门店
export const DELETE_SOMEONE_STORES_START = 'delete someOne stores start';
export const DELETE_SOMEONE_STORES_SUCCESS = 'delete someOne stores success';
export const DELETE_SOMEONE_STORES_FAIL = 'delete someOne stores fail';
export const DELETE_SOMEONE_STORES_CANCEL = 'delete someOne stores cancel';

export const deleteSomeOneStores = opts => ({type: DELETE_SOMEONE_STORES_START, payload: opts})
export const deleteSomeOneStoresCancel = opts => ({type: GET_STORESLIST_CANCEL, payload: opts})
export const deleteSomeOneStoresEpic = action$ => action$.ofType(DELETE_SOMEONE_STORES_START).mergeMap(
  hllFetch({
    service: 'deleteSomeOneStores',
    successAC: payload => ({type: DELETE_SOMEONE_STORES_SUCCESS, payload}),
    failAC: () => ({type: DELETE_SOMEONE_STORES_FAIL}),
    cancelAC: deleteSomeOneStoresCancel,
    action$
  })
)

// 新增门店
export const ADD_STORES_START = 'add stores storesCenter start';
export const ADD_STORES_SUCCESS = 'add stores storesCenter success';
export const ADD_STORES_FAIL = 'add stores storesCenter fail';
export const ADD_STORES_CANCEL = 'add stores storesCenter cancel';

export const addStoresCenter = opts => ({type: ADD_STORES_START, payload: opts})
export const addStoresCenterCancel = opts => ({type: ADD_STORES_CANCEL, payload: opts})
export const addStoresCenterEpic = action$ => action$.ofType(ADD_STORES_START).mergeMap(
  hllFetch({
    service: 'addStoresInfo',
    successAC: payload => ({type: ADD_STORES_SUCCESS, payload}),
    failAC: () => ({type: ADD_STORES_FAIL}),
    cancelAC: addStoresCenterCancel,
    action$
  })
)
// 编辑门店
export const EDIT_STORES_START = 'edit storesCenter stores start';
export const EDIT_STORES_SUCCESS = 'edit storesCenter stores success';
export const EDIT_STORES_FAIL = 'edit storesCenter stores fail';
export const EDIT_STORES_CANCEL = 'edit storesCenter stores cancel';

export const editStoresCenter = opts => ({type: EDIT_STORES_START, payload: opts})
export const editStoresCenterCancel = opts => ({type: EDIT_STORES_CANCEL, payload: opts})
export const editStoresCenterEpic = action$ => action$.ofType(EDIT_STORES_START).mergeMap(
  hllFetch({
    service: 'editStoresInfo',
    successAC: payload => ({type: EDIT_STORES_SUCCESS, payload}),
    failAC: () => ({type: EDIT_STORES_FAIL}),
    cancelAC: editStoresCenterCancel,
    action$
  })
)


// 切换门店后保存选中的门店shopID和shopName
export const SAVE_SELECTED_SHOP_ID_AND_NAME = 'save selected shop id and name';
