// 输入
import React,{ PropTypes } from 'react'
import { ScrollView, View, Text, StyleSheet, TextInput, Keyboard } from 'react-native';
import { connect } from 'react-redux'
import { styleConsts } from '../../../utils/styleSheet/styles'
import Platform from 'Platform';
import I18n from 'react-native-i18n';
import HeaderBar from '../../../components/HeaderBar'
import { userSaveGroupInfoAll} from '../../../redux/actions/user.action'
import Toast from 'react-native-root-toast';
import { toastShort } from '../../../components/toastShort'
import {AutoGrowingTextInput} from 'react-native-autogrow-textinput';
const {width, height} = Dimensions.get('window')
import {telephoneReg, phoneReg, mailReg} from '../../../utils/regTemplate'
import BlankPage from '../../../components/BlankPage'
import Dimensions from 'Dimensions';

class InputInfoPerson extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      title: '',
      flag: false,
      showSpinner: false,
    }
  }
  componentDidMount() {
    const {title, value, flag, key} = this.props.navigation.state.params
    this.setState({
      title,
      value,
      flag,
      key
    })
    this.key = key;
  };
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    this.toast && Toast.hide(this.toast);
    this.setState({
      showSpinner: false,
    })
  this.timer&&clearTimeout(this.timer)
  }
  render() {
    return (
      <View style={styles.container}>
        <HeaderBar
          title={this.state.title}
          navigation={this.props.navigation}
          goBackCallBack={() => {Keyboard.dismiss();this.props.navigation.goBack()}}
          rightText={I18n.t('save')}
          cancelCallback={this.saveOneInfo}
        />
        <View style={styles.inputWrapper}>
          <AutoGrowingTextInput
            value={this.state.value}
            onChangeText={(value) => this.setState({value})}
            underlineColorAndroid='transparent'
            style={styles.inputBar}
            autoFocus={true}
            multiline={this.state.flag}
            onSubmitEditing={this.saveOneInfo}
            keyboardType={ this.state.key === 'groupPhone' || this.state.key === 'fax' ? 'numbers-and-punctuation': 'default'}
            returnKeyType={this.state.flag ? 'default' : 'send'}
            textAlignVertical={'top'}
          />
          <View style={{height: 0.5, backgroundColor: styleConsts.headerLine, width: '100%',}} />
        </View>
        <View style={{
          flex: 1,
          width: this.state.showSpinner ? '100%': 0,
          height: this.state.showSpinner? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage
            visable={this.state.showSpinner}
            type={'loading'}
          />
        </View>
      </View>
    )
  }
  saveOneInfo = () => { // 保存头像
    let value = (this.state.value + '').trim();
    this.toast && Toast.hide(this.toast)
    switch (this.key) {
      case 'groupPhone': // 验证电话
        if(!telephoneReg.test(value) && !phoneReg.test(value) && value !== ''){
          return this.toast = toastShort(I18n.t('inputshopTelError'))
        }
        break;
      case 'fax': // 传真
        if(!phoneReg.test(value) && value !== ''){
          return this.toast = toastShort(I18n.t('faxedTypesError'))
        }
        break;
      case 'groupMail': // 邮箱
        if(!mailReg.test(value)){
          return this.toast = toastShort(I18n.t('emailTypesError'))
        }
        break;
      case 'groupAddress': // 详细地址
        if(value.length < 5 || value.length > 100){
          return this.toast = toastShort(I18n.t('groupAddressError'))
        }
        break;
      default:

    }
    let data = { groupID: this.props.purchaserID}
        data[this.key] = value;
        Keyboard.dismiss();
    this.setState({
      showSpinner: true,
    })
    if('pending' !== this.props.$groupInfo.get('saveStatus')){
      this.props.saveOneInfo({
        data,
        success: (res) => {
          this.timer = setTimeout(() => this.props.navigation.goBack(),500)
        },
        fail: (res) => {
          this.setState({
            showSpinner: false,
          })
          this.toast = toastShort((res && res.response && res.response.message ) || I18n.t('saveFail'))
        },
        timeout: () => {
          this.setState({
            showSpinner: false,
          })
          this.toast = toastShort(I18n.t('timeout'))
        },
      })
    }

  }

}

InputInfoPerson.defaultProps = {};

InputInfoPerson.PropTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.white,
  },
  inputWrapper: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: styleConsts.white,
    // height: 40,
    height: Platform.OS === 'ios' ? 40 : 45,
  },
  inputBar: {
    width: width - 21,
    height: 40,
    padding: 5,
    fontSize: styleConsts.H3,
  },
  inputMAxBar: {
    height: 160,
    borderWidth: 0.5,
    borderRadius: 4,
    padding: 8,
    borderColor: styleConsts.headerLine,
  },
});

const mapStateToProps = (state) => {
  return {
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    $groupInfo: state.user.get('groupInfo'),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    saveOneInfo: (opts) => {
      dispatch(userSaveGroupInfoAll(opts))
    },
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(InputInfoPerson)
