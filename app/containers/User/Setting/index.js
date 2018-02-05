/**
 * 设置
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, AsyncStorage, Platform, Linking } from 'react-native';
import Dimensions from 'Dimensions';
import Immutable from 'immutable';
import { ImageCache } from "react-native-img-cache";
import HeaderBar from '../../../components/HeaderBar';
import { toastShort } from '../../../components/toastShort';
import Toast from 'react-native-root-toast';
import { styleConsts } from '../../../utils/styleSheet/styles';
import BlankPage from '../../../components/BlankPage';
import { setTask } from '../../../utils/deskTask';
import UpdateAlert from '../../../components/UpdateAlert';
import * as CacheManager from 'react-native-http-cache';
import {
  NAV_TO_CLEAR_CACHE,
} from '../../../redux/actions/nav.action';
import {
  userLogoutAC,
  CHANGE_APP_VERSION,
} from '../../../redux/actions/user.action'
const { width, height } = Dimensions.get('window');
import RNFetchBlob from 'react-native-fetch-blob';
import { DOWNLOAD_IOS_APK, DOWNLOAD_APK } from '../../../config/config.staging';


class Setting extends Component{
  constructor(props){
    super(props);
    this.state = {
      visible: false,
      open: '',             // 底部设置是否显示
      nowVer: {},           // 当前版本
      upFor: {},            // 新版本
      cacheData: '0.0',     // 当前缓存
    };
  }
  componentDidMount(){
    // 获取缓存
    CacheManager.getCacheSize().then((res) => {
      this.setState({
        cacheData: (res/1024/1024).toFixed(1),
      })
    });

    // 从缓存中获取版本信息
    if(this.props.user.get('versionData')) {
      let versionData = this.props.user.get('versionData').toJS();
      this.setState({
        open: versionData.update,
        nowVer: versionData.nowVer,
        upFor: versionData.data,
      },() => {
        // 更改底部提示是否显示
        this.props.setNewVersion({
          open: false,
        })
      })
    }
  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.user.get('userInfo'), nextProps.user.get('userInfo'))){
      this.props.navigation.goBack();
    }
  }
  componentWillUnmount() {
    this._updateAlert.hide();
    setTask(null)
  }
  render() {
    return (
      <View style={styles.container}>
        <HeaderBar
          title='设置'
          navigation={this.props.navigation}
          cancelHide={true}
        />
        <View style={styles.content}>
          <TouchableWithoutFeedback onPress={ () => this.clearCache() }>
            <View style={styles.item}>
              <Text style={styles.leftTxt}>清除缓存</Text>
              <View style={{flexDirection: 'row',alignItems: 'center',}}>
                <Text style={styles.cacheText}>{this.state.cacheData}M</Text>
                <Image style={styles.leftArrow} source={require('../../../imgs/leftBar.png')} />
              </View>
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={ () => this.updateVersion() }>
            <View style={[styles.item,styles.itemNoborder]}>
              <Text style={styles.leftTxt}>版本信息</Text>
              <View style={{flexDirection: 'row',alignItems: 'center',}}>
                {
                  this.state.open ?
                    <View style={styles.remindWrapper}>
                      <Text style={styles.remindText}>新版本</Text>
                    </View> : <Text style={styles.cacheText}>V{this.state.nowVer.appVersion}</Text>
                }
                <Image style={styles.leftArrow} source={require('../../../imgs/leftBar.png')} />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>

        {
          ''=== this.props.user.get('token')? null :
          <TouchableWithoutFeedback onPress={ this.logout }>
            <View style={{width: width,alignItems: 'center'}}>
              <View style={styles.btnWrapper}>
                <Text style={styles.btnTxt}>退出登录</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        }

        {/*更新模态框*/}
        <UpdateAlert
          ref={(ref) => this._updateAlert = ref}
          version={this.state.upFor.latestVersion}
          desc={this.state.upFor.cueWord}
          okCallBack={() => {
            alert(this.state.upFor.purchasersApkDownloadUrl)
            this._updateAlert.hide();
            if(Platform.OS === 'ios'){
              Linking.canOpenURL(DOWNLOAD_IOS_APK)
                .then((supported) => {
                  if (!supported) {
                  } else {
                    return Linking.openURL(DOWNLOAD_IOS_APK);
                  }
                }).catch(err => {

              });
            }
            else{ // 安卓下载
              RNFetchBlob
                .config({
                  addAndroidDownloads : {
                    useDownloadManager : true,
                    notification : true,
                    title: '二十二城',
                    mime : 'application/vnd.android.package-archive',
                    description : '下载中...',
                    mediaScannable: true,
                    path: RNFetchBlob.fs.dirs.DownloadDir + "/data",
                  }
                })
                .fetch('GET', this.state.upFor.purchasersApkDownloadUrl)
                .then((res) => {
                  RNFetchBlob.android.actionViewIntent(res.path(), 'application/vnd.android.package-archive')
                }).catch((err) => {

              })
            }
          }}
          cancelCallBack={() => {}}
        />

        <View style={{
          flex: 1,
          width: this.state.spinVisible ? '100%': 0,
          height: this.state.spinVisible? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage
            visable={this.state.spinVisible}
            type={'loading'}
          />
        </View>
      </View>
    )
  }

  // 退出登录
  logout = () => {
    this.setState({
      spinVisible: true,
    }, () => {
      this.props.logout({
        data: {
          accessToken: this.props.user.get('token'),
        },
        success: () =>{
          this.setState({
            spinVisible: false
          }, () => {
            AsyncStorage.removeItem('userInfo');
          });
        },
        fail: () => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
          this.setState({
            spinVisible: false
          })
        }
      });
    })
  };

  // 更新版本
  updateVersion = () => {
    if(this.state.open) {
      setTask(this._updateAlert.hide);
      this._updateAlert.show(() => setTask(null))
    } else {
      this.toast && Toast.hide(this.toast)
      this.toast = toastShort('您使用的已是最新版')
    }
  };

  // 清除缓存
  clearCache = () => {
    ImageCache.get().clear();
    CacheManager.clearCache().then(() => {
      this.setState({
        spinVisible: false,
        cacheData: '0.0',
      },() => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort('已为您清除缓存');
      });
    });
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  content: {
    marginTop: 15,
    backgroundColor: styleConsts.white,
    paddingLeft: styleConsts.screenLeft,
  },
  item: {
    height: 45,
    paddingRight: styleConsts.screenRight,
    borderBottomWidth: styleConsts.sepLine,
    borderColor: styleConsts.lightGrey,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemNoborder: {
    borderBottomWidth: 0,
  },
  leftTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  rightArrow: {
    width: 6.5,
    height: 12,
  },
  rightTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
    marginRight: 10,
  },
  btnWrapper: {
    width: 345,
    height: 45,
    marginTop: 45,
    backgroundColor: styleConsts.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  leftArrow: {
    width: 5,
    height: 8,
  },
  cacheText: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
    marginRight: 5,
  },
  remindWrapper: {
    backgroundColor: 'red',
    paddingTop: 1,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 8,
    justifyContent: 'center',
    marginRight: 5,
  },
  remindText: {
    fontSize: styleConsts.H6,
    color: styleConsts.white,
    fontWeight: '600',
  },
});
const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    navToSomeWhere: (opts) => {
      dispatch({type: NAV_TO_CLEAR_CACHE});
    },
    // 退出登录
    logout: (opts) => {
      dispatch(userLogoutAC(opts))
    },
    // 更改版本信息
    setNewVersion: (opts) => {
      dispatch({type: CHANGE_APP_VERSION, payload: opts });
    }
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(Setting)
