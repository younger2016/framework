/**
 * 头部
 */

import React, { Component, PropTypes } from 'react'
import { Text, View, StyleSheet, TouchableWithoutFeedback, Image, StatusBar } from 'react-native'
import I18n from 'react-native-i18n'
import { connect } from 'react-redux'
import {styleConsts} from '../../utils/styleSheet/styles';// 引进公用样式配置文件
class HeaderBar extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.$tabNav.toJS().index === 2 || nextProps.$route.routes.length > 1){
      StatusBar.setBarStyle('dark-content');
    }
  }
  render() {
    const { title, cancelCallback, cancelHide, rightText, goBackHide, navigation } = this.props;
    return (
      <View style={styles.headerBar}>
        <StatusBar barStyle={'dark-content'} backgroundColor={styleConsts.white} translucent={true}/>
        <View style={styles.center}>
          <Text style={styles.title}>{title}</Text>
        </View>
        {
          (!goBackHide && navigation) ?
            <TouchableWithoutFeedback onPress={this.onPressGoback}>
              <View style={styles.left}>
                <Image
                  style={styles.backImg}
                  source={require('./imgs/goback.png')}
                />
              </View>
            </TouchableWithoutFeedback> : <Text />
        }
        {
          !cancelHide &&
          <TouchableWithoutFeedback onPress={cancelCallback}>
           <View style={styles.right}>
            <Text style={styles.rightText}>{rightText || I18n.t('cancel') }</Text>
           </View>
          </TouchableWithoutFeedback>
        }
      </View>
    )
  }
  onPressGoback = () => {
    if (this.props.goBackCallBack instanceof Function) {
      this.props.goBackCallBack();
    } else {
      this.props.navigation.goBack();
    }
  };
}

/**
 *title：头部标题
 *cancelCallback:取消回调，右边的回调
 *goBackCallBack,返回的回调
 *cancelHide: 是否渲染右边
 *rightText：右边的文字
*/

HeaderBar.defaultProps = {
  title: '',
  cancelHide: false,
  cancelCallback: () => {},
};
HeaderBar.PropTypes = {
  title: PropTypes.string,
  cancelCallback: PropTypes.func,
  goBackCallBack: PropTypes.func,
  cancelHide: PropTypes.bool,
};

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: styleConsts.headerHeight - StyleSheet.hairlineWidth,
    alignItems: 'center',
    paddingTop: styleConsts.headerPaddingTop,
    backgroundColor: styleConsts.white,
    position: 'relative',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  imgWrapper: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backImg: {
    tintColor: styleConsts.darkGrey,
    width: 9,
    height: 16,
  },
  title: {
    fontSize: styleConsts.H1,
    color: styleConsts.deepGrey,
  },
  rightText: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  right: {
    height: styleConsts.headerHeight,
    paddingTop: styleConsts.headerPaddingTop,
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    paddingRight: 10,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  left: {
    position: 'absolute',
    left: 0,
    width: 54,
    justifyContent: 'center',
    alignItems: 'center',
    height: styleConsts.headerHeight,
    paddingTop: styleConsts.headerPaddingTop,
  },
  headerSearch: {
    width: 18,
    height: 18,
    marginRight: 10,
  }
});

const mapStateToProps = (state) => {
  return {
    $tabNav: state.tabNav,
    $route: state.nav,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {

  }
};
export default connect(mapStateToProps, mapDispatchToProps)(HeaderBar)
