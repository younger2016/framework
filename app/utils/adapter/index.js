/*
 * 图片上传
 * @param imgData
 */
import {PixelRatio} from 'react-native'
import Permissions from 'react-native-permissions'
import ImagePicker from 'react-native-image-picker';
import { options } from '../../containers/User/upload.config';
import I18n from 'react-native-i18n';
import Toast from 'react-native-root-toast';
import { toastShort } from '../../components/toastShort';
import {
  NAV_TO_REQUEST_PERMISSION
} from '../../redux/actions/nav.action';
const IMG_URL =  'http://res.hualala.com/'
export const uploadImg = (imgData) => {
  if (!(imgData instanceof Object || typeof imgData === 'object')) {
    throw new Error(`Expect param is instanceof Object but ${typeof imgData}`)
  }
  if (imgData.uri === undefined || imgData.fileName === undefined) {
    throw new Error(`Param is not complete`)
  }

  const formData = new FormData();
  const upload = {
    uri: imgData.uri,
    name: imgData.fileName,
    // enctype: 'multipart/form-data',
    type: 'multipart/form-data',
  };
  formData.append('upload', upload);

  return fetch('http://file.hualala.com/upload!mobileClient.action', {
    method: 'POST',
    body: formData,
  })
    .then((response) => {
      if (response.status >= 200 && response.status < 300) {
        if (response.headers.get("content-type").indexOf('application/json') !== -1) {
          return response.json();
        }
        return response.text();
      }
    })
    .then((responseText) => {
      if (responseText) {
        return `${responseText}`;
      }
      throw new Error(`The response is valid`);
    })
    .catch((err) => {
      throw new Error(`upload failed.${err.message}`)
    });
};

export const getImgUrl = (url, width, height, rule = '') => {
  if(url){
    const pixel = PixelRatio.get();
    const testUrl = "^((https|http|ftp|rtsp|mms)?://)";
    const re = new RegExp(testUrl);
    const urlArr = url.split('.');
    const imgType = urlArr[urlArr.length - 1];  //图片后缀
    let newUrl = url.replace(`.${imgType}`, '');  //去掉后缀后的url
    if(re.test( newUrl )){
      return `${newUrl}${ width ? `=${Math.ceil(width * pixel)}` : ''}${ height ? `x${Math.ceil(height * pixel)}` : ''}${rule}.${imgType}`;
    }
    return `${IMG_URL}${newUrl}${ width ? `=${Math.ceil(width * pixel)}` : ''}${ height ? `x${Math.ceil(height * pixel)}` : ''}${rule}.${imgType}`;
  }
  return '';
};

/*
* 判断权限。上传图片
* self -> this, success -> 上传成功回调, fail -> 上传失败回调, before -> 上传之前回调
* */
export const checkAndUpload = (self, success, fail, before) =>{
  Permissions.checkMultiple(['camera', 'photo']).then(status => {
    if(status.camera == 'denied' || status.photo == 'denied'){
      let type = status.camera == 'denied' && status.photo == 'denied' ? 'both' :
        status.camera == 'denied' ? 'camera' : 'photo';
      self.props.navigation.dispatch({type: NAV_TO_REQUEST_PERMISSION, payload: type})
    }else if(status.camera == 'authorized' && status.photo == 'authorized'){
      ImagePicker.showImagePicker(options, (response) => {
        if (response.didCancel) {
          return;
        } else if (response.error) {
          self.toast && Toast.hide(this.toast);
          self.toast = toastShort('图片上传发生错误');
        }else if (response.customButton) {
          return;
        }  else {
          if(typeof before == 'function'){
            before()
          }
          uploadImg(response)
            .then((res) => {
              if(typeof success == 'function'){
                success(res)
              }
            })
            .catch((err) => {
              if(typeof fail == 'function'){
                fail(err)
              }
              self.toast && Toast.hide(self.toast);
              self.toast = toastShort(I18n.t('uploadFail'));
            })
        }
      })
    }
  });
}