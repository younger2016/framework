/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-08-01T11:29:15+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: react-native.js
 * @Last modified by:   xf
 * @Last modified time: 2017-08-01T13:32:27+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */
const rn = require('react-native')
jest.mock('Linking', () => {
  // we need to mock both Linking.getInitialURL()
  // and Linking.getInitialURL().then()
  const getInitialURL = jest.fn()
  getInitialURL.mockReturnValueOnce({
    then: jest.fn()
  })

  return {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    openURL: jest.fn(),
    canOpenURL: jest.fn(),
    getInitialURL: jest.fn(),
  }
})
module.exports = rn
