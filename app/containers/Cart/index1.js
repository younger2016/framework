import React, { Component } from 'react'
import Immutable from 'immutable';
import {
  AppRegistry,
  ListView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  View,
  SectionList,
  Image,
  ScrollView,
  TextInput,
  RefreshControl,
  Platform
} from 'react-native'
import ModalBox from '../../components/ModalBox'
import { styleConsts } from '../../utils/styleSheet/styles';
import { connect } from 'react-redux'
import CheckBox from 'react-native-check-box'
import ProductNum from '../../components/ProductNum'
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import  I18n  from 'react-native-i18n'
import {NAV_TO_COMMIT_BILL_SCENE, NAV_TO_LOGIN_SCENE, NAV_TO_INPUT_INFO_SCENE, NAV_TO_PRODUCT_DETAIL_INFO} from '../../redux/actions/nav.action'
import HeaderBar from '../../components/HeaderBar'
import ChangePrice from '../../components/ChangePrice'
import BlankPage from '../../components/BlankPage'
import Dimensions from 'Dimensions'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {PullSectionList} from '../../components/PullList'

import {
  fetchCartListAC,
  changeCartInfoForCartPageAC,
  deleteCartProductAC,
  clearInvalidProductAC,
  deleteCartSpecAC,
  cancelFetchCartListAC,
  goToSettlementAC,
  CHANGE_CART_INFO_FOR_CART_PAGE_CANCEL,
  DELETE_CART_PRODUCT_CANCEL,
  DELETE_CART_SPEC_CANCEL,
  CLEAR_INVALID_PRODUCT_CANCEL,
} from '../../redux/actions/cart.action'
import { userGetGroupInfoAll } from '../../redux/actions/user.action'
import {getImgUrl} from '../../utils/adapter'
import {
  SAVE_PRODUCT_ID,
} from '../../redux/actions/products.action';
const tipList = [
  'yourInfoIsWaitingCheck',
  '',
  'yourInfoInvalid',
  'youNeedInputInfo',
];
const { width, height } = Dimensions.get('window');

class CartScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      checkedAll: false,
      editable: false,  //是否处于编辑状态
      shopsInfo: [],    //有效购物车数据
      invalidProduct: [], //有效购物车数据
      $invalidSet : Immutable.Set(), //去失能的id
      $checkProduct: new Set(),//选中商品
      $checkShop: new Set(),//选中门店
      hideBack: true, //是否可返回(是否是二级页面)
      visible: false, //提示框显隐
      spinVisible: false, //loading显隐
      sync: false, //数据是否与后台同步
      refreshing: false,  //下拉刷新状态
      isOnline: 1,
      loadingFail: false,
      proNum: '', // 选中的sku数量
    };
  }

  componentDidMount(){
    this.setState({
      hideBack: !(this.props.navigation.state.params && this.props.navigation.state.params.second)
    });
    if('' !== this.props.user.get('token')){
      if(!this.props.cart.getIn['cartList', 'sync']) {
        this.fetchCartInfo();
      }
    }

  }

  componentWillUnmount(){
    this.setState({
      spinVisible: false
    });
    this.props.cancelFetch();
  }

  componentWillReceiveProps(nextProps){

    if(!Immutable.is(this.props.user.get('token'), nextProps.user.get('token'))){
      if(nextProps.user.get('token') !== ''){
        this.fetchCartInfo();
      }
    }

    if(this.props.cart.get('cartList') !== nextProps.cart.get('cartList')){
      let normalProduct = nextProps.cart.getIn(['cartList', 'normalProduct']).toJS();
      let $checkShop = new Set(), $checkProduct = new Set(), checkedAll = false;
      //判断选中状态
      let newNormalProduct = normalProduct.map((shop) => {
        if(nextProps.cart.getIn(['cartList','sync'])){
          shop.shopcartProductList.forEach((product)=>{
            if(product!== null && !product.isSelected){
              $checkProduct.add(`${shop.purchaserShopID}-${product.productID}`);
            }
          });
          let thisShopsProduct = Array.from($checkProduct).filter((item) => item.split('-')[0] == shop.purchaserShopID);
          if(thisShopsProduct.length == shop.shopcartProductList.length){
            $checkShop.add(`${shop.purchaserShopID}`);
          }
          if($checkShop.size == normalProduct.length){
            checkedAll = true
          }
        }else{
          $checkShop = this.state.$checkShop;
          $checkProduct = this.state.$checkProduct;
          checkedAll = this.state.checkedAll;

        }
        return Object.assign({
          purchaserShopID: shop.purchaserShopID,
          purchaserShopName: shop.purchaserShopName,
          data: shop.shopcartProductList,
        }, {});
      });
      let invalidProduct = nextProps.cart.getIn(['cartList', 'invalidProduct']).toJS();

      this.setState({
        $checkShop,
        $checkProduct,
        checkedAll,
        invalidProduct,
        shopsInfo: newNormalProduct,
      });

    }

    if(!Immutable.is(this.props.tabNav, nextProps.tabNav)){
      if( nextProps.tabNav.get('index') === 2 &&
        !nextProps.cart.getIn(['cartList', 'sync']) &&
        '' !== this.props.user.get('token')){
        this.fetchCartInfo();
      }
    }

    if(nextProps.navReducer.routes[nextProps.navReducer.index].routeName == 'Login'){
      this.setState({spinVisible: false})
    }
  }

  render() {
    let {$checkProduct, shopsInfo} = this.state, count = 0, skuNums = 0;
    shopsInfo.forEach((shop) => {
      shop.data.forEach((product) => {
        if($checkProduct.has(`${shop.purchaserShopID}-${product.productID}`)){
          product.specs.forEach((spec) => {
            count += parseFloat(spec.shopcartNum) * parseFloat(spec.productPrice)
            skuNums += 1;
          })
        }
      })
    });
    let props = {};
    if(this.props.user.getIn(['userInfo', 'roleName']) != '2' && $checkProduct.size > 0){
      props.onPress = this.checkout;
    }
    let isOnline = this.props.user.getIn(['cache', 'data', 'userInfo', 'isOnline']);

    return (
      <View style={styles.container}>
        <HeaderBar
          goBackHide={this.state.hideBack}
          navigation={this.props.navigation}
          title={I18n.t('cart')}
          rightText={!this.state.editable ? I18n.t('edit'): I18n.t('down')}
          cancelCallback={this.state.editable ? this.editDown : this.editCart}
        />
        {
          this.state.shopsInfo.length !== 0 ?
            this.renderList()
            :
            this.state.spinVisible?
              null : this.state.loadingFail ?
              <View>
                <BlankPage
                  visable={true}
                  type={'error'}
                  loadAgain={() =>this.fetchCartInfo()}
                  imgType='noProduct'
                />
              </View>
              : this.renderNothing()
        }
        {
          this.state.shopsInfo.length !== 0?
            <View>
              <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
              <View style={[styles.bottomBox, styles.flexRow]}>
                <CheckBox
                  style={[styles.supplier,{width: 80}]}
                  onClick={this.checkAll}
                  isChecked={this.state.checkedAll}
                  rightText={I18n.t('selectAll')}
                  rightTextStyle={{fontSize: styleConsts.H4}}
                  unCheckedImage={<View style={styles.unSelectedIcon}/>}
                  checkedImage={
                    <View style={[styles.unSelectedIcon, styles.center]}>
                      <Image style={{width: 10, height: 8}} source={require('./imgs/check.png')}/>
                    </View>
                  }
                />
                {
                  this.state.editable ?
                    <View style={styles.flexRow}>
                      <TouchableHighlight underlayColor={styleConsts.mainColorActive}
                                          {...props}
                                          style={[styles.totalBox, props.onPress && styles.darkButton]}
                      >
                        <View style={styles.totalBox}>
                          <Text style={{color: styleConsts.white,fontSize: styleConsts.H3}}>
                            {I18n.t('delete')}
                          </Text>
                        </View>
                      </TouchableHighlight>
                    </View> :
                    <View style={styles.bottomLeft}>
                      <View style={{flexDirection: 'row', alignItems: 'center',}}>
                        <Text  numberOfLines={1} style={{fontSize: styleConsts.H4, color: styleConsts.deepGrey, marginRight: 5}}>
                          {I18n.t('total')}:
                        </Text>
                        <ChangePrice big={styleConsts.H2} samll={styleConsts.H4} width={'auto'} price={count}/>
                      </View>
                      <TouchableHighlight underlayColor={styleConsts.mainColorActive}
                                          {...props}
                                          style={[styles.totalBox, props.onPress && styles.darkButton]}
                        >
                        <View >
                          <Text style={{color: styleConsts.white, fontSize: styleConsts.H3}}>
                            {I18n.t('checkout')}{skuNums ? `（${skuNums}）` : ''}
                          </Text>
                        </View>
                      </TouchableHighlight>

                    </View>
                }
              </View>
            </View>:null
        }

        <ModalBox
          imgName='what'
          iconName='warning'
          visible={this.state.visible}
          title={I18n.t('cantSettlement')}
          tipTxt={I18n.t(tipList[isOnline])}
          leftBtnTxt= {isOnline == 0 ? I18n.t('gotIt'):null}
          rightBtnTxt= {isOnline == 2 || isOnline == 3 ? I18n.t('inputNow') : null}
          laterBtnTxt={isOnline == 2 || isOnline == 3?I18n.t('letMeThink'): null}
          leftCallback={() => {
            this.setState({visible: false});
          }}
          rightCallback={() => {
            this.setState({visible: false});
            this.props.navToInputInfo({
              loginPhone: this.props.user.getIn(['userInfo', 'loginPhone']),
              groupName: this.props.user.getIn(['userInfo', 'purchaserName'])
            })
          }}
          laterCallback={() => {
            this.setState({visible: false});
          }}
        />

        <View style={{
          flex: 1,
          width: this.state.spinVisible ? '100%': 0,
          height: this.state.spinVisible? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage
            visable={this.state.spinVisible}
            type={'loading'}
          />
        </View>
      </View>
    )
  }

  fetchCartInfo = (type, resove) => {
    this.setState({
      spinVisible: type !== 'up',
      loadingFail: false
    }, () => {
      this.props.fetchCartList({
        data: {
          purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID'])
        },
        success: () => {
          this.setState({
            spinVisible: false,
            editable: false,
            loadingFail: false,
            sync: true
          })
          if(resove instanceof Function){
            resove('success')
          }
        },
        fail: (data) => {
          this.setState({
            spinVisible: false,
            loadingFail: true
          });if(resove instanceof Function){
            resove('success')
          }
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(data.response.message || I18n.t('fetchErrorMessage'));
        }
      })
    })
  }

  renderInvalidList = (item, idx) => {
    return (
      <View style={{backgroundColor: styleConsts.white}} key={`invalid${item.productID}`}>
        <View style={styles.checkItems}>
          <View style={[styles1.item, idx == this.state.invalidProduct.length -1 && {borderWidth: 0}]}>
            <Image style={[styles1.img, {marginLeft: 10}]} source={{uri: getImgUrl(item.imgUrl, 60)}} />
            <View style={styles1.rightPart}>
              <Text style={styles1.productName}>{item.productName}</Text>
              <Text style={styles1.supplierName}>{item.supplierShopName}</Text>
              {
                item.specs.map((unit) => {
                  return (
                    <View style={styles1.specsWrapper} key={`invalidSpec${unit.specID}`}>
                      <View  style={[styles1.specsWrapper, {marginTop: 15.5}]}>
                        <View style={{width: 61}}>
                          <ChangePrice price={unit.productPrice} suffix={unit.saleUnitName} width={85} color={styleConsts.grey}/>
                        </View>
                        {
                          !!unit.specContent&&<Text style={styles1.specsContent} numberOfLines={1}>{`${unit.specContent}/${unit.saleUnitName}`}</Text>
                          }
                        </View>

                      {
                        idx % 2 ==0 ?
                          (
                            <View style={[styles.invalidStyle, styles.redOne]}>
                              <Text style={{color: styleConsts.middleGrey, fontSize:styleConsts.H5}}>{I18n.t('productOffShelf')}</Text>
                            </View>
                          ):(
                          <View style={[styles.invalidStyle, styles.yellowOne]}>
                            <Text style={{color: styleConsts.middleGrey,  fontSize:styleConsts.H5}}>{I18n.t('insufficientStock')}</Text>
                          </View>
                        )
                      }

                    </View>
                  )
                })
              }
            </View>
          </View>
        </View>
      </View>
    )
  };

  renderNothing = () => {
    return (
      <View style={styles.nothing}>
        <Image style={styles.nothingImg} source={require('./imgs/kong.png')} />
        {
          '' !== this.props.user.get('token') ? (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={styles.kongNote}>{I18n.t('thereIsNoting')}</Text>
              <Text style={styles.kongTip}>{I18n.t('buyNow')}</Text>
            </View>
          ): (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <Text style={[styles.kongNote, {color: styleConsts.grey}]}>{I18n.t('loginToBuy')}</Text>
              <TouchableWithoutFeedback onPress={this.props.login}>
                <View style={styles.kongButton}>
                  <Text style={styles.kongButtonTxt}>{I18n.t('loginNow')}</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          )
        }

      </View>
    )
  };

  renderList = () => {
    let {invalidProduct, shopsInfo} = this.state;
    let newShops = JSON.parse(JSON.stringify(shopsInfo));
    if(invalidProduct.length > 0){
      let invalidShop = {
        purchaserShopID: '00000',
        purchaserShopName: '失效商品',
        data: invalidProduct
      };
      newShops.push(invalidShop);
    }
    return (
      <View style={{flex: 1, marginTop: -10, zIndex: -1}}>
        <PullSectionList
          ItemSeparatorComponent = {() => (
            <View style={styles.separator}/>
          )}
          renderSectionHeader={this.sectionComp}
          renderItem={this.renderItem}
          sections={newShops}
          keyExtractor={(item) => item.productID}
          refreshing={this.state.refreshing}
          canLoadMore={false}
          onRefresh={(resove)=> {
            this.fetchCartInfo('up', resove)
          }}
        />
      </View>

    )
  };
  //渲染列表项
  renderItem = (info) => {
    let item = info.item;
    let index = info.index;
    if(info.section.purchaserShopID == '00000'){
      return this.renderInvalidList(item, index)
    }
    return (
      <View key={`product${item.productID}`}>
        <View style={[styles.checkItems, this.state[`opacity${info.section.purchaserShopID}${index}`] && {backgroundColor: 'rgba(255, 255, 255, 0.3)'}]}>
          <CheckBox
            style={styles.check}
            onClick={(val)=>this.checkProduct(info.section.purchaserShopID, item)}
            isChecked={this.state.checkedAll ||
            this.state.$checkShop.has(`${info.section.purchaserShopID}`) ||
            this.state.$checkProduct.has(`${info.section.purchaserShopID}-${item.productID}`)}
            unCheckedImage={<View style={styles.unSelectedIcon}/>}
            checkedImage={
              <View style={[styles.unSelectedIcon, styles.center]}>
                <Image style={{width: 10, height: 8}} source={require('./imgs/check.png')}/>
              </View>
            }
          />
          <TouchableWithoutFeedback
            onPressIn={() =>this.press(info.section.purchaserShopID, index, true)}
            onPressOut={() =>this.press(info.section.purchaserShopID, index, false)}
            onPress={()=>this.navToProductDetailInfo(item.productID)}>
            <View style={[styles1.item, info.index == info.section.data.length -1 && {borderBottomWidth: 0}]}>
              <Image style={styles1.img} source={{uri: getImgUrl(item.imgUrl, 60)}} />
              <View style={styles1.rightPart}>
                <Text style={styles1.productName}>{item.productName}</Text>
                <Text style={styles1.supplierName}>{item.supplierShopName}</Text>
                {
                  item.specs.map((unit) => {
                    return (
                      <View style={styles1.specsWrapper} key={`spec${unit.specID}`}>
                        <View  style={[styles1.specsWrapper, {marginTop:Platform.OS == 'ios' ? 11.5 : 7 }]}>
                          <ChangePrice price={unit.productPrice} suffix={unit.saleUnitName} width={70}/>
                          {
                            !!unit.specContent&&<Text style={styles1.specsContent} numberOfLines={1}>{`${unit.specContent}/${unit.saleUnitName}`}</Text>
                          }
                            </View>

                        <ProductNum
                          disabled={this.state.$invalidSet.has(unit.specID)}
                          productNum={parseFloat(unit.shopcartNum)}
                          onChange={(val)=>this.productNumChange(val, info.section, unit, item)}
                          buyMinNum={unit.buyMinNum}
                        />

                      </View>
                    )
                  })
                }
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    )
  };

  press = (purchaserShopID, index, flag)=>{
    let newShopsInfo = JSON.parse(JSON.stringify(this.state.shopsInfo));
    this.setState({
    [`opacity${purchaserShopID}${index}`]: flag,
    shopsInfo: newShopsInfo
  })};
  //分组头
  sectionComp = (info) => {
    if(info.section.purchaserShopID == '00000'){
      return (
        <View style={styles.supplierBox}>
          <Image style={styles.bgImg} source={require('./imgs/supplierBg.png')}/>
          <View style={{flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center', justifyContent: 'space-between'}}>
            <View style={{flexDirection: 'row'}}>
              <Image style={{width: 13, height: 13, marginHorizontal: 10}} source={require('./imgs/cry.png')}/>
              <Text style={styles.supplierTxt}>{I18n.t('invalidProduct')}</Text>
            </View>
            <TouchableWithoutFeedback onPress={this.clearInvalid}>
              <View style={styles.clear}>
                <Image style={{width: 9, height: 10}} source={require('./imgs/clear.png')}/>

                <Text style={{color: styleConsts.middleGrey, fontSize:styleConsts.H5, backgroundColor: 'transparent'}}>{I18n.t('clear')}</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </View>
      )
    }
    return (
      <View style={styles.supplierBox} key={`supplier${info.section.purchaserShopID}`}>
        <Image style={styles.bgImg} source={require('./imgs/supplierBg.png')}/>
        <View style={styles.supplierName}>
          <CheckBox
            style={styles.supplier}
            onClick={(val)=>this.checkSupplier(info.section.purchaserShopID)}
            isChecked={ this.state.checkedAll || this.state.$checkShop.has(`${info.section.purchaserShopID}`)}
            unCheckedImage={<View style={styles.unSelectedIcon}/>}
            checkedImage={
              <View style={[styles.unSelectedIcon, styles.center]}>
                <Image style={{width: 10, height: 8}} source={require('./imgs/check.png')}/>
              </View>
            }
          />
          <View style={{flex: 1, flexDirection: 'row', width: '100%', alignItems: 'center'}}>
            <Image style={{width: 13, height: 13, marginRight: 10}} source={require('../CommitBill/imgs/shops.png')}/>
            <Text style={{color: styleConsts.moreGrey, backgroundColor: 'transparent'}}>
              {info.section.purchaserShopName}
            </Text>
          </View>
        </View>
      </View>
    )
  };
  //选供应商
  checkSupplier = (purchaserShopID) => {
    let { $checkShop, $checkProduct, shopsInfo, checkedAll } = this.state;
    let thisShop = shopsInfo.find(shop => shop.purchaserShopID === purchaserShopID);//当前店铺
    let newShopsInfo = JSON.parse(JSON.stringify(shopsInfo));
    if($checkShop.has(`${purchaserShopID}`)){
      $checkShop.delete(`${purchaserShopID}`);
      $checkProduct.forEach((productIDCheck)=>{
        if(productIDCheck.split('-')[0] == purchaserShopID){
          $checkProduct.delete(productIDCheck)
        }
      });
      checkedAll = false;
    }else{
      $checkShop.add(`${purchaserShopID}`);
      thisShop.data.forEach((product) =>{
        $checkProduct.add(`${purchaserShopID}-${product.productID}`)
      });
      if($checkShop.size === shopsInfo.length){
        checkedAll = true
      }
    }
    let newData = thisShop.data.map((product) => {
      return product.specs.map((spec)=> {
        return {
          productID: product.productID,
          productSpecID: spec.specID,
          shopcartNum: spec.shopcartNum,
          isSelected: Number(!$checkShop.has(`${purchaserShopID}`))
        }
      })
    }).reduce((prev, curr)=>{
      return prev.concat(curr);
    });
    if(!this.state.editable) {
      this.props.changeCartInfo({
        data: {
          list: [
            {
              purchaserShopID: thisShop.purchaserShopID,
              purchaserShopName: thisShop.purchaserShopName,
              shopcarts: newData
            }
          ],
          purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID']),

        },
        success: ()=> {
          this.setState({
            $checkProduct,
            $checkShop,
            checkedAll,
            shopsInfo: newShopsInfo
          })
        },
        fail: (data)=>{
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(data.response.message || I18n.t('fetchErrorMessage'));
        }
      });
    }else{
      this.setState({
        $checkProduct,
        $checkShop,
        checkedAll,
        shopsInfo:newShopsInfo
      })
    }
  };
  //选商品
  checkProduct = (purchaserShopID, val) =>{
    let { $checkProduct, $checkShop, shopsInfo, checkedAll } = this.state;
    let newShopsInfo = JSON.parse(JSON.stringify(shopsInfo));
    let thisShop = shopsInfo.find(shop => shop.purchaserShopID === purchaserShopID);//当前店铺
    if($checkProduct.has(`${purchaserShopID}-${val.productID}`)){
      $checkProduct.delete(`${purchaserShopID}-${val.productID}`);
      $checkShop.delete(`${purchaserShopID}`);
      checkedAll = false;
    }else{
      $checkProduct.add(`${purchaserShopID}-${val.productID}`);
      let productCount = 0;
      $checkProduct.forEach(productIDCheck => {
        if(productIDCheck.split('-')[0] == purchaserShopID){
          productCount ++;
        }
      });
      if(thisShop.data.length == productCount){
        $checkShop.add(`${purchaserShopID}`);
      }
      if($checkShop.size === shopsInfo.length){
        checkedAll = true
      }

    }
    let newData = thisShop.data.find((product) => {
      return product.productID == val.productID;
    }).specs.map((spec)=>{
      return {
        productID: val.productID,
        productSpecID: spec.specID,
        shopcartNum: spec.shopcartNum,
        isSelected: Number(!$checkProduct.has(`${purchaserShopID}-${val.productID}`))
      }
    });
    if(!this.state.editable){
      this.props.changeCartInfo({
        data: {
          list: [
            {
              purchaserShopID: thisShop.purchaserShopID,
              purchaserShopName: thisShop.purchaserShopName,
              shopcarts: newData
            }
          ],
          purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID']),
        },
        success: ()=>{
          this.setState({
            $checkProduct,
            $checkShop,
            checkedAll,
            shopsInfo:newShopsInfo
          })
        },
        fail: (data) => {
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(data.response.message || I18n.t('fetchErrorMessage'));
        }
      });
    }else{
      this.setState({
        $checkProduct,
        $checkShop,
        checkedAll,
        shopsInfo:newShopsInfo
      })
    }

  };
  //全选
  checkAll = () => {
    let {checkedAll, $checkProduct, $checkShop, shopsInfo} = this.state;
    let newShopsInfo = JSON.parse(JSON.stringify(shopsInfo));
    if(!checkedAll){ //全选
      shopsInfo.forEach((shop)=>{
        $checkShop.add(`${shop.purchaserShopID}`);
        shop.data.forEach((product)=>{
          $checkProduct.add(`${shop.purchaserShopID}-${product.productID}`)
        })
      })
    }else{ //取消全选
      $checkShop.clear();
      $checkProduct.clear();
    }
    let allData = shopsInfo.map((thisShop) => {
      let newData = thisShop.data.map((product) => {
        return product.specs.map((spec)=> {
          return {
            productID: product.productID,
            productSpecID: spec.specID,
            shopcartNum: spec.shopcartNum,
            isSelected: Number(checkedAll)
          }
        })
      }).reduce((prev, curr)=>{
        return prev.concat(curr);
      });
      return {
        purchaserShopID: thisShop.purchaserShopID,
        purchaserShopName: thisShop.purchaserShopName,
        shopcarts: newData
      }
    });
    if(!this.state.editable) {
      this.props.changeCartInfo({
        data: {
          list: allData,
          purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID'])
        },
        fail: (data) => {
          this.setState({
            spinVisible: false
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(data.response.message || I18n.t('fetchErrorMessage'));
        },
        success: () => {
          this.setState({
            $checkProduct,
            $checkShop,
            checkedAll: !checkedAll,
            shopsInfo:newShopsInfo
          })
        }
      });
    }else{
      this.setState({
        $checkProduct,
        $checkShop,
        checkedAll: !checkedAll,
        shopsInfo:newShopsInfo
      })
    }
  };
  //编辑
  editCart = () => {
    this.setState({
      checkedAll: false,
      $checkProduct: new Set(),
      $checkShop: new Set(),
      editable: true,
    });
  };
  //完成
  editDown = () => {
    if(!this.props.cart.getIn['cartList', 'sync']) {
      this.fetchCartInfo();
    }
  };
  //去结算/删除
  checkout = () => {
    if(this.state.$checkProduct.size > 0){
      if(!this.state.editable){
        let isOnline = this.props.user.getIn(['cache', 'data', 'userInfo', 'isOnline']);

        switch (isOnline) {
          case 1:
            let {shopsInfo, $checkProduct} = this.state;
            let checkShop = new Set();
            Array.from($checkProduct).map(product => {
              checkShop.add(product.split('-')[0]);
            });
            let shopList = Array.from(checkShop).map(shopID => {
              let shopInfo = shopsInfo.find(shopInfo => {
                return shopInfo.purchaserShopID == shopID
              });
              return {
                shopID: shopInfo.purchaserShopID,
                shopName: shopInfo.purchaserShopName
              }
            });
            this.setState({
              spinVisible: true,
            }, ()=>{
              this.props.goToSettlement({
                data: {
                  purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID']),
                  shopList: shopList
                },
                success: ()=>{
                  this.setState({
                    spinVisible: false
                  }, () => {
                    this.props.checkout();
                  })
                },
                fail: (res)=>{
                  this.setState({
                    spinVisible: false
                  });

                  this.toast && Toast.hide(this.toast);
                  this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
                }

              })
            });
            break;
          default:
            this.setState({
              visible: true,
            });
            break;
        }

      }else{
        let {$checkProduct, checkedAll, shopsInfo} = this.state;
        let allData = [];
        let productIDs = {};
        let shopsIDs = new Set();
        //找出所有店鋪id,商品id
        $checkProduct.forEach((productIDCheck) => {
          let shopID = productIDCheck.split('-')[0];
          shopsIDs.add(shopID);
          productIDs[shopID] = new Set();

        });
        if(checkedAll){ //全选
          $checkProduct.forEach((productIDCheck) => {
            let shopID = productIDCheck.split('-')[0];
            let productID = productIDCheck.split('-')[1];
            productIDs[shopID].add(productID);

          });
          allData = shopsInfo.map((shop) => {
            return {
              purchaserShopID: shop.purchaserShopID,
              purchaserShopName: shop.purchaserShopName,
              shopcarts: shop.data.map((product) => { //匹配出一个店铺的所以规格
                return product.specs.map((spec) => {
                  return {productSpecID: spec.specID}
                });
              }).reduce((pre, cur) => {
                return pre.concat(cur)
              })
            }
          });
        }else{
          allData = Array.from(shopsIDs).map((shopID) => {
            let carts = [];
            Array.from($checkProduct).forEach((productIDCheck) => { //匹配出一个店铺的所以规格
              let productID = productIDCheck.split('-')[1];
              let thisShopID = productIDCheck.split('-')[0];
              if(thisShopID == shopID){
                productIDs[shopID].add(productID);
                carts.push(
                  shopsInfo.find((shop) => {
                    return shop.purchaserShopID == shopID;
                  }).data.find((product) => {
                    return product.productID == productID;
                  }).specs.map((spec) => {
                    return {productSpecID: spec.specID}
                  })
                )
              }
            });

            return {
              purchaserShopID: parseInt(shopID),
              shopcarts: carts.reduce((pre, cur) => {
                return pre.concat(cur)
              })
            }
          })
        }
        this.setState({
          spinVisible: true,
        }, () => {
          this.props.deleteCartProduct({
            data: {
              list: allData,
              purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID'])
            },
            deleteProducts: productIDs,
            success: ()=>{
              this.setState({
                checkedAll: false,
                $checkProduct: new Set(),
                $checkShop: new Set(),
                spinVisible: false,
                // shopsInfo: shopsInfo
              })
            },
            fail: (res)=>{
              this.setState({
                spinVisible: false,
              });
              this.toast && Toast.hide(this.toast);
              this.toast = toastShort(res.response.message || I18n.t('fetchErrorMessage'));
            }
          });
        })
      }

    }else{
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('您还没有选择商品哦');
    }
  };
  //数量变化
  productNumChange = (val, shop, unit, product) => {
    let {shopsInfo, $checkProduct, $checkShop, checkedAll} = this.state ;
    this.setState({
      $invalidSet: this.state.$invalidSet.add(unit.specID),
      spinVisible: true
    }, () => {
      if(val != 0 ){
        let thisShop = shopsInfo.find(shopA => shopA.purchaserShopID === shop.purchaserShopID);//当前店铺
        $checkProduct.add(`${shop.purchaserShopID}-${product.productID}`);
        let productCount = 0;
        $checkProduct.forEach(productIDCheck => {
          if(productIDCheck.split('-')[0] == shop.purchaserShopID){
            productCount ++;
          }
        });
        if(thisShop.data.length == productCount){
          $checkShop.add(`${shop.purchaserShopID}`);
        }
        if($checkShop.size === shopsInfo.length){
          checkedAll = true
        }
        this.props.changeCartInfo({
          data:{
            list: [
              {
                purchaserShopID: shop.purchaserShopID,
                purchaserShopName: shop.purchaserShopName,
                shopcarts: [
                  {
                    isSelected: 0,
                    productID: product.productID,
                    productSpecID: unit.specID,
                    shopcartNum: val,
                  }
                ]
              }
            ],
            purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID'])
          } ,
          fail: (data)=>{
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(unit.specID),
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(data.response.message);
          },
          success: ()=>{
            shopsInfo.find((thisShop) => {
              return  shop.purchaserShopID == thisShop.purchaserShopID
            }).data.find((productA) => {
              return product.productID == productA.productID
            }).specs.find((spec) => {
              return spec.specID == unit.specID
            }).shopcartNum = val;
            this.setState({
              shopsInfo,
              $checkProduct,
              $checkShop,
              checkedAll,
              $invalidSet: this.state.$invalidSet.delete(unit.specID),
              spinVisible: false
            });
          }
        });
      }else{
        let thisShop = shopsInfo.find(shopA => shopA.purchaserShopID === shop.purchaserShopID);//当前店铺
        let productCount = 0;
        $checkProduct.forEach(productIDCheck => {
          if(productIDCheck.split('-')[0] == shop.purchaserShopID){
            productCount ++;
          }
        });
        if(thisShop.data.length == productCount){
          $checkShop.delete(`${shop.purchaserShopID}`);
        }
        if($checkShop.size === shopsInfo.length){
          checkedAll = true
        }
        $checkProduct.delete(`${shop.purchaserShopID}-${product.productID}`);
        this.props.deleteCartSpec({
          data:{
            list: [
              {
                purchaserShopID: shop.purchaserShopID,
                shopcarts: [
                  {productSpecID: unit.specID}
                ]
              }
            ],
            purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID'])
          } ,
          productInfo: {
            product: product,
            purchaserShopID: shop.purchaserShopID
          },
          fail: (data)=>{
            this.setState({
              $invalidSet: this.state.$invalidSet.delete(unit.specID),
              spinVisible: false
            });
            this.toast && Toast.hide(this.toast);
            this.toast = toastShort(data.response.message || I18n.t('fetchErrorMessage'));
          },
          success: ()=>{
            this.setState({
              shopsInfo,
              $invalidSet: this.state.$invalidSet.delete(unit.specID),
              spinVisible: false
            });
          }
        });
      }

    });

  };
  //清空失效
  clearInvalid = () => {
    this.setState({
      spinVisible: true
    }, ()=>{
      this.props.clearInvalidProduct({
        data: {
          purchaserUserID: this.props.user.getIn(['userInfo', 'purchaserUserID'])
        },
        success: (data)=>{
          let {shopsInfo} = this.state;
          shopsInfo.pop();
          this.setState({
            spinVisible: false,
            shopsInfo
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(I18n.t('clearDone'));
        },
        fail: (data)=>{
          this.setState({
            spinVisible: false
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(data.response.message || I18n.t('fetchErrorMessage'));
        }
      })
    })
  }
  //跳到详情页
  navToProductDetailInfo = (productID) => {
    let newShopsInfo = JSON.parse(JSON.stringify(this.state.shopsInfo));
    this.setState({
      opacity: false,
      shopsInfo: newShopsInfo
    })
    // 将商品ID保存到redux中
    this.props.saveProductID(productID);
    // 跳转到商品详情页
    this.props.navToProductDetailInfo();
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: styleConsts.bgGrey
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  supplierBox: {
    height: 40,
    justifyContent: 'center',
    marginTop: 10,
  },
  supplierName: {
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'flex-start',
  },
  supplier:{
    height: 30,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  itemBox: {
    height: 100,
    flex: 1,
  },
  productImage:{
    width:100,
    height:100,
  },
  rightStyle:{
    flex: 1,
    padding: 10,
  },
  productTit:{
    fontSize: 14,
    height:24,
    lineHeight: 24
  },
  productBrief: {
    fontSize: 14,
    height:20,
    lineHeight: 20,
    color: styleConsts.middleGrey
  },
  separator: {
    width: '100%',
    height: styleConsts.sepLine,
    backgroundColor: styleConsts.bgGrey
  },
  productPriceBox:{
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  subtotalBox:{
    textAlign: 'right'
  },
  subtotal:{
    color: styleConsts.red
  },
  unitInfo: {
    width: 60,
  },
  productNum: {
    margin: 10
  },
  bottomBox: {
    height: 49,
    backgroundColor: styleConsts.white,
  },
  totalBox: {
    width: 110,
    height: 49,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: styleConsts.mainColorOpacity
  },
  bgGrey: {
    backgroundColor: styleConsts.bgGrey
  },
  checkItem:{
    flex: 1,
  },
  swipeItem: {
    backgroundColor: styleConsts.white,
    flex: 1,
  },
  nothing: {
    flex: 1,
    alignItems: 'center'
  },
  nothingImg: {
    marginTop: 80.5,
    marginBottom: 52,
    width: 200,
    height: 200
  },
  kongNote: {
    fontSize: styleConsts.H3,
    color: styleConsts.moreGrey,
    marginBottom: 17.5
  },
  kongTip: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey,
  },
  bottomLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unSelectedIcon: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: styleConsts.headerLine,
    borderRadius: 8
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: styleConsts.mainColor,
    borderWidth: 0
  },
  bgImg: {
    position: 'absolute',
    width: '100%',
    height: '100%'
  },
  groupTxt: {
    fontSize: 13,
    color: styleConsts.deepGrey
  },
  checkItems: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: styleConsts.white
  },
  check:{
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    backgroundColor: 'transparent'
  },
  supplierTxt: {
    fontSize: 13,
    color: styleConsts.moreGrey,
    backgroundColor: 'transparent'
  },
  invalidStyle: {
    width: 60,
    height: 19,
    marginTop: 12,
    alignItems:'center',
    justifyContent: 'center',
    borderRadius: 2.5,
    borderWidth: 1,
    marginRight: 12.5
  },
  redOne: {
    borderColor: styleConsts.lightGrey
  },
  yellowOne: {
    borderColor: styleConsts.lightGrey
  },
  kongButton: {
    borderColor: styleConsts.mainColor,
    borderWidth: 0.5,
    borderRadius: 2.5,
    width: 150,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  kongButtonTxt: {
    color: styleConsts.mainColor,
    fontSize: styleConsts.H3
  },
  clear: {
    width: 50,
    height: 19,
    borderColor: '#ddd',
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    borderRadius: 2.5,
    marginRight: 12.5
  },
  darkButton: {
    backgroundColor: styleConsts.mainColor,
  },
});

const styles1 = StyleSheet.create({
  item: {
    flex: 1,
    flexDirection: 'row',
    paddingTop: 10,
    paddingBottom: 10,
  },
  img: {
    width: 60,
    height: 60,
  },
  rightPart: {
    flex: 1,
    marginLeft: 10,
    // height: 60
  },
  productName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    paddingRight: 12.5
  },
  supplierName: {
    fontSize: styleConsts.H6,
    color: styleConsts.grey,
    marginTop: 4.5,
  },
  specsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceRMB: {
    width: 61,
    marginRight: 10,
    fontSize: styleConsts.H5,
    color: styleConsts.mainColor,
  },
  price: {
    fontSize: styleConsts.H3,
  },
  specsContent: {
    fontSize: styleConsts.H6,
    color: styleConsts.middleGrey,
    width: width < 400 ? 75 : 110
  },
  specsRightPart: {
    width: 21,
    height: 21,
    borderWidth: 1,
    borderColor: styleConsts.lightGrey,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

CartScreen.defaultProps = {

};
CartScreen.PropTypes = {

};

const mapStateToProps = (state) => {
  return {
    cart: state.cart,
    user: state.user,
    tabNav: state.tabNav,
    navReducer: state.nav
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    checkout: (opts)=>{
      dispatch({type: NAV_TO_COMMIT_BILL_SCENE, payload: opts})
    },
    navToInputInfo: (opts)=>{
      dispatch({type: NAV_TO_INPUT_INFO_SCENE, payload: opts})
    },
    login: (opts)=>{
      dispatch({type: NAV_TO_LOGIN_SCENE})
    },
    fetchCartList: (opts)=>{
      dispatch(fetchCartListAC(opts))
    },
    changeCartInfo: (opts)=>{
      dispatch(changeCartInfoForCartPageAC(opts))
    },
    deleteCartProduct: (opts)=>{
      dispatch(deleteCartProductAC(opts))
    },
    deleteCartSpec: (opts)=>{
      dispatch(deleteCartSpecAC(opts))
    },
    clearInvalidProduct: (opts)=>{
      dispatch(clearInvalidProductAC(opts))
    },
    cancelFetch: () => {
      dispatch(cancelFetchCartListAC());
      dispatch({type: CHANGE_CART_INFO_FOR_CART_PAGE_CANCEL});
      dispatch({type: DELETE_CART_PRODUCT_CANCEL});
      dispatch({type: DELETE_CART_SPEC_CANCEL});
      dispatch({type: CLEAR_INVALID_PRODUCT_CANCEL});
    },
    // 将商品ID保存到redux中
    saveProductID: (opts) => {
      dispatch({type: SAVE_PRODUCT_ID,payload: opts})
    },
    // 跳转到商品详情页
    navToProductDetailInfo: (opts) => {
      dispatch({type: NAV_TO_PRODUCT_DETAIL_INFO, payload: opts});
    },
    getGroupInfo: (opts) => {
      dispatch(userGetGroupInfoAll(opts))
    },
    goToSettlement: (opts) => {
      dispatch(goToSettlementAC(opts));
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CartScreen)
