/**
 * 采购清单头部
 */
import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, } from 'react-native';
import { styleConsts } from '../../../utils/styleSheet/styles';


class HeaderWidthShopInfoAndSort extends Component{
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  render() {
    let { navigation, navToFilterPurchaseList, } = this.props;

    return (
      <View style={styles.headerWrapper}>
        <View style={{flexDirection: 'row',alignItems: 'center'}}>
          <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
            <View style={styles.imgWrapper}>
              <Image style={styles.goBackImg} source={require('../../../components/HeaderBar/imgs/goback.png')} />
            </View>
          </TouchableWithoutFeedback>
          <Text numberOfLines={1} style={styles.title}>门店门店门店门店门店门店门店门店门店店门店门店</Text>
        </View>
        <View style={{flexDirection: 'row',}}>
          <TouchableWithoutFeedback onPress={() => navToFilterPurchaseList()}>
            <View style={styles.imgWrapper}>
              <Image style={styles.goBackImg} source={require('../../../components/HeaderBar/imgs/goback.png')}  />
              <Text style={styles.txt}>筛选</Text>
            </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.imgWrapper}>
              <Image style={styles.goBackImg} source={require('../../../components/HeaderBar/imgs/goback.png')}  />
              <Text style={styles.txt}>编辑</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  headerWrapper: {
    height: styleConsts.headerHeight,
    paddingTop: styleConsts.headerPaddingTop,
    alignItems: 'center',
    backgroundColor: styleConsts.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  imgWrapper: {
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
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    width: 135,
  },
  txt: {
    fontSize: styleConsts.H5,
    color: styleConsts.darkGrey,
    marginTop: 5,
  }
});
export default HeaderWidthShopInfoAndSort
