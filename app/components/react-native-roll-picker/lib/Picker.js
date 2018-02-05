/**
 * Created by yjy on 16/8/3.
 *
 * props:
 *  data: 数据
 *  name: rowData[name] 返回列表数据
 *  onRowChange: (index) => {} 被选中的index
 *
 * method:
 *  setDataSource(data): 刷新数据
 *
 */

import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ListView,
} from 'react-native';

import { CSS } from './CSS'

export default class Picker extends Component {
  constructor(props) {
    super(props);
    const data = props.data;
    this.onScrollCount = 0;
    this.state = {
      data,
    };
    this.currentData=''
  }

  setDataSource(data) {
    if (this.refs._ScrollView) {
      this.refs._ScrollView.scrollTo({ y: 0, animated: false });
    }
    this.setState({ data });
  }

  getItem(size) {
    // if(this.state.data.length == 0) {
    //     return false;
    // }
    const arr = this.state.data;
    return arr.map((item, i) => {
      return (
        <View key={i} style={{ height: 32, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: size == 'big' ? CSS.pixel(32) : CSS.pixel(28), color: size == 'big' ? '#4a4a4a' : '#a0a0a0', backgroundColor: 'rgba(0,0,0,0)' }}>
            {this.props.name ? item[this.props.name] : item}
            {( size == 'big' && this.props.unit) && ` ${this.props.unit}`}
          </Text>
        </View>
      )
    })
  }

  _onScrollEndDrag(e) {
    const y = e.nativeEvent.contentOffset.y;
    const onScrollEndDragCount = this.onScrollCount;
    const start = Date.now();
    if (this.fixInterval) {
      clearInterval(this.fixInterval);
    }
    this.fixInterval = setInterval(() => this._timeFix(start, y, onScrollEndDragCount), 10);
  }

  _timeFix(start, y, onScrollEndDragCount) {
    const now = Date.now();
    const end = 200;
    if (now - start > end) {
      clearInterval(this.fixInterval);
      if (onScrollEndDragCount == this.onScrollCount) {
        this._onScrollEnd(y);
      }
    }
  }

  _onMomentumScrollEnd(e) {
    const y = e.nativeEvent.contentOffset.y;
    this._onScrollEnd(y);
  }

  _onScroll(e) {
    this.onScrollCount++;
    const y = e.nativeEvent.contentOffset.y;
    if (this.refs._ScrollView2) {
      this.refs._ScrollView2.scrollTo({ y, animated: false });
    }
  }

  _onScrollEnd(y) {
    let y1 = y - (y % 32);
    if (y % 32 > 16) { y1 += 32; }
    const index = y1 / 32;
    if (this.refs._ScrollView) {
      this.refs._ScrollView.scrollTo({ y: y1, animated: false });
    }
    if (this.props.onRowChange) {
      this.props.onRowChange(index);
    }
    /*add by zc at 20171102 for DatePickerAD*/
    if(this.props.onDataChange){
      this.currentData=this.state.data[index]
      this.props.onDataChange()
    }
  }

  _selectTo(index) {
    const y = index * 32;
    if (this.refs._ScrollView) {
      this.refs._ScrollView.scrollTo({ y, animated: false });
    }
  }

  /*add by zc at 20171102 for DatePickerAD*/
  selectData(data){
    let selectIndex=this.state.data.findIndex((subData)=>{return subData==data});
    this._selectTo(selectIndex);
    this.currentData=data
  }

  componentDidMount() {
    if (this.props.selectTo || this.props.selectTo === 0) {
      setTimeout(() => { this._selectTo(this.props.selectTo); })
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.selectTo || nextProps.selectTo === 0) {
      setTimeout(() => { this._selectTo(nextProps.selectTo); })
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ height: 225, backgroundColor: '#ffffff' }}>
          <ScrollView
            bounces={false}
            onScrollEndDrag={(e) => { this._onScrollEndDrag(e) }}
            onMomentumScrollEnd={(e) => { this._onMomentumScrollEnd(e) }}
            onScroll={(e) => { this._onScroll(e) }}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            ref="_ScrollView"
          >
            <View style={{ height: 100 }} />
            {this.getItem('small')}
            <View style={{ height: 100 }} />
          </ScrollView>
        </View>
        <View style={{ height: 32, marginTop: -125, backgroundColor: '#ffffff' }} pointerEvents="none" >
          <View style={{ height: CSS.pixel(1), backgroundColor: '#a2a2a2' }} />
          <ScrollView
            showsVerticalScrollIndicator={false}
            ref="_ScrollView2"
          >
            {this.getItem('big')}
          </ScrollView>
          <View style={{ height: CSS.pixel(1), backgroundColor: '#a2a2a2' }} />
        </View>
        <View style={{ height: 100 }} pointerEvents="none" />
      </View>
    )
  }
}
