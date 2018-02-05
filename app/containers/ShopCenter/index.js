/**
 * (供应商)店铺首页
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TextInput, Platform, TouchableWithoutFeedback, ScrollView, Animated, Linking, StatusBar } from 'react-native';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import ScrollableTabView, { DefaultTabBar, ScrollableTabBar } from 'react-native-scrollable-tab-view';
import Immutable from 'immutable';
import Toast from 'react-native-root-toast';
import { toastShort } from '../../components/toastShort';
import I18n from 'react-native-i18n'
import { CachedImage } from "react-native-img-cache";
import { styleConsts } from '../../utils/styleSheet/styles';
import shopInfo from './config'
import {getImgUrl} from '../../utils/adapter';
import BlankPage from '../../components/BlankPage'
import { PullFlatList } from '../../components/PullList'
import ChangePrice from '../../components/ChangePrice'
import ProductNum from '../../components/ProductNum'
import SearchModal from './containers/SearchModal'
import {
  getShopInfo,
  changeCollectShopStatus,
  cancelCollectShopStatus,
  fetchShopCategoryAC,
  fetchShopProductListAC,
  getShopInfoCancel,
  fetchShopProductListCancel,
} from '../../redux/actions/shopCenter.action'
import {
  fetchCartListAC,
  changeCartInfoAC,
  deleteCartSpecAC,
} from '../../redux/actions/cart.action'
import { NAV_TO_PRODUCT_DETAIL_INFO, NAV_TO_LOGIN_SCENE, NAV_TO_SHOPCENTER_INFO_PAGE } from '../../redux/actions/nav.action'
import { SAVE_PRODUCT_ID } from '../../redux/actions/products.action'

class ShopCenter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shopInfo,               // 店铺信息
      visible: false,
      loadPage: false,        // 加载页面
      loadPageSuccess: false, // 加载页面是否成功
      secShopCategory: [],    // 店铺下的二级分类
      showIndex: 0,           // 首次进入显示'全部'
      categorySubID: 0,       // 当前列表对应的分类ID,默认显示'全部'
      $invalidSet: Immutable.Set(),
      specsObj: {},           // { specID:specNum, ... }
      purchaserShopID: '',    // 采购商店铺ID
      purchaserShopName: '',  // 采购商店铺名称
      modalVisible: false,    // 店内搜索弹窗
      opacity: new Animated.Value(0),
    }
    this.id = 1;
  }
  componentDidMount() {
    this.mianInfo = this.props.$someOneInfo.get('main').toJS();

    // 获取店铺详细信息
    this.getShopInfo();

    // 获取该店铺下所有二级分类
    this.fetchShopCategory();

    // 当前采购商门店
    this.setState({
      purchaserShopName: this.props.$selectedShop.toJS().selectShopName,
      purchaserShopID: this.props.$selectedShop.toJS().selectShopID,
    })

  }
  componentWillReceiveProps(nextProps) {
    // 店铺信息, 不能使用Immutable.is判断props是否改变，第二次进入店铺时会不执行下面的代码
    if (this.props.$someOneInfo.get('info') !== nextProps.$someOneInfo.get('info')) {
      const status = nextProps.$someOneInfo.get('status');
      const info = nextProps.$someOneInfo.get('info').toJS();
      if (status === 'success') {
        this.setState({
          shopInfo: info,
          visible: false,
          loadPage: false,
          loadPageSuccess: true,
        })
      }
    }

    // 该店铺下的分类
    if (!Immutable.is(this.props.$shopCategory, nextProps.$shopCategory)) {
      const shopCategory = nextProps.$shopCategory.toJS();
      if (shopCategory.status === 'success') {
        const category = shopCategory.category;
        const secShopCategory = category[2] && category[2] instanceof Array ? category[2] : [];
        // 如果二级分类存在，在头部添加'全部'
        if (secShopCategory.length !== 0) {
          // 为每个二级分类添加list、hasLoad、loadSuccess、moreLoading字段，用于获取该分类商品列表
          secShopCategory.forEach((item) => {
            item.list = [];
            item.refreshing = false;
            item.hasLoad = false;
            item.loadSuccess = false;
            item.moreLoading = true;
            item.pageNum = 1;
            item.pageSize = 20;
            item.id = `item${item.extCategoryID}` ;
          });
        }
        this.setState({ secShopCategory }, () => {
          // 该店下有分类才去请求全部商品
          if (this.state.secShopCategory.length !== 0) {
            this.fetchShopProductList(this.state.showIndex)
          }
        })
      }
    }

    // 商品列表
    if (!Immutable.is(this.props.$categoryProduct, nextProps.$categoryProduct)) {
      const categoryProduct = nextProps.$categoryProduct.toJS()
      const { categorySubID, secShopCategory } = this.state

      if (categoryProduct[categorySubID] && categoryProduct[categorySubID].status === 'success') {
        secShopCategory.map((item) => {
          if (item.extCategoryID === categorySubID) {
            item.list = categoryProduct[categorySubID].list;
          }
        })
        this.setState({ secShopCategory },() => {
          // 请求购物车数量
          this.fetchCartInfo()
        })
      }
    }

    // 购物车列表
    if(!Immutable.is(this.props.$cart, nextProps.$cart)){
      this.filterSpecNum(nextProps);
    }

    // 采购商门店
    if(!Immutable.is(this.props.$selectedShop, nextProps.$selectedShop)) {
      const selectShop = nextProps.$selectedShop.toJS();
      this.setState({
        purchaserShopName: selectShop.selectShopName,
        purchaserShopID: selectShop.selectShopID,
      }, () => {
        // 请求购物车数量
        this.fetchCartInfo()
      })
    }

  }

  componentWillUnmount() {
    this.setState({
      visible: false,
    })
    this.props.cancelFetch()
    this.toast && Toast.hide(this.toast)
  }

  render() {
    const { loadPage, loadPageSuccess, secShopCategory } = this.state
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={'rgba(0,0,0,0)'} translucent={true}/>
        {
          !loadPage && (
            loadPageSuccess ?
              <View style={{flex: 1,}}>
                {this.renderBgInfo()}
                {
                  secShopCategory.length !== 0 ?
                    <ScrollableTabView
                      initialPage={0}
                      ref="allPageTab"
                      renderTabBar={() => this.renderCategory()}
                      onChangeTab={(a)=>{
                        // 切换分类后获取对应的商品列表
                        const { secShopCategory } = this.state
                        this.setState({
                          showIndex: a.i,
                          categorySubID: secShopCategory[a.i].extCategoryID,
                        }, () => {
                          const { secShopCategory, showIndex, } = this.state
                          if (!secShopCategory[showIndex].hasLoad) {
                            this.fetchShopProductList(showIndex)
                          }

                        })
                      }}
                      locked={true}
                    >
                      {
                        secShopCategory.map((item, index) => {
                          return (
                            <PullFlatList
                              data={item.list}
                              refreshing={item.refreshing}
                              canLoadMore={item.moreLoading}
                              renderItem={({item,index}) => this.renderItem(item)}
                              onRefresh={(resove) => this.updateProductList(index, resove)}
                              onEndReachedThreshold={0}
                              onEndReached={(resove) => this.loadingMoreProductList(index, resove)}
                              ListEmptyComponent={ () => this.renderNoProduct(item, index)}
                              keyExtractor={(item) => item.id}
                              style={{flex: 1,}}
                            />
                          )
                        })
                      }
                    </ScrollableTabView> : <BlankPage visable={true} type={'blank'} loadAgain={() => {}}/>
                }
              </View>:
              <BlankPage visable={true} type={'error'} loadAgain={() => this.getShopInfo() }/>
          )
        }

        <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
          <View style={styles.leftBox}>
            <Image
              style={{tintColor: loadPageSuccess ? styleConsts.white : styleConsts.darkGrey, width: 9, height: 16}}
              source={require('../../components/HeaderBar/imgs/goback.png')}
            />
          </View>
        </TouchableWithoutFeedback>

        <SearchModal
          visible={this.state.modalVisible}
          modalShowOrClose={this.modalShowOrClose}
          opacity={this.state.opacity}
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

  /** 头部 */
  renderBgInfo = () => {
    const { logoUrl, supplyShopName, collection, isCollected } = this.state.shopInfo.homeInfo
    const { shopPhone } = this.state.shopInfo.baseInfo
    return (
      <View style={styles.bgWrapper}>
        <Image style={styles.bgImg} source={require('./imgs/shopBg.png')} />
        <View style={styles.searchWrapper}>
          <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
            <View style={styles.goBackImgWrapper}>
              <Image style={styles.goBackImg} source={require('../../components/HeaderBar/imgs/goback.png')} />
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => this.modalShowOrClose()}>
            <View style={styles.textWrapper}>
              <Image style={styles.search} source={require('../../components/HeaderSwitchShop/imgs/search.png')} />
              <Text style={styles.text}>搜本店</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.shopInfo}>
          <TouchableWithoutFeedback onPress={() => this.props.goToShopInfo()}>
            <View style={{ width: width - 15 - 92, flexDirection: 'row', }}>
              <Image style={styles.shopImg} source={require('../../imgs/loadImage.png')} />
              {
                logoUrl === '' ?
                  <Image
                    style={[styles.shopImg,{position: 'absolute'}]}
                    source={require('../../imgs/noShopLogo.png')}
                  /> :
                  <CachedImage
                    style={[styles.shopImg,{position: 'absolute'}]}
                    source={{uri: getImgUrl(logoUrl)}}
                  />
              }
              <View style={{ marginLeft: 10, }}>
                <Text style={styles.shopName} numberOfLines={1}>{supplyShopName}</Text>
                <View style={{ flexDirection: 'row', width: width - 15 - 40 - 10 - 92, }}>
                  <Text style={styles.shopOther}>收藏{collection}</Text>
                  <Text style={[styles.shopOther, { marginLeft: 12, }]}>查看店铺详情</Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.topRight}>
            <TouchableWithoutFeedback onPress={() => {
              if (shopPhone !== '') {
                this.openPhone(`tel:${shopPhone}`)
              } else {
                this.toast && Toast.hide(this.toast);
                this.toast = toastShort('供应商暂未提供联系方式');
              }
            }}>
              <View style={styles.collectWrapper}>
                <Image style={styles.collectImg} source={require('./imgs/shopPhone.png')} />
                <Text style={styles.collectTxt}>供应商</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={this.changeCollected}>
              <View style={styles.collectWrapper}>
                <Image style={styles.collectImg} source={ isCollected === 0 ? require('./imgs/notCollectShop.png') : require('./imgs/collectShop.png')} />
                <Text style={styles.collectTxt}>{isCollected === 0 ? '收藏店铺' : '已收藏'}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    )
  };

  /** 二级分类 */
  renderCategory = () => {
    const { secShopCategory, showIndex, } = this.state;
    return (
      <View style={styles.categoryWrapper}>
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {
            secShopCategory.map((item, index) => {
              return (
                <TouchableWithoutFeedback key={item.extCategoryID} onPress={() => {this.switchCategory(index)}}>
                  <View style={[styles.categoryItem, showIndex === index && styles.activeCategoryItem]}>
                    <Text style={[styles.categoryNum, showIndex === index && styles.activeCategoryNum]}>{item.productCountNum}</Text>
                    <Text style={[styles.categoryTxt, showIndex === index && styles.activeCategoryTxt]}>{item.categoryName}</Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            })
          }
        </ScrollView>
      </View>
    )
  };

  /** 渲染商品 */
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

  /** 渲染规格 */
  renderSpecItem = (specItem,productItem) => {
    let { specsObj, $invalidSet, purchaserShopID } = this.state;
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
          shopID={purchaserShopID}
          buyMinNum={specItem.buyMinNum}
        />
      </View>
    )
  };

  /** 选规格 */
  toggleShowSpecsInfo = (productItem) => {
    this.setState({
      [`${productItem.productID}visible`]: !this.state[`${productItem.productID}visible`],
    })
  };

  /** 空白页、网络错误页 */
  renderNoProduct = (productItem,productIndex) => {
    return (
      <BlankPage
        visable={true}
        type={!productItem.hasLoad ? 'loading' : productItem.loadSuccess ? 'blank' : 'error'}
        loadAgain={() => this.fetchShopProductList(productIndex)}
      >
        <Text style={{fontSize: styleConsts.H4,color: styleConsts.grey, marginTop: 15}}>{I18n.t('thisShopNoProduct')}</Text>
      </BlankPage>
    )
  };

  // 获取店铺信息
  getShopInfo = () => {
    this.setState({
      visible: true,
      loadPage: true,
    }, () => {
      this.props.getShopInfo({
        data: {
          purchaserID: 0,
          supplyGroupID: this.mianInfo.supplyGroupID,
          supplyShopID: this.mianInfo.supplyShopID,
        },
        fail: (res) => {
          this.setState({
            visible: false,
            loadPage: false,
            loadPageSuccess: false,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
        },
        timeout: () => {
          this.setState({
            visible: false,
            loadPage: false,
            loadPageSuccess: false,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
        },
      })
    })
  };

  /**
   * 电话
   * @param url
   * @event click phone
   */
  openPhone = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (!supported) {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(`Can't handle url: ${url}` || '诶呀，服务器开小差啦~');
      } else {
        return Linking.openURL(url);
      }
    }).catch(err => {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(err || '诶呀，服务器开小差啦~');
    });
  }

  // 改变收藏状态
  changeCollected = () => {
    const { isCollected, categoryID, logoUrl, supplyGroupID, supplyShopID, supplyShopName } = this.state.shopInfo.homeInfo;
    if ('' === this.props.$user.get('token') || !this.props.$user.get('token')){
      return this.props.goToLogin()
    }
    if (isCollected === 0) { // 去收藏
      this.props.changeCollectShopStatus({
        data: {
          categoryID,
          logoUrl,
          purchaserID: this.props.purchaserID,
          supplyGroupID,
          supplyShopID,
          supplyShopName,
        },
        success: () => {
          let shopInfo = this.state.shopInfo;
          shopInfo.homeInfo.isCollected = 1
          this.setState({ shopInfo })
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('添加收藏成功');
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
    } else { // 取消收藏
      this.props.cancelCollectShopStatus({
        data: {
          purchaserID: this.props.purchaserID,
          supplyShopID: this.mianInfo.supplyShopID,
        },
        success: () => {
          let shopInfo = this.state.shopInfo;
          shopInfo.homeInfo.isCollected = 0
          this.setState({ shopInfo })
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('取消收藏成功');
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

  // 获取该店铺下所有二级分类
  fetchShopCategory = () => {
    this.props.fetchShopCategory({
      data: {
        getResource: 1,
        groupID: this.mianInfo.supplyGroupID,
        shopID: this.mianInfo.supplyShopID,
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

  // 切换分类跳转到对应的分类
  switchCategory = (index) => {
    this.refs.allPageTab.goToPage(index);
  };

  // 获取选中分类下的商品列表
  fetchShopProductList = (index, resove) => {
    const { categorySubID, secShopCategory } = this.state
    this.props.fetchShopProductList({
      data: {
        categorySubID: categorySubID === 0 ? '' : categorySubID,
        pageNum: secShopCategory[index].pageNum,
        pageSize: secShopCategory[index].pageSize,
        supplierShopId: this.mianInfo.supplyShopID,
      },
      success: (res) => {
        const data = res.data.length ? res.data : [];
        if (data.length < secShopCategory[index].list.length) {
          secShopCategory[index].moreLoading = false;
        }
        secShopCategory[index].refreshing = false;
        secShopCategory[index].hasLoad = true;
        secShopCategory[index].loadSuccess = true;
        this.setState({ secShopCategory });
        if(resove instanceof Function){
          resove('success')
        }
      },
      type: `${categorySubID}`,
      fail: (res) => {
        secShopCategory[index].refreshing = false;
        secShopCategory[index].hasLoad = true;
        secShopCategory[index].loadSuccess = false;
        this.setState({ secShopCategory });
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
        if(resove instanceof Function){
          resove('fail')
        }
      },
      timeout: () => {
        secShopCategory[index].refreshing = false;
        secShopCategory[index].hasLoad = true;
        secShopCategory[index].loadSuccess = false;
        this.setState({ secShopCategory });
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort('诶呀，服务器开小差了');
        if(resove instanceof Function){
          resove('timeout')
        }
      }
    })
  }

  updateProductList = (index, resove) => {
    const { secShopCategory } = this.state;
    secShopCategory[index].refreshing = true;
    this.setState({ secShopCategory }, () => {
      this.fetchShopProductList(index, resove);
    })
  }

  loadingMoreProductList = (index, resove) => {
    const { secShopCategory } = this.state
    if (secShopCategory[index].moreLoading) {
      secShopCategory[index].pageNum = Math.floor(secShopCategory[index].list.length / secShopCategory[index].pageSize + 1);
      this.fetchShopProductList(index, resove);
    }
  }

  /** 获取购物车 */
  fetchCartInfo = () => {
    if('' !== this.props.$user.get('token') || this.props.$user.get('token')) {
      if(this.props.$cart.getIn(['cartList', 'sync'])) {
        this.filterSpecNum(this.props);
      } else {
        this.props.fetchCartList({
          data: {
            purchaserUserID: this.props.$user.getIn(['userInfo', 'purchaserUserID']),
            shopList: [{
              shopID: this.state.purchaserShopID,
              shopName: this.state.purchaserShopName,
            }]
          },
          fail: (res) =>{
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
          },
          timeout: () =>{
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort('诶呀，服务器开小差了');
          },
        })
      }

    }
  };

  /**
   * 购物车
   * @param props
   */
  filterSpecNum = (props) => {
    let normalProduct = props.$cart.getIn(['cartList', 'normalProduct']).toJS();

    let newNormalProduct = [];
    normalProduct.forEach( (product) => {
      newNormalProduct = newNormalProduct.concat(product.shopcartProductList);
    });
    const specsObj = {};
    newNormalProduct.forEach((item) => {
      item.specs.forEach( (specItem) => {
        specsObj[specItem.specID] = specItem.shopcartNum;
      });
    })
    this.setState({ specsObj })
  };

  /**
   * 加减购物车
   * @param val
   * @param specItem
   * @param productItem
   */
  changeCartInfo = (val,specItem,productItem) => {
    let { purchaserShopID, purchaserShopName } = this.state;
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
            product: productItem,
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

  /**
   * 先将商品ID保存到redux中，然后跳转到商品详情页
   * @param productID
   * @event nav to product detail info and save product ID
   */
  navToProductDetailInfo = (productID) => {
    this.props.saveProductID(productID);
    this.props.navToProductDetailInfo();
  };

  /** 搜索弹窗是否显示 */
  modalShowOrClose = () => {
    this.setState({
      modalVisible: !this.state.modalVisible,
    },() => {
      if (this.state.modalVisible) {
        Animated.timing(
          this.state.opacity,
          {
            toValue: 1,
            duration:300,
          }
        ).start()
      } else {
        Animated.timing(
          this.state.opacity,
          {
            toValue: 0,
            duration:300,
          }
        ).start()
      }
    })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgSeparate,
  },
  bgWrapper: {
    width,
    height: 140,
    position: 'relative',
  },
  bgImg: {
    width,
    height: 140,
  },
  searchWrapper: {
    position: 'absolute',
    top: Platform.OS === 'android' && Platform.Version <= 19 ? 0 : 20,
    left: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
  },
  goBackImgWrapper: {
    width: 45,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBackImg: {
    width: 9,
    height: 16,
  },
  textWrapper: {
    flex: 1,
    height: 30,
    backgroundColor: 'rgba(0,0,0,0)',
    borderBottomWidth: 1,
    borderColor: styleConsts.white,
    justifyContent: 'center',
  },
  text: {
    fontSize: styleConsts.H4,
    color: styleConsts.white,
    paddingLeft: 10 + 16 + 10,
  },
  search: {
    width: 12.5,
    height: 12.5,
    position: 'absolute',
    left: 10,
  },
  shopInfo: {
    width: width,
    height: 60,
    position: 'absolute',
    bottom: 5,
    left: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopImg: {
    width: 40,
    height: 40,
  },
  shopName: {
    width: width - 15 - 40 - 10 - 90 - 2,
    fontSize: styleConsts.H2,
    color: styleConsts.white,
    backgroundColor: 'rgba(0,0,0,0)',
    marginTop: Platform.OS === 'ios' ? 2 : 0,
    marginBottom: Platform.OS === 'ios' ? 7 : 4,
  },
  shopOther: {
    fontSize: styleConsts.H5,
    color: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  topRight: {
    width: 92,
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectWrapper: {
    width: 42,
    height: 42,
    alignItems: 'center',
    // marginRight: 5,
  },
  collectImg: {
    width: 20,
    height: 20,
    marginTop: 3,
  },
  collectTxt: {
    fontSize: styleConsts.H6,
    color: styleConsts.white,
    backgroundColor: 'rgba(0,0,0,0)',
    marginTop: Platform.OS === 'ios' ? 7 : 5,
  },
  categoryWrapper: {
    minWidth: width,
    height: 55,
    backgroundColor: styleConsts.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    flexDirection: 'row',
  },
  categoryItem: {
    width: 75,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeCategoryItem: {
    borderBottomWidth: 2,
    borderColor: styleConsts.mainColor,
  },
  categoryNum: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
  },
  activeCategoryNum: {
    fontSize: styleConsts.H2,
    color: styleConsts.mainColor,
  },
  categoryTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
    marginTop: 8,
  },
  activeCategoryTxt: {
    color: styleConsts.mainColor,
    marginTop: 6,
  },
  // 商品列表样式
  item: {
    flexDirection: 'row',
    position: 'relative',
    backgroundColor: styleConsts.white,
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
  leftBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: styleConsts.headerHeight,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: styleConsts.headerPaddingTop,
  }
});

const mapStateToProps = (state) => {
  return {
    $someOneInfo: state.shopCenter.get('someOneInfo'),
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    $user: state.user,
    $shopCategory: state.shopCenter.get('shopCategory'),
    $categoryProduct: state.shopCenter.get('categoryProduct'),
    $cart: state.cart,
    $selectedShop: state.storesCenter.get('selectedShop'),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 店铺信息
    getShopInfo: (opts) => {
      dispatch(getShopInfo(opts))
    },
    // 收藏
    changeCollectShopStatus: (opts) => {
      dispatch(changeCollectShopStatus(opts))
    },
    // 取消收藏
    cancelCollectShopStatus: (opts) => {
      dispatch(cancelCollectShopStatus(opts))
    },
    // 该店铺下二级分类
    fetchShopCategory: (opts) => {
      dispatch(fetchShopCategoryAC(opts))
    },
    // 商品列表
    fetchShopProductList: (opts) => {
      dispatch(fetchShopProductListAC(opts))
    },
    // 购物车商品列表
    fetchCartList: (opts)=>{
      dispatch(fetchCartListAC(opts))
    },
    // 添加购物车
    changeCartInfo: (opts) => {
      dispatch(changeCartInfoAC(opts));
    },
    // 删除购物车
    deleteCartSpec: (opts) => {
      dispatch(deleteCartSpecAC(opts))
    },
    // 组件销毁时取消发送的请求
    cancelFetch: () => {
      dispatch(fetchShopProductListCancel())
      dispatch(getShopInfoCancel())
    },
    // 跳转到商品详情页
    navToProductDetailInfo: (opts) => {
      dispatch({type: NAV_TO_PRODUCT_DETAIL_INFO, payload: opts});
    },
    // 将商品ID保存到redux中
    saveProductID: (opts) => {
      dispatch({type: SAVE_PRODUCT_ID,payload: opts})
    },
    goToLogin: () => {
      dispatch({type: NAV_TO_LOGIN_SCENE})
    },
    // 店铺详情
    goToShopInfo: (opts) => {
      dispatch({type: NAV_TO_SHOPCENTER_INFO_PAGE, payload: opts})
    },
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ShopCenter)