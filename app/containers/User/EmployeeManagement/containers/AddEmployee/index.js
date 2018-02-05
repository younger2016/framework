/**
 * 添加/编辑员工
 */
import React, { Component } from 'react';
import { connect } from 'react-redux'
import { ScrollView, View, Text, StyleSheet, Image, StatusBar, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import I18n from 'react-native-i18n';
import { toastShort } from '../../../../../components/toastShort';
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import { styleConsts } from '../../../../../utils/styleSheet/styles'
import HeaderBar from '../../../../../components/HeaderBar'
import SelectEmployeeRole from '../SelectEmployeeRole';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { employeeInfo } from './config';
import { headerImgs } from '../../config';
import { telephoneReg, companyNameReg } from '../../../../../utils/regTemplate';
import BlankPage from '../../../../../components/BlankPage';
import { setTask } from '../../../../../utils/deskTask';

import {
  fetchRoleListAC,
  saveAddEmployeeAC,
  feditEmployeeInfoAC,
  saveEditEmployeeAC,
} from  '../../../../../redux/actions/employeeManagement.action';
import {
  NAV_TO_SELECT_SHOPS,
} from '../../../../../redux/actions/nav.action';

class AddEmployee extends Component{
  constructor(props){
    super(props);
    this.state = {
      employeeName: '',     // 员工姓名
      loginPhone: '',       // 手机号码
      loginPWD: '',         // 登录密码
      roleID: '',
      roleName: '',         // 员工职务
      selectShops: [],      // 选中的负责门店列表
      roleList: [],         // 获取的职位列表
      addEidtFlag: false,   // 新增/编辑员工信息，默认是新增
      employeeID: '',
      visible: false,            // 加载模态框是否显示，默认不显示
      isLoading: false,          // 员工信息是否加载过，默认没有
      loadingSuccess: false,     // 员工信息是否加载成功，
    };
    this.saveClickFlag = false;  // 保存按钮是否能点击，默认
  }
  componentDidMount() {
    let employeeID = this.props.navigation.state.params.employeeID;
    if(employeeID !== undefined) {
      // 编辑/查看员工信息
      this.setState({
        addEidtFlag: true,
        visible: true,
        employeeID: employeeID,
      },() => {
        // 请求员工的信息
        this.fetchEmployeeInfo();
      });
     }

    // 如果已经获取过员工职位列表，直接从store中拿数据，否则的话发请求获取员工职位列表
    if(!this.props.$employeeInfo.getIn(['roleInfo','initialize'])) {
      this.props.fetchRoleList({
        data: {},
        fail: () => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
        },
        timeout: () => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
        },
      });
    } else {
      this.fetchRoleList(this.props);
    }

  }
  componentWillReceiveProps(nextProps){
    // 员工职位列表
    if(!Immutable.is(this.props.$employeeInfo.get('roleInfo'),nextProps.$employeeInfo.get('roleInfo'))) {
      this.fetchRoleList(nextProps);
    }

    // 需要编辑的员工信息
    if(!Immutable.is(this.props.$employeeInfo.get('editEmployeeInfo'),nextProps.$employeeInfo.get('editEmployeeInfo'))) {
      let editEmployeeInfo = Immutable.Map.isMap(nextProps.$employeeInfo) ?
        nextProps.$employeeInfo.toJS().editEmployeeInfo : nextProps.$employeeInfo.editEmployeeInfo;

      if('success' === editEmployeeInfo.status) {
        let info = editEmployeeInfo.info;
        let roles = JSON.parse(info.employeeRole);
        let selectShops = JSON.parse(info.employeeShop);

        this.setState({
          employeeName: info.employeeName,
          loginPhone: info.loginPhone,
          loginPWD: info.loginPWD,
          roleID: roles[0].roleID,
          roleName: roles[0].roleName,
          selectShops: selectShops,
          visible: false,
          isLoading: true,
          loadingSuccess: true,
        })
      }
    }
  }
  render(){
    let { roleID, roleList, addEidtFlag, isLoading, loadingSuccess } = this.state;
    return (
      <View style={styles.container}>
        {
          addEidtFlag ?
            isLoading && loadingSuccess ?
              <HeaderBar
                title='编辑员工'
                rightText={I18n.t('save')}
                cancelCallback={() => this.saveEmployeeInfo()}
                navigation={this.props.navigation}
              /> :
              <HeaderBar
                title='编辑员工'
                cancelHide={true}
                navigation={this.props.navigation}
              /> :
            <HeaderBar
              title='添加员工'
              rightText={I18n.t('save')}
              cancelCallback={() => this.saveEmployeeInfo()}
              navigation={this.props.navigation}
            />
        }

        {
          addEidtFlag ?
            isLoading ?
              (loadingSuccess ? this.renderContent() : <BlankPage visable={true} type={'error'} loadAgain={this.fetchEmployeeInfo} />)
              : null
            : this.renderContent()
        }

        {/*员工职位模态框*/}
        <SelectEmployeeRole
          ref='selectEmployeeRole'
          roleList={roleList}
          selectRoleID={roleID}
          confirm={(item) => {
            let { roleID, roleName } = this.state;
            roleID = item.roleID;
            roleName = item.roleName;
            this.setState({ roleID, roleName })
          }}
        />

        <View style={{
          flex: 1,
          width: this.state.visible ? '100%': 0,
          height: this.state.visible? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage
            visable={this.state.visible}
            type={'loading'}
          />
        </View>
      </View>
    )
  }

  // 添加员工每一项
  renderContent = () => {
    let newState = this.state;
    let { roleID, selectShops, addEidtFlag } = this.state;
    return (
      <KeyboardAwareScrollView extraScrollHeight={6}>
        <ScrollView>
          <View style={styles.content}>
            <View style={styles.imgWrapper}>
              <Image style={styles.bgImg} source={require('../../imgs/bgImg.png')} />
              <View style={styles.heanderImgWrapper}>
                <Image
                  style={styles.headerImg}
                  source={ roleID === '' ? require('../../../../../imgs/people/boss.png') : headerImgs[roleID]}
                />
              </View>
            </View>

            <View style={styles.addInfo}>
              {
                employeeInfo.map( (item) => {
                  if(addEidtFlag && item.label === '登录密码') {
                    return null;
                  }
                  return (
                    <View style={styles.row} key={item.id}>
                      <Text style={styles.title}>{item.label}</Text>
                      <View style={styles.rightPart}>
                        <TextInput
                          style={[styles.inputTxt, addEidtFlag && item.title === 'loginPhone' ? { color: styleConsts.grey } : {}]}
                          placeholder={item.placeholder}
                          placeholderTextColor={styleConsts.middleGrey}
                          underlineColorAndroid="transparent"
                          keyboardType={item.keyboardType}
                          maxLength={item.max}
                          editable={ addEidtFlag && item.title === 'loginPhone' ? false : item.editable}
                          value={`${newState[item.title]}`}
                          onChangeText={ (val) => this.handleInputChange(val,item.title)}
                          textAlign='right'
                        />
                      </View>
                    </View>
                  )
                })
              }

              <View style={styles.row}>
                <Text style={styles.title}>员工职务</Text>
                <TouchableWithoutFeedback
                  onPress={() => {
                    this.refs.selectEmployeeRole.show(() => setTask(null));
                    setTask(this.refs.selectEmployeeRole.hide)
                  }}
                >
                  <View style={styles.rightPart}>
                    <TextInput
                      style={styles.inputTxt}
                      placeholder='请选择员工职务'
                      underlineColorAndroid="transparent"
                      placeholderTextColor={styleConsts.middleGrey}
                      editable={false}
                      textAlign='right'
                      value={newState.roleName}
                    />
                    <Image style={styles.rightArrow} source={require('../../../../../imgs/rightArrow.png')} />
                    <View style={{width: '100%',height: '100%',position: 'absolute', top: 0, left: 0,}} />
                  </View>
                </TouchableWithoutFeedback>
              </View>

              <View style={styles.row}>
                <Text style={styles.title}>负责门店</Text>
                <TouchableWithoutFeedback onPress={ () =>
                  this.props.navToSelectManageShop({
                    selectShopsCallBack: this.selectShops,
                    selectShops: this.state.selectShops
                  })
                }>
                  <View style={styles.rightPart}>
                    <TextInput
                      style={styles.inputTxt}
                      placeholder='请选择员工负责门店'
                      underlineColorAndroid="transparent"
                      placeholderTextColor={styleConsts.middleGrey}
                      editable={false}
                      textAlign='right'
                      value={selectShops.length !== 0 ? `已负责${selectShops.length}个门店` : ''}
                    />
                    <Image style={styles.rightArrow} source={require('../../../../../imgs/rightArrow.png')} />
                    <View style={{width: '100%',height: '100%',position: 'absolute', top: 0, left: 0,}} />
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    )
  };

  // 处理员工姓名、手机号码、登录密码改变
  handleInputChange = (val,title) => {
    let newState = this.state;
    newState[title] = val;
    this.setState( { newState } );
  };

  // 选择员工负责的门店
  selectShops = (val) => {
    this.setState({
      selectShops: val,
    })
  };

  // 获取职位列表
  fetchRoleList = (props) => {
    let roleInfo = Immutable.Map.isMap(props.$employeeInfo) ?
      props.$employeeInfo.toJS().roleInfo : props.$employeeInfo.roleInfo;

    if('success' === roleInfo.status) {
      // 处理获取数据为数组格式
      let info = roleInfo.info;
      let roleList = [];
      for( let key in info){
        roleList.push({
          roleID: key,
          roleName: info[key],
        });
      }
      this.setState({
        roleList: roleList,
      });
    }
  };

  // 获取员工详细信息
  fetchEmployeeInfo = () => {
    let { employeeID } = this.state;
    return (
      this.props.feditEmployeeInfo({
        data: {
          employeeID,
        },
        fail: (res) => {
          this.setState({
            visible: false,
            isLoading: true,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
        },
        timeout: () => {
          this.setState({
            visible: false,
            isLoading: true,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
        },
      })
    )
  };

  // 添加、编辑员工时传的参数
  sendRequestParams = () => {
    let { employeeName, loginPhone, loginPWD, roleID, roleName, selectShops, addEidtFlag } = this.state;
    return (
      {
        data: {
          employeeID: addEidtFlag ? this.props.navigation.state.params.employeeID : '',
          employeeName,
          loginPWD,
          loginPhone,
          roles: [
            {
              roleID,
              roleName,
            }
          ],
          shops: selectShops,
        },
        employee: {
          employeeID: addEidtFlag ? this.props.navigation.state.params.employeeID : '',
          employeeName,
          groupID: this.props.$user.toJS().userInfo.purchaserID,
          loginPhone,
          roles: roleName,
          shopAccount: selectShops.length,
        },
        index: addEidtFlag ? this.props.navigation.state.params.index : -1,
        success: (res) => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res && res.message || '请求成功');
          this.props.navigation.goBack();
        },
        fail: (res) => {
          this.setState({
            visible: false,
          });
          this.saveClickFlag = false;
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
        },
        timeout: () => {
          this.setState({
            visible: false,
          });
          this.saveClickFlag = false;
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
        },
      }
    )
  };

  // 保存添加的员工信息
  saveEmployeeInfo = () => {
    // 校验
    let { employeeName, loginPhone, loginPWD, roleName, selectShops, addEidtFlag } = this.state;
    if('' === employeeName.trim()){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('员工姓名不能为空哦');
      return;
    }
    if(!companyNameReg.test(employeeName)) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('员工姓名请勿包含特殊字符');
      return;
    }
    if(employeeName.trim().length > 10) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('员工姓名请不要超过10个字哦');
      return;
    }
    if(!telephoneReg.test(loginPhone)){
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('请输入正确的手机号码');
      return;
    }
    if(!addEidtFlag) {
      if('' === loginPWD) {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort('登录密码不能为空哦');
        return;
      }
      if(loginPWD.length < 6 && loginPWD.length > 20) {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(`请输入6-20位登录密码`);
        return;
      }
      if(/\s+/.test(loginPWD)) {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(`登录密码中不能包含空格`);
        return;
      }
    }
    if('' === roleName) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('请选择员工职位');
      return;
    }
    if(0 === selectShops.length) {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('请选择员工负责门店');
      return;
    }

    Keyboard.dismiss();
    this.setState({
      visible: true,
    });

    if(this.saveClickFlag) return;
    this.saveClickFlag = true;

    !addEidtFlag ?
      this.props.saveEmployeeInfo(this.sendRequestParams()) :
      this.props.saveEditEmployee(this.sendRequestParams())
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  content: {
    marginLeft: styleConsts.screenLeft,
    marginRight: styleConsts.screenRight,
    marginTop: 10,
    backgroundColor: styleConsts.white,
    paddingBottom: 50,
    borderRadius: 5,
  },
  imgWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  bgImg: {
    width: width - 20,
    height: 100,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  heanderImgWrapper: {
    width: 90,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 35,
    borderWidth: 10,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 5,
  },
  headerImg: {
    width: 80,
    height: 80,
  },
  addInfo: {
    marginTop: 50,
    paddingLeft: 20,
    paddingRight: 20,
  },
  row: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  rightPart: {
    flex: 1,
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  inputTxt: {
    flex: 1,
    height: 40,
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    marginRight: 10,
  },
  rightArrow: {
    width: 6.5,
    height: 12,
  },
  iconBox: {
    width: '100%',
    position: 'absolute',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
  },

  shopList: {
    marginLeft: 75,
  },
  shopItem: {
    justifyContent: 'flex-end',
    height: 40,
    alignItems: 'flex-end',
  },
  shopName: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
  }
});

const mapStateToProps = (state) => {
  return {
    $employeeInfo: state.employeeInfo,
    $user: state.user,
  }
};
const mapDispatchToProps = (dispath) => {
  return {
    // 获取员工职位列表
    fetchRoleList: (opts) => {
      dispath(fetchRoleListAC(opts))
    },
    // 选择负责门店
    navToSelectManageShop: (opts) => {
      dispath({type: NAV_TO_SELECT_SHOPS, payload: opts})
    },
    // 保存添加的员工信息
    saveEmployeeInfo: (opts) => {
      dispath(saveAddEmployeeAC(opts));
    },
    // 编辑时请求员工信息
    feditEmployeeInfo: (opts) => {
      dispath(feditEmployeeInfoAC(opts));
    },
    // 保存编辑的员工信息
    saveEditEmployee: (opts) => {
      dispath(saveEditEmployeeAC(opts));
    }
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(AddEmployee)
