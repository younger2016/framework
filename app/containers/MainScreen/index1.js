/*eslint linebreak-style: ["error", "windows"] */
/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-20T14:51:33+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: index.jsx
 * @Last modified by:   xf
 * @Last modified time: 2017-09-14T15:56:37+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

/**
 * 首页
 */
import React from 'react';
import { View, StyleSheet, Text, Image, TouchableWithoutFeedback, Platform, Linking } from 'react-native';
import { connect } from 'react-redux';
import HeaderSearchBtn from '../../components/HeaderSearchBtn'; // 头部搜索
import HeaderBanner from './components/HeaderBanner';           // 轮播
import IconListRender from './components/EntranceIcon';         // 小图标列表
import RecommendMerchant from './components/RecommendMerchant'; // 推荐店铺
import BottomLine from './components/BottomLine';
import { styleConsts } from '../../utils/styleSheet/styles'
import { userLoginSuccess, fetchRecommendShopA, getGlobalInfo, CHANGE_APP_VERSION, } from '../../redux/actions/user.action'
import {
  NAV_TO_PURCHASE_LIST,
} from '../../redux/actions/nav.action';
import {PullScrollview} from '../../components/PullList'
import codePush from 'react-native-code-push';
import Immutable from 'immutable'
import UpdateAlert from '../../components/UpdateAlert';
import RNFetchBlob from 'react-native-fetch-blob';
import { DOWNLOAD_IOS_APK } from '../../config/config.staging';

class MainScreen extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      opacity: 0,
      y: 0,
      marginTop: 0,
      upFor: {},
    }
  }
  componentDidMount(){
    // 从缓存中获取版本信息
    if(this.props.user.getIn(['versionData','data'])) {
      this.setState({
        upFor: this.props.user.getIn(['versionData','data']).toJS(),
      })
    }
    let versionData = this.props.user.get('versionData').toJS();
    if(versionData.data.latestVersion && !this.hasSetRemind && versionData.nowVer.appVersion){
      this.setUserRemind(versionData.data, versionData.nowVer.appVersion)
    }

    // codePush.notifyAppReady();    // APP已准备好，可以进行codePush更新
    // this.codePushForUpdate();
  }
  componentWillReceiveProps(nextProps){
    let versionData = nextProps.user.get('versionData').toJS();
    if(!Immutable.is(nextProps.user.getIn(['versionData','data']), this.props.user.getIn(['versionData','data']))){
      this.setState({
        upFor: versionData.data
      })
    }
    if(versionData.data.latestVersion && !this.hasSetRemind && versionData.nowVer.appVersion){
      this.setUserRemind(versionData.data, versionData.nowVer.appVersion)
    }
  }
  render() {
    const flag = Platform.OS == 'ios' && /^11.\d+/.test(Platform.Version);
    return (
      <View style={styles.container}>
        <View style={styles.headerTop}>
          <HeaderSearchBtn opacity={this.state.opacity}/>
        </View>
        <PullScrollview
          canLoadMore={false}
          ref={component => this._scrollView = component}
          onScroll={this.onScroll}
          scrollEventThrottle = {16}
          onScrollEndDrag={this.onScrollEnd}
          style={[{position: 'relative'}, flag && { marginTop: this.state.marginTop }]}
        >
          <View style={styles.bodyCenter}>
            <HeaderBanner />
            <View style={styles.iconList}>
              <IconListRender />
            </View>
          </View>
          <RecommendMerchant />
          {
            this.props.user.get('recommendShop').toJS().length ?
              <BottomLine len={2} /> : null
          }
        </PullScrollview>
        {
          this.state.opacity !== 0 && this.state.y > 180 ?
            <TouchableWithoutFeedback onPress={this.goToTop}>
              <Image source={require('./imgs/toTop.png')} style={styles.toTop}/>
            </TouchableWithoutFeedback>: null
        }

        <UpdateAlert
          ref={(ref) => this._updateAlert = ref}
          version={this.state.upFor.latestVersion}
          desc={this.state.upFor.cueWord}
          okCallBack={() => {
            //this._updateAlert.hide();
            if(Platform.OS === 'ios'){
              Linking.canOpenURL(DOWNLOAD_IOS_APK)
                .then((supported) => {
                  if (!supported) {
                  } else {
                    return Linking.openURL(DOWNLOAD_IOS_APK);
                  }
                }).catch(err => {
                //console.log(err)
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
                  //res.path();
                  RNFetchBlob.android.actionViewIntent(res.path(), 'application/vnd.android.package-archive')
                }).catch((err) => {
                // console.log(err)
              })
            }
          }}
          cancelCallBack={() => {
            // console.log('取消更新')
          }}
          mustUpdate={true}
        />
      </View>
    )
  }

  // 滚动时调用函数(上滚不透明度降低,下滚不透明度增加)
  onScroll = (e) =>{
    if(e.nativeEvent.contentOffset.y > this.state.y){
      this.setState({
        opacity: this.state.opacity + 0.01,
        y: e.nativeEvent.contentOffset.y
      })
    }else if(e.nativeEvent.contentOffset.y > 10 && this.state.opacity>0){//e.nativeEvent.contentOffset.y >= 0 && this.state.opacity>0
      this.setState({
        opacity: this.state.opacity - 0.01,
        y: e.nativeEvent.contentOffset.y
      })
    } else {
      this.setState({
        opacity: 0,
        y: 0,
      })
    }
  };

  // 滚动结束之后调用函数(顶部为0,否则为1)
  onScrollEnd = (e) =>{
    if(Platform.OS == 'ios'){
      if( -20 == e.nativeEvent.targetContentOffset.y){
        this.setState({
          marginTop: -20,
          opacity: 0
        })
      }else{
        this.setState({
          marginTop: 0,
          opacity: parseInt(e.nativeEvent.targetContentOffset.y)
        })
      }
    }else{
      this.setState({
        marginTop: 0,
        opacity: parseInt(e.nativeEvent.contentOffset.y)
      })
    }
  };

  // 滑到顶部
  goToTop = () =>{
    let scroll = this._scrollView._faltList;
    if(Platform.OS == 'android') {
      scroll.scrollTo({x: 0, y: 0, animated: true});
    }else{
      this._scrollView.refs._scrollViewInside.scrollTo({x: 0, y: 0, animated: true});
    }

    this.setState({
      opacity: 0,
      y: 0
    })
  };

  // 检查是否需要更新安装包
  codePushForUpdate = () => {
    codePush.getConfiguration().then((config) => {    // 拿到codepush的配置信息
      // alert(JSON.stringify(config));
      // 当前版本
      this.versionConfig = config;
      this.props.setNewVersion({
        nowVer: config,
      });
      codePush.checkForUpdate(config.deploymentKey).then((update) => { // 检查新版本
        // alert(update ? JSON.stringify(update) : null);
        if(update){  // 如果有新版版本
          // codePush.InstallMode.ON_NEXT_RESTART // 下次重启生效
          // codePush.InstallMode.ON_NEXT_RESUME // 安装完成后会在应用进入后台后重启更新 --用于默默更新
          // codePush.InstallMode.IMMEDIATE     // 安装完成立即重启更新

          // mandatory 可用来判断更新包是否需要用户强制更新
          if(update.appVersion !== config.appVersion){ // 强更新，需要去应用市场
            // Alert.alert(
            //   '更新提示',
            //   '需要更新整个app',
            //   [
            //     {text: '取消', onPress: () => {}},
            //     {text: '更新', onPress: () => {}},
            //   ]
            // )
          }
          else{ // 静默更新
            this.downloadPackage(update, codePush.InstallMode.ON_NEXT_RESTART)
            // if(update.description && update.description !== ''){ // 显示更新， description为标准的JSON字符串
            //   // {Mandatory: false||true, description: ['更新说明']}
            //   // 提示用户稍后更新，立即更新
            //   Alert.alert(
            //     '更新提示',
            //     '更新js包',
            //     [
            //       {text: '稍后更新', onPress: () => {}},
            //       {text: '立即更新', onPress: () => {
            //         this.downloadPackage(update, codePush.InstallMode.ON_NEXT_RESTART)
            //       }},
            //     ]
            //   )
            //
            //
            // }
            // else{ // 默默更新
            // }
          }
        }
      }).catch((err) => { // 检测更新出错
        // alert(err+ '---检测更新出错')
      })
    }).catch((err) => { // 获取配置出错
      // alert(err+ '---获取配置出错')
    })
  };

  downloadPackage = (update, installMode, minimumBackgroundDuration) => {
    update.download((event) => { // 进度提示
      // receivedBytes -- 目前下载量， totalBytes --- 总的下载量
      // if(installMode !== codePush.InstallMode.ON_NEXT_RESUME){
      //   this._spinner.show('loading', '正在下载...')
      // }

    }).then((downloadPackage) => { // 更新成功, 得到安装包
      this.downloadPackage = downloadPackage;
      this.installPackage(installMode, minimumBackgroundDuration)

    }).catch((err) => {
      // 失败
      // alert(err+ '---更新失败')
    })
  };

  installPackage = (installMode, minimumBackgroundDuration = 0) => { // 解析安装包
    // minimumBackgroundDuration, 处于后台多久之后触发重启生效
    //installMode === codePush.InstallMode.ON_NEXT_RESUME,minimumBackgroundDuration才有效
    this.downloadPackage.install(
      installMode,
      minimumBackgroundDuration,
      this._updatedInstalledCallback
    )
      .then(() => {
        // 下载并解析成功
        // if(installMode !== codePush.InstallMode.ON_NEXT_RESUME){
        //   // 提示用户手动重启，或则立马重启
        //   Alert.alert(
        //     '更新提示',
        //     '更新js包成功',
        //     [
        //       {text: '稍后', onPress: () => {}},
        //       {text: '立即重启', onPress: () => {
        //         codePush.restartApp()
        //       }},
        //     ]
        //   )
        // }
        // else{ // 静默更新，后台自动重启
        //   alert('静默更新成功')
        // }

      })
      .catch((error) => {
        // 解析新的js包出错
        // alert(err+ '---解析新的js包出错')
      })
  };

  // 强制更新
  setUserRemind = (data, now) => {
    this.hasSetRemind = true;
    let nowVerson = now.replace(/[^0-9]/ig,"");
    let forcedUpdateVersio = data.forcedUpdateVersio.replace(/[^0-9]/ig,"");
    let latestVersion = data.latestVersion.replace(/[^0-9]/ig,"");
    if(nowVerson <= forcedUpdateVersio){ // 需要强制更新
      this._updateAlert.show()
    } else if(latestVersion > nowVerson){ // 设置提醒
      this.props.setNewVersion({
        open: true,
        update: true,
      })
    }
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  bodyCenter :{
    zIndex:-1
  },
  headerTop: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    top: 0
  },
  iconList: {
    marginTop: 24,
  },
  toTop: {
    position:'absolute',
    right: 15,
    bottom: 15,
    width: 32,
    height: 32
  }
})

const mapStateToProps = (state) => {
  return {
    user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    login: ()=>{
      dispatch({type: "Login"})
    },
    // 采购清单
    navToPurchaseList: (opts) => {
      dispatch({type: NAV_TO_PURCHASE_LIST})
    },
    userLoginSuccess: (opts) => {
      dispatch(userLoginSuccess(opts))
    },
    fetchRecommendShop : (opts)=>{
      dispatch(fetchRecommendShopAC(opts));
    },
    fetchGlobalInfo: (opts) => {
      dispatch(getGlobalInfo(opts))
    },
    // 更改版本信息
    setNewVersion: (opts) => {
      dispatch({type: CHANGE_APP_VERSION, payload: opts });
    },
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(MainScreen)
