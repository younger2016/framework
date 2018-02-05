/**
 * 商品详情
 */
import React,{ Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Platform, } from 'react-native';
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import ProductDetailInfoHeader from './Header';    // 头部tab切换
import HeaderBar from '../../components/HeaderBar';
import ProductDeailBasicInfo from './BasicInfo';   // 商品
import ProductDetailOtherInfo from './OtherInfo';  // 详情
import ProductDetailParamInfo from './ParamInfo';  // 参数
import AddPurchaseModal from './AddPurchaseModal'; // 加采购清单模态框
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { styleConsts } from '../../utils/styleSheet/styles';
import BlankPage from '../../components/BlankPage';
import ShopInfoModal from './ShopInfoModal';
import Dimensions from 'Dimensions';
const { height } = Dimensions.get('window');
import { setTask } from '../../utils/deskTask';

import {
  fetchProductDetailInfoAC,
  addPurchaseAC,
  deletePurchaseAC,
} from '../../redux/actions/products.action';
import {
  fetchCartSpecsNumAC,
  changeCartInfoAC,
  deleteCartSpecAC
} from '../../redux/actions/cart.action';
import {
  getSotresList,
} from '../../redux/actions/storesCenter.action';
import {
  NAV_TO_CART_NEWPATH,
  NAV_TO_SHOPCENTER_MAIN_PAGE,
  NAV_TO_LOGIN_SCENE,
} from '../../redux/actions/nav.action';
import {
  SET_MAININFO_TO_GET_SHOP_INFO,
} from '../../redux/actions/shopCenter.action';

// 跳转结果页(1-详情页，2-编辑页)
const DETAIL_INFO_PAGE = 1;
// 	获取详情来源(0-供应商端，1-采购商端)
const GET_RESOURCE = 1;
// 门店营业状态(1-正常营业，0-暂停营业)
const SHOP_STATUS_NORMAL_BUSINESS = 1;
const SHOP_STATUS_STOP_BUSINESS = 0;

class ProductDetailInfo extends Component{
  constructor(props){
    super(props);
    this.state = {
      showIndex: 0,             // 当前选中的tab,
      productDetailInfo: {},    // 商品详情信息
      purchaserShopID: '',      // 采购商店铺ID
      purchaserShopName: '',    // 采购商店铺名称
      specsObj: {},             // 购物车规格数量{ specID:specNum, ... }
      $invalidSet: Immutable.Set(),
      visible: true,            // 加载模态框是否显示，默认显示
      isLoading: false,         // 商品详情是否加载过，默认没有
      loadSuccess: false,       // 商品详情是否加载成功，默认没有
      downFirst: false,
    };
    this.centerScreenHeight = 0;  // 屏幕除去头部和底部的高度
    this.basicHeight = 0;         // 商品页内容高度
    this.otherHeight = 0;         // 详情页内容高度
    this.paramHeight = 0;         // 参数页内容高度
  }
  componentDidMount() {
    // 从redux中取出保存的商品ID
    let productID = Immutable.Map.isMap(this.props.$products) ?
      this.props.$products.toJS().productID : this.props.$products.productID;
    this.setState({
      productID: productID,
    }, () => {
      // 请求商品详情数据
      this.fetchProductDetailInfo();
    });

    // 当前采购商门店
    this.setState({
      purchaserShopName: this.props.$selectedShop.toJS().selectShopName,
      purchaserShopID: this.props.$selectedShop.toJS().selectShopID,
    })

    this.centerScreenHeight = height - 64 - 49;
  }
  componentWillReceiveProps(nextProps) {
    // 商品详情信息
    if(!Immutable.is(this.props.$products.get('productDetailInfo'),nextProps.$products.get('productDetailInfo'))) {
      let productDetailInfo = Immutable.Map.isMap(nextProps.$products) ?
        nextProps.$products.toJS().productDetailInfo : nextProps.$products.productDetailInfo;
      if('success' === productDetailInfo.status){
        this.setState({
          productDetailInfo: productDetailInfo.detailInfo,
          visible: false,
          isLoading: true,
          loadSuccess: true,
        },() => {
          this.fetchCartSpecsNum(this.props)
        });
      }
    }

    // 采购商门店
    if(!Immutable.is(this.props.$selectedShop, nextProps.$selectedShop)) {
      const selectShop = nextProps.$selectedShop.toJS();
      this.setState({
        purchaserShopName: selectShop.selectShopName,
        purchaserShopID: selectShop.selectShopID,
      }, () => {
        this.fetchCartSpecsNum(this.props)
      })
    }

    // 规格数量
    if (!Immutable.is(this.props.$cart.get('cartSpecsNum'), nextProps.$cart.get('cartSpecsNum'))) {
      const cartSpecsNum = nextProps.$cart.get('cartSpecsNum').toJS()
      if ('success' === cartSpecsNum.status) {
        const specsObj = {}
        cartSpecsNum.shopcarts.forEach((item) => {
          specsObj[item.productSpecID] = item.shopcartNum;
        })
        this.setState({ specsObj })
      }
    }

    if (!Immutable.is(this.props.$user.get('token'), nextProps.$user.get('token'))) {
      if (this.state.purchaserShopID !== undefined) {
        this.fetchCartSpecsNum(nextProps)
      }
    }

  }
  render(){
    let { productDetailInfo, specsObj, $invalidSet, isLoading, loadSuccess, purchaserShopName, purchaserShopID } = this.state;
    return (
      <View style={styles.container}>
        <HeaderBar navigation={this.props.navigation} title='商品详情' cancelHide={true} />
        {
          isLoading ?
            loadSuccess ?
              <KeyboardAwareScrollView>
                <ProductDeailBasicInfo
                  productDetailInfo={productDetailInfo}
                  specsObj={specsObj}
                  $invalidSet={$invalidSet}
                  changeCartInfo={(val,specItem,productID) => this.changeCartInfo(val,specItem,productID)}
                  purchaserShopName={purchaserShopName}
                  purchaserShopID={purchaserShopID}

                  getContentHeight={(height) => this.basicHeight = height}
                />
                <ProductDetailOtherInfo
                  productDetailInfo={productDetailInfo}

                  getContentHeight={(height) => this.otherHeight = height}
                />
                <ProductDetailParamInfo
                  productDetailInfo={productDetailInfo}

                  getContentHeight={(height) => this.detailHeight = height}
                />
              </KeyboardAwareScrollView> : <BlankPage visable={true} type='error' loadAgain={this.fetchProductDetailInfo} />
            : null
        }

        {/*底部*/}
        {
          isLoading ?
            loadSuccess ?
              <View style={styles.footer}>
                <View style={styles.footerLeftPart}>
                  <TouchableWithoutFeedback onPress={() => this.navToShop()}>
                    <View style={styles.shop}>
                      <Image style={styles.shopImg} source={require('./imgs/shopImg.png')} />
                      <Text style={styles.footerShopTxt}>店铺</Text>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => this.showAddPurchaseModal()}>
                    <View style={styles.shop}>
                      <Image style={styles.addPurchaseImg} source={require('./imgs/addPurchase.png')} />
                      <Text style={styles.footerShopTxt}>加采购清单</Text>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
                <TouchableWithoutFeedback onPress={ () => this.navToCart()}>
                  <View style={styles.footerRightPart}>
                    <Image style={styles.footerImg} source={require('./imgs/footerImg.png')} />
                    <Text style={styles.footerTxt}>查看进货单</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View> : null
            : null
        }

        {/*加采购清单模态框*/}
        <AddPurchaseModal
          productDetailInfo={productDetailInfo}
          ref='showAppPurchaseModal'
          addPurchase={this.addPurchase}
          deletePurchase={this.deletePurchase}
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
          <BlankPage visable={this.state.visible} type={'loading'} />
        </View>
      </View>
    )
  }

  // 获取商品详情信息
  fetchProductDetailInfo = () => {
    let { productID } = this.state;
    return (
      this.props.fetchProductDetailInfo({
        data: {
          forward: DETAIL_INFO_PAGE,
          getResource: GET_RESOURCE,
          productID: productID,
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
        }
      })
    )
  };

  // 规格数量
  fetchCartSpecsNum = (props) => {
    const { productDetailInfo, purchaserShopID } = this.state
    // 用户登录、有商品时请求规格数量，否则不请求请求规格数量
    if ('' !== props.$user.get('token') && productDetailInfo.specs.length !== 0) {
      const shopcarts = []
      productDetailInfo.specs.forEach((specsItem) => {
        shopcarts.push({
          productSpecID: specsItem.specID,
        })
      })
      this.props.fetchCartSpecsNum({
        data: {
          isAll: 2,
          purchaserShopID: purchaserShopID,
          purchaserUserID: props.$user.getIn(['userInfo', 'purchaserUserID']),
          shopcarts,
        },
        fail: (res) => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
        },
        timeout: () => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
        }
      })
    }

  }

  // 商品规格数量改变发送请求
  changeCartInfo = (val,specItem,productID) => {
    let { purchaserShopID, purchaserShopName } = this.state;
    let { productDetailInfo } = this.state;
    this.setState({
      $invalidSet: this.state.$invalidSet.add(specItem.saleUnitID),
      visible: true,
    }, () => {
      if((val - 0)!== 0) {
        this.props.changeCartInfo({
          data: {
            list: [
              {
                purchaserShopID: purchaserShopID,
                purchaserShopName: purchaserShopName,
                shopcarts: [
                  {
                    isSelected: 0,
                    productID: productID,
                    productSpecID: specItem.specID,
                    shopcartNum: val,
                  }
                ]
              }
            ],
            purchaserUserID: this.props.$user.getIn(['userInfo', 'purchaserUserID']),
          },
          productInfo: {
            product: productDetailInfo,
            purchaserShopID: purchaserShopID,
          },
          fail: (res) => {
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.saleUnitID),
              visible: false,
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
          },
          timeout: () => {
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.saleUnitID),
              visible: false,
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort('诶呀，服务器开小差了');
          },
          success: () => {
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.saleUnitID),
              visible: false,
            });
          }
        });
      } else {
        this.props.deleteCartSpec({
          data:{
            list: [
              {
                purchaserShopID: purchaserShopID,
                shopcarts: [
                  {productSpecID: specItem.specID}
                ]
              }
            ],
            purchaserUserID: this.props.$user.getIn(['userInfo', 'purchaserUserID']),
          } ,
          productInfo: {
            product: productDetailInfo,
            purchaserShopID: purchaserShopID,
            flag: true,
          },
          fail: (res)=>{
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.specID),
              visible: false,
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
          },
          success: ()=>{
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.specID),
              visible: false,
            });
          }
        });
      }
    })
  };

  // 显示采购清单弹框
  showAddPurchaseModal = () => {
    if('' === this.props.$user.get('token') || !this.props.$user.get('token')) {
      return this.props.navToLogin();
    } else if(this.state.purchaserShopName === ''){
      this.toast && Toast.hide(this.toast);
      return this.toast = toastShort('暂无可用门店哦');
    }

    this.refs.showAppPurchaseModal.show(() => setTask(null));
    setTask(this.refs.showAppPurchaseModal.hide);
  };

  // 加采购清单
  addPurchase = (specItem) => {
    let { productDetailInfo } = this.state;
    this.props.addPurchase({
      data: {
        productCategoryID: productDetailInfo.categorySubID,
        productID: productDetailInfo.productID,
        productSpecID: specItem.specID,
        purchaserID: this.props.$user.getIn(['userInfo', 'purchaserID']),
        supplyShopID: productDetailInfo.supplierShopID,
        supplyShopName: productDetailInfo.supplierShopName,
      },
      // 商品有多规格，在采购清单中只有一种或几种，当添加其他规格成功时，需自己在store中添加该商品的规格
      specItem: {
        buyMinNum: specItem.buyMinNum,
        minOrder: specItem.minOrder,
        productPrice: specItem.productPrice,
        productSpecID: specItem.specID,
        saleUnitName: specItem.saleUnitName,
        specContent: specItem.specContent,
      },
      success: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.message || '新增采购清单成功');
        specItem.isJionPurchaseList = 1;
        this.setState({ productDetailInfo })
      },
      fail: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
      },
      timeout: () => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort('诶呀，服务器开小差了');
      }
    });
  };

  // 删除采购清单
  deletePurchase = (specItem) => {
    let { productDetailInfo } = this.state;
    this.props.deletePurchase({
      data: {
        productID: productDetailInfo.productID,
        productSpecID: specItem.specID,
        purchaserID: this.props.$user.getIn(['userInfo', 'purchaserID']),
        supplyShopID: productDetailInfo.supplierShopID,
      },
      success: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.message || '删除采购清单成功');
        specItem.isJionPurchaseList = 2;
        this.setState({ productDetailInfo })
      },
      fail: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
      },
      timeout: () => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort('诶呀，服务器开小差了');
      }
    })
  };

  // 进入店铺首页
  navToShop = () => {
    let { productDetailInfo } = this.state;
    this.props.navToShop({
      supplyShopID: productDetailInfo.supplierShopID,
      supplyGroupID: productDetailInfo.groupID
    })
  };

  // 进入购物车
  navToCart = () => {
    if('' === this.props.$user.get('token') || !this.props.$user.get('token')) {
      return this.props.navToLogin();
    }
    this.props.navToCart({second: true});
  };


}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  footer: {
    height: 49,
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  footerLeftPart: {
    flex: 1,
    flexDirection: 'row',
  },
  shop: {
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shopImg: {
    width: 20,
    height: 20,
  },
  footerShopTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.darkGrey,
    marginTop: 6,
  },
  addPurchaseImg: {
    width: 17.5,
    height: 20,
  },
  footerRightPart: {
    width: 150,
    height: 49,
    backgroundColor: styleConsts.mainColor,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerImg: {
    width: 17,
    height: 20,
  },
  footerTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.white,
    marginLeft: 10,
  },
});
const mapStateToProps = (state) => {
  return {
    $products: state.products,
    $cart: state.cart,
    $user: state.user,
    $selectedShop: state.storesCenter.get('selectedShop'),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 获取商品详情数据
    fetchProductDetailInfo: (opts) => {
      dispatch(fetchProductDetailInfoAC(opts));
    },
    // 规格数量
    fetchCartSpecsNum: (opts) => {
      dispatch(fetchCartSpecsNumAC(opts))
    },
    // 进入该店铺首页
    navToShop: (opts) => {
      dispatch({type: SET_MAININFO_TO_GET_SHOP_INFO, payload: opts});   // 把店铺主要信息存起来
      dispatch({type: NAV_TO_SHOPCENTER_MAIN_PAGE});
    },
    // 获取门店列表
    getSotresList: (opts) => {
      dispatch(getSotresList(opts))
    },
    // 添加购物车
    changeCartInfo: (opts) => {
      dispatch(changeCartInfoAC(opts));
    },
    // 删除购物车
    deleteCartSpec: (opts) => {
      dispatch(deleteCartSpecAC(opts))
    },
    // 查看进货单跳转到进货单页
    navToCart: (opts) => {
      dispatch({type: NAV_TO_CART_NEWPATH, payload: opts});
    },
    // 加采购清单
    addPurchase: (opts) => {
      dispatch(addPurchaseAC(opts));
    },
    // 删除采购清单
    deletePurchase: (opts) => {
      dispatch(deletePurchaseAC(opts));
    },
    navToLogin: () => {
      dispatch({type: NAV_TO_LOGIN_SCENE});
    }
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ProductDetailInfo)
