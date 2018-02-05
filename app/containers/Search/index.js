/**
 * Created by chenshuang on 2017/8/7.
 */

import React from 'react'
import { View, Text, TextInput, Image, TouchableWithoutFeedback, StyleSheet, Keyboard, StatusBar } from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'
import { styleConsts } from '../../utils/styleSheet/styles'
import DropDownList from '../../components/DropDownList';
import {NAV_TO_SEARCH_SHOP_MAIN_PAGE, NAV_SEARCH_PRODUCTLIST_RESULT} from '../../redux/actions/nav.action'
import I18n from 'react-native-i18n';
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');
import Platform from 'Platform';

export class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      keyWord: '',           // 关键字
      selected: '001',       // 搜索店铺还是商品，默认是商品
    }
  }
  componentDidMount() {
    StatusBar.setBarStyle('dark-content')
  }
  render(){
    return (
      <View style={{flex: 1, backgroundColor: styleConsts.bgGrey}}>
        <View style={styles.searchTop}>
          <StatusBar barStyle="dark-content" backgroundColor={styleConsts.white} translucent={true} />
          <View style={[styles.searchCenter, styles.flowRow]}>
            <DropDownList
              data={[
                {label: I18n.t('product'), value: '001'},
                {label: I18n.t('shops'), value: '002'}
              ]}
              style={styles.dropDownStyle}
              itemStyle={styles.itemStyle}
              itemTxtStyle={styles.itemTxtStyle}
              listModal={styles.listModal}
              onChange={(value) => this.setState({selected: value})}
              showIcon = {<Icon name={'ios-arrow-down'} size={14} />}
            />
            <TextInput
              style={styles.inputBar}
              placeholder={I18n.t('searchRemind')}
              returnKeyType="search"
              value={this.state.keyWord}
              autoFocus={true}
              ref='inputBar'
              placeholderTextColor={styleConsts.middleGrey}
              onChangeText={(text) => this.setState({keyWord: text})}
              onSubmitEditing={() => this.onSearchPress()}
              selectionColor={styleConsts.mainColor}
              underlineColorAndroid="transparent"
            />
          </View>
          <TouchableWithoutFeedback onPress={this.cancel}>
            <View style={styles.searchCancel}>
              <Text style={{color: styleConsts.deepGrey, fontSize: styleConsts.H3}}>{I18n.t('cancel')}</Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 75}}>
          <Image source={require('../../imgs/searchPla.png')} style={{height: 150.5, width: 164,}}/>
          <Text style={{color: styleConsts.middleGrey, fontSize: styleConsts.H3, marginTop: 15}}>{I18n.t('searchPla')}</Text>
        </View>
      </View>
    )
  }

  // 取消
  cancel = () => {
    Keyboard.dismiss();
    this.props.navigation.goBack();
  };

  // 获得焦点
  backCall = () => {
    this.refs.inputBar.focus()
  };

  // 点击搜索
  onSearchPress = () => {
    // 若没有关键字时点击搜索键盘收起
    if('string' === typeof this.state.keyWord && '' === this.state.keyWord.trim()){
      return  Keyboard.dismiss();
    }
    // 搜索商品
    if('001' === this.state.selected){
      return this.props.goToSeachPro({keyWord: this.state.keyWord, backCall: this.backCall})
    }
    // 搜索店铺
    return this.props.gotoSearchShop({keyWord: this.state.keyWord, backCall: this.backCall})
  }
}

const styles = StyleSheet.create({
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  searchTop: {
    paddingLeft: 10,
    paddingBottom: 0,
    paddingTop: styleConsts.headerPaddingTop,
    height: styleConsts.headerHeight,
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputBar: {
    height: 30,
    fontSize: styleConsts.H4,
    textAlign: 'left',
    color: styleConsts.deepGrey,
    width: width - 30 - 46 - 50,
    padding: 0,
  },
  searchCenter: {
    backgroundColor: styleConsts.lightGrey,
    flex: 1,
    justifyContent: 'center',
    borderRadius: 16,
  },
  searchImg: {
    width: 16,
    height: 16,
    marginLeft: 15,
    marginRight: 15,
    tintColor: styleConsts.middleGrey,
  },
  listModal: {
    top: Platform.OS === 'ios' ? 60 : 40,
  },
  searchCancel: {
    paddingLeft: 10,
    paddingRight: 10,
    height: styleConsts.headerHeight,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

const mapStateToProps = (state) => {
  return {

  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 搜索店铺
    gotoSearchShop: (opts) => {
      dispatch({type: NAV_TO_SEARCH_SHOP_MAIN_PAGE, payload: opts})
    },
    // 搜索商品
    goToSeachPro: (opts) => {
      dispatch({type: NAV_SEARCH_PRODUCTLIST_RESULT, payload: opts})
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Search)
