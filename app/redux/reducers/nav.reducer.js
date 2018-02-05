

import AppNavigator from '../../AppNavigator'
import { NavigationActions } from 'react-navigation'
import Immutable,{Map} from 'immutable'
import {getBackGuide, celarBackGuide} from '../../utils/deskTask'
// Object {index: 0, routes: Array(1)}
// Object in the routes Array
// key:"Init-id-1500887361812-0"
// routeName:"Main"
// type:undefined

import * as allNAVTO from '../actions/nav.action';

const {
  NAV_TO_LOGIN_SCENE,             // 登录页面
  NAV_TO_REGISTER_SCENE,          // 注册页面
  NAV_TO_FORGET_PASSWORD_SCENE,   // 忘记密码
  NAV_TO_SEARCH_SCENE,
  NAV_TO_RECOMMEND_MERCHANT_SCENE,
  NAV_TO_CART_SCENE,              // 购物车
  NAV_TO_COMMIT_BILL_SCENE,
  NAV_TO_PURCHASE_LIST,           // 采购清单
  NAV_TO_SHOPMANEGEMENT_MAINPAGE, // 门店管理
  NAV_TO_USERMANGEMENT_MY_MEAL,   // 收藏店铺
  NAV_TO_SHOPMANEGEMENT_ADD_SHOP, // 新增门店
  NAV_TO_INPUT_INFO_SCENE,        // 完善资料
  NAV_TO_PRODUCT_DETAIL_INFO,     // 商品详情
  NAV_TO_PRODUCT_LIST,            // 商品列表
  NAV_TO_SHOPCENTER_MAIN_PAGE,
  NAV_TO_SHOPCENTER_INFO_PAGE,
  NAV_TO_SEARCH_SHOP_MAIN_PAGE,   // 搜索店铺
  NAV_TO_SHOP_BILL_PAGE,
  NAV_TO_WRITE_TIP_PAGE,
  NAV_TO_COMMIT_BILL_SUCCESS_PAGE,
  NAV_TO_MAIN_SCREEN_PAGE,        //首页
  NAV_TO_BILLS_INFO_PAGE,         //订单列表
  NAV_TO_CHECK_PRODUCT_PAGE,      //验货单
  NAV_TO_BILLS_DETAIL_PAGE,       //订单详情
  NAV_TO_TRANS_RECORD_PAGE,       //交易记录
  NAV_TO_INPUT_PERSONINFO,        // 编辑个人信息
  NAV_TO_ADD_OR_EDIT_EMPLOYEE,    // 添加/编辑员工信息,
  NAV_TO_PERSONINFO_MAIN_PAGE ,   // 个人信息主页
  NAV_TO_SETTING_PAGE,
  NAV_TO_EMPLOYEE_MANAGEEMENT,    // 员工管理
  NAV_TO_SELECT_SHOPS,            // 选择负责门店
  NAV_SEARCH_PRODUCTLIST_RESULT,  // 去搜索商品
  NAV_TO_CART_NEWPATH,            // 去购物车
  NAV_TO_PERSON_INFO_COMPENY,     // 员工信息
  NAV_TO_USER_SCREEN,             // 我的
  NAV_TO_CHANGE_ENV_SCREEN,       // 切换环境
  NAV_TO_SELECT_EMPLOYEE,         // 选择员工
  NAV_TO_SERVICE_TERM_SCENE,      // 服务条款
  NAV_TO_REQUEST_PERMISSION,      // 缺少权限
  NAV_TO_FILTER_PURCHASE_LIST,    // 筛选采购清单
  NAV_TO_NOTIFICATIO_PAGE,
} = allNAVTO;
const allNAVTOARR = Map(allNAVTO).toList(); // 取到路由数组
const initialState = {
  index: 0,
  routes: [{
    routeName: 'GuidePage',
    key: 'init',
    param: {}
  }],
  lastActionType: '',
};

const navReducer = (state = initialState, action) => {
  // 预防重复加入。只判断进来是切换页面的的case
  if (state.lastActionType === action.type && action.type !== 'Navigation/BACK') {
    return state;
  }
  if (allNAVTOARR.findIndex(type => action.type === type) > -1) {
    state.lastActionType = action.type
  }
  let nextState;
  switch (action.type) {
    case NAV_TO_CART_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'CartScreen'}),
        state
      );
      break;

    case NAV_TO_MAIN_SCREEN_PAGE:
    case NAV_TO_USER_SCREEN:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({routeName:'Root'})
          ]
        }),
        state
      );
      break;

    case NAV_TO_LOGIN_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Login', params: action.payload}),
        state
      );
      break;
    case NAV_TO_REGISTER_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'RegScreen', params: NAV_TO_REGISTER_SCENE }),
        state
      );
      break;

    case NAV_TO_FORGET_PASSWORD_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'RegScreen', params: NAV_TO_FORGET_PASSWORD_SCENE }),
        state
      );
      break;

    case NAV_TO_SEARCH_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'Search'}),
        state
      );
      break;

    case NAV_TO_RECOMMEND_MERCHANT_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'MainScreenCategory', params: action.payload}),
        state
      );
      break;

    case NAV_TO_COMMIT_BILL_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'CommitBill', params: action.payload}),
        state
      );
      break;

    case NAV_TO_SHOPMANEGEMENT_MAINPAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ShopManagementScreens'}),
        state
      );
      break;

    case NAV_TO_USERMANGEMENT_MY_MEAL:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'MyMealScreens'}),
        state
      );
      break;
    case NAV_TO_SHOPMANEGEMENT_ADD_SHOP:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'AddShopScreens'}),
        state
      );
      break;

    case NAV_TO_PURCHASE_LIST:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'PurchaseListScreen', params: action.payload }),
        state
      );
      break;

    case NAV_TO_SHOPCENTER_MAIN_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ShopCenterScreens' }),
        state
      );
      break;


    case NAV_TO_INPUT_INFO_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'InputInfo', params: action.payload }),
        state
      );
      break;

    case NAV_TO_SHOPCENTER_INFO_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ShopInfoScreens' }),
        state
      );
      break;

    case NAV_TO_SEARCH_SHOP_MAIN_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'SearchShopScreens', params: action.payload }),
        state
      );
      break;

    case NAV_TO_PRODUCT_DETAIL_INFO:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ProductDetailInfoScreens' }),
        state
      );
      break;

    case NAV_TO_PRODUCT_LIST:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ProductListScreens', params: action.payload }),
        state
      );
      break;

    case NAV_TO_SHOP_BILL_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ShopBill', params: action.payload }),
        state
      );
      break;

    case NAV_TO_WRITE_TIP_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'WriteTip', params: action.payload }),
        state
      );
      break;

    case NAV_TO_COMMIT_BILL_SUCCESS_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'CommitBillSuccess', params: action.payload }),
        state
      );
      break;

    case NAV_TO_BILLS_INFO_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'BillsInfoPage', params: action.payload }),
        state
      );
      break;

    case NAV_TO_BILLS_DETAIL_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'BillDetail', params: action.payload }),
        state
      );
      break;

    case NAV_TO_CHECK_PRODUCT_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'CheckProduct', params: action.payload }),
        state
      );
      break;

    case NAV_TO_TRANS_RECORD_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'TradeRecord', params: action.payload }),
        state
      );
      break;

    case NAV_TO_ADD_OR_EDIT_EMPLOYEE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'AddEmployeeScreens', params: action.payload }),
        state
      );
      break;

    case NAV_TO_PERSONINFO_MAIN_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'GroupInfoScreens', params: action.payload }),
        state
      );
      break;

    case NAV_TO_INPUT_PERSONINFO:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'InputInfoPersonScreens', params: action.payload }),
        state
      );
      break;

    case NAV_TO_EMPLOYEE_MANAGEEMENT:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'EmployeeManagementSrceens' }),
        state
      );
      break;

    case NAV_TO_SETTING_PAGE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'SettingScreens', params: action.payload }),state
      );
      break;

    case NAV_TO_SELECT_SHOPS:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'SelectManageShopScreens', params: action.payload }),
        state
      );
      break;

    case NAV_SEARCH_PRODUCTLIST_RESULT:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ResultSearchProScreens', params: action.payload }),
        state
      );
      break;

    case NAV_TO_CART_NEWPATH:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'CartNewPathScreen', params: action.payload }),
        state
      );
      break;

    case NAV_TO_PERSON_INFO_COMPENY:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'PersonInfoScreen', params: action.payload }),
        state
      );
      break;

    case NAV_TO_CHANGE_ENV_SCREEN:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ChangeEnvScreen', }),
        state
      );
      break;
    case NAV_TO_SERVICE_TERM_SCENE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'ServiceTerm', }),
        state
      );
      break;
    case NAV_TO_SELECT_EMPLOYEE:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'SelectEmployeeScreen', params: action.payload }),
        state
      );
      break;
    case NAV_TO_REQUEST_PERMISSION:
      nextState = AppNavigator.router.getStateForAction(
        NavigationActions.navigate({ routeName: 'RequestPermission', params: action.payload }),
        state
      );
      break;

    // case NAV_TO_FILTER_PURCHASE_LIST:
    //   nextState = AppNavigator.router.getStateForAction(
    //     NavigationActions.navigate({ routeName: 'FilterPurchaseList', params: action.payload }),
    //     state
    //   );
    //   break;
    case NAV_TO_NOTIFICATIO_PAGE: // 点击通知栏去往某个页面
      if(action.payload.newOpen){ // 在启动的时候去
        nextState = AppNavigator.router.getStateForAction(
          NavigationActions.reset({
            index: 0,
            actions: [
              NavigationActions.navigate({routeName: action.payload.pageName, params: action.payload.pageData})
            ]
          }),
          state
        );
      }
      else{ // 一般用于app运行中的跳转，且是跳转到非一级页面
        nextState = AppNavigator.router.getStateForAction(
          NavigationActions.navigate({ routeName: action.payload.pageName, params: action.payload.pageData}),
          state
        );
      }


      break;


    default:
      if (action.type === 'Navigation/BACK') {
          state.lastActionType = '';
          let backGuide = getBackGuide();
          if(backGuide && backGuide.pageName && '' !== backGuide.pageName && state.routes.length <= 1){
            switch (backGuide.special) {
              case 'notificationGoback': // 通知栏返回
                  nextState = AppNavigator.router.getStateForAction(
                    NavigationActions.reset({
                      index: 0,
                      actions: [
                        NavigationActions.navigate({routeName: backGuide.pageName, params: backGuide.data})
                      ]
                    }),
                    state
                  );

                break;
              default:
                nextState = AppNavigator.router.getStateForAction(action, state)
                break;
            }
            celarBackGuide();

          }
          else{
              nextState = AppNavigator.router.getStateForAction(action, state)
          }
      }else{
          nextState = AppNavigator.router.getStateForAction(action, state)
      }
        break
    }

  return nextState || state
}

export default navReducer
