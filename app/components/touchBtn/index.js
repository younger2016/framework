// 具有延时的按钮
// 均提供手动控制disable --- forceDisable
import { TouchableWithoutFeedback, TouchableHighlight } from 'react-native';
import React, { Component, PropTypes } from 'react';

export class TouchableWithoutFeedbackD extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.disabled = true;
  }
  componentWillMount() {
    this.timer && clearTimeout(this.timer)
  }
  render() {
    const { onPress, ...other } = this.props;
    return (
      <TouchableWithoutFeedback
        {...other}
        onPress={() => this.onPress()}
      >
        {this.props.children}
      </TouchableWithoutFeedback>
    )
  }
   // 点击操作
   onPress = async () => {
     const { onPress, delayTime, repeatCallback, delayTimePass } = this.props;
     if (this.disabled) {
       if (delayTime >= 0) { // 进行恢复
         this.disabled = false
         this.timer = setTimeout(async () => {
           await (this.disabled = true)
           await delayTimePass(this)
         }, delayTime)
       }
       onPress instanceof Function && onPress()
     } else {
       repeatCallback()
     }
   }
   forceDisable = (disabled) => { // 强制修改disable
     this.timer && clearTimeout(this.timer);
     this.disabled = disabled;
   }
}
/**
  *delayTime,延时多久，这个按钮可以再次点击
  *repeatCallback,在不可点击的时候点击了的回调，一般用于提示用户操频繁
  *delayTimePass,已经过了延时，恢复成了可点击的回调，主要用于，预定义的延时过去了，但是想要的结果还是没有出现，
  *还在等待某个状态的改变按钮菜才能点击，这个时候就把disable强制又改成false,这个函数会把当前组件传给你，所以可以直接修改disable
*/
TouchableWithoutFeedbackD.defaultProps = {
  delayTime: -1,
  repeatCallback: () => {},
  delayTimePass: () => {},
}
TouchableWithoutFeedbackD.PropTypes = {
  delayTime: PropTypes.number,
  repeatCallback: PropTypes.func,
  delayTimePass: PropTypes.func,
}

export class TouchableHighlightD extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.disabled = true;
  }
  componentWillMount() {
    this.timer && clearTimeout(this.timer)
  }
  render() {
    const { onPress, ...other } = this.props;
    return (
      <TouchableHighlight
        {...other}
        onPress={() => this.onPress()}
      >
        {this.props.children}
      </TouchableHighlight>
    )
  }
  // 点击操作
  onPress = () => {
    const { onPress, force, delayTime, repeatCallback, delayTimePass } = this.props;
    if (this.disabled) {
      if (delayTime >= 0) { // 进行恢复
        this.disabled = false
        this.timer = setTimeout(async () => {
          await (this.disabled = true)
          await delayTimePass(this)
        }, delayTime)
      }
      onPress instanceof Function && onPress()
    } else {
      repeatCallback()
    }
  }
  forceDisable = (disabled) => { // 强制修改disable
    this.timer && clearTimeout(this.timer);
    this.disabled = disabled;
  }
}
/**
 *delayTime,延时多久，这个按钮可以再次点击
 *repeatCallback,在不可点击的时候点击了的回调，一般用于提示用户操频繁
 *delayTimePass,已经过了延时，恢复成了可点击的回调，主要用于，预定义的延时过去了，但是想要的结果还是没有出现，
 *还在等待某个状态的改变按钮菜才能点击，这个时候就把disable强制又改成false,这个函数会把当前组件传给你，所以可以直接修改disable
*/
TouchableHighlightD.defaultProps = {
  delayTime: -1,
  repeatCallback: () => {},
  delayTimePass: () => {},
}
TouchableHighlightD.PropTypes = {
  delayTime: PropTypes.number,
  repeatCallback: PropTypes.func,
  delayTimePass: PropTypes.func,
}
