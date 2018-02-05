//__DEV__ 为真是debug
// 如果是线上环境，即需要通过应用市场下载，即为release， 正式发布的 值设置为真， 若发布测试，或者本地测试，设置为假
// 正式发版production应该改为真
const production = false;
export const release = !(__DEV__) && production; // 发布正式的这个应该是个true， debug(开发测试), staging（测试人员测试）,release(正式发布)

import { AsyncStorage }from 'react-native';

export const GET_UPDATE_VERSION = release ? 'http://mobile.22city.cn/version_update' : 'http://172.16.32.48/version_update'

// iOS app的ID
const IOS_APP_ID = '1301185201';
// 安卓下载安卓包链接
export const DOWNLOAD_APK = 'http://mobile.22city.cn/shopmall/get/req';
// ios app下载地址
export const DOWNLOAD_IOS_APK = `itms-apps://itunes.apple.com/us/app/apple-store/id${IOS_APP_ID}`;

let hostConfig = {
  now: release ? 2 : 0,
  all: [
    {
      getUrl: `http://172.16.32.48:8991/shopmall/get/req`,
      postUrl: `http://172.16.32.48:8991/shopmall/post/req`,
      title: '48环境',
    },
    {
      getUrl: `http://172.16.32.61:8990/shopmall/get/req`,
      postUrl: `http://172.16.32.61:8990/shopmall/post/req`,
      title: '61环境',
    },
    {
      getUrl: `http://mobile.22city.cn/shopmall/get/req`,
      postUrl: `http://mobile.22city.cn/shopmall/post/req`,
      title: 'city环境，正式环境'
    }
  ]
};

export const setValue = (val) => { // 0,1,2
  hostConfig.now = val;
  AsyncStorage.setItem('ENV_TYPE', val + '');
};

export const getValue = (type) => {
  if('all' === type) {
    return hostConfig;
  }
  return hostConfig.all[hostConfig.now];
};
