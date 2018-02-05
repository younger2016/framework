/**
 * 商品搜索结果页
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Platform, } from 'react-native';
import Immutable from 'immutable';
import Toast from 'react-native-root-toast';
import { toastShort } from '../../components/toastShort';
import { styleConsts } from '../../utils/styleSheet/styles';
import SearchBtn from '../../components/SearchBtn';
import ChangePrice from '../../components/ChangePrice';
import { fetchProductListByKeybordAC } from '../../redux/actions/products.action';
import {
  NAV_TO_PRODUCT_DETAIL_INFO,
} from '../../redux/actions/nav.action';
import {
  SAVE_PRODUCT_ID,
} from '../../redux/actions/products.action';
import BlankPage from '../../components/BlankPage';
import { PullFlatList } from '../../components/PullList';
import { getImgUrl } from '../../utils/adapter';

class ProductList extends Component{
  constructor(props){
    super(props);
    this.state = {
      sreachProductList: [],// 搜索商品结果列表数据
      refreshing: false,    // 下拉刷新
      moreLoading: false,   // 加载更多
      hasLoad: false,       // 是否发过请求
      loadSuccess: false,   // 加载成功还是失败
      pageNum: 1,           // 当前页码
      pageSize: 20,         // 一页请求的数据
      productName: '',      // 根据此商品名称搜索
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
  }
  componentWillReceiveProps(nextProps) {
    if(!Immutable.is(this.props.$products.get('sreachProductList'),nextProps.$products.get('sreachProductList'))) {
      let sreachProductList = Immutable.Map.isMap(nextProps.$products) ?
        nextProps.$products.toJS().sreachProductList : nextProps.$products.sreachProductList;
      if('success' === sreachProductList.status){
        this.setState({
          sreachProductList: sreachProductList.list,
          refreshing: false,
          loadSuccess: true,
          hasLoad: true,
        });
      }
    }
  }
  render() {
    let sreachProductList = JSON.parse(JSON.stringify(this.state.sreachProductList));
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
            data={sreachProductList}
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
      </View>
    )
  }

  // 渲染商品
  renderItem = (productItem) => {
    return (
      <TouchableWithoutFeedback onPress={() => this.navToProductDetailInfo(productItem.productID)} key={`${productItem.productID}`}>
        <View style={styles.item}>
          <Image style={styles.img} source={{ uri: getImgUrl(productItem.imgUrl, 90, 90) }} />
          <View style={styles.itemRightPart}>
            <View style={styles.itemBorder}>
              <View style={{marginRight: 10,}}>
                <Text style={styles.productName} numberOfLines={1}>{productItem.productName}</Text>
                <Text style={[styles.shopName,Platform.OS === 'android' && {marginTop: 5}]}>{productItem.supplierShopName}</Text>
              </View>
              {
                productItem.specs instanceof Array && productItem.specs.map((specItem,specIndex) => {
                  return (
                    <View style={{flex: 1}} key={`${specItem.specID}`}>
                      {
                        0 === specIndex ?
                          this.renderSpecItem(productItem,specItem,specIndex) :
                          this.state[`${productItem.productID}visible`] ?
                            this.renderSpecItem(productItem,specItem,specIndex) : null
                      }
                    </View>
                  )
                })
              }
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  };

  // 渲染商品规格
  renderSpecItem = (productItem,specItem,specIndex) => {
    return (
      <View style={[styles.specsWrapper, Platform.OS === 'android' && {marginTop: 13}]}>
        <ChangePrice price={specItem.productPrice} suffix={specItem.saleUnitName} big={styleConsts.H3} small={styleConsts.H5} width={'100%'} fontWeight='600' />
        <View style={styles.specItem}>
          <View style={{flexDirection: 'row',}}>
            {
              !!specItem.specContent&&<Text style={styles.specsContent} numberOfLines={1}>{specItem.specContent}/{specItem.saleUnitName}</Text>
            }
             {
              0 === specItem.buyMinNum || 1 === specItem.buyMinNum ?
                null :
                <View style={styles.buyMinNumWrapper}>
                  <Text style={styles.buyMinNum}>{specItem.buyMinNum}{specItem.saleUnitName}起购</Text>
                </View>
            }
          </View>
          {
            productItem.specs.length !== 1 && 0 === specIndex ?
              <TouchableWithoutFeedback onPress={() => {
                this.setState({
                  [`${productItem.productID}visible`]: !this.state[`${productItem.productID}visible`],
                })
              }}>
                <View style={styles.specTxtWapper}>
                  <Text style={styles.specTxt}>
                    {
                      this.state[`${productItem.productID}visible`] ?
                        '收起' : '更多规格'
                    }
                  </Text>
                </View>
              </TouchableWithoutFeedback>
              : null
          }
        </View>
      </View>
    )
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
    let { sreachProductList, moreLoading } = this.state;
    if(moreLoading) {
      pageNum = Math.floor(sreachProductList.length / 20 + 1);
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
  },
  itemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    paddingBottom: 9,
  },
  img: {
    width: 90,
    height: 90,
    marginTop: 5,
    marginLeft: 5,
    marginBottom: 5,
    marginRight: 10,
  },
  itemRightPart: {
    flex: 1,
    // paddingTop: 12,
  },
  productName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    marginTop: 12,
  },
  shopName: {
    fontSize: styleConsts.H6,
    color: styleConsts.grey,
    marginTop: 8,
  },
  specsWrapper: {
    marginTop: 15,
    marginRight: 10,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative',
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
  specTxtWapper: {
    width: 62,
    height: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    bottom: -4,
  },
  specTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.middleGrey,
  },
});

const mapStateToProps = (state) => {
  return {
    $products: state.products,
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
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(ProductList)
