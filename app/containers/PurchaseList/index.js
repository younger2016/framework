/**
 * 采购清单
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, StyleSheet, View, Text, Image, TextInput, TouchableWithoutFeedback, TouchableHighlight, Keyboard } from 'react-native';
import { toastShort } from '../../components/toastShort';
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import HeaderWithShopInfo from '../../components/HeaderWithShopInfo';
import ChangePrice from '../../components/ChangePrice';
import { styleConsts } from '../../utils/styleSheet/styles';
import { getImgUrl } from '../../utils/adapter';
import BlankPage from '../../components/BlankPage';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import I18n from 'react-native-i18n';
import CheckBox from 'react-native-check-box'
import { PullFlatList } from '../../components/PullList';

import {
  fetchPurchaseListAC,
  deleteMorePurchaseAC,
} from '../../redux/actions/products.action';
import {
  fetchCartListAC,
  changeCartInfoAC,
} from '../../redux/actions/cart.action';
import {
  SAVE_PRODUCT_ID,
} from '../../redux/actions/products.action';
import {
  NAV_TO_PRODUCT_DETAIL_INFO,
} from '../../redux/actions/nav.action';
import KeyboardView from 'react-native-keyboard-view';


class PurchaseList extends Component{
  constructor(props){
    super(props);
    this.state = {
      purchaseList: [],       // 采购清单列表
      purchaserShopID: '',    // 采购商店铺ID
      purchaserShopName: '',  // 采购商店铺名称
      specsObj: {},           // 服务器获取的购物车规格ID和规格数量的键值对对象
      totalPrice: 0,          // 总价
      refreshing: false,      // 下拉刷新
      visible: false,         // 加载是否显示
      isLoading: false,       // 是否加载过
      loadingSuccess: false,  // 是否加载成功
      moreLoading: true,      // 加载更多
      editable: false,        // 是否处于编辑状态
      selectProduct: new Set(),// 选中的商品
    };
    this.inputNum = `inputNum-0`;
    this.refsAll = [];
    this._flatList='';
  }
  componentDidMount(){
    // 请求采购清单的数据
    this.setState({
        visible: true,
    },() => {
      this.fetchPurchaseList();
    });
    if (Platform.OS === 'ios') {
      this.keyboardWillShowEvent = Keyboard.addListener('keyboardWillShow', (f) => {
        this.keyFrame = f;
        this.keyboardWillShowEvent && this.keyboardWillShowEvent.remove()
      })
    } else if (Platform.OS === 'android' && this.props.enableOnAndroid) {
      this.keyboardWillShowEvent = Keyboard.addListener('keyboardDidShow',(f) => {
        this.keyFrame = f;
        this.keyboardWillShowEvent && this.keyboardWillShowEvent.remove()
      })
    }
  }

  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.$products.get('purchaseList'),nextProps.$products.get('purchaseList'))) {
      let purchaseList = Immutable.Map.isMap(nextProps.$products) ?
        nextProps.$products.toJS().purchaseList : nextProps.$products.purchaseList;
      if('success' === purchaseList.status) {
        let list = purchaseList.list;
        // 给每个商品的每个规格添加字段focusFLag，标识是否是获得焦点
        list.forEach( (item) => {
          item.list.forEach( (specItem) => {
            specItem.focusFLag = false;
          });
        });

        let { selectProduct } = this.state;
        selectProduct.clear();    // 删除成功后要清空本地选中的商品selectProduct

        this.setState({
          purchaseList: list,
          refreshing: false,
          visible: false,
          isLoading: true,
          loadingSuccess: true,
          moreLoading: false,
          selectProduct,
        });
      }
    }

  }

  render(){
    let { specsObj, totalPrice, refreshing, moreLoading, editable, selectProduct } = this.state;
    let purchaseList = JSON.parse(JSON.stringify(this.state.purchaseList));
    // 计算总计
    for(let key in specsObj) {
      totalPrice += specsObj[key].num * specsObj[key].price;
    }

    return (
      <View style={styles.wrapper}>
        <HeaderWithShopInfo
          navigation={this.props.navigation}
          onChange={(obj) => this.handleShopChange(obj)}
          flag='purchaseList'
          rightText={!editable ? I18n.t('edit'): I18n.t('cancel')}
          cancelCallBack={editable ? this.editCancel : this.editPurchaseList}
        />

        <View style={styles.contentWrapper}>
          <PullFlatList
            ref={(flatList) => this._flatList = flatList}
            progressViewOffset={60}
            extraScrollHeight={40}
            legacyImplementation={false}
            data={purchaseList}
            refreshing={refreshing}
            onRefresh={(resove) => this.updatePurchaseList(resove)}
            renderItem={({item,index}) => this.renderItem(item,index)}
            ListFooterComponent={() => this.listFooter(purchaseList.length)}
            ListEmptyComponent={() => this.renderNothing()}
            keyExtractor={({ productID }) => productID}
            enableOnAndroid = {true}
            canLoadMore={moreLoading}
            onTouchStart={() => KeyboardView.dismiss()}
          />
        </View>

        {/*合计*/}
        {
          !editable && purchaseList.length !== 0 ?
            <View style={styles.footer}>
              <View style={styles.footerLeftPart}>
                <Text style={styles.total}>合计：</Text>
                <ChangePrice price={totalPrice} big={styleConsts.H1} middle={styleConsts.H2} small={styleConsts.H4} width={150}/>
              </View>
              {/*查看进货单*/}
              <TouchableWithoutFeedback onPress={() => totalPrice !== 0 ? this.addToCart() : {}}>
                <View style={[styles.footerRightPart, totalPrice !== 0 ? {} : { backgroundColor: styleConsts.mainColorOpacity }]}>
                  <Text style={styles.footBtnTxt}>加入进货单</Text>
                </View>
              </TouchableWithoutFeedback>
            </View> : null
        }

        {/*全选*/}
        {
          editable && purchaseList.length !== 0 ?
            <View style={styles.footer}>
              <View style={styles.footerLeftPart}>
                <CheckBox
                  onClick={() => this.checkAll()}
                  isChecked={selectProduct.size === purchaseList.length}
                  unCheckedImage={<View style={styles.unSelected}/>}
                  checkedImage={
                    <View style={[styles.unSelected, styles.center]}>
                      <Image style={{width: 10, height: 8}} source={require('../Cart/imgs/check.png')}/>
                    </View>
                  }
                />
                <Text style={[styles.total,{ marginLeft: 10, }]}>全选</Text>
              </View>
              <TouchableWithoutFeedback onPress={() => selectProduct.size !== 0 ? this.deleteProduct() : {}}>
                <View style={[styles.footerRightPart, selectProduct.size !== 0 ? {} : { backgroundColor: styleConsts.mainColorOpacity }]}>
                  <Text style={styles.footBtnTxt}>删除</Text>
                </View>
              </TouchableWithoutFeedback>
            </View> : null
        }

        <KeyboardView
          renderCoverView={() => <View pointerEvents="none"
                                       style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0)' }}/>}
          renderStickyView={this._renderStickyView}
        >
        </KeyboardView>
      </View>
    )
  }
  _renderStickyView = () => {
    if(Platform.OS !== 'ios') {return}
    let {purchaseList} = this.state;
    let totalNum = 0;
    for(let i = 0;i<purchaseList.length; i++){
      totalNum += purchaseList[i].list.length
    }
    return (
      <View style={{flexDirection: 'row', width, height: 40, backgroundColor: '#f0f1f2',justifyContent: 'space-between', alignItems: 'center'}}>
        <TouchableWithoutFeedback
          onPress={() => {
            let rightNow = this.inputNum.split('-');
            let num = rightNow[rightNow.length - 1] - 0;
            if(num && num > 0 ){
              this.refsAll[`inputNum-${num - 1}`].focus();
              if(this._flatList._foutS.position.y > 0){
                this._flatList._foutS.scrollToPosition(0,this._flatList._foutS.position.y - 100 < 0 ? 0 : this._flatList._foutS.position.y - 100 , true)
              }
            }
          }}
          underlayColor="#ccc"
        >
          <View style={{height: 40, paddingRight: 25, paddingLeft: 25, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: styleConsts.darkGrey, fontSize: styleConsts.H4}}>
              上一个
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => {
            let rightNow = this.inputNum.split('-');
            let num = rightNow[rightNow.length - 1] - 0;
            if((num || 0 === num) && num + 1 < totalNum ){
              this.refsAll[`inputNum-${num + 1}`].focus()
            }
            this._flatList._foutS.updateKeyboardSpace(this.keyFrame);

          }}
          underlayColor="#ccc"
        >
          <View style={{height: 40, paddingRight: 25, paddingLeft: 25,alignItems: 'center', justifyContent: 'center'}}>
            <Text  style={{color: styleConsts.mainColor, fontSize: styleConsts.H4}}>
              下一个
            </Text>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  };

  // 渲染列表每一项
  renderItem = (item,index) => {
    let {  purchaseList, selectProduct, editable } = this.state;

    return (
      <View style={styles.itemWrapper}>
        {
          editable ?
            <CheckBox
              onClick={() => this.selectProduct(item)}
              isChecked={selectProduct.has(`${item.productID}`) || selectProduct.size === purchaseList.length}
              unCheckedImage={<View style={styles.unSelected}/>}
              checkedImage={
                <View style={[styles.unSelected, styles.center]}>
                  <Image style={{width: 10, height: 8}} source={require('../Cart/imgs/check.png')}/>
                </View>
              }
            /> : null
        }
      <TouchableHighlight activeOpacity={1} underlayColor='#f6f6f6' onPress={() => this.navToProductDetailInfo(item.productID)}>
        <View
          style={[
            styles.item,
            { width: editable ? width - 20 - 16 - StyleSheet.hairlineWidth * 2 : width - 20 - StyleSheet.hairlineWidth * 2 },
            index === purchaseList.length - 1 ? {borderBottomWidth: 0,} : null,
          ]}
          key={item.productID}
        >
          <Image style={styles.productImg} source={{ uri: getImgUrl(item.imgUrl, 60, 60) }} />
          <View style={styles.rightPart}>
            <Text style={styles.productName}>{item.productName}</Text>
            <View style={styles.shopNameWrapper}>
              <Text style={styles.shopName}>{item.supplyShopName}</Text>
            </View>
            <View style={styles.specsList}>
              {
                item.list instanceof Array ?
                  item.list.map( (spec,specIndex) => {
                    return this.renderSpecs(spec,specIndex,index,item.productID)
                  }) : null
              }
            </View>
          </View>
        </View>
      </TouchableHighlight>
      </View>
    )
  };

  // 渲染列表每一项的商品规格列表
  renderSpecs = (spec,specIndex,index,productID) => {
    let { specsObj, purchaseList } = this.state;
    let refIndex = 0;
    if(index > 0){
      for(let i = index - 1; i >= 0; i--){
        if(purchaseList[i]){
          refIndex += purchaseList[i].list.length
        }
      }
    }
    refIndex += specIndex;

    return (
      <View style={styles.specsItem} key={spec.productSpecID}>
        <View>
          <ChangePrice price={spec.productPrice} suffix={spec.saleUnitName} big={styleConsts.H3} small={styleConsts.H5} />
          {
            !!spec.specContent&&<Text style={styles.specTxt}>{spec.specContent}/{spec.saleUnitName}</Text>
          }
        </View>
        <TextInput
          style={[styles.input, spec.focusFLag ? {color: styleConsts.deepGrey,borderColor: styleConsts.grey} : {}]}
          keyboardType='numeric'
          underlineColorAndroid="transparent"
          maxLength={5}
          value={`${specsObj[spec.productSpecID] ? specsObj[spec.productSpecID].num : 0}`}
          onChangeText={ (val) => this.handleChangeIngput(val,spec.productSpecID,spec.productPrice,productID) }
          onFocus={() => {
            this.inputNum = `inputNum-${refIndex}`;
            purchaseList[index].list[specIndex].focusFLag = true;
            this.setState({ purchaseList });
          }}
          onBlur={() => {
            purchaseList[index].list[specIndex].focusFLag = false;
            this.setState({ purchaseList });
          }}
          ref={(ref) => this.refsAll[`inputNum-${refIndex}`]=ref}
        />
      </View>
    )
  };

  // 门店改变
  handleShopChange = (obj) => {
    this.setState({
      purchaserShopID: obj.selectShop.shopID,
      purchaserShopName: obj.selectShop.shopName,
    });
  };

  // 处理商品规格数量改变
  handleChangeIngput = (val,specID,productPrice,productID) => {
    let { specsObj } = this.state;
    specsObj[specID] = {
      num: val !== '0' && val !== '' ? val*1 : 0,
      price: productPrice,
      productID: productID,
    };
    this.setState({ specsObj });
  };

  // 请求采购清单列表
  fetchPurchaseList = (resove) => {
    return (
      this.props.fetchPurchaseList({
        data: {
          purchaserID: this.props.$user.toJS().userInfo.purchaserID,
        },
        success: () => {
          if(resove instanceof Function){
            resove('success')
          }
        },
        fail: (res) => {
          this.setState({
            refreshing: false,
            visible: false,
            isLoading: true,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
          if(resove instanceof Function){
            resove('fail')
          }
        },
        timeout: () => {
          this.setState({
            refreshing: false,
            visible: false,
            isLoading: true,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
          if(resove instanceof Function){
            resove('timeout')
          }
        }
      })
    )
  };

  // 下拉刷新
  updatePurchaseList = (resove) => {
    this.setState({
      refreshing: true,
    },() => {
      this.fetchPurchaseList(resove);
    });
  };

  // 加入进货单
  addToCart = () => {
    let { purchaserShopID, purchaserShopName, specsObj } = this.state;

    // 如果没有正常营业的门店不能加入购物车
    if(purchaserShopName === '' && purchaserShopID === '') {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort('暂无可用门店哦');
      return;
    }

    let shopcarts = [];
    for ( let key in specsObj ) {
      shopcarts.push({
        isSelected: 0,
        productID: specsObj[key].productID,
        productSpecID: key,
        shopcartNum: specsObj[key].num,
      })
    }

    this.props.changeCartInfo({
      data: {
        list: [
          {
            purchaserShopID: purchaserShopID,
            purchaserShopName: purchaserShopName,
            shopcarts: shopcarts,
          }
        ],
        purchaserUserID: this.props.$user.getIn(['userInfo', 'purchaserUserID']),
      },
      success: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.message || '添加成功');
        for (let key in specsObj) {
          specsObj[key].num = 0;
        }
        this.setState({ specsObj });
      },
      fail: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
      },
      timeout: () => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort('诶呀，服务器开小差了');
      }
    })

  };

  // 显示加载、没有更多
  listFooter = (len) => {
    if(len === 0){
      return (
        <View />
      );
    }
    // 允许加载更多
    if(this.state.moreLoading){
      return(
        <View style={{height: 60, width, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    // 没有更多
    let nowHeight = this.updateHeight();
    let cHeight =  nowHeight - (height - styleConsts.headerHeight);
    return (
      <View style={{height: 90, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: cHeight >= 0 ? -90 :  cHeight-45}}>
        <Text style={{fontSize: styleConsts.H4, color: styleConsts.middleGrey}}>{I18n.t('noMoreData')}</Text>
      </View>
    )
  };
  // 动态获取位置,定位没有更多的显示位置
  updateHeight = () => {
    return this.state.purchaseList.reduce((pre,now) => {
      let height = 82;
      if(now.list.length > 1){
        height += (now.list.length-1) * 45
      }
      return pre + height;
    },0)
  };

  // 没有数据时显示空白页
  renderNothing = () => {
    let { isLoading, loadingSuccess } = this.state;
    return (
      <BlankPage
        visable={true}
        type={!isLoading ? 'loading' : loadingSuccess ? 'blank' : 'error'}
        loadAgain={() => {
          this.setState({
            visible: true,
          },() => {
            this.fetchPurchaseList()
          })
        }}
      >
        {
          loadingSuccess ?
            <View style={styles.content}>
              <Text style={styles.firstTxt}>喔唷, 居然是「 空 」的</Text>
            </View> : <Text>''</Text>
        }
      </BlankPage>
    );
  };

  // 跳转到商品详情
  navToProductDetailInfo = (productID) => {
    // 先将商品ID保存到redux中，再跳转
    this.props.saveProductID(productID);
    this.props.navToProductDetailInfo();
  };

  // 编辑
  editPurchaseList = () => {
    this.setState({
      editable: true,
    })
  };

  // 取消
  editCancel = () => {
    let { selectProduct } = this.state;
    selectProduct.clear();
    this.setState({
      editable: false,
      selectProduct,
    })
  };

  // 选择商品
  selectProduct = (item) => {
    let { selectProduct } = this.state;

    if(selectProduct.has(`${item.productID}`)) {
      selectProduct.delete(`${item.productID}`);
    } else {
      selectProduct.add(`${item.productID}`);
    }
    this.setState({ selectProduct });
  };

  // 全选
  checkAll = () => {
    let { selectProduct, purchaseList } = this.state;

    if(selectProduct.size !== purchaseList.length) {
      purchaseList.forEach(item => {
        selectProduct.add(`${item.productID}`);
      });
    } else {
      selectProduct.clear();
    }
    this.setState({ selectProduct })
  };

  // 删除采购清单中商品
  deleteProduct = () => {
    let { selectProduct, purchaseList } = this.state;
    let list = [];  // 传的参数

    Array.from(selectProduct).map(selectProduct => {
      purchaseList.map( item => {
        if(item.productID == selectProduct) {
          item.list.map((spec) => {
            list.push({
              productID: selectProduct,
              productSpecID: spec.productSpecID,
            });
          });
        }
      });
    });
    this.props.deleteMorePurchase({
      data: {
        purchaserID: this.props.$user.toJS().userInfo.purchaserID,
        list,
      },
      deleteProduct: selectProduct,
      success: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.message || '删除成功');
      },
      fail: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.response && res.response.message || '删除失败');
      },
      timeout: (res) => {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
      }
    })
  }

}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
    position: 'relative',
  },
  contentWrapper: {
    flex: 1,
  },
  itemWrapper: {
    flexDirection: 'row',
    backgroundColor: styleConsts.white,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    alignItems: 'center',
  },
  item: {
    paddingLeft: 10,
    flexDirection: 'row',
  },
  productImg: {
    width: 60,
    height: 60,
    marginTop: 10,
  },
  rightPart: {
    flex: 1,
    marginLeft: 10,
    paddingTop: 10,
    paddingBottom: 8,
  },
  productName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  shopNameWrapper: {
    marginTop: 5,
  },
  shopName: {
    fontSize: styleConsts.H6,
    color: styleConsts.grey,
  },
  specsItem: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  specTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.middleGrey,
  },
  input: {
    width: 50,
    height: 23,
    padding: 0,
    fontSize: styleConsts.H4,
    color: styleConsts.darkGrey,
    textAlign: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.headerLine,
  },
  footer: {
    height: 50,
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  footerLeftPart: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  footerRightPart: {
    width: 110,
    backgroundColor: styleConsts.mainColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footBtnTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  nothing: {
    width: 200,
    height: 200,
    marginTop: 80.5,
  },
  firstTxt: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey,
    marginTop: 12,
    marginBottom: 17.5,
  },
  unSelected: {
    width: 16,
    height: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.middleGrey,
    borderRadius: 8,
  },
  center: {
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: styleConsts.mainColor,
    borderColor: styleConsts.mainColor,
  },
});
const mapStateToProps = (state) => {
  return {
    $products: state.products,
    $user: state.user,
    $cart: state.cart,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 获取采购清单列表数据
    fetchPurchaseList: (opts) => {
      dispatch(fetchPurchaseListAC(opts));
    },
    // 购物车商品列表
    fetchCartList: (opts)=>{
      dispatch(fetchCartListAC(opts))
    },
    // 加入购物车
    changeCartInfo: (opts)=>{
      dispatch(changeCartInfoAC(opts));
    },
    // 将商品ID保存到redux中
    saveProductID: (opts) => {
      dispatch({type: SAVE_PRODUCT_ID,payload: opts})
    },
    // 跳转到商品详情页
    navToProductDetailInfo: (opts) => {
      dispatch({type: NAV_TO_PRODUCT_DETAIL_INFO, payload: opts});
    },
    // 删除采购清单中商品
    deleteMorePurchase: (opts) => {
      dispatch(deleteMorePurchaseAC(opts));
    },
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(PurchaseList)