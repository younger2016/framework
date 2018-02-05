/**
 * 商品详情中详情
 */
import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, ScrollView, PixelRatio, } from 'react-native';
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');
import Immutable from 'immutable';
import { styleConsts } from '../../../utils/styleSheet/styles';
import { getImgUrl } from '../../../utils/adapter';

class ProductDetailOtherInfo extends Component{
  constructor(props){
    super(props);
    this.state = {
      productDetailInfo: {},
      imgInfoArray: [],
      imgContentWidth: 0,
    };
    this.height = 0;          // 详情页内容高度
    this.screenWidth = width;
  }
  componentDidMount() {
    this.setState({
      productDetailInfo: this.props.productDetailInfo,
    },() => {
      this.getDetailImages();
    })
  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.productDetailInfo,nextProps.productDetailInfo)){
      this.setState({
        productDetailInfo: nextProps.productDetailInfo,
      },() => {
        this.getDetailImages();
      })
    }
  }
  render () {
    let { productDetailInfo, imgInfoArray, imgContentWidth, } = this.state;
    return (
    // [styles.container,{ height: imgContentWidth }]
      <View style={styles.container} ref={(ref) => this.otherInfoRef = ref} onLayout={(e) => this.onLayout(e)}>
        <View style={styles.basicInfo}>
          <View style={styles.titleWrapper}>
            <Image style={styles.image} source={require('./../imgs/left.png')} />
            <Text style={styles.title}>商品详情</Text>
            <Image style={styles.image} source={require('./../imgs/right.png')} />
          </View>
          {
            '' !== productDetailInfo.productBrief ?
              <Text style={styles.briefTxt}>商品简介：{productDetailInfo.productBrief}</Text> : null
          }
        </View>
        <View style={styles.detailImgWrapper}>
          {
            imgInfoArray.map((imgInfo,imgIndex) => {
              let nowHeight = width / imgInfo.width * imgInfo.height;
              {/*Image包一层View是为了当图片还没加载完时先占位*/}
              return (
                <View style={{ width: width, height: nowHeight }} key={`${imgIndex}img`}>
                  <View  style={{ width: width, height: nowHeight,alignItems:'center',justifyContent:'center',position:'absolute'}}>
                    <Image style={{width:20,height:20}} key={`defIMG_${imgIndex}`} source={require('../../../components/PullList/imgs/loading.gif')}/>
                  </View>
                  <Image
                    style={{ width: width, height: nowHeight }}
                    source={{ uri: getImgUrl(imgInfo.uri, width, nowHeight) }}
                  />
                </View>
              )
            })
          }
        </View>
      </View>
    )
  }

  // 获取详情图的基本信息(宽、高、url)
  getDetailImages = () => {
    let { productDetailInfo, imgInfoArray, } = this.state;
    let detailImgs;
    if(productDetailInfo.imgUrlDetail) {
      detailImgs = productDetailInfo.imgUrlDetail.split(',');
    } else {
      detailImgs = productDetailInfo.imgUrl ? productDetailInfo.imgUrl.split(',') : [];
    }

    detailImgs.map((img,index) => {
      Image.getSize(getImgUrl(img, width), (width,height) => {
        imgInfoArray[index] = {
          width: width/(PixelRatio.get()),
          height: height/(PixelRatio.get()),
          uri: img,
        };

        // let { imgContentWidth } = this.state;  // 所有详情图总高度
        // imgContentWidth += this.screenWidth / (width/(PixelRatio.get())) * (height/(PixelRatio.get()));

        this.setState({
          imgInfoArray,
          // imgContentWidth,
        })
      });
    });
  };

  // 当布局改变时获取此时内容高度
  onLayout = (e) => {
    this.height = e.nativeEvent.layout.height;
    // measure方法时时获取内容高度
    this.otherInfoRef.measure((x,y,width,height,left,top) => {
      this.height = height;
      this.props.getContentHeight instanceof Function && this.props.getContentHeight(this.height);
    })
  };

}
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  basicInfo: {
    backgroundColor: styleConsts.white,
    paddingLeft: styleConsts.screenLeft,
    paddingRight: styleConsts.screenRight,
    marginTop: 10,
  },
  titleWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  image: {
    width: 17.5,
    height: 9,
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.mainColor,
    marginLeft: 5,
    marginRight: 5,
  },
  briefTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
    marginBottom: 10,
    lineHeight: 20,
  },
  detailImgWrapper: {
    marginBottom: 10,
  },
});
export default ProductDetailOtherInfo