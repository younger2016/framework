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
} from 'react-native'
import PullCenter from './Pull'
import DefoultHeader from './DefoultHeader'
import DefoultFooter from './DefoultFooter'

export default class PullScrollView extends PullCenter {
  constructor(props) {
    super(props)
    this.state = {}
  }
  clearBottomCallBack = () => {
    this._faltList.scrollToEnd()
  }
  renderCenter = () =>{
    const { refreshControl, onRefresh, ...other } = this.props;
    return <ScrollView
            {...other}
            ref={(ref) => {
              this._faltList = ref;
            }}
            style={{flex: 1, marginTop: this.flatListMarTop}}
          >
          <DefoultHeader  show={this.showHeadtype} height={this.lastHerder} loadingFetchHeight={this.loadingFetchHeight} ref={(ref) => this._defoultHeader = ref}/>
          {this.props.children}
          <DefoultFooter height={this.loadMoreing ? this.FetchMoreHeight : this.lastFooter * this.resistance} loadingFetchHeight={this.FetchMoreHeight} ref={(ref) => this._defoultFooter = ref}/>
          </ScrollView>
  }

}
