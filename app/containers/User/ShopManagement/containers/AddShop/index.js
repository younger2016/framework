/**
 * 新增、编辑门店
 */
import React,{ PropTypes } from 'react';
import { ScrollView, View, Text, StyleSheet, TextInput, Keyboard, Alert } from 'react-native';
import { connect } from 'react-redux';
import { styleConsts } from '../../../../../utils/styleSheet/styles';
import I18n from 'react-native-i18n';
import HeaderBar from '../../../../../components/HeaderBar'
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import { TouchableWithoutFeedbackD } from '../../../../../components/touchBtn';
import Image from 'react-native-image-progress';
import * as Progress from 'react-native-progress';
import { checkAndUpload, getImgUrl } from '../../../../../utils/adapter';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SelectTime from '../../../../../components/SelectTime';
import SelectArea from '../../../../../components/SelectArea';
import SelectShopType from '../SelectShopType';
import SelectBusinessStatus from '../SelectBusinessStatus';
import BlankPage from '../../../../../components/BlankPage';
import Immutable, { Map } from 'immutable';
import Toast from 'react-native-root-toast';
import { toastShort } from '../../../../../components/toastShort';
import { telephoneReg, phoneReg, bossNameReg } from '../../../../../utils/regTemplate';
import { topTitleList, bottomTitleList, bottomInputConfig, shopTYpes, shopStatusArr } from '../config';
import {
  SET_MAININFO_TO_STORES,
  getSomeOneStoresInfo,
  addStoresCenter,
  editStoresCenter,
} from '../../../../../redux/actions/storesCenter.action';
import {
  NAV_TO_SELECT_EMPLOYEE
} from '../../../../../redux/actions/nav.action';
import { setTask } from '../../../../../utils/deskTask';

const leftBar = require('../../../../../imgs/leftBar.png');

class AddShop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,         // 加载是否显示
      hasLoad: false,         // 是否加载过
      loadSuccess: false,     // 是否加载成功
      info: {
        imagePath:	'',       // 门头图
        shopName:	'',         // 门店名称
        shopPhone:	'',       // 门店电话
        shopAdmin:	'',       // 负责人
        shopOpenTime:	'',     // 营业时间
        shopAreaDto:	{       // 所在地区
          shopProvince: '',
          shopProvinceCode: '',
          shopCity: "",
          shopCityCode: '',
          shopDistrict : "",
          shopDistrictCode : ''
        },
        shopAddress:	'',      // 详细地址
        orgType: 0,            // 门店属性(1-门店，2-配送中心)
        employeeIdList: [],    // 选择的员工
        isActive: '',          // 营业状态(1-正常营业,9-暂停营业)
        purchaserID:	'',      // 采购商集团ID
      },
      edit: this.props.$someOneInfo.get('main').toJS().mode === 'edit',  // 是否是编辑门店信息
    }
  }
  componentDidMount() {
    this.mianInfo = this.props.$someOneInfo.get('main').toJS();
    // 获取需要编辑的门店详细信息
    if('edit' === this.mianInfo.mode){
      this.fetchDetails();
    }
  };
  componentWillReceiveProps(nextProps) {
    if(!Immutable.is(this.props.$someOneInfo.get('info'),nextProps.$someOneInfo.get('info'))){
      this.setState({
        info: nextProps.$someOneInfo.get('info').toJS()
      });
    }
  }
  componentWillUnmount() {
    // 清空主信息
    this.toast && Toast.hide(this.toast);
    this.props.setMainInfo();
    this.setState({
      visible: false,
    });
    this.timer&&clearTimeout(this.timer)
  }
  render() {
    const { imagePath, orgType, shopOpenTime, isActive } = this.state.info;
    let defTime = ['00:00', '23:59'];
    if(shopOpenTime && typeof shopOpenTime=== 'string'){
      defTime = shopOpenTime.split('-');
    }
    return (
      <View style={styles.container}>
        <HeaderBar
          title={this.state.edit ? I18n.t('editShop') :I18n.t('addShop')}
          rightText={I18n.t('save')}
          goBackCallBack={() => {Keyboard.dismiss();this.props.navigation.goBack()}}
          cancelCallback={() => this.save()}
          navigation={this.props.navigation}
        />
        {
          this.state.edit ? (
            this.state.hasLoad ?
              (
                this.state.loadSuccess ?
                  this.renderCenter(defTime, imagePath,)
                  : <BlankPage visable={true} type={'error'} loadAgain={this.fetchDetails} />
              ) : null
          ) : this.renderCenter(defTime, imagePath,)
        }
        {/*营业时间*/}
        <SelectTime
          ref='selectTime'
          startTime={defTime[0]}
          endTime={defTime[1]}
          confirm={(start, end) => this.changeSome('shopOpenTime', `${start}-${end}`)}
        />
        {/*所在地区*/}
        <SelectArea
          ref='selectArea'
          confirm={(val) => this.changeSome('shopAreaDto', val)}
          province={this.state.info.shopAreaDto.shopProvinceCode}
          city={this.state.info.shopAreaDto.shopCityCode}
          area={this.state.info.shopAreaDto.shopDistrictCode}
        />
        {/*门店属性*/}
        <SelectShopType
          ref='selectShopType'
          selectedId={orgType}
          confirm={(sid) => this.changeSome('orgType', sid)}
        />
        {/*营业状态*/}
        <SelectBusinessStatus
          ref='shopStatus'
          selectedId={isActive}
          confirm={(status) => this.changeSome('isActive', status)}
        />

        {/*加载*/}
        <View style={{
          flex: 1,
          width: this.state.visible ? '100%': 0,
          height: this.state.visible? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage visable={this.state.visible} type={'loading'} />
        </View>
      </View>
    )
  }
  renderCenter = (defTime, imagePath,) => {
    return (
      <KeyboardAwareScrollView extraScrollHeight={6}>
        <ScrollView>
          <View style={styles.linghtBg}>
            <View style={styles.modalInputBox}>
              <View style={styles.headerWrapper}>
                <Image source={require('../../imgs/shopBg.png')} style={styles.backImg}/>
                <TouchableWithoutFeedbackD delayTime={400} onPress={() => this.setUploadImg()}>
                  <View style={styles.userLogo}>
                    <View style={styles.clickUp}>
                      <View style={styles.noImg}>
                        <Image source={require('../../../../../imgs/camera.png')} style={styles.bgImg}/>
                        <Text style={styles.noImgTxt}>{I18n.t('addShopLogn')}</Text>
                      </View>
                      {
                        (imagePath && '' !== imagePath) ?
                          <Image
                            source={{ uri: getImgUrl(imagePath, 60, 60) }}
                            indicator={Progress.Bar}
                            indicatorProps={{
                              height: 10,
                              width: 60,
                              borderWidth: 0,
                              borderRadius: 5,
                              color: 'rgba(150, 150, 150, 1)',
                              unfilledColor: 'rgba(200, 200, 200, 0.2)'
                            }}
                            style={styles.userImg}/>
                          : null
                      }
                    </View>
                  </View>
                </TouchableWithoutFeedbackD>
              </View>
              {this.renderTopInputList()}
            </View>
          </View>
          {this.renderBottomInput()}
        </ScrollView>
      </KeyboardAwareScrollView>
    )
  };
  // 上部分输入框
  renderTopInputList = () => {
    const {shopName, shopPhone, shopAdmin, shopOpenTime, shopAreaDto,shopAddress, } = this.state.info;
    let area = '';
    if('' !== shopAreaDto.shopProvince){
      area = shopAreaDto.shopProvince;
      if('' !== shopAreaDto.shopCity){
        area += '-' + shopAreaDto.shopCity;
        if('' !== shopAreaDto.shopDistrict){
          area += '-' + shopAreaDto.shopDistrict
        }
      }
    }
    return (
      <View style={styles.inputList}>
        <View style={styles.titleBox}>
          {
            topTitleList.map((title) => {
              return (
                <View style={styles.titleInfo} key={title}>
                  <Text style={styles.title}>{I18n.t(title)}</Text>
                </View>
              )
            })
          }
        </View>
        <View style={styles.inputBox}>
          <View style={styles.inputOne}>
            <TextInput
              placeholderTextColor={styleConsts.middleGrey}
              placeholder={I18n.t('pleaseInputshopNamePL')}
              style={styles.inputBar}
              value={shopName}
              onChangeText={(text) => this.changeSome('shopName',text)}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.inputOne}>
            <TextInput
              placeholderTextColor={styleConsts.middleGrey}
              placeholder={I18n.t('pleaseInputshopTelPL')}
              style={styles.inputBar}
              value={shopPhone}
              keyboardType='numbers-and-punctuation'
              onChangeText={(text) => this.changeSome('shopPhone',text)}
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.inputOne}>
            <TextInput
              placeholderTextColor={styleConsts.middleGrey}
              placeholder={I18n.t('pleaseInputshopAdminPL')}
              style={styles.inputBar}
              value={shopAdmin}
              onChangeText={(text) => this.changeSome('shopAdmin',text)}
              underlineColorAndroid="transparent"
            />
          </View>
          <TouchableWithoutFeedbackD
            delayTime={300}
            onPress={() => {
              this.refs.selectTime.show( ()=> setTask(null));
              setTask(this.refs.selectTime.hide);
            }}
          >
            <View style={styles.inputOne}>
              <TextInput
                placeholderTextColor={styleConsts.middleGrey}
                placeholder={I18n.t('pleaseSelectShopTime')}
                style={styles.inputBar}
                value={shopOpenTime}
                underlineColorAndroid="transparent"
                editable={false}
              />
              <Image source={leftBar} style={styles.leftBar}/>
              <View style={styles.selfMask}/>
            </View>
          </TouchableWithoutFeedbackD>
          <TouchableWithoutFeedbackD
            delayTime={300}
            onPress={() => {
              this.refs.selectArea.show(() => setTask(null));
              setTask(this.refs.selectArea.hide);
            }}>
            <View style={styles.inputOne}>
              <TextInput
                placeholderTextColor={styleConsts.middleGrey}
                placeholder={I18n.t('pleaseSelectShopArea')}
                style={styles.inputBar}
                value={area}
                underlineColorAndroid="transparent"
                editable={false}
              />
              <Image source={leftBar} style={styles.leftBar}/>
              <View style={styles.selfMask}/>
            </View>
          </TouchableWithoutFeedbackD>
          <View style={[styles.inputOne, {borderBottomWidth: 0}]}>
            <TextInput
              placeholderTextColor={styleConsts.middleGrey}
              placeholder={I18n.t('pleaseInputshopAddressPL')}
              style={styles.inputBar}
              value={shopAddress}
              onChangeText={(text) => this.changeSome('shopAddress',text)}
              underlineColorAndroid="transparent"
            />
          </View>
        </View>
      </View>
    )
  };
  // 下部分输入框
  renderBottomInput = () => {
    let { orgType, employeeIdList, isActive, } = this.state.info;

    // 根据当前营业状态找出对应的该对象
    let shopStatusItem = shopStatusArr.find((item) => {
      return item.status === isActive;
    });

    return (
      <View style={[styles.linghtBg,{marginTop: 0}]}>
        <View style={styles.modalInputBox}>
          <View style={styles.inputList}>
            <View style={styles.titleBox}>
              {
                bottomTitleList.map((title) => {
                  return (
                    <View style={styles.titleInfo} key={title}>
                      <Text style={styles.title}>{I18n.t(title)}</Text>
                    </View>
                  )
                })
              }
            </View>
            <View style={styles.inputBox}>
              {
                bottomInputConfig.map((item,index) => {
                  return (
                    <TouchableWithoutFeedbackD delayTime={300} onPress={() => this.handleInputChange(item.key)} key={item.id}>
                      <View style={[styles.inputOne, index === bottomInputConfig.length - 1 ? {borderBottomWidth: 0} : {}]}>
                        <TextInput
                          placeholderTextColor={styleConsts.middleGrey}
                          style={styles.inputBar}
                          placeholder={I18n.t(item.placeholder)}
                          value={
                            item.key === 'shopTypes' && orgType !== 0 ?
                              I18n.t(shopTYpes[orgType]) : item.key === 'selectEmployee' && employeeIdList.length !== 0 ?
                              `已选${employeeIdList.length}位` : item.key === 'shopStatus' && shopStatusItem ? shopStatusItem.title : ''
                          }
                          underlineColorAndroid="transparent"
                          editable={item.editable}
                        />
                        <Image source={leftBar} style={styles.leftBar}/>
                        <View style={styles.selfMask}/>
                      </View>
                    </TouchableWithoutFeedbackD>
                  )
                })
              }
            </View>
          </View>
        </View>
      </View>
    )
  };

  // 上传门店头像
  setUploadImg = () => {
    let self = this;
    checkAndUpload(self, (res) => {
      let info = this.state.info;
      info.imagePath = res;
      this.setState({ info })
    });
  };

  // 输入框改变
  changeSome = (key, data) => {
    let info = this.state.info;
    info[key] = data;
    this.setState({ info })
  };

  // 底部输入框改变
  handleInputChange = (key) => {
    switch (key) {
      case 'shopTypes' :
        this.refs.selectShopType.show(() => setTask(null));
        setTask(this.refs.selectShopType.hide);
        break;
      case 'selectEmployee':
        this.props.navToSelectEmployee({
          saveSelectEmployee: this.saveSelectEmployee,
          employeeIdList: this.state.info.employeeIdList,
        });
        break;
      case 'shopStatus':
        this.refs.shopStatus.show(() => setTask(null));
        setTask(this.refs.shopStatus.hide);
        break;
      default:
        break;
    }
  };

  // 获取编辑门店的详细信息
  fetchDetails = () => {
    this.setState({
      visible: true,
    });
    if('pending' !== this.props.$someOneInfo.get('status')){
      this.props.fetchInfo({
        data: {
          shopID: this.mianInfo.info.shopID,
          purchaserID: this.props.purchaserID,
        },
        success: () => {
          this.setState({
            visible: false,
            hasLoad: true,
            loadSuccess: true,
          })
        },
        fail: () => {
          this.setState({
            visible: false,
            hasLoad: true,
          })
        },
        timeout: () => {
          this.setState({
            visible: false,
            hasLoad: true,
          })
        },
      })
    }
  };

  // 保存选中的员工
  saveSelectEmployee = (selectEmployee) => {
    let { info } = this.state;
    info.employeeIdList = selectEmployee;
    this.setState({ info });
  };

  // 保存
  save = () => {
    //验证
    this.toast && Toast.hide(this.toast);
    let saveData = Immutable.fromJS(this.state.info).toJS();
    if(saveData.imagePath === ''){
      return this.toast = toastShort(I18n.t('pleaseUploadShopLogo'))
    }
    saveData.shopName = (saveData.shopName + '').trim();
    if(saveData.shopName === '' || saveData.shopName.length > 50){
      return this.toast = toastShort(I18n.t('pleaseInputshopName'))
    }
    if(!phoneReg.test(saveData.shopPhone) &&  !telephoneReg.test(saveData.shopPhone)){
      return this.toast = toastShort(I18n.t('inputshopTelError'))
    }
    saveData.shopAdmin = (saveData.shopAdmin + '').trim();
    if(saveData.shopAdmin === '' || !bossNameReg.test(saveData.shopAdmin)){
      return this.toast = toastShort(I18n.t('pleaseInputshopAdmin'))
    }
    if(saveData.shopOpenTime === ''){
      return this.toast = toastShort(I18n.t('pleaseSelectShopTime'))
    }
    if(saveData.shopAreaDto.shopProvinceCode === ''){
      return this.toast = toastShort(I18n.t('pleaseSelectShopArea'))
    }
    if(saveData.shopAddress === '') {
      return this.toast = toastShort('请输入详细地址');
    } else if (saveData.shopAddress.length < 5 || saveData.shopAddress.length > 100){
      return this.toast = toastShort(I18n.t('pleaseInputshopAddress'))
    }
    if(saveData.shopStatus === '') {
      return this.toast = toastShort('请选择营业状态');
    }

    Keyboard.dismiss();
    this.setState({
      visible: true,
    });

    saveData['purchaserID'] = this.props.purchaserID;

    if(this.success) return;
    this.success = true;

    // 用于返回门店列表时插入新的数据或编辑后的数据
    let editData = {
      purchaserID: saveData.purchaserID,
      imagePath: saveData.imagePath,
      shopAddress: saveData.shopAddress,
      shopID: saveData.shopID,
      shopName: saveData.shopName,
      isActive: saveData.isActive,
    };
    if('edit' !== this.mianInfo.mode){   // 保存新增的
      if('pending' !== this.props.$someOneInfo.get('addStatus')){
        this.props.saveAddInfo({
          data: saveData,
          editData,
          success: () => {
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(I18n.t('addShopSuccess'));
            this.timer = setTimeout(() => this.props.navigation.goBack(),500)
          },
          fail: (res) => {
            this.success = false;
            this.setState({
              visible: false,
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort( (res && res.response && res.response.message) || I18n.t('addShopFail'))
          },
          timeout: () => {
            this.success = false;
            this.setState({
              visible: false,
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(I18n.t('addShopTimeout'))
          }
        })
      }
    } else{  // 保存编辑的
      if('pending' !== this.props.$someOneInfo.get('editStatus')){
        saveData['shopID'] = this.mianInfo.info.shopID;
        this.props.saveEditInfo({
          data: saveData,
          editData,
          success: () => {
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(I18n.t('editShopSuccess'));
            this.timer = setTimeout(() => this.props.navigation.goBack(),500);
            this.props.navigation.goBack()
          },
          fail: (res) => {
            this.setState({
              visible: false,
            });
            this.success = false;
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort((res && res.response && res.response.message) || I18n.t('editShopFAil'))
          },
          timeout: () => {
            this.setState({
              visible: false,
            });
            this.success = false;
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(I18n.t('editShopTimeout'))
          }
        })
      }
    }
  };

}

AddShop.defaultProps = {};
AddShop.PropTypes = {};

const mapStateToProps = (state) => {
  return {
    // 获取主信息
    $someOneInfo: state.storesCenter.get('someOneInfo'),
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    setMainInfo: () => {
      dispatch({ type: SET_MAININFO_TO_STORES })
    },
    // 获取门店详情
    fetchInfo: (opts) => {
      dispatch(getSomeOneStoresInfo(opts))
    },
    // 保存新增门店
    saveAddInfo: (opts) => {
      dispatch(addStoresCenter(opts))
    },
    // 保存编辑门店
    saveEditInfo: (opts) => {
      dispatch(editStoresCenter(opts))
    },
    // 选择员工
    navToSelectEmployee: (opts) => {
      dispatch({type: NAV_TO_SELECT_EMPLOYEE, payload: opts});
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  linghtBg: {
    margin: 10,
    borderRadius: 4,
  },
  modalInputBox: {
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: styleConsts.white,
  },
  headerWrapper: {
    position: 'relative',
    paddingBottom: 40,
    alignItems: 'center',
  },
  backImg: {
    height: 80,
    width: width - 20,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  userLogo: {
    position: 'absolute',
    top: 20,
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
  },
  clickUp: {
    position: 'relative',
    backgroundColor: styleConsts.bgGrey,
    borderRadius: 3,
    overflow: 'hidden',
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImg: {
    height: 80,
    width: 80,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  noImgTxt: {
    color: styleConsts.middleGrey,
    fontSize: styleConsts.H5,
    marginTop: 8,
  },
  bgImg: {
    height: 26.5,
    width: 30,
  },
  userImg: {
    width: 80,
    height: 80,
  },
  inputList: {
    flexDirection: 'row',
    paddingLeft: 15,
    paddingRight: 10,
  },
  titleBox: {
    paddingRight: 15,
  },
  titleInfo: {
    height: 41,
    justifyContent: 'center',
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  inputBox: {
    flex: 1,
  },
  inputOne: {
    justifyContent: 'center',
    height: 41,
    position: 'relative',
    alignItems: 'center',

    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  inputBar: {
    height: 34,
    width: '100%',
    paddingRight: 20,
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    textAlign: 'right',
    padding: 0,
  },
  leftBar: {
    position: 'absolute',
    right: 0,
    width: 5,
    height: 8,
  },
  selfMask: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(AddShop)
