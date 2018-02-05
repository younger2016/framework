
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TextInput, Platform, TouchableWithoutFeedback, ScrollView, } from 'react-native';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Immutable from 'immutable';
import Toast from 'react-native-root-toast';
import { toastShort } from '../../components/toastShort';
import { CachedImage } from "react-native-img-cache";
import { styleConsts } from '../../utils/styleSheet/styles';
import shopInfo from './config'
import {getImgUrl} from '../../utils/adapter';
import BlankPage from '../../components/BlankPage'
import { PullFlatList } from '../../components/PullList'
import ChangePrice from '../../components/ChangePrice'
import ProductNum from '../../components/ProductNum'

import {
  getShopInfo,
  changeCollectShopStatus,
  cancelCollectShopStatus,
  fetchShopCategoryAC,
  fetchShopProductListAC,
  getShopInfoCancel,
  getProductListFromShopInfoCancel,
} from '../../redux/actions/shopCenter.action'

class ShopCenter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      shopInfo,               // 店铺信息
      visible: false,
      loadPage: false,        // 加载页面
      loadPageSuccess: false, // 加载页面是否成功
      secShopCategory: [],    // 店铺下的二级分类
      categorySubID: -1,    // 当前列表对应的分类ID,默认显示'全部'
      pageNum: 1,
      pageSize: 20,
      $invalidSet: Immutable.Set(),
    }
  }
  componentDidMount() {
    this.mianInfo = this.props.$someOneInfo.get('main').toJS();

    // 获取店铺详细信息
    this.getShopInfo();

    // 获取该店铺下所有二级分类
    this.fetchShopCategory();

    // 获取商品信息
    // this.fetchProductList(1)
  }
  componentWillReceiveProps(nextProps) {
    // 店铺信息
    if (!Immutable.is(this.props.$someOneInfo.get('info'), nextProps.$someOneInfo.get('info'))) {
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
            item.moreLoading = false;
          });
          secShopCategory.unshift({
            categoryName: '全部',
            extCategoryID: -1,
            productCountNum: 1000000,
            list: [],
            refreshing: false,
            hasLoad: false,
            loadSuccess: false,
            moreLoading: false,
          })
        }
        this.setState({ secShopCategory })
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
          // console.log(this.state.secShopCategory)
          // debugger
        })
      }
    }
  }
  render() {
    const { loadPage, loadPageSuccess, secShopCategory } = this.state
    return (
      <View style={styles.container}>
        {
          !loadPage && (
            loadPageSuccess ?
              <View>
                {this.renderBgInfo()}
                {this.renderCategory()}
                <View style={{ width: width, minHeight: height, }}>
                {
                  secShopCategory.map((item) => {
                    return (
                      <PullFlatList
                        data={item.list}
                        refreshing={item.refreshing}
                        canLoadMore={item.moreLoading}
                        renderItem={ ({item,index}) => this.renderItem(item)}
                        onRefresh={(resove) => {}}
                        onEndReachedThreshold={0}
                        onEndReached={(resove) => {}}
                        ListEmptyComponent={ () => this.renderNoProduct()}
                        keyExtractor={({ productID }) => productID}
                      />
                    )
                  })
                }
                </View>
              </View> :
              <BlankPage visable={true} type={'error'} loadAgain={() => this.getShopInfo() }/>
          )
        }

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

  // 头部
  renderBgInfo = () => {
    const { logoUrl, supplyShopName, collection, isCollected } = this.state.shopInfo.homeInfo
    return (
      <View style={styles.bgWrapper}>
        <Image style={styles.bgImg} source={require('./imgs/shopBg.png')} />
        <View style={styles.searchWrapper}>
          <TouchableWithoutFeedback onPress={() => this.props.navigation.goBack()}>
            <View style={styles.goBackImgWrapper}>
              <Image style={styles.goBackImg} source={require('../../components/HeaderBar/imgs/goback.png')} />
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.textInputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder='搜本店'
              placeholderTextColor={styleConsts.white}
              underlineColorAndroid="transparent"
            />
            <Image style={styles.search} source={require('../../components/HeaderSwitchShop/imgs/search.png')} />
          </View>
        </View>
        <View style={styles.shopInfo}>
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
            <Text style={styles.shopName}>{supplyShopName}</Text>
            <View style={{ flexDirection: 'row', }}>
              <Text style={styles.shopOther}>收藏{collection}</Text>
              <Text style={[styles.shopOther, { marginLeft: 12, }]}>查看店铺详情</Text>
            </View>
          </View>
          <TouchableWithoutFeedback onPress={this.changeCollected}>
            <View style={styles.collectWrapper}>
              <Image style={styles.collectImg} source={ isCollected === 0 ? require('./imgs/notCollectShop.png') : require('./imgs/collectShop.png')} />
              <Text style={styles.collectTxt}>收藏</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  };

  // 二级分类
  renderCategory = () => {
    const { secShopCategory, categorySubID, } = this.state;
    return (
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryWrapper}>
          {
            secShopCategory.map((item, index) => {
              return (
                <TouchableWithoutFeedback key={item.extCategoryID} onPress={() => this.switchCategory(item.extCategoryID, index)}>
                  <View style={styles.categoryItem}>
                    {/* TODO::category num */}
                    <Text style={[styles.categoryNum, categorySubID === item.extCategoryID && styles.activeCategoryNum]}>10000</Text>
                    <Text style={[styles.categoryTxt, categorySubID === item.extCategoryID && styles.activeCategoryTxt]}>{item.categoryName}</Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            })
          }
        </View>
      </ScrollView>
    )
  };

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
            {/*<View style={styles.buyMinNumWrapper}>
             <Text style={styles.buyMinNum}>{specItem.buyMinNum}{specItem.saleUnitName}起购</Text>
             </View>*/}
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
          onChange={(val) => this.shopcartNumChange(val,specItem,productItem)}
          disabled={$invalidSet.has(specItem.saleUnitID)}
          shopID={purchaserShopID}
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

  // 商品规格数量改变
  shopcartNumChange = (val,specItem,productItem) => {
    // this.props.onChange && this.props.onChange(val,specItem,productItem);
  };

  // 空白页、网络错误页
  renderNoProduct = () => {
    let { hasLoad, loadSuccess, pageNum } = this.state;
    return (
      <BlankPage
        visable={true}
        type={ !hasLoad ? 'loading' : loadSuccess ? 'blank' : 'error' }
        loadAgain={() => this.fetchProductList(pageNum)}
        imgType='noProduct'
      >
        <Text style={{fontSize: styleConsts.H4,color: styleConsts.middleGrey, marginTop: 15}}>该分类暂无商品</Text>
      </BlankPage>
    );
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

  // 改变收藏状态
  changeCollected = () => {
    const { isCollected, categoryID, logoUrl, supplyGroupID, supplyShopID, supplyShopName } = this.state.shopInfo.homeInfo;
    if ( this.props.token === '' || !this.props.token){
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

  // 切换分类后获取对应的商品列表
  switchCategory = (extCategoryID, index) => {
    this.setState({
      categorySubID: extCategoryID,
    }, () => {
      this.fetchProductList(index)
    })
  };

  // 获取选中分类下的商品列表
  fetchProductList = (index) => {
    const { categorySubID, pageNum, pageSize, secShopCategory } = this.state
    this.props.fetchProductList({
      data: {
        categorySubID,
        pageNo: pageNum,
        pageSize,
        supplyGroupID: this.mianInfo.supplyGroupID,
      },
      success: (res) => {
        const data = res.data.length ? res.data : [];
        if (data.length < secShopCategory[index].list.length) {
          secShopCategory[index].moreLoading = false;
        }
        secShopCategory[index].refreshing = false;
        secShopCategory[index].hasLoad = true;
        secShopCategory[index].loadSuccess = true;
        this.setState({ secShopCategory },() => {
          // debugger
        });
      },
      type: categorySubID,
      fail: (res) => {
        secShopCategory[index].refreshing = false;
        secShopCategory[index].hasLoad = true;
        secShopCategory[index].loadSuccess = false;
        this.setState({ secShopCategory },() => {
          debugger
        });
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
      },
      timeout: () => {
        secShopCategory[index].refreshing = false;
        secShopCategory[index].hasLoad = true;
        secShopCategory[index].loadSuccess = false;
        this.setState({ secShopCategory },() => {
          debugger
        });
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort('诶呀，服务器开小差了');
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
    top: 24,
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
  textInputWrapper: {
    flex: 1,
    height: 30,
    position: 'relative',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    height: 30,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.white,
    fontSize: styleConsts.H4,
    color: styleConsts.white,
    paddingLeft: 10 + 16 + 15,
    padding: 0,
  },
  search: {
    width: 12.5,
    height: 12.5,
    position: 'absolute',
    left: 10,
  },
  shopInfo: {
    width: width,
    height: 40,
    position: 'absolute',
    bottom: 10,
    left: 15,
    flexDirection: 'row',
  },
  shopImg: {
    width: 40,
    height: 40,
  },
  shopName: {
    fontSize: styleConsts.H2,
    color: styleConsts.white,
    backgroundColor: 'rgba(0,0,0,0)',
    marginTop: Platform.OS === 'ios' ? 2 : 0,
    marginBottom: Platform.OS === 'ios' ? 7 : 4,
  },
  shopOther: {
    fontSize: styleConsts.H5,
    color: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(0,0,0,0)',
  },
  collectWrapper: {
    width: 70,
    height: 25,
    backgroundColor: styleConsts.btnBg,
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 12.5,
    borderBottomLeftRadius: 12.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 7.5
  },
  collectImg: {
    width: 12.5,
    height: 12,
    marginRight: 8,
  },
  collectTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.white,
    backgroundColor: 'rgba(0,0,0,0)',
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
    marginTop: 8,
  },

  // 商品列表样式
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
    $someOneInfo: state.shopCenter.get('someOneInfo'),
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    token: state.user.get('token'),
    $shopCategory: state.shopCenter.get('shopCategory'),
    $categoryProduct: state.shopCenter.get('categoryProduct'),
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
    fetchProductList: (opts) => {
      dispatch(fetchShopProductListAC(opts))
    },
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ShopCenter)