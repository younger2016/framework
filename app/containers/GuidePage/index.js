/**
 * 引导页
 */
import React, { Component } from 'react';
import { StyleSheet, View, Image, AsyncStorage } from 'react-native';
import { connect } from 'react-redux';
import {release} from '../../config/config.staging';
import { userLoginSuccess, getGlobalInfo, CHANGE_APP_VERSION } from '../../redux/actions/user.action'
import { NAV_TO_MAIN_SCREEN_PAGE } from '../../redux/actions/nav.action'
import { setValue } from '../../config/config.staging';
import AliyunPush from 'react-native-aliyun-push';
import codePush from 'react-native-code-push';
import { setListener, setStrictDispath, setNavDispath, carriedOpenEd } from '../../utils/notificationCenter';
class GuidePage extends Component{
  constructor(props){
    super(props);
    this.state = {

    };
  }

  componentDidMount() {
    codePush.notifyAppReady();    // APP已准备好，可以进行codePush更新
    this.codePushForUpdate();
    this.props.setDispathToNF(); // 保存dispatch分发器；
    setNavDispath(this.props.navigation); // 保存nav的dispatch
    // 设置监听通知栏
    setListener();
    if(release){
      this.getStorage();
    }else{
      AsyncStorage.getItem('ENV_TYPE').then( (env) => {
        let nowEnv = env || 0;
        setValue(nowEnv);
        this.getStorage()
      })
    }
    // AliyunPush.getDeviceId((deviceId)=>{
    //   console.log(deviceId);
    // });

    // AliyunPush.getOpenEd((opend) => {
    //   console.log(opend);
    // });

    /*// 设置桌面图标角标数字(num角标数字，如果要清除请设置0)
    AliyunPush.setApplicationIconBadgeNumber(5);
    // 获取桌面图标角标数字
    AliyunPush.getApplicationIconBadgeNumber((num)=>{
      console.log("手机桌面图标角标数字:" + num);
    });

    // 获取设备号，发给后台，绑定用户
    AliyunPush.getDeviceId((deviceId)=>{
      console.log(deviceId);
    });

    //监听推送事件(app运行中保持监听,不管是前台还是后台运行，都可以监听到)
    AliyunPush.addListener(this.handleAliyunPushMessage);

    if(Platform.OS === 'android') {
      // 启动打开,在app被用户手动杀死后收到的通知,并且是点击接收到的通知打开app
      AliyunPush.getOpenEd((opend) => {
        console.log(opend);

        let payload = {
          pageName: '', // 跳转到消息对应的页面
          pageData: {},
          newOpen: true,
        };
        // 拿到开启app的通知消息
        if(opend && typeof opend === 'object') {
          payload.pageName = 'BillsInfoPage'; // 订单
        }

      },true);
    } else {
      AliyunPush.getOpenEd((opend) => {
        console.log(opend);
      });
      // release版本不能切换环境直接判断用户是否登录，测试环境需要先获取当前是哪个环境，然后再判断用户是否登录
      if(release){
        this.getStorage();
      }else{
        AsyncStorage.getItem('ENV_TYPE').then( (env) => {
          let nowEnv = env || 0;
          setValue(nowEnv);
          this.getStorage()
        })
      }
    }*/

  }

  componentWillUnmount() {
    //AliyunPush.removeListener(this.handleAliyunPushMessage);
  }

  render() {
    return (
      <View style={styles.imgWrapper}>
        <Image style={styles.img} source={require('./imgs/loading.png')} />
      </View>
    )
  }

  getStorage = () => {
    AsyncStorage.getItem("userInfo").then(user => {
      // 请求缓存
      // 检查是否有缓存
      AsyncStorage.getItem("userGlobal").then(cache => {
        if(user !== null && user !== undefined){
          let version = '';
          if(cache !== null && cache !== undefined){
            version = JSON.parse(cache).version
          }
          this.props.fetchGlobalInfo({
            data: {
              token: JSON.parse(user).accessToken,
              version,
            },
            oldCache: JSON.parse(cache),
            success: (res) => {
              if(!(res && res.data && res.data.isInvalid && 1 === (res.data.isInvalid - 0))){ // token正常
                this.props.userLoginSuccess(JSON.parse(user));
              }
              carriedOpenEd()
              //this.props.navToMainScreen();
            },
            fail: (res) => {
              if(!(res && res.data && res.data.isInvalid && 1 === (res.data.isInvalid - 0))){ // token正常
                this.props.userLoginSuccess(JSON.parse(user));
              }
              carriedOpenEd()
              //this.props.navToMainScreen();
            },
            timeout: () => {
              carriedOpenEd()
              // this.props.navToMainScreen();
            }
          })
        }else{
          this.props.fetchGlobalInfo({ // 获取游客数据
            data: {

            },
            oldCache: JSON.parse(cache),
            success: (res) => {
              //this.props.navToMainScreen();
              carriedOpenEd()
            },
            fail: (res) => {
              // this.props.navToMainScreen();
              carriedOpenEd()
            },
            timeout: () => {
              // this.props.navToMainScreen();
              carriedOpenEd()
            }
          })
        }
      })
    })
  };

  // handleAliyunPushMessage = (e) => {
  //   console.log("Message Received. " + JSON.stringify(e));
  //   //e结构说明:
  //   //e.type: "notification":通知 或者 "message":消息
  //   //e.title: 推送通知/消息标题
  //   //e.body: 推送通知/消息具体内容
  //   //e.actionIdentifier: "opened":用户点击了通知, "removed"用户删除了通知, 其他非空值:用户点击了自定义action（仅限ios）
  //   //e.extras: 用户附加的{key:value}的对象
  // };

  // 检查是否需要更新安装包
  codePushForUpdate = () => {
    codePush.getConfiguration().then((config) => {    // 拿到codepush的配置信息
      // alert(JSON.stringify(config));
      // 当前版本
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

}
const styles = StyleSheet.create({
  imgWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
  },
});

const mapStateToProps = (state) => {
  return {

  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    fetchGlobalInfo: (opts) => {
      dispatch(getGlobalInfo(opts));
    },
    userLoginSuccess: (opts) => {
      dispatch(userLoginSuccess(opts));
    },
    navToMainScreen: () => {
      dispatch({type: NAV_TO_MAIN_SCREEN_PAGE});
    },
    // 更改版本信息
    setNewVersion: (opts) => {
      dispatch({type: CHANGE_APP_VERSION, payload: opts });
    },
    setDispathToNF: () => {
      setStrictDispath(dispatch)
    }
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(GuidePage)
