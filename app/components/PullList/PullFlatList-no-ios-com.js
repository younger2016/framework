// bylixiaozhang

import React, {
  Component,
  cloneElement,
  createElement,
  isValidElement,
  PropTypes
} from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,

} from 'react-native';
//import isPromise from 'is-promise';
// import DefoultLoadingTop from './DefoultLoadingTop'
// import DefoultLoadMore from './DefoultLoadMore'
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
  fillParent: {
    backgroundColor: 'transparent',
    position: 'absolute',
    // flex: 1,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
  },
});

export default class PullFlatList extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };
    this.canLoadMore = false; // 是否允许加载更多
    this.loading = false; // 正在刷新
    this.loadMoreing = false; // 正在加载更多
    this.loadingFetchHeight = 60; // 下拉到多少放手可以下拉刷新
    this.FetchMoreHeight = 60; // 上拉到多少放手可以加载更多
    this.up = false;
    this.dwon = false;
    this.nowY = 0;
  }
  // shouldComponentUpdate() {
  //   return !this.loading;
  // }
  componentDidMount() {
    //this.setBottom('nocanMore')
    this.getFlatHeight()

    this.repond = this.flatList.getScrollResponder();
    this.repond.scrollResponderHandleResponderRelease = (e, ges) => {
        if(this.props.data.length===0){
          return
        }
        this.getFlatHeight();
        if(this.nowY <= this.loadingFetchHeight * -1 ){ // 进行刷新
            this.hasSc = true;
            this.repond.scrollResponderScrollTo({y:-this.loadingFetchHeight,x:0,animated: false})
            this._header.setNativeProps({
            style:{
              top: -height + this.loadingFetchHeight
            }
          })
          this._defoultHeader.setTopStatus('_loading');
          if(!this.loading){
            this.loading = true;
            this.props.onRefresh(this.loadingCallback);
          }
        }
        else if(this.nowY + this.flatListHeight >= this.contentHeight - 10 ){ // 加载更多
          if(this.canLoadMore){
            this.repond.scrollResponderScrollTo({y: this.flatListHeight - this.contentHeight >=0? this.FetchMoreHeight: this.contentHeight - this.flatListHeight + this.FetchMoreHeight,x:0,animated: false})
            this._footer.setNativeProps({
               style:{
                 bottom: -height + this.FetchMoreHeight
               }
             })
           if(!this.loadMoreing){ // 发请求
             this.loadMoreing = true
             this.props.onEndReached(this.loadMoreCallBack)
           }
          }

        }
        else{ // 非刷新和加载更多的滑动

        }
        // if(){
        //
        // }

        //this.loadingStart(e.nativeEvent.contentOffset.y)
    }
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.canLoadMore !== this.props.canLoadMore){
      this.canLoadMore = nextProps.canLoadMore;
    }
    // if(nextProps.data !== this.props.data){
    //
    // }

  }
  componentDidUpdate() {
    this.getFlatHeight()
  }
  getFlatHeight = () =>{
    this._flatBox.measure((x,y,width,height,left,top) => {
      this.flatListHeight = height;
    })
  }
  onRelease = (e) => {
    // if(this.lastHerder < 0){
    //   this.flatList.scrollToOffset({offset:this.lastHerder})
    //   }
  }

  onScroll = (event) => {
    if(this.props.data.length===0){
      return
    }
    this.nowY  = event.nativeEvent.contentOffset.y;
    if(this.nowY <= 0){
      !this.loading && this._defoultHeader.setTopStatus('_downFisrt');
      if(this.nowY <= this.loadingFetchHeight * -1){
        !this.loading && this._defoultHeader.setTopStatus('_downSeond');
      }
       this._header.setNativeProps({
        style:{
          top: !this.loading ? -height - this.nowY :-height + this.loadingFetchHeight
        }
      })
      this._footer.setNativeProps({
         style:{
           bottom: -height
         }
       })
      return;
    }
    this.getFlatHeight();
    //console.log(this.loadMoreing ? -height + this.FetchMoreHeight :  -height + this.nowY + (this.flatListHeight - this.contentHeight >= 0 ? 0 : this.flatListHeight - this.contentHeight))
    if(this.nowY + this.flatListHeight >= this.contentHeight - 10){
      //+ this.FetchMoreHeight
      if(this.canLoadMore){
        this._defoultFooter.setTopStatus('_loading');
      }
      else{
        this._defoultFooter.setTopStatus('_noMore');
      }
      this._footer.setNativeProps({
          style:{
            bottom: this.loadMoreing ? -height + this.FetchMoreHeight :  -height + this.nowY + (this.flatListHeight - this.contentHeight >= 0 ? 0 : this.flatListHeight - this.contentHeight)
          }
        })
      this._header.setNativeProps({
        style:{
          top: -height
        }
      })
      return;
    }
    this._header.setNativeProps({
      style:{
        top: -height
      }
    })
    this._footer.setNativeProps({
       style:{
         bottom: -height
       }
     })



  }
  loadingCallback = (type) => {
    this.loading = false;
    if('success' === type || 'fail' === type || 'timeout' === type){
      this.loadingTimer && clearTimeout(this.loadingTimer)
      this._defoultHeader.setTopStatus(`_${type}Loading`);
      this.loadingTimer = setTimeout(() => {
        this.restTop();
      }, 1200)
    }
    else{
      this.restTop();
    }
  }
  restTop = () => {
    this._header.setNativeProps({
      style:{
        top: -height
      }
    })
    if(this.nowY < 0){
      this.repond.scrollResponderScrollTo({y:0,x:0,animated: false})
    }
  }
  loadMoreCallBack = (type, canLoadMore) => {
    this.canLoadMore = typeof canLoadMore === 'boolean' ? canLoadMore : this.canLoadMore;
    this.loadMoreing = false;
      if(type === 'fail' || type === 'timeout' ){
        this.loadMoreTimer && clearTimeout(this.loadMoreTimer)
        this._defoultFooter.setTopStatus(`_${type}Loading`);
        this.loadMoreTimer = setTimeout(() => {
          this.restBottom();
        }, 1000)
      }
      else{
        this.restBottom();
        this.loadMoreing = false;
      }
  }
  restBottom = () => {
    this._footer.setNativeProps({
      style:{
        top: -height
      }
    })
  }
  rest = () => { // 切换头部状态
    this.up = false;
    this.down = false;
  }
  render() {

    const {refreshing,onRefresh,onEndReached,...other} = this.props
    return (
      <View style={[styles.container, this.props.style]}  ref={(ref) => this._flatBox = ref}>
          <View ref={(ref) => this._header= ref} style={{height,  position: 'absolute',  top: -height, zIndex: 9, width, left: '50%', marginLeft: -width / 2, justifyContent: 'flex-end', overflow: 'hidden',}}>
              <DefoultHeader ref={(ref) => this._defoultHeader= ref} height={this.loadingFetchHeight} style={{ justifyContent: 'center', alignItems: 'center'}}/>
          </View>
          <FlatList
            {...other}
            ref={(ref) => { this.flatList = ref; }}
            onScroll={this.onScroll}
            onResponderRelease={this.onRelease}
            onContentSizeChange={(w, h) => this.contentHeight = h}
          />
          <View ref={(ref) => this._footer= ref} style={{height, backgroundColor: 'red', position: 'absolute',  bottom: -height, zIndex: 9, width, left: '50%', marginLeft: -width / 2, justifyContent: 'flex-start', overflow: 'hidden'}}>
              <DefoultFooter ref={(ref) => this._defoultFooter= ref} height={this.FetchMoreHeight} style={{ justifyContent: 'center', alignItems: 'center', }}/>
          </View>

      </View>
    );
  }
}
