/**
 * Created by chenshuang on 2017/8/9.
 */
import React from 'react'
import { View, TextInput, PixelRatio, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Platform } from 'react-native'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/Ionicons'
import { styleConsts } from '../../utils/styleSheet/styles';
import ModalBox from '../ModalBox';
import I18n from 'react-native-i18n';

import {
  NAV_TO_LOGIN_SCENE,
  NAV_TO_INPUT_INFO_SCENE,
} from '../../redux/actions/nav.action'

import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';

// 门店营业状态(1-正常营业，0-暂停营业)
const SHOP_STATUS_NORMAL_BUSINESS = 1;
const SHOP_STATUS_STOP_BUSINESS = 0;


class ProductNum extends React.Component {
  constructor(props){
    super(props);
    this.state={
      productNum: 0,
      disabled: false,
      showButtons: false,
      visible: false,
      old: 0,
      buyMinNum: 1
    };
  }
  componentDidMount(){
    this.setState({
      productNum: this.props.productNum || 0,
      buyMinNum: this.props.buyMinNum || 1,
      old: this.props.productNum || 0,
      showButtons : !!this.props.productNum,
      disabled: this.props.disabled
    })
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.productNum !== this.props.productNum || this.props.shopID !== nextProps.shopID){
      this.setState({
        productNum: nextProps.productNum || 0,
        old: nextProps.productNum || 0,
        showButtons : !!nextProps.productNum,
      })
    }
    if(nextProps.buyMinNum !== this.props.buyMinNum ){
      this.setState({
        buyMinNum: nextProps.buyMinNum || 1,
      })
    }
    if(nextProps.disabled !== this.props.disabled){
      this.setState({
        disabled: nextProps.disabled
      })
    }
  }
  render() {
    //TODO:修改数量失败应该把数量还原
    const {productNum} = this.state;
    return (
      <View>
        {
          this.props.$user.getIn(['userInfo', 'roleName']) != '2' ?
          this.state.showButtons ?
            <View style={[styles.container, styles.flowRow, this.props.styles[0]]}>
              <TouchableWithoutFeedback disabled={this.state.disabled}  onPress={this.onReducePress}>
                <View style={[styles.iconBox, {left: -20}]}>
                  <Icon name={'md-remove'} size={15} style={styles.iconStyle}/>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback  disabled={this.state.disabled}>
                <TextInput
                  style={styles.textInput}
                  keyboardType={Platform.OS == 'ios' ? 'number-pad' : 'numeric'}
                  value={`${productNum}`}
                  maxLength={4}
                  editable={!this.state.disabled}
                  onChangeText={this.onInputChange}
                  onEndEditing={()=>{
                    let showButtons = true;
                    let old = this.state.old;
                    let num = this.state.productNum;
                    let { buyMinNum } = this.state;
                    if(productNum == '' || productNum == '0' ){
                      showButtons= false;
                      num = 0;
                    }
                    if(old !== num){
                      if(num < buyMinNum && num != 0){
                        this.setState({
                          productNum: old
                        })
                        this.toast && Toast.hide(this.toast);
                        this.toast = toastShort(`该商品的最小起购量是${buyMinNum}哦`);
                        return;
                      }else {
                        old = num;
                        this.props.onChange && this.props.onChange(num)
                      }
                    }
                    this.setState({
                      old,
                      showButtons
                    })
                  }}
                  underlineColorAndroid="transparent"
                />
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback style={styles.iconBox}  onPress={ this.state.disabled ? () => {}: this.onAddPress}>
                <View style={[styles.iconBox, {right: -20,   alignItems: 'flex-start',}]}>
                  <Icon name={'md-add'} size={15} style={styles.iconStyle}/>
                </View>
              </TouchableWithoutFeedback>

            </View>
            :
            <TouchableWithoutFeedback onPress={() => this.onAddPress('first')} >
              <View>
                <View style={[styles.addBox, this.props.styles[0]]}>
                  <Icon name={'md-add'} size={15} style={styles.iconStyle}/>
                </View>
              </View>
            </TouchableWithoutFeedback> : null
        }

        <ModalBox
          visible={this.state.visible}
          title='您还不能添加购物车哦'
          tipTxt={I18n.t('inputInfoPlease')}
          leftBtnTxt='容我再想想吧'
          rightBtnTxt= {I18n.t('inputNow')}
          leftCallback={() => {
            this.setState({visible: false});
          }}
          rightCallback={() => {
            this.setState({visible: false});
            this.props.navToInputInfo(this.props.$user.toJS().userInfo)
          }}
        />
      </View>
    )
  }
  onReducePress = () =>{
    if(!this.props.token || this.props.token === ''){
      return this.props.gotoLogin()
    }

    let { productNum, showButtons, buyMinNum } = this.state;
    if(productNum == buyMinNum){
      productNum = 0;
    }else{
      productNum -= 1;
    }
    if( 0 == productNum){
      showButtons = false;
    }
    this.setState({
      productNum,
      old: productNum,
      showButtons
    },()=>{
      this.props.onChange && this.props.onChange(this.state.productNum);
    })
  };
  onInputChange = (productNum) =>{
    let data = this.props.$user.toJS().cache.data;
    if(!this.props.token || this.props.token === ''){
      return this.props.gotoLogin()
    } else if(data && data.purchaserShop && data.purchaserShop instanceof Array) {
      // 筛选出正常营业的门店列表
      let purchaserShop = data.purchaserShop.filter((shop) => {
        return shop.isActive === SHOP_STATUS_NORMAL_BUSINESS;
      });
      if(purchaserShop.length === 0) {
        this.toast && Toast.hide(this.toast);
        return this.toast = toastShort('暂无可用门店哦');
      }
    }

    this.setState({
      productNum: productNum,
    })

  };
  onAddPress = (type) =>{
    let data = this.props.$user.toJS().cache.data;
    let { productNum, showButtons } = this.state;

    if(!this.props.token || this.props.token === ''){
      return this.props.gotoLogin()
    } else if (data && data.purchaserShop && data.purchaserShop instanceof Array){
      if(data.purchaserShop.length == 0) {
        this.setState({
          visible: true,
        });
        return;
      } else {
        // 筛选出正常营业的门店列表
        let purchaserShop = data.purchaserShop.filter((shop) => {
          return shop.isActive === SHOP_STATUS_NORMAL_BUSINESS;
        });
        if(purchaserShop.length === 0) {
          this.toast && Toast.hide(this.toast);
          return this.toast = toastShort('暂无可用门店哦');
        }
      }
    }

    if(type == 'first'){
      productNum = Number(productNum) + this.state.buyMinNum;
    }else{
      if(productNum == 9999){
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(`最大下单数量是9999哦`);
        return;
      }
      productNum = Number(productNum) + 1;
    }
    if( 0 !== productNum){
      showButtons = true;
    }
    this.setState({
      productNum,
      showButtons,
      old: productNum,
    },()=>{
      this.props.onChange && this.props.onChange(this.state.productNum);
    });
    return false
  };

}

ProductNum.defaultProps = {
  styles: [],
  productNum: 0,
  onChange: ()=>{}
};

ProductNum.PropTypes = {
  styles: React.PropTypes.array,
  productNum: React.PropTypes.number,
  onChange: React.PropTypes.func
};

const styles = StyleSheet.create({
  flowRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  container:{
    width: 93,
    height: 23,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: styleConsts.white,
    borderColor: '#ddd',
    borderRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  addIcon:{
    fontWeight: 'bold'
  },
  iconBox: {
    position: 'absolute',
    top: -10,
    height: 42,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 40,
    backgroundColor: 'rgba(0,0,0,0)'
  },
  iconStyle: {
    color: styleConsts.middleGrey,
    width: 20,
    textAlign: 'center',
  },
  textInput: {
    width: 44,
    height: Platform.OS == 'ios'?'100%': 42,
    textAlign: 'center',
    color: styleConsts.deepGrey,
    fontSize: styleConsts.H3,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    marginLeft: 23,
  },
  addBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    borderRadius: 2,
    width: 23,
    height: 23,
    marginTop: 12,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

const mapStateToProps = (state) => {
  return {
    token: state.user.get('token'),
    $user: state.user,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    gotoLogin: () => {
      dispatch({type: NAV_TO_LOGIN_SCENE})
    },
    navToInputInfo: (opts) => {
      dispatch({ type: NAV_TO_INPUT_INFO_SCENE, payload: opts })
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductNum)
