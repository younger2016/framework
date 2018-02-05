/**
 * 首页轮播图
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { View, StyleSheet, Image, TouchableWithoutFeedback, } from 'react-native';
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');
import Carousel from 'react-native-looped-carousel';//第三方轮播图组件
import { styleConsts } from '../../../../utils/styleSheet/styles'
import { toastShort } from '../../../../components/toastShort';
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import { fetchBannerAC } from '../../../../redux/actions/user.action';
import { getImgUrl } from '../../../../utils/adapter';


class HeaderBanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bannerList: [],            // banner图片
    };
  }
  componentDidMount() {
    // 获取首页banner图片
    this.props.fetchBanner({
      data: {
        pageID: 1,  // 1: 商城首页
      },
      fail: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res.response.message || '请求banner图片失败');
      },
    });
  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.$user.get('banners'),nextProps.$user.get('banners'))) {
      let banners = nextProps.$user.get('banners').toJS();
      if('success' === banners.status) {
        this.setState({
          bannerList: banners.list,
        })
      }
    }
  }
  render(){
    const { bannerList } = this.state;
    return(
      <View style={styles.bannerBox}>
        <Image source={require('../../../Category/imgs/firCateImg.png')} style={styles.bannerImg} />
        <Carousel
          style={{width: '100%', height: 165, position: 'absolute', left: 0, top: 0,}}
          autoplay={true}
          delay={2000}
          pageInfo={false}
          bullets={true}
          bulletStyle={styles.btnInfo}
          chosenBulletStyle={[styles.btnInfo,styles.btnCurrent]}
          swipe={true}
          bulletsContainerStyle={styles.BtnControl}
        >
          {
            bannerList.length !== 0 ?
              bannerList.map((item, index)=>{
                return(
                  <TouchableWithoutFeedback key={`${index}imgs`}>
                    <View>
                      <Image source={{ uri: getImgUrl(item.imagePath, width, 165) }} style={styles.bannerImg} />
                    </View>
                  </TouchableWithoutFeedback>
                )
              }) : <Image source={require('../../../Category/imgs/firCateImg.png')} style={styles.bannerImg} />
          }
        </Carousel>
      </View>
    )
  }

}

HeaderBanner.defaultProps = {

};
HeaderBanner.PropTypes = {

};

const styles = StyleSheet.create({
  bannerBox: {
    // elevation: 6,
    // shadowColor: "black",
    // shadowOffset: { height: 4 },
    // shadowOpacity: 0.1,
    backgroundColor: styleConsts.white,
    position: 'relative'
  },
  bannerImg: {
    width: width,
    height: 165,
  },
  BtnControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -5,
    left: 0,
    width: '100%',
  },
  btnInfo: {
    width: 7,
    height: 7,
    borderRadius: 3,
    backgroundColor: styleConsts.white,
    opacity: 0.7,
    margin: 5,
  },
  btnCurrent: {
    width: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    $user: state.user,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 获取banner图片
    fetchBanner: (opts) => {
      dispatch(fetchBannerAC(opts));
    }
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(HeaderBanner)
