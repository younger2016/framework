/**
 * 店内搜索商品
 */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { StyleSheet, View, Modal, TextInput, Image, TouchableWithoutFeedback, Text, Keyboard, Animated, Platform, StatusBar } from 'react-native'
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');
import { styleConsts } from '../../../../utils/styleSheet/styles'
import { NAV_SEARCH_PRODUCTLIST_RESULT } from '../../../../redux/actions/nav.action'

class SearchModal extends Component{
  constructor(props){
    super(props)
    this.state = {
      keyWord: '',  // 关键字
    }
  }
  render() {
    const { visible, modalShowOrClose } = this.props
    return (
      <Modal visible={visible} transparent={true} onRequestClose={() => modalShowOrClose()}>
        <TouchableWithoutFeedback onPress={() => modalShowOrClose()}>
          <View style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor='rgba(0,0,0,0.4)' translucent={true} />
            <View style={styles.wrapper}>
              <Animated.View style={[styles.textInputWrapper, {opacity: this.props.opacity}]}>
                <TextInput
                  style={styles.textInput}
                  keyboardType={'default'}
                  placeholder='搜本店'
                  placeholderTextColor={styleConsts.deepGrey}
                  underlineColorAndroid="transparent"
                  value={this.state.keyWord}
                  returnKeyType="search"
                  autoFocus={true}
                  onChangeText={(text) => this.setState({ keyWord: text })}
                  onSubmitEditing={() => this.onSearchPress()}
                  ref={(ref) => this._inputBar = ref}
                />
                <Image style={styles.search} source={require('../../../../components/HeaderSwitchShop/imgs/search.png')} />
              </Animated.View>
              <TouchableWithoutFeedback onPress={() => modalShowOrClose()}>
                <View style={styles.txtWrapper}>
                  <Text style={styles.txt}>取消</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    )
  }

  /**
   * 搜索结果页返回时弹窗显示，输入框获得焦点(如果弹窗不显示的话，this._inputBar找不到)
   */
  focusCallback = () => {
    this.props.modalShowOrClose();
    setTimeout(() => {
      this._inputBar.focus()
    })
  }

  /**
   * 搜索时跳转到搜索结果页
   * @returns {*}
   */
  onSearchPress = () => {
    const { keyWord } = this.state
    // 若没有关键字时点击搜索键盘收起
    if('string' === typeof keyWord && '' === keyWord.trim()){
      return  Keyboard.dismiss();
    }
    this.props.modalShowOrClose()
    Keyboard.dismiss();
    this.props.goToSeachPro({ keyWord, backCall: this.focusCallback })
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  wrapper: {
    flexDirection: 'row',
    paddingLeft: 10,
  },
  textInputWrapper: {
    width: width - 44 - 10,
    height: 44,
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 16,
  },
  search: {
    width: 12.5,
    height: 12.5,
    position: 'absolute',
    left: 10,
    tintColor: styleConsts.middleGrey,
  },
  textInput: {
    height: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.white,
    fontSize: styleConsts.H4,
    color: styleConsts.deepGrey,
    paddingLeft: 10 + 16 + 10,
    padding: 0,
    borderRadius: 16,
    backgroundColor: styleConsts.bgSeparate,
  },
  txtWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: {
    fontSize: styleConsts.H3,
    color: styleConsts.white,
  }
})

const mapStateToProps = (state) => {
  return {

  }
}
const mapDispatchToProps = (dispatch) => {
  return {
    // 搜索商品
    goToSeachPro: (opts) => {
      dispatch({type: NAV_SEARCH_PRODUCTLIST_RESULT, payload: opts})
    },
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(SearchModal)