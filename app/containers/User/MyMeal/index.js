// 收藏的店铺

import React,{ PropTypes } from 'react'
import { ScrollView, View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux'
import { styleConsts } from '../../../utils/styleSheet/styles'
import I18n from 'react-native-i18n';
import HeaderBar from '../../../components/HeaderBar'
import Dimensions from 'Dimensions';
import { TouchableWithoutFeedbackD } from '../../../components/touchBtn'
import { NAV_TO_SHOPCENTER_MAIN_PAGE } from '../../../redux/actions/nav.action'
import BlankPage from '../../../components/BlankPage'
import Swipeout from 'react-native-swipeout'
import {
  getCollectShop,
  SET_MAININFO_TO_GET_SHOP_INFO,
  cancelCollectShopStatus,
  getCollectShopCancel
} from '../../../redux/actions/shopCenter.action'
import { is } from 'immutable'
import Toast from 'react-native-root-toast';
import { toastShort } from '../../../components/toastShort'
import {getImgUrl} from '../../../utils/adapter'
import { PullFlatList } from '../../../components/PullList';

const loadImage = require('../../../imgs/noShopLogo.png')
const {width, height} = Dimensions.get('window')

// 供应商门店停用-1，启用-0
const SUPPLY_SHOP_STOP_BUSINESS = 1;
const SUPPLY_SHOP_OPEN_BUSINESS = 0;

class MyMeal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      myMeals: [],
      first: false,
      visible: true,
      loading: false,
      hasLoad: false,
      loadingSuccess: false,
      moreLoading: false,
      pageNum: 1,
      pageSize: 20,
    }
  }
  componentDidMount() {
    // 获取收藏的店铺列表
    this.getList();
  };
  componentWillReceiveProps(nextProps) {
    if(!is(this.props.$collectShop.get('list'),nextProps.$collectShop.get('list'))){
      this.setState({
        myMeals: nextProps.$collectShop.get('list').toJS()
      })
    }
  }
  componentWillUnmount() {
    this.toast && Toast.hide(this.toast);
    this.props.rest()
  }
  render() {
    return (
      <View style={styles.container}>
        <HeaderBar
          title={I18n.t('myMeal')}
          cancelHide={true}
          navigation={this.props.navigation}
        />
        <PullFlatList
         legacyImplementation={false}
         data={this.state.myMeals}
         renderItem={({ item, index }) => this.renderShopList(item, index)}
         refreshing={this.state.loading}
         onRefresh={(resove) => this.updateShopList(resove)}
         keyExtractor={({ supplyShopID }) => supplyShopID}
         ListFooterComponent={() => this.listFooter(this.state.myMeals.length)}
         ListEmptyComponent={() => this.listEmptyComponent()}
         onEndReachedThreshold={0}
         onEndReached={(resove) => this.fetchMoreShopList(resove)}
         canLoadMore={this.state.moreLoading}
        />

        {/*加载*/}
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

  renderShopList = (item, index) => {
    return (
      <View style={styles.swipeout}>
        <Swipeout
          style={{ borderRadius: 5, overflow: 'hidden', }}
          close={this.state.showIndex !== index}
          onOpen={() => { this.setState({ showIndex: index }) }}
          right={
            [
              {
                backgroundColor: styleConsts.mainColor,
                component: <View style={{flex: 1,justifyContent: 'center', alignItems: 'center'}}>
                  <Text style={{  color: styleConsts.white, fontSize: styleConsts.H4,}}>{I18n.t('deleteMyMeal')}</Text>
                </View>,
                underlayColor: styleConsts.mainColor,
                onPress: () => {this.cancelCollected(item, index)},
              },
            ]
          }
        >
          <TouchableWithoutFeedbackD
            delayTime={300}
            onPress={() => item.isActive === SUPPLY_SHOP_OPEN_BUSINESS && this.props.goToShopCenter(item)}
          >
            <View style={styles.shopList}>
              <View style={[styles.shopLogo,{position: 'relative'}]}>
                {
                  item.logoUrl !== '' ?
                    <Image source={{uri: getImgUrl(item.logoUrl, 80, 80)}} style={styles.shopLogo} />
                    : <Image source={loadImage} style={[styles.shopLogo,{position: 'absolute'}]} />
                }
                {/*只有暂停营业状态给出提示*/}
                {
                  item.isActive === SUPPLY_SHOP_STOP_BUSINESS ?
                    <View style={styles.shopStatus}>
                      <Text style={{fontSize: styleConsts.H5,color: styleConsts.white,}}>暂停营业</Text>
                    </View> : null
                }
              </View>
              <View style={{height: 80, width: 0.5, backgroundColor: styleConsts.lightGrey}} />
              <View style={styles.rightTxt}>
                <Text style={styles.shopName} numberOfLines={1}>{item.supplyShopName}</Text>
                <Text style={styles.address} numberOfLines={2}>{I18n.t('mainSell')}: {item.category}</Text>
              </View>
            </View>
          </TouchableWithoutFeedbackD>
        </Swipeout>
      </View>
    )
  };

  listEmptyComponent = () => {
    return (
      <BlankPage
        visable={this.state.hasLoad}
        type={this.state.loadingSuccess ? 'blank': 'error'}
        loadAgain={() => this.setState({visible: true},() => this.getList())}
      >
        <View style={{alignItems: 'center'}}>
          <Text style={[styles.noShopS, {marginBottom: 15, color: styleConsts.deepGrey}]}>{I18n.t('blankNormal')}</Text>
          <Text style={styles.noShopS}>
            {I18n.t('noMyMeal')}
          </Text>
        </View>
      </BlankPage>
    )
  };

  listFooter = (len) => {
    if(len === 0){
      return <View/>
    }
    if(this.state.moreLoading){ // 允许加载更多
      return(
        <View style={{height: 60, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    let nowHeight = len * 90;
    let cHeight =  nowHeight - (height);
    return (
      <View style={{height: 90, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: cHeight >= 0 ? -90 :  cHeight-45}}>
        <Text style={{fontSize: styleConsts.h3, color: styleConsts.middleGrey}}>
          { I18n.t('noMoreData') }
        </Text>
      </View>
    )
  };

  // 获取收藏的店铺列表
  getList = (currPageNum,resove) => {
    let { pageNum, pageSize } = this.state;
    this.props.getCollectShop({
      data: {
        pageNo: currPageNum ? currPageNum : pageNum,
        pageSize: 20,
        purchaserID: this.props.purchaserID, // 采购商ID
      },
      success: (res) => {
        this.setState({
          loading: false,
          first: true,
          visible: false,
          loadingSuccess: true,
          hasLoad: true,
          moreLoading: res.data.length >= pageSize,
        });
        if(resove instanceof Function) {
          resove('success');
        }
      },
      fail: (res) => {
        this.setState({
          loading: false,
          first: true,
          visible: false,
          hasLoad: true,
        });
        if(resove instanceof Function) {
          resove('fail');
        }
      },
      timeout: () => {
        this.setState({
          loading: false,
          first: true,
          visible: false,
          hasLoad: true,
        });
        if(resove instanceof Function) {
          resove('timeout');
        }
      }
    })
  };

  // 下拉刷新店铺劣币哦啊
  updateShopList = (resove) => {
    this.setState({
      loading: true,
    },() => {
      this.getList(null,resove);
    });
  };

  // 上拉加载更多
  fetchMoreShopList = (resove) => {
    let { pageNum, pageSize, moreLoading, myMeals } = this.state;
    if(moreLoading) {
      pageNum = Math.floor(myMeals.length / pageSize) + 1;
      this.getList(pageNum,resove);
    }
  };

  // 改变收藏状态
  cancelCollected = (item, index) => {
    this.toast && Toast.hide(this.toast)
    if('pending' === this.props.cancelCollStatus || this.collStart){
      return this.toast = toastShort(I18n.t('overoperate'))
    }
    this.setState({
      visible: true,
    });
    this.collStart = true;
    // 发出请求
    this.props.cancelCollected({
      data: {
        purchaserID: this.props.purchaserID,
        supplyShopID: item.supplyShopID,
      },
      deletIndex: index,
      success: () => {
        this.collStart = false
        this.setState({
          visible: false,
        })
      },
      fail: () => {
        this.toast && Toast.hide(this.toast)
        this.toast = toastShort(I18n.t('removecollectStatusFail'))
        this.collStart = false
        this.setState({
          visible: false,
        })
      },
      timeout: () => {
        this.toast && Toast.hide(this.toast)
        this.toast = toastShort(I18n.t('removecollectStatusTimeout'))
        this.collStart = false
        this.setState({
          visible: false,
        })
      }
    })
  }

}
MyMeal.defaultProps = {};

MyMeal.PropTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  swipeout: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
  },
  shopList: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: styleConsts.white,
    position: 'relative',
    borderRadius: 5,
  },
  shopStatus: {
    width: 80,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderBottomLeftRadius: 5,
  },
  shopLogo: {
    width: 80,
    height: 80,
    borderBottomLeftRadius: 5,
    borderTopLeftRadius: 5,
  },
  rightTxt: {
    flex: 1,
    paddingRight: 15,
    paddingLeft: 15,
  },
  shopName: {
    marginTop: 15,
    marginBottom: 10,
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  address: {
    fontSize: styleConsts.H5,
    color: styleConsts.darkGrey,
    lineHeight: 18,
  },
  noShopS: {
    fontSize: styleConsts.H4,
    color: styleConsts.middleGrey,
  },
});

const mapStateToProps = (state) => {
  return {
    $collectShop: state.shopCenter.get('collectShop'),
    cancelCollStatus: state.shopCenter.getIn(['someOneInfo', 'cancelCollStatus']),
    navReducer: state.nav,
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    goToShopCenter: (opts) => {
      dispatch({type: SET_MAININFO_TO_GET_SHOP_INFO,  payload: opts}) // 把店铺主要信息存起来
      dispatch({type: NAV_TO_SHOPCENTER_MAIN_PAGE})
    },
    // 获取收藏门店列表
    getCollectShop: (opts) => {
      dispatch(getCollectShop(opts))
    },
    cancelCollected: (opts) => { // 取消收藏
      dispatch(cancelCollectShopStatus(opts))
    },
    rest: () => {
      dispatch(getCollectShopCancel())
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(MyMeal)
