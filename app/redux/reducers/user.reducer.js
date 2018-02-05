import Immutable from 'immutable';
import {AsyncStorage} from 'react-native';
import {
  // 登录
  USER_LOGIN_SUCCESS,

  // 退出登录
  USER_LOGOUT_SUCCESS,

  // 首页推荐店铺
  FETCH_RECOMMEND_SHOP_SUCCESS,

  //获取完全资料 -- lxz
  USER_GET_GROUPINFO_ALL_START,
  USER_GET_GROUPINFO_ALL_SUCCESS,
  USER_GET_GROUPINFO_ALL_FAIL,
  USER_GET_GROUPINFO_ALL_CANCEL,

  // 保存资料 -- lxz
  USER_SAVE_GROUPINFO_ALL_START,
  USER_SAVE_GROUPINFO_ALL_SUCCESS,
  USER_SAVE_GROUPINFO_ALL_FAIL,
  USER_SAVE_GROUPINFO_ALL_CANCEL,

  // 获取缓存信息 --- lxz
  USER_GET_GLOBAL_INFO_START,
  USER_GET_GLOBAL_INFO_SUCCESS,
  USER_GET_GLOBAL_INFO_FAIL,
  USER_GET_GLOBAL_INFO_CANCEL,

  // 获取合作店铺 --- lxz
  TRADE_GET_MEALS_START,
  TRADE_GET_MEALS_SUCCESS,
  TRADE_GET_MEALS_FAIL,
  TRADE_GET_MEALS_CANCEL,

  // 首页banner图片
  FETCH_BANNER_IMAGE_START,
  FETCH_BANNER_IMAGE_SUCCESS,

  // 获取交易记录 --- lxz
  TRADE_GET_INFOLIST_START,
  TRADE_GET_INFOLIST_SUCCESS,
  TRADE_GET_INFOLIST_FAIL,
  TRADE_GET_INFOLIST_CANCEL,
  DELETE_ALL_TRADEOFCACHE,

  // 修改本地头像
  SET_NEW_LOGO_FROM_GROUP,

  //修改isOnline, groupName
  CHANGE_ISONLINE,

  // 完善资料
  USER_INPUT_MORE_INFO_SUCCESS,

  //网络状态变化
  CHANGE_NET_INFO,

  // 改变版本号
  CHANGE_APP_VERSION,

} from '../actions/user.action';

// 初始化用户登录数据
const $initialState = Immutable.fromJS({
  userInfo: {},				// 用户信息
  token: '',
  recommendShop: [],  // 首页推荐店铺
  banners: {          // 首页banner图片
    status: 'start',
    list: [],
  },
  groupInfo: {        // 用户操作资料 ---lxz
    status: 'start',
    info: {},
    saveStatus: 'start'
  },
  cache: {            // 缓存信息
    status: 'start',
    data: {}
  },
  tradeList: [
    {                 // 交易记录 -- 未结算
      status: 'start',
      list: [],
    },
    {                 // 交易记录 -- 已结算
      status: 'start',
      list: [],
    },
  ],
  meals: {            // 合作的餐企
    status: 'start',
    list: [],
  },
  netStatus: true,
  versionData: {
    open: false,    // 底部设置是否显示
    update: false,  // 版本信息是否显示
    data: {},
    nowVer: {},
  },
});

export const user = ($$state = $initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    // 登录中
    case USER_LOGIN_SUCCESS:
      return $$state.set('userInfo', Immutable.fromJS(payload.purchaserUserVo || payload.data.purchaserUserVo))
        .set('token', payload.accessToken ? payload.accessToken : (payload.data ? payload.data.accessToken : ''));
      break;

    // 登出
    case USER_LOGOUT_SUCCESS:
      return $$state.set('userInfo', Immutable.fromJS({}))
        .set('token', '');
      break;

    // 获取推荐店铺
    case FETCH_RECOMMEND_SHOP_SUCCESS:
      return $$state.set('recommendShop', Immutable.fromJS(Array.isArray(action.payload.data) ? action.payload.data: []));
      break;

    // 首页banner图片
    case FETCH_BANNER_IMAGE_START:
      return $$state.setIn(['banners','status'],'pending');
    case FETCH_BANNER_IMAGE_SUCCESS:
      if($$state.getIn(['banners','status']) === 'pending') {
        return $$state.setIn(['banners','status'],'success')
          .setIn(['banners','list'],Immutable.fromJS(action.payload.data.length ? action.payload.data : []))
      }
      return $$state;

    // 获取资资料
    case USER_GET_GROUPINFO_ALL_START:
      return $$state.setIn(['groupInfo', 'status'], 'pending');
      break;
    case USER_GET_GROUPINFO_ALL_SUCCESS:
      return $$state.setIn(['groupInfo', 'status'], 'success').setIn(['groupInfo', 'info'], Immutable.fromJS(action.payload.data));
      break;
    case USER_GET_GROUPINFO_ALL_FAIL:
      return $$state.setIn(['groupInfo', 'status'], 'fail');
      break;
    case USER_GET_GROUPINFO_ALL_CANCEL:
      return $$state.setIn(['groupInfo', 'status'], 'cancel');
      break;

    // 保存资料
    case USER_SAVE_GROUPINFO_ALL_START:
      return $$state.setIn(['groupInfo', 'saveStatus'], 'pending');
      break;
    case USER_SAVE_GROUPINFO_ALL_SUCCESS:
      $$state = $$state.mergeIn(['groupInfo', 'info'], Immutable.fromJS(action.payload.reqPayload.data))
      return $$state.setIn(['groupInfo', 'saveStatus'], 'success');
      break;
    case USER_SAVE_GROUPINFO_ALL_FAIL:
      return $$state.setIn(['groupInfo', 'saveStatus'], 'fail');
      break;
    case USER_SAVE_GROUPINFO_ALL_CANCEL:
      return $$state.setIn(['groupInfo', 'saveStatus'], 'cancel');
      break;

    // 获取缓存
    case USER_GET_GLOBAL_INFO_START:
      return $$state.setIn(['cache', 'status'], 'pending');
      break;
    case USER_GET_GLOBAL_INFO_SUCCESS:
      if(1 === (action.payload.data.isInvalid - 0)){  // token 失效清除token
        $$state = $$state.set('token', '');
      }
      AsyncStorage.setItem('userGlobal', JSON.stringify(action.payload.data || {}));
      $$state = $$state.mergeIn(['userInfo'],Immutable.fromJS(action.payload.data.userInfo))
      AsyncStorage.setItem('userInfo', JSON.stringify({purchaserUserVo: $$state.get('userInfo').toJS() || {}, accessToken: $$state.get('token')}));
      return $$state.setIn(['cache', 'status'], 'success').setIn(['cache', 'data'], Immutable.fromJS(action.payload.data || {}));
      break;
    case USER_GET_GLOBAL_INFO_FAIL:
      if(action.payload.response.code === '00120113009'){ // 版本相同 ==
        return $$state.setIn(['cache', 'status'], 'success').setIn(['cache', 'data'], Immutable.fromJS(action.payload.reqPayload.oldCache || {}));
      }
      if(action.payload.reqPayload.oldCache){ // 版本相同 ==
        $$state = $$state.setIn(['cache', 'data'], Immutable.fromJS(action.payload.reqPayload.oldCache));
      }
      return $$state.setIn(['cache', 'status'], 'fail');
      break;
    case USER_GET_GLOBAL_INFO_CANCEL:
      return $$state.setIn(['cache', 'status'], 'cancel');
      break;

    // 获取合作餐企
    case TRADE_GET_MEALS_START:
      return $$state.setIn(['meals', 'status'], 'pending');
      break;
    case TRADE_GET_MEALS_SUCCESS:
      return $$state.setIn(['meals', 'status'], 'success').setIn(['meals', 'list'], Immutable.fromJS(action.payload.data instanceof Array ? action.payload.data : []));
      break;
    case TRADE_GET_MEALS_FAIL:
      return $$state.setIn(['meals', 'status'], 'fail');
      break;
    case TRADE_GET_MEALS_CANCEL:
      return $$state.setIn(['meals', 'status'], 'cancel');
      break;

    // 获取交易记录
    case TRADE_GET_INFOLIST_START:
      return $$state.setIn(['tradeList', action.payload.nowIndex, 'status'], 'pending');
      break;
    case TRADE_GET_INFOLIST_SUCCESS:
      if(1 === action.payload.reqPayload.data.pageNum){
        $$state = $$state.setIn(['tradeList', action.payload.reqPayload.nowIndex, 'list'], Immutable.fromJS(action.payload.data.list instanceof Array ? action.payload.data.list : []));
      }
      else{
          $$state = $$state.updateIn(['tradeList',action.payload.reqPayload.nowIndex, 'list'], (old) => {
            return old.concat(action.payload.data.list instanceof Array ? action.payload.data.list : [])
          })
      }
      return $$state.setIn(['tradeList', action.payload.reqPayload.nowIndex,'status'], 'success')
      break;
    case TRADE_GET_INFOLIST_FAIL:
      return $$state.setIn(['tradeList', action.payload.reqPayload.nowIndex,'status'],'fail');
      break;
    case TRADE_GET_INFOLIST_CANCEL:
      return $$state.setIn(['tradeList', action.payload.nowIndex,'status'],'cancel');
      break;
    case DELETE_ALL_TRADEOFCACHE:
      $$state = $$state.setIn(['tradeList', 0 ,'list'],Immutable.fromJS([]));
      return $$state.setIn(['tradeList', 1 ,'list'],Immutable.fromJS([]));
      break;

    case SET_NEW_LOGO_FROM_GROUP:
      return $$state.setIn(['userInfo','groupLogoUrl'],action.payload);
      break;

    case USER_INPUT_MORE_INFO_SUCCESS:
      return $$state.setIn(['userInfo','purchaserUserName'],action.payload.reqPayload.data.groupName);
      break;

    case CHANGE_ISONLINE:
      return $$state.mergeDeepIn(['cache','data','userInfo'],Immutable.fromJS(action.payload));
      break;

    //网络状态变化
    case CHANGE_NET_INFO:
      return $$state.set('netStatus', action.payload);
      break;

    case CHANGE_APP_VERSION:
      return $$state.mergeIn(['versionData'], Immutable.fromJS(action.payload));

    default:
      return $$state
  }
}
