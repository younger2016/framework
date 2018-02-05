
import React, {
    PropTypes,
    Component,
} from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
} from 'react-native'
import { styleConsts } from '../../utils/styleSheet/styles';// 引进公用样式配置文件

export default class DefoultHeader extends Component {
    constructor(props) {
      super(props);
      this.show = null;
    }
    // shouldComponentUpdate() {
    //   return false;
    // }
    setNativeProps(arg) {
      this._header.setNativeProps(arg)
    }
    setTopStatus = (type) => { // 切换头部状态
      this._downFisrt.setNativeProps({
        style: styles.hide
      })
      this._downSeond.setNativeProps({
        style: styles.hide
      })
      this._loading.setNativeProps({
        style: styles.hide
      })
      this._successLoading.setNativeProps({
        style: styles.hide
      })
      this._failLoading.setNativeProps({
        style: styles.hide
      })
      this._timeoutLoading.setNativeProps({
        style: styles.hide
      })
      this.show = type;
      this[type].setNativeProps({
        style: styles.show
      })

    }
    render() {
      return (
        <View ref={(ref) => this._header = ref}
              style={[{height: this.props.height, justifyContent: 'flex-end', overflow: 'hidden'},this.props.style || {}]}>
            <Text></Text>
            <View style={{height: this.props.loadingFetchHeight,alignItems: 'center', justifyContent: 'center'}}>
              <View ref={(ref) => this._downFisrt = ref} style={[styles.rowList,styles.hide, this.props.show === '_downFisrt' ? styles.show : styles.hide]}>
                <Image source={require('./imgs/handle.png')} style={{width: 9.5, height: 15,tintColor: styleConsts.grey,}}/>
                <Text style={styles.statusTxt}>下拉刷新</Text>
              </View>
              <View ref={(ref) => this._downSeond = ref} style={[styles.rowList, this.props.show === '_downSeond' ? styles.show : styles.hide]}>
                <Image source={require('./imgs/upHandle.png')} style={{width: 9.5, height: 15,tintColor: styleConsts.grey,}}/>
                <Text style={styles.statusTxt}>释放立即刷新</Text>
              </View>
              <View ref={(ref) => this._loading = ref} style={[styles.rowList, this.props.show === '_loading' || this.show ===  '_loading' ? styles.show : styles.hide]}>
                <Image source={require('./imgs/loading.gif')} style={{height: 20, width: 20,tintColor: styleConsts.grey,}}/>
                <Text style={styles.statusTxt}>刷新中...</Text>
              </View>
              <View ref={(ref) => this._successLoading = ref} style={[styles.rowList, this.props.show === '_successLoading' || this.show ===  '_successLoading'  ? styles.show : styles.hide]}>
                <Image source={require('./imgs/success.png')} style={{height: 16, width: 16,tintColor: styleConsts.grey,}}/>
                <Text style={styles.statusTxt}>刷新成功</Text>
              </View>
              <View ref={(ref) => this._failLoading = ref} style={[styles.rowList, this.props.show === '_failLoading' || this.show ===  '_failLoading'  ? styles.show : styles.hide]}>
                <Image source={require('./imgs/fail.png')} style={{height: 16, width: 16,tintColor: styleConsts.grey,}}/>
                <Text style={styles.statusTxt}>刷新失败</Text>
              </View>
              <View ref={(ref) => this._timeoutLoading = ref} style={[styles.rowList,this.props.show === '_timeoutLoading' || this.show ===  '_timeoutLoading'  ? styles.show : styles.hide]}>
                <Image source={require('./imgs/fail.png')} style={{height: 16, width: 16,tintColor: styleConsts.grey,}}/>
                <Text style={styles.statusTxt}>请求超时</Text>
              </View>
            </View>
          </View>
      )
    }
}
const styles = StyleSheet.create({
  show: {
    position: 'relative',
    left: 0,
  },
  hide: {
    position: 'absolute',
    left: -10000,
  },
  rowList: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.middleGrey,
    marginLeft: 10,
  },
})
