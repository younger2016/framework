import React,{Component} from 'react';
import { StyleSheet, Platform } from 'react-native';

export const styleConsts = {
  // 颜色
  mainColor: '#ED5655',           // 主色系
  mainColorActive: '#DA4453',     // 主色系 active
  mainColorOpacity: 'rgba(237,85,101,0.5)',    // 主色系禁用
  deepGrey: '#222',               // 深灰色  用于重要标题、内容
  moreGrey: '#333',               // 深灰色  用于重要标题、内容
  darkGrey: '#666',               // 暗灰色  用于标题、内容
  grey: '#999',                   // 灰 色   用于次要标题内容
  middleGrey: '#AEAEAE',          // 中灰色  常用于辅助文字颜色
  lightGrey: '#eee',              // 浅灰色  用于分割线 输入框
  white: '#FFF',                  // 白色    白色文字
  red: '#F00',                    // 红色    红色文字
  green: '#0A0',                  // 红色    红色文字
  bgGrey: '#F3F3F3',              // 比白色灰一点 页面背景色 或者 按钮的背景
  bgSeparate: '#FAFAFA',          // 模块分割色
  orange: '#F6BB42',              // 比白色灰一点 页面背景色 或者 按钮的背景
  remindColor: '#ed5655',         // 用于提示的背景，字体颜色
  screenLeft: 10,                 // 距离左侧手机边框距离
  screenRight: 10,                // 距离右侧手机边框距离
  headerHeight: Platform.OS === 'android' && Platform.Version <= 19 ? 44 : 64, // 根据平台，设置不同的头部导航高度
  headerPaddingTop: Platform.OS === 'android' && Platform.Version <= 19 ? 0 : 20 , // 根据平台，设置不同的头部是否具有paddingTop
  // headerHeight: 64,    // 根据平台，设置不同的头部导航高度
  // headerPaddingTop: 20, // 根据平台，设置不同的头部是否具有paddingTop
  btnBg: '#ffa351', // 收藏按钮背景色
  activeA: '#1ab394', // 突出字体颜色
  headerLine: '#DDD',

  // 字体大小
  H1: 18,
  H2: 16,
  H3: 13,
  H4: 12,
  H5: 10,
  H6: 9,

  // 圆角
  br: 7.5,

  //分割线高度
  sepLine: 0.5,

  // 分类搜索框背景色
  serachBg: '#f0f2f5',
};
