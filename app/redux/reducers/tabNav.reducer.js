/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-09-21T16:10:57+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: tabNav.reducer.js
 * @Last modified by:   xf
 * @Last modified time: 2017-09-21T16:43:51+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import Immutable from 'immutable';
import { NAV_TO_MAIN_SCREEN_PAGE, NAV_TO_USER_SCREEN } from '../actions/nav.action'
let initIndex = 0;
let inited = false;
export const setInitIndex = (index) => {
  initIndex = index || 0;
  inited = true;
}
 const $initialState = Immutable.fromJS({
   routes:
     [{
        key: "MainScreen",
        routeName: "MainScreen"
      }, {
        key: "Category",
        routeName: "Category"
      }, {
        key: "Cart",
        routeName: "Cart"
      }, {
        key: "User",
        routeName: "User"
      }
    ],
   index: 0
 });

 const TAB_NAVIGATION = "Navigation/NAVIGATE"

 export const tabNav = ($$state = $initialState, action) => {
   if($$state && $$state.toJS().index !== initIndex && inited){
        $$state = $initialState.set('index', initIndex);
    }
    inited = false;
   switch (action.type) {
     case TAB_NAVIGATION:
      if(action.routeName == "MainScreen") {
        return $$state.set("index", 0)
      }
      if(action.routeName == "Category") {
        return $$state.set("index", 1)
      }
      if(action.routeName == "Cart") {
        return $$state.set("index", 2)
      }
      if(action.routeName == "User") {
        return $$state.set("index", 3)
      }
      break;
     case NAV_TO_MAIN_SCREEN_PAGE:
       return $$state.set("index", 0);
     break;
     case NAV_TO_USER_SCREEN:
       return $$state.set("index", 3);
     break;
     default:
       return $$state;
       break;
   }
 };
