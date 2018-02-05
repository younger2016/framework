/**
 * Created by chenshuang on 2017/8/7.
 * 提交订单页
 */

import React from 'react'
import { View, Text, Image, PixelRatio, StyleSheet, TouchableWithoutFeedback, ScrollView, Platform } from 'react-native'
import { connect } from 'react-redux'
import moment from 'moment'
import { styleConsts } from '../../utils/styleSheet/styles';
import DatePicker from 'react-native-datepicker'
import  I18n  from 'react-native-i18n'
import HeaderBar from '../../components/HeaderBar'
import ChangePrice from '../../components/ChangePrice'
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import { NAV_TO_SHOP_BILL_PAGE, NAV_TO_COMMIT_BILL_SUCCESS_PAGE, NAV_TO_WRITE_TIP_PAGE } from '../../redux/actions/nav.action'
import { fetchCartListAC} from '../../redux/actions/cart.action'
import {commitBillAC} from '../../redux/actions/orderCenter.action'
import {getImgUrl} from '../../utils/adapter'
import BlankPage from '../../components/BlankPage'
import Dimensions from 'Dimensions';
const { height } = Dimensions.get('window');
import SelectDatePickerAD from '../../components/SelectDatePickerAD';
const placeholder = '你有什么想嘱咐供应商的嘛~';
export class CommitBill extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      // billData : [],
      date: moment().add(1,'days').format('YYYYMMDD'),
      spinVisible: false,
      remarks: [],
      bill: {
        supplierGroupList: []
      }
    }
  }

  componentWillReceiveProps(nextProps){
    if(this.props.cart.get('settlementList') !== nextProps.cart.get('settlementList')){
      let remarks = [];
      let thisRM = this.state.remarks;
      const settlementList = nextProps.cart.get('settlementList').toJS();
      settlementList.supplierGroupList.forEach((shop)=>{
        let remark = thisRM.find((shopRM) => {
          return shop.supplierShopID == shopRM.supplierShopID
        });
        remarks.push({
          supplyShopID: shop.supplierShopID,
          purchaserShopID: settlementList.purchaserShopID,
          remark: remark ? remark.remark : placeholder
        });

      });
      this.setState({
        bill: settlementList,
        remarks: remarks
      })
    }
  }

  render(){
    return (
        <View style={styles.container}>
          <HeaderBar
            cancelHide={true}
            navigation={this.props.navigation}
            title={I18n.t('commitBill')}
          />
          <ScrollView>

            {
              this.state.bill.supplierGroupList.length ?
            <View>
              {this.renderBills()}
                  <View style={[styles.bgWhite, {marginTop: 10}]}>
                    <TouchableWithoutFeedback onPress={() => this.refs.datepicker.onPressMask()}>
                      <View style={[styles.itemStyle, styles.borderStyle]}>
                        <Text style={{color: styleConsts.moreGrey}}>{I18n.t('distributeSate')}</Text>
                        <View style={styles.selectStyle}>
                          {
                            Platform.OS === 'ios' ?
                              <DatePicker
                                showIcon={false}
                                style={{ width: 150, paddingRight: 20, right: -25 }}
                                mode='date'
                                ref='datepicker'
                                date={moment(this.state.date, 'YYYYMMDD').format('YYYY-MM-DD')}
                                placeholder={''}
                                confirmBtnText={I18n.t('confirm')}
                                cancelBtnText={I18n.t('cancel')}
                                customStyles={{
                                  dateInput: {
                                    borderWidth: 0,
                                    alignItems: 'flex-end',
                                  },
                                  btnTextConfirm: {
                                    color: styleConsts.darkGrey
                                  },
                                  dateText: {
                                    color: styleConsts.darkGrey,
                                    textAlign: 'right',
                                    fontSize: styleConsts.H4
                                  }
                                }}
                                onDateChange={(date) => {
                                  this.selectDate(date);
                                }}
                                minDate={moment(this.state.date, 'YYYYMMDD').format('YYYY-MM-DD')}
                              /> : <Text>{moment(this.state.date, 'YYYYMMDD').format('YYYY-MM-DD')}</Text>
                          }
                          <Image style={{width: 4, height: 8, marginHorizontal: 10}} source={require('../../imgs/rightArrow.png')}/>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                    <TouchableWithoutFeedback onPress={this.selectPayWay}>
                      <View style={styles.itemStyle}>
                        <Text style={{color: styleConsts.moreGrey}}>{I18n.t('payWay')}</Text>
                        <View style={styles.selectStyle}>
                          <Text style={{color: styleConsts.darkGrey, fontSize: styleConsts.H4, marginRight: 10}}>账期支付</Text>
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  </View>
            </View>: null
          }
          </ScrollView>
          {this.renderBottom()}

          {/*安卓版单个选择日期*/}
          <SelectDatePickerAD
            ref='datepicker'
            date={moment(this.state.date, 'YYYYMMDD').format('YYYY年-MM月-DD日')}
            updateDate={(date) => {
              this.selectDate(date);
            }}
          />

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
        </View>
    )
  }

  renderBills = () => {
    let {bill} = this.state;
      return (
        <View>
          <View style={[styles.shopInfoBox, styles.bgWhite]}>
            <View style={styles.shopName}>
              <Image style={{width: 13, height: 13, marginRight: 8}} source={require('./imgs/shops.png')}/>
              <Text style={{color: styleConsts.deepGrey, fontSize: styleConsts.H3}}>{bill.purchaserShopName}</Text>
            </View>
            <View style={styles.personInfo}>
              <Text style={[styles.greyTxt, {marginRight: 5}]}>{I18n.t('receiverName')}：</Text>
              <Text style={[styles.greyTxt, {marginRight: 15}]}>{bill.receiverName}</Text>
              <Text style={styles.greyTxt}>{bill.receiverMobile}</Text>
            </View>
            <View  style={[styles.personInfo, {marginTop: 5}]}>
              <Text style={[styles.greyTxt, {marginRight: 5}]}>{I18n.t('address')}：</Text>
              <Text style={styles.greyTxt}>{bill.receiverAddress}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Image style={{width: 45, height: 17}} source={require('./imgs/car.png')}/>
            </View>
          </View>
          <Image style={{width: '100%', height: 5}} source={require('./imgs/line.png')}/>
          {this.renderSupplier()}
        </View>
      )
  };

  renderSupplier = () => {
    let {bill} = this.state;
    const billData = bill.supplierGroupList;
    return billData.map((billInfo,index) => {

      let remark = this.state.remarks.find((shopRM) => {
        return billInfo.supplierShopID == shopRM.supplyShopID
      });
      return (
        <View style={[styles.bgWhite, {marginTop: 10}]} key={`key${index}`}>
          <View style={[styles.shopName, {height: 40, paddingHorizontal: 15}]}>
            <Image style={{width: 13, height: 13, marginRight: 8}} source={require('../Cart/imgs/supplier.png')}/>
            <Text style={{color: styleConsts.deepGrey, fontSize: styleConsts.H3}}>{billInfo.supplierShopName}</Text>
          </View>
          <View style={styles.productsImgs}>
            {this.renderProducts(billInfo.productList)}
            <TouchableWithoutFeedback onPress={()=> {
              this.props.navToShopBill({
                purchaserShopID: bill.purchaserShopID,
                purchaserShopName: bill.purchaserShopName,
                supplierShopID: billInfo.supplierShopID,
                supplierShopName: billInfo.supplierShopName,
              })
            }
            }>
              <View style={styles.totalNum}>
                <Text style={{
                  color: styleConsts.middleGrey,
                  fontSize: styleConsts.H4
                }}>共{billInfo.productList.length}种</Text>
                <Image style={{width: 5, height: 10}} source={require('../../imgs/rightArrow.png')}/>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={styles.moneyBox}>
            <Text style={{color: styleConsts.deepGrey, marginRight: 5, fontSize: styleConsts.H4}}>
              {I18n.t('subtotal')}:
            </Text>
            <ChangePrice big={styleConsts.H3} samll={styleConsts.H5} price={billInfo.totalAmount} width={'auto'}/>
          </View>

          <TouchableWithoutFeedback onPress={()=>this.writeTip(billInfo)}>
            <View style={[styles.tipBox, styles.flexRow]}>
              <View style={{flexDirection: 'row', flex: 1, alignItems: 'center'}}>
                <Text style={{fontSize: styleConsts.H4, color: styleConsts.darkGrey}}>
                  备注
                </Text>
                <Text
                  numberOfLines={1}
                  style={{fontSize: styleConsts.H4, color: (remark && remark.remark == placeholder)? styleConsts.middleGrey: styleConsts.deepGrey, marginLeft: 5, marginRight: 35}}
                >
                  {remark ? remark.remark :placeholder}
                </Text>
              </View>

              <Image style={{width: 4, height: 8, marginLeft: 10}} source={require('../../imgs/rightArrow.png')}/>

            </View>
          </TouchableWithoutFeedback>

        </View>
      )
    })
  }
  renderProducts = (bill) => {
    let newBill = JSON.parse(JSON.stringify(bill))
    const littleBill = newBill.length <= 4? newBill : newBill.splice(0, 4);
    return littleBill.map((list) => {
      let num = 0;
      list.specs.forEach((spec) =>{
        num += spec.shopcartNum
      })
      return (
        <View key={list.productID}>
          <Image style={styles.imgs} source={{uri: getImgUrl(list.imgUrl, 60)}} />
          <View style={styles.productNum}>
            <Text style={{color: styleConsts.white, fontSize: styleConsts.H5}}>×{num}</Text>
          </View>
        </View>
      )
    })

  };

  renderBottom = () => {
    let total = 0;
    this.state.bill.supplierGroupList.forEach((bill)=>{
      total += bill.totalAmount;
    });
    return (
      <View>
        <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
        <View style={[styles.bottomBox, styles.flexRow]}>
          <View style={styles.bottomLeft}>
            <View style={{flexDirection: 'row', alignItems: 'center',}}>
              <Text style={{color: styleConsts.deepGrey,marginRight: 5, fontSize: styleConsts.H5}}>
                {I18n.t('total')}:
              </Text>
              <ChangePrice big={styleConsts.H2} samll={styleConsts.H4} price={total} width={'auto'}/>
            </View>
            <TouchableWithoutFeedback onPress={this.commitBill}>
              <View style={styles.totalBox}>
                <Text style={{color: styleConsts.white, fontSize: styleConsts.H3}}>
                  {I18n.t('commitBill')}
                </Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </View>
    )
  };


  writeTip = (billInfo) =>{
    let {remarks} = this.state;
    let remark = this.state.remarks.find((shopRM) => {
      return billInfo.supplierShopID == shopRM.supplyShopID
    });
    this.props.navToWriteTip({
      value: placeholder !== remark.remark ? remark.remark: '',
      title: billInfo.supplierShopName,
      getTip: (val) =>{
        remarks.map((shopRM) => {
          if(billInfo.supplierShopID == shopRM.supplyShopID){
            shopRM.remark = val === '' ? placeholder : val
          }
          return shopRM
        });
        this.setState({remarks})
      }
    })
  }

  commitBill = () => {
    this.setState({
      spinVisible: true
    }, () => {
      let { remarks, bill } = this.state;
      let remarkDtoList = remarks.filter(remark => remark.remark !== placeholder );

      this.props.commitBill({
        data: {
          payType: 1,
          subBillExecuteDate: parseInt(this.state.date),
          shopCartKey: this.props.cart.get('shopCartKey'),
          remarkDtoList
        },
        success: (res) => {
          this.setState({
            spinVisible: false
          });
          this.props.fetchCartList({
            data: {
              purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID']),
              shopList:[{
                shopID: bill.purchaserShopID,
                shopName: bill.purchaserShopName,
              }]
            }
          })
          this.props.navToCommitSuccess(res.data.masterBillIDs);

        },
        fail: (res) => {
          this.setState({
            spinVisible: false
          });

          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
        }
      })
    });
  };

  selectDate = (date) => {
    this.setState({
      date: moment(date, 'YYYY-MM-DD').format('YYYYMMDD')
    })
  };

  selectPayWay = () => {

  };
}
CommitBill.defaultProps = {

};

CommitBill.PropsType = {

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bgWhite: {
    backgroundColor: styleConsts.white,
  },
  itemStyle: {
    height: 40,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  money: {
    color: styleConsts.red,
    fontSize: styleConsts.H3
  },
  borderStyle: {
    borderBottomColor: styleConsts.lightGrey,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  marginB:{
    marginBottom: 10
  },
  bottomBox: {
    height: 49,
    paddingLeft: 9.5,
    backgroundColor: styleConsts.white,
  },
  totalBox: {
    width: 110,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: styleConsts.mainColor
  },
  bottomLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  shopInfoBox: {
    paddingTop: 17,
    paddingLeft: 10,
    paddingRight: 9.5,
  },
  shopName: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  personInfo: {
    marginTop: 12.5,
    flexDirection: 'row'
  },
  greyTxt: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey
  },
  dashLine: {
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: 'dashed',
    borderColor: styleConsts.lightGrey
  },

  productsImgs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: styleConsts.bgSeparate
  },
  imgs: {
    width: 60,
    height: 60,
    marginRight: 11.5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
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
  totalNum: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    borderStyle: 'dashed',
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal:5,
    width: 60,
    height: 60
  },
  moneyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 15,
  },
  selectStyle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tipBox: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: styleConsts.lightGrey,
    paddingHorizontal: 10,
    height: 40,
  }

});

const mapStateToProps = (state) => {
  return {
    user: state.user,
    cart: state.cart
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    navToShopBill: (opts) => {
      dispatch({type: NAV_TO_SHOP_BILL_PAGE, payload: opts})
    },
    navToCommitSuccess: (opts) => {
      dispatch({type: NAV_TO_COMMIT_BILL_SUCCESS_PAGE, payload: opts})
    },
    commitBill: (opts) => {
      dispatch(commitBillAC(opts));
    },
    fetchCartList: (opts)=>{
      dispatch(fetchCartListAC(opts))
    },
    navToWriteTip: (opts) => {
      dispatch({type: NAV_TO_WRITE_TIP_PAGE, payload: opts})
    },
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(CommitBill)

