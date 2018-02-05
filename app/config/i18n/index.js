/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-08-07T10:12:52+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: index.js
 * @Last modified by:   xf
 * @Last modified time: 2017-08-07T10:39:58+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

/**
  iOS7之前是
  zh-Hans: 简体
  zh-Hant:

  iOS8之前是
  zh-Hans: 简体
  zh-Hant: 繁体
  zh-HK: 香港繁体（增加）

  iOS9是
  zh-Hans-CN: 简体（改变）
  zh-Hant-CN: 繁体（改变）
  zh-HK: 香港繁体
  zh-TW:  台湾繁体（增加）
*/


import I18n, { getLanguages } from 'react-native-i18n'
import cn from './locales/zh-Hans-CN' // simplified chinese
import zh_Hant_CN from './locales/zh-Hant-CN'
import en from './locales/en'

// Enable fallbacks if you want 'en-us' and 'en-GB' to fallback to 'en'
I18n.fallbacks = true

I18n.translations = {
  en,
  'zh-Hans-CN': cn,
  'zh-Hans': cn,
  'zh-Hant-CN': cn,
  'zh-Hant': cn,
  'zh-HK': cn,  // 香港繁体
  'zh-TW': cn,  // 台湾繁体（增加）
}

getLanguages().then(languages => {
  // console.log(languages) // ['en-US', 'en']
})
