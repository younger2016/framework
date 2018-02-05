/**
 * Created by chenshuang on 2017/9/13.
 */
/**
 * @Author: Wu Hao Quan <whq>
 * @Date:   2017-08 31
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: index1.js
 * @Last modified by:   whq
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import React, { Component } from 'react'
import { ScrollView, TextInput, View, StyleSheet, Button, Text,
  TouchableWithoutFeedback, Image, TouchableHighlight, Keyboard, Modal, Platform
} from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {getImgUrl} from '../../../utils/adapter'
import DatePickerAD from '../../../components/DatePickerAD';
import DatePicker from '../../../components/Datepicker'
import SelectArea from '../../../components/SelectArea';
import { connect } from 'react-redux'
import { styleConsts } from '../../../utils/styleSheet/styles'
import ModalBox from '../../../components/ModalBox'
import HeaderBar from '../../../components/HeaderBar'
import { inputInfo } from '../config'
import { toastShort } from '../../../components/toastShort';
import Toast from 'react-native-root-toast';
import I18n from 'react-native-i18n'
import { userInputMoreInfoAC, changeIsOnline } from '../../../redux/actions/user.action'
import { checkAndUpload } from '../../../utils/adapter';
import {telephoneReg, phoneReg, idNoReg, bossNameReg} from '../../../utils/regTemplate';
import BlankPage from '../../../components/BlankPage'
import Dimensions from 'Dimensions';
import {setTask} from '../../../utils/deskTask'

const { height } = Dimensions.get('window');

class InputInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        groupAddress: '',  //详细地址
        groupArea: '',     //区
        groupPhone: '',    //联系电话
        linkman: '',       //联系人
        businessEntity: '',    //法人姓名
        businessNo: '',        //营业执照注册号
        endTime: '',           //失效日期
        startTime: '',         //生效日期
        businessScope: '',     //营业范围
        licencePhotoUrl: '',   //营业执照照片
        entityIDNo: '',       //法人身份证号
      },
      complete: false,
      touchable: true,
      codeTitle: I18n.t('sendCheckCode'),
      visible: false,
      backVisible: false,
      spinVisible: false,
      areaInfo: {

      }
    };
  }

  componentDidMount(){
    setTask(this.showBackModal);
    let {data} = this.state;
    this.setState({
      data: Object.assign(this.props.navigation.state.params, data)
    })
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    setTask(null)
  }

  render() {
    const props = {};
    if(this.state.complete){
      props.onPress = this.commit;
    }
    return (
      <View style={{backgroundColor: styleConsts.bgGrey,flex: 1}}>
        <HeaderBar
          cancelHide={true}
          navigation={this.props.navigation}
          title={I18n.t('inputInfo')}
          goBackCallBack={this.showBackModal}
        />
        <KeyboardAwareScrollView enableOnAndroid = {true}>
          <View style={styles.container}>
            <View style={styles.inputArea}>
              <View style={styles.itemBox}>
                {
                  inputInfo[0].map((reg, index) => {
                    return (
                      <View style={[styles.inputItem, index == inputInfo[0].length - 1 && styles.noBorder]} key={reg.placeholder}>
                        <View style={styles.labelBox}>
                          <Text style={styles.label}>{I18n.t(reg.label)}</Text>
                        </View>
                        <TextInput
                          style={[styles.textInput, reg.select && {marginRight: 10}]}
                          placeholder={I18n.t(reg.placeholder)}
                          value={this.state.data[reg.title]}
                          placeholderTextColor={styleConsts.middleGrey}
                          underlineColorAndroid="transparent"
                          keyboardType={reg.keyboardType}
                          maxLength={reg.max}
                          returnKeyType="done"
                          onSubmitEditing= {() => { Keyboard.dismiss()}}
                          onChangeText={val => this.onInputChange(val, reg.title)}
                        />
                        {
                          reg.select ? (

                            <TouchableWithoutFeedback onPress={() => {
                              this.refs.selectArea.show();
                              Platform.OS == 'android' && setTask(this.refs.selectArea.hide);
                            }}>
                              <View style={styles.iconBox}>
                                <Image
                                  style={styles.iconRight}
                                  source={require('../../../imgs/rightArrow.png')}
                                />
                              </View>
                            </TouchableWithoutFeedback>
                          ) : null
                        }

                      </View>
                    )

                  })
                }
                {this.renderDatePicker()}
                {
                  inputInfo[1].map((reg, index) => {
                    return (
                      <View style={[styles.inputItem, index == inputInfo[1].length - 1 && styles.noBorder]} key={reg.placeholder}>
                        <View style={[styles.labelBox, reg.multiLine && styles.toTop]}>
                          <Text style={styles.label}>{I18n.t(reg.label)}</Text>
                        </View>
                        <TextInput
                          style={[styles.textInput , reg.multiLine && { height: 90, marginTop: 8 }]}
                          placeholder={I18n.t(reg.placeholder)}
                          placeholderTextColor={styleConsts.middleGrey}
                          underlineColorAndroid="transparent"
                          keyboardType={reg.keyboardType}
                          multiline={reg.multiLine}
                          maxLength={reg.max}
                          returnKeyType="done"
                          onSubmitEditing= {() => { Keyboard.dismiss()}}
                          onChangeText={val => this.onInputChange(val, reg.title)}
                        />
                      </View>
                    )

                  })
                }

                {this.renderUpload()}
              </View>
            </View>
          </View>

        </KeyboardAwareScrollView>

        <ModalBox
          imgName='good'
          iconName='correct'
          visible={this.state.visible}
          title={I18n.t('checkSuccess')}
          tipTxt={I18n.t('checkSuccessTip')}
          leftBtnTxt={I18n.t('gotIt')}
          leftCallback={() => {
            this.setState({
              visible: false
            },()=>{
              let route = this.props.navReducer.routes;
              if(route[route.length - 2] && route[route.length - 2].routeName =='RegScreen'){
                route.splice(route.length - 2, 1 );
              }
              this.props.navigation.goBack();
            })
          }}
        />
        <ModalBox
          imgName='what'
          iconName='warning'
          visible={this.state.backVisible}
          title={'确定要离开嘛'}
          tipTxt={'您已经填写了部分数据，离开会丢失当前已填写的数据'}
          leftBtnTxt={'去意已决'}
          rightBtnTxt={'暂不离开'}
          leftCallback={() => {
            this.setState({
              backVisible: false
            });
            let route = this.props.navReducer.routes;
            if(route[route.length - 2] && route[route.length - 2].routeName =='RegScreen'){
              route.splice(route.length - 2, 1 );
            }
            this.props.navigation.goBack();
          }}
          rightCallback={()=>{
            this.setState({
              backVisible: false
            }, () => {
              setTask(this.showBackModal)
            })
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

        <View  style={styles.bottomBox}>
          <TouchableHighlight
            underlayColor={styleConsts.mainColorActive}
            {...props}
            style={[styles.buttonBox, this.state.complete ? styles.darkButton : {}]}
          >
            <View >
              <Text style={styles.buttonText}>{I18n.t('commitToCheck')}</Text>
            </View>

          </TouchableHighlight>
        </View>
        <SelectArea
          ref='selectArea'
          province={this.state.areaInfo.groupProvinceCode || ''}
          city={this.state.areaInfo.shopCityCode || ''}
          area={this.state.areaInfo.shopDistrictCode || ''}
          confirm = {$$obj => {
            this.setState({
              areaInfo: {
                groupCity: $$obj.shopCity,
                groupCityCode: $$obj.shopCityCode,
                groupDistrict: $$obj.shopDistrict,
                groupDistrictCode: $$obj.shopDistrictCode,
                groupProvince: $$obj.shopProvince,
                groupProvinceCode: $$obj.shopProvinceCode
              }
            });
            setTask(this.showBackModal);
            this.onInputChange( `${$$obj.shopProvince}-${$$obj.shopCity}-${$$obj.shopDistrict}`, 'groupArea')
          }}
          hidePress = {()=>{
            setTask(this.showBackModal);
          }}
        />
      </View>
    )
  }

  renderDatePicker = () => {
    return (
      <View>
        <View style={styles.lineBox}></View>
        <View style={styles.inputItem}>
          <View style={styles.labelBox}>
            <Text style={styles.label}>{I18n.t('validityPeriod')}</Text>
          </View>
          <View style={styles.dateRight}>
            <View style={styles.dateBox}>
              <Text
                onPress={()=>{
                  this.refs.datePacker.onPressDate();
                  Platform.OS === 'android' && setTask(() => {this.refs.datePacker.setModalVisible(false)});
                }}
                style={[styles.textInput,{marginRight: Platform.OS === 'ios'? 0 : 5, lineHeight: Platform.OS === 'ios'? 45 : 32, textAlign: 'right', color: this.state.data.startTime == '' ? styleConsts.middleGrey : '#000'}]}
              >
                {this.state.data.startTime == '' ? '开始日期 ～ 结束日期':`${this.state.data.startTime} ~ ${this.state.data.endTime}`}
              </Text>
              {
                Platform.OS === 'ios' ?
                  <DatePicker
                    style={{ width: 0, height: 0, overflow: 'hidden' }}
                    mode="date"
                    placeholder=""
                    format="YYYY-MM-DD"
                    confirmBtnText={I18n.t('confirm')}
                    cancelBtnText={I18n.t('cancel')}
                    ref="datePacker"
                    onDateChange={(start,end) => {
                      this.onInputChange(start, 'startTime');
                      this.onInputChange(end, 'endTime');
                    }}
                    customStyles={{
                      dateInput: {
                        height: 45,
                        borderWidth: 0,
                        alignItems: 'flex-start'
                      },
                      placeholderText: {
                        color: styleConsts.grey,
                        textAlign: 'left',
                        fontSize: styleConsts.H3
                      },
                      dateText: {
                        color: styleConsts.grey,
                        textAlign: 'left',
                        fontSize: styleConsts.H3
                      }
                    }}
                    showIcon={false}
                  /> :
                  <DatePickerAD
                    ref="datePacker"
                    updateDate={(start, end) => {
                      this.onInputChange(start, 'startTime');
                      this.onInputChange(end, 'endTime');
                    }}
                    hidePress={()=>{
                      setTask(this.showBackModal)
                    }}
                  />
              }

            </View>

          </View>
        </View>
      </View>
    )
  };

  renderUpload = () => {
    return (
      <View>
        <View style={styles.lineBox}></View>

        <TouchableWithoutFeedback onPress={this.addImg}>
          <View style={styles.upLoading}>

            {
              this.state.data.licencePhotoUrl.length ?
                <View style={styles.upLoadingLine}>
                  <Image style={{ width: '100%', height: '100%', borderRadius: 5 }} source={{ uri: getImgUrl(this.state.data.licencePhotoUrl) }}/>
                </View> :
                <View style={styles.upLoadingLine}>
                  <Image style={styles.addProductImgIcon} source={require('../imgs/addImg.png')} />
                  <Text style={{ color: styleConsts.grey, fontSize: styleConsts.H3 }}>
                    {I18n.t('uploadLicence')}
                  </Text>
                </View>
            }
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

  showBackModal = () => {
    this.setState({
      backVisible: true
    }, () => {
      setTask(()=>{})
    });
  };
  //用户输入onchange
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
  //点击下一步
  commit = () => {
    const data = JSON.parse(JSON.stringify(this.state.data));
    if (data.groupName.trim() === '' || data.groupName.trim().length < 3 || data.groupName.trim().length > 100){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`公司名称仅支持3-100个字符`);
      return;
    }
    if (/\s/.test(data.groupName)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`公司名称请勿包含空格`);
      return;
    }

    if(data.businessNo.length !== 15 && data.businessNo.length !== 18){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('请输入正确的营业执照注册号');
      return;
    }
    if(data.groupAddress.trim() === '' || data.groupAddress.trim().length < 5 || data.groupAddress.trim().length > 100){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('详细地址仅支持5-100个字符');
      return;
    }

    if(data.businessEntity.trim() === '' || data.businessEntity.trim().length < 1 || data.businessEntity.trim().length > 15){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('姓名请不要超过15字哦');
      return;
    }

    if (!bossNameReg.test(data.businessEntity)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`姓名中请勿包含特殊字符`);
      return;
    }

    if(data.linkman.trim() === '' || data.linkman.trim().length < 1 || data.linkman.trim().length > 15){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('姓名请不要超过15字哦');
      return;
    }

    if (!bossNameReg.test(data.linkman)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`姓名中请勿包含特殊字符`);
      return;
    }

    if (!idNoReg.test(data.entityIDNo)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(`请输入正确的身份证号码`);
      return;
    }

    if(!phoneReg.test(data.groupPhone) && !telephoneReg.test(data.groupPhone)){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('请输入正确的联系电话');
      return;
    }
    if(data.businessScope.trim() === '' || data.businessScope.trim().length < 1 || data.businessScope.trim().length > 200){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('营业范围请不要超过200字哦');
      return;
    }
    if(typeof data.startTime === 'string' && typeof data.startTime === 'string'){
      data.startTime = parseInt(data.startTime.split('-').join(''));
      data.endTime = parseInt(data.endTime.split('-').join(''));
    }
    delete data.groupArea;
    data.groupAreaDto = this.state.areaInfo;

    for(let idx in data){
      if(typeof data[idx] == 'string'){
        data[idx] = data[idx].trim()
      }
    }

    if (this.state.complete) {
      this.setState({
        complete: false,
        spinVisible: true
      },()=>{
        this.props.userInputMoreInfo({
          data: data,
          success: (res) => {
            this.setState({
              visible: true,
              spinVisible: false
            }, () => {
              setTask(() => {});
              if(this.props.user.getIn(['cache','data', 'userInfo']) !== undefined){
                this.props.changeIsOnline({
                  isOnline: 0,
                  purchaserName: data.groupName
                })
              }
            });
          },
          fail: (res) => {
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res.response.message || '诶呀，服务器开小差了');
            this.setState({
              complete: true,
              spinVisible: false
            });
          },
          timeout: () => {
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(`诶呀，服务器开小差了`);
            this.setState({
              complete: true,
              spinVisible: false
            });
          },
        })
      });

    }
  };
  //上传图片
  addImg = () => {
    let self = this;
    checkAndUpload(self,
      (res) => {
        this.setState({
          spinVisible: false
        });
        this.onInputChange(res, 'licencePhotoUrl');
      },
      () => {
        this.setState({
          spinVisible: false
        })
      },
      () => {
        this.setState({
          spinVisible: true
        })
      }
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  itemBox: {
    marginTop: 15,
    marginHorizontal: 10,
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
    width: 15,
    height: 19,
    marginRight: 10,
  },
  textInput: {
    flex: 2,
    height: 45,
    fontSize: styleConsts.H3,
    textAlign: 'right'
  },
  verifyNumber: {
    height: 30,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: styleConsts.mainColorOpacity,
    borderRadius: 5,
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
    fontSize: styleConsts.H11
  },
  tipsRed: {
    color: styleConsts.mainColor,
    textDecorationLine: 'underline'
  },
  labelBox: {
    width: 67,
  },
  label: {
    color: styleConsts.darkGrey,
    fontSize: styleConsts.H3,
  },
  iconBox: {
    width: '100%',
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    height: 30,
    zIndex: 100
  },
  iconRight: {
    width: 5,
    height: 8,
    tintColor: styleConsts.grey,
  },
  toTop: {
    position: 'relative',
    top: -19,
  },
  txtNumBox: {
    position: 'relative',
    top: 25,
  },
  txtNum: {
    color: styleConsts.middleGrey,
    fontSize: styleConsts.H6
  },
  dateRight: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineBox: {
    height: 15,
    backgroundColor: styleConsts.bgGrey
  },
  upLoading: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: styleConsts.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  upLoadingLine: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: styleConsts.lightGrey,
    borderRadius: 5,
  },
  addProductImgIcon: {
    width: 25,
    height: 25,
    marginBottom: 17,
  },
  bottomBox: {
    backgroundColor: styleConsts.white,
    height: 49,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    bottom: 0,
    marginTop: 10
  },
  buttonBox: {
    width: 230,
    height: 35,
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
});

InputInfo.defaultProps = {

};
InputInfo.PropTypes = {

};

const mapStateToProps = (state) => {
  return {
    navReducer: state.nav,
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {

    userInputMoreInfo: (opts) => {
      dispatch(userInputMoreInfoAC(opts))
    },
    changeIsOnline: (opts) => {
      dispatch(changeIsOnline(opts))
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(InputInfo)

