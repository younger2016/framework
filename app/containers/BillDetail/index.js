/**
 * Created by chenshuang on 2017/8/7.
 * 订单详情页
 */

import React from 'react'
import { View, Text, Image, PixelRatio, StyleSheet, TouchableWithoutFeedback, ScrollView, Clipboard, FlatList } from 'react-native'
import { connect } from 'react-redux'
import { styleConsts } from '../../utils/styleSheet/styles';
import  I18n  from 'react-native-i18n'
import HeaderBar from '../../components/HeaderBar'
import ChangePrice from '../../components/ChangePrice'
import Immutable from 'immutable';
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import {setTask} from '../../utils/deskTask';
import moment from 'moment'
import {fetchBillInfoAC, fetchBillListAC, changeBillStatusAC} from '../../redux/actions/orderCenter.action'
import { changeCartInfoAC } from '../../redux/actions/cart.action'
import {NAV_TO_CHECK_PRODUCT_PAGE, NAV_TO_SHOPCENTER_MAIN_PAGE} from '../../redux/actions/nav.action'
import InputModal from '../../components/InputModal'
import {getImgUrl} from '../../utils/adapter'
import BlankPage from '../../components/BlankPage'
import Dimensions from 'Dimensions';
import ScrollableTabView from 'react-native-scrollable-tab-view';

const { height } = Dimensions.get('window');
import { SET_MAININFO_TO_GET_SHOP_INFO } from '../../redux/actions/shopCenter.action'
const billStatus = {
  0: 'all',
  1: 'haveNotGetOrder',
  2: 'waitSendProduct',
  3: 'waitGiveProduct',
  6: 'hasedGive',
  7: 'hasCanceled'
};
const btnStatus = ['cancelBill', 'checkProduct', 'buyAgain'];

//1-采购商 2-供应商 3-客服
const cancelerList = ['purchaser', 'supplier', 'customerService'];
const imgStatus = [
  '',
  require('./imgs/littleBill.png'),
  require('./imgs/box.png'),
  require('./imgs/car.png'),
  '','',
  require('./imgs/product.png'),
  require('./imgs/cancel.png'),
]

export class BillDetail extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      billData : {
        detailList : []
      },
      inspectionNum: [],
      spinVisible: false,
      showInput: false,
      showIndex: 0
    }
  }
  componentWillMount(){
    let billInfos = this.props.navigation.state.params.billInfo;
    let inspectionNum = this.props.navigation.state.params.inspectionNum;
    this.setState({
      billData: billInfos,
      inspectionNum: inspectionNum
    });

  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.orderCenter.get('billList'), nextProps.orderCenter.get('billList'))){
      let {billData} = this.state;
      billData.subBillStatus = this.state.actionType == 3 ? 7: 6;
      this.setState({billData})
    }
  }
  componentWillUnmount(){
    this.setState({
      spinVisible: false
    })
    setTask(null)
  }
  render(){
    let {billData} = this.state;

    return (
        <View style={styles.container}>
          <HeaderBar
            cancelHide={true}
            navigation={this.props.navigation}
            title={'订单详情'}
          />
          <ScrollView>
            <View style={styles.billTitle}>
              <Image style={styles.imgBg} source={require('./imgs/billBg.png')}/>
              <View style={styles.titleBox}>
                <Image style={styles.billImg} source={imgStatus[billData.subBillStatus]}/>
                <Text style={styles.billStatusTxt}>
                  {I18n.t(billStatus[billData.subBillStatus])}
                </Text>
                {
                  billData.subBillStatus == 7?
                    <Text style={styles.cancelReason}>
                      {I18n.t(cancelerList[billData.canceler])}{billData.actionBy == 'admin' ? '管理员' : billData.actionBy}{billData.cancelReason !== '' && `：${billData.cancelReason}`}
                    </Text>: null
                }
              </View>
            </View>

            <View style={styles.shopInfo}>
              <Image style={{width: 13, height: 13, marginHorizontal: 10}} source={require('./imgs/location.png')}/>
              <View style={styles.shopInfoBox}>
                <Text numberOfLines={1} style={styles.shopName}>{billData.shopName}</Text>
                <Text numberOfLines={1} style={[styles.address, {marginBottom: 5}]}>{I18n.t('giveTime')}： {moment(billData.subBillExecuteDate, 'YYYYMMDD').format('YYYY-MM-DD') || ''}</Text>
                <Text numberOfLines={1} style={styles.address}>{I18n.t('receiveAddress')}： {billData.receiverAddress}</Text>
              </View>
            </View>

            <Image style={{width: '100%', height: 5}} source={require('./imgs/dashedLine.png')}/>
            {this.renderSupplier()}
            {this.renderMoneyInfo()}
            {this.renderBillNo()}

          </ScrollView>
          {this.renderBottom()}
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
                cancel={() => this.setState({ showInput: false }, ()=> setTask(null))}
                confirm={(val) => {
                  this.cancelBill(this.state.subBillID, val);
                  setTask(null)
                }}
              />:null
          }
        </View>
    )
  }

  renderSupplier = () => {
    let {billData} = this.state;
    return (
      <View style={styles.supplierBox}>
          <ScrollableTabView
            initialPage={0}
            ref="allPageTab"
            style={{height: billData.detailList ? billData.detailList.length * 70 + 5 * (billData.detailList.length - 1) + 50: 0}}
            onChangeTab={(a) => {
              this.setState({
                showIndex: a.i
              })
            }}
            renderTabBar={() => (
              <View style={styles.nameAndBtns}>
                <TouchableWithoutFeedback onPress={() => this.props.goToShopCenter({
                  purchaserID: this.props.user.getIn(['userInfo', 'purchaserID']),
                  supplyGroupID	: billData.groupID,
                  supplyShopID: billData.supplyShopID
                })}>
                  <View style={styles.supplierName}>
                    <Image style={{width: 13, height: 13}} source={require('../CommitBill/imgs/shops.png')}/>
                    <Text
                      numberOfLines={1}
                      style={{color: styleConsts.moreGrey, fontSize: styleConsts.H3, marginHorizontal: 10}}
                    >{billData.supplyShopName}</Text>
                    <Image style={{width: 6, height: 12}} source={require('../../imgs/rightArrow.png')}/>
                  </View>
                </TouchableWithoutFeedback>

                <View style={styles.btnGroup}>
                  <TouchableWithoutFeedback  onPress={() => this.refs.allPageTab.goToPage(0)}>
                    <View style={styles.btnContainer}>
                      <View style={[styles.btnLeft, this.state.showIndex && {borderColor: styleConsts.grey, borderRightWidth: 0, borderRightColor: 'transparent'}]}>
                        <Text style={[styles.btnText, this.state.showIndex && {color: styleConsts.grey}]}>价格</Text>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                  <TouchableWithoutFeedback onPress={() => this.refs.allPageTab.goToPage(1)}>
                    <View style={styles.btnContainer}>
                      <View style={[styles.btnRight, !this.state.showIndex && {borderColor: styleConsts.grey, borderLeftWidth: 0, borderLeftColor: 'transparent'}]}>
                        <Text style={[styles.btnText, !this.state.showIndex && {color: styleConsts.grey}]}>数量</Text>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </View>
            )}
          >
            <FlatList
              legacyImplementation={false}
              bounces={false}
              scrollEnabled={false}
              data={billData.detailList}
              renderItem={({ item, index }) => this.renderProduct(item, index)}
              keyExtractor={({ productSpecID, productID }) => `${productID}-${productSpecID}-${Math.random()}`}
            />
            <FlatList
              legacyImplementation={false}
              bounces={false}
              scrollEnabled={false}
              data={billData.detailList}
              renderItem={({ item, index }) => this.renderProduct(item, index, true)}
              keyExtractor={({ productSpecID, productID }) => `${productID}-${productSpecID}-${Math.random()}`}
            />
          </ScrollableTabView>

        <View style={[styles.TxtLine, {paddingHorizontal: 10}]}>
          <Text numberOfLines={1} style={styles.tipTxt}>
            {I18n.t('remarks')}：{billData.subBillRemark}
          </Text>
        </View>

        </View>
    )
  };

  renderProduct = (bill, index, flag) => {
    //验证是否有商品规格，在订单里，后台传回的productSpec是拼接好的。没有规格就返回例如'/个'
    const productSpecArr = bill.productSpec.split('/');//productSpecArr[0]：规格内容，productSpecArr[1]：规格单位
    let inspec = this.state.inspectionNum.find((pro) => {
      return pro.detailID == bill.detailID
    });
    return(
      <View style={[styles.productBox, index == this.state.billData.detailList.length -1 && {marginBottom: 0}]} key={bill.detailID}>
        <Image style={{width: 60, height: 60, marginHorizontal: 10, marginVertical: 5}} source={{uri: getImgUrl(bill.imgUrl, 60)}}/>
        <View style={styles.productInfo}>
          <Text style={{color: styleConsts.moreGrey, fontSize: styleConsts.H3}}>{bill.productName}</Text>
          {
            !flag ?
              <View style={{flex: 1, justifyContent: 'space-between', marginTop: 15}}>
                <ChangePrice price={bill.productPrice} suffix={productSpecArr[1]} color={styleConsts.darkGrey} width={'auto'}/>
                {
                  !!productSpecArr[0]&&<Text numberOfLines={1} style={{color: styleConsts.grey, fontSize: styleConsts.H5, backgroundColor: 'transparent'}}>{bill.productSpec}</Text>
                }
              </View>
              :
              <View style={{flex: 1, justifyContent: 'space-between', marginTop: 17}}>
                <Text style={{color: styleConsts.grey, fontSize: styleConsts.H5}}>{bill.productSpec}</Text>
                <View style={[styles.flexRow, {flex: 1, height: 20}]}>
                  <Text style={[styles.numberTxtBox, {marginLeft: 0}]} numberOfLines={1}>订货:
                    {bill.productNum}
                  </Text>
                  <Text style={styles.numberTxtBox} numberOfLines={1}>发货:
                    <Text style={bill.subBillStatus >= 3 && bill.adjustmentNum !== bill.productNum && {color: styleConsts.mainColor}}>
                      {this.state.billData.subBillStatus >= 3  && this.state.billData.subBillStatus != 7? bill.adjustmentNum : '-'}
                    </Text>
                  </Text>
                  <Text style={styles.numberTxtBox} numberOfLines={1}>签收:
                    <Text style={this.state.billData.subBillStatus == 6 && (inspec ? inspec.inspectionNum : this.state.billData.subBillStatus == 6 ? bill.inspectionNum : bill.adjustmentNum) !== bill.productNum && {color: styleConsts.mainColor}}>
                      {
                        this.state.billData.subBillStatus == 6 ?
                          (inspec ? inspec.inspectionNum : bill.adjustmentNum) : '-'
                      }
                    </Text>
                  </Text>
                </View>
              </View>
          }
        </View>
      </View>
    )

  };

  renderBillNo = () => {
    let {billData} = this.state;
    return  (
      <View style={[styles.noBox, {justifyContent: 'center', height: 80}]}>
        <View style={[styles.TxtLine, {height: 30, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}]}>
          <Text numberOfLines={1} style={[styles.tipTxt]} >
            {I18n.t('billNo')}：<Text style={{color: styleConsts.darkGrey}}>{billData.subBillNo}</Text>
          </Text>
          <TouchableWithoutFeedback onPress={()=>{
            Clipboard.setString(billData.subBillNo);
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort('复制成功');
          }}>
            <View style={{height: 30, width: 50, alignItems: 'flex-end',  justifyContent: 'center'}}>
              <View style={styles.copyBox}>
                <Text style={{color: styleConsts.grey, fontSize: 10, backgroundColor: 'transparent'}}>复制</Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={[styles.TxtLine, {height: 30}]}>
          <Text numberOfLines={1} style={[styles.tipTxt]}>
            {I18n.t('billCreateTime')}：<Text style={{color: styleConsts.darkGrey}}>{moment(billData.subBillCreateTime, 'YYYYMMDDHHmmss').format('YYYY-MM-DD HH:mm:ss')}</Text>
          </Text>
        </View>
      </View>
    )
  };

  renderMoneyInfo = () => {
    let {billData} = this.state;
    let money = 0;
    this.state.inspectionNum.forEach((pro) => {
      money += pro.inspectionPrice * pro.inspectionNum
    });
    return  (
      <View style={[styles.noBox, {marginBottom: 10}]}>
        <View style={styles.dashLine}/>
        <View style={[styles.TxtLine, styles.flexRow, {marginTop: 10, height: 20}]}>
          <Text numberOfLines={1} style={styles.tipTxt}>
            订货总价：
          </Text>
          <ChangePrice price={billData.orderTotalAmount}  width={'auto'} color={styleConsts.darkGrey} textAlign={'right'}/>
        </View>
        <View style={[styles.TxtLine, styles.flexRow, {height: 20}]}>
          <Text numberOfLines={1} style={styles.tipTxt}>
            发货总价：
          </Text>
          {billData.subBillStatus >= 3 && billData.subBillStatus != 7?
            <ChangePrice price={billData.adjustmentTotalAmount}  width={'auto'} color={styleConsts.darkGrey} textAlign={'right'}/>
            : <Text style={{color: styleConsts.darkGrey}}>-</Text>
          }
        </View>
        <View style={[styles.TxtLine, styles.flexRow, {height: 20}]}>
          <Text numberOfLines={1} style={styles.tipTxt}>
            签收总价：
          </Text>
          {billData.subBillStatus == 6 ?
            <ChangePrice price={this.state.inspectionNum.length == 0 ? billData.inspectionTotalAmount : money}  width={'auto'} color={styleConsts.darkGrey} textAlign={'right'}/>
            : <Text style={{color: styleConsts.darkGrey}}>-</Text>
          }

        </View>
        <View style={[styles.TxtLine, styles.flexRow, {marginBottom: 10, height: 20}]}>
          <Text numberOfLines={1} style={styles.tipTxt}>
            {I18n.t('freight')}：
          </Text>
          <ChangePrice price={0} color={styleConsts.darkGrey} textAlign={'right'}  width={'auto'}/>
        </View>
        <View style={styles.dashLine}/>
        <View style={[styles.TxtLine, styles.flexRow]}>
          <Text numberOfLines={1} style={styles.totalNumTxt}>
            {I18n.t('billTotalPrice')}（{I18n.t('accountPayable')}）
          </Text>
          <ChangePrice big={styleConsts.H2} samll={styleConsts.H4}  width={'auto'} price={ this.state.inspectionNum.length == 0 ? billData.totalAmount : money} textAlign={'right'}/>
        </View>
      </View>
    )
  };

  renderBottom = () => {
    let {billData} = this.state;

    if(billData.subBillStatus != 2){
      return (
        <View style={styles.bottomBox}>
          <TouchableWithoutFeedback onPress={() => {this.doSomething(billData)}}>
            <View style={styles.button}>
              <Text style={styles.buttonTxt}>
                {
                  I18n.t(billData.subBillStatus == 1 ? btnStatus[0] :
                    billData.subBillStatus == 3 ? btnStatus[1] : btnStatus[2])
                }
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )
    }else{
      return null
    }
  };

  cancelBill = (subBillID, val) => {
    let data = {
      subBillIds: subBillID,
      flag: 1,
      actionType: 3
    };
    let userName = this.props.user.toJS().userInfo.purchaserUserName;

    if(val !== '' && val !== undefined){
      data.cancelReason = val
    }
    this.setState({
      spinVisible: true,
      showInput: false,
      actionType: 3
    }, () => {
      this.props.changeBillStatus({
        data: data,
        success: () => {
          let {billData} = this.state;
          billData.cancelReason = val;
          billData.actionBy = userName == '' ? 'admin' : userName;
          this.setState({
            spinVisible: false,
            billData
          })
        },
        fail: (res) => {
          this.setState({
            spinVisible: false,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res.response.message);
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
        subBillID: bill.subBillID
      }, () => {
        setTask(()=>{
          this.setState({
            showInput: false
          }, () => {
            setTask(null)
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
            this.toast = toastShort('已为您加入进货单');
          },
          fail: (data) => {
            this.setState({
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(data.response.message);
          }
        })
      })
    }
  };
}
BillDetail.defaultProps = {

};

BillDetail.PropsType = {

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  noBorder: {
    borderBottomWidth: 0
  },
  billTitle: {
    flex: 1,
  },
  titleBox: {
    paddingLeft: 35,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imgBg: {
    flex: 1,
    height: '100%',
    width: '100%',
    position: 'absolute',
    zIndex: -1
  },
  billImg: {
    width: 13,
    height: 13,
    marginRight: 10
  },
  billStatusTxt: {
    fontSize: styleConsts.H2,
    color: styleConsts.white,
    backgroundColor: 'transparent'
  },
  shopInfo: {
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    paddingTop: 14,
  },
  shopInfoBox: {
    flex: 1
  },
  shopName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    marginBottom: 12
  },
  address: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey,
    marginBottom: 10
  },
  supplierBox: {
    backgroundColor: styleConsts.white,
    marginTop: 10
  },
  nameAndBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  btnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnContainer: {
    height: 50,
    justifyContent: 'center',
  },
  btnLeft: {
    width: 30,
    height: 20,
    borderBottomLeftRadius: 3,
    borderTopLeftRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.mainColor,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: styleConsts.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnRight: {
    width: 30,
    height: 20,
    borderBottomRightRadius: 3,
    borderTopRightRadius: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.mainColor,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: styleConsts.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    backgroundColor: 'transparent',
    color: styleConsts.mainColor,
    fontSize: 10
  },
  supplierName: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
  },
  productBox: {
    height: 70,
    flexDirection: 'row',
    backgroundColor: styleConsts.bgSeparate,
    marginBottom: 5
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 10,
    marginVertical: 5,
  },
  TxtLine: {
    height: 40,
    justifyContent: 'center',
  },
  tipTxt: {
    color: styleConsts.grey,
    fontSize: styleConsts.H4,
  },
  noBox: {
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: styleConsts.white,
  },
  dashLine: {
    borderWidth: 0.4,
    borderStyle: 'dashed',
    borderColor: styleConsts.lightGrey
  },
  totalNumTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey
  },
  bottomBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: styleConsts.lightGrey,
    height: 49,
    width: '100%',
    position: 'relative',
    bottom: 0,
    backgroundColor: styleConsts.white,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  button: {
    width: 70,
    height: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.mainColor,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonTxt: {
    color: styleConsts.mainColor,
    fontSize: styleConsts.H4
  },
  cancelReason: {
    marginLeft: 10,
    width: 230,
    fontSize: styleConsts.H5,
    color: styleConsts.white,
    backgroundColor: 'transparent'
  },
  numberTxtBox: {
    color: styleConsts.grey,
    fontSize: styleConsts.H5,
    marginLeft: 5,
    width: 100
  },
  copyBox: {
    width: 40,
    height: 15,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.grey,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const mapStateToProps = (state) => {
  return {
    orderCenter: state.orderCenter,
    user: state.user
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchBillInfo: (opts) => {
      dispatch(fetchBillInfoAC(opts))
    },
    navToCheckProduct: (opts) => {
      dispatch({type: NAV_TO_CHECK_PRODUCT_PAGE, payload: opts})
    },

    fetchBillList: (opts) => {
      dispatch(fetchBillListAC(opts))
    },
    goToShopCenter: (opts) => {
      dispatch({type: SET_MAININFO_TO_GET_SHOP_INFO,  payload: opts}) // 把店铺主要信息存起来
      dispatch({type: NAV_TO_SHOPCENTER_MAIN_PAGE})
    },
    changeBillStatus: (opts) =>{
      dispatch(changeBillStatusAC(opts))
    },
    changeCartInfo: (opts) =>{
      dispatch(changeCartInfoAC(opts))
    },
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(BillDetail)

