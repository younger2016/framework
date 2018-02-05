import Rx from 'rxjs/Rx';                             //  网络请求插件 RX
import { hllFetch } from '../../utils/fetchUtils';    //  自定义请求 fetch


// 登录 获取用户信息
export const USER_LOGIN_START = 'hll mall:user login start';
export const USER_LOGIN_SUCCESS = 'hll mall:user login success';
export const USER_LOGIN_CANCEL = 'hll mall:user login cancel';
export const USER_LOGIN_FAIL = 'hll mall:user login fail';

export const userLoginAC = opts => ({type: USER_LOGIN_START, payload: opts});
export const userLoginSuccess = (payload) => ({type: USER_LOGIN_SUCCESS, payload});
export const userLoginEpic = action$ => action$.ofType(USER_LOGIN_START).mergeMap(
  hllFetch({
    service: 'login',
    successAC: (payload) => ({type: USER_LOGIN_SUCCESS, payload}),
    failAC: () => ({type: USER_LOGIN_FAIL}),
    cancelAC: () => ({type: USER_LOGIN_CANCEL}),
    action$
  })
);


// 退出登录
export const USER_LOGOUT_START = 'hll mall:user logout start';
export const USER_LOGOUT_SUCCESS = 'hll mall:user logout success';
export const USER_LOGOUT_CANCEL = 'hll mall:user logout cancel';
export const USER_LOGOUT_FAIL = 'hll mall:user logout fail';

export const userLogoutAC = opts => ({type: USER_LOGOUT_START, payload: opts});
export const userLogoutEpic = action$ => action$.ofType(USER_LOGOUT_START).mergeMap(
  hllFetch({
    service: 'logout',
    successAC: (payload) => ({type: USER_LOGOUT_SUCCESS,payload: payload}),
    failAC: () => ({type: USER_LOGOUT_FAIL}),
    cancelAC: () => ({type: USER_LOGOUT_CANCEL}),
    action$
  })
);


// 找回密码
export const USER_FORGET_PWD_START = 'hll mall:user forget pwd start';
export const USER_FORGET_PWD_SUCCESS = 'hll mall:user forget pwd success';
export const USER_FORGET_PWD_CANCEL = 'hll mall:user forget pwd cancel';
export const USER_FORGET_PWD_FAIL = 'hll mall:user forget pwd fail';

export const userForgetPwd = opts => ({type: USER_FORGET_PWD_START, payload: opts});
export const userForgetPwdEpic = action$ => action$.ofType(USER_FORGET_PWD_START).mergeMap(
  hllFetch({
    service: 'forgetPwd',
    successAC: (payload) => ({type: USER_FORGET_PWD_SUCCESS,payload: payload}),
    failAC: () => ({type: USER_FORGET_PWD_FAIL}),
    cancelAC: () => ({type: USER_FORGET_PWD_CANCEL}),
    action$
  })
);


// 发送验证码
export const SEND_CHECK_CODE_START = 'hll mall: send check code start';
export const SEND_CHECK_CODE_SUCCESS = 'hll mall: send check code success';
export const SEND_CHECK_CODE_CANCEL = 'hll mall: send check code cancel';
export const SEND_CHECK_CODE_FAIL = 'hll mall: send check code fail';

export const sendCheckCodeAC = opts => ({type: SEND_CHECK_CODE_START, payload: opts});
export const sendCheckCodeEpic = action$ => action$.ofType(SEND_CHECK_CODE_START).mergeMap(
  hllFetch({
    service: 'sendCheckCode',
    successAC: payload => ({type: SEND_CHECK_CODE_SUCCESS, payload}),
    failAC: () => ({type: SEND_CHECK_CODE_FAIL}),
    cancelAC: () => ({type: SEND_CHECK_CODE_CANCEL}),
    action$
  })
);

// 用户注册
export const USER_REGISTER_START = 'hll mall:user register start';
export const USER_REGISTER_SUCCESS = 'hll mall:user register success';
export const USER_REGISTER_FAIL = 'hll mall:user register fail';
export const USER_REGISTER_CANCEL = 'hll mall:user register cancel';

export const userRegisterAC = opts => ({type: USER_REGISTER_START, payload: opts});
export const userRegisterEpic = action$ => action$.ofType(USER_REGISTER_START).mergeMap(
  hllFetch({
    service: 'register',
    successAC: payload => ({type: USER_REGISTER_SUCCESS, payload}),
    failAC: payload => ({type: USER_REGISTER_FAIL, payload}),
    cancelAC: () => ({type: USER_REGISTER_CANCEL}),
    action$
  })
);


// 完善资料
export const USER_INPUT_MORE_INFO_START = 'hll mall:user input more info start';
export const USER_INPUT_MORE_INFO_SUCCESS = 'hll mall:user input more info success';
export const USER_INPUT_MORE_INFO_FAIL = 'hll mall:user input more info fail';
export const USER_INPUT_MORE_INFO_CANCEL = 'hll mall:user input more info cancel';

export const userInputMoreInfoAC = opts => ({type: USER_INPUT_MORE_INFO_START, payload: opts});
export const userInputMoreInfoEpic = action$ => action$.ofType(USER_INPUT_MORE_INFO_START).mergeMap(
  hllFetch({
    service: 'inputInfo',
    successAC: payload => ({type: USER_INPUT_MORE_INFO_SUCCESS, payload}),
    failAC: payload => ({type: USER_INPUT_MORE_INFO_FAIL, payload}),
    cancelAC: () => ({type: USER_INPUT_MORE_INFO_CANCEL}),
    action$
  })
);


// 首页推荐店铺
export const FETCH_RECOMMEND_SHOP_START = 'hll mall:fetch recommend shop start';
export const FETCH_RECOMMEND_SHOP_SUCCESS = 'hll mall:fetch recommend shop success';
export const FETCH_RECOMMEND_SHOP_FAIL = 'hll mall:fetch recommend shop fail';
export const FETCH_RECOMMEND_SHOP_CANCEL = 'hll mall:fetch recommend shop cancel';

export const fetchRecommendShopAC = opts => ({type: FETCH_RECOMMEND_SHOP_START, payload: opts});
export const fetchRecommendShopEpic = action$ => action$.ofType(FETCH_RECOMMEND_SHOP_START).mergeMap(
  hllFetch({
    service: 'recommendShop',
    successAC: payload => ({type: FETCH_RECOMMEND_SHOP_SUCCESS, payload}),
    failAC: payload => ({type: FETCH_RECOMMEND_SHOP_FAIL, payload}),
    cancelAC: () => ({type: FETCH_RECOMMEND_SHOP_CANCEL}),
    action$
  })
);


// 首页banner图片
export const FETCH_BANNER_IMAGE_START = 'fetch banner image start';
export const FETCH_BANNER_IMAGE_SUCCESS = 'fetch banner image success';
export const FETCH_BANNER_IMAGE_FAIL = 'fetch banner image fail';
export const FETCH_BANNER_IMAGE_CANCEL = 'fetch banner image cancel';

export const fetchBannerAC = opts => ({type: FETCH_BANNER_IMAGE_START, payload: opts});
export const fetchBannerCancel = () => ({type: FETCH_BANNER_IMAGE_CANCEL,});
export const fetchBannerEpic = action$ => action$.ofType(FETCH_BANNER_IMAGE_START)
  .mergeMap(
    hllFetch({
      service: 'mainBanner',
      successAC: payload => ({type: FETCH_BANNER_IMAGE_SUCCESS, payload}),
      failAC: () => ({ type: FETCH_BANNER_IMAGE_FAIL }),
      cancelAC: fetchBannerCancel,
      action$,
    })
  );



// 获取全部资料 ---lxz
export const USER_GET_GROUPINFO_ALL_START = 'hll mall: user get groupInfo all start';
export const USER_GET_GROUPINFO_ALL_SUCCESS = 'hll mall:user get groupInfo all success';
export const USER_GET_GROUPINFO_ALL_FAIL = 'hll mall:user get groupInfo all fail';
export const USER_GET_GROUPINFO_ALL_CANCEL = 'hll mall:user get groupInfo all cancel';

export const userGetGroupInfoAll = opts => ({type: USER_GET_GROUPINFO_ALL_START, payload: opts});
export const userGetGroupInfoAllEpic = action$ => action$.ofType(USER_GET_GROUPINFO_ALL_START).mergeMap(
  hllFetch({
    service: 'getGroupInfo',
    successAC: payload => ({type: USER_GET_GROUPINFO_ALL_SUCCESS, payload}),
    failAC: payload => ({type: USER_GET_GROUPINFO_ALL_FAIL, payload}),
    cancelAC: () => ({type: USER_GET_GROUPINFO_ALL_CANCEL}),
    action$
  })
);


// 保存资料 --- lxz
export const USER_SAVE_GROUPINFO_ALL_START = 'hll mall: user save groupInfo all start';
export const USER_SAVE_GROUPINFO_ALL_SUCCESS = 'hll mall:user save groupInfo all success';
export const USER_SAVE_GROUPINFO_ALL_FAIL = 'hll mall:user save groupInfo all fail';
export const USER_SAVE_GROUPINFO_ALL_CANCEL = 'hll mall:user save groupInfo all cancel';

export const userSaveGroupInfoAll = opts => ({type: USER_SAVE_GROUPINFO_ALL_START, payload: opts});
export const userSaveGroupInfoAllEpic = action$ => action$.ofType(USER_SAVE_GROUPINFO_ALL_START).mergeMap(

 hllFetch({
   service: 'saveGroupInfo',
   successAC: payload => ({type: USER_SAVE_GROUPINFO_ALL_SUCCESS, payload}),
   failAC: payload => ({type: USER_SAVE_GROUPINFO_ALL_FAIL, payload}),
   cancelAC: () => ({type: USER_SAVE_GROUPINFO_ALL_CANCEL}),
   action$
 })
);

// 获取缓存信息 --- lxz
export const USER_GET_GLOBAL_INFO_START = 'hll mall: user get global info start';
export const USER_GET_GLOBAL_INFO_SUCCESS = 'hll mall:user get global info success';
export const USER_GET_GLOBAL_INFO_FAIL = 'hll mall:user get global info fail';
export const USER_GET_GLOBAL_INFO_CANCEL = 'hll mall:user get global info cancel';

export const getGlobalInfo = opts => ({type: USER_GET_GLOBAL_INFO_START, payload: opts});
export const getGlobalInfoEpic = action$ => action$.ofType(USER_GET_GLOBAL_INFO_START).mergeMap(

 hllFetch({
   service: 'getGlobalInfo',
   successAC: payload => ({type: USER_GET_GLOBAL_INFO_SUCCESS, payload}),
   failAC: payload => ({type: USER_GET_GLOBAL_INFO_FAIL, payload}),
   cancelAC: () => ({type: USER_GET_GLOBAL_INFO_CANCEL}),
   action$
 })
);


// 获取合作店铺 ---lxz
export const TRADE_GET_MEALS_START = 'hll mall:trade get meals start';
export const TRADE_GET_MEALS_SUCCESS = 'hll mall:user trade get meals success';
export const TRADE_GET_MEALS_FAIL = 'hll mall:trade get meals fail';
export const TRADE_GET_MEALS_CANCEL = 'hll mall:trade get meals cancel';

export const tradeGetMeals = opts => ({type: TRADE_GET_MEALS_START, payload: opts});
export const tradeGetMealsEpic = action$ => action$.ofType(TRADE_GET_MEALS_START).mergeMap(

 hllFetch({
   service: 'tradeGetMeals',
   successAC: payload => ({type: TRADE_GET_MEALS_SUCCESS, payload}),
   failAC: payload => ({type: TRADE_GET_MEALS_FAIL, payload}),
   cancelAC: () => ({type: TRADE_GET_MEALS_CANCEL}),
   action$
 })
);


// 获取交易记录 --- lxz
export const DELETE_ALL_TRADEOFCACHE = 'dele all trade of cache'
export const TRADE_GET_INFOLIST_START = 'hll mall:trade get infoList start';
export const TRADE_GET_INFOLIST_SUCCESS = 'hll mall:user trade get infoList success';
export const TRADE_GET_INFOLIST_FAIL = 'hll mall:trade get infoList fail';
export const TRADE_GET_INFOLIST_CANCEL = 'hll mall:trade get infoList cancel';

export const tradeGetInfoList = opts => ({type: TRADE_GET_INFOLIST_START, payload: opts});
export const tradeGetInfoListEpic = action$ => action$.ofType(TRADE_GET_INFOLIST_START).mergeMap(

 hllFetch({
   service: 'tradeGetInfoList',
   successAC: payload => ({type: TRADE_GET_INFOLIST_SUCCESS, payload}),
   failAC: payload => ({type: TRADE_GET_INFOLIST_FAIL, payload}),
   cancelAC: () => ({type: TRADE_GET_INFOLIST_CANCEL}),
   action$
 })
);

// 重置logo
export const SET_NEW_LOGO_FROM_GROUP = 'set new logo from group'

//修改cache数据
export const CHANGE_ISONLINE = 'hll mall: change isOnline'

export const changeIsOnline = opts => ({type: CHANGE_ISONLINE, payload: opts});

//网络状态变化
export const CHANGE_NET_INFO = 'hll mall: change net info'
export const changeNetInfo = opts => ({type: CHANGE_NET_INFO, payload: opts});

// 改变版本号
export const CHANGE_APP_VERSION = 'change app version';
