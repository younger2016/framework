/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-09-04T13:37:47+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: routerRegister.js
 * @Last modified by:   xf
 * @Last modified time: 2017-09-05T09:16:45+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import AppRouteConfigs from '../AppRouteConfigs';

// AppRouteConfigs. Regist function-bind

registerComponent = (key, component) => {
  // key should be a string
  if (!(key instanceof String || typeof key === 'string')) {
    throw new Error(`Expect key is instanceof String. It's ${typeof key}`)
  }

  if (!(key instanceof Object || typeof key === 'object')) {
    throw new Error(`Expect key is instanceof Object. It's ${typeof component}`)
  }
  // TODO: 没有对component进行强制校验 （Screen）
  if (AppRouteConfigs.hasOwnProperty("key")) {
    throw new Error(`Component with the key ${key} already exists`)
  }

  AppRouteConfigs[key] = component;
}

export default registerComponent;
