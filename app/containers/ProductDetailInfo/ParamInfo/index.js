/**
 * 商品详情中的参数
 */
import React,{ Component } from 'react';
import { StyleSheet, View, Text, Image, ScrollView } from 'react-native';
import Immutable from 'immutable';
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');
import { styleConsts } from '../../../utils/styleSheet/styles';

class ProductDetailParamInfo extends Component{
  constructor(props){
    super(props);
    this.state = {
      productDetailInfo: {},
    }
  }
  componentDidMount() {
    this.setState({
      productDetailInfo: this.props.productDetailInfo,
    })
  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.productDetailInfo,nextProps.productDetailInfo)){
      this.setState({
        productDetailInfo: nextProps.productDetailInfo,
      })
    }
  }
  render () {
    let { productDetailInfo } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.basicInfo}>
          <View style={styles.titleWrapper}>
            <Image style={styles.image} source={require('./../imgs/left.png')} />
            <Text style={styles.title}>规格参数</Text>
            <Image style={styles.image} source={require('./../imgs/right.png')} />
          </View>
          <View style={styles.tableWrapper}>
            <View style={styles.tableRow}>
              <View style={styles.txtLeftWrapper}>
                <Text style={styles.txtLeft}>商品产地</Text>
              </View>
              <View style={styles.txtRightWrapper}>
                <Text style={styles.txtRight}>
                  {
                    productDetailInfo.placeProvince && productDetailInfo.placeCity !== '' ?
                      `${productDetailInfo.placeProvince}-${productDetailInfo.placeCity}` :
                      productDetailInfo.placeProvince && productDetailInfo.placeCity === '' ?
                          `${productDetailInfo.placeProvince}` : '无'
                  }
                  </Text>
              </View>
            </View>
            <View style={[styles.tableRow,styles.noTopBorder]}>
              <View style={styles.txtLeftWrapper}>
                <Text style={styles.txtLeft}>生产厂家</Text>
              </View>
              <View style={styles.txtRightWrapper}>
                <Text style={styles.txtRight}>
                  {
                    productDetailInfo.producer ?
                      productDetailInfo.producer : '无'
                  }
                </Text>
              </View>
            </View>
            <View style={[styles.tableRow,styles.noTopBorder]}>
              <View style={styles.txtLeftWrapper}>
                <Text style={styles.txtLeft}>保质期</Text>
              </View>
              <View style={styles.txtRightWrapper}>
                <Text style={styles.txtRight}>
                  {
                    productDetailInfo.guaranteePeriod ?
                      `${productDetailInfo.guaranteePeriod}天` : '无'
                  }
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  basicInfo: {
    backgroundColor: styleConsts.white,
    paddingLeft: styleConsts.screenLeft,
    paddingRight: styleConsts.screenRight,
    marginTop: 10,
    marginBottom: 5,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 15,
  },
  image: {
    width: 17.5,
    height: 9,
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.mainColor,
    marginLeft: 5,
    marginRight: 5,
  },
  tableWrapper: {
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  txtLeftWrapper: {
    width: 85,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  txtRightWrapper: {
    width: width-106,
    justifyContent: 'center',
  },
  txtLeft: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  txtRight: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    marginLeft: 15,
  },
  noTopBorder: {
    borderTopWidth: 0,
  }
});
export default ProductDetailParamInfo