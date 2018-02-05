/**
 * 选择负责门店(多选)
 */
import React, { Component } from 'react';
import { connect } from  'react-redux';
import { StyleSheet, View, Text, FlatList, Image, TouchableWithoutFeedback } from 'react-native';
import Immutable from 'immutable';
import I18n from 'react-native-i18n';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import { toastShort } from '../../../../../components/toastShort';
import Toast from 'react-native-root-toast';
import HeaderBar from '../../../../../components/HeaderBar';
import { styleConsts } from '../../../../../utils/styleSheet/styles';
import BlankPage from '../../../../../components/BlankPage';
import {
  getSotresList,
} from '../../../../../redux/actions/storesCenter.action';
import { PullFlatList } from '../../../../../components/PullList';

/*// 门店营业状态(1-正常营业，9-暂停营业)
const SHOP_STATUS_NORMAL_BUSINESS = 1;
const SHOP_STATUS_STOP_BUSINESS = 9;*/


class SelectManageShop extends Component{
  constructor(props){
    super(props);
    this.state = {
      shopList: [],               // 获取的门店列表
      selectedShops: [],          // 选中的门店列表
      refreshing: false,
      pageNum: 1,
      pageSize: 20,
      moreLoading: false,
      visible:false,
      loadingSuccess: false,
      hasLoad: false,
    }
  }
  componentDidMount() {
    this.setState({
      visible: true,
    },() => {
      // 获取负责门店列表
      let storesList = Immutable.Map.isMap(this.props.$storesCenter.get('storesList')) ?
        this.props.$storesCenter.toJS().storesList : this.props.$storesCenter.storesList;
      if(!storesList.initialized) {
        this.fetchShopList();
      } else {
        let shopList = storesList.list;
        this.selectShops(shopList);
      }
    });
  }
  componentWillReceiveProps(nextProps){
    // 采购商门店列表
    if(!Immutable.is(this.props.$storesCenter.get('storesList'),nextProps.$storesCenter.get('storesList'))) {
      let storesList = Immutable.Map.isMap(nextProps.$storesCenter) ?
        nextProps.$storesCenter.toJS().storesList : nextProps.$storesCenter.storesList;
      if('success' === storesList.status){
        let shopList = storesList.list;
        this.selectShops(shopList);
      }
    }
  }
  render() {
    let { refreshing, moreLoading } = this.state;
    let shopList = JSON.parse(JSON.stringify(this.state.shopList));
    return (
      <View style={styles.container}>
        <HeaderBar
          title='选择负责门店'
          rightText='确定'
          navigation={this.props.navigation}
          cancelCallback={() => this.confirmSelectShops()}
        />
        <PullFlatList
          data={shopList}
          refreshing={refreshing}
          onRefresh={(resove) => this.uploadShopList(resove)}
          renderItem={ ({item,index}) => this.renderItem(item,index)}
          keyExtractor={({ shopID }) => shopID}
          onEndReachedThreshold={0}
          onEndReached={(resove) => this.fetchMoreShopList(resove)}
          ListFooterComponent={() => this.listFooter()}
          ListEmptyComponent={ () => this.renderNoEmplOrNetworkError()}
          canLoadMore={moreLoading}
        />
      </View>
    )
  }

  renderItem = (item,index) => {
    return (
      <TouchableWithoutFeedback onPress={ () => this.saveSelectShop(item,index) } key={item.shopID}>
        <View style={styles.item}>
          <Text style={[styles.txt,item.isSelected ? styles.activeTxt : {}]}>{item.shopName}</Text>
          <Image style={styles.img} source={ item.isSelected ? require('../../imgs/selected.png') : require('../../imgs/noSelect.png')} />
        </View>
      </TouchableWithoutFeedback>
    )
  };

  // 显示空白页/网络错误页
  renderNoEmplOrNetworkError = () => {
    let { hasLoad, loadingSuccess } = this.state;
    return (
      <BlankPage
        visable={true}
        type={!hasLoad ? 'loading' : loadingSuccess ? 'blank' : 'error'}
        loadAgain={() => {
          this.setState({
            visible: true,
          },() => {
            this.fetchShopList();
          })
        }}
      >
        <View style={{alignItems: 'center'}}>
          <Text style={styles.firstTxt}>哎呀，还没有门店列表呢</Text>
        </View>
      </BlankPage>
    )
  };

  // 保存选择负责的门店
  saveSelectShop = (item,index) => {
    let { shopList, selectedShops } = this.state;
    if(item.isSelected) {
      shopList[index].isSelected = false;
      // 如果当前这个门店在选中门店中要删除它
      selectedShops.forEach((selectShop,selectIndex) => {
        if(selectShop.shopID === item.shopID) {
          selectedShops.splice(selectIndex,1);
        }
      })
    } else {
      shopList[index].isSelected = true;
      selectedShops.push({
        shopID: item.shopID,
        shopName: item.shopName,
      });
    }
    this.setState({ selectedShops, shopList });
  };

  // 确定按钮
  confirmSelectShops = () => {
    let { selectedShops } = this.state;
    this.props.navigation.state.params.selectShopsCallBack && this.props.navigation.state.params.selectShopsCallBack(selectedShops);
    this.props.navigation.goBack();
  };

  // 请求门店列表
  fetchShopList = (currPageNum,resove) => {
    let { pageNum, pageSize } = this.state;
    return (
      this.props.getSotresList({
        data: {
          pageNum: currPageNum ? currPageNum : pageNum,
          pageSize: pageSize,
        },
        fail: (res) => {
          this.setState({
            refreshing: false,
            visible: false,
            hasLoad: true,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
          if(resove instanceof Function) {
            resove('fail');
          }
        },
        timeout: () => {
          this.setState({
            refreshing: false,
            visible: false,
            hasLoad: true,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
          if(resove instanceof Function) {
            resove('timeout');
          }
        },
        success: (res) => {
          this.setState({
            moreLoading: res.data.length >= pageSize,
          });
          if(resove instanceof Function) {
            resove('success');
          }
        }
      })
    )
  };

  // 下拉刷新门店列表
  uploadShopList = (resove) => {
    this.setState({
      refreshing: true,
    }, () => {
      this.fetchShopList(null,resove);
    });
  };

  // 上拉加载更多
  fetchMoreShopList = (resove) => {
    let { pageNum, pageSize, shopList, moreLoading } = this.state;
    if(moreLoading) {
      pageNum = Math.floor(shopList.length / pageSize) + 1;
      this.fetchShopList(pageNum,resove);
    }
  };

  // 底部加载和没有更多
  listFooter = () => {
    let { shopList, moreLoading } = this.state;
    // 允许加载更多
    if(moreLoading) {
      return (
        <View style={{height: 60, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../../../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    // 没有更多
    let cHeight = shopList.length * 50 - height;
    return (
      <View style={{height: 90, width: width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: cHeight >= 0 ? -90 : cHeight - 45}}>
        <Text style={{fontSize: styleConsts.H4, color: styleConsts.middleGrey}}>
          {I18n.t('noMoreData')}
        </Text>
      </View>
    );
  };

  // 新增、编辑员工时选择负责门店
  selectShops = (shopList) => {
    let selectedShops = this.props.navigation.state.params.selectShops;

    /*// 过滤出正常营业的门店
    let newShopList = shopList.filter((shop) => {
      return shop.shopStatus === SHOP_STATUS_NORMAL_BUSINESS;
    });*/

    if(selectedShops.length !== 0) {
      shopList.forEach( (shop) => {
        selectedShops.forEach( (selectShop) => {
          if(shop.shopID === selectShop.shopID) {
            shop.isSelected = true;
          }
        });
      });
    }
    this.setState({
      shopList,
      selectedShops,
      refreshing: false,
      visible: false,
      loadingSuccess: true,
      hasLoad: true,
    });
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  item: {
    width: width,
    height: 50,
    backgroundColor: styleConsts.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txt: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
  },
  activeTxt: {
    color: styleConsts.deepGrey,
  },
  img: {
    width: 13,
    height: 13,
  },
});

const mapStateToProps = (state) => {
  return {
    $storesCenter: state.storesCenter,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 获取负责门店列表
    getSotresList: (opts) => {
      dispatch(getSotresList(opts));
    },
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(SelectManageShop)