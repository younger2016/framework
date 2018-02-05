/**
 * 商品详情中商品
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, ScrollView, TouchableWithoutFeedback } from 'react-native';
import Immutable from 'immutable';
import ChangePrice from '../../../components/ChangePrice';
import ProductNum from '../../../components/ProductNum';
import Banner from './Banner';
import { styleConsts } from '../../../utils/styleSheet/styles';

import { NAV_TO_LOGIN_SCENE } from '../../../redux/actions/nav.action';
// 商品名称和昵称(nicknameType: 2-昵称，1-商品名称)
const PRODUCT_NICK_NAME_TYPE = 2;

class ProductDeailBasicInfo extends Component{
  constructor(props){
    super(props);
    this.state = {
      productDetailInfo: {},
      purchaserShopName: '',  // 当前采购商门店名称
      purchaserShopID: '',    // 当前采购商门店ID
      specsObj: {},           // 购物车规格数量{ specID:specNum, ... }
      $invalidSet: Immutable.Set(),
      visible: false,
    };
  }
  componentDidMount() {
    this.setState({
      productDetailInfo: this.props.productDetailInfo,
      specsObj: this.props.specsObj,
      $invalidSet: this.props.$invalidSet,
      purchaserShopName: this.props.purchaserShopName,
      purchaserShopID: this.props.purchaserShopID,
    })
  }
  componentWillReceiveProps(nextProps){
    if(this.props.productDetailInfo !== nextProps.productDetailInfo){
      this.setState({
        productDetailInfo: nextProps.productDetailInfo,
      });
    }

    if(!Immutable.is(this.props.purchaserShopName,nextProps.purchaserShopName)) {
      this.setState({
        purchaserShopName: nextProps.purchaserShopName,
        purchaserShopID: nextProps.purchaserShopID,
      })
    }

    if(!Immutable.is(this.props.specsObj,nextProps.specsObj)) {
      this.setState({
        specsObj: nextProps.specsObj
      });
    }

    if(!Immutable.is(this.props.$invalidSet,nextProps.$invalidSet)) {
      this.setState({
        $invalidSet: nextProps.$invalidSet
      })
    }

  }

  render () {
    let { productDetailInfo, purchaserShopName } = this.state;
    let nicknames = productDetailInfo.nicknames && productDetailInfo.nicknames.filter( (nickname) => {
      return nickname.nicknameType === PRODUCT_NICK_NAME_TYPE;
    });
    return (
      <View style={styles.container}>
        <Banner productDetailInfo={productDetailInfo} />
        <View style={styles.productNameWrapper}>
          <Text style={styles.productName}>{productDetailInfo.productName}</Text>
          {
            nicknames instanceof Array && 0 !== nicknames.length ?
              <Text style={[styles.productTitle,0 === productDetailInfo.nicknames.length ? { marginBottom: 0 } : {}]}>
                {
                  nicknames.map( item => {
                    return item.nickname;
                  }).join('、')
                }
              </Text> : null
          }
        </View>
        <View style={styles.specsWrapper}>
          {
            ('' !== this.props.$user.get('token') || this.props.$user.get('token')) && purchaserShopName !== '' ?
              <View style={styles.currentShopWrapper}>
                <Text style={styles.currentShop}>当前门店</Text>
                <View style={styles.rightPart}>
                  <Text style={styles.shopTxt}>{purchaserShopName}</Text>
                  <Image style={styles.goRight} source={require('../../../imgs/rightArrow.png')}/>
                </View>
              </View> : null
          }
          {this.renderSpecsItem(productDetailInfo)}
        </View>
      </View>
    )
  }

  // 渲染规格
  renderSpecsItem = (productDetailInfo) => {
    let { specsObj, $invalidSet, purchaserShopID } = this.state;
    return (
      <View style={styles.specsList} >
        {
          productDetailInfo.specs instanceof Array && productDetailInfo.specs.map( (specsItem) => {
            let shopcartNum = 0;
            for( let key in specsObj) {
              if( parseInt(key) === specsItem.specID) {
                shopcartNum = specsObj[key];
              }
            }
            return (
              <View style={styles.specsItem} key={specsItem.specID}>
                <View style={{width: '30%', marginTop: 10}}>
                  <ChangePrice width={'auto'} price={specsItem.productPrice} suffix={specsItem.saleUnitName} big={styleConsts.H1} small={styleConsts.H5} />
                </View>
                {
                  specsItem.specContent ?
                    <View style={{ flexDirection: 'row',alignItems: 'center',width: '25%',marginTop: 10,}}>
                      <Text style={styles.specsContent}>{specsItem.specContent}/</Text>
                      <Text style={styles.specsUnit}>{specsItem.saleUnitName}</Text>
                    </View> : <View style={{width: '25%', marginTop: 10,}} />
                }
                {
                  specsItem.buyMinNum === 0 || specsItem.buyMinNum === 1 ?
                    <View style={{width: '20%',marginTop: 10,}} /> :
                    <View style={{ flexDirection: 'row',alignItems: 'center',width: '20%',marginTop: 10,}}>
                      <Text style={styles.specsContent}>{specsItem.buyMinNum}</Text>
                      <Text style={styles.specsUnit}>{specsItem.saleUnitName}起购</Text>
                    </View>
                }
                <View style={{width: '25%',alignItems: 'flex-end',}}>
                  <ProductNum
                    styles={[{marginTop: 10}]}
                    productNum={shopcartNum}
                    onChange={(val) => this.shopcartNumChange(val,specsItem,productDetailInfo.productID)}
                    disabled={$invalidSet.has(specsItem.saleUnitID)}
                    shopID={purchaserShopID}
                    buyMinNum={specsItem.buyMinNum}
                  />
                </View>
              </View>
            )
          })
        }
      </View>
    )
  };

  // 商品规格数量改变
  shopcartNumChange = (val,specsItem,productID) => {
    this.props.changeCartInfo && this.props.changeCartInfo(val,specsItem,productID);
  };

}

ProductDeailBasicInfo.PropTypes = {
  productDetailInfo: React.PropTypes.object,
  $invalidSet: React.PropTypes.array,
};
ProductDeailBasicInfo.defaultProps = {
  productDetailInfo: {},
  $invalidSet: [],
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: styleConsts.bgGrey,
  },
  productNameWrapper: {
    backgroundColor: styleConsts.white,
    paddingLeft: styleConsts.screenLeft,
    paddingRight: styleConsts.screenRight,
    marginBottom: 5,
  },
  productName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    marginTop: 10,
    marginBottom: 10,
  },
  productTitle: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey,
    marginBottom: 10,
  },
  specsWrapper: {
    backgroundColor: styleConsts.white,
    paddingLeft: styleConsts.screenLeft,
    paddingRight: 10,
    marginBottom: 10,
  },
  currentShopWrapper: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  currentShop: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  rightPart: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
  },
  goRight: {
    width: 5,
    height: 8,
    marginLeft: 5,
  },
  specsList: {
    paddingBottom: 15,
  },
  specsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  specsContent: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey,
  },
  specsUnit: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
  },
});

const mapStateToProps = (state) => {
  return {
    $user: state.user,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    navToLogin: () => {
      dispatch({type: NAV_TO_LOGIN_SCENE});
    }
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ProductDeailBasicInfo)