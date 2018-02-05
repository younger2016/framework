// by lixiaozhang
// 刷新必须达到loadingFetchHeight，并且释放
// 加载更多，是达到2pt就触发加载更多，并且弹出整个加载栏， 加载成功 分两种情况，第一种还可以继续加载更多，没有效果状态栏直接消失，不能加载更多了，会提示800毫秒没有更多了，加载失败也有800毫秒的提示， 提示没有成功
// 刷新和加载更多没有等到结果不会消失，也不会触发以后的加载和刷新，同时不能加载更过了也不会触发加载更多，直接提示没有更多了

import AndroidSwipeRefreshLayout from './AndroidSwipeRefreshLayout'
import React, {
  PropTypes,
  Component,
} from 'react'
import {
  StyleSheet,
} from 'react-native'
import { styleConsts } from '../../utils/styleSheet/styles';// 引进公用样式配置文件

export default class extends Component {
  constructor(props) {
    super(props)
    this.state = {

    }
    this.resistance = this.props.resistance || 0.5;  // 阻力系数
    this.lastHerder = 0;
    this.lastFooter = 0;
    this.flatListMarTop = 0;
    this.ifShowFooter = typeof this.props.ifShowFooter === 'boolean' ? this.props.ifShowFooter : true; // 是否开启，如果没有开启底部显示更多也会没有
    this.loadingFetchHeight = this.props.loadingFetchHeight || 45; // 下拉到多少放手可以下拉刷新
    this.FetchMoreHeight = this.props.FetchMoreHeight || 45; // 上拉到多少放手可以加载更多
    this.canLoadMore = typeof this.props.canLoadMore === 'boolean' ? this.props.canLoadMore : true; // 是否开启，如// 是否可以加载更多
    this.hasToTop = true;
    this.hastToBottom = false;
    this.flatListHeight = 0;
    this.contentHeight = 0;
  }
  componentDidMount() {
    if(!this._faltList){
      if(this.getRNCenter instanceof Function ){
        this._faltList =  this.getRNCenter()
      }else{
        throw new Error(`this._faltList，没有直接定义或者通过getRNCenter返回定义`);
      }
    }

  }
  componentWillReceiveProps(nextProps) {
    this.canLoadMore = nextProps.canLoadMore;
  }
  componentWillMount() {
    this.loadingTimer && clearTimeout(this.loadingTimer)
    this.loadMoreTimer && clearTimeout(this.loadMoreTimer)
  }
  render() {
    return(
      <AndroidSwipeRefreshLayout
        ref={ component => this._swipeRefreshLayout = component }
        style={{flex: 1,}}
        enabledPullUp={true}
        enabledPullDown={true}
        onSwipe={(e) => this._onSwipe(e)}
        onRefresh={() => this._onRefresh()}>
        {this.renderCenter()}
        {this.renderFooter instanceof Function && this.renderFooter() }
      </AndroidSwipeRefreshLayout>
    )
  }
  referResult = (type) => { // success , fail ; timeout
    if('success' === type || 'fail' === type || 'timeout' === type){
      this.loadingTimer && clearTimeout(this.loadingTimer)
      this.showHeadtype = `_${type}Loading`;
      this._defoultHeader.setTopStatus(`_${type}Loading`);
      this.loading = false;
      this.loadingTimer = setTimeout(() => {
        this.showHeadtype = '_downFisrt';
        this.clearTop();
      }, 1200)
    }
    else{
      this.showHeadtype = '_downFisrt';
      this.clearTop();
      this.loading = false;
    }

  }
  clearTop = () => {
    this.lastHerder = 0;
    this._defoultHeader.setNativeProps({
      style: {
        height: 0,
      }
    })
  }
  clearBottom = () => {
    this.lastFooter = 0;
    this.flatListMarTop = 0 ;
    this._faltList.setNativeProps({
      style:{ marginTop: 0}
    })
    this._defoultFooter.setBoxHeight(0)
  }
  loadMoreResult = (type, canLoadMore) => {
    this.canLoadMore = typeof canLoadMore === 'boolean' ? canLoadMore : this.canLoadMore;
    // if(!this.canLoadMore){ // 没有更多了
    //   this.loadMoreTimer && clearTimeout(this.loadMoreTimer)
    //   this._defoultFooter.setTopStatus(`_noMore`);
    //   this.loadMoreTimer = setTimeout(() => {
    //     this.clearBottom();
    //     this.loadMoreing = false;
    //   }, 1000)
    // }else{
    if(type === 'fail' || type === 'timeout' ){
      this.loadMoreTimer && clearTimeout(this.loadMoreTimer)
      this._defoultFooter.setTopStatus(`_${type}Loading`);
      this.loadMoreTimer = setTimeout(() => {
        this.clearBottom();
        this.loadMoreing = false;
      }, 1000)
    }
    else{
      this.clearBottom();
      this.loadMoreing = false;
    }
    //}
  }
  // _onScroll = (e) => {
  //
  // }
  _onRefresh = () => { // 必须到底或者到头部
    // if(!(this.props.data instanceof Array) || this.props.data.length === 0){
    //   return;
    // }
    if(this.upDown === 'down'){ // 下拉放手
      this.upDown = '';
      if(this._defoultHeader && this.lastHerder_Now * this.resistance >= this.loadingFetchHeight && this.props.onRefresh instanceof Function){ // 开始刷新
        this.lastHerder = this.loadingFetchHeight;
        this._defoultHeader.setNativeProps({
          style: {
            height: this.loadingFetchHeight,
          }
        })
        this.showHeadtype = '_loading';
        this._defoultHeader.setTopStatus('_loading')
        if(!this.loading){
          this.loading = true;
          this.loadingTimer && clearTimeout(this.loadingTimer)
          this.props.onRefresh(this.referResult);
        }


      }
      else{ // 没有到达位置

        if(this.loading){ // 正在刷新
          this._defoultHeader.setNativeProps({
            style: {
              height: this.loadingFetchHeight,
            }
          })
        }
        else{
          this.clearTop()
        }

      }
    }
    else if(this.upDown === 'up'){ // 上拉放手
      this.upDown = '';
      if(this.ifShowFooter && this._defoultFooter && this.props.onEndReached instanceof Function && !this.loadMoreing && this.canLoadMore){
        this.lastFooter = this.FetchMoreHeight
        this._faltList.setNativeProps({
          style:{ marginTop: -this.FetchMoreHeight}
        })
        this._defoultFooter.setBoxHeight(this.FetchMoreHeight)
        this.loadMoreing = true;
        this.props.onEndReached(this.loadMoreResult)
      }
      else{
        this.clearBottomCallBack instanceof Function && this.clearBottomCallBack()
        this.clearBottom();
      }
    }


  }
  _onSwipe = (e) => {
    // if(!(this.props.data instanceof Array) || this.props.data.length === 0){
    //   return;
    // }
    if(this._defoultHeader && e > 0  && this.props.onRefresh instanceof Function){ // 下拉
      this.upDown = 'down';
      this.lastHerder_Now =  this.lastHerder + e ;
      if(this.lastHerder_Now * this.resistance >= this.loadingFetchHeight){  // 拉到位置了
        if(!this.loading ){
          this.showHeadtype = '_downSeond';
          this._defoultHeader.setTopStatus('_downSeond')
        }
      }
      else{
        if(!this.loading ){
          this.showHeadtype = '_downFisrt';
          this._defoultHeader.setTopStatus('_downFisrt')
        }
      }
      this._defoultHeader.setNativeProps({
        style: {
          height: this.lastHerder_Now * this.resistance,
        }
      })

    }
    else if(e < 0 && this.ifShowFooter && this._defoultFooter){
      this.upDown = 'up';
      this.lastFooter_Now =  this.lastFooter + e * -1 ;
      if(this.canLoadMore) { // 开始发出更多的请求
        this._defoultFooter.setTopStatus(`_loading`);
      }
      else { // 没有更多了， 放手就弹回去
        this._defoultFooter.setTopStatus(`_noMore`);
      }
      this._faltList.setNativeProps({
        style:{ marginTop: -this.lastFooter_Now * this.resistance}
      })
      this._defoultFooter.setBoxHeight(this.lastFooter_Now * this.resistance)
    }
  }

  refreshfromYou = () => { // 手动触发刷新
    this._onSwipe( this.loadingFetchHeight/this.resistance + 1 );
    this._onRefresh();
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
    color: styleConsts.darkGrey,
    marginLeft: 10,
  },
})
