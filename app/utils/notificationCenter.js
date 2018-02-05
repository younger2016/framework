// by 李小章
// 通知中心，处理通知，跳转等操作
import {pageCodeList} from '../config/pageCode';
import AliyunPush from 'react-native-aliyun-push';
import returnStore from './returnStore';
import {NAV_TO_MAIN_SCREEN_PAGE, NAV_TO_LOGIN_SCENE, NAV_TO_NOTIFICATIO_PAGE } from '../redux/actions/nav.action'
import Platform from 'Platform';
import {setTask, setBackGuide} from './deskTask';
import { setInitIndex } from '../redux/reducers/tabNav.reducer'

let contDispatch = () => {};
let navigation = {
  dispatch: () => {},

};
let openedInfo = null;
const strictGotoPage = (opts) => { // 不重置页面的跳转，用于app在运行的时候；在app的启动因为是点击通知进入的时候重置路由进入响应页面
  contDispatch({
    type: NAV_TO_NOTIFICATIO_PAGE,
    payload: opts
  })
}
const navGotoPage = (routeName, payload, router) => { // 跳转到一级页面在app运行的时候
  if(router.routes.length > 1){
    let key = router.routes[1].key;
    navigation.goBack(key);
  }
  navigation.dispatch({
    routeName,
    type: "Navigation/NAVIGATE",
    payload,
  })
}
const goToHome = () => {
  contDispatch({
    type: NAV_TO_MAIN_SCREEN_PAGE,
  })
}

const gotoLogin = () => {
  contDispatch({
    type: NAV_TO_LOGIN_SCENE,
  })

}

// 保存dispath分发器
export const setStrictDispath = (dispath) => {
  contDispatch = dispath;
}

// 保存navigation 一级页面的跳转
export const setNavDispath = (nav) => {
  navigation = nav;
}

export const setListener = () => {
  AliyunPush.addListener(mothodListener);
}
export const test = () => { // 测试用例 app运行跳转
  mothodListener({
    type: 'notification',
    actionIdentifier: 'opened',
    extras: {
      pageCode: 'orderList',
      pageData: JSON.stringify({status: 2}),
    }
  })

}
export const test2 = () => { // 测试用例， app启动跳转
  openedInfo = {
    type: 'notification',
    actionIdentifier: 'opened',
    openStartApp: true,
    extras: {
      pageCode: 'orderList',
      pageData: JSON.stringify({status: 2}),
    }
  }
  carriedOpenEd()

}
export const setOpenedInfo = (info) => {
  openedInfo = info;
}

/// 处理app没有被启动的时候在通知启动了app  async
 export const carriedOpenEd = async (fn) => {
   let nowInfo = null;
   if(!openedInfo){
     nowInfo =  await new Promise((resolve, reject) => {
       AliyunPush.getOpenEd((opend) => {
           resolve(opend)
       }, true)
     })
    if(nowInfo && typeof nowInfo === 'object'){
      nowInfo['openStartApp'] = true;
      if(nowInfo.extraStr){
        nowInfo['extras'] = openedInfo.extraStr;
      }
    }
    openedInfo = nowInfo;
   }
  if(openedInfo && typeof openedInfo === 'object'){ // 去跳转
      mothodListener(openedInfo);


  }else{ // 去首页
    if(fn instanceof Function){
      fn();
    }
    else{
      goToHome();
    }

  }

}


// 处理app运行中点击了通知栏
const mothodListener = (e) => {
  //console.log(e)
  //alert(JSON.stringify(e));
  //e结构说明:
  //e.type: "notification":通知 或者 "message":消息
  //e.title: 推送通知/消息标题
  //e.body: 推送通知/消息具体内容
  //e.actionIdentifier: "opened":用户点击了通知, "removed"用户删除了通知, 其他非空值:用户点击了自定义action（仅限ios）
  //e.extras: 用户附加的{key:value}的对象
  if((e.type === 'notification' && e.actionIdentifier === 'opened') || e['openStartApp']){ // 用户在app运行中点击的通知栏
    // 先判断是否登陆
    openedInfo = e;
    let store = returnStore();
      // 可能存在特殊页面，比如用户正在编辑某个信息，这时候跳转需要提醒用户， 用户确定后才能跳转
      // 直接进行跳转
      // 首先排除不在同一个页面，同一个页面可能只需要传送参数，不需要跳转页面
      let route = store.nav;
      let tabNav = store.tabNav.toJS().index;
      if(e.extras && typeof e.extras === 'object' && e.extras.pageCode && '' !== e.extras.pageCode){
        let pageInfo = pageCodeList[e.extras.pageCode];
        let token = store.user.get('token');
        if(pageInfo){ // 有效的跳转信息
          if(pageInfo.initToken &&  (!token || '' === token )){ // 去登陆
             gotoLogin()
          }
          else{
            if(pageInfo.limit instanceof Function){ // 开启特殊页面验证
              pageInfo.limit(e) && navToPage(pageInfo, e, route, tabNav)
            }
            else{
              navToPage(pageInfo, e, route, tabNav)
            }
          }


        }



     }
     else if(route.routes.length ===1 && (route.routes[0].routeName === 'Login' || route.routes[0].routeName === 'GuidePage')){
       goToHome();
     }
  }


}

const navToPage = (pageInfo, noF, router, tabNav) => { // 跳转到指定页面
  openedInfo = null;
  if(!pageInfo.pageName || '' === pageInfo.pageName || !pageInfo.zIndex ||
      (1 == pageInfo.zIndex && 'number' !== typeof pageInfo.index)
    ){
    throw new Error(`pageCodeList中预定义的跳转参数异常,请参考注释重新定义`);
  }else{
      // pagecode参数正常
      // 一级页面
      // 执行跳转前函数
      let extrasData = {};
      if(noF.extras.pageData && noF.extras.pageData.indexOf('{') > -1){
        extrasData = JSON.parse(noF.extras.pageData)
      }
      // 执行跳转
      let pageData =  Object.assign({}, pageInfo.pageData, extrasData);

      if(pageInfo.index === tabNav || // 一级页面处于同一个页面
        (pageInfo.zIndex === 2 && router.routes[router.routes.length - 1].routeName === pageInfo.pageName) // 非一级页在统一个页面
          ){
        // 在同一个页面，只执行同页面，不跳转
        pageInfo.atThisPage instanceof Function && pageInfo.atThisPage(noF, pageData,  navigation, contDispatch)

      }
      else{
        pageInfo.beforeGoto instanceof Function && pageInfo.beforeGoto(noF, pageData, navigation, contDispatch)
        if(noF['openStartApp']){ // 如果是通过点击通知进入的直接是重置路由，并且特殊处理返回方式
          if(pageInfo.zIndex == 1){
            setInitIndex(pageInfo.index)
            goToHome();
          }
          else{ // 非一级页面，特殊处理返回方式
            if(Platform.OS === 'android'){
              setTask(
                () => {
                  setTask(null);
                  goToHome();
                }, 'notificationGoback')
            }
            setBackGuide({
              pageName: 'Root',
              special: 'notificationGoback',
            })
            strictGotoPage({
              pageName: pageInfo.pageName,
              newOpen: true,
              pageData,
            })
          }



        }
        else{
          if(pageInfo.zIndex == 1){ // 一级页面,
            navGotoPage(pageInfo.pageName, pageData, router)
          }
          else{
            strictGotoPage({
              pageName: pageInfo.pageName,
              newOpen: false,
              pageData,
            })
          }
        }
        pageInfo.goToed instanceof Function && pageInfo.goToed(noF, pageData, navigation, contDispatch)

      }
    }
  }
