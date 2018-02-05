/**
 * 订单
 */
import React, { Component } from 'react'
import { TextInput, View, StyleSheet, Button, Image, Text, Platform, TouchableWithoutFeedback } from 'react-native'
import { connect } from 'react-redux'
import Immutable from 'immutable'
import Dimensions from 'Dimensions';
import { styleConsts } from '../../utils/styleSheet/styles'
import HeaderWithShopInfo from '../../components/HeaderWithShopInfo'
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import  I18n  from 'react-native-i18n'
import ChangePrice from '../../components/ChangePrice'
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import { NAV_TO_BILLS_DETAIL_PAGE, NAV_TO_CHECK_PRODUCT_PAGE, NAV_TO_USER_SCREEN, NAV_TO_SHOPCENTER_MAIN_PAGE} from '../../redux/actions/nav.action'
import { fetchBillListAC , changeBillStatusAC, SET_NOFICTION_TO_ORDERLIST} from '../../redux/actions/orderCenter.action'
import { changeCartInfoAC } from '../../redux/actions/cart.action'
import { SET_MAININFO_TO_GET_SHOP_INFO } from '../../redux/actions/shopCenter.action'
import InputModal from '../../components/InputModal'
import BlankPage from '../../components/BlankPage'
import {getImgUrl} from '../../utils/adapter'
import {PullFlatList} from '../../components/PullList'
import {setTask} from '../../utils/deskTask'
const {width, height} = Dimensions.get('window')
const billStatus = {
  '0': 'all',
  '1': 'haveNotGetOrder',
  '2': 'waitSendProduct',
  '3': 'waitGiveProduct',
  '6': 'hasedGive',
  '7': 'hasCanceled',
};
const btnStatus = ['cancelBill', 'checkProduct', 'buyAgain'];

class BillsInfoPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data : [],
      shopID: '', //当前门店
      spinVisible: false, //中间loading状态
      showInput: false,   //显示输入拒绝理由
      loading: false, //下拉刷新loading状态
      inspectionNum: [], //验货数量
      currentStatus: this.props.navigation.state.params && this.props.navigation.state.params.index ?
        this.props.navigation.state.params.index  : 0, //传入的billStatus
      current: this.returnCurrent(),//传给后台的billStatus
      pageNum: 1,
      loadingFail: false, //加载是否失败
      bottomTxt: false,  //底部显示文字
      shopsArr: [] //当前负责门店列表
    };
    this.navCallBack = this.props.navigation.state.params && this.props.navigation.state.params.callback instanceof Function ?
                        this.props.navigation.state.params.callback : () => {}
  }

  componentDidMount() {
    this.notificationData = this.props.notification;
    let data = Immutable.Map.isMap(this.props.user) ? this.props.user.toJS().cache.data : this.props.user.cache.data;
    this.setState({
      shopsArr: data.purchaserShop
    });
    if(this.notificationData.status !== ''){ // 需要跳转
      this.props.setNotificton({status: ''})
      setTimeout(() => {
        this._scrollableTabView.goToPage(this.notificationData.status);

      })

    }
    else{
      if(data.purchaserShop && data.purchaserShop.length > 0){
        this.fetchList('did');
      }
      else{
        this.firstFail = true;
      }
    }
    if(this.notificationData.status === ''){ // 不是打开应用的通知， 正常走，若是就走跳转提前默认设置的跳转返回
      setTask(this.navToUserPage);
    }
    else if(!this.notificationData.opened && '' !== this.notificationData.status){
      setTask(this.notificationBack)
    }



  }
  componentWillReceiveProps(nextProps){
    //this.notificationData = nextProps.notification;
    let status = nextProps.notification.status
    if(status !== ''){
      // 接收本页数据
      this.notificationData = nextProps.notification;
      this.props.setNotificton({status: ''})
      if(this.state.currentStatus == status){
        this[`_pullFlatList${status}`].refreshfromYou()
      }
      else{
        this._scrollableTabView.goToPage(this.notificationData.status);
      }

    }
    if(this.props.orderCenter.get('billList') !== nextProps.orderCenter.get('billList') ){
      this.setState({
        data: nextProps.orderCenter.get('billList').toJS(),
        loading: false,
        bottomTxt: nextProps.orderCenter.get('billList').size !== 0 &&
          nextProps.orderCenter.get('billList').size % 10 == 0
      })
    }
    if(nextProps.navReducer.routes[nextProps.navReducer.index].routeName == 'Login'){
      this.setState({spinVisible: false})
    }
    if(this.props.user.getIn(['cache', 'data']) !== nextProps.user.getIn(['cache', 'data'])) {
      let data = Immutable.Map.isMap(nextProps.user) ? nextProps.user.toJS().cache.data : nextProps.user.cache.data;
      this.setState({
        shopsArr: data.purchaserShop
      }, () => {
        this.firstFail && this.fetchList('did');
        this.firstFail = false;
      })
    }
  }

  componentWillUnmount() { //卸载之前加载数量 -- lxz
    this.setState({
      spinVisible: false
    });
    this.navCallBack()
    setTask(null)
  }

  render() {
    let { data, currentStatus } = this.state;
    return (
      <View style={styles.container}>
        <HeaderWithShopInfo
          rigthHide={true}
          showAllShop={true}
          selectShop = {I18n.t('allShopBill')}
          navigation={this.props.navigation}
          onChange={(val)=>{
            //切换门店时重新请求
            this.setState({
              shopID: val.selectShop.shopID,
              spinVisible: true
            }, () => {
              if(val.hasChanged !== false){
                let thisData = {
                  purchaserID: this.props.user.getIn(['userInfo', 'purchaserID']),
                  pageNum: 1,
                  pageSize: 10
                };
                if(this.state.current){
                  thisData = Object.assign({subBillStatus: this.state.current}, thisData)
                }
                if(this.state.shopID !== '000'){
                  thisData = Object.assign({shopID: this.state.shopID}, thisData)
                }
                this.fetchListFunc(thisData, 'did');
              }
            })
          }}
          flag='order'
          mySelefBack={
            () => {
              if(!this.notificationData.opened){ // 不是打开应用的通知， 正常走，若是就走跳转提前默认设置的跳转返回
                if(this.notificationData.status === ''){ // 不是打开通知进来的
                    this.navToUserPage();
                }else{
                    let routes = this.props.navReducer.routes
                    if(routes[routes.length - 2].routeName === 'Login'){ // 判断是否是登陆进来
                      this.props.navigation.goBack(routes[routes.length - 2].key)
                    }
                    else{
                        this.props.navigation.goBack();
                    }

                }

              }
              else{ //是打开应用的通知.,将会去到首页
                  this.props.navigation.goBack();
              }
            }
          }
        />
        <ScrollableTabView
          initialPage={currentStatus}
          ref={(ref) => this._scrollableTabView = ref}
          onChangeTab={(a) => {
            this.setState({
              current: Object.keys(billStatus).find((item) => I18n.t(billStatus[item]) == a.ref.props.tabLabel),
              data: [],
              spinVisible: true,
            }, () => {
              //切换订单状态时重新请求
              let thisData = {
                purchaserID: this.props.user.getIn(['userInfo', 'purchaserID']),
                pageNum: 1,
                pageSize: 10
              };
              if(this.state.current && this.state.current !== '0'){
                thisData = Object.assign({subBillStatus: this.state.current}, thisData)
              }
              if(this.state.shopID && this.state.shopID !== '000'){
                thisData = Object.assign({shopID: this.state.shopID}, thisData)
              }
              this.fetchListFunc(thisData, 'did');
            })
          }}
          renderTabBar={() =>
            <DefaultTabBar
              activeTextColor={styleConsts.mainColor}
              inactiveTextColor={styleConsts.grey}
              underlineStyle={{height: 1, backgroundColor:styleConsts.mainColor }}
              style={{backgroundColor: styleConsts.white, height: 45, borderWidth: 0}}
              textStyle={{ fontWeight: 'normal'}}
              tabStyle={{height: 45, paddingBottom: 0}}
              tabs={Object.keys(billStatus).sort().map((key) => I18n.t(billStatus[key]))}
            />
          }
        >
          {
            Object.keys(billStatus).sort().map((key) => I18n.t(billStatus[key])).map((bill, index) => {
              return (
                <PullFlatList
                  key={bill}
                  ref={(ref) => this[`_pullFlatList${index}`] = ref}
                  keyExtractor={(item) => item.subBillID}
                  tabLabel={bill}
                  legacyImplementation={false}
                  data={data}
                  refreshing={this.state.loading}
                  canLoadMore={this.state.bottomTxt}
                  onRefresh={(resove)=> {
                    this.fetchList('', resove)
                  }}
                  onEndReachedThreshold={0}
                  onEndReached={(resove) => {
                    this.getMoreList(resove)
                  }}
                  ListEmptyComponent={this.renderNothing}
                  renderItem={this.renderBillItem}
                  ListFooterComponent={() => {
                    let nowHeight = data.length * 151;
                    let cHeight =  nowHeight - (height - styleConsts.headerHeight - 35);
                    return Platform.OS == 'ios' ?
                      <View style={{height: 45, justifyContent: 'center', bottom: cHeight >= 0 ? - 45 :  cHeight- 22.5}}>
                        <Text style={{textAlign: 'center', color: styleConsts.grey, fontSize: styleConsts.H4}}>
                          {this.state.bottomTxt? '加载中...': '崩拽了,见底儿了'}
                        </Text>
                      </View>
                      : null
                  }}
                />
              )
            })
          }
        </ScrollableTabView>
        <View style={{
          flex: 1,
          width: this.state.spinVisible ? '100%': 0,
          height: this.state.spinVisible? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage
            visable={this.state.spinVisible}
            type={'loading'}
          />
        </View>
        {
          this.state.showInput ?
            <InputModal
              cancel={() => this.setState({ showInput: false }, () => {
                if(this.notificationData.status === ''){ // 不是打开应用的通知， 正常走，若是就走跳转提前默认设置的跳转返回
                  setTask(this.navToUserPage);
                }
                else if(!this.notificationData.opened && '' !== this.notificationData.status){
                  setTask(this.notificationBack)
                }
              })}
              confirm={(val) => {
                this.cancelBill(this.state.subBillID, val);
                if(this.notificationData.status === ''){ // 不是打开应用的通知， 正常走，若是就走跳转提前默认设置的跳转返回
                  setTask(this.navToUserPage);
                }
                else if(!this.notificationData.opened && '' !== this.notificationData.status){
                  setTask(this.notificationBack)
                }
              }}
            />:null
        }
      </View>

    )
  }
  returnCurrent = () => {
    if(this.props.navigation.state.params && this.props.navigation.state.params.index ){
      if(this.props.navigation.state.params.index == 4 || this.props.navigation.state.params.index == 5){
        return this.props.navigation.state.params.index + 2
      }
      return this.props.navigation.state.params.index
    }
    return 0
  };
  renderBillItem = ({item}) => {
    return (
      <View style={styles.billItem} key={item.subBillID}>
        <TouchableWithoutFeedback onPress={() => {
          this.props.goToShopCenter({
            purchaserID: this.props.user.getIn(['userInfo', 'purchaserID']),
            supplyGroupID	: item.groupID,
            supplyShopID: item.supplyShopID
          })
        }
        }>
          <View style={styles.flexRow}>
            <View style={styles.supplierName}>
              <Image style={{width: 13, height: 13}} source={require('../CommitBill/imgs/shops.png')}/>
              <Text style={{color: styleConsts.moreGrey, fontSize: styleConsts.H3, marginHorizontal: 10}}>{item.supplyShopName}</Text>
              <Image style={{width: 6, height: 12}} source={require('../../imgs/rightArrow.png')}/>
            </View>
            <Text style={styles.billStatus}>{I18n.t(billStatus[Object.keys(billStatus).find((status)=> status.indexOf(`${item.subBillStatus}`) !== -1)])}</Text>
          </View>
        </TouchableWithoutFeedback>

        <TouchableWithoutFeedback onPress={()=>this.navToBillDetail(item)}>
          <View style={styles.productBox}>
            {this.renderProducts(item.detailList)}
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.flexRow}>
          <View style={styles.moneyBox}>
            <Text style={{color: styleConsts.darkGrey, marginRight: 5, fontSize: styleConsts.H5}}>
              {I18n.t('subtotal')}:
            </Text>
            <ChangePrice price={item.totalAmount} color={styleConsts.darkGrey} width={'auto'}/>
          </View>
          {
            item.subBillStatus == 2 ? null :
              <TouchableWithoutFeedback onPress={() => this.doSomething(item)}>
                <View style={styles.button}>
                  <Text style={styles.buttonTxt}>{
                    I18n.t(item.subBillStatus == 1 ? btnStatus[0] :
                      item.subBillStatus == 3 ? btnStatus[1] : btnStatus[2])
                  }</Text>
                </View>
              </TouchableWithoutFeedback>
          }

        </View>

      </View>
    )
  };
  navToUserPage = () => {
    if(this.props.$tabNav.toJS().index !== 3){
      this.props.navigation.dispatch({routeName:"User",type:"Navigation/NAVIGATE"})
    }
    this.props.navigation.goBack();
  }
  notificationBack = () => { // 处理有通知栏的返回
    let routes = this.props.navReducer.routes
    if(routes[routes.length - 2].routeName === 'Login'){ // 判断是否是登陆进来
      this.props.navigation.goBack(routes[routes.length - 2].key)
    }
    else{
        this.props.navigation.goBack();
    }
  }
  cancelBill = (subBillID, val) => {
    let data = {
      subBillIds: subBillID,
      flag: 1,
      actionType: 3,
      canceler: 1,
    };
    if(val !== '' && val !== undefined){
      data.cancelReason = val
    }
    this.setState({
      spinVisible: true,
      showInput: false
    }, () => {
      this.props.changeBillStatus({
        data: data,
        success: () => {
          this.setState({
            spinVisible: false,
          })
        },
        fail: (res) => {
          this.setState({
            spinVisible: false,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
        }
      })
    })

  }
  doSomething = (bill) => {
    if(3 == bill.subBillStatus){//验货
      this.props.navToCheckProduct({
        billInfo: bill.detailList,
        subBillID: bill.subBillID,
        callback: (val)=>{
          this.setState({inspectionNum: val})
        }
      })
    }else if(1 == bill.subBillStatus){//取消订单
      this.setState({
        showInput: true,
        canceler: 1,
        subBillID: bill.subBillID
      }, () => {
          setTask(()=>{
            this.setState({
             showInput: false
          }, () => {
            if(this.notificationData.status === ''){ // 不是打开应用的通知， 正常走，若是就走跳转提前默认设置的跳转返回
              setTask(this.navToUserPage);
            }else if(!this.notificationData.opened && '' !== this.notificationData.status){
              setTask(this.notificationBack)
            }
            });
        })
      })
    } else {//再次购买
      this.setState({
        spinVisible: true
      },()=>{
        this.props.changeCartInfo({
          data:{
            list: [
              {
                purchaserShopID: bill.shopID,
                purchaserShopName: bill.shopName,
                shopcarts: bill.detailList.map((product)=>{
                  return {
                    productID: product.productID,
                    productSpecID:	product.productSpecID,
                    shopcartNum: product.productNum,
                  }
                })
              }
            ],
            purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID']),
          },
          success: () => {
            this.setState({
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(I18n.t('addCartDone'));
          },
          fail: (res) => {
            this.setState({
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
          }
        })
      })
    }
  };
  navToBillDetail = (billInfo) => {
    this.props.navToBillDetail({
      billInfo: billInfo,
      inspectionNum: this.state.inspectionNum,
      doSomething: this.doSomething
    });
  };
  renderProducts = (bill) => {
    let newBill = JSON.parse(JSON.stringify(bill));
    const littleBill = newBill.length <= 4? newBill : newBill.splice(0, 5);
    return littleBill.map((list) => {
      return (
        <View key={`${list.detailID}`}>
          <Image style={styles.imgs} source={{uri: getImgUrl(list.imgUrl, 60)}} />
          <View style={styles.productNum}>
            <Text style={{color: styleConsts.white, fontSize: styleConsts.H5}}>×{list.subBillStatus == 6 ? list.inspectionNum : list.adjustmentNum}</Text>
          </View>
        </View>
      )
    })
  };
  fetchList = (type, resove) => {
    let thisData = {
      purchaserID: this.props.user.getIn(['userInfo', 'purchaserID']),
      pageNum: 1,
      pageSize: 10
    };
    if(this.state.current && this.state.current!== '0'){
      thisData = Object.assign({subBillStatus: this.state.current}, thisData)
    }
    if(this.state.shopID !== '000' && this.state.shopID !== ''){
      thisData = Object.assign({shopID: this.state.shopID}, thisData)
    }
    this.setState({
      [type == 'did'?'spinVisible':'loading']: true,
    }, () => {
      this.fetchListFunc(thisData, type, resove)
    })
  };
  getMoreList = (resove) => {
    if(this.state.data.length > 0){
      let pageNo = 1;
      if(this.state.data.length % 10 == 0 && this.state.data.length !== 0 && this.state.bottomTxt){
        pageNo = this.state.data.length / 10 +1;
        let thisData = {
          purchaserID: this.props.user.getIn(['userInfo', 'purchaserID']),
          pageNum: pageNo,
          pageSize: 10
        };
        if(this.state.current && this.state.current!== '0'){
          thisData = Object.assign({subBillStatus: this.state.current}, thisData)
        }
        if(this.state.shopID !== '000'){
          thisData = Object.assign({shopID: this.state.shopID}, thisData)
        }
        this.fetchListFunc(thisData, '', resove, (res) => {
          if(resove instanceof Function){
            resove('success')
          }
          let {bottomTxt} = this.state;
          if(Array.isArray(res.data)){
            bottomTxt = <View style={{height: 70, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: -70}}>
              <Image source={require('../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
            </View>
          }else{
            bottomTxt = false
          }
          this.setState({
            spinVisible: false,
            pageNum: pageNo,
            bottomTxt
          })
        });
      }else{
        this.setState({
          bottomTxt: false
        });
      }
    }
  };
  fetchListFunc = (data, type, resove, success) =>{
    data.shopIDList = this.state.shopsArr.map(shop => shop.shopID);
    this.props.fetchBillList({
      data: data,
      success: (res) => {
        if(success instanceof Function){
          success(res);
        }else{
          this.setState({
            [type == 'did'?'spinVisible':'loading']: false
          });
          if(resove instanceof Function){
            resove('success')
          }
        }
      },
      fail: (res) => {
        this.setState({
          [type == 'did'?'spinVisible':'loading']: false,
          loadingFail: true
        });
        if(resove instanceof Function){
          resove('fail')
        }
      },
    })
  }
  renderNothing = () => {
   return  (
     //用一个标签写会导致图片尺寸出错,所以外面包一个view
     this.state.spinVisible?
       null : this.state.loadingFail ?
       <View>
         <BlankPage
           visable={true}
           type={'error'}
           loadAgain={() => this.fetchList('did')}
         />
       </View> :
       <BlankPage
         visable={true}
         type={'blank'}
         loadAgain={() => this.fetchList('did')}
       >
         <Text style={styles.kongTip}>您还没有{I18n.t(billStatus[`${this.state.current}`])}的订单哦~</Text>
       </BlankPage>
   )
  };
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: styleConsts.bgGrey

  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  billItem: {
    backgroundColor: styleConsts.white,
    paddingHorizontal: 10,
    marginTop: 10
  },
  supplierName: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
  },
  billStatus: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey
  },
  productBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: styleConsts.bgSeparate,
    overflow: 'hidden'
  },
  imgs: {
    width: 60,
    height: 60,
    marginRight: 11.5,
    borderRadius: 1
  },
  productNum: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 2,
    position: 'absolute',
    alignItems: 'flex-end',
    bottom: 0,
    width: 60
  },
  moneyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
  },
  button: {
    width: 70,
    height: 23,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3
  },
  buttonTxt: {
    fontSize: styleConsts.H4,
    color: styleConsts.mainColor
  },
  nothing: {
    flex: 1,
    alignItems: 'center'
  },
  nothingImg: {
    marginTop: 80.5,
    marginBottom: 52,
    width: 200,
    height: 200
  },
  kongNote: {
    fontSize: styleConsts.H3,
    color: styleConsts.moreGrey,
    marginBottom: 17.5
  },
  kongTip: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey,
  },
});

BillsInfoPage.PropTypes = {
};
BillsInfoPage.defaultProps = {
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    orderCenter: state.orderCenter,
    navReducer: state.nav,
    $tabNav: state.tabNav,
    notification: state.orderCenter.get('notification').toJS(),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    navToBillDetail: (opts) => {
      dispatch({type: NAV_TO_BILLS_DETAIL_PAGE, payload: opts})
    },
    navToCheckProduct: (opts) => {
      dispatch({type: NAV_TO_CHECK_PRODUCT_PAGE, payload: opts})
    },
    navToUser: (opts) => {
      dispatch({type: NAV_TO_USER_SCREEN, payload: opts})
    },
    fetchBillList: (opts) => {
      dispatch(fetchBillListAC(opts))
    },
    changeBillStatus: (opts) =>{
      dispatch(changeBillStatusAC(opts))
    },
    changeCartInfo: (opts) =>{
      dispatch(changeCartInfoAC(opts))
    },
    goToShopCenter: (opts) => {
      dispatch({type: SET_MAININFO_TO_GET_SHOP_INFO,  payload: opts}) // 把店铺主要信息存起来
      dispatch({type: NAV_TO_SHOPCENTER_MAIN_PAGE})
    },
    setNotificton: (payload) => {
      dispatch({
        type: SET_NOFICTION_TO_ORDERLIST,
        payload,
      })
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BillsInfoPage)
