/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-20T14:29:08+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: index.jsx
 * @Last modified by:   xf
 * @Last modified time: 2017-08-07T14:15:17+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'
import AppNavigator from './AppNavigator'
import store from './redux/configureStore'
import SplashScreen from 'react-native-splash-screen'
import { addNavigationHelpers, NavigationActions  } from 'react-navigation'
import { BackHandler, Platform, NetInfo, Alert, CameraRoll } from 'react-native';
import { toastShort } from './components/toastShort';
import Toast from 'react-native-root-toast';
import Dimensions from 'Dimensions';
import RNExitApp from 'react-native-exit-app';
import {changeNetInfo} from './redux/actions/user.action'
import {getTask, setTask} from './utils/deskTask'
import returnStore, { settingStore } from './utils/returnStore'
import Permissions from 'react-native-permissions'
require('./config/i18n');
const { height } = Dimensions.get('window');
class AppWithNavigationState extends Component {

  componentDidMount() {

    if(Platform.OS == 'android'){
      SplashScreen.hide();
    }else{
      //ios下判断当前app是否获取了相机、相册权限,没有即主动获取
      Permissions.checkMultiple(['camera', 'photo']).then(response => {
        if(response.camera == 'undetermined'){
          Permissions.request('camera').then(()=>{
            if(response.photo == 'undetermined'){
              Permissions.request('photo');
            }
          });
        }
      })
    }

    //判断当前网络状态
    NetInfo.isConnected.addEventListener(
      'change',
      (status) => {
        this.props.dispatch(changeNetInfo(status))
      }
    );

    if(Platform.OS === 'android'){
        let self = this;
        let lastBackPressed = null;
        BackHandler.addEventListener('hardwareBackPress', function() {
          let backTask = getTask();
          let nav = returnStore().nav.routes;
          let key = nav[nav.length - 1].key;
          if((self.props.nav.routes.length === 1 || (backTask.key && key === backTask.key )) && backTask && backTask.goBack instanceof Function){
            backTask.goBack();
          } else {
            if(self.props.nav.routes.length === 1){ // 现在是一级页面， 再按一次就退出app
              if(!lastBackPressed){ // 第一次点
                lastBackPressed = Date.now();
                self.toast && Toast.hide(self.toast);
                self.toast = toastShort('再按一次退出APP', () => {}, height - 150)
              }else{
                if (lastBackPressed + 2000 > Date.now()) { // 退出app
                  lastBackPressed = null;
                  setTask(null);
                  RNExitApp.exitApp();
                }
                else{
                  lastBackPressed = Date.now();
                  self.toast && Toast.hide(self.toast);
                  self.toast = toastShort('再按一次退出APP', () => {}, height - 150)

                }
              }
            }else{ // 正常返回
              self.props.dispatch(NavigationActions.back());
            }
          }
          return true;
        });
    }
  }

  componentWillMount(){
    settingStore(store);
  }

  render() {
    return (
      <AppNavigator
        navigation={addNavigationHelpers({
          dispatch: this.props.dispatch,
          state: this.props.nav,
        })}
      />
    )
  }
}

AppWithNavigationState.propTypes = {
  dispatch: PropTypes.func.isRequired,
  nav: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => {
  return {
    nav: state.nav,
    $tabNav: state.tabNav,
  }
};
const App = connect(mapStateToProps)(AppWithNavigationState)

class Root extends Component {

  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}

export default Root
