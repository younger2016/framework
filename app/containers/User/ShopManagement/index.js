// 门店管理首页

import React,{PropTypes} from 'react'
import { ScrollView, View, Text, StyleSheet, Image, StatusBar, FlatList } from 'react-native';
import { connect } from 'react-redux'
import { styleConsts } from '../../../utils/styleSheet/styles'
import I18n from 'react-native-i18n';
import HeaderBar from '../../../components/HeaderBar'
import Dimensions from 'Dimensions';
import Swipeout from 'react-native-swipeout'
import {
  NAV_TO_SHOPMANEGEMENT_ADD_SHOP
} from '../../../redux/actions/nav.action'
import {
  getSotresList,
  deleteSomeOneStores,
  SET_MAININFO_TO_STORES,
  DELETE_STORES_CENTER_SYNC,
  getSotresListCancel,
} from '../../../redux/actions/storesCenter.action'
import { getGlobalInfo} from '../../../redux/actions/user.action'
import { TouchableWithoutFeedbackD } from '../../../components/touchBtn'
import BlankPage from '../../../components/BlankPage'
import Toast from 'react-native-root-toast';
import { toastShort } from '../../../components/toastShort'
import DeleteModal from '../../../components/DeleteModal';
import { is } from 'immutable'
import {getImgUrl} from '../../../utils/adapter'
const loadImage = require('../../../imgs/loadImage.png');
const {width, height} = Dimensions.get('window');
import { PullFlatList } from '../../../components/PullList';

// 门店营业状态(1-正常营业，0-暂停营业)
const SHOP_STATUS_NORMAL_BUSINESS = 1;
const SHOP_STATUS_STOP_BUSINESS = 0;

class ShopManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showIndex: -1,
      loading: false,
      hasLoad: false,
      loadingSuccess: false,
      shops: [],
      visible: true,
      loadMore: false,
      showModal: false,     // 删除提示框是否显示，默认不显示
      deleteShop: {         // 当前要删除的门店信息
        shopName: '',
        shopID: '',
      },
      deleteShopIndex: -1,  // 当前要删除门店在列表中的下标
    }
  }
  componentDidMount() {
    this.fetchList(1)
    // 获取门店
    /*const storesList = this.props.$storesCenter.get('storesList').toJS()
    if (!storesList.initialized) {
      this.fetchList(1)
    } else {
      this.setState({
        shopList: storesList.list,
      }, () => {
        this.filterShopList()
      })
    }*/
  };
  componentWillReceiveProps(nextProps) {
    if(nextProps.$storesList.get('list') !== this.props.$storesList.get('list')){
      this.setState({
        shops: nextProps.$storesList.get('list').toJS()
      })
    }
    /*if (!Immutable.is(this.props.$storesList.get('storesList'), nextProps.$storesList.get('storesList'))) {
      const storesList = nextProps.$storesList.get('storesList').toJS()
      if ('success' === storesList.status) {
        this.setState({
          shops: storesList.list,
        })
      }
    }*/
  }
  componentWillUnmount() {
    this.setState({
      visible: false,
    });
    this.props.rest();
    // 查看同步
    if(this.props.sync){ // 拉缓存
      this.props.fetchGlobalInfo({
        data: {
          token: this.props.token,
          version: this.props.version,
        },
        success: (res) => {
          this.props.deletesync()
        },
        fail: (res) => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
        }
      })
    }
  }
  render() {
    let { deleteShop, deleteShopIndex } = this.state;
    return (
      <View style={styles.container}>
        <HeaderBar
          title={I18n.t('shopManagement')}
          rightText={I18n.t('addmore')}
          cancelCallback={() => this.gotoStoresInfo('add')}
          navigation={this.props.navigation}
        />
        <PullFlatList
          legacyImplementation={false}
          data={this.state.shops}
          renderItem={({ item, index }) => this.renderShopList(item, index)}
          refreshing={this.state.loading}
          onRefresh={this.state.hasLoad ? (resove) => this.fetchList(1,resove) : null}
          keyExtractor={({ shopID }) => shopID}
          onEndReachedThreshold={0}
          onEndReached={this.state.loadMore ? (resove) => this.fetchList(null,resove) : null}
          ListFooterComponent={() => this.listFooter(this.state.shops.length)}
          ListEmptyComponent={() => this.listEmptyComponent()}
          canLoadMore={this.state.loadMore}
        />

        {/*删除弹窗*/}
        <DeleteModal
          visible={this.state.showModal}
          title={I18n.t('deleteStores')}
          tipTxt={`${'你确定将门店'}` + deleteShop.shopName + `${'删除嘛？'}`}
          leftBtnTxt={I18n.t('cancel')}
          rightBtnTxt= {I18n.t('confirm')}
          leftBtnCallBack={() => {
            this.setState({showModal: false});
          }}
          rightBtnCallBack={() => {
            this.setState({showModal: false});
            this.props.deleteThis({
              data: {
                purchaserID: this.props.purchaserID,
                shopID: this.state.deleteShop.shopID,
              },
              deletIndex: deleteShopIndex,
              success: () => {
                this.setState({
                  visible: false,
                })
              },
              fail: () => {
                this.toast && Toast.hide(this.toast)
                this.toast = toastShort(I18n.t('delStoresFail'))
                this.setState({
                  visible: false,
                })
              },
              timeout: () => {
                this.toast && Toast.hide(this.toast)
                this.toast = toastShort(I18n.t('delStoresTimeout'))
                this.setState({
                  visible: false,
                })
              },
            })
          }}
        />
      </View>
    )
  }
  // 空白页
  listEmptyComponent = () => {
    let { hasLoad, loadingSuccess } = this.state;
    return (
      <BlankPage
        visable={true}
        type={!hasLoad ? 'loading' : loadingSuccess ? 'blank': 'error'}
        loadAgain={() => this.setState({
          visible: true
        },() => {
          this.fetchList(1);
        })}>
        <View style={{alignItems: 'center'}}>
          <Text style={styles.noShopS}>{I18n.t('noShop')}</Text>
          <Text style={styles.noShopB}>{I18n.t('addFromRightBtn')}</Text>
        </View>
      </BlankPage>
    )
  };

  // 底部加载更多/没有更多
  listFooter = (len) => {
    if(len === 0){
      return <View/>
    }
    if(this.state.loadMore){ // 允许加载更多
      return(
        <View style={{height: 70, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: -70}}>
          <Image source={require('../../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    let nowHeight = len * 90;
    let cHeight =  nowHeight - (height);
    return (
      <View style={{height: 90, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: cHeight >= 0 ? -90 :  cHeight-45}}>
        <Text style={{fontSize: styleConsts.h3, color: styleConsts.middleGrey}}>{I18n.t('noMoreData')}</Text>
      </View>
    )
  };

  // 门店列表
  renderShopList = (item, index) => {
    return (
      <View style={styles.swipeout}>
        <Swipeout
          style={{ borderRadius: 5, backgroundColor: styleConsts.white, overflow: 'hidden', }}
          close={this.state.showIndex !== index}
          onOpen={() => { this.setState({ showIndex: index }) }}
          right={
            [
              {
                backgroundColor: styleConsts.mainColor,
                component:
                  <View style={{flex: 1,justifyContent: 'center', alignItems: 'center',}}>
                    <Text style={{  color: styleConsts.white, fontSize: styleConsts.H4,}}>{I18n.t('delete')}</Text>
                  </View>,
                underlayColor: styleConsts.mainColor,
                onPress: () => {
                  this.setState({
                    showModal: true,
                    deleteShop: item,
                    deleteShopIndex: index,
                  })
                },
              },
            ]
          }
        >
        <TouchableWithoutFeedbackD delayTime={300} onPress={() => this.gotoStoresInfo('edit', item, index)} >
          <View style={styles.shopList}>
            <View style={{position: 'relative',}}>
              <Image style={styles.shopLogo} source={loadImage} />
              <Image style={[styles.shopLogo,{ position: 'absolute', }]} source={{uri: getImgUrl(item.imagePath,80,80)}} />
              {/*只有暂停营业状态给出提示*/}
              {
                item.isActive === SHOP_STATUS_STOP_BUSINESS ?
                  <View style={styles.shopStatus}>
                    <Text style={{fontSize: styleConsts.H5,color: styleConsts.white,}}>暂停营业</Text>
                  </View> : null
              }
            </View>
            <View style={styles.rightTxt}>
              <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
              <Text style={styles.address} numberOfLines={2}>{item.shopAddress}</Text>
            </View>
          </View>
        </TouchableWithoutFeedbackD>
        </Swipeout>
      </View>
    )
  };

  // 请求门店列表
  fetchList = (page,resove) => {
    this.setState({
      loading: true,
    },() => {
      this.props.getSotresList({
        data: {
          purchaserID: this.props.purchaserID,
          pageNum: page || this.state.shops.length / 20 + 1,
          pageSize: 20,
        },
        success: (res) => {
          this.setState({
            loading: false,
            hasLoad: true,
            visible: false,
            loadingSuccess: true,
            loadMore: res.data instanceof Array && res.data.length >= 20
          })
          if(resove instanceof Function) {
            resove('success');
          }
        },
        fail: (err) => {
          this.toast && Toast.hide(this.toast)
          if(!this.state.visible) this.toast = toastShort(I18n.t('loadingFail'));
          this.setState({
            loading: false,
            hasLoad: true,
            visible: false,
            loadingSuccess: false,
          })
          if(resove instanceof Function) {
            resove('fail');
          }
        },
        timeout: () => {
          this.toast && Toast.hide(this.toast)
          if(!this.state.visible) this.toast = toastShort(I18n.t('timeout'));
          this.setState({
            loading: false,
            hasLoad: true,
            visible: false,
            loadingSuccess: false,
          })
          if(resove instanceof Function) {
            resove('timeout');
          }
        }
      })
    });
  };

  // 编辑/新增门店
  gotoStoresInfo = (mode, info, index) => {
    if('edit' === mode){
      this.props.setMainInfo({
        mode,
        info,
        index,
      })
    }
    this.props.goToAddShop()
  }
}

ShopManagement.defaultProps = {};
ShopManagement.PropTypes = {};

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
    borderRadius: 5,
    position: 'relative',
  },
  shopLogo: {
    width: 80,
    height: 80,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
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
  rightTxt: {
    flex: 1,
    paddingRight: 15,
    paddingLeft: 15,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
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
    color: styleConsts.darkGrey,
  },
  noShopB: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    marginTop: 18,
  },
});

const mapStateToProps = (state) => {
  return {
    $storesList: state.storesCenter.get('storesList'),
    // $storesList: state.storesCenter,
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    sync: state.storesCenter.get('sync'),
    version: state.user.get(['cache', 'data', 'version']),
    token: state.user.get('token'),
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    // 新增/编辑门店
    goToAddShop: () => {
      dispatch({ type: NAV_TO_SHOPMANEGEMENT_ADD_SHOP })
    },
    // 获取门店列表
    getSotresList: (opts) => {
      dispatch(getSotresList(opts))
    },
    // 删除门店
    deleteThis: (opts) => {
      dispatch(deleteSomeOneStores(opts))
    },
    setMainInfo: (opts) => {
      dispatch({ type: SET_MAININFO_TO_STORES, payload: opts })
    },
    deletesync: () => {
      dispatch({type: DELETE_STORES_CENTER_SYNC})
    },
    fetchGlobalInfo: (opts) => {
      dispatch(getGlobalInfo(opts))
    },
    rest: () => {
      dispatch(getSotresListCancel())
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ShopManagement)
