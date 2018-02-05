
/*import React, {
  Component,
} from 'react';
import {
  FlatList,
} from 'react-native';
import KeyboardAwareFlatList from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareFlatList'

export default class PullFlatList extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };

  }

  render() {
    return  <KeyboardAwareFlatList
            ref="keyboard_list"
            {...this.props}
          />

  }
}*/

// by lixiaozhang
// 刷新必须达到loadingFetchHeight，并且释放
// 加载更多，是达到2pt就触发加载更多，并且弹出整个加载栏， 加载成功 分两种情况，第一种还可以继续加载更多，没有效果状态栏直接消失，不能加载更多了，会提示800毫秒没有更多了，加载失败也有800毫秒的提示， 提示没有成功
// 刷新和加载更多没有等到结果不会消失，也不会触发以后的加载和刷新，同时不能加载更过了也不会触发加载更多，直接提示没有更多了

import React from 'react'
import {
  FlatList,
} from 'react-native'
import PullCenter from './Pull'
import KeyboardAwareFlatList from 'react-native-keyboard-aware-scroll-view/lib/KeyboardAwareFlatList'
import DefoultHeader from './DefoultHeader'
import DefoultFooter from './DefoultFooter'

export default class PullFlatList extends PullCenter {
  constructor(props) {
    super(props)
    this.state={

    }
  }
  getRNCenter = () => { // 返回可操作的底层列表组件， 非底层组件必须要有，像底层的ScrollView不需要，直接定义可操作的this._faltList
    return this._foutS.getScrollResponder()
  }
  renderCenter = () =>{
    const { onRefresh, onEndReached, ListHeaderComponent, ListFooterComponent,onScroll,  ...other} = this.props;
    return <KeyboardAwareFlatList
      {...other}
      stickyHeaderIndices={[0]}
      scrollEventThrottle={1}
      ListHeaderComponent={
        () => <DefoultHeader
          ref={(ref) => this._defoultHeader= ref}
          height={this.loadingFetchHeight}
          show={this.showHeader}
          style={[
            {
              justifyContent: 'center',
              width: '100%',
              alignItems: 'center',
              height: this.loadingFetchHeight,
              paddingBottom: 10,
            },typeof this.showHeader === 'string' && this.showHeader.indexOf('oading') > -1 ? {} : {
              position: 'absolute',
              top: -this.loadingFetchHeight,
              left: 0
            }
          ]}/>


      }
      ListFooterComponent={
        () => <DefoultFooter
          ref={(ref) => this._defoultFooter= ref}
          height={this.loadingFetchHeight}
          show={this.showFooter}
          style={{
            justifyContent: 'center',
            width: '100%',
            alignItems: 'center',
            position: 'absolute',
            height: this.FetchMoreHeight,
            bottom: this.bottom,
            left: 0
          }}/>
      }
      ref={(ref) => { this._foutS = ref }}
      onScroll={this.onScroll}
      onContentSizeChange={(w, h) => this.contentHeight = h}
    />
  }

}

