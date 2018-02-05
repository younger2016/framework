/**
 *模态框选择器
 */

import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Animated } from 'react-native'
import Picker from '../react-native-roll-picker'

import Dimensions from 'Dimensions';


const AnimatedList = Animated.createAnimatedComponent(View);

const { height } = Dimensions.get('window');

class SelectModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      nowHeight: new Animated.Value(0),
      height: 0,
      opticty: new Animated.Value(0),

    };
  }

  show = () => {
    this.setState({
      height,
    })
    Animated.parallel([
      Animated.timing(
        this.state.opticty,
        {
          toValue: 0.4,
          duration: 150,
        }
      ).start(),
      Animated.timing(
        this.state.nowHeight,
        {
          toValue: 232,
          duration: 200,
        }
      ).start()
    ])


  }
  hide = () => {
    Animated.parallel([
      Animated.timing(
        this.state.opticty,
        {
          toValue: 0,
          duration: 150,
        }
      ).start(),
      Animated.timing(
        this.state.nowHeight,
        {
          toValue: 0,
          duration: 200,
        }
      ).start()
    ])
    this.timer = setTimeout(() => {
      this.setState({height: 0})
    }, 200)

  }
  componentWillUnmount() {
    this.timer && clearTimeout(this.timer)
  }
  render() {
    const { dataList, keyName, refName, selectOn } = this.props;
    return (
      <View style={[styles.popSelect, { height: this.state.height }]} >
        <TouchableWithoutFeedback onPress={this.hide}>
            <AnimatedList style={[styles.optictyBg,{opacity: this.state.opticty}]}></AnimatedList>
        </TouchableWithoutFeedback>
        <AnimatedList style={[styles.selectCenter, { height: this.state.nowHeight }]}>
          <Picker
            data={dataList}
            ref={refName}
            name={keyName}
            onRowChange={(index) => { selectOn(index) }}
          />
        </AnimatedList>
      </View>

    )
  }
}
/**
 *  dataList: 数据,
 *  selectOn: 选中回调，
 *  keyName: 遍历的key
 *  refName:picker的Id
 */

SelectModal.defaultProps = {
  dataList: [],
  selectOn: () => {},
  keyName: 'title',
  refName: 'showModal',
};

SelectModal.PropTypes = {
  dataList: PropTypes.array,
  selectOn: PropTypes.func,
  keyName: PropTypes.string,
  refName: PropTypes.string,

};

const styles = StyleSheet.create({
  popSelect: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: 0,
    alignItems: 'center',
    overflow: 'hidden',
  },
  optictyBg: {
    height: '100%',
    width: '100%',
    backgroundColor: '#000',
  },
  selectCenter: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});

export default SelectModal;
