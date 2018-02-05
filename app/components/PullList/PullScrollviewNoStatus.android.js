// by lixiaozhang
// 刷新必须达到loadingFetchHeight，并且释放
// 加载更多，是达到2pt就触发加载更多，并且弹出整个加载栏， 加载成功 分两种情况，第一种还可以继续加载更多，没有效果状态栏直接消失，不能加载更多了，会提示800毫秒没有更多了，加载失败也有800毫秒的提示， 提示没有成功
// 刷新和加载更多没有等到结果不会消失，也不会触发以后的加载和刷新，同时不能加载更过了也不会触发加载更多，直接提示没有更多了

import React, {
    PropTypes,
    Component,
} from 'react'
import {
    ScrollView,
  View
} from 'react-native'
import AndroidSwipeRefreshLayout from './AndroidSwipeRefreshLayout'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export default class PullScrollviewNoStatus extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  returnRef = () => {
    return this._centerBox
  }
  scrollTo = (opts) => {
    this._faltLis.scrollTo(opts)
  }
  render = () =>{
    const {  onScrollEndDrag, ...other, } = this.props;
    return (
      <AndroidSwipeRefreshLayout
        enabledPullUp={true}
        enabledPullDown={true}
        style={{height: '100%', width: '100%'}}
        onSwipe={(e) => this._onSwipe(e)}
        onRefresh={() => this._onRefresh()}
      >

          <ScrollView
              {...other}
              ref={(ref) => {
                this._faltList = ref;
              }}
              renderScrollComponent= {(props)=>{
                return <KeyboardAwareScrollView
                  enableOnAndroid = {true}
                  extraScrollHeight = {Platform.OS == 'ios' ? 0 : 64}
                  {...props}
                />
              }}
            >

                {this.props.children}

            </ScrollView>

      </AndroidSwipeRefreshLayout>

    )
  }

  _onSwipe = (e) => {
    this.upDown = null;
    if(e < 0) {
      this.upDown = 'up';
    }
  }

  _onRefresh = () => {
    if(this.upDown === 'up') {
      this.props.onScrollEndDrag instanceof Function && this.props.onScrollEndDrag();
    }
  }

}
