/**
 * 商品/店铺搜索结果页、商品列表页 带有返回的搜索框
 */
import React, { Component, PropTypes } from 'react'
import { Text, View, StyleSheet, TouchableWithoutFeedback, Image, StatusBar } from 'react-native'
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');
import {styleConsts} from '../../utils/styleSheet/styles';

class SearchBtn extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { title, onPressCenter, type, } = this.props;
    return (
      <View style={styles.headerBar}>
        <StatusBar barStyle="dark-content" backgroundColor={styleConsts.white} translucent={true} />
        <TouchableWithoutFeedback onPress={this.onPressGoback}>
          <View style={styles.left}>
            <Image style={styles.backImg} source={require('../HeaderBar/imgs/goback.png')}/>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback onPress={onPressCenter}>
          <View style={styles.center}>
            <Image style={styles.searchImg} source={require('../HeaderSearchBtn/imgs/search.png')} />
            <Text style={[styles.title, type === 'productList' && { color: styleConsts.middleGrey}]} numberOfLines={1}>
              {
                title ? title : '客官~你想买点什么'
              }
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

  // 返回键
  onPressGoback = () => {
    this.props.navigation && this.props.navigation.goBack();
  };

}

/**
 * title：头部标题
 * onPressCenter: 点击模拟输入框返回到搜索输入关键字页
 * type: 标示哪个页面，在商品列表页时输入框内字体颜色淡色
*/

SearchBtn.defaultProps = {
  title: '',
  onPressCenter: () => {},
  type: '',
};
SearchBtn.PropTypes = {
  title: PropTypes.string,
  onPressCenter: PropTypes.func,
  type: PropTypes.string,
};

const styles = StyleSheet.create({
  headerBar: {
    height: styleConsts.headerHeight - StyleSheet.hairlineWidth,
    paddingTop: styleConsts.headerPaddingTop,
    backgroundColor: styleConsts.white,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    flexDirection: 'row',
  },
  backImg: {
    tintColor: styleConsts.darkGrey,
    width: 9,
    height: 16,
  },
  title: {
    fontSize: styleConsts.H4,
    color: styleConsts.deepGrey,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    height: 30,
    borderRadius: 16,
    paddingRight: 15,
    flexDirection: 'row',
    maxWidth: width - 44,
    backgroundColor: styleConsts.lightGrey
  },
  left: {
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
    height: styleConsts.headerHeight,
  },
  searchImg: {
    width: 16,
    height: 16,
    marginRight: 10,
    marginLeft: 10,
    tintColor: styleConsts.middleGrey,
  },
});
export default SearchBtn
