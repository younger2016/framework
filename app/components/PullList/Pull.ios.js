
// bylixiaozhang
import React, {
  Component,
} from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import DefoultHeader from './DefoultHeader'
import DefoultFooter from './DefoultFooter'
import Dimensions from 'Dimensions';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    position: 'relative',
    zIndex: -999
  },
});

export default class extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
    this.canLoadMore = false; // 是否允许加载更多
    this.loading = false; // 正在刷新
    this.loadMoreing = false; // 正在加载更多
    this.ifShowFooter = typeof this.props.ifShowFooter === 'boolean' ? this.props.ifShowFooter : true; // 是否开启，如果没有开启底部显示更多也会没有
    this.loadingFetchHeight = this.props.loadingFetchHeight || 50; // 下拉到多少放手可以下拉刷新
    this.FetchMoreHeight = this.props.FetchMoreHeight || 50; // 上拉到多少放手可以加载更多
    this.nowY = 0;
    this.bottom = -10000;
    this.showHeader = null;
    this.showFooter = null;
  }
  // shouldComponentUpdate() {
  //   return !this.loading;
  // }
  componentDidMount() {
    if(!this._faltList){
      if(this.getRNCenter instanceof Function ){
        this._faltList =  this.getRNCenter()
      }else{
        throw new Error(`this._faltList，没有直接定义或者通过getRNCenter返回定义`);
      }
    }
    //this._faltList = this._faltList.getScrollResponder();
    // this._faltList.scrollResponderHandleScrollEndDrag=(e) => {
    //   if(this.nowY <= this.loadingFetchHeight * -1 && this.props.onRefresh instanceof Function || this.loading){
    //     this.pullOk()
    //   }
    //
    // }
    // this._faltList.scrollResponderHandleTouchEnd=(e) => {
    //   if(this.nowY <= this.loadingFetchHeight * -1 && this.props.onRefresh instanceof Function || this.loading){
    //     this.pullOk()
    //   }
    //
    //
    // }
    // this._faltList.scrollResponderHandleResponderRelease = (e) => {
    //   if(this.nowY <= this.loadingFetchHeight * -1 && this.props.onRefresh instanceof Function || this.loading){
    //     this.pullOk()
    //   }
    //
    //
    // }

    //this._faltList.scrollResponderHandleScroll = (e) => this.onScroll(e)
    this._faltList.scrollResponderHandleMomentumScrollBegin = (e, handel) => {
      this.getFlatHeight();
      this.handleNow = true;
      this.nowY = this.nowY > e.nativeEvent.contentOffset.y ? this.nowY : e.nativeEvent.contentOffset.y
      //this.nowY = e.nativeEvent.contentOffset.y
      if(this.nowY < 0 && this.props.rested){ // 兼容
        this._faltList.scrollResponderScrollTo({y: 0,x:0,animated: false})
      }
      if((this._defoultHeader && this.nowY <= this.loadingFetchHeight * -1 && this.props.onRefresh instanceof Function) || this.loading || handel){ // 进行刷新
        this.pullOk()
        if(!this.loading || this.result){
          this.loadingTimer && clearTimeout(this.loadingTimer)
          this.loading = true;
          this.result = false;
          this.props.onRefresh instanceof Function && this.props.onRefresh(this.loadingCallback);
        }
      }
      else if(this._defoultFooter && this.nowY + this.flatListHeight >= this.contentHeight - 10  && this.props.onEndReached instanceof Function && this.ifShowFooter  ){ // 加载更多--- 预防帧数过多没有
        if(this.canLoadMore){
          this.showFooter = '_loading'
          this._defoultFooter.setTopStatus('_loading');
          this.forceUpdate();
          this._faltList.scrollResponderScrollTo({y: this.flatListHeight - this.contentHeight >=0 ? this.FetchMoreHeight: this.contentHeight - this.flatListHeight + this.FetchMoreHeight,x:0,animated: false})
          if(!this.loadMoreing){ // 发请求
            this.loadMoreing = true;
            this.hasRest = true;
            this.props.onEndReached instanceof Function && this.props.onEndReached(this.loadMoreCallBack)
          }
        }

      }
      else{ // 非刷新和加载更多的滑动

      }

    }
  }
  pullOk = () => {
    this._defoultHeader.setNativeProps({
      style:{
        position:'relative',
        top:0
      }
    })
    this.showHeader = '_loading'
    this._defoultHeader.setTopStatus('_loading');
    this.forceUpdate();

  }
  componentWillReceiveProps(nextProps) {
    this.canLoadMore = nextProps.canLoadMore;
  }
  componentDidUpdate() {
    this.getFlatHeight()
  }
  getFlatHeight = () =>{
    this._flatBox && this._flatBox.measure((x,y,width,height,left,top) => {
      this.flatListHeight = height;
      let CHeight = this.flatListHeight - this.contentHeight - (this.loading ? this.loadingFetchHeight : 0)
      this.bottom = CHeight > 0 ? -this.FetchMoreHeight - CHeight : -this.FetchMoreHeight;
      this._defoultFooter && this._defoultFooter.setNativeProps({
        style:{
          bottom: this.bottom
        }
      })
    })
  }
  onScroll = (event) => {
    this.nowY  = event.nativeEvent.contentOffset.y;
    this.hasRest = false;
    if(this.nowY <= 0 && this.props.onRefresh instanceof Function && this._defoultHeader){
      if(!this.loading){
        this.showHeader = '_downFisrt'
        this._defoultHeader.setTopStatus('_downFisrt');
      }

      if(this.nowY <= this.loadingFetchHeight * -1 && !this.loading ){
        this.showHeader = '_downSeond'
        this._defoultHeader.setTopStatus('_downSeond');
      }
      return;
    }
    this.getFlatHeight();
    if(this._defoultFooter && this.nowY + this.flatListHeight >= this.contentHeight - 20 && this.ifShowFooter){
      if(this.canLoadMore){
        this.showFooter = '_loading'
        this._defoultFooter.setTopStatus('_loading');
        if(this.loadMoreing){
          this.hasRest = true;
        }
        if(this.handleNow && this.props.onEndReached instanceof Function ){
          this.handleNow = false;
          this.forceUpdate();
          this._faltList.scrollResponderScrollTo({y: this.flatListHeight - this.contentHeight >=0 ? this.FetchMoreHeight: this.contentHeight - this.flatListHeight + this.FetchMoreHeight,x:0,animated: false})

          if(!this.loadMoreing){ // 发请求
            this.loadMoreing = true;
            this.hasRest = true;
            this.props.onEndReached instanceof Function && this.props.onEndReached(this.loadMoreCallBack)
          }
        }


      }
      else{
        this.showFooter = '_noMore'
        this._defoultFooter.setTopStatus('_noMore');
      }

    }




  }
  loadingCallback = (type) => {
    this.result = true;
    if('success' === type || 'fail' === type || 'timeout' === type){
      this.loadingTimer && clearTimeout(this.loadingTimer)
      this.showHeader = `_${type}Loading`
      this._defoultHeader.setTopStatus(`_${type}Loading`);
      this.loadingTimer = setTimeout(() => {
        this.restTop();
      }, 1000)
    }
    else{
      this.restTop();
    }
  }
  restTop = () => {
    this.showHeader = null;
    this.loading = false;
    this._defoultHeader.setNativeProps({
      style:{
        position: 'absolute',
        top: -this.loadingFetchHeight,
        left: 0
      }
    })
    if(this.nowY === -this.loadingFetchHeight){
      this._faltList.scrollResponderScrollTo({y:0,x:0,animated: true})
    }
  }
  loadMoreCallBack = (type, canLoadMore) => {
    this.canLoadMore = typeof canLoadMore === 'boolean' ? canLoadMore : this.canLoadMore;
    if(type === 'fail' || type === 'timeout' ){
      this.loadMoreTimer && clearTimeout(this.loadMoreTimer)
      this.showFooter = `_${type}Loading`;
      this._defoultFooter.setTopStatus(`_${type}Loading`);
      this.loadMoreTimer = setTimeout(() => {
        this.restBottom();
        if(this.hasRest){
          this.hasRest = false;
          this._faltList.scrollToEnd()
        }

      }, 1000)
    }
    else{
      if(!this.canLoadMore){
        this.showFooter = '_noMore'
        this._defoultFooter.setTopStatus('_noMore');
      }
      if(this.hasRest){
        this.hasRest = false;
        this._faltList.scrollToEnd()
      }
      this.restBottom();
      this.loadMoreing = false;
    }
  }
  restBottom = () => {
    this.loadMoreing = false;
    this.showFooter = null;

  }

  refreshfromYou = async () => { // 手动触发刷新
    // await this._faltList.scrollResponderScrollTo({
    //         y: -this.loadingFetchHeight,
    //         x: 0,
    //         animated: true,
    //     })
    await this._faltList.scrollResponderHandleMomentumScrollBegin({nativeEvent:{contentOffset :{y: -this.loadingFetchHeight}}}, true);
  }
  render() {
    return (
      <View style={[styles.container, this.props.style]}  ref={(ref) => this._flatBox = ref}>
        {this.renderCenter()}
      </View>
    );
  }
}
