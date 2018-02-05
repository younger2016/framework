//
// import React, {
//     PropTypes,
//     Component,
// } from 'react'
// import {
//     View,
//     Text,
//     Image,
//     StyleSheet,
//     Animated,
//     Easing
// } from 'react-native'
// import cssConfig from '../../utils/styleSheet/css.config';// 引进公用样式配置文件
//
// export default class DefoultFooter extends Component {
//     constructor(props) {
//       super(props);
//       this.state={
//         height: new Animated.Value(0)
//       }
//       this.props.show = null;
//     }
//     // shouldComponentUpdate() {
//     //   return false;
//     // }
//     setBoxHeight(height) {
//       this._header.setNativeProps({
//         style: {
//           height,
//           justifyContent: 'flex-start',
//           overflow: 'hidden'
//         }
//       })
//     }
//     setNativeProps(arg) {
//       this._header.setNativeProps(arg)
//     }
//     setTopStatus = (type) => { // 切换头部状态
//       console.log(type)
//       this._loading.setNativeProps({
//         style: styles.hide
//       })
//       this._noMore.setNativeProps({
//         style: styles.hide
//       })
//       this._failLoading.setNativeProps({
//         style: styles.hide
//       })
//       this._timeoutLoading.setNativeProps({
//         style: styles.hide
//       })
//       this[type].setNativeProps({
//         style: styles.show
//       })
//
//     }
//     render() {
//       return (
//         <View ref={(ref) => this._header = ref}
//               style={[{height: this.props.height, justifyContent: 'flex-end', overflow: 'hidden'},this.props.style || {}]}>
//             <View style={{height: this.props.loadingFetchHeight,alignItems: 'center', justifyContent: 'center',}}>
//               <View ref={(ref) => this._loading = ref} style={[styles.rowList, this.props.show === '_loading'  ? styles.show : styles.hide]}>
//                 <Image source={require('./imgs/loading.gif')} style={{height: 36, width: 36}}/>
//                 <Text style={styles.statusTxt}>加载中...</Text>
//               </View>
//               <View ref={(ref) => this._noMore = ref} style={[styles.rowList, this.props.show === '_noMore' ? styles.show : styles.hide]}>
//                 <Text style={styles.statusTxt}>没有更多了</Text>
//               </View>
//               <View ref={(ref) => this._failLoading = ref} style={[styles.rowList, this.props.show === '_failLoading' ? styles.show : styles.hide]}>
//                 <Image source={require('./imgs/fail.png')} style={{height: 22, width: 22}}/>
//                 <Text style={styles.statusTxt}>加载失败</Text>
//               </View>
//               <View ref={(ref) => this._timeoutLoading = ref} style={[styles.rowList,this.props.show === '_timeoutLoading' ? styles.show : styles.hide]}>
//                 <Image source={require('./imgs/fail.png')} style={{height: 22, width: 22}}/>
//                 <Text style={styles.statusTxt}>请求超时</Text>
//               </View>
//             </View>
//           </View>
//       )
//     }
// }
// const styles = StyleSheet.create({
//   show: {
//     position: 'relative',
//     left: 0,
//   },
//   hide: {
//     position: 'absolute',
//     left: -10000,
//   },
//   rowList: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   statusTxt: {
//     fontSize: cssConfig.textFont.h3,
//     color: cssConfig.textColor.c3,
//     marginLeft: 10,
//   },
// })


import React, {
    PropTypes,
    Component,
} from 'react'
import {
    View,
    Text,
    Image,
    StyleSheet,
    Animated,
    Easing
} from 'react-native'
import { styleConsts } from '../../utils/styleSheet/styles';// 引进公用样式配置文件


export default class DefoultFooter extends Component {
    constructor(props) {
      super(props);
      this.state={
        height: new Animated.Value(0)
      }
      this.props.show = null;
    }
    // shouldComponentUpdate() {
    //   return false;
    // }
    setNativeProps(arg) {
          this._header.setNativeProps(arg)
        }
    setBoxHeight(height) {
      this._header.setNativeProps({
        style: {
          height,
          justifyContent: 'flex-start',
          overflow: 'hidden'
        }
      })
    }
    setTopStatus = (type) => { // 切换头部状态
      this[type].setNativeProps({
        style: styles.show
      })
      this._loading.setNativeProps({
        style: styles.hide
      })
      this._noMore.setNativeProps({
        style: styles.hide
      })
      this._failLoading.setNativeProps({
        style: styles.hide
      })
      this._timeoutLoading.setNativeProps({
        style: styles.hide
      })
      this[type].setNativeProps({
        style: styles.show
      })

    }
    render() {
      return (
        <View ref={(ref) => this._header = ref}
              style={[{height: this.props.height, justifyContent: 'flex-end', overflow: 'hidden'},this.props.style]}>
            <View style={{height: this.props.loadingFetchHeight,alignItems: 'center', justifyContent: 'center'}}>
              <View ref={(ref) => this._loading = ref} style={[styles.rowList, this.props.show === '_loading'  ? styles.show : styles.hide]}>
                <Image source={require('./imgs/loading.gif')} style={{height: 20, width: 20,tintColor: styleConsts.grey,}}/>
                <Text style={styles.statusTxt}>加载中...</Text>
              </View>
              <View ref={(ref) => this._noMore = ref} style={[styles.rowList, this.props.show === '_noMore' ? styles.show : styles.hide]}>
                <Text style={styles.statusTxt}>崩拽了,见底儿了</Text>
              </View>
              <View ref={(ref) => this._failLoading = ref} style={[styles.rowList, this.props.show === '_failLoading' ? styles.show : styles.hide]}>
                <Image source={require('./imgs/fail.png')} style={{height: 16, width: 16,tintColor: styleConsts.grey,}}/>
                <Text style={styles.statusTxt}>加载失败</Text>
              </View>
              <View ref={(ref) => this._timeoutLoading = ref} style={[styles.rowList,this.props.show === '_timeoutLoading' ? styles.show : styles.hide]}>
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
    fontSize: styleConsts.H5,
    color: styleConsts.middleGrey,
    marginLeft: 10,
  },
})
