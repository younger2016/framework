/**
 * Created by chenshuang on 2017/8/7.
 */

import React from 'react'
import { View, Text, Image, PixelRatio, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native'
import { connect } from 'react-redux'
import { styleConsts } from '../../../../utils/styleSheet/styles';
import  I18n  from 'react-native-i18n'
import HeaderBar from '../../../../components/HeaderBar'
import ChangePrice from '../../../../components/ChangePrice'
import { toastShort } from '../../../../components/toastShort';
import Toast from 'react-native-root-toast';
import {showTheCommitBillAC} from '../../../../redux/actions/orderCenter.action'
import { NAV_TO_MAIN_SCREEN_PAGE, NAV_TO_BILLS_INFO_PAGE } from '../../../../redux/actions/nav.action'
import Immutable from 'immutable'
import BlankPage from '../../../../components/BlankPage'
import Dimensions from 'Dimensions';
const { height } = Dimensions.get('window');
import {setTask} from '../../../../utils/deskTask'

export class CommitBillSuccess extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      data: [],
      visibleID: '',
      spinVisible: false
    }
  }
  componentDidMount(){
    setTask(this.navToMainScreen);
    this.setState({
      spinVisible: true
    }, () => {
      this.props.showTheCommitBill({
        data: {
          masterBillIDs: this.props.navigation.state.params
        },
        success: () => {
          this.setState({
            spinVisible: false
          });
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

  componentWillUnmount() {
    setTask(null)
  }

  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.orderCenter.get('commitBillInfo'), nextProps.orderCenter.get('commitBillInfo'))){
      this.setState({
        data: nextProps.orderCenter.get('commitBillInfo').toJS()
      })
    }
  }

  render(){
    return (
        <View style={styles.container}>
          <HeaderBar
            cancelHide={true}
            goBackHide={true}
            navigation={this.props.navigation}
            title={I18n.t('commitBill')}
          />

          <ScrollView>
            <View style={styles.successBox}>
              <Image style={styles.bgImg} source={require('../../imgs/success.png')}/>
              <View style={{marginLeft: 30}}>
                <Text style={styles.title}>订单提交成功</Text>
                <Text style={styles.littleTit}>供应商会尽快给您配送</Text>
              </View>
            </View>

            <View style={styles.buttonBox}>
              <TouchableWithoutFeedback onPress={this.navToMainScreen}>
                <View style={styles.button}>
                  <Text style={styles.buttonTxt}>返回首页</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={this.navToBillDetail}>
                <View style={styles.button}>
                  <Text style={styles.buttonTxt}>查看订单</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>

            <View style={{backgroundColor: styleConsts.white}}>{this.renderSupplier()}</View>
          </ScrollView>
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

  renderSupplier = () => {
    console.log(this.state.data)
    return this.state.data.map((shop, idx)=>{
      return (
        shop.list.map((bill) => {
          return (
            <View key={`${bill.subBillNo}`} style={[styles.shopItem, idx < shop.list.length -1 && styles.borderBottom]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image style={{width: 13, height: 13, marginRight: 8}}
                       source={require('../../../Cart/imgs/supplier.png')}/>

                <Text style={styles.shopName}>{bill.supplyShopName}</Text>
              </View>

              <View style={styles.moreInfo}>
                <Text style={styles.moreTxt}>{bill.subBillNo}</Text>
                <ChangePrice price={bill.totalAmount} textAlign={'right'} color={styleConsts.grey} width={'auto'}/>
              </View>
            </View>

          )
        })
      )
    })
  }

  /*renderBillList = () => {
    return this.state.data.map((shop, idx)=>{
      return (
        <View key={shop.shopID}>
          <TouchableWithoutFeedback onPress={() => this.showMoreInfo(shop.shopID)}>
            <View style={[styles.shopItem, idx < this.state.data.length -1 && styles.borderBottom]}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image style={{width: 13, height: 13, marginRight: 10}}
                       source={require('../../imgs/shops.png')}/>
                <Text style={styles.shopName}>{shop.shopName}</Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.totalNum}>
                  订单: <Text>{shop.subbillNum}</Text>
                </Text>
                <Image style={{width: 11, height: 6, marginRight: 15}}
                       source={this.state.visibleID == shop.shopID ?
                         require('../../imgs/redUp.png'):require('../../imgs/greyDown.png')}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
          {this.renderMoreInfo(shop)}
        </View>
      )
    })
  }

  renderMoreInfo = (shop) => {
    if(this.state.visibleID == shop.shopID){
      return shop.list.map((bill) => {
        return (
          <View style={styles.moreInfo} key={bill.subBillNo}>
            <View style={styles.moreLeft}>
              <Text style={styles.moreTxt}>{bill.supplyShopName}</Text>
              <Text style={styles.moreTxt}>{bill.subBillNo}</Text>
            </View>
            <ChangePrice price={bill.totalAmount} textAlign={'right'} color={styleConsts.grey} width={'auto'}/>
          </View>
        )
      })
    }
    return null;
  };

  showMoreInfo = (shopID) => {
    let newID = this.state.visibleID !== shopID ? shopID : '';
    this.setState({
      visibleID: newID
    })
  };*/

  navToMainScreen = () => {
    this.props.navToMainScreen();
  }

  navToBillDetail = () => {
    this.props.navToBillDetail();
  }
}

CommitBillSuccess.defaultProps = {

};

CommitBillSuccess.PropsType = {

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey
  },
  successBox: {
    height: 155,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: styleConsts.white
  },
  bgImg: {
    position: 'absolute',
    zIndex: -1,
    width: 317,
    height: 70
  },
  title: {
    fontSize: 26,
    color: styleConsts.mainColor,
    marginBottom: 14.5
  },
  littleTit: {
    fontSize: 12,
    color: styleConsts.middleGrey,
  },
  buttonBox: {
    height: 50,
    backgroundColor: styleConsts.bgSeparate,
    flexDirection: 'row',
    paddingHorizontal: 70,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,

  },
  button: {
    width: 80,
    height: 30,
    borderColor: styleConsts.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 3,
  },
  buttonTxt: {
    color: styleConsts.mainColor,
    fontSize: styleConsts.H4,
    borderColor: 'transparent',
  },
  shopItem: {
    height: 55,
    paddingHorizontal: 10,
    paddingVertical: 11,
    justifyContent: 'space-between',
  },
  shopName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey
  },
  totalNum: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
    marginRight: 10
  },
  borderBottom: {
    borderBottomWidth: 0.5,
    borderBottomColor: styleConsts.lightGrey
  },
  moreInfo: {
    marginLeft: 21,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  moreLeft: {
    justifyContent: 'space-between'
  },
  moreTxt: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey
  }
});

const mapStateToProps = (state) => {
  return {
    orderCenter: state.orderCenter
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    navToMainScreen: (opts) => {
      dispatch({type: NAV_TO_MAIN_SCREEN_PAGE, payload: opts})
    },
    navToBillDetail: (opts) => {
      dispatch({type: NAV_TO_BILLS_INFO_PAGE, payload: opts})
    },
    showTheCommitBill: (opts) =>{
      dispatch(showTheCommitBillAC(opts));
    }
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(CommitBillSuccess)
