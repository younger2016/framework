/**
 * Created by chenshuang on 2017/8/7.
 */

import React from 'react'
import { View, TextInput, Text, Image, FlatList, StyleSheet, TouchableWithoutFeedback, ScrollView, Platform } from 'react-native'
import { connect } from 'react-redux'
import { styleConsts } from '../../utils/styleSheet/styles';
import  I18n  from 'react-native-i18n'
import HeaderBar from '../../components/HeaderBar'
import { NAV_TO_SELECT_DATE_PAGE } from '../../redux/actions/nav.action'
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import ChangePrice from '../../components/ChangePrice'
import Dimensions from 'Dimensions';
import SelectMeals from '../../components/SelectMeal'
import { toastShort } from '../../components/toastShort';
import DatePicker from '../../components/Datepicker'
import DatePickerAD from '../../components/DatePickerAD';
import BlankPage from '../../components/BlankPage'
import Toast from 'react-native-root-toast';
import Immutable,{is} from 'immutable'
import {TouchableWithoutFeedbackD} from '../../components/touchBtn'
import {
  tradeGetMeals,
  tradeGetInfoList,
  DELETE_ALL_TRADEOFCACHE,
} from '../../redux/actions/user.action'
import {getImgUrl} from '../../utils/adapter';
import {PullFlatList} from '../../components/PullList'
import { setTask } from '../../utils/deskTask';

const {width, height} = Dimensions.get('window')
const loadingImg = require('../../components/PullList/imgs/loading.gif')
const loadImage = require('./imgs/financialdefault.png');

const defaultData = [
  {
    firtSuccess: false, // 第一次加载成功，切换tab就不自动加载，用户主动刷新,仅在第一次
    status: 'start',
    list: [],
    loading: false,
    canLoadMore: false,
  },
  {
    firtSuccess: false, // 第一次加载成功，切换tab就不自动加载，用户主动刷新,仅在第一次
    status: 'start',
    list: [],
    loading: false,
    canLoadMore: false,
  },
]

import Moment from 'moment';
export class TradeRecord extends React.Component {
  constructor(props){
    super(props);
    let endArr = (Moment().subtract(1, 'month').calendar() + '').split('/');
    this.state = {
      showIndex: 0,
      startDate: `${endArr[2]}-${endArr[0]}-${endArr[1]}`,
      endDate:  Moment().format('YYYY-MM-DD'),
      selectedMeals: {},
      meals: [], // 合作的供应商
      settleAmount: 0,
      unSettleAmount: 0,
      dataList: Immutable.fromJS(defaultData).toJS(),
    }
  }
  componentDidMount() {
     this.fetchMeals()
     this.fetchBillList(0, 1)
     this.setState({
       meals: this.props.$meals.get('list').toJS(),
     })
  }
  componentWillReceiveProps(nextProps) {
    let dataList = this.state.dataList;
    if(!(is(this.props.$meals.get('list'), nextProps.$meals.get('list')))){
      this.setState({
        meals: nextProps.$meals.get('list').toJS(),
      })
    }
    ([...new Array(2)]).map((un, index) => {
      if(!(is(this.props.$tradeList.getIn([index, 'list']), nextProps.$tradeList.getIn([index, 'list']))) || dataList[index].list.length === 0){
        dataList[index].list = nextProps.$tradeList.getIn([index, 'list']).toJS();
        this.setState({
          dataList,
        })
      }
    })
  }
  componentWillUnmount() {
    this.toast && Toast.hide(this.toast)
    this.props.clearTrade()
  }
  render(){
    let {data} = this.state;
    return (
      <View style={styles.container}>
        <HeaderBar
          cancelHide={true}
          navigation={this.props.navigation}
          title={I18n.t('trade')}
        />
        <View style={styles.topBar}>
          <TouchableWithoutFeedback
            onPress={()=>{
              this.refs.selectMeals.show(() => setTask(null));
              setTask(this.refs.selectMeals.hide);
            }}>
            <View style={styles.selectSupplier}>
              <Text style={{fontSize: styleConsts.H3, color: styleConsts.darkGrey,}} numberOfLines={1}>
                {
                  this.state.selectedMeals.groupName ? this.state.selectedMeals.groupName : I18n.t('allMymeals')
                }
              </Text>
              <View style={styles.sanjiao} />
            </View>
          </TouchableWithoutFeedback>

          <TouchableWithoutFeedback onPress={this.navToSelectDate}>
            <View style={styles.selectDate}>
              <Text style={styles.dateTxt}>{this.state.startDate}</Text>
              <View style={{height: 1, backgroundColor: styleConsts.darkGrey, width: 8}}/>
              <Text style={styles.dateTxt}>{this.state.endDate}</Text>
              <View style={styles.sanjiao}/>
            </View>
          </TouchableWithoutFeedback>

        </View>
        <ScrollableTabView
          renderTabBar={() => this.renderTabBar()}
          ref='tabView'
          onChangeTab={(a) => {
             this.setState({
               showIndex: a.i,
             });
             if(!this.state.dataList[a.i].firtSuccess){
               this.fetchBillList(a.i, 1)
             }

           }}
          >
          {
            this.state.dataList.map((par, index) => {
              const {loading, list, status} = par
              return (
                <View style={{flex: 1,}} key={`${index}FlatList`}>
                  {
                    status !== 'start' ?
                      <PullFlatList
                        legacyImplementation={false}
                        data={list}
                        renderItem={({ item, index }) => this.renderBillItem(item, index)}
                        refreshing={loading}
                        onRefresh={par.firtSuccess ? (resove) => this.fetchBillList(index, 1, resove) : null}
                        ListEmptyComponent={() => this.ListEmpty(index, status)}
                        onEndReachedThreshold={0}
                        onEndReached={(resove) => this.fetchBillList(index,undefined, resove)}
                        keyExtractor={({ subBillNo }) => subBillNo}
                        ListFooterComponent={this.listFooter(list.length, par.canLoadMore)}
                        canLoadMore={par.canLoadMore}
                      /> :
                      <View style={{justifyContent:'center', alignItems: 'center', height: height - 200}}>
                        <Image source={loadingImg} style={{width: 26, height: 26}}/>
                      </View>
                 }
               </View>
              )
            })
          }
        </ScrollableTabView>
        {/*选择合作商*/}
        <SelectMeals
          ref='selectMeals'
          dataList={this.state.meals}
          confirm={(meal) => this.selectMela(meal)}
        />
        {/*开始、结束日期选择框*/}
        {
          Platform.OS === 'ios' ?
            <DatePicker
              style={{ width: 200, height: 0, overflow: 'hidden' }}
              mode="date"
              placeholder="select date"
              format="YYYY-MM-DD"
              maxDate={new Date()}
              confirmBtnText={I18n.t('confirm')}
              cancelBtnText={I18n.t('cancel')}
              ref="datePacker"
              onDateChange={(start,end) => { this.changeDate(start,end) }}
            /> :
            <DatePickerAD
              ref="datePacker"
              updateDate={(start, end) => this.changeDate(start, end)}
            />
        }
      </View>
    )
  }

  navToSelectDate = () => {
    this.refs.datePacker.onPressDate();
  }
  ListEmpty = (index, status) => {
    return (
      <BlankPage  visable={this.state.dataList[index].list.length === 0 && 'start' !== status } type={'success' === status?'blank':'error'} loadAgain={() =>
        this.setState({
        dataList:  Immutable.fromJS(defaultData).toJS(), // 重置本地数据进行请求
      }, this.fetchBillList(this.state.showIndex, 1))}>
        <View>
          <Text style={{color: styleConsts.middleGrey}}>
            {I18n.t('fetchTradeNO')}
          </Text>
        </View>
      </BlankPage>
    )
  }
  listFooter = (len, canLoadMore) => {
    if(len === 0){
      return <View/>
    }
    if(canLoadMore){ // 允许加载更多
      return(
        <View style={{height: 70, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: -70}}>
          <Image source={require('../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    let nowHeight = len * 70;
    let cHeight =  nowHeight - (height - styleConsts.headerHeight - 54 - 45);
    return (
      <View style={{height: 90, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: cHeight >= 0 ? -90 :  cHeight-45}}>
        <Text style={{fontSize: styleConsts.h3, color: styleConsts.middleGrey}}>{
            I18n.t('noMoreData')
        }</Text>
      </View>
    )
  }
  renderTabBar = () => {
    return (
      <View style={styles.tabBox}>
        <View style={styles.tabCenter}>
          <TouchableWithoutFeedbackD delayTime={200} onPress={() => this.refs.tabView.goToPage(0)}>
            <View style={[styles.tab, this.state.showIndex === 0 && {borderColor: styleConsts.mainColor}]}>
              <View style={styles.tabInfo}>
                <Image source={require('../../imgs/trade.png')} style={[styles.tabIMg, this.state.showIndex === 0 && {tintColor: styleConsts.mainColor}]}/>
                <Text style={[styles.tabTxt,this.state.showIndex === 0 && {color: styleConsts.mainColor}]}>{I18n.t('unSettleAmount')}</Text>
              </View>
              <View style={{marginTop: 5}}>
                <ChangePrice price={this.state.unSettleAmount} color={ this.state.showIndex !== 0 ? styleConsts.grey : styleConsts.mainColor} textAlign={'center'} width={'100%'}/>
              </View>
            </View>
          </TouchableWithoutFeedbackD>
          <TouchableWithoutFeedbackD delayTime={200} onPress={() => this.refs.tabView.goToPage(1)}>
            <View style={[styles.tab, this.state.showIndex === 1 && {borderColor: styleConsts.mainColor}]}>
              <View style={styles.tabInfo}>
                <Image source={require('../../imgs/trade.png')} style={[styles.tabIMg, this.state.showIndex === 1 && {tintColor: styleConsts.mainColor}]}/>
                <Text style={[styles.tabTxt,this.state.showIndex === 1 && {color: styleConsts.mainColor}]}>{I18n.t('settleAmount')}</Text>
              </View>
              <View style={{marginTop: 5}}>
               <ChangePrice price={this.state.settleAmount} color={ this.state.showIndex !== 1 ? styleConsts.grey : styleConsts.mainColor} textAlign={'center'}  width={'100%'}/>
              </View>
            </View>
          </TouchableWithoutFeedbackD>
        </View>
        <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey}}/>
      </View>
    )

  }
  renderBillItem = (item, index) => {
    return (
      <View style={styles.billItem}>
        {index !== 0 && <View style={{height: 0.5, backgroundColor: styleConsts.lightGrey, width: width-70, alignSelf: 'flex-end', position: 'absolute', top: 0,}}/>}
        <TouchableWithoutFeedback >
          <View style={styles.flexRow}>
            <Image source={loadImage} style={{position: 'absolute', width: 50, height: 50,}}/>
            <Image style={{width: 50, height: 50, marginRight: 10}} source={item.imgUrl && '' !==item.imgUrl? {uri: getImgUrl(item.imgUrl, 50, 50)} : loadImage}/>
            <View style={{flex: 1}}>
              <View style={[styles.flexRow,{height: 50, flex: 1, alignItems: 'flex-end',paddingRight: 10,}]}>
                <View style={{justifyContent: 'space-between', height: 50}}>
                  <Text style={{color: styleConsts.deepGrey, fontSize: styleConsts.H3}}>{item.shopName}</Text>
                  <ChangePrice price={item.totalAmount} big={styleConsts.H4} />
                  <Text style={styles.billStatus}>{I18n.t('orderNum')}:{item.subBillNo}</Text>
                </View>
                <Text style={styles.billStatus}> {(item.subBillDate && `${item.subBillDate}`.length>=8) && Moment(`${item.subBillDate}`.substring(0,8)).format('L')}</Text>

              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  };
  selectMela = (selectedMeals) => {
    this.setState({
      selectedMeals,
      dataList:  Immutable.fromJS(defaultData).toJS(), // 重置本地数据进行请求
    }, () => this.fetchBillList(this.state.showIndex, 1))

  }
  changeDate = (start, end) => {
    this.setState({
      startDate: start,
      endDate: end,
      dataList:  Immutable.fromJS(defaultData).toJS(),// 重置本地数据进行请求
    }, () => this.fetchBillList(this.state.showIndex, 1))
  }
  fetchMeals = () => { // 获取合作供应商
    if('pending' !== this.props.$meals.get('status')){
      this.props.mapFetchMeals({
        data: {
          purchaserID: this.props.purchaserID,
        },
        success: () => {

        },
        fail: () => {

        },
        timeout: () => {

        }
      })
    }

  }
  getDate = (date) => {
    let dateArr = date.split('-');
    return `${dateArr[0]}${dateArr[1]}${dateArr[2]}`
  }
  fetchBillList = (index, page, resove) => { //获取交易记录
    this.toast && Toast.hide(this.toast)
    if(!page && !this.state.dataList[index].canLoadMore ){ // 获取更多
      return ;
    }
    if(1 === page && 'start' !== this.state.dataList[index].status){
      let dataList = this.state.dataList;
      dataList[index].loading = true;
      this.setState({
        dataList,
      })
    }
    let pageNum = page || this.state.dataList[index].list.length / 20 + 1;
    this.props.mapFetchBillList({
      data: {
        endDate: this.getDate(this.state.endDate),//	结束日期 （必传）	number	@mock=20170104
        groupID: this.state.selectedMeals.groupID,//	供应商ID	string	@mock=59
        pageNum, //	页码 （必传）	number	@mock=1
        pageSize: 20,//	页长 （必传）	number	@mock=2
        purchaserID: this.props.purchaserID,//	采购商ID （必传）	string	@mock=59
        settlementStatus: index + 1,//	结算状态 1-未结算 2-已结算 （必传）	string	@mock=2
        shopID: '',//	采购商店铺ID	number	@mock=1
        startDate:  this.getDate(this.state.startDate),//	开始日期 （必传）
      },
      nowIndex: index,
      success: (res) => {
        if(resove instanceof Function){
          resove('success')
        }
        let dataList = this.state.dataList;
        dataList[index].canLoadMore = true;
        dataList[index].loading = false;
        dataList[index].firtSuccess = true;
        dataList[index].status = 'success';
        if(!(res.data.list instanceof Array) || res.data.list.length < 20){
          dataList[index].canLoadMore = false
        }
        this.setState({
          dataList,
        })
        let settleAmount = res.data.settleAmount;
        let unSettleAmount = res.data.unSettleAmount;
        if(settleAmount !== this.state.settleAmount ||  unSettleAmount !== this.state.unSettleAmount){
          this.setState({
            settleAmount,
            unSettleAmount,
          })
        }
      },
      fail: (res) => {
        let dataList = this.state.dataList;
        this.toast && Toast.hide(this.toast)
        if('start' !== dataList[index].status)this.toast = toastShort(res && res.response && res.response.message || I18n.t('loadingFail'))
        dataList[index].status = 'fail';
        dataList[index].loading = false;
        this.setState({
          dataList,
        })
        if(resove instanceof Function){
          resove('fail')
        }

      },
      timeout: () => {
        let dataList = this.state.dataList;
        this.toast && Toast.hide(this.toast)
        if('start' !== dataList[index].status)this.toast = toastShort(res && res.response && res.response.message || I18n.t('timeout'))
        dataList[index].loading = false;
        dataList[index].status = 'timeout';
        this.setState({
          dataList,
        })
        if(resove instanceof Function){
          resove('timeout')
        }
      }
    })
  }

}
TradeRecord.defaultProps = {

};

TradeRecord.PropsType = {

};
const mapStateToProps = (state) => {
  return {
    $meals: state.user.get('meals'),
    $tradeList: state.user.get('tradeList'),
    purchaserID: state.user.getIn(['userInfo', 'purchaserID']),
    $user: state.user
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    mapFetchMeals: (opts) => {
      dispatch(tradeGetMeals(opts))
    },
    mapFetchBillList: (opts) => {
      dispatch(tradeGetInfoList(opts))
    },
    clearTrade: () => {
      dispatch({type: DELETE_ALL_TRADEOFCACHE})
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey
  },
  flexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative'
  },
  noBorder: {
    borderBottomWidth: 0
  },
  productBox: {
    paddingTop: 10,
    marginTop: 5,
    flexDirection: 'row',
    backgroundColor: styleConsts.white
  },
  logo: {
    width: 50,
    height: 50,
    marginHorizontal: 10
  },
  rightPart: {
    flex: 1,
    height: 85
  },
  rightTop: {
    justifyContent: 'space-between',
    paddingBottom: 6,
    paddingRight: 60,
    height: 50,
    borderBottomWidth: 0.5,
    borderBottomColor: styleConsts.lightGrey,
  },
  productName: {
    color: styleConsts.deepGrey,
    fontSize: styleConsts.H3
  },
  unit: {
    color: styleConsts.grey,
    fontSize: styleConsts.H5
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: styleConsts.white,
    marginBottom: 5

  },
  selectSupplier: {
    width: 150,
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 0.5,
    borderRightColor: styleConsts.lightGrey,
    position: 'relative',
    paddingLeft: 5,
  },
  selectDate: {
    height: 45,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    position: 'relative',
  },
  billItem: {
    backgroundColor: styleConsts.white,
    height: 70,
    paddingLeft: 10,
    justifyContent: 'center',
    position: 'relative',
  },
  billStatus: {
    color: styleConsts.grey,
    fontSize: styleConsts.H5,
  },
  tab: {
    width: 130,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: styleConsts.white,
  },
  tabBox: {
    backgroundColor: styleConsts.white,
  },
  tabInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIMg: {
    width: 10,
    height: 10,
    marginRight: 10,
  },
  tabTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
  },
  tabCenter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sanjiao: {
    width: 0,
    height: 0,
    borderBottomWidth: 6,
    borderBottomColor: styleConsts.lightGrey,
    borderLeftWidth: 6,
    borderLeftColor: 'transparent',
    position: 'absolute',
    right: 3,
    bottom: 3,
  },
  dateTxt: {
    fontSize: styleConsts.H4,
    flex: 1,
    color: styleConsts.darkGrey,
    textAlign: 'center',
  },
});



export default connect(mapStateToProps, mapDispatchToProps)(TradeRecord)
