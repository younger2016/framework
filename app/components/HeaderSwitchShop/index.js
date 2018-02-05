/**
 * 头部切换门店和搜索
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, StatusBar, Image, TouchableWithoutFeedback, AsyncStorage, PanResponder, Platform } from 'react-native';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import Immutable from 'immutable';
import Modal from 'react-native-modal';
import { styleConsts } from '../../utils/styleSheet/styles';
import { PullScrollview } from '../PullList';
import { SAVE_SELECTED_SHOP_ID_AND_NAME } from '../../redux/actions/storesCenter.action'
import { NAV_TO_SEARCH_SCENE } from '../../redux/actions/nav.action'
import I18n from 'react-native-i18n'

import HeaderSearchBtn from '../HeaderSearchBtn'  // 未登录 或 正常营业的门店为空 时 首页、分类 展示的header
import HeaderBar from '../HeaderBar'              // 未登录 或 正常营业的门店为空 时 进货单 展示的header

// 门店营业状态(1-正常营业，0-暂停营业)
const SHOP_STATUS_NORMAL_BUSINESS = 1;
const SHOP_STATUS_STOP_BUSINESS = 0;

class HeaderSwitchShop extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      shopList: [],         // 获取的店铺列表数据
      newShopList: [],      // 过滤出正常营业的门店列表
      selectShopName: '',   // 当前选中的店铺名称
      selectShopID: '',     // 当前选中的店铺ID
      data:{},
    }
  }
  componentWillMount() {
    this._panResponder = PanResponder.create({
      // 要求成为响应者：
      onStartShouldSetResponder: (evt, gestureState) => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => true,
      onPanResponderRelease: (evt, gestureState) => {
        // 用户放开了所有的触摸点，且此时视图已经成为了响应者。
        // 一般来说这意味着一个手势操作已经成功完成。
        if (gestureState.dx <= 0) {
          this.setState({
            isVisible: false,
          })
        }
      },
    })
  }
  componentDidMount(){
    /** 用户未登录时不能显示门店 */
    if ('' !== this.props.$user.get('token') || this.props.$user.get('token')) {
      AsyncStorage.getItem('selectShop').then(selectShop => {
        if (selectShop !== null && selectShop !== undefined) { // 每次进入，从应用缓存中获取选中门店、正常营业的门店列表，放入state中
          const newSelectShop = JSON.parse(selectShop)
          if (newSelectShop.selectShopName !== '' && newSelectShop.selectShopID !== '') {
            this.setState({
              selectShopName: newSelectShop.selectShopName,
              selectShopID: newSelectShop.selectShopID,
            },() => {
              const { selectShopName, selectShopID } = this.state
              this.props.saveSelectedShop({ selectShopName, selectShopID })
            })

            let purchaserShop = Immutable.Map.isMap(this.props.$user) ? this.props.$user.toJS().cache.data.purchaserShop :
              this.props.$user.cache.data.purchaserShop;
            this.fetchShopListFromCache(purchaserShop);  // 门店列表
          }
        }
      })
    }
  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.$user.getIn(['cache', 'data', 'purchaserShop']),nextProps.$user.getIn(['cache', 'data', 'purchaserShop']))) {
      let purchaserShop = Immutable.Map.isMap(nextProps.$user) ? nextProps.$user.toJS().cache.data.purchaserShop : nextProps.$user.cache.data.purchaserShop;
      this.fetchShopListFromCache(purchaserShop);
    }

    if(!Immutable.is(this.props.$selectedShop, nextProps.$selectedShop)) {
      if (this.state.selectShopID !== nextProps.$selectedShop.toJS().selectShopID) {
        this.setState({
          selectShopName: nextProps.$selectedShop.toJS().selectShopName,
          selectShopID: nextProps.$selectedShop.toJS().selectShopID,
        })
      }
    }
    // 状态栏颜色改变
    if(nextProps.$route.routes.length <= 1 && nextProps.$tabNav.toJS().index !== 3){
      StatusBar.setBarStyle('dark-content');
      Platform.OS === 'android' && StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    }
  }

  render() {
    const { newShopList, selectShopName, selectShopID } = this.state;
    const { type, rightText, goBackHide, navigation, editCallback } = this.props

    return (
      <View>
        {/*{...this._panResponder.panHandlers}*/}
        <StatusBar barStyle="light-content" backgroundColor={'rgba(0,0,0,0)'} translucent={true}/>
        {
          ('' !== this.props.$user.get('token') || this.props.$user.get('token')) && selectShopName !== '' ?
            <View style={styles.headerWrapper}>
              <TouchableWithoutFeedback onPress={() => this.showModal()}>
                <View style={styles.shopWrapper}>
                  <Image style={styles.shopIcon} source={require('./imgs/shopIcon.png')} />
                  <Text style={styles.shopName} numberOfLines={1}>{selectShopName}</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback
                onPress={() => { type === 'cart' ? editCallback() : this.props.navToSearch() }}
              >
                <View style={styles.searchWrapper}>
                  {
                    type === 'cart' ?
                      <Text style={styles.rightTxt}>{rightText}</Text> :
                      <Image style={styles.search} source={require('./imgs/search.png')} />
                  }
                </View>
              </TouchableWithoutFeedback>

              {
                this.state.isVisible &&
                <Modal
                  isVisible={this.state.isVisible}
                  animationIn={'slideInLeft'}
                  animationOut={'slideOutLeft'}
                  animationInTiming={400}
                  animationOutTiming={400}
                  style={{ margin: 0, flexDirection: 'row', }}
                  backdropColor='black'
                  backdropOpacity={0}
                >
                  <View style={styles.leftPart}>
                    <View style={styles.topWrapper}>
                      <Image source={require('./imgs/bgImage.png')} style={styles.bgImg} />
                      <View style={styles.titleWrapper}>
                        <Text style={styles.title}>切换门店</Text>
                        <Text style={styles.remark}>点击门店列表切换当前操作门店</Text>
                      </View>
                    </View>
                    <PullScrollview
                      canLoadMore={false}
                      style={styles.list}
                    >
                      {
                        newShopList.map((item) => {
                          return (
                            <TouchableWithoutFeedback key={item.shopID} onPress={() => this.changeShop(item)}>
                              <View style={styles.item}>
                                <Image style={[styles.shopImg, selectShopID === item.shopID && { tintColor: styleConsts.mainColor}]} source={require('../HeaderWithShopInfo/imgs/shopImg.png')} />
                                <Text style={[styles.txt, selectShopID === item.shopID && { color: styleConsts.mainColor }]}>
                                  {item.shopName}
                                </Text>
                              </View>
                            </TouchableWithoutFeedback>
                          )
                        })
                      }
                    </PullScrollview>
                    <View style={styles.bottomWrapper}>
                      <Image style={styles.logo} source={require('./imgs/logo.png')}/>
                    </View>
                  </View>
                  <TouchableWithoutFeedback onPress={() => this.hideModal()}>
                    <View style={styles.rightPart} />
                  </TouchableWithoutFeedback>
                </Modal>
              }

              </View> :
            type === 'cart' ?
              <HeaderBar
                goBackHide={goBackHide}
                navigation={navigation}
                title={I18n.t('cart')}
                rightText={rightText}
                cancelCallback={editCallback}
              /> :
              <HeaderSearchBtn opacity='1' />
        }
      </View>
    )
  }

  showModal = () => {
    this.setState({
      isVisible: true,
    })
  }

  hideModal = () => {
    this.setState({
      isVisible: false,
    })
  }

  fetchShopListFromCache = (purchaserShop) => {
    if(purchaserShop instanceof Array && 0 !== purchaserShop.length) {
      // 筛选出正常营业的门店(暂停营业的门店不能下单)
      const filterShopList = purchaserShop.filter((shop) => {
        return shop.isActive === SHOP_STATUS_NORMAL_BUSINESS;
      });
      // 有正常营业的门店
      if (filterShopList.length !== 0) {
        // 选中的门店是否在门店列表中
        const index = filterShopList.findIndex((shop) => {
          return this.state.selectShopID === shop.shopID
        })
        if (index === -1) {
          this.setState({
            selectShopName: filterShopList[0].shopName,
            selectShopID: filterShopList[0].shopID,
            newShopList: filterShopList,
          }, () => {
            const { selectShopName, selectShopID } = this.state
            AsyncStorage.setItem('selectShop',JSON.stringify({ selectShopName, selectShopID }))
            this.props.saveSelectedShop({ selectShopName, selectShopID })
          })
        } else {
          this.setState({
            newShopList: filterShopList,
          })
        }
      } else { // 无正常营业的门店
        this.setState({
          selectShopName: '',
          selectShopID: '',
        }, () => {
          const { selectShopName, selectShopID } = this.state
          AsyncStorage.setItem('selectShop',JSON.stringify({ selectShopName, selectShopID }))
          this.props.saveSelectedShop({ selectShopName, selectShopID })
        })
      }

    }
  }

  // 切换门店
  changeShop = (shop) => {
    this.setState({
      selectShopName: shop.shopName,
      selectShopID: shop.shopID,
    }, () => {
      const { selectShopName, selectShopID } = this.state
      AsyncStorage.setItem('selectShop',JSON.stringify({ selectShopName, selectShopID }))
      this.props.saveSelectedShop({ selectShopName, selectShopID })

      this.hideModal()
    })
  }

}

const styles = StyleSheet.create({
  headerWrapper: {
    height: styleConsts.headerHeight - StyleSheet.hairlineWidth,
    paddingTop: styleConsts.headerPaddingTop,
    backgroundColor: styleConsts.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  shopIcon: {
    width: 13,
    height: 13,
    marginLeft: 10,
    marginRight: 8,
  },
  shopName: {
    width: width - 44 - 10 - 13 - 8,
    fontSize: styleConsts.H2,
    color: styleConsts.deepGrey,
  },
  searchWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    width: 16,
    height: 16,
    tintColor: styleConsts.darkGrey,
  },
  rightTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  leftPart: {
    width: 300,
    backgroundColor: styleConsts.bgGrey,
  },
  topWrapper:{
    position: 'relative',
    marginBottom: 15,

    elevation: 6,
    shadowColor: "black",
    shadowOffset: { height: 5, width: 1, },
    shadowOpacity: 0.2,
  },
  rightPart: {
    width: width - 300,
    height: height,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  bgImg: {
    width: 300,
    height: 175,
  },
  titleWrapper: {
    position: 'absolute',
    bottom: 20,
    left: 24.5,
  },
  title: {
    fontSize: styleConsts.H2,
    color: styleConsts.white,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  remark: {
    fontSize: styleConsts.H5,
    color: styleConsts.white,
    marginTop: 15.5,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  list: {
    minHeight: height - 175 - 15 - 43.5,
    padding: 10,
  },
  item: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: styleConsts.white,
  },
  shopImg: {
    width: 16,
    height: 16,
    tintColor: styleConsts.darkGrey,
    marginLeft: 15,
    marginRight: 10,
  },
  txt: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  bottomWrapper: {
    width: width - 75,
    height: 43.5,
    backgroundColor: styleConsts.bgSeparate,
    justifyContent: 'center',
  },
  logo: {
    width: 39,
    height: 9,
    marginLeft: 25,
  },
});

const mapStateToProps = (state) => {
  return {
    $user: state.user,
    $storesCenter: state.storesCenter,
    $selectedShop: state.storesCenter.get('selectedShop'),
    $tabNav: state.tabNav,
    $route: state.nav,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 保存选中的门店shopID和shopName
    saveSelectedShop: (opts) => {
      dispatch({ type: SAVE_SELECTED_SHOP_ID_AND_NAME, payload: opts })
    },
    // 跳转到商品查询
    navToSearch: ()=>{
      dispatch({ type: NAV_TO_SEARCH_SCENE })
    },
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(HeaderSwitchShop)