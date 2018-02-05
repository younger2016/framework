/**
 * Created by chenshuang on 2017/8/7.
 */

import React from 'react'
import { View, TextInput, Text, Image, FlatList, StyleSheet, TouchableWithoutFeedback, ScrollView, Platform, UIManager, Animated } from 'react-native'
import { connect } from 'react-redux'
import { styleConsts } from '../../utils/styleSheet/styles';
import  I18n  from 'react-native-i18n'
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import HeaderBar from '../../components/HeaderBar'
import { checkProductAC, fetchBillInfoAC } from '../../redux/actions/orderCenter.action'
import {getImgUrl} from '../../utils/adapter'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import BlankPage from '../../components/BlankPage'
import Dimensions from 'Dimensions';
const dHeight = Dimensions.get('window').height;

export class CheckProduct extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      billData : [],
      checkList: [],
      subBillID: '',
      spinVisible: false,
      pageY: new Animated.Value(0),
    }
  }

  componentDidMount(){
    let billInfo = this.props.navigation.state.params.billInfo;
    let subBillID = this.props.navigation.state.params.subBillID;
    let checkList = billInfo.map((bill) => {
      return {
        detailID: bill.detailID,
        inspectionNum: bill.adjustmentNum,
        adjustmentNum: bill.adjustmentNum,
        productNum: bill.productNum,
        inspectionPrice: bill.productPrice,
        imgUrl: bill.imgUrl,
        productName: bill.productName,
        productSpec: bill.productSpec
      }
    });
    this.setState({
      billData: billInfo,
      subBillID,
      checkList
    });

  }

  componentWillUnmount(){
    this.setState({
      spinVisible: false
    })
  }

  render(){
    return (
        <View style={styles.container}>
          <HeaderBar
            cancelHide={true}
            navigation={this.props.navigation}
            title={I18n.t('checkProductList')}
          />
          <KeyboardAwareScrollView
            enableOnAndroid = {true}
          >
            <FlatList
              data={this.state.checkList}
              renderItem={({item, index}) => this.renderItems(item, index)}
            />
          </KeyboardAwareScrollView>
          {this.renderBottom()}
          <View style={{
            flex: 1,
            width: this.state.spinVisible ? '100%': 0,
            height: this.state.spinVisible? dHeight: 0,
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

  renderItems = (item, index) => {
    return (
      <View style={[styles.productBox, index == this.state.billData.length - 1 && {borderBottomWidth: 0}]}>
        <Image style={styles.logo} source={{uri: getImgUrl(item.imgUrl, 75)}}/>
        <View style={styles.rightPart}>
          <View style={styles.rightTop}>
            <Text numberOfLines={1} style={styles.productName}>
              {item.productName}
            </Text>
            <View style={{justifyContent: 'flex-end'}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10}}>

                <Text style={styles.label}>
                  {I18n.t('singlePrice')}¥{item.inspectionPrice}
                </Text>
                <Text numberOfLines={1} style={styles.unit}>
                  {item.productSpec}
                </Text>
              </View>
              <View style={styles.rightBottom}>
                <Text numberOfLines={1} style={styles.unit}>
                  {I18n.t('buyNum')}：{item.productNum}
                </Text>
                <Text numberOfLines={1} style={styles.unit}>
                  {I18n.t('adjustmentNum')}：{item.adjustmentNum}
                </Text>

                <View style={styles.price}>
                  <Text style={styles.label}>{I18n.t('checkNum')}</Text>
                  <TextInput
                    ref={component => this[`input${index}`] = component}
                    defaultValue={`${item.inspectionNum}`}
                    style={[styles.input, styles.label]}
                    keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'}
                    value={this.state[`num${item.productID}`]}
                    onChangeText={(val) => {this.onInputChange(val, `inspectionNum`, index)}}
                    underlineColorAndroid="transparent"
                  />
                </View>
              </View>
            </View>
          </View>

        </View>
      </View>
    )
  };

  renderBottom = () => {
    return (
      <View style={styles.bottomBox}>
        <TouchableWithoutFeedback onPress={this.checkProduct}>
          <View style={styles.button}>
            <Text style={styles.buttonTxt}>
              {I18n.t('confirmReceipt')}
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  };

  onInputChange = (val, name, index) => {
    let {checkList} = this.state;
    checkList[index][name] = val;
    this.setState({
      checkList
    })
  };

  checkProduct = () => {
    let {checkList, subBillID} = this.state;
    this.setState({
      spinVisible: true
    },() =>{
      this.props.checkProduct({
        data: {
          subBillID: subBillID,
          list: checkList.map((bill) => {
            return {
              detailID: bill.detailID,
              inspectionNum: bill.inspectionNum,
              inspectionPrice: bill.inspectionPrice,
            }
          })
        },
        success: () => {
          this.setState({
            spinVisible: false
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('验货成功');
          this.props.navigation.state.params.callback && this.props.navigation.state.params.callback(checkList);
          setTimeout(() => {
            this.props.navigation.goBack()
          }, 500)
        },
        fail: (res) => {
          this.setState({
            spinVisible: false
          });

          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
        },
      })
    });
  }

}
CheckProduct.defaultProps = {

};

CheckProduct.PropsType = {

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
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
    width: 100,
    height: 35,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.mainColor,
    backgroundColor: styleConsts.mainColor,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonTxt: {
    color: styleConsts.white,
    fontSize: styleConsts.H3
  },
  productBox: {
    padding: 10,
    flexDirection: 'row',
    backgroundColor: styleConsts.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: styleConsts.lightGrey
  },
  logo: {
    width: 75,
    height: 75,
    marginRight: 10
  },
  rightPart: {
    flex: 1,
    height: 75
  },
  rightTop: {
    justifyContent: 'space-between',
    height: 75,
  },
  productName: {
    color: styleConsts.deepGrey,
    fontSize: styleConsts.H3,
    marginTop: 5
  },
  unit: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey
  },
  rightBottom: {
    marginBottom: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  price: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey
  },
  input: {
    width: 75,
    height: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: styleConsts.darkGrey,
    textAlign: 'center',
    marginLeft: 10,
    padding: 0,
  }

});

const mapStateToProps = (state) => {
  return {

  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchBillInfo: (opts) => {
      dispatch(fetchBillInfoAC(opts))
    },
    checkProduct: (opts) => {
      dispatch(checkProductAC(opts))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(CheckProduct)

