/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-08-04T14:32:20+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: fetchUtils.js
 * @Last modified by:   xf
 * @Last modified time: 2017-09-22T09:59:02+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

/**
 **************************************************************
 商城服务  *    20       * 商城api层 20110
 *            *  商品中心 20111
 *            *  交易中心 20112
 *            *  用户中心 20113
 *            *  店铺中心 20114
 *************************************************************
 */

import { Platform, AsyncStorage, Alert } from 'react-native';
import Rx from 'rxjs';
import Immutable from 'immutable';
import codePush from 'react-native-code-push';
import md5 from 'md5'
import returnStore from '../utils/returnStore';
import uuid from './uuid'
import I18n from 'react-native-i18n'
import { getValue } from '../config/config.staging';
import serviceMappingTable from '../config/serviceMappingTable'

const SERVICE_CODE = Object.freeze({
  SUCCESS: '000', // "执行成功"
  PROTOCAL_NOT_FOUND: '00020110111', // '协议版本不存在'
  REQ_PARAMETER_ERROR: '00020110112', // '请求参数有误'
  SERVER_ERROR: '00020110113', // '服务器内部错误'
  SIG_ERROR: '00120110119', // '签名验证不通过'
  REPEAT_SUBMIT: '00020110115', // '重复提交'
  /*********以下code是自己定义的*********/
  OUTLINE_ERR: '007', // '网络错误'
  UNKNOWN_ERR: '111' //未知错误
});

let errMsg = new Error();
errMsg.name = "未知错误";
/**
 user must implment the catch to handle reject
 */
export const hllMallfetch = async (service, opts) => {

  const nowUrl = getValue();
  const GET_SERVICE_URL = nowUrl.getUrl;
  const POST_SERVICE_URL = nowUrl.postUrl;
  let $$user = returnStore().user;

  // check the service does configurate or not
  const _service = serviceMappingTable[service];
  // check net info
  if(!(Immutable.Map.isMap($$user) ? $$user.toJS().netStatus : $$user.netStatus)){
    errMsg.name = I18n.t('netWorkError');
    return Promise.reject(errMsg)
  }
  if (!(_service instanceof Object || typeof _service === 'object')) {
    errMsg.name = `Service ${service} does not exist`;
    return Promise.reject(errMsg);
  }
  // check the opts.data format
  if (!(opts.data instanceof Object || typeof opts.data === 'object')) {
    errMsg.name = `opts.data must be 'object'. Actually it's ${typeof opts.data}`
    return Promise.reject(errMsg);
  }

  let url = POST_SERVICE_URL;
  let accessToken = Immutable.Map.isMap($$user) ? $$user.toJS().token : $$user.token;
  if (_service.method === 'GET') {
    url = `${GET_SERVICE_URL}?data=${opts.data}`
  }
  // config method
  const _opts = Object.assign({ method: _service.method }, {});

  let params = {
    'data': opts.data,
  };
  _opts.body = JSON.stringify(params);
  const private_sig = "813eae6fe94441fbb39d24f641440541"; //秘钥
  const sendSign = md5(private_sig + "_" + _service.pv + "_" + _opts.body);
  let appVersion = await codePush.getConfiguration();
  // config headers
  _opts.headers = Object.assign({
    'Accept': 'application/json; charset=UTF-8',
    'Content-Type': 'application/json; charset=UTF-8',
    'pv': _service.pv,
    'cs': Platform.OS,
    'cv': appVersion.appVersion || '1.0.5', // 客户端版本号
    'traceID': uuid(),
    'source': 'shopmall-purchaser',
    'sign': sendSign
  }, _opts.headers);
  if (typeof accessToken == 'string' && accessToken.length > 0) {
    _opts.headers = Object.assign({accessToken: accessToken}, _opts.headers);
  }
  let returnSign = '';
  return fetch(url, _opts)
    .then((response) => { // 第一次过滤，网络层过滤
      if (response.status >= 200 && response.status < 300) {
        if (response.headers.get("content-type").indexOf('application/json') !== -1) {
          returnSign = response.headers.get("sign");
          return response.text()
        }
        errMsg.name = ` reuslt should be in json format, but got ${response.headers.get("content-type")}`;
        return Promise.reject(errMsg);
      }
      errMsg.name = ` ${JSON.stringify(response)}`;
      return Promise.reject(errMsg);
    })
    .then((responseText) => {

      const md5Data = md5(private_sig + '_' + responseText);

      if(returnSign !== md5Data){
        errMsg.name = '签名验证失败';
        return Promise.reject(errMsg)
      }else{
        return JSON.parse(responseText);
      }
    })
    .then((responseJSON) => { // 第二次，应用层过滤
      if (SERVICE_CODE.SUCCESS === responseJSON.code) {
        return responseJSON
      }
      let serviceError = '未知错误';

      switch (responseJSON.code) {
        case SERVICE_CODE.PROTOCAL_NOT_FOUND:
          serviceError = '协议版本不存在';
          break;
        case SERVICE_CODE.REQ_PARAMETER_ERROR:
          serviceError = '请求参数有误';
          break;
        case SERVICE_CODE.SERVER_ERROR :
          serviceError = '服务器内部错误';
          break;
        case SERVICE_CODE.SIG_ERROR:
          serviceError = '签名验证失败';
          break;
        case SERVICE_CODE.REPEAT_SUBMIT:
          serviceError = '重复提交';
          break;
        case SERVICE_CODE.OUTLINE_ERR:
          serviceError = I18n.t('netWorkError');
          break;
        default:
          return responseJSON;
          break;
      }
      errMsg.name = serviceError;
      return Promise.reject(errMsg)
    });
};

let NAV_TO_LOGIN_SCENE = "hll:nav to login scene";
const redirectToLogin = () => ({type: NAV_TO_LOGIN_SCENE});

export let hllFetch = (opts)=>{
  let {service, successAC, failAC, cancelAC, action$} = opts;
  return (action) => {
    return Rx.Observable.from(
      hllMallfetch(service, {data:action.payload.data})
    )
      .map((response) => {
        console.log('response',response)
        if ( response.code == "00120110118" ) {
          return redirectToLogin();
        }
        // 业务层过滤
        if (response.success) {
          action.payload.success && action.payload.success(Object.assign({}, response, {reqPayload: action.payload}));
          return successAC instanceof Function ? successAC(
            Object.assign({}, response, {reqPayload: action.payload})) : {type: 'GENERAL_TYPE_INFO'};
        } else {
          action.payload.fail && action.payload.fail({response,reqPayload: action.payload});
          return failAC instanceof Function ? failAC({response,reqPayload: action.payload}) : {type: 'GENERAL_TYPE_INFO'};
        }
      })
      .timeout(10000)
      .catch((err) => {
        if (err.name === "TimeoutError") {
          if(action.payload.timeout){
            action.payload.timeout();
          }else{
            action.payload.fail && action.payload.fail({
              err,
              reqPayload: action.payload,
              response: {message: I18n.t('resTimeout')}
            });
          }
          return Rx.Observable.of(failAC instanceof Function ? failAC({response:{}, err,reqPayload: action.payload}) : {type: 'GENERAL_TYPE_INFO'});
        }

        action.payload.fail && action.payload.fail({
          err,
          reqPayload: action.payload,
          response: { message: err.name }
        });
        return Rx.Observable.of(failAC instanceof Function ? failAC({response:{}, err,reqPayload: action.payload}) : {type: 'GENERAL_TYPE_INFO'});
      })
      .takeUntil(action$.ofType(cancelAC().type))
  }
}

export default hllMallfetch;
