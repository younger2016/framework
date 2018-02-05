/*
  2017-07
  benlong 登录页面
 */
import React, { Component } from 'react'
import { TextInput, View, StyleSheet, ScrollView, Image, Text, TouchableHighlight, TouchableWithoutFeedback, AsyncStorage, Keyboard } from 'react-native'
import { connect } from 'react-redux'
import { NAV_TO_FORGET_PASSWORD_SCENE, NAV_TO_REGISTER_SCENE, NAV_TO_CHANGE_ENV_SCREEN , NAV_TO_MAIN_SCREEN_PAGE} from '../../redux/actions/nav.action';
import { styleConsts } from '../../utils/styleSheet/styles'
import  I18n  from 'react-native-i18n'
import { userLoginAC, getGlobalInfo} from '../../redux/actions/user.action'
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import {telephoneReg} from '../../utils/regTemplate';
import {release} from '../../config/config.staging';
import AliyunPush from 'react-native-aliyun-push';
import { carriedOpenEd, setOpenedInfo } from '../../utils/notificationCenter';
import { SAVE_SELECTED_SHOP_ID_AND_NAME } from '../../redux/actions/storesCenter.action'

class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      complete : false,
      data: {
        loginPWD: '',
        loginPhone: '',
      },
      logining: false,
      deviceId: '',
    };
    this.count = 0; // 达到六次就去设置环境
  }

  componentDidMount() {
    AliyunPush.getDeviceId((deviceId)=>{
    // 获取设备号，发给后台，绑定用户
      this.setState({
        deviceId
      });
    });
  }
  componentWillReceiveProps(nextProps){
  }
  componentWillUnmount() {
    this.timer && clearTimeout(this.timer);
    setTimeout(() => setOpenedInfo(null))
    // 清除通知栏暂存信息；
  }

  render() {
    const props = {};
    if(this.state.complete){
      props.onPress = this.loginFn;
    }
    return (
      <View style={{flex: 1, width: '100%', height: '100%'}}>
        <Image  style = {styles.bgImg} source={require('./imgs/bgImg.png')}/>
        <ScrollView style={{flex: 1, width: '100%', height: '100%'}} scrollEnabled={false}>
          <View>
            <TouchableWithoutFeedback onPress={()=>{this.goBack()}}>
              <View style = {styles.backIcon}>
                <Image style={styles.logoStyle2} source={require('./imgs/arrowBack.png')}/>
              </View>
            </TouchableWithoutFeedback>
            <View style = {styles.main}>

              <View style = {styles.userName}>
                <View style = {styles.telIcon}>
                  <Image style={styles.logoStyle} source={require('./imgs/mobile1.png')}/>
                </View>
                <View style = {styles.telInput}>
                  <TextInput
                    underlineColorAndroid='transparent'
                    returnKeyType = "done"
                    enablesReturnKeyAutomatically = {true}
                    clearButtonMode = "while-editing"
                    placeholderTextColor = {styleConsts.middleGrey}
                    keyboardType="number-pad"
                    maxLength={11}
                    placeholder = {I18n.t('phonePlease')}
                    onSubmitEditing= {() => { Keyboard.dismiss()}}
                    onChangeText={(text) => this.onInputChange(text, 'loginPhone')}
                    value={this.state.text}
                    style={{fontSize: styleConsts.H3, color: styleConsts.deepGrey, height: 50}}
                  />
                </View>
              </View>

              <View style = {[styles.userName, {marginTop: 8}]}>
                <View style = {styles.telIcon}>
                  <Image style={styles.logoStyle} source={require('./imgs/password1.png')}/>
                </View>
                <View style = {styles.telInput}>
                  <TextInput
                    secureTextEntry={true}
                    underlineColorAndroid='transparent'
                    returnKeyType = "done"
                    enablesReturnKeyAutomatically = {true}
                    clearButtonMode = "while-editing"
                    placeholderTextColor = {styleConsts.middleGrey}
                    placeholder = {I18n.t('passwordPlease')}
                    keyboardType="ascii-capable"
                    onSubmitEditing= {() => { Keyboard.dismiss()}}
                    onChangeText={(pwdtext) => this.onInputChange(pwdtext, 'loginPWD')}
                    value={this.state.pwdtext}
                    style={{fontSize: styleConsts.H3, color: styleConsts.deepGrey, height: 50}}
                  />
                </View>
              </View>
              <View style = {styles.buttonsBox}>
                <TouchableHighlight underlayColor={styleConsts.mainColorActive}
                                    {...props}
                                    style={[styles.buttons, this.state.complete && !this.state.logining && styles.darkButton]}
                >
                  <View >
                    <Text style={styles.btnText}>
                      {this.state.logining? '登录中...' : I18n.t('login')}
                    </Text>
                  </View>
                </TouchableHighlight>
              </View>
              <View style = {styles.operation}>
                <TouchableWithoutFeedback  onPress = {this.props.forgotPassword}>
                  <View>
                    <Text style = { styles.forgetTxt }>{I18n.t('forgetPwd')}</Text>
                  </View>
                </TouchableWithoutFeedback>
                <View style = {styles.line}></View>
                <TouchableWithoutFeedback  onPress = {this.props.toRegisterPage}>
                  <View>
                    <Text style = { styles.regText }>{I18n.t('registerNow')}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </ScrollView>

        {/*连续点击6次布局*/}
        <TouchableWithoutFeedback onPress={() => this.changeCount()}>
          <View style={styles.evnLogin} />
        </TouchableWithoutFeedback>

      </View>
    )
  }

  onInputChange = (val, title) => {
    let { data } = this.state,
      complete = true;
    data[title] = val;
    for (const info in data) {
      if (data[info] === '') {
        complete = false;
      }
    }
    this.setState({ data, complete });
  };

  loginFn = () => {
    if (!telephoneReg.test(this.state.data.loginPhone)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`请输入正确的手机号码`);
      return;
    }
    if(this.state.data.loginPWD.length < 6 || this.state.data.loginPWD.length > 20){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`请输入6-20位密码`);
      return;
    }

    if (/\s+/.test(this.state.data.loginPWD)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`密码中不能包含空格`);
      return;
    }
    this.setState({
      logining: true
    }, () => {
      this.props.userLogin({
        data: {...this.state.data, deviceId: this.state.deviceId,},
        success: (response)=>{
          AsyncStorage.setItem('userInfo', JSON.stringify(response.data));
          // 更新缓存
          AsyncStorage.getItem("userGlobal").then(cache => {
            let version = '';
            if(cache !== null && cache !== undefined){
              version = JSON.parse(cache).version
            }
            this.props.fetchGlobalInfo({
              data: {
                token: response.data.accessToken,
                version,
              },
              oldCache: JSON.parse(cache),
              fail: (res) => {
                this.goBack(carriedOpenEd)
                // this.props.navigation.goBack()
              },
              success: (res) => {
                this.goBack(carriedOpenEd)
                // this.props.navigation.goBack()
              },
              timeout: () => {
                this.goBack(carriedOpenEd)
                //this.props.navigation.goBack()
              }
            })
          });
        },
        fail: (data)=>{
          this.setState({
            logining: false
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(data && data.response && data.response.message|| '诶呀，服务器开小差了');
        },
        timeout: (data)=>{
          this.setState({
            logining: false
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(data && data.response && data.response.message|| '诶呀，服务器开小差了');
        }
      })
    });
  }

  // 连续点击6次进入修改环境
  changeCount = () => {
    if(release) return;
    this.timer && clearTimeout(this.timer);
    ++this.count;
    if(this.count === 6){
      this.count = 0;
      this.props.navToChangeEnv();
    } else{
      this.timer = setTimeout(() => {
        this.count = 0;
      }, 1000)
    }
  }

  goBack = (fn) => {
    // 如果是引导页直接来的，那么去首页
    let routes = this.props.nav.routes;
    if(routes[0].routeName === 'GuidePage'){
      if(fn instanceof Function){
        fn()
      }
      else{
        this.props.navToMainScreen();
      }
    }
    else{
      if(fn instanceof Function){
        fn(
          () => this.props.navigation.goBack()
         )
      }else{
        this.props.navigation.goBack();
      }

    }
  }

}


const styles = StyleSheet.create({
  main:{
    paddingTop:200,
    alignItems:'center',
  },
  // 用户名样式开始
  userName:{
    flexDirection:'row',
    borderBottomWidth:1,
    borderBottomColor: styleConsts.lightGrey,
    justifyContent: 'center',
    alignItems:'center',
    height: 50,
    width: 300
  },
  telIcon:{
    marginLeft: 5,
    marginRight: 16,
    alignItems:'center',
  },
  telInput:{
    flex:1,
  },
  // 登录按钮样式开始
  buttonsBox: {
    marginTop:43,
    width: 230,
  },
  darkButton: {
    backgroundColor: styleConsts.mainColor,
  },
  buttons:{
    backgroundColor: styleConsts.mainColorOpacity,
    alignItems:'center',
    borderRadius:7.5,
    height: 40,
    justifyContent: 'center'
  },
  btnText:{
    fontSize: styleConsts.H3,
    color: styleConsts.white
  },
  operation:{
    flexDirection:'row',
    justifyContent:'center',
    flexWrap:'nowrap',
    marginTop:26,
  },
  forgetTxt:{
    color: styleConsts.darkGrey,
    fontSize: styleConsts.H4,
    backgroundColor: 'transparent'
  },
  regText:{
    color: styleConsts.mainColor,
    fontSize: styleConsts.H4,
    backgroundColor: 'transparent'
  },
  line: {
    width: 0,
    height: styleConsts.H3,
    borderWidth: 0.5,
    borderColor: styleConsts.darkGrey,
    marginHorizontal: 17,
  },
  backIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 100,
    height: 60,
    width: 60,
    paddingLeft: 20,
    paddingTop: 34
  },
  bgImg: {
    position: 'absolute',
    zIndex: -1,
    width: '100%',
    height: '100%'
  },
  logoStyle: {
    width: 12,
    height: 15
  },
  logoStyle2: {
    width: 9,
    height: 16
  },
  evnLogin: {
    position: 'absolute',
    zIndex: 1,
    width: '100%',
    height: '30%',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0)',
  },
});


const mapStateToProps = (state) => {
  return {
    user: state.user,
    nav: state.nav,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    forgotPassword:()=>{
      dispatch({type:NAV_TO_FORGET_PASSWORD_SCENE})
    },
    toRegisterPage:()=>{
      dispatch({type:NAV_TO_REGISTER_SCENE})
    },
    toTargetPage:(opts)=>{
      dispatch(opts)
    },
    userLogin:(opts)=>{
      dispatch(userLoginAC(opts))
    },
    fetchGlobalInfo: (opts) => {
      dispatch(getGlobalInfo(opts))
    },
    navToChangeEnv: () => {
      dispatch({type: NAV_TO_CHANGE_ENV_SCREEN})
    },
    navToMainScreen: () => {
      dispatch({
        type: NAV_TO_MAIN_SCREEN_PAGE
      })
    },
    // 登录成功后保存选中的门店shopID和shopName
    saveSelectedShop: (opts) => {
      dispatch({ type: SAVE_SELECTED_SHOP_ID_AND_NAME, payload: opts })
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoginScreen)
