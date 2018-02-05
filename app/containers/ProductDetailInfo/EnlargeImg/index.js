/**
 * 图片放大
 */
import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, ScrollView, Modal } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import { getImgUrl } from '../../../utils/adapter';
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');

export default class EnLargeImgModal extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  render() {
    const {
      imgUris,
      curIndex,
    } = this.props;
    const newImgs = imgUris.map((item) => {
      return { url: getImgUrl(item, width, width) }
    });
    return (
      <ImageViewer imageUrls={newImgs} index={curIndex} onClick={this.props.onPress} />
    )
  }
}

EnLargeImgModal.PropTypes = {
  onPress: React.PropTypes.func,
  imgUris: React.PropTypes.array,
  curIndex: React.PropTypes.number,
};
EnLargeImgModal.defaultProps = {
  onPress: () => {},
  imgUris: [],
  curIndex: 0,
};
