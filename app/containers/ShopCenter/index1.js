// 店铺首页

import React,{PropTypes} from 'react'
import { ScrollView, View, Text, StyleSheet, Image, StatusBar} from 'react-native';
import { connect } from 'react-redux'
import {styleConsts} from '../../utils/styleSheet/styles'
import Dimensions from 'Dimensions';
import I18n from 'react-native-i18n'
import BlankPage from '../../components/BlankPage'
import {TouchableWithoutFeedbackD, TouchableHighlightD} from '../../components/touchBtn'
import {
  NAV_TO_SHOPCENTER_INFO_PAGE,
  NAV_TO_PRODUCT_DETAIL_INFO,
  NAV_TO_LOGIN_SCENE,
} from '../../redux/actions/nav.action'
import {
  getShopInfo,
  getProductListFromShopInfo,
  changeCollectShopStatus,
  cancelCollectShopStatus,
  getShopInfoCancel,
  getProductListFromShopInfoCancel,
} from '../../redux/actions/shopCenter.action'
import {
  SAVE_PRODUCT_ID,
} from '../../redux/actions/products.action';
import ChangePrice from '../../components/ChangePrice'
import { is } from 'immutable'
import Toast from 'react-native-root-toast';
import { toastShort } from '../../components/toastShort'
import shopInfo from './config'
const { width, height } = Dimensions.get('window')
import {getImgUrl} from '../../utils/adapter';
import { PullFlatList } from '../../components/PullList';
const getShopIMg = require('./imgs/notCollectShop.png');
import { CachedImage } from "react-native-img-cache";


class ShopCenter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      loadPage: true,
      loadPageSuccess: false,
      loadPageTxt: 'loadingFail',
      isOn: false,
      loadPro: { // 加载商品列表
        loading: false,
        hasLoad: false, // 是否加载过一
        loadSuccess: false, // 是否加载成功
        loadMoreTxt: 'loadingMoreData', // 加载更多，没有更多了
      },
      loadMore: false, // 是否允许加载更多，
      shopInfo,
      productList: []
    }
  }
  componentDidMount() {
    StatusBar.setBarStyle('light-content');
    this.mianInfo = this.props.$allInfo.get('main').toJS();
    // 预防重复请求，先merge
    this.setState({
      isOn: this.props.token !== '' && this.props.token,
    });
    if('pending' !== this.props.$allInfo.get('status')){
      // 请求基本信息
      this.fetchBaseInfo()
    }
    if('pending' !== this.props.$allInfo.getIn(['productList','status'])){
      // 请求商品信息
      this.fetchProductList(1)
    }

  }
  componentWillReceiveProps(nextProps) {
    if(!is(nextProps.$allInfo.get('info'), this.props.$allInfo.get('info')) &&  'success' === nextProps.$allInfo.get('status')){ //因该为success
      this.setState({
        shopInfo: nextProps.$allInfo.get('info').toJS()
      })
    }
    if(!is(nextProps.$allInfo.getIn(['productList', 'list']), this.props.$allInfo.getIn(['productList', 'list'])) &&  'success' === nextProps.$allInfo.getIn(['productList','status'])){ //因该为success
        this.setState({
          productList: nextProps.$allInfo.getIn(['productList', 'list']).toJS()
        })
    }
    if(nextProps.token !== this.props.token){
      this.setState({
        isOn: nextProps.token !== '' && nextProps.token
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
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={'rgba(0,0,0,0)'} translucent={true}/>
        {
          !this.state.loadPage && (
            this.state.loadPageSuccess ? this.centerPage() :
              <BlankPage visable={true} type={'error'} loadAgain={() => this.fetchBaseInfo()}/>
          )
        }
        <TouchableWithoutFeedbackD onPress={() => this.props.navigation.goBack()}>
          <View style={styles.leftBox}>
            <Image
              style={{tintColor: this.state.loadPageSuccess ? styleConsts.white : styleConsts.darkGrey, width: 9, height: 16}}
              source={require('../../components/HeaderBar/imgs/goback.png')}
            />
          </View>
        </TouchableWithoutFeedbackD>

        <View style={{
          flex: 1,
          width: this.state.visible ? '100%': 0,
          height: this.state.visible? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage
            visable={this.state.visible}
            type={'loading'}
          />
        </View>
      </View>
    )
  }
  centerPage = () => {
    const {supplyShopName, isCollected, collection, logoUrl } = this.state.shopInfo.homeInfo;
    let { productList, loadMore, loadPro } = this.state;

    return (
      <View style={styles.center}>
        <View style={styles.shopBg}>
          <Image style={styles.bgImg} source={require('./imgs/shopBg.png')} />
        </View>
        <View style={styles.bannerTop}>
          <TouchableWithoutFeedbackD onPress={() => this.props.goToShopInfo()}>
            <View style={styles.shopLogo}>
              <Image style={[styles.logo,{position: 'absolute'}]} source={require('../../imgs/loadImage.png')} />
              {
                logoUrl !== '' ?
                  <CachedImage
                    style={[styles.logo,{position: 'absolute'}]}
                    source={{uri: getImgUrl(logoUrl)}}
                  /> :
                  <Image
                    style={[styles.logo,{position: 'absolute'}]}
                    source={require('../../imgs/noShopLogo.png')} />
              }
            </View>
          </TouchableWithoutFeedbackD>
          <TouchableWithoutFeedbackD onPress={() => this.props.goToShopInfo()}>
            <View style={styles.topTxt}>
              <Text style={styles.shopName}>
                {supplyShopName}
              </Text>
              <View style={styles.topBtTxt}>
                <Text style={[styles.fuTitle]}>{I18n.t('collect')}{collection}</Text>
              </View>
            </View>
          </TouchableWithoutFeedbackD>
          <TouchableWithoutFeedbackD delayTime={200} onPress={() => this.changeCollected()}>
            <View style={[styles.grtBtn, 0 != isCollected && {backgroundColor:'rgba(255,255,255,0.8)'}]}>
              {0 == isCollected && <Image
                style={{height: 12, width: 12.5}}
                source={ getShopIMg }
              />}
              <View style={{minWidth: 37.5,paddingLeft: 5, justifyContent: 'center', alignItems:'center', paddingRight: 7.5}}>
                <Text style={[styles.grtTxt,0 != isCollected && {color: styleConsts.btnBg}]}>{ 0 == isCollected || !this.state.isOn ? I18n.t('collect') : I18n.t('collected')}</Text>
              </View>
            </View>
          </TouchableWithoutFeedbackD>
        </View>
        <View style={[styles.whitePage]}>
          <PullFlatList
             legacyImplementation={false}
             data={productList}
             horizontal={false}
             numColumns={2}
             renderItem={({ item, index }) => this.renderPorList(item, index)}
             refreshing={loadPro.loading}
             onRefresh={(resove) => this.fetchProductList(1,null,resove)}
             onEndReachedThreshold={0}
             onEndReached={(resove) => loadMore && this.fetchProductList(null,true,resove)}
             keyExtractor={({ productID }) => productID}
             ListEmptyComponent={() => this.emptyComponent()}
             ListFooterComponent={() => this.listFooter(productList.length)}
             canLoadMore={loadMore}
         />
        </View>
      </View>
    )
  }
  renderPorList = (item) => {
    return (
      <TouchableHighlightD style={styles.proList} onPress={() => this.props.goToProductInfo(item.productID)} activeOpacity={1} underlayColor={styleConsts.lightGrey}>
        <View >
          <View style={styles.proIMgBox}>
            <Image
              style={styles.proIMg}
              source={{uri: getImgUrl(item.imgUrl, 165)}}
            />
          </View>
          <View style={styles.proNameBox}>
            <Text numberOfLines={2} style={styles.productName}>{item.productName}</Text>
          </View>

          { item.specs[0] &&
            <View style={styles.proBottom}>
              <ChangePrice price={item.specs[0].productPrice}/>
              <Text style={styles.productSpec}  numberOfLines={1}>
                {`${item.specs[0].specContent}/${item.specs[0].saleUnitName}`}
              </Text>
            </View>
          }
        </View>
      </TouchableHighlightD>
    )
  }
  emptyComponent = () => {
    return (
      <BlankPage
        visable={this.state.productList.length === 0 && this.state.loadPro.hasLoad}
        type={this.state.loadPro.loadSuccess ? 'blank' : 'error'}
        loadAgain={() => this.setState({visible: true,},() => this.fetchProductList())}
      >
        <Text style={{color: styleConsts.grey}}> {I18n.t('thisShopNoProduct')}</Text>
      </BlankPage>
    )
  }
  listFooter = (len) => {
    if(len === 0){
      return <View/>
    }
    if(this.state.loadMore){ // 允许加载更多
      return(
        <View style={{height: 70, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: -70}}>
          <Image source={require('../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    let nowHeight = Math.ceil(len / 2) * 277;
    let cHeight =  nowHeight - (height - 130 );
    return (
      <View style={{height: 90, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: cHeight >= 0 ? -90 :  cHeight-45}}>
        <Text style={{fontSize: styleConsts.h3, color: styleConsts.middleGrey}}>{
            I18n.t('noMoreData')
        }</Text>
      </View>
    )
  }
  fetchBaseInfo = () => {
    let purchaserID = this.props.purchaserID;
    this.setState({
      visible: true,
    })
    this.props.getBaseInfo({
      data: {
        // purchaserID: (purchaserID == '' || !purchaserID) ? -1 : purchaserID,
        purchaserID: 0,
        supplyGroupID: this.mianInfo.supplyGroupID,
        supplyShopID: this.mianInfo.supplyShopID,
      },
      success: () => {
        this.setState({
          visible: false,
          loadPage: false,
          loadPageSuccess: true,
        })
      },
      fail: (res) => {
        this.setState({
          visible: false,
          loadPage: false,
          loadPageSuccess: false,
        });
      },
      timeout: () => {
        this.setState({
          visible: false,
          loadPage: false,
          loadPageSuccess: false,
        })
      },
    })
  }
  fetchProductList = (page ,more,resove) => {
    if(more && !this.state.loadPro.loadMore) return;
    let loadPro = this.state.loadPro;
    if(page === 1 && loadPro.hasLoad) {
      loadPro.loading = true;
      this.setState({ loadPro })
    }
    this.toast && Toast.hide(this.toast)
    let purchaserID = this.props.purchaserID
    this.props.getProductListInfo({
      data: {
         pageNo: page || this.state.productList.length / 20 + 1, //	页码	number
         pageSize: 20,                                           // 页面大小	number
         purchaserID: (purchaserID == '' || !purchaserID) ? -1 : purchaserID,
         supplyGroupID: this.mianInfo.supplyGroupID,
         supplyShopID: this.mianInfo.supplyShopID,
      },
      success: (res) => {
        loadPro.hasLoad = true;
        loadPro.loadSuccess = true;
        loadPro.loading = false;
        if(!(res.data instanceof Array) || res.data.length < 20){
          loadPro.loadMore = false;
        } else{
          loadPro.loadMoreTxt = 'loadingMoreData';
          loadPro.loadMore = true;
        }
        this.setState({
          loadPro,
          visible: false
        },() => {
          setTimeout(() => this.setState({
            loadMore: res.data instanceof Array && res.data.length >= 20
          }))
        })
        if(resove instanceof Function) {
          resove('success');
        }
      },
      fail: (res) => {
        if(loadPro.hasLoad && !this.state.visible) this.toast = toastShort(I18n.t('loadingFail'));
        loadPro.hasLoad = true;
        loadPro.loading = false;
        loadPro.loadSuccess = false;
        this.setState({
          loadPro,
          visible: false
        });
        if(resove instanceof Function) {
          resove('fail');
        }
      },
      timeout: () => {
        if(loadPro.hasLoad && !this.state.visible) this.toast = toastShort(I18n.t('timeout'));
        loadPro.hasLoad = true;
        loadPro.loading = false;
        loadPro.loadSuccess = false;
        this.setState({
          loadPro,
          visible: false
        });
        if(resove instanceof Function) {
          resove('timeout');
        }
      },
    })
  }
  changeCollected = () => { // 改变收藏状态
    if( this.props.token === '' || !this.props.token){
      return this.props.goToLogin()
    }
    this.toast && Toast.hide(this.toast)
    if('pending' === this.props.$allInfo.get('collectStatus') || 'pending' === this.props.$allInfo.get('cancelCollStatus') || this.collStart){
      return this.toast = toastShort(I18n.t('overoperate'))
    }
    this.collStart = true;
    let isCollected = this.state.shopInfo.homeInfo.isCollected == 0
    let data = { // 默认进行取消
      purchaserID: this.props.purchaserID,
      supplyShopID: this.mianInfo.supplyShopID,
    }
    if(isCollected){ // 进行加入收藏
      const {categoryID, logoUrl, supplyGroupID, supplyShopID, supplyShopName } = this.state.shopInfo.homeInfo;
      data = {
        categoryID,//	主营品类id	string
        logoUrl, //		店铺logo地址	string
        purchaserID: this.props.purchaserID,//		采购商ID	number
        supplyGroupID,//		供应商集团ID	number
        supplyShopID,//		供应商店铺ID	number
        supplyShopName,//		供应商店铺名称	string
      }
    }
    // 发出请求
    this.props.changeCollected(isCollected, {
      data,
      success: () => {
        let shopInfo = this.state.shopInfo;
        if(isCollected){ // 加入收藏成功
          shopInfo.homeInfo.isCollected = 1;
        } else{ // 取消收藏成功
          shopInfo.homeInfo.isCollected = 0;
        }
        this.setState({
          shopInfo,
        }, () => this.collStart = false)
      },
      fail: (res) => {
        this.toast && Toast.hide(this.toast)
        if(res && res.response && res.response.message && '' !== res.response.message){
          this.toast = toastShort(res.response.message)
        }else{
          this.toast = toastShort(I18n.t(isCollected ? 'addcollectStatusFail': 'removecollectStatusFail'))
        }

        this.collStart = false
      },
      timeout: () => {
        this.toast && Toast.hide(this.toast)
        this.toast = toastShort(I18n.t(isCollected ? 'addcollectStatusTimeout': 'removecollectStatusTimeout'))
        this.collStart = false
      }
    })
  }
}
ShopCenter.defaultProps = {};

ShopCenter.PropTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  center: {
    paddingTop: 65,
    position: 'relative',
    flex: 1,
  },
  shopBg: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  bgImg: {
    width,
    height: 150,
  },
  bannerTop: {
    height: 80,
    paddingLeft: 15,
    paddingBottom: 5,
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  shopLogo: {
    height: 55,
    width: 55,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  grtBtn: {
    flexDirection: 'row',
    height: 25,
    alignItems: 'center',
    backgroundColor: styleConsts.btnBg,
    borderRadius: 12.5,
    paddingRight: 12.5,
    paddingLeft: 7.5,
    position: 'absolute',
    overflow: 'hidden',
    right: -12.5,
  },
  grtTxt: {
    color: styleConsts.white,
    fontSize: styleConsts.H5,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  topTxt: {
    flex: 1,
    paddingLeft: 15,
  },
  topBtTxt: {
    flexDirection: 'row',
    marginTop: 15,
  },
  shopName: {
    fontSize: styleConsts.H3,
    color: styleConsts.white,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  fuTitle: {
    fontSize: styleConsts.H5,
    color: styleConsts.white,
    backgroundColor: 'rgba(0,0,0,0)',
  },
  whitePage: {
    paddingTop: 15,
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 10,
  },
  proList: {
    marginLeft: 5,
    width: ( width - 15 ) / 2,
    marginBottom: 5,
    paddingTop: 7.5,
    paddingLeft: 7.5,
    paddingRight: 7.5,
    paddingBottom: 10,
    backgroundColor: styleConsts.white,
  },
  proIMgBox: {
    height: 165,
    width: '100%',
    alignItems: 'center',
    overflow: 'hidden',
  },
  proIMg: {
    width: 165,
    height: 165,
  },
  proBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  proNameBox: {
    height: 30,
    marginTop: 12,
    marginBottom: 13.5,
  },
  productName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  productSpec: {
    color: styleConsts.grey,
    fontSize: styleConsts.H4,
    maxWidth: 80,
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
    $allInfo: state.shopCenter.get('someOneInfo'),
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    token: state.user.get('token'),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    goToShopInfo: (opts) => { // 去店铺详情
      dispatch({type: NAV_TO_SHOPCENTER_INFO_PAGE, payload: opts})
    },
    getBaseInfo: (opts) => { // 请求基本信息
      dispatch(getShopInfo(opts))
    },
    getProductListInfo: (opts) => { // 请求店铺商品
      dispatch(getProductListFromShopInfo(opts))
    },
    changeCollected: (flag, opts) => {
      if(flag) {dispatch(changeCollectShopStatus(opts))} // 加入收藏
      else {dispatch(cancelCollectShopStatus(opts))} // 取消收藏
    },
    goToProductInfo: (opts) => {
      dispatch({type: SAVE_PRODUCT_ID, payload: opts})
      dispatch({type: NAV_TO_PRODUCT_DETAIL_INFO})
    },
    goToLogin: () => {
      dispatch({type: NAV_TO_LOGIN_SCENE})
    },
    cancelFetch: () => {
      dispatch(getProductListFromShopInfoCancel())
      dispatch(getShopInfoCancel())
    }
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ShopCenter)
