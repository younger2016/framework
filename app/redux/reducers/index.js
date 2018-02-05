/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-24T10:12:35+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: index.js
 * @Last modified by:   xf
 * @Last modified time: 2017-09-21T17:29:35+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import { combineReducers } from 'redux'

import { user } from './user.reducer'
import navReducer from './nav.reducer'
import { products } from './products.reducer'
import { shopCenter } from './shopCenter.reducer';
import { storesCenter } from './storesCenter.reducer'
import { employeeInfo } from './employeeManagement.reducer';
import { cart } from './cart.reducer'
import { tabNav } from './tabNav.reducer'
import { orderCenter } from './orderCenter.reducer'

export default combineReducers({
  user,
  nav: navReducer,
  tabNav,
  products,       // 商品
  shopCenter,     // 店铺中心
  storesCenter,   // 门店中心
  employeeInfo,   // 员工管理
  cart,           // 购物车
  orderCenter,    // 订单中心
})
