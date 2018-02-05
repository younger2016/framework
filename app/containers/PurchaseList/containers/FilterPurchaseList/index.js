/**
 * 筛选采购清单
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, ScrollView, PanResponder,Platform} from 'react-native';
import { styleConsts } from '../../../../utils/styleSheet/styles';
import Dimensions from 'Dimensions';
const { width,height } = Dimensions.get('window');
import Immutable from 'immutable';
import { toastShort } from '../../../../components/toastShort';
import Toast from 'react-native-root-toast';
// import {
//   fetchMallClassificationAC,
//   fetchSuppliyerMallClassificationAC,
//   TRIGGER_UPDATE_PRODUCT_LIST,
// } from '../../../../redux/actions/product.action'
class FilterPurchaseList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      secondCategory: [],       // 服务器返回的二级分类
      categoryData: [],         // 把二三级分类拼接成想要的结构
      selectSupplier: '',       // 选中的供应商
      // selectThrCategoryID: '',  // 选中的三级分类ID
      selectCategoryID: new Set(),  // 选中的分类ID
      productStatus:0,//选中的商品上下架:4,5
    };
  }
  componentDidMount() {
    // 获取商城分类数据
    // this.props.fetchMallClassification({
    //   data: {
    //     groupID:this.props.groupID,
    //   },
    //   fail: (res) => {
    //     this.toast && Toast.hide(this.toast);
    //     this.toast = toastShort(res && res.response && res.response.message || '诶呀，服务器开小差了');
    //   },
    //   timeout: () => {
    //     this.toast && Toast.hide(this.toast);
    //     this.toast = toastShort('诶呀，服务器开小差了');
    //   },
    //   success:(res)=>{
    //     console.log(res.data)
    //     this.fetchCategorys(res.data,2)
    //   }
    // });
  }

  componentWillMount(){
    this._panResponder = PanResponder.create({
      // onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
      onMoveShouldSetPanResponder:this.onMoveShouldSetResponder,
      // onPanResponderRelease:this.onPanResponderRelease
    })

    this._panViewResponder=PanResponder.create({
      onMoveShouldSetPanResponderCapture:this.onMoveShouldSetPanResponderCapture
    })
  }


  onMoveShouldSetPanResponderCapture=(evt,gestureState)=>{
    console.log('捕获到了',gestureState);
    if(Platform.OS=='android'){
      if(gestureState.dx>0)
        return true;
      else
        return false
    }else
      return false
  }


  onMoveShouldSetResponder=(evt,gestureState)=>{
    if(gestureState.dx>0.5||gestureState.dx==0){//加入等于0是因为点击按钮，会触发滚动为响应者，则不会触发点击事件，所以让滚动不为响应者
      console.log('son-false')
      return false
    }else{
      console.log('son-true')
      return true
    }
  }

  onResponderTerminationRequest=(evt,gestureState)=>{
    console.log('onResponderTerminationRequest',evt.nativeEvent);
    return true
  }

  componentWillReceiveProps(nextProps) {

  }

  render() {
    let { categoryData, selectCategoryID,productStatus } = this.state;
    return (
      <View style={styles.container}
            {...this._panViewResponder.panHandlers}
      >
        <ScrollView
          ref="scrollView"
          {...this._panResponder.panHandlers}
        >
          <View style={styles.topPart}>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>商品状态</Text>
              <View style={styles.buttonWrapper}>
                {/*<Text style={styles.button}>展开</Text>*/}
              </View>
            </View>
            <View style={styles.suppliers}>
              <TouchableWithoutFeedback onPress={()=>this.selectShelf(4)}>
                <View style={[styles.supplier,productStatus==4&&styles.border]}>
                  <Text style={[styles.txt,productStatus==4&&styles.activeTxt]} numberOfLines={1}>已上架</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={()=>this.selectShelf(5)}>
                <View style={[styles.supplier,productStatus==5&&styles.border]}>
                  <Text style={[styles.txt,productStatus==5&&styles.activeTxt]} numberOfLines={1}>已下架</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View style={{paddingBottom: 49,}}>
            {
              categoryData.map((secCategory) => {
                return (
                  <View key={secCategory.extCategoryID}>
                    {/*二级分类、展示或收起按钮*/}
                    <View style={[styles.titleWrapper,{ marginTop: 5, }]}>
                      <Text style={styles.title}>{secCategory.categoryName}</Text>
                      {
                        secCategory.children && secCategory.children.length <= 3 ?
                          <View /> :
                          <TouchableWithoutFeedback onPress={() => this.switchButton(secCategory)}>
                            <View style={styles.buttonWrapper}>
                              <Text style={styles.button}>
                                {
                                  !this.state[`${secCategory.extCategoryID}visible`] ? '展开' : '收起'
                                }
                              </Text>
                            </View>
                          </TouchableWithoutFeedback>
                      }
                    </View>
                    <View style={styles.suppliers}>
                      {/*默认显示每个三级分类的前三个*/}
                      {
                        secCategory.children && secCategory.children.map((threeCategory,index) => {
                          let visible=this.state[`${secCategory.extCategoryID}visible`]
                          if(index>2&&!visible){
                            return null
                          }else {
                            return (
                              <TouchableWithoutFeedback
                                key={threeCategory.extCategoryID}
                                onPress={() => this.selectCategory(threeCategory.extCategoryID)}
                              >
                                <View style={[styles.supplier, {width: (width - 40 - 20*4)/3},selectCategoryID.has(threeCategory.extCategoryID) && styles.border]}>
                                  {
                                      <Text style={[styles.txt,selectCategoryID.has(threeCategory.extCategoryID) && styles.activeTxt]} numberOfLines={1}>{threeCategory.categoryName}</Text>
                                  }
                                </View>
                              </TouchableWithoutFeedback>
                            )
                          }

                        })
                      }
                    </View>
                  </View>
                )
              })
            }
          </View>
        </ScrollView>
        <View style={styles.footer}>
          <TouchableWithoutFeedback
            onPress={() => this.reset()}
          >
          <View style={styles.footerBtnWrapper}>
            <Text style={styles.btnTxt}>重置</Text>
          </View>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback
            onPress={() => this.confirm()}
          >
          <View style={[styles.footerBtnWrapper,{backgroundColor: styleConsts.mainColor}]}>
            <Text style={[styles.btnTxt,{color: styleConsts.white}]}>确认</Text>
          </View>
          </TouchableWithoutFeedback>
        </View>
      </View>

    )
  }

  // 获取分类
  fetchCategorys = (data,startLevel) => {
    if(startLevel>3){
      return
    }
    if (data && data[1] && data[1].length !== 0 &&
      data[2] && data[2].length !== 0 &&
      data[3] && data[3].length !== 0) {


      let secondCategorys = data[startLevel];
      let threeCategorys = data[startLevel+1];

      let newCategorys = [];
      secondCategorys.map( (secCategory) => {
        secCategory.children = [];
        threeCategorys.map( (threeCategory) => {
          if(secCategory.id === threeCategory.shopCategoryPID) {
            secCategory.children.push(threeCategory);
          }
        });
        newCategorys.push(secCategory);
      } );

      this.setState({
        categoryData: newCategorys,
      })

    }
  };

  // 显示'展开'，还是'收起'
  switchButton = (secCategory) => {
    this.setState({
      [`${secCategory.extCategoryID}visible`]: !this.state[`${secCategory.extCategoryID}visible`],
    })
  };

  // 选中的供应商

  // 选中的三级分类
  selectCategory = (thrCategoryID) => {
    console.log('selectCategory',thrCategoryID)

    if(this.state.selectCategoryID.has(thrCategoryID)){
      this.state.selectCategoryID.delete(thrCategoryID)
    }else
      this.state.selectCategoryID.add(thrCategoryID)

    this.setState({
      selectCategoryID: this.state.selectCategoryID,
    });
  }

  selectShelf=(shelfIndex)=>{
    this.setState({
      productStatus:shelfIndex,
    });
  }


  confirm=()=>{
      //传入侧滑栏传递的隐藏函数
      let slideProps=this.props.slideProps;
      let hideSlide=slideProps&&slideProps.hideSlide;
      hideSlide&&hideSlide()

      const {selectCategoryID,productStatus}=this.state;

      let param={}

      /*选中了商品分类，才传categoryThreeIds参数*/
      if(Array.from(selectCategoryID).length>0)
        param.categoryThreeIds=Array.from(selectCategoryID).join(',')
      /*选中了商品状态，才传productStatus参数*/
      if(productStatus>0){
        param.productStatus=productStatus
      }
      // this.props.triggerFetchProduct({...param})


  }

  reset=()=>{
    this.setState({
      selectCategoryID:new Set(),
      productStatus:0
    })
  }

}
const styles = StyleSheet.create({
  container: {
    // flex: 1,
    width: width - 40,
    // backgroundColor: styleConsts.white,
    backgroundColor:'red',
    paddingTop: 20,
    height:height
  },
  topPart: {
    width: width - 40,
    paddingBottom: 5,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  titleWrapper: {
    height: 44,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    marginRight: 20,
    flexDirection: 'row',
  },
  title: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  buttonWrapper: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  button: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey,
  },
  suppliers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 10,
    marginRight: 10,
  },
  supplier: {
    width: (width - 40 - 20*3)/2,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: styleConsts.lightGrey,
    borderRadius: 3,
    marginBottom: 10,
    padding: 2,
    marginLeft: 10,
    marginRight: 10,
  },
  border: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.mainColor,
    backgroundColor: styleConsts.white,
  },
  txt: {
    fontSize: styleConsts.H4,
    color: styleConsts.darkGrey,
  },
  activeTxt: {
    color: styleConsts.mainColor,
  },
  footer: {
    width: width - 40,
    height: 49,
    position: 'absolute',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
  },
  footerBtnWrapper: {
    width: '50%',
    height: 49,
    backgroundColor: styleConsts.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTxt: {
    fontSize: styleConsts.H2,
    color: styleConsts.grey,
  },
});
const mapStateToProps = (state) => {
  return {
    groupID: state.user.getIn(['userInfo','user','groupID']),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 获取供应商下的商城分类
    fetchMallClassification: (opts) => {
      dispatch(fetchSuppliyerMallClassificationAC(opts));
    },
    // // 商品搜索
    // fetchProductList: (opts) => {
    //   dispatch(fetchProductListAC(opts));
    // },
    triggerFetchProduct: (opts) => {
        dispatch({type:TRIGGER_UPDATE_PRODUCT_LIST,payload:opts});
      },
  }
};
FilterPurchaseList.defaultProps={
}
export default connect(mapStateToProps,mapDispatchToProps)(FilterPurchaseList)