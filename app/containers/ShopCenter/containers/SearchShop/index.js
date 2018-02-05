/**
 * 搜索店铺结果页
 */

import React,{ PropTypes } from 'react'
import { ScrollView, View, Text, StyleSheet, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux'
import { styleConsts } from '../../../../utils/styleSheet/styles'
import I18n from 'react-native-i18n';
import SearchBtn from '../../../../components/SearchBtn'
import Dimensions from 'Dimensions';
import { TouchableWithoutFeedbackD } from '../../../../components/touchBtn'
import {NAV_TO_SHOPCENTER_MAIN_PAGE} from '../../../../redux/actions/nav.action'
import {searchShopList, SET_MAININFO_TO_GET_SHOP_INFO, searchShopListCancel} from '../../../../redux/actions/shopCenter.action'
import BlankPage from '../../../../components/BlankPage'
import { is } from 'immutable'
import { CachedImage } from "react-native-img-cache";
import { getImgUrl } from '../../../../utils/adapter';
import { PullFlatList } from '../../../../components/PullList';

const loadImage = require('../../../../imgs/noShopLogo.png');
const {width, height} = Dimensions.get('window');
const moreShowPro = (height - styleConsts.headerHeight) / 95.5;

class SearchShop extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: true,
      keyWord: '',
      loading: false,
      loadMore: false, // 是否允许加载更多
      loadingSuccess: false,
      showBlank: false,
      shops:[],
      hasLoad: false,
    }
  }
  componentDidMount() {
    this.callback = this.props.navigation.state.params ? this.props.navigation.state.params.backCall : () => {};
    this.setState({
      keyWord: this.props.navigation.state.params ? this.props.navigation.state.params.keyWord : '',
    });
    // 请求门店列表
    this.searchShops(1, this.props.navigation.state.params ? this.props.navigation.state.params.keyWord : '')
  }
  componentWillReceiveProps(nextProps) {
    if(!(is(nextProps.$searchData.get('list'), this.props.$searchData.get('list')))){
      this.setState({
          shops: nextProps.$searchData.get('list').toJS()
      })
    }
  }
  componentWillUnmount() {
    this.props.rest()
  }
  render() {
    return (
      <View style={styles.container}>
        <SearchBtn
          title={this.state.keyWord}
          navigation={this.props.navigation}
          onPressCenter={() => {this.callback() ; this.props.navigation.goBack()}}
        />
        <View style={{flex: 1}}>
          {
            this.state.hasLoad &&
              <PullFlatList
               legacyImplementation={false}
               data={this.state.shops}
               renderItem={({ item, index }) => this.renderShopList(item, index)}
               refreshing={this.state.loading}
               onRefresh={(resove) => this.searchShops(1,null,resove)}
               onEndReachedThreshold={0}
               onEndReached={(resove) => this.state.loadMore && this.searchShops(null,null,resove)}
               keyExtractor={({ supplyShopID }) => supplyShopID}
               ListEmptyComponent={() => this.ListEmptyComponent()}
               ListFooterComponent={() => this.listFooter(this.state.shops.length)}
               canLoadMore={this.state.loadMore}
             />
          }
        </View>

        {/*加载*/}
        <View style={{
          flex: 1,
          width: this.state.visible ? '100%': 0,
          height: this.state.visible? height: 0,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          paddingTop: 60
        }}>
          <BlankPage
            visable={this.state.visible}
            type={'loading'}
          />
        </View>
      </View>
    )
  }

  // 店铺列表
  renderShopList = (item) => {
    return (
      <View style={styles.swipeout}>
        <TouchableWithoutFeedbackD delayTime={300} onPress={() => this.props.goToShopCenter(item)}>
          <View style={styles.shopList}>
            <View style={[styles.shopLogo,{ position: 'relative'}]}>
              {
                item.logoUrl !== '' ?
                  <CachedImage
                    style={[styles.shopLogo,{position: 'absolute'}]}
                    source={{uri: getImgUrl(item.logoUrl)}}
                  /> :
                  <Image style={[styles.shopLogo,{position: 'absolute'}]} source={loadImage} />
              }
            </View>
            <View style={{height: 80, width: StyleSheet.hairlineWidth, backgroundColor: styleConsts.bgSeparate}}/>
            <View style={styles.rightTxt}>
              <Text style={styles.shopName} numberOfLines={1}>{item.shopName}</Text>
              <Text style={styles.address} numberOfLines={2}>{I18n.t('mainSell')}: {item.category}</Text>
            </View>
          </View>
        </TouchableWithoutFeedbackD>
      </View>
    )
  };

  // 空白页/错误页
  ListEmptyComponent = () => {
    return (
      <BlankPage visable={this.state.shops.length < 1 && this.state.showBlank} type={this.state.loadingSuccess ? 'blank' : 'error'} loadAgain={() => this.setState({visible:true}, () => this.searchShops(1))}>
         <View style={{alignItems: 'center'}}>
           <Text style={styles.noShopS}>
             {I18n.t('noShopsAboutIt')}
           </Text>
         </View>
      </BlankPage>
    )
  };
  
  listFooter = (len) => {
    if(len === 0){
      return <View/>
    }
    if(this.state.loadMore){ // 允许加载更多
      return(
        <View style={{height: 60, width, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    return (
      <View style={{height: 90, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: len >= moreShowPro ? -90 :  -40 -(moreShowPro - len/2) * 95.5}}>
        <Text style={{fontSize: styleConsts.h3, color: styleConsts.middleGrey}}>{
            I18n.t('noMoreData')
        }</Text>
      </View>
    )
  };

  // 请求门店列表
  searchShops = (page, keyWord, resove) => {
    let pageNo = page || this.state.shops.length / 20 + 1;
    if('pending' === this.props.$searchData.get('status')){
      return ;
    }
    (page === 1 && !this.state.visible) && this.setState({loading: true})
    this.props.searchShop({
      data: {
        pageNo,
        pageSize: 20,
        searchParam: keyWord || this.state.keyWord,
      },
      success: (res) => {
        this.setState({
          loadMore: !(!res.data || !(res.data instanceof Array ) || res.data.length < 20),
          showBlank: true,
          loading: false,
          visible: false,
          hasLoad: true,
          loadingSuccess: true,
        });
        if(resove instanceof Function) {
          resove('success');
        }
      },
      fail: () => {
        this.setState({
          showBlank: pageNo === 1,
          loading: false,
          visible: false,
          hasLoad: true,
          loadingSuccess: false,
        });
        if(resove instanceof Function) {
          resove('fail');
        }
      },
      timeout: () => {
        this.setState({
          showBlank: pageNo === 1,
          loading: false,
          hasLoad: true,
          visible: false,
          loadingSuccess: false,
        });
        if(resove instanceof Function) {
          resove('timeout');
        }
      }
    })
  }
}
SearchShop.defaultProps = {};

SearchShop.PropTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  swipeout: {
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 5,
  },
  shopList: {
    height: 80,
    flexDirection: 'row',
    backgroundColor: styleConsts.white,
    borderRadius: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  shopLogo: {
    width: 80,
    height: 80,
  },
  rightTxt: {
    flex: 1,
    paddingRight: 15,
    paddingLeft: 15,
  },
  shopName: {
    marginTop: 15,
    marginBottom: 10,
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  address: {
    fontSize: styleConsts.H5,
    color: styleConsts.darkGrey,
    lineHeight: 18,
  },
  noShopS: {
    fontSize: styleConsts.H3,
    color: styleConsts.middleGrey,
  },
  noShopB: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    marginTop: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    $searchData: state.shopCenter.get('searchData')
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    goToShopCenter: (opts) => {
      dispatch({type: SET_MAININFO_TO_GET_SHOP_INFO,  payload: opts}); // 把店铺主要信息存起来
      dispatch({type: NAV_TO_SHOPCENTER_MAIN_PAGE, payload: opts})
    },
    searchShop: (opts) => {
      dispatch(searchShopList(opts))
    },
    rest: () => {
      dispatch(searchShopListCancel())
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchShop)
