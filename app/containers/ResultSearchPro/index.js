/**
 * 商品搜索结果页
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Platform, } from 'react-native';
import Immutable from 'immutable';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import Toast from 'react-native-root-toast';
import { toastShort } from '../../components/toastShort';
import { styleConsts } from '../../utils/styleSheet/styles';
import SearchBtn from '../../components/SearchBtn';
import ChangePrice from '../../components/ChangePrice';
import ProductNum from '../../components/ProductNum';
import { fetchProductListByKeybordAC } from '../../redux/actions/products.action';
import {
  NAV_TO_PRODUCT_DETAIL_INFO,
} from '../../redux/actions/nav.action';
import {
  SAVE_PRODUCT_ID,
} from '../../redux/actions/products.action';
import { fetchCartSpecsNumAC, changeCartInfoAC, deleteCartSpecAC } from '../../redux/actions/cart.action'
import BlankPage from '../../components/BlankPage';
import { PullFlatList } from '../../components/PullList';
import { getImgUrl } from '../../utils/adapter';

class ProductList extends Component{
  constructor(props){
    super(props);
    this.state = {
      productList: [],// 搜索商品结果列表数据
      refreshing: false,    // 下拉刷新
      moreLoading: false,   // 加载更多
      hasLoad: false,       // 是否发过请求
      loadSuccess: false,   // 加载成功还是失败
      pageNum: 1,           // 当前页码
      pageSize: 20,         // 一页请求的数据
      productName: '',      // 根据此商品名称搜索
      $invalidSet: Immutable.Set(),
      shopName: '',         // 采购商店铺名称
      shopID: '',           // 采购商店铺ID
      specsObj: {},         // { specID:specNum, ... }
      visible: false,
    };
  }
  componentDidMount() {
    let params = this.props.navigation.state.params;
    this.cancelCallBack = params.backCall;
    this.setState({
      productName: params.keyWord,
    },() => {
      this.fetchProductList(this.state.pageNum);
    })

    // 当前采购商门店
    this.setState({
      shopName: this.props.$selectedShop.toJS().selectShopName,
      shopID: this.props.$selectedShop.toJS().selectShopID,
    })
  }
  componentWillReceiveProps(nextProps) {
    // 搜索商品列表
    if(!Immutable.is(this.props.$products.get('sreachProductList'),nextProps.$products.get('sreachProductList'))) {
      let sreachProductList = Immutable.Map.isMap(nextProps.$products) ?
        nextProps.$products.toJS().sreachProductList : nextProps.$products.sreachProductList;
      if('success' === sreachProductList.status){
        this.setState({
          productList: sreachProductList.list,
          refreshing: false,
          loadSuccess: true,
          hasLoad: true,
        }, () => {
          this.fetchCartSpecsNum(this.props)
        });
      }
    }

    // 采购商门店
    if(!Immutable.is(this.props.$selectedShop, nextProps.$selectedShop)) {
      const selectShop = nextProps.$selectedShop.toJS();
      this.setState({
        shopName: selectShop.selectShopName,
        shopID: selectShop.selectShopID,
      }, () => {
        this.fetchCartSpecsNum(this.props)
      })
    }

    // 购物车数量
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
      if (this.state.shopID !== undefined) {
        this.fetchCartSpecsNum(nextProps)
      }
    }

  }
  render() {
    let productList = JSON.parse(JSON.stringify(this.state.productList));
    let { refreshing, moreLoading, pageNum, productName, } = this.state;

    return (
      <View style={styles.container}>
        <SearchBtn
          title={productName}
          navigation={this.props.navigation}
          onPressCenter={() => {this.cancelCallBack(); this.props.navigation.goBack()}}
        />

        <View style={styles.list}>
          <PullFlatList
            data={productList}
            refreshing={refreshing}
            canLoadMore={moreLoading}
            renderItem={ ({item,index}) => this.renderItem(item)}
            onRefresh={(resove) => this.refreshProductList(pageNum,resove)}
            onEndReachedThreshold={0}
            onEndReached={(resove) => this.fetchMoreProductList(resove)}
            ListEmptyComponent={ () => this.renderNoProduct()}
            keyExtractor={({ productID }) => productID}
          />
        </View>

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

  // 渲染商品
  renderItem = (productItem) => {
    return (
      <TouchableWithoutFeedback onPress={() => this.navToProductDetailInfo(productItem.productID)} key={productItem.productID}>
        <View style={styles.item}>
          <Image style={styles.img} source={{ uri: getImgUrl(productItem.imgUrl, 90, 90) }} />
          {
            productItem.specs instanceof Array && productItem.specs.length > 1 ?
              <TouchableWithoutFeedback onPress={() => this.toggleShowSpecsInfo(productItem)}>
                <View style={{width: 62,alignItems: 'flex-end', height: 40, justifyContent: 'center', position: 'absolute',top: 0, right: 0, zIndex: 9}}>
                  <Text style={styles.selectSpecsTxt}>
                    {
                      this.state[`${productItem.productID}visible`] ?
                        '收起' : '更多规格'
                    }
                  </Text>
                </View>
              </TouchableWithoutFeedback> : null
          }
          <View style={styles.rightPart}>
            <View style={{flexDirection: 'row',justifyContent: 'space-between',marginTop: 12,}}>
              <Text style={[styles.productName, {maxWidth: width - 150 - 90}]} numberOfLines={1}>{productItem.productName}</Text>
            </View>
            <Text style={styles.name}>{productItem.supplierShopName}</Text>
            {/*规格列表*/}
            {
              productItem.specs instanceof Array && productItem.specs.map( (specItem,specIndex) => {
                return (
                  <View style={{flex: 1,}} key={specItem.specID}>
                    {
                      specIndex === 0?
                        this.renderSpecItem(specItem,productItem) :
                        this.state[`${productItem.productID}visible`] ?
                          this.renderSpecItem(specItem,productItem) : null
                    }
                  </View>
                )
              })
            }
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  };

  // 渲染规格
  renderSpecItem = (specItem,productItem) => {
    let { specsObj, $invalidSet, shopID } = this.state;
    let shopcartNum = 0;
    for( let key in specsObj) {
      if( parseInt(key) === specItem.specID) {
        shopcartNum = specsObj[key];
      }
    }
    return (
      <View style={styles.specsWrapper} key={specItem.specID}>
        <View>
          <ChangePrice price={specItem.productPrice} big={styleConsts.H3} small={styleConsts.H5} width={85} fontWeight='600' />
          {/*<Text style={styles.specsContent} numberOfLines={1}>{specItem.specContent}/{specItem.saleUnitName}</Text>*/}
          <View style={{flexDirection: 'row',marginTop: 4,}}>
            <Text style={styles.specsContent} numberOfLines={1}>{specItem.specContent}/{specItem.saleUnitName}</Text>
            {
              0 === specItem.buyMinNum || 1 === specItem.buyMinNum ?
                null :
                <View style={styles.buyMinNumWrapper}>
                  <Text style={styles.buyMinNum}>{specItem.buyMinNum}{specItem.saleUnitName}起购</Text>
                </View>
            }
          </View>
        </View>
        <ProductNum
          styles={[{marginTop: -3}]}
          productNum={shopcartNum}
          onChange={(val) => this.changeCartInfo(val,specItem,productItem)}
          disabled={$invalidSet.has(specItem.saleUnitID)}
          shopID={shopID}
          buyMinNum={specItem.buyMinNum}
        />
      </View>
    )
  };

  // 选规格
  toggleShowSpecsInfo = (productItem) => {
    this.setState({
      [`${productItem.productID}visible`]: !this.state[`${productItem.productID}visible`],
    })
  };

  // 请求商品列表
  fetchProductList = (pageNum,resove) => {
    let { productName, pageSize } = this.state;
    this.props.fetchProductList({
      data: {
        productName,
        pageNum: pageNum,
        pageSize: pageSize,
      },
      success: (res) => {
        this.setState({
          moreLoading: res.data instanceof Array &&  res.data.length >= pageSize,
        });
        if(resove instanceof Function){
          resove('success')
        }
      },
      fail: (res) => {
        this.setState({
          refreshing: false,
          hasLoad: true,
          loadSuccess: false,
        });
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
        if(resove instanceof Function){
          resove('fail');
        }
      },
      timeout: () => {
        this.setState({
          refreshing: false,
          hasLoad: true,
          loadSuccess: false,
        });
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort('诶呀，服务器开小差了');
        if(resove instanceof Function){
          resove('timeout');
        }
      }
    })
  };

  // 列表下拉刷新
  refreshProductList = (pageNum,resove) => {
    this.setState({
      refreshing: true,
    },() => {
      this.fetchProductList(pageNum,resove);
    })
  };

  // 列表加载更多
  fetchMoreProductList = (resove) => {
    let { productList, moreLoading } = this.state;
    if(moreLoading) {
      pageNum = Math.floor(productList.length / 20 + 1);
      this.fetchProductList(pageNum,resove);
    }
  };

  // 空白页、网络错误页
  renderNoProduct = () => {
    let { hasLoad, loadSuccess, pageNum } = this.state;
    return (
      <BlankPage
        visable={true}
        type={ !hasLoad ? 'loading' : loadSuccess ? 'blank' : 'error' }
        loadAgain={() => this.fetchProductList(pageNum)}
      >
        <Text style={{fontSize: styleConsts.H4,color: styleConsts.middleGrey, marginTop: 15}}>暂无相关商品</Text>
      </BlankPage>
    );
  };

  // 先将商品ID保存到redux中，然后跳转到商品详情页
  navToProductDetailInfo = (productID) => {
    this.props.saveProductID(productID);
    this.props.navToProductDetailInfo();
  };

  // 购物车数量
  fetchCartSpecsNum = (props) => {
    const { productList } = this.state
    // 用户登录、有商品时请求规格数量，否则不请求请求规格数量
    if ('' !== props.$user.get('token') && productList.length !== 0) {
      const shopcarts = []
      productList.forEach((product) => {
        product.specs.forEach((specsItem) => {
          shopcarts.push({
            productSpecID: specsItem.specID,
          })
        })
      })
      this.props.fetchCartSpecsNum({
        data: {
          isAll: 2,
          purchaserShopID: this.state.shopID,
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

  };

  // 商品规格数量改变发送请求
  changeCartInfo = (val,specItem,productItem) => {
    let { shopID, shopName } = this.state;
    this.setState({
      $invalidSet: this.state.$invalidSet.add(specItem.saleUnitID),
      visible: true,
    }, () => {
      if((val - 0) !== 0) {
        this.props.changeCartInfo({
          data: {
            list: [
              {
                purchaserShopID: shopID,
                purchaserShopName: shopName,
                shopcarts: [
                  {
                    isSelected: 0,
                    productID: productItem.productID,
                    productSpecID: specItem.specID,
                    shopcartNum: val,
                  }
                ]
              }
            ],
            purchaserUserID: this.props.$user.getIn(['userInfo', 'purchaserUserID']),
          },
          productInfo: {
            product: productItem,
            purchaserShopID: shopID,
          },
          fail: (res) => {
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.saleUnitID),
              visible: this.state.$invalidSet.toJS().length > 1,
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res && res.response && res.response.message || '添加购物车失败');
          },
          success: () => {
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.saleUnitID),
              visible: this.state.$invalidSet.toJS().length > 1,
            });
          }
        });
      } else {
        this.props.deleteCartSpec({
          data:{
            list: [
              {
                purchaserShopID: shopID,
                shopcarts: [
                  {productSpecID: specItem.specID}
                ]
              }
            ],
            purchaserUserID: this.props.$user.getIn(['userInfo', 'purchaserUserID']),
          } ,
          productInfo: {
            product: productItem,
            purchaserShopID: shopID,
            flag: true,
          },
          fail: (res)=>{
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.saleUnitID),
              visible: this.state.$invalidSet.toJS().length > 1,
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res && res.response && res.response.message || '删除购物车失败');
          },
          success: ()=>{
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(specItem.saleUnitID),
              visible: this.state.$invalidSet.toJS().length > 1,
            });
          }
        });
      }
    })

  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  list: {
    flex: 1,
    backgroundColor: styleConsts.white,
  },
  item: {
    flexDirection: 'row',
    position: 'relative',
  },
  img: {
    width: 90,
    height: 90,
    marginTop: 5,
    marginLeft: 5,
    marginBottom: 5,
    marginRight: 10,
  },
  rightPart: {
    flex: 1,
    borderBottomWidth: styleConsts.sepLine,
    borderColor: styleConsts.lightGrey,
    paddingBottom: 10,
  },
  productName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  selectSpecsTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.middleGrey,
    marginRight: 10,
  },
  name: {
    fontSize: styleConsts.H6,
    color: styleConsts.grey,
    marginTop: 5,
  },
  specsWrapper: {
    flexDirection: 'row',
    marginTop: 15,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  specsContent: {
    fontSize: styleConsts.H5,
    color: styleConsts.middleGrey,
    // width: width < 400 ? 85 : 'auto',
  },
  buyMinNumWrapper: {
    paddingLeft: 5,
    paddingRight: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#f6bb42',
    borderRadius: 3,
    marginLeft: 5,
  },
  buyMinNum: {
    fontSize: styleConsts.H5,
    color: '#f6bb42',
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
    // 商品列表
    fetchProductList: (opts) => {
      dispatch(fetchProductListByKeybordAC(opts));
    },
    // 将商品ID保存到redux中
    saveProductID: (opts) => {
      dispatch({type: SAVE_PRODUCT_ID,payload: opts})
    },
    // 跳转到商品详情页
    navToProductDetailInfo: (opts) => {
      dispatch({type: NAV_TO_PRODUCT_DETAIL_INFO, payload: opts});
    },
    // 购物车数量
    fetchCartSpecsNum: (opts) => {
      dispatch(fetchCartSpecsNumAC(opts))
    },
    // 改变购物车中商品规格数量
    changeCartInfo: (opts)=>{
      dispatch(changeCartInfoAC(opts));
    },
    // 删除购物车
    deleteCartSpec: (opts)=>{
      dispatch(deleteCartSpecAC(opts))
    },
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(ProductList)
