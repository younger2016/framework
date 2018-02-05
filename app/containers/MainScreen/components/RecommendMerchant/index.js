/**
 * 首页推荐店铺
 */
import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, Image,  TouchableWithoutFeedback, FlatList, PixelRatio, Animated, Easing} from 'react-native';
import { connect } from 'react-redux';
import {
  NAV_TO_SHOPCENTER_MAIN_PAGE,
} from '../../../../redux/actions/nav.action';
import { SET_MAININFO_TO_GET_SHOP_INFO } from '../../../../redux/actions/shopCenter.action'
import { styleConsts } from '../../../../utils/styleSheet/styles'
import {getImgUrl} from '../../../../utils/adapter'
import { CachedImage } from "react-native-img-cache";
import  I18n  from 'react-native-i18n'
import { fetchRecommendShopAC } from '../../../../redux/actions/user.action'
import { toastShort } from '../../../../components/toastShort';
import Toast from 'react-native-root-toast';
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');

class RecommendMerchant extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      showNothing: true,
      rotation: new Animated.Value(0),
      direction: true
    };
    this.interval = undefined;
  }
  componentDidMount(){
    this.animate();
    if(this.props.user.get('recommendShop').toJS().length){
      this.setState({
        data: this.props.user.get('recommendShop').toJS(),
        showNothing: false
      })
    }else{
      this.getShops();
    }
  }
  componentWillReceiveProps(nextProps){
    if(this.props.user.get('recommendShop') !== nextProps.user.get('recommendShop')){
      clearInterval(this.interval);
      this.setState({
        data: nextProps.user.get('recommendShop').toJS(),
        showNothing: false
      })
    }
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  render() {
    return (
      <View>
        <View style={styles.titleAndMore}>
          <Text style={styles.firstTitle}>
            推
            <Text style={styles.secondTitle}>
              荐
              <Text style={styles.thirdTitle}>
                店
                <Text style={styles.fourthTitle}>
                  铺
                </Text>
              </Text>
            </Text>
          </Text>
        </View>
        {
          this.state.showNothing && this.state.data.length == 0 ?
            this.renderNothing() :(
            <FlatList
              data = {this.state.data}
              initialNumToRender={4}
              keyExtractor={(item) => item.id}
              renderItem={({item, index}) => {
                return(
                  <TouchableWithoutFeedback
                    key={`merchant${item.id}`}
                    onPress={() => this.onMerchantPress(item)}
                  >
                    <View style={styles.merchantItem}>
                      <Image source={require('../../../../imgs/loadImage.png')} style={styles.merchantLogo}/>
                      {
                        item.logoUrl === '' ?
                          <Image
                            style={[styles.merchantLogo,{position: 'absolute',left: 10, top: 10,}]}
                            source={require('../../../../imgs/noShopLogo.png')}
                          /> :
                          <CachedImage
                            style={[styles.merchantLogo,{position: 'absolute',left: 10, top: 10,}]}
                            source={{uri: getImgUrl(item.logoUrl, 100)}}
                          />
                      }
                      <View style={styles.rightPart}>
                        <View style={styles.rightTopBpx}>
                          <Text style={styles.merchantName} numberOfLines={1}>{item.shopName}</Text>
                          <View style={styles.merchantDescription}>
                            <Text style={styles.descriptionTxt } numberOfLines={1}>
                              主营：{item.categoryNameList}
                            </Text>
                          </View>
                        </View>
                        <View style={styles.dashLine} />
                        <View style={styles.productsList}>
                          <Image style={styles.bigImg} source={{uri: getImgUrl(item.imagePath, width - 10 - 50 - 10 - 10, 75)}}/>
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                )
              }}
            />
          )
        }
      </View>
    )
  }

  animate = () => {
    this.interval = setInterval(()=>{
      this.setState({direction: !this.state.direction}, ()=>{
        Animated.timing(this.state.rotation, {
          toValue: Number(this.state.direction),
          duration: 300,
          easing: Easing.linear
        }).start();
      })
    }, 300);
  }

  renderNothing = () => {
    return (
      <View style={styles.kongBox}>
        <View>
          <Image style={styles.dt} source={require('./imgs/DT.png')}/>
        </View>
        <Animated.View style={[styles.zzBox, {
          transform: [{
            rotateZ: this.state.rotation.interpolate({
              inputRange: [0,1],
              outputRange: ['-30deg', '30deg']
            })
          }]
        }]}>
          <Image style={styles.zz} source={require('./imgs/ZZ.png')}/>
        </Animated.View>
        {
          this.state.fail ?
            <TouchableWithoutFeedback onPress={() => {
              this.setState({fail: undefined});
              this.animate();
              this.getShops();
            }
            }>
              <View style={{width: 100,height: 30,borderRadius: 5,alignItems: 'center',
                justifyContent:'center',borderWidth: 1,borderColor: styleConsts.headerLine,marginTop: 15}}>
                <Text style={{fontSize: styleConsts.H4,color: styleConsts.grey}}>重新寻找方位</Text>
              </View>
            </TouchableWithoutFeedback> :
            this.state.fail == undefined ?
              <Text style={styles.littleTip}>{'正在寻找服务器的方位...'}</Text>:
              <Text style={styles.littleTip}>{'暂无推荐店铺'}</Text>
        }

      </View>
    )
  }

  getShops = () =>{
    this.props.fetchRecommendShop({
      data: {},
      fail: (res) => {
        clearInterval(this.interval);
        this.setState({
          fail: true
        });
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
      },
      success: () =>{
        clearInterval(this.interval);
        this.setState({
          fail: false
        });
      }
    })}

  onMerchantPress = (item) => {
    this.props.navToMerchant({supplyGroupID:item.supplyID,supplyShopID :item.shopID});
  }
}

//props标准
RecommendMerchant.PropTypes = {
};

RecommendMerchant.defaultProps = {
};

const styles = StyleSheet.create({
  titleAndMore:{
    backgroundColor: styleConsts.white,
    height: 50,
    width: '100%',
    paddingHorizontal: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  firstTitle: {
    color: '#fd7078',
    fontSize: 15,
  },
  secondTitle: {
    color: '#fd9689'
  },
  thirdTitle: {
    color: '#fda390'
  },
  fourthTitle: {
    color: '#fead8b'
  },
  moreBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  merchantItem: {
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    paddingBottom: 10,
  },
  merchantLogo: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderWidth: 0.5,
    borderColor: styleConsts.lightGrey,
    borderRadius: 3,
  },
  rightPart: {
    flex: 1
  },
  rightTopBpx: {
    height: 50,
    justifyContent: 'space-around',
  },
  merchantName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey
  },
  merchantDescription: {
    flexDirection: 'row',
  },
  txtSeparate: {
    width: 20
  },
  descriptionTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey
  },
  productsList: {
    width: width - 10 - 60 - 10 - 10,
    height: 85,
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dashLine: {
    borderWidth: 0.5,
    borderColor: styleConsts.lightGrey,
    borderStyle: 'dashed',
  },
  bigImg: {
    width: width - 10 - 60 - 10 - 10 - 5 - 5,
    height: 75,
    borderRadius: 5,
  },
  kongBox: {
    backgroundColor: styleConsts.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: styleConsts.lightGrey,
    alignItems: 'center',
    paddingBottom: 100,
  },
  dt: {
    width: 161,
    height: 161,
    marginTop: 20,
  },
  zzBox: {
    top: 67.5,
    position: 'absolute',
    zIndex: 100
  },
  zz: {
    width: 66,
    height: 66,
  },
  littleTip: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
    marginTop: 19
  }
});

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    navToMerchant : (opts)=>{
      dispatch({type: SET_MAININFO_TO_GET_SHOP_INFO, payload: opts})
      dispatch({type: NAV_TO_SHOPCENTER_MAIN_PAGE});
    },
    fetchRecommendShop : (opts)=>{
      dispatch(fetchRecommendShopAC(opts));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(RecommendMerchant)
