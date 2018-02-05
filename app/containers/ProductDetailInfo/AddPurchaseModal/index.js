/**
 * 加采购清单的弹框
 */
import React, { Component } from 'react';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, Animated, Keyboard, ScrollView, } from 'react-native';
import Immutable from 'immutable';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
const AnimatedList = Animated.createAnimatedComponent(View);
import { styleConsts } from '../../../utils/styleSheet/styles';
import ChangePrice from '../../../components/ChangePrice';
import { getImgUrl } from '../../../utils/adapter';

class AddPurchaseModal extends Component{
  constructor(props){
    super(props);
    this.state = {
      nowHeight: new Animated.Value(0),
      height: 0,
      opticty: new Animated.Value(0),
      productDetailInfo: {},
    };
  }
  componentDidMount(){
    this.setState({
      productDetailInfo: this.props.productDetailInfo,
    })
  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.productDetailInfo,nextProps.productDetailInfo)){
      this.setState({
        productDetailInfo: nextProps.productDetailInfo,
      })
    }
  }
  render(){
    let { productDetailInfo } = this.state;
    return (
      <View style={[styles.wrapper,{ height: this.state.height }]}>
        {/*内容区上面部分点击关闭弹窗*/}
        <TouchableWithoutFeedback onPress={() => this.hide()}>
          <AnimatedList style={[styles.optictyBg,{opacity: this.state.opticty}]} />
        </TouchableWithoutFeedback>

        <Image
          style={styles.img}
          source={
            productDetailInfo.imgUrl && productDetailInfo.imgUrl !== '' ?
            { uri: getImgUrl(productDetailInfo.imgUrl,75,75) } :
              require('../../../imgs/noShopLogo.png')
          }
        />
        {/*内容区*/}
        <View style={styles.content}>
          <View style={styles.nameWrapper}>
            <Text style={styles.name}>{productDetailInfo.productName}</Text>
          </View>
          <ScrollView>
            {
              productDetailInfo.specs instanceof Array && productDetailInfo.specs.map((specItem) => {
                return (
                  <TouchableWithoutFeedback
                    key={specItem.specID}
                    onPress={() => {
                      specItem.isJionPurchaseList === 1 ?
                        this.props.deletePurchase(specItem) : this.props.addPurchase(specItem)
                    }}
                  >
                    <View style={styles.specsWrapper}>
                      <View style={styles.left}>
                        <ChangePrice width={120} big={styleConsts.H1} small={styleConsts.H5} price={specItem.productPrice}
                                     suffix={specItem.saleUnitName}
                                     color={specItem.isJionPurchaseList === 1 ? styleConsts.mainColor : styleConsts.grey}
                        />
                      </View>
                      <View style={[styles.left,styles.right,]}>
                        <View style={{flexDirection: 'row',marginRight: 5,}}>
                          <View style={[styles.left,{width: '45%',}]}>
                            <Text style={[styles.txt,specItem.isJionPurchaseList === 1 && {color: styleConsts.mainColor}]}>
                              {specItem.specContent}/{specItem.saleUnitName}
                            </Text>
                          </View>
                          <View style={[styles.left,{width: '45%',alignItems: 'center',}]}>
                            {
                              specItem.buyMinNum === 0 || specItem.buyMinNum === 1 ?
                                null :
                                <Text style={[styles.txt,specItem.isJionPurchaseList === 1 && {color: styleConsts.mainColor}]}>
                                  {specItem.buyMinNum}{specItem.saleUnitName}起购
                                </Text>
                            }
                          </View>
                          <View style={[styles.left,{width: '10%',alignItems: 'flex-end',}]}>
                            <Image
                              style={styles.icon}
                              source={specItem.isJionPurchaseList === 1 ? require('../imgs/selected.png') : require('../imgs/add.png')}
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                  </TouchableWithoutFeedback>
                )
              })
            }
          </ScrollView>
        </View>
      </View>
    )
  }

  show = (hideBack) => {
    this.hideBack = hideBack;
    Keyboard.dismiss();
    this.setState({
      height,
    });
    Animated.parallel([
      Animated.timing(
        this.state.opticty,
        {
          toValue: 0.4,
          duration: 150,
        }
      ).start(),
      Animated.timing(
        this.state.nowHeight,
        {
          toValue: height/2,
          duration: 200,
        }
      ).start()
    ])
  };

  hide = () => {
    this.hideBack instanceof Function && this.hideBack();
    Animated.parallel([
      Animated.timing(
        this.state.opticty,
        {
          toValue: 0,
          duration: 150,
        }
      ).start(),
      Animated.timing(
        this.state.nowHeight,
        {
          toValue: 0,
          duration: 200,
        }
      ).start()
    ]);

    this.timer = setTimeout(() => {
      this.setState({height: 0})
    }, 200);
  };

}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    overflow: 'hidden',
  },
  optictyBg: {
    width: '100%',
    height: height/2,
  },
  content: {
    width: width,
    height: height/2,
    backgroundColor: styleConsts.white,
    position: 'absolute',
    bottom: 0,
    left: 0,
    paddingLeft: styleConsts.screenLeft,
  },
  nameWrapper: {
    height: 70,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    justifyContent: 'center',
  },
  img: {
    width: 75,
    height: 75,
    position: 'absolute',
    left: 15,
    bottom: height/2 - 70 + 15,
    zIndex: 100,
  },
  name: {
    fontSize: styleConsts.H2,
    color: styleConsts.deepGrey,
    marginLeft: 90,
  },
  specsWrapper: {
    flexDirection: 'row',
    paddingLeft: 5,
    marginRight: 10,
  },
  left: {
    width: '30%',
    height: 50,
    justifyContent: 'center',
  },
  right: {
    width: '70%',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  txt: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
  },
  icon: {
    width: 18,
    height: 18,
  },
});
export default AddPurchaseModal