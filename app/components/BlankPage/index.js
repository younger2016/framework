// 公用空白、网络请求错误页面

import React, { Component, PropTypes } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Image, ScrollView,Text } from 'react-native'
import Dimensions from 'Dimensions';
import {styleConsts} from '../../utils/styleSheet/styles'
const { height } = Dimensions.get('window');

const blank = require('../../imgs/blank.png');
const errImg = require('../../imgs/networkError.png');
const loading = require('../PullList/imgs/loading.gif');
const noProduct = require('../../imgs/noProduct.png');


class BlankPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visable: props.visable,
    };
  }
  componentWillReceiveProps(nextProps) {
    if(nextProps.visable !== this.props.visable){
      this.setState({
        visable: nextProps.visable
      })
    }
  }
  componentWillUnmount() {
    this.setState({
      visable: false
    })
  }
  render() {
    if(!this.state.visable){
        return null;
    }
    const {type = 'blank', loadAgain = () =>{}, imgType } = this.props; /// 类型，默认是blank--空白页面， err--请求错误页面
     return (
        <View style={[styles.container, this.props.bgStyle]}>

          <View style={[{alignItems: 'center',},type !== 'blank' && styles.hide]}>
            <Image
              style={imgType === 'noProduct' ? {width: 50, height: 50,} : styles.img}
              source={imgType === 'noProduct' ? noProduct : blank}
            />
            <View>{this.props.children}</View>
          </View>

          <View style={[{alignItems: 'center',paddingTop: height/2 - 180,},type !== 'loading' && styles.hide]}>
            <Image style={[styles.img, {width: 26, height: 26}]} source={loading}/>
          </View>

          <View style={[{alignItems: 'center'},type !== 'error' && styles.hide]}>
            <Image style={{width: 142, height: 150}} source={errImg} />
            <Text style={{fontSize: styleConsts.H3,color: styleConsts.deepGrey, marginTop: 15}}>网络请求错误</Text>
            <Text style={{fontSize: styleConsts.H4,color: styleConsts.middleGrey,marginTop: 15}}>请检查您的网络设置</Text>
            <TouchableWithoutFeedback onPress={ () => loadAgain()}>
              <View style={{width: 100,height: 30,borderRadius: 5,alignItems: 'center',
                justifyContent:'center',borderWidth: 1,borderColor: styleConsts.headerLine,marginTop: 15}}>
                <Text style={{fontSize: styleConsts.H4,color: styleConsts.grey}}>重新加载</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>

       </View>
    )
  }
}


BlankPage.defaultProps = {
  visable: false , // 是否显示
  bgStyle: {},
};

BlankPage.PropTypes = {
  visable: PropTypes.bool,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
  },
  img: {
    marginBottom: 40,
    width: 200,
    height: 200,
  },
  hide: {
    position: 'absolute',
    left: 5000,
  },
});

export default BlankPage;
