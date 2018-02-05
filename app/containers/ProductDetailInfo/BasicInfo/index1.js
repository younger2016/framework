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
      shopsInfo: [],          // 购物车中商品劣币哦啊
      $invalidSet: Immutable.Set(),
      visible: false,
    };
    this.height = 0;          // 商品页内容高度
  }
  componentDidMount() {
    this.setState({
      productDetailInfo: this.props.productDetailInfo,
      shopsInfo: this.props.shopsInfo,
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

    if(!Immutable.is(this.props.shopsInfo,nextProps.shopsInfo)) {
      let specsObj = {};
      nextProps.shopsInfo.forEach( (item) => {
        item.specs.forEach( (specItem) => {
          specsObj[specItem.specID] = specItem.shopcartNum;
        });
      });
      this.setState({ specsObj });
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
      <View style={styles.container} ref={(ref) => this.basicInfoRef = ref} onLayout={(e) => this.onLayout(e)}>
        {/*<ScrollView>*/}
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
              <TouchableWithoutFeedback onPress={ () => this.props.show()}>
                <View style={styles.currentShopWrapper}>
                  <Text style={styles.currentShop}>当前门店</Text>
                  <View style={styles.rightPart}>
                    <Text style={styles.shopTxt}>{purchaserShopName}</Text>
                    <Image style={styles.goRight} source={require('../../../imgs/rightArrow.png')}/>
                  </View>
                </View>
              </TouchableWithoutFeedback> : null
            }
            {this.renderSpecsItem(productDetailInfo)}
          </View>
        {/*</ScrollView>*/}
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
                <View style={{width: '25%',marginTop: 12,}}>
                  <ChangePrice width={80} price={specsItem.productPrice} suffix={specsItem.saleUnitName} big={styleConsts.H1} small={styleConsts.H5} />
                </View>
                <View style={{width: '25%'}}>
                {
                  !!specsItem.specContent&& <View style={{ flexDirection: 'row',alignItems: 'center',width: '25%',marginTop: 12,}}>
                    <Text style={styles.specsContent}>{specsItem.specContent}/</Text>
                    <Text style={styles.specsUnit}>{specsItem.saleUnitName}</Text>
                  </View>
                }
                </View>
                {
                  specsItem.buyMinNum === 0 || specsItem.buyMinNum === 1 ?
                    <View style={{width: '25%',marginTop: 12,}} /> :
                    <View style={{ flexDirection: 'row',alignItems: 'center',width: '25%',marginTop: 12,}}>
                      <Text style={styles.specsContent}>{specsItem.buyMinNum}</Text>
                      <Text style={styles.specsUnit}>{specsItem.saleUnitName}起购</Text>
                    </View>
                }
                <View style={{width: '25%',alignItems: 'flex-end',}}>
                  <ProductNum
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
    this.props.onChangeSpecNum && this.props.onChangeSpecNum(val,specsItem,productID);
  };

  // 当布局改变时获取此时内容高度
  onLayout = (e) => {
    this.height = e.nativeEvent.layout.height;
    // measure方法时时获取内容高度
    this.basicInfoRef.measure((x,y,width,height,left,top) => {
      this.height = height;
      this.props.getContentHeight instanceof Function && this.props.getContentHeight(this.height);
    })
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
    //flex: 1,
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