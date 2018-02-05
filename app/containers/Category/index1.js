/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-25T15:34:46+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: index.js
 * @Last modified by:   xf
 * @Last modified time: 2017-09-26T18:05:16+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */
/**
 * 分类
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, Image, TouchableWithoutFeedback, ScrollView, Platform, } from 'react-native';
import Immutable from 'immutable';
import Dimensions from 'Dimensions';
const { width } = Dimensions.get('window');
import { CachedImage } from "react-native-img-cache";
import { styleConsts } from '../../utils/styleSheet/styles';
import HeaderSearchBtn from '../../components/HeaderSearchBtn';
import { NAV_TO_PRODUCT_LIST } from '../../redux/actions/nav.action';
import { getImgUrl } from '../../utils/adapter';

class Category extends Component{
  constructor(props) {
    super(props);
    this.state = {
      firstCategorys: [],          // 服务器获取的一级分类
      categoryData: {              // 重新设置三级分类的结构
        0: [],                     // {key: value}格式,(key:一级分类ID，value:该一级分类下所有二级分类数据,二级分类下包含children是当前二级分类下所有的三级分类)
      },
      categoryID: 0,              // 选中的一级分类
      firstCategoryImg: [],       // 一级分类图片地址([{key: value},...]格式，key: 一级分类ID，value: 对应图片路径)
    };
  }
  componentDidMount() {
    // 从缓存中获取商品分类
    let data = Immutable.Map.isMap(this.props.$user) ?
      this.props.$user.toJS().cache.data : this.props.$user.cache.data;
    this.fetchCategorysFromCache(data);
  }
  render() {
    let { categoryID, categoryData, firstCategoryImg, } = this.state;
    return (
      <View style={styles.container}>
        <HeaderSearchBtn opacity='1' />
        <View style={styles.contentWrapper}>
          {this.renderFirstCategory()}

          <ScrollView ref={component => {this._scrollView = component;}}>
            <View style={styles.rightPart}>
              {/*一级分类对应的图片*/}
              <View style={styles.bannerWrapper}>
                {
                  firstCategoryImg.length ?
                    firstCategoryImg.map(({firCategoryID, firCategoryUri}) => {
                        return <CachedImage
                          key={firCategoryID}
                          style={[styles.bannerImg, firCategoryID !== categoryID && {height: 0, width: 0,}]}
                          source={{ uri: firCategoryUri }}
                        />
                    }) : <Image style={styles.bannerImg} source={require('./imgs/firCateImg.png')} />
                }
              </View>
              {
                categoryData[categoryID].map((secCategory) => {
                  return (
                    <View style={styles.rightBottom} key={`${secCategory.categoryID}`}>
                      {/*二级分类*/}
                      <View style={styles.secondCategory}>
                        <Text style={styles.secondCategoryText}>{secCategory.categoryName}</Text>
                      </View>

                      {/*三级分类*/}
                      <View style={styles.threeCategpryWrapper}>
                        {
                          secCategory.children.map((thrCategory) => {
                            return (
                              <TouchableWithoutFeedback
                                onPress={() => this.props.navToProductList({
                                  categoryID,
                                  categorySubID: secCategory.categoryID,
                                  categoryThreeID: thrCategory.categoryID,
                                })}
                                key={`${thrCategory.categoryID}`}
                              >
                                <View style={styles.threeCategpry}>
                                  {/*三级分类图片和默认图片*/}
                                  <View style={[styles.threeCategoryImg,{ position: 'relative', }]}>
                                    <Image
                                      style={[styles.threeCategoryImg,{ position: 'absolute', }]}
                                      source={require('../../imgs/loadImage.png')}
                                    />
                                    {
                                      thrCategory.imgUrl !== '' ?
                                        <CachedImage
                                          style={[styles.threeCategoryImg,{ position: 'absolute', }]}
                                          source={{ uri: getImgUrl(thrCategory.imgUrl, 66, 66) }}
                                        /> :
                                        <Image
                                          style={[styles.threeCategoryImg,{ position: 'absolute', }]}
                                          source={require('../../imgs/noShopLogo.png')}
                                        />
                                    }
                                  </View>
                                  <Text style={styles.threeCategoryText}>{thrCategory.categoryName}</Text>
                                </View>
                              </TouchableWithoutFeedback>
                            )
                          })
                        }
                      </View>
                    </View>
                  )
                })
              }
            </View>
          </ScrollView>
        </View>
      </View>
    )
  }

  // 一级分类
  renderFirstCategory = () => {
    let { firstCategorys, categoryID, } = this.state;
    return (
      <ScrollView>
        <View style={styles.leftPart}>
          {
            firstCategorys.map((firstCategory) => {
              return (
                <TouchableWithoutFeedback
                  key={`${firstCategory.categoryID}`}
                  onPress={() => this.selectFirstCategory(firstCategory.categoryID)}
                >
                  <View style={[styles.firstCategory,firstCategory.categoryID === categoryID && styles.activeFirstCategoryBg]}>
                    <Text style={[styles.firstCategoryText,firstCategory.categoryID === categoryID && styles.activeFirstCategoryText]}>
                      {firstCategory.categoryName}
                    </Text>
                  </View>
                </TouchableWithoutFeedback>
              )
            })
          }
        </View>
      </ScrollView>
    )
  };

  // 从缓存中获取分类
  fetchCategorysFromCache = (data) => {
    if (data.productCategory && data.productCategory[1] && data.productCategory[1].length !== 0 &&
      data.productCategory[2] && data.productCategory[2].length !== 0 &&
      data.productCategory[3] && data.productCategory[3].length !== 0) {

      let firstCategorys = data.productCategory[1];
      let secondCategorys = data.productCategory[2];
      let threeCategorys = data.productCategory[3];
      let categoryID = firstCategorys[0].categoryID;

      /**
       * 把一级分类图片处理为[{firstID: imgUrl},{firstID1: imgUrl1}, ...]这种结构
       */
      let firstCategoryImg = [];
      firstCategorys.forEach(({categoryID,imgUrl}) => {
        firstCategoryImg.push({
          firCategoryID: categoryID,
          firCategoryUri: getImgUrl(imgUrl,width - 90 - 20,90)
        })
      });

      /**
       * 把三级分类处理为想要的结构
       */
      let categoryData = {};
      firstCategorys.map(({categoryID}) => {
        let newCategorys = [];

        secondCategorys.map((secCategory) => {

          if(secCategory.categoryPID === categoryID) {
            let newSecCategory = secCategory;
            newSecCategory.children = [];

            threeCategorys.map((thrCategory) => {
              if(thrCategory.categoryPID === secCategory.categoryID) {
                newSecCategory.children.push(thrCategory);
              }
            });

            newCategorys.push(newSecCategory);
          }
        });
        categoryData[`${categoryID}`] = newCategorys;
      });

      this.setState({
        firstCategorys,
        categoryID,
        categoryData,
        firstCategoryImg,
      });
    }
  };

  // 选择一级分类
  selectFirstCategory = (categoryID) => {
    // 选中的该一级分类和当前state中的一级分类不一致的话就要滑动到顶部
    if(this.state.categoryID !== categoryID) {

      this.setState({ categoryID }, () => {
        // 设置定时器，以防state改变后，render还未渲染完就开始滑动，此时获取到的位置不确定(异步)
        setTimeout(() => {
          this._scrollView.scrollTo({x: 0, y: 0, animated: true});
        })
      })
    }
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  contentWrapper: {
    flexDirection: 'row',
    paddingBottom: 70,
  },
  leftPart: {
    width: 90,
    backgroundColor: styleConsts.white,
    marginTop: StyleSheet.hairlineWidth,
  },
  firstCategory: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
  },
  activeFirstCategoryBg: {
    backgroundColor: styleConsts.bgGrey,
    borderRightWidth: 0,
  },
  firstCategoryText: {
    fontSize: styleConsts.H4,
    color: styleConsts.deepGrey,
  },
  activeFirstCategoryText: {
    fontSize: styleConsts.H3,
    color: styleConsts.mainColor,
  },
  rightPart: {
    width: width - 90 - 20,
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
  bannerWrapper: {
    width: width - 90 - 20,
    height: 90,
    borderRadius: 10,
  },
  bannerImg: {
    width: width - 90 - 20,
    height: 90,
    borderRadius: 10,
  },
  secondCategory: {
    height: 40,
    justifyContent: 'center',
  },
  secondCategoryText: {
    fontSize: styleConsts.H4,
    color: styleConsts.darkGrey,
  },
  threeCategpryWrapper: {
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 14,
  },
  threeCategpry: {
    width: (width - 90 - 10 - 10 - StyleSheet.hairlineWidth)/3,
    alignItems: 'center',
  },
  threeCategoryImg: {
    width: 66,
    height: 66,
  },
  threeCategoryText: {
    fontSize: styleConsts.H5,
    color: styleConsts.darkGrey,
    marginTop: 10,
    marginBottom: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    $user: state.user,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 三级分类下的商品列表
    navToProductList: (opts) => {
      dispatch({type: NAV_TO_PRODUCT_LIST, payload: opts,})
    },
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(Category)
