/**
 * Created by chenshuang on 2017/11/23.
 */

import React, { Component } from 'react'
import { View, StyleSheet, ScrollView, Image, Text,} from 'react-native'
import HeaderBar from '../../components/HeaderBar'
import { styleConsts } from '../../utils/styleSheet/styles';
const imgList = {
  both: require(`./imgs/both.png`),
  camera: require(`./imgs/camera.png`),
  photo: require(`./imgs/photo.png`),
};
const tipList = {
  both: '您可以进入系统"设置 > 二十二城"，允许"二十二城"访问您的相机和照片',
  photo: '您可以进入系统"设置 > 隐私 > 照片"，允许"二十二城"访问您的照片',
  camera: '您可以进入系统"设置 > 隐私 > 相机"，允许"二十二城"访问您的相机',
};
const titleList = {
  both: '缺少权限',
  photo: '照片',
  camera: '相机',
};
const nameList = {
  both: '相机和照片',
  photo: '照片',
  camera: '相机',
};

export default class RequestPermission extends Component {

  constructor(props) {
    super(props);
    this.state = {
      type: 'both'
    }
  }

  componentDidMount() {
    this.setState({
      type: this.props.navigation.state.params
    })
  }

  componentWillReceiveProps(nextProps){
  }


  render() {
    let { type } = this.state;
    return (
      <View style={{flex: 1, width: '100%', height: '100%', backgroundColor: styleConsts.bgGrey}}>
        <HeaderBar
          title={titleList[type]}
          cancelHide={true}
          navigation={this.props.navigation}
        />
        <View style={styles.centerView}>
          <Text style={styles.titleTxt}>二十二城没有权限访问您的
            {nameList[type]}
          </Text>
          <Text style={styles.tipTxt}>
            {tipList[type]}
          </Text>
          <Image source={imgList[type]} style={styles.imgStyle}/>
        </View>
      </View>

    )
  }
}


const styles = StyleSheet.create({
  imgStyle: {
    width: 375,
    height: 196,
    marginTop: 30
  },
  centerView: {
    alignItems: 'center'
  },
  titleTxt: {
    color: styleConsts.deepGrey,
    marginTop: 60
  },
  tipTxt: {
    color: styleConsts.darkGrey,
    width: 250,
    marginTop: 20,
    textAlign: 'center'
  }
});


