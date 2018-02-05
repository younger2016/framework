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
import Immutable from 'immutable';
import {getImgUrl} from '../../../../utils/adapter'
import {settlementProductListAC} from '../../../../redux/actions/cart.action'
import BlankPage from '../../../../components/BlankPage'
import Dimensions from 'Dimensions';
const { height } = Dimensions.get('window');

export class ShopBill extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      // data: [],
      tip: {},
      spinVisible: false,
      data: {
        shopcartProductList: []
      }
    }
  }
  componentDidMount(){
    this.setState({
      spinVisible: true,
    }, () => {
      this.props.settlementProductList({
        data: {
          purchaserShopID: this.props.navigation.state.params.purchaserShopID,
          purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID']),
          supplierShopID: this.props.navigation.state.params.supplierShopID
        },
        success: ()=>{
          this.setState({
            spinVisible: false
          })
        },
        fail: (res)=>{
          this.setState({
            spinVisible: false
          })

          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
        }
      })
    });

  }

  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.cart.get('settlementProducts'), nextProps.cart.get('settlementList'))){
      this.setState({
        data: nextProps.cart.get('settlementProducts').toJS(),
      })
    }

  }

  render(){
    let {data} = this.state;

    return (
        <View style={styles.container}>
          <HeaderBar
            cancelHide={true}
            navigation={this.props.navigation}
            title={this.props.navigation.state.params.supplierShopName}
          />
          {
            data.shopcartProductList.length > 0 ?
              <ScrollView style={{paddingBottom: 10}}>
                  {this.renderProducts(data.shopcartProductList)}
              </ScrollView>: null
          }
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

  renderProducts = (shoplist) => {
    return (<View style={styles.productList}>
      {
        shoplist.map((product, index) => {
          return (
            <View style={[styles.item, index == shoplist.length -1 &&styles.noBorder]} key={product.productID}>
              <Image style={styles.img} source={{uri: getImgUrl(product.imgUrl, 60)}} />
              <View style={styles.rightPart}>
                <Text style={styles.productName}>{product.productName}</Text>
                {
                  product.specs.map((spec, index) => {
                    return (
                      <View style={[styles.flexRow, {marginTop: index == 0 ? 20: 10}]} key={`spec${index}`}>
                        <View  style={styles.specs}>
                          <ChangePrice width={120} price={spec.productPrice} suffix={spec.saleUnitName}/>
                          {
                            !!spec.specContent&&<Text style={styles.specsContent}>{`${spec.specContent}/${spec.saleUnitName}`}</Text>
                          }
                        </View>
                        <Text style={{color: styleConsts.darkGrey, fontSize: styleConsts.H4}}>{`×${spec.shopcartNum}`}</Text>
                      </View>
                    )
                  })
                }
              </View>
            </View>
          )
        })
      }
    </View>)
  };
}

ShopBill.defaultProps = {

};

ShopBill.PropsType = {

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey
  },
  noBorder: {
    borderBottomWidth: 0
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supplierName: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 35,
    paddingLeft: 10
  },
  productList: {
    backgroundColor: styleConsts.white
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    marginHorizontal: 12.5,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  img: {
    width: 60,
    height: 60,
  },
  rightPart: {
    flex: 1,
    marginLeft: 10
  },
  productName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  priceRMB: {
    width: 61,
    marginRight: 10,
    fontSize: styleConsts.H5,
    color: styleConsts.mainColor,
  },
  price: {
    fontSize: styleConsts.H3,
  },
  specsContent: {
    fontSize: styleConsts.H6,
    color: styleConsts.middleGrey,
  },
  specs: {
    flexDirection: 'row',
    alignItems: 'center',
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
    settlementProductList: (opts) => {
      dispatch(settlementProductListAC(opts))
    }
  }
};


export default connect(mapStateToProps, mapDispatchToProps)(ShopBill)

