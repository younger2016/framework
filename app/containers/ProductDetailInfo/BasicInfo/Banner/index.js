/**
 * 商品详情的banner
 */
import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, Modal, TouchableWithoutFeedback } from 'react-native';
import Swiper from 'react-native-swiper'
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');
import { getImgUrl } from '../../../../utils/adapter';
import EnLargeImgModal from '../../EnlargeImg';

export default class Banner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      current: this.props.current,  // 指定显示第几张banner,默认第0
      visible: false,               // Modal是否显示
      curIndex: 0,                  // 当前是从哪张图进入大图
    };
  }
  render() {
    let { productDetailInfo } = this.props;
    let imgs = [];
    productDetailInfo.imgUrl ? imgs.push(productDetailInfo.imgUrl) : null;
    let imgUrlSub = productDetailInfo.imgUrlSub ? productDetailInfo.imgUrlSub.split(',') : [];
    imgs = imgs.concat(imgUrlSub);
    return (
      <View>
        <View style={styles.bannerWrapper}>
          <Swiper
            loop={true}
            dot={<View style={{ backgroundColor: 'rgba(0,0,0,.5)', width: 5, height: 5, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 10 }} />}
            activeDot={<View style={{ backgroundColor: '#fff', width: 8, height: 8, borderRadius: 4, marginLeft: 3, marginRight: 3, marginTop: 3, marginBottom: 10 }} />}
            paginationStyle={{
              bottom: 0, left: null, right: 10,
            }}
          >
            {
              imgs.map((item, index) => {
                return (
                  <TouchableWithoutFeedback key={index} onPress={() => { this.enLargeProductImg(index)} }>
                    <View>
                      <Image style={styles.img} source={{ uri: getImgUrl(item, width, width) }} />
                    </View>
                  </TouchableWithoutFeedback>
                );
              })
            }
          </Swiper>
        </View>

        <Modal visible={this.state.visible} transparent={true} onRequestClose={() => {}}>
          <EnLargeImgModal imgUris={imgs} curIndex={this.state.curIndex} onPress={this.closeViewer}/>
        </Modal>
      </View>
    );
  }

  // 放大图片
  enLargeProductImg = (index) => {
    this.setState({
      visible: true,
      curIndex: index,
    });
  };

  // 按返回键，Modal隐藏
  closeViewer = () => {
    this.setState({
      visible: false,
      curIndex: 0,
    });
  }
}

Banner.PropTypes = {

};
Banner.defaultProps = {

};

const styles = StyleSheet.create({
  bannerWrapper: {
    width,
    height: width,
  },
  img: {
    width,
    height: width,
  },
  btnInfo: {
    width: 7,
    height: 7,
    borderRadius: 3,
    backgroundColor: '#fff',
    opacity: 0.7,
    margin: 5,
  },
  btnCurrent: {
    width: 10,
  },
});
