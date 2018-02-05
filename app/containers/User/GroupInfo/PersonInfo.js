// 集团信息

// 收藏的店铺

import React,{ PropTypes } from 'react'
import { ScrollView, View, Text, StyleSheet, StatusBar, FlatList, Image } from 'react-native';
import { connect } from 'react-redux'
import { styleConsts } from '../../../utils/styleSheet/styles'
import Platform from 'Platform';
import I18n from 'react-native-i18n';
import HeaderBar from '../../../components/HeaderBar'
import Dimensions from 'Dimensions';
import { is } from 'immutable'
import Toast from 'react-native-root-toast';
import { toastShort } from '../../../components/toastShort'
import SelectArea from '../../../components/SelectArea'
import SelecCategory from '../../../components/SelecCategory'
const personTypes =[
  {

  },
  {
    title:'buyer',
    img: require('../../../imgs/people/man.png')
  },
   {
    title: 'finance',
    img: require('../../../imgs/people/woman.png')
  },
]
const {width, height} = Dimensions.get('window');


class PersonInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      purchaserShop: this.props.purchaserShop || [{},{}], // 负责的门店
      userInfo: this.props.userInfo || {
        accountType: '',//	账号类型(0-主账号，1-子账号)	number
        isOnline: '',//		审核状态（0-待审核 1-审核通过 2-审核未通过）	number
        loginPhone: '',//		登录手机号	string
        purchaserID: '',//		采购商集团ID	number
        purchaserName: '',//		采购商集团名称	string
        purchaserUserCode: '',//		员工编号	string
        purchaserUserID: '',//		采购商用户ID	number
        purchaserUserName: '',//		采购商用户名称	string
        resourceType: '',//		数据来源类型(1-自主添加，2-商户中心)	number
        roleName: '',//		角色名称
      },
    }
  }
  componentDidMount() {

  };
  componentWillReceiveProps(nextProps) {

  }
  componentWillUnmount() {
    this.toast && Toast.hide(this.toast)
  }
  render() {
    const {roleName = ''} = this.state.userInfo
    return (
      <View style={styles.container}>
        <HeaderBar
          title={I18n.t('myPerson')}
          cancelHide={true}
          navigation={this.props.navigation}
        />
        <ScrollView>
          <View style={styles.moudelBox}>
            <View style={[styles.listBox, styles.topIMgBox]}>
              <Text style={styles.title} >
                {
                  //集团标志
                  I18n.t('staffLogo')
                }
              </Text>
              <View style={styles.userImg}>
                  <Image
                    source={roleName !== '' ? personTypes[roleName].img : require('../../../imgs/camera.png')}
                    style={[styles.bgImg, roleName !== '' && {width: 60, height: 60}]}
                  />
              </View>
            </View>
          </View>
          {this.renderCenterList()}
          {this.renderBottomList()}
        </ScrollView>
      </View>
    )
  }
  renderCenterList = () => {
    const { roleName = '', purchaserUserName = '', loginPhone = ''} = this.state.userInfo
    return (
     <View style={styles.moudelBox}>
      <View style={[styles.listBox,]}>
        <Text style={styles.title}>
          {
            I18n.t('staffName')
          }
        </Text>
        <View style={styles.inputList}>
          <Text style={styles.inputTxt} numberOfLines={1}>
            {purchaserUserName}
          </Text>
        </View>
      </View>
      <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
      <View style={[styles.listBox,]}>
        <Text style={styles.title}>
          {

            I18n.t('staffCom')
          }
        </Text>
        <View style={styles.inputList}>
          <Text style={styles.inputTxt} numberOfLines={1}>
            {roleName !== '' && I18n.t(personTypes[roleName].title)}
          </Text>
        </View>
      </View>
      <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
      <View style={[styles.listBox]}>
        <Text style={styles.title}>
          {
            I18n.t('linkTypes')
          }
        </Text>
        <View style={styles.inputList}>
          <Text style={styles.inputTxt} numberOfLines={1}>
            {loginPhone}
          </Text>
        </View>
      </View>

    </View>
    )
  }

  renderBottomList = () => {
    return (
     <View style={styles.moudelBox}>
      <View style={[styles.listBox,]}>
        <Text style={styles.title}>
          {
            I18n.t('myHaveShops')
          }
        </Text>
        <View style={styles.inputList}>
          <Text style={styles.inputTxt} numberOfLines={1}>
            {this.state.purchaserShop.length}
          </Text>
        </View>
      </View>
      <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
      {
        this.state.purchaserShop.map(({shopName, shopID},index) => {
          return (
          <View>
              {index > 0 && <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>}
              <View style={[styles.listBox]} key={shopID}>
                <Image source={require('../img/stores.png')} style={styles.leftImg}/>
                <View style={styles.inputList}>
                  <Text style={styles.inputTxt} numberOfLines={1}>
                    {shopName}
                  </Text>
                </View>
              </View>
          </View>
          )
        })
      }
    </View>
    )
  }


}
PersonInfo.defaultProps = {};

PersonInfo.PropTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  moudelBox: {
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    backgroundColor: styleConsts.white,
  },
  listBox: {
    height: 45,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  topIMgBox: {
    height: 80,
    borderBottomWidth: 0,
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  inputTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  inputList: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: width - 175,
    justifyContent: 'flex-end',
  },
  leftBar: {
    width: 5,
    height: 8,
    marginLeft: 10,
  },
  userImg: {
    width: 60,
    height: 60,
    backgroundColor: styleConsts.bgGrey,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  bgImg: {
    width: 30,
    height: 26.5,
    position: 'absolute',
  },
  leftImg: {
    width: 14,
    height: 14,
  },
});

const mapStateToProps = (state) => {
  return {
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    purchaserShop: state.user.getIn(['cache', 'data', 'purchaserShop']) ? state.user.getIn(['cache', 'data', 'purchaserShop']).toJS() : [],
    userInfo: state.user.getIn(['cache', 'data', 'userInfo']) ? state.user.getIn(['cache', 'data', 'userInfo']).toJS() : {},
  }
};

const mapDispatchToProps = (dispatch) => {
  return {

  }
};

export default connect(mapStateToProps, mapDispatchToProps)(PersonInfo)
