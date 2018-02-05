/**
 * 商品详情头部tab切换
 */
import React,{ Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, StatusBar } from 'react-native';
import { styleConsts } from '../../../utils/styleSheet/styles';
import { productDetailHeaderInfo } from '../config';

class ProductDetailInfoHeader extends Component{
  constructor(props){
    super(props);
    this.state = {

    };
  }
  render(){
    let { showIndex, navigation } = this.props;
    return (
      <View style={styles.headerWrapper}>
        <StatusBar barStyle='dark-content' backgroundColor={styleConsts.white} translucent={true} />
        <TouchableWithoutFeedback onPress={ () => navigation.goBack()}>
          <View style={styles.goBackImgWrapper}>
            <Image style={styles.goBackImg} source={require('../../../components/HeaderBar/imgs/goback.png')} />
          </View>
        </TouchableWithoutFeedback>
        <View style={styles.headerTabBar}>
          {
            productDetailHeaderInfo.map((item,index)=>{
              return (
                <TouchableWithoutFeedback key={item.id} onPress={() => {}}>
                  <View style={[
                    styles.headerTitleWrapper,
                    index === 0 ? {} : styles.titleMarginLeft,
                    showIndex === index ? styles.activeHeaderBar : styles.headerBottom
                  ]}>
                    <Text style={styles.headerTitle}>{item.title}</Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            })
          }
        </View>
        <View style={{width: 44,height: styleConsts.headerHeight,}} />
      </View>
    )
  }
}
const styles = StyleSheet.create({
  headerWrapper: {
    height: styleConsts.headerHeight - StyleSheet.hairlineWidth,
    paddingTop: styleConsts.headerPaddingTop,
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  goBackImgWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackImg: {
    width: 9,
    height: 16,
    tintColor: styleConsts.darkGrey,
  },
  headerTabBar: {
    flexDirection: 'row',
    width: 190,
    height: 44,
  },
  headerTitleWrapper: {
    width: 50,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleMarginLeft: {
    marginLeft: 20,
  },
  activeHeaderBar: {
    borderBottomWidth: 2,
    borderColor: styleConsts.darkGrey,
  },
  headerBottom: {
    borderBottomWidth: 2,
    borderColor: styleConsts.white,
  },
  headerTitle: {
    fontSize: styleConsts.H2,
    color: styleConsts.deepGrey,
  }
});
export default ProductDetailInfoHeader