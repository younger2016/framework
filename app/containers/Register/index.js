/**
 * @Author: Chen shuang <whq>
 * @Date:   2017-08 31
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: index.js
 * @Last modified by:   cs
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import React, { Component } from 'react'
import { ScrollView, TextInput, View, StyleSheet, Button, Text,
  TouchableWithoutFeedback, Image, TouchableHighlight, Keyboard, Modal
} from 'react-native'
import { connect } from 'react-redux'
import { styleConsts } from '../../utils/styleSheet/styles'
import ModalBox from '../../components/ModalBox'
import HeaderBar from '../../components/HeaderBar'
import { register } from './config'
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import I18n from 'react-native-i18n'
import {NAV_TO_REGISTER_SCENE, NAV_TO_INPUT_INFO_SCENE, NAV_TO_MAIN_SCREEN_PAGE, NAV_TO_SERVICE_TERM_SCENE} from '../../redux/actions/nav.action'
import { sendCheckCodeAC, userRegisterAC, userForgetPwd } from '../../redux/actions/user.action'
import {telephoneReg, companyNameReg} from '../../utils/regTemplate';
import BlankPage from '../../components/BlankPage'
import Dimensions from 'Dimensions';
const { height } = Dimensions.get('window');
class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        loginPWD: '',        //登录密码
        checkCode: '',       //验证码
        loginPhone: '',      //手机号
        checkLoginPWD: '',   //确认密码
        groupName: '',       //集团名称
      },
      complete: false,
      touchable: true,
      codeTitle: I18n.t('sendCheckCode'),
      visible: false,
      forgetVisible: false,
      spinVisible: false
    };
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    this.setState({
      spinVisible: true
    })
  }

  render() {
    let type = this.props.navigation.state.params;
    const props = {}, codeProps = {};
    if(this.state.complete){
      if(type == NAV_TO_REGISTER_SCENE){
        props.onPress = this.register;
      }else{
        props.onPress = this.toForgetPwd;
      }
    }
    if(this.state.data.loginPhone !== '' && this.state.touchable){
      codeProps.onPress = this.getCheckCode;
    }
    return (
      <View style={{backgroundColor: styleConsts.bgGrey,flex: 1}}>
        <HeaderBar
          cancelHide={true}
          navigation={this.props.navigation}
          title={NAV_TO_REGISTER_SCENE === type ? I18n.t('register') : I18n.t('forgetPwd')}
          goBackCallBack={() => {
            this.props.navigation.goBack();
          }}
        />
        <ScrollView scrollEnabled={false}>
          <View style={styles.container}>
            <View style={styles.inputArea}>

              {
                register.map((items, idx)=>{
                  return (
                    <View style={[styles.itemBox, idx==1 && {marginTop: 0}]}
                          key={`${items.length}${idx}`}
                    >
                      {
                        items.map((reg, index) => {
                          if(type !== NAV_TO_REGISTER_SCENE && index == 2) return null;
                          return (
                            <View style={[styles.inputItem, (items.length == index + 1 || type !== NAV_TO_REGISTER_SCENE && index == 1) && styles.noBorder, ]} key={reg.placeholder}>
                              <Image style={styles.itemIcon} source={reg.icon} />
                              <TextInput
                                style={[styles.textInput]}
                                placeholder={I18n.t(reg.placeholder)}
                                placeholderTextColor={styleConsts.middleGrey}
                                underlineColorAndroid="transparent"
                                keyboardType={reg.keyboardType}
                                maxLength={reg.max}
                                secureTextEntry={idx == 1 && index < 2}
                                returnKeyType="done"
                                onSubmitEditing= {() => { Keyboard.dismiss()}}
                                onChangeText={val => this.onInputChange(val, reg.title)}
                              />
                              {
                                reg.hasButton ? (
                                  <TouchableHighlight
                                    underlayColor={styleConsts.mainColorActive}
                                    {...codeProps}
                                    style={[styles.verifyNumber, this.state.data.loginPhone && this.state.touchable ? styles.darkButton : {}]}
                                  >
                                    <View >
                                      <Text style={styles.codeText}>{this.state.codeTitle}</Text>
                                    </View>

                                  </TouchableHighlight>
                                ) : null
                              }
                            </View>
                          )

                        })
                      }
                    </View>)
                })
              }

            </View>
            <TouchableHighlight
              underlayColor={styleConsts.mainColorActive}
              {...props}
              style={[styles.buttonBox, this.state.complete ? styles.darkButton : {}]}
            >
              <View >
                <Text style={styles.buttonText}>{NAV_TO_REGISTER_SCENE === type ? I18n.t('registerNow'): I18n.t('editDown')}</Text>
              </View>

            </TouchableHighlight>
          </View>
          {
            type === NAV_TO_REGISTER_SCENE ?
              (
                <View>
                  <Text style={styles.tips} onPress={this.props.navToServiceScreen}>
                    提交注册即表明您同意
                    <Text style={styles.tipsRed}>《二十二城用户服务条款》</Text>
                  </Text>
                </View>
              ):null
          }

        </ScrollView>

        <ModalBox
          imgName='good'
          iconName='correct'
          visible={this.state.visible}
          title={I18n.t('registerSuccess')}
          tipTxt={I18n.t('inputInfoPlease')}
          leftBtnTxt={I18n.t('buySomethingNow')}
          rightBtnTxt= {I18n.t('inputNow')}
          leftCallback={() => {
            this.setState({visible: false});
            this.props.navToMainScreen();
          }}
          rightCallback={() => {
            this.setState({visible: false});
            this.props.navToInputInfo({
              loginPhone: this.state.data.loginPhone,
              groupName: this.state.data.groupName,
            })
          }}
        />
        <ModalBox
          imgName='good'
          iconName='correct'
          visible={this.state.forgetVisible}
          title={'找回密码成功'}
          tipTxt={'赶紧去登录订购商品吧~'}
          rightBtnTxt= {'马上去登录'}
          rightCallback={() => {
            this.setState({forgetVisible: false});
            this.props.navigation.goBack()
          }}
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
  //获取验证码
  getCheckCode = () => {
    if (!telephoneReg.test(this.state.data.loginPhone)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`请输入正确的手机号`);
      return;
    }
    let type = this.props.navigation.state.params;
    if (this.state.touchable) {
      this.setState({
        touchable: false,
        codeTitle: `${I18n.t('sendAgain')}${60}s`
      }, ()=>{
        this.props.sendCheckCode({
          data: {
            flag: NAV_TO_REGISTER_SCENE === type ? '2': '1',
            loginPhone: this.state.data.loginPhone,
          },
          fail: (data) => {
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(data.response.message);
            this.setState({
              touchable: true,
              codeTitle: I18n.t('sendCheckCode'),
            })
            clearInterval(this.interval);
          },
        });
        // 开启计时器
        const codeTime = 60;
        const now = Date.now();
        const overTimeStamp = now + codeTime * 1000 + 100;
        this.interval = setInterval(() => {
          const nowStamp = Date.now();
          if (nowStamp >= overTimeStamp) {
            this.interval && clearInterval(this.interval);
            this.setState({
              touchable: true,
              codeTitle: I18n.t('sendCheckCode'),
            })
          } else {
            const leftTime = parseInt((overTimeStamp - nowStamp) / 1000, 10);
            this.setState({
              touchable: false,
              codeTitle: `${I18n.t('sendAgain')}${leftTime}s`,
            });
          }
        }, 1000);
      })

    }
  };
  //用户输入onchange
  onInputChange = (val, title) => {
    let { data } = this.state,
    complete = true;
    data[title] = val;
    if(this.props.navigation.state.params !== NAV_TO_REGISTER_SCENE){
      delete data.groupName
    }
    for (const info in data) {
      if (data[info] === '' ) {
        complete = false;
      }
    }
    this.setState({ data, complete });
  };

  //点击下一步
  register = () => {
    if (!telephoneReg.test(this.state.data.loginPhone)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`请输入正确的手机号`);
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
    if (this.state.data.loginPWD !== this.state.data.checkLoginPWD) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`两次输入密码不一致`);
      return;
    }
    if (this.state.data.groupName.trim() === '' || this.state.data.groupName.trim().length < 3 || this.state.data.groupName.trim().length > 100){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`公司名称仅支持3-100个字符`);
      return;
    }
    if (/\s/.test(this.state.data.groupName)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`公司名称中请勿包含特殊字符`);
      return;
    }
    if (this.state.complete) {
      this.setState({
        spinVisible: true
      }, () => {
        let data = this.state.data;
        for(let idx in data){
          if(typeof data[idx] == 'string'){
            data[idx] = data[idx].trim()
          }
        }
        this.props.register({
          data: data,
          success: () => {
            this.setState({
              visible: true,
              spinVisible: false
            });
          },
          fail: (res) => {
            this.setState({
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res.response.message || '诶呀，服务器开小差了');
          },
          timeout: () => {
            this.setState({
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(`诶呀，服务器开小差了`);
          },
        })
      });

    }
  };
  //找回密码
  toForgetPwd = () => {
    if (!telephoneReg.exec(this.state.data.loginPhone)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`请输入正确的手机号`);
      return;
    }
    if (/\s+/.test(this.state.data.loginPWD)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`密码中不能包含空格`);
      return;
    }
    if (this.state.data.loginPWD !== this.state.data.checkLoginPWD) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`两次输入密码不一致`);
      return;
    }
    if (this.state.complete) {
      this.setState({
        spinVisible: true
      }, () => {
        let { data } = this.state;
        delete data.groupName;
        this.props.userForgetPwd({
          data: data,
          success: () => {
            this.setState({
              forgetVisible: true,
              spinVisible: false
            });
          },
          fail: (res) => {
            this.setState({
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res.response.message || '诶呀，服务器开小差了');
          },
          timeout: () => {
            this.setState({
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(`诶呀，服务器开小差了`);
          },
        })
      });


    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  itemBox: {
    margin: 10,
    backgroundColor: styleConsts.white,
    borderRadius: 3
  },
  inputArea: {
    width: '100%',
  },
  inputItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    borderBottomWidth: 0.5,
    borderColor: styleConsts.lightGrey,
  },
  itemIcon: {
    width: 11,
    height: 14,
    marginRight: 10,
  },
  textInput: {
    flex: 2,
    height: 45,
    fontSize: styleConsts.H3,
  },
  verifyNumber: {
    height: 30,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: styleConsts.mainColorOpacity,
    borderRadius: 5,
  },
  buttonBox: {
    width: '80%',
    height: 40,
    marginTop: 45,
    marginBottom: 20,
    borderRadius: 5,
    backgroundColor: styleConsts.mainColorOpacity,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkButton: {
    backgroundColor: styleConsts.mainColor,
  },
  buttonText: {
    fontSize: styleConsts.H3,
    color: styleConsts.white,
  },
  codeText: {
    fontSize: styleConsts.H3,
    color: styleConsts.white,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  tips: {
    color: styleConsts.grey,
    textAlign: 'center',
    fontSize: styleConsts.H5
  },
  tipsRed: {
    color: styleConsts.mainColor,
    textDecorationLine: 'underline'
  }
});

Register.defaultProps = {

};
Register.PropTypes = {

};

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    navToInputInfo: (opts) => {
      dispatch({ type: NAV_TO_INPUT_INFO_SCENE, payload: opts })
    },
    navToMainScreen: (opts) => {
      dispatch({ type: NAV_TO_MAIN_SCREEN_PAGE, payload: opts })
    },
    navToServiceScreen: () => {
      dispatch({ type: NAV_TO_SERVICE_TERM_SCENE})
    },
    register: (opts) => {
      dispatch(userRegisterAC(opts))
    },
    userForgetPwd: (opts) => {
      dispatch(userForgetPwd(opts))
    },
    sendCheckCode: (opts) => {
      dispatch(sendCheckCodeAC(opts))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Register)
