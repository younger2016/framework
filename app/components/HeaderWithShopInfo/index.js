/**
 * 有店铺列表的头部
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, StatusBar, Modal, ScrollView } from 'react-native';
import Immutable from 'immutable';
import { styleConsts } from '../../utils/styleSheet/styles';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import Platform from 'Platform';

// 门店营业状态(1-正常营业，0-暂停营业)
const SHOP_STATUS_NORMAL_BUSINESS = 1;
const SHOP_STATUS_STOP_BUSINESS = 0;

class HeaderWithShopInfo extends Component{
  constructor(props){
    super(props);
    this.state = {
      shopList: [],         // 获取的店铺列表数据
      selectShop: '',       // 当前选中的店铺
      selectShopID: '',
      data:{},
      visible: false,
    };
  }
  componentDidMount(){
    if(this.props.selectShop){
      this.setState({selectShop: this.props.selectShop})
    }

    // 门店列表直接从缓存中拿取
    let data = Immutable.Map.isMap(this.props.$user) ? this.props.$user.toJS().cache.data : this.props.$user.cache.data;
    this.fetchShopListFromCache(data);
  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.$user.getIn(['cache', 'data']),nextProps.$user.getIn(['cache', 'data']))) {
      let data = Immutable.Map.isMap(nextProps.$user) ? nextProps.$user.toJS().cache.data : nextProps.$user.cache.data;
      this.fetchShopListFromCache(data);
    }
  }
  render() {
    let { gobackHide, navigation, rightImg, rigthHide, cancelCallBack, backCall, flag, mySelefBack,rightText,rightButtons} = this.props;
    let { shopList, selectShop, selectShopID } = this.state;
    let { data } = this.state;

    return (
      <View style={styles.headerWrapper}>
        <StatusBar barStyle='dark-content' backgroundColor={styleConsts.white} translucent={true} />
        {
          !gobackHide && navigation ?
            <TouchableWithoutFeedback onPress={() => {backCall();if(mySelefBack instanceof Function)return mySelefBack();navigation.goBack()}}>
              <View style={styles.goBackImgWrapper}>
                <Image style={styles.goBackImg} source={require('../HeaderBar/imgs/goback.png')} />
              </View>
            </TouchableWithoutFeedback> : <View style={styles.goBackImgWrapper} />
        }
        {/*如果用户未登录时门店列表不显示，显示分类;如果用户登录且没有门店的话显示分类*/}
        {
          ('' !== this.props.$user.get('token') || this.props.$user.get('token')) &&
          data.purchaserShop && data.purchaserShop instanceof Array && data.purchaserShop.length !== 0
          && selectShop !== '' ?
            <TouchableWithoutFeedback onPress={() => this.showModal()}>
              <View style={styles.shopInfo}>
                <Image style={styles.shopImg} source={require('./imgs/shopImg.png')} />
                <Text style={styles.shopName} numberOfLines={1}>{selectShop}</Text>
                <Image style={styles.dropDownImg} source={require('./imgs/down.png')} />
              </View>
            </TouchableWithoutFeedback> :
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>
                {this.renderHeaderTitle(flag)}
              </Text>
            </View>
        }
        {
          false&&rightButtons.map((button)=>{
          return   <TouchableWithoutFeedback onPress={() => button.cancelCallBack()}>
              <View style={styles.rightTxtWrapper}>
                {
                  !button.rigthHide ?
                    button.rightImg ?
                      <Image style={styles.headerSearch} source={require('./imgs/search.png')}/>
                      : <Text style={styles.rightTxt}>{button.rightText}</Text>
                    : null
                }
              </View>
            </TouchableWithoutFeedback>
          })
        }

        <TouchableWithoutFeedback onPress={() => cancelCallBack()}>
          <View style={styles.rightTxtWrapper}>
            {
              !rigthHide ?
                rightImg ?
                  <Image style={styles.headerSearch} source={require('./imgs/search.png')}/>
                  : <Text style={styles.rightTxt}>{this.props.rightText}</Text>
                : null
            }
          </View>
        </TouchableWithoutFeedback>

        {/*选择店铺模态框*/}
        {/*onRequestClose控制弹窗的物理返回*/}
        <Modal visible={this.state.visible} transparent={true} onRequestClose={ () => this.setState({visible: false}) }>
          <TouchableWithoutFeedback onPress={() => this.setState({visible: false})}>
            <View style={{flex: 1,backgroundColor: 'rgba(0,0,0,0.4)', marginTop: Platform.OS === 'ios' ? 64 : 40,}}>
              <View style={{width: width, height: Platform.OS === 'ios' ? (height - 64)/2 : (height - 40)/2, backgroundColor: '#fff', paddingBottom: 5}}>
                <ScrollView>
                  {
                    shopList.map( (shop) => {
                      return (
                        <TouchableWithoutFeedback onPress={() => this.hideModal(shop)} key={shop.shopID}>
                          <View style={{flex: 1}}>
                            <View style={styles.txtWrapper}>
                              <View style={{width: 20, height: 45,}} />
                              <View style={styles.shopNameWrapper}>
                                <Text
                                  style={[
                                    styles.txt,
                                    selectShopID === shop.shopID && { color: styleConsts.mainColor }
                                  ]}
                                >
                                  {shop.shopName}
                                </Text>
                              </View>
                              <View style={styles.imgWrapper}>
                                {
                                  selectShopID === shop.shopID ?
                                    <Image style={styles.img} source={require('../../imgs/selectedIcon.png')}/>
                                    : null
                                }
                              </View>
                            </View>
                          </View>
                        </TouchableWithoutFeedback>
                      )
                    })
                  }
                </ScrollView>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    );
  }


  showModal = () => {
    this.setState({
      visible: true,
    })
  };

  hideModal = (shop) => {
    this.setState({
      visible: false,
      selectShop: shop.shopName,
      selectShopID: shop.shopID,
    },() => {
      this.props.onChange && this.props.onChange({
        selectShop: {
          shopID: shop.shopID,
          shopName: shop.shopName,
        }
      });
    });
  };

  // 没有门店列表时头部显示内容
  renderHeaderTitle = (flag) => {
    switch (flag) {
      case 'categorys':
        return '分类';
      case 'order':
        return '订单';
      case 'searchProduct':
        return '商品列表';
      case 'purchaseList':
        return '采购清单';
      default:
        break;
    }
  };

  // 从缓存中获取门店列表
  fetchShopListFromCache = (data) => {
    if(data.purchaserShop instanceof Array && data.purchaserShop.length !== 0) {
      let purchaserShop = data.purchaserShop;
      // 门店暂停营业后订单头部门店列表还显示，分类不显示
      if(purchaserShop instanceof Array && 0 !== purchaserShop.length) {
        if(this.props.showAllShop){
          purchaserShop.unshift({
            shopID: '000',
            shopName: '全部店铺订单',
          });
          this.updateState(purchaserShop,data);
        } else {
          // 筛选出正常营业的门店(暂停营业的门店不能下单)
          purchaserShop = purchaserShop.filter((shop) => {
            return shop.isActive === SHOP_STATUS_NORMAL_BUSINESS;
          });
          if(purchaserShop.length !== 0) {
            this.updateState(purchaserShop,data);
          } else {
            this.setState({
              shopList: [],
              selectShop: '',
              selectShopID: '',
            },() => {
              this.props.onChange && this.props.onChange({
                selectShop: {
                  shopID: '',
                  shopName: '',
                },
              })
            });
          }
        }
      }

    }
  };

  updateState = (purchaserShop,data) => {
    this.setState({
      shopList: purchaserShop,
      selectShop: purchaserShop[0].shopName,
      selectShopID: purchaserShop[0].shopID,
      data: data,
    },() => {
      this.props.onChange && this.props.onChange({
        selectShop: {
          shopID: purchaserShop[0].shopID,
          shopName: purchaserShop[0].shopName,
        },
        hasChanged: false
      })
    })
  }

}

HeaderWithShopInfo.defaultProps = {
  gobackHide: false,
  rigthHide: false,
  rightImg: false,
  showAllShop: false,
  flag: '',
  selectShop: '',
  rightText: '',
  cancelCallBack: () => {},
  backCall: () => {},
  onChange: () => {},
};
HeaderWithShopInfo.PropTypes = {
  gobackHide: PropTypes.bool,
  rigthHide: PropTypes.bool,
  rightImg: PropTypes.bool,
  showAllShop: PropTypes.bool,
  flag: PropTypes.string,
  selectShop: PropTypes.string,
  rightText: PropTypes.string,
  cancelCallBack: PropTypes.func,
  backCall: PropTypes.func,
  onChange: PropTypes.func,
};

const styles = StyleSheet.create({
  headerWrapper: {
    height: styleConsts.headerHeight - StyleSheet.hairlineWidth,
    paddingTop: styleConsts.headerPaddingTop,
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    alignItems: 'center',
  },
  goBackImgWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackImg: {
    width: 9,
    height: 16,
    tintColor: styleConsts.darkGrey,
  },
  shopInfo: {
    flexDirection: 'row',
    width: 204,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopImg: {
    width: 15,
    height: 15,
    tintColor: styleConsts.darkGrey,
  },
  shopName: {

    maxWidth: 204 - 15 - 11 - 7 - 7,

    fontSize: styleConsts.H2,
    color: styleConsts.deepGrey,
    marginLeft: 7,
    marginRight: 7,
  },
  dropDownImg: {
    width: 11,
    height: 6,
    tintColor: styleConsts.darkGrey
  },
  rightTxtWrapper: {
    width: 44,
    height: 44,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  headerSearch: {
    width: 16,
    height: 16,
    tintColor: styleConsts.darkGrey,
  },
  txtWrapper: {
    width: width - 20,
    height: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    marginLeft: 10,
    marginRight: 10,
  },
  shopNameWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  txt: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey
  },
  imgWrapper: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: 11,
    height: 7.5,
    tintColor: styleConsts.mainColor,
  }
});

const mapStateToProps = (state) => {
  return {
    $user: state.user,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {

  }
};
export default connect(mapStateToProps,mapDispatchToProps)(HeaderWithShopInfo)
