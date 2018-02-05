/**
 * 我的
 */
import React,{PropTypes} from 'react'
import { ScrollView, View, Text, StyleSheet, Image, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux'
import { is, Map } from 'immutable';
import ModalBox from '../../components/ModalBox'
import {styleConsts} from '../../utils/styleSheet/styles'
import Platform from 'Platform';
import Immutable from 'immutable';
import { orderData, normalList } from './config';
import Dimensions from 'Dimensions';
import I18n from 'react-native-i18n'
import { CachedImage } from "react-native-img-cache";
import { TouchableWithoutFeedbackD } from '../../components/touchBtn'
import {
  NAV_TO_LOGIN_SCENE,
  NAV_TO_BILLS_INFO_PAGE,
  NAV_TO_SETTING_PAGE,
  NAV_TO_PERSONINFO_MAIN_PAGE,
  NAV_TO_PERSON_INFO_COMPENY,
  NAV_TO_INPUT_INFO_SCENE,
} from '../../redux/actions/nav.action'
import {
  fetchOrderSomeNum
} from '../../redux/actions/orderCenter.action'
import {getImgUrl} from '../../utils/adapter'
import Toast from 'react-native-root-toast';
import { toastShort } from '../../components/toastShort'

const {width, height} = Dimensions.get('window')
const buyer = require('../../imgs/people/man.png');
const treasurer = require('../../imgs/people/woman.png');
const remindTypes = [
  {
  title: 'cannotshopsTips',
  context: 'cannotmangementshops'
  },
  {
  title: 'cannotPersonTips',
  context: 'cannotmangementyourPerson'
  }
];
class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOn: false,    // 是否登录，默认是没有登录
      accountType: 1,
      roleName: '',
      info: {
        purchaserName: '',
        purchaserUserName: '',
      },
      orderNum: [0, 0],
      logo: '',
      visible: false,
      remindTypes: 0,
      shopsArr: [],
      open: false,    // 有新版本提示用户标示
    }
  }
  componentDidMount() {

    // 如果没登录则isOn设为false，否则设为true
    if(this.props.token === '' || !this.props.token){
      this.setState({
        isOn: false
      })
    } else{
      this.setState({
        isOn: true,
        info: this.props.$userInfo.toJS(),
        accountType: this.props.accountType,
        roleName: this.props.roleName,
        logo: this.props.groupLogoUrl,
      });

      // 订单数量
      if(Map.isMap(this.props.$orderNum)){
        this.setState({
          orderNum: this.props.$orderNum.get('list').toJS()
        })
      }

      let data = Immutable.Map.isMap(this.props.user) ? this.props.user.toJS().cache.data : this.props.user.cache.data;
      this.setState({
        shopsArr: data.purchaserShop
      }, () => {
        this.fetchOrderNum();
      });
    }

    // 从缓存中获取版本信息
    if(this.props.user.getIn(['versionData','open'])) {
      this.setState({
        open: this.props.user.getIn(['versionData','open']),
      })
    }

  };

  componentWillReceiveProps(nextProps) {
    if(nextProps.token !== this.props.token){
      if(nextProps.token === '' || !nextProps.token){
        this.setState({
          isOn: false
        })
      } else{
        this.setState({
          isOn: true,
          info: nextProps.user.get('userInfo').toJS(),
          accountType: nextProps.accountType,
          roleName: nextProps.roleName,
          logo: nextProps.groupLogoUrl,
        });
        this.fetchOrderNum(nextProps.purchaserID) // 防止重新登录
      }
    }

    if(nextProps.groupLogoUrl !== this.props.groupLogoUrl){
      this.setState({
        logo: nextProps.groupLogoUrl,
      })
    }

    if(!(is(this.props.$orderNum.get('list'), nextProps.$orderNum.get('list')))){
      this.setState({
        orderNum: nextProps.$orderNum.get('list').toJS()
      })
    }

    if(nextProps.$route.routes.length <= 1 && nextProps.$tabNav.toJS().index === 3){
      StatusBar.setBarStyle('light-content');
      Platform.OS === 'android' && StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    }

    if(this.props.user.getIn(['cache', 'data']) !== nextProps.user.getIn(['cache', 'data'])) {
      let data = Immutable.Map.isMap(nextProps.user) ? nextProps.user.toJS().cache.data : nextProps.user.cache.data;
      this.setState({
        shopsArr: data.purchaserShop
      },() => {
        this.fetchOrderNum();
      });
    }

    if(this.props.user.getIn(['versionData','open']) !== nextProps.user.getIn(['versionData','open'])) {
      this.setState({
        open: nextProps.user.getIn(['versionData','open']),
      })
    }

  }
  render() {
    let isOnline = this.props.user.getIn(['cache', 'data', 'userInfo', 'isOnline']);
    return (
      <View style={styles.container}>
        <StatusBar barStyle='light-content' backgroundColor={'rgba(0,0,0,0)'} translucent={true}/>
        <View style={styles.headerWrapper}>
          <Image
            source={require('./img/backImg.png')}
            style={styles.backImg}
          />
          <TouchableWithoutFeedbackD onPress={()=>this.onPressTitle()}>
            <View style={styles.imgWrapper}>
              {
                this.state.isOn ?
                  <CachedImage
                    style={styles.userImg}
                    source={
                      this.state.accountType === 0 ?
                        (this.state.logo && '' !== this.state.logo ? {uri: getImgUrl(this.state.logo)}
                        : require('../../imgs/noLine.png'))
                      : (1 == this.state.roleName ? buyer : treasurer)
                    }
                  />
                  : <Image style={styles.userImg} source={require('../../imgs/noLine.png')}/>
              }
            </View>
          </TouchableWithoutFeedbackD>
          <TouchableWithoutFeedbackD onPress={ () => {this.onPressTitle()} }>
            {
              !this.state.isOn ?
              <View style={{alignItems: 'center'}} >
                <Text style={styles.shopName}>{I18n.t('loginAndresgiter')}</Text>
              </View> :
              (
                isOnline == 2 || isOnline == 3 ?
                  (
                    <View style={{alignItems: 'center'}} >
                      <View style={styles.inputBtn} >
                        <Image style={{width: 12, height: 12}} source={require('./img/pen.png')}/>
                        <Text style={{color: styleConsts.white, backgroundColor: 'transparent', fontSize: styleConsts.H4}}>完善资料</Text>
                      </View>
                    </View>
                  ):
                  (
                    <View style={{alignItems: 'center'}} >
                      <Text style={styles.shopName}>{this.state.info.purchaserName}</Text>
                      {this.state.info.purchaserUserName !== '' ? <Text style={styles.userName}>{this.state.info.purchaserUserName}</Text> : null}
                    </View>
                  )
              )
          }
          </TouchableWithoutFeedbackD>
        </View>
        <ScrollView>
          <View>
            {/*我的订单*/}
            <TouchableWithoutFeedbackD onPress={() => this.goSomeWhere({type: NAV_TO_BILLS_INFO_PAGE, payload:{callback: this.fetchOrderNum}})}>
              <View style={styles.myOrdersHeader}>
                <Text style={styles.mainTitle}>{I18n.t('myOrders')}</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.lookMyOrders}>{I18n.t('allOrders')}</Text>
                  <Image
                    style={{height: 8,width: 5, marginLeft: 5}}
                    source={require('../../imgs/leftBar.png')}
                  />
                </View>
              </View>
            </TouchableWithoutFeedbackD>
            {/*订单状态*/}
            <View style={styles.myOrdersContent}>
              {
                orderData.map(({ height, width, img, id, nav, title }, index) => {
                  return (
                    <TouchableWithoutFeedbackD key={id} onPress={() => this.goSomeWhere({type: NAV_TO_BILLS_INFO_PAGE, payload: {index:index+1,callback: this.fetchOrderNum}})}>
                      <View style={styles.myOrdersDetail}>
                        <View style={styles.imgPos}>
                          <Image
                            style={{ height, width }}
                            source={img}
                          />
                          {
                            (index < 3 && this.state.orderNum[index] > 0 && this.state.isOn) ?
                            <View style={styles.numBox}>
                              <Text style={styles.numTxt}>{this.state.orderNum[index]}</Text>
                            </View>: null
                          }
                        </View>
                        <Text numberOfLines={1} style={styles.ordersState}>{I18n.t(title)}</Text>
                      </View>
                    </TouchableWithoutFeedbackD>
                  );
                })
              }
            </View>
          </View>
          <View style={styles.myOrdersHeader}>
            <Text style={styles.mainTitle}>{I18n.t('normalUtils')}</Text>
          </View>
          {/*常用工具*/}
          <View style={styles.wrapper}>
            {
              normalList.map((item, index) => {
                return (
                  <View key={`${index}Icon`}>
                    {
                      index > 0 &&
                      <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                    }
                    <View  style={[styles.iconList]}>
                     {item.map(({id, img, title, nav, height, width}) => {
                       return (
                         <TouchableWithoutFeedbackD
                           key={id}
                           onPress = {()=>this.goSomeWhere(nav,id)}
                         >
                           <View style={styles.myCollection} >
                             <Image
                               style={{height, width}}
                               source={img}
                             />
                             <Text numberOfLines={1} style={[styles.iconTitle]}>{I18n.t(title)}</Text>
                           </View>
                         </TouchableWithoutFeedbackD>
                       )
                     })}
                    </View>
                  </View>

                );
              })
            }
          </View>
          {/*设置*/}
          <TouchableWithoutFeedbackD onPress={() => this.props.navToSetting()}>
            <View style={styles.setting}>
              <View style={styles.settingLeft}>
                <Image source={require('./img/setting.png')} style={{width: 13.5, height: 14}}/>
                <Text style={styles.settingTxt}>{I18n.t('setting')}</Text>
                {
                  this.state.open ?
                    <View style={styles.remindWrapper}>
                      <Text style={styles.remindText}>NEW</Text>
                    </View> : null
                }
              </View>
              <Image style={{height: 8,width: 5}} source={require('../../imgs/leftBar.png')} />
            </View>
          </TouchableWithoutFeedbackD>
        </ScrollView>

        <ModalBox
          imgName='what'
          iconName='warning'
          visible={this.state.visible}
          title={I18n.t(remindTypes[this.state.remindTypes].title)}
          tipTxt={I18n.t(remindTypes[this.state.remindTypes].context)}
          leftBtnTxt= {isOnline == 0 ? I18n.t('gotIt'):null}
          rightBtnTxt= {isOnline == 2 || isOnline == 3 ? I18n.t('inputNow') : null}
          laterBtnTxt={isOnline == 2 || isOnline == 3?I18n.t('letMeThink'): null}
          rightCallback={() => {
            this.setState({visible: false});
            this.goSomeWhere({
              type: NAV_TO_INPUT_INFO_SCENE,
              payload: {
                loginPhone: this.state.info.loginPhone,
                groupName: this.state.info.purchaserName,
              }
            })
          }}
          laterCallback={() => {
            this.setState({visible: false});
          }}
          leftCallback={() => {
            this.setState({visible: false});
          }}
        />
      </View>
    )
  }
  goSomeWhere = (nav,ids) => {
    let isOnline = this.props.user.getIn(['cache', 'data', 'userInfo', 'isOnline']);
    this.toast && Toast.hide(this.toast)
    if(this.state.isOn){
      if(this.props.accountType == 0){
        if(1 == isOnline){
          this.props.goSomeWhere(nav)
        } else{
          if(ids === 1 || ids === 2){ //  去完善资料
            this.setState({
              visible: true,
              remindTypes:  ids - 1
            });
          } else{
            this.props.goSomeWhere(nav)
          }
        }
      } else{
        if(this.props.roleName == '1' && (ids === 3 || ids ===5 || !ids)){ // 采购员 只能进入采购清单--收藏店铺
          this.props.goSomeWhere(nav)
        } else if(this.props.roleName == '2' && ids === 4 || !ids) { // 财务只能进去交易哦记录
          this.props.goSomeWhere(nav)
        } else{
          this.toast == toastShort('您没有权限操作')
        }
      }
    } else{
      this.props.goSomeWhere({ type: NAV_TO_LOGIN_SCENE })
    }
  }

  onPressTitle = () => {
    let isOnline = this.props.user.getIn(['cache', 'data', 'userInfo', 'isOnline']);

    if(!this.state.isOn){
      this.goSomeWhere({ type: NAV_TO_LOGIN_SCENE })
    }else{
      if(isOnline == 2 || isOnline == 3){
        this.goSomeWhere({
          type: NAV_TO_INPUT_INFO_SCENE,
          payload: {
            loginPhone: this.state.info.loginPhone,
            groupName: this.state.info.purchaserName,
          }
        })
      }else{
        if(this.props.accountType == 0){
          this.goSomeWhere({type: NAV_TO_PERSONINFO_MAIN_PAGE})
        } else{
          this.goSomeWhere({type: NAV_TO_PERSON_INFO_COMPENY})
        }
      }
    }
  }
  // 获取订单数量
  fetchOrderNum = (login) => {
    if('pending' !== this.props.$orderNum.get('status') && ((this.props.token !== '' && this.props.token) || login)){
      this.props.fetchOrderNum({
        data: {
          purchaserID: login || this.props.purchaserID,
          shopIDList: this.state.shopsArr.map(shop => shop.shopID)
        }
      })
    }
  }

}
User.defaultProps = {};

User.PropTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  backImg: {
    width,
    height: 193,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  headerWrapper: {
    alignItems: 'center',
    height:193,
    paddingTop: 30,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  imgWrapper: {
    width: 73,
    height: 73,
    marginBottom: 10,
    borderRadius: 36.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userImg: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
  },
  shopName: {
    color: styleConsts.white,
    fontSize: styleConsts.H3,
    backgroundColor: 'rgba(0,0,0,0)',
    marginBottom: 5,
  },
  userName: {
    color: styleConsts.white,
    fontSize: styleConsts.H4,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  myOrdersHeader: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: styleConsts.white,
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  mainTitle: {
    color: styleConsts.deepGrey,
    fontSize: styleConsts.H3,
  },
  lookMyOrders: {
    color: styleConsts.darkGrey,
    fontSize: styleConsts.H5,
  },
  myOrdersContent: {
    flexDirection: 'row',
    backgroundColor: styleConsts.white,
    height: 100,
    alignItems: 'center',
  },
  myOrdersDetail: {
    alignItems: 'center',
    flex: 1,
    height: 100,
    justifyContent: 'center',
  },
  imgPos: {
    position: 'relative'
  },
  numBox: {
    minWidth: 16,
    minHeight: 16,
    padding: 2,
    alignItems: 'center',
    position: 'absolute',
    justifyContent: 'center',
    backgroundColor: styleConsts.mainColor,
    borderRadius: 8,
    right: -8,
    top: -8,
    overflow: 'hidden',
    zIndex: 999
  },
  numTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.white,
  },
  ordersState: {
    marginTop: 10,
    color: styleConsts.deepGrey,
    fontSize: styleConsts.H5,
  },
  wrapper: {
    backgroundColor: styleConsts.white,
  },
  iconList: {
    flexDirection: 'row',
    marginTop: 20,
    paddingBottom: 20,
    flex: 4,
  },
  iconTitle: {
    color: styleConsts.deepGrey,
    fontSize: styleConsts.H4,
    marginTop: 10,
  },
  myCollection: {
    alignItems: 'center',
    width : width / 4,
  },
  setting: {
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: styleConsts.white,
    marginVertical: 10,
  },
  settingLeft: {
    flexDirection: 'row',
  },
  settingTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    marginLeft: 10,
  },
  inputBtn: {
    width: 85,
    height: 20,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    flexDirection: 'row'
  },
  remindWrapper: {
    backgroundColor: 'red',
    paddingTop: 1,
    paddingBottom: 2,
    paddingLeft: 6,
    paddingRight: 6,
    borderRadius: 8,
    marginLeft: 5,
    justifyContent: 'center',
  },
  remindText: {
    fontSize: styleConsts.H6,
    color: styleConsts.white,
    fontWeight: 'bold',
  },
});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    token: state.user.get('token'),
    $userInfo: state.user.getIn(['userInfo']),
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    accountType: state.user.getIn(['userInfo','accountType']), // 0 -- 主号； 1 --- 子号
    roleName: state.user.getIn(['userInfo', 'roleName']),      // 1--采购员 2--财务
    groupLogoUrl: state.user.getIn(['userInfo', 'groupLogoUrl']),
    $orderNum: state.orderCenter.get('orderNUm'),
    $tabNav: state.tabNav,
    $route: state.nav,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    goSomeWhere: (opts)=>{
      dispatch(opts)
    },
    navToSetting: (opts) => {
      dispatch({type: NAV_TO_SETTING_PAGE});
    },
    fetchOrderNum: (opts) => {
      dispatch(fetchOrderSomeNum(opts))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(User)
