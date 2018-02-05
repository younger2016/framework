// 店铺详细信息
import React,{PropTypes} from 'react'
import { ScrollView, View, Text, StyleSheet, Image, StatusBar, Linking } from 'react-native';
import { connect } from 'react-redux'
import {styleConsts} from '../../../../utils/styleSheet/styles'
import Toast from 'react-native-root-toast';
import { toastShort } from '../../../../components/toastShort'
import I18n from 'react-native-i18n';
import HeaderBar from '../../../../components/HeaderBar';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import {TouchableWithoutFeedbackD, TouchableHighlightD} from '../../../../components/touchBtn';
import shopInfo from '../../config'
import Moment from 'moment';
const businessModelTypes = ['', 'onlyMeal', 'moreMeals', 'chain']
const groupTypes = ['mealsCom', 'shopsCom', 'shopAndMeal']
const modelOne = [
  {title: 'groupName'},
  {title: 'businessModel'},
  {title: 'inTheArea'},
  {title: 'mainProduct'},
]
const modelTwo = [
  {title: 'linkMan'},
  {title: 'contactNumber'},
  {title: 'linkAddress'},
]
const modelThree = [
  {title: 'groupName'},
  {title: 'registrationAddress'},
  {title: 'businessScope'},
  {title: 'license'},
]
const modelFour = [
  {title: 'legalPersonFrom'},
  {title: 'businessType'},
  {title: 'businessTerm'},
]

class ShopInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showIndex: 0,
      shopInfo,
    }
  }
  componentDidMount() {
    this.setState({
      shopInfo: this.props.$allInfo.get('info').toJS()
    })
  };
  componentWillReceiveProps(nextProps) {
    // this.setState({
    //   shopInfo: nextProps.$allInfo.get('info').toJS()
    // })
  }
  render() {
    const {groupName, businessModel, shopCity, mainProduct, shopPhone, shopAddress, shopAdmin} = this.state.shopInfo.baseInfo || {};
    const {groupAddress, businessScope, businessNo, businessEntity, groupType, startTime, endTime} = this.state.shopInfo.authInfo || {};
    return (
      <View style={styles.container}>
        <HeaderBar
          title={I18n.t('shopInfo')}
          cancelHide={true}
          navigation={this.props.navigation}
        />
        <ScrollableTabView
          initialPage={0}
          ref="allPageTab"
          onChangeTab={(a) => {
            this.setState({
              showIndex: a.i,
            })
          }}
          renderTabBar={() => this.renderBarTable()}
        >
          <ScrollView>
            <View style={styles.moudelBox}>
              <View style={styles.titleBox}>
                {
                  modelOne.map(({title},index) => {
                    return (
                    <View>
                      {index > 0 && <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>}
                      <View style={[styles.titleOne]} key={title}>
                        <Text style={styles.titleOneInfo}>{I18n.t(title)}：</Text>
                      </View>
                    </View>
                    )
                  })
                }
              </View>
              <View style={styles.dataInfo}>
                <View style={[styles.dataOne, styles.noBorder]}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{groupName}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{businessModel && businessModel !== '' && I18n.t(businessModelTypes[businessModel])}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{shopCity}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{mainProduct}</Text>
                </View>
              </View>
            </View>
            <View style={styles.moudelBox}>
              <View style={styles.titleBox}>
                {
                  modelTwo.map(({title},index) => {
                    return (
                      <View>
                        {index > 0 && <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>}
                        <View style={[styles.titleOne]} key={title}>
                          <Text style={styles.titleOneInfo}>{I18n.t(title)}：</Text>
                        </View>
                      </View>
                      )
                  })
                }
              </View>
              <View style={styles.dataInfo}>
                <View style={[styles.dataOne, styles.noBorder]}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{shopAdmin}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{shopPhone}</Text>
                  {(shopPhone && '' !== shopPhone) ? <TouchableWithoutFeedbackD onPress={() => this.onPressTelPhone(`tel:${shopPhone}`)}>
                    <View style={styles.phone}>
                      <Image style={{width: 14.5, height: 14}} source={require('../../imgs/phone.png')}/>
                    </View>
                  </TouchableWithoutFeedbackD> : null}
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{shopAddress}</Text>
                </View>
              </View>
            </View>
          </ScrollView>
          <ScrollView>
            <View style={styles.certificationBox}>
              <Image
                style={{height:16.5, width: 16.5}}
                source={require('../../imgs/certification.png')}
              />
              <View style={styles.certificationTxt}>
                <Text style={styles.certTxt}>
                  {I18n.t('shopPass')}
                </Text>
                <TouchableWithoutFeedbackD>
                  <View style={styles.certification}>
                    <Text style={styles.certTxtMind}>
                        {I18n.t('certification')}
                    </Text>
                  </View>
                </TouchableWithoutFeedbackD>
              </View>
            </View>
            <Text style={styles.cenTitle}>
              {I18n.t('registration')}
            </Text>
            <View style={styles.moudelBox}>
              <View style={styles.titleBox}>
                {
                  modelThree.map(({title},index) => {
                    return (
                      <View>
                        {index > 0 && <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>}
                        <View style={[styles.titleOne]} key={title}>
                          <Text style={styles.titleOneInfo}>{I18n.t(title)}：</Text>
                        </View>
                      </View>
                    )
                  })
                }
              </View>
              <View style={styles.dataInfo}>
                <View style={[styles.dataOne, styles.noBorder]}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{groupName}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{groupAddress}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{businessScope}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{businessNo}</Text>
                </View>
              </View>
            </View>
            <View style={styles.moudelBox}>
              <View style={styles.titleBox}>
                {
                  modelFour.map(({title},index) => {
                    return (
                      <View>
                        {index > 0 && <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>}
                        <View style={[styles.titleOne]} key={title}>
                          <Text style={styles.titleOneInfo}>{I18n.t(title)}：</Text>
                        </View>
                      </View>
                    )
                  })
                }

              </View>
              <View style={styles.dataInfo}>
                <View style={[styles.dataOne, styles.noBorder]}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{businessEntity}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>{((groupType && '' !== groupType ) || 0 == groupType) && I18n.t(groupTypes[groupType])}</Text>
                </View>
                <View style={{height: StyleSheet.hairlineWidth, backgroundColor: styleConsts.lightGrey}}/>
                <View style={styles.dataOne}>
                  <Text numberOfLines={1} style={styles.dataOneInfo}>
                  {
                     startTime && endTime && '' !== endTime && '' !== startTime &&
                      `${Moment(`${startTime}`.substring(0,8)).format('L')}-${Moment(`${endTime}`.substring(0,8)).format('L')}`
                   }
                     </Text>
                </View>
              </View>
            </View>
          </ScrollView>

        </ScrollableTabView>
      </View>
    )
  }

  renderBarTable = () => {
    return (
      <View style={styles.tabHeaderBox}>
        <View style={styles.tabHeader}>
          <TouchableWithoutFeedbackD delayTime={300} onPress={() => this.changePage(0)}>
            <View style={[styles.btnInfo, 0 === this.state.showIndex && {borderColor: styleConsts.mainColor}]}>
              <Text style={[styles.btnTxt,0 === this.state.showIndex && {color: styleConsts.mainColor}]}>{I18n.t('baseInfo')}</Text>
            </View>
          </TouchableWithoutFeedbackD>
          <TouchableWithoutFeedbackD delayTime={300} onPress={() => this.changePage(1)}>
            <View style={[styles.btnInfo, 1 === this.state.showIndex && {borderColor: styleConsts.mainColor}]}>
              <Text style={[styles.btnTxt,1 === this.state.showIndex && {color: styleConsts.mainColor}]}>{I18n.t('authenticationInfo')}</Text>
            </View>
          </TouchableWithoutFeedbackD>
        </View>
        <View style={[styles.tabLine, 1 === this.state.showIndex && {height: StyleSheet.hairlineWidth}]}/>
      </View>
    )
  }

  changePage = (index) => {
    this.refs.allPageTab.goToPage(index)
  }

  // 拨打电话
  onPressTelPhone = (url) => {
    Linking.canOpenURL(url).then((supported) => {
      if (!supported) {
        this.toast && Toast.hide(this.toast);
        this.toast = toastShort(`Can't handle url: ${url}` || I18n.t('fetchErrorMessage'));
      } else {
        return Linking.openURL(url);
      }
    }).catch(err => {
      this.toast && Toast.hide(this.toast);
      this.toast = toastShort(err || I18n.t('fetchErrorMessage'));
    });
  }
}

ShopInfo.defaultProps = {};
ShopInfo.PropTypes = {};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: styleConsts.white,
  },
  btnInfo: {
    minWidth: 100,
    height: 48,
    borderBottomWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: styleConsts.white,
  },
  btnTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
  },
  tabLine: {
    height: 10,
    backgroundColor: styleConsts.bgGrey,
  },
  moudelBox: {
    marginBottom: 10,
    backgroundColor: styleConsts.white,
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
  },
  titleOne: {
    height: 40,
    justifyContent: 'center',
    paddingRight: 15,
  },
  dataInfo: {
    flex: 1,
  },
  dataOne: {
    height: 40,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataOneInfo: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  titleOneInfo: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  phone: {
    paddingLeft: 5,
    paddingRight: 5,
    height: 40,
    justifyContent: 'center',
    marginLeft: 15,
  },
  noBorder: {
    borderTopWidth: 0,
  },
  certificationBox: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingLeft: 15,
    backgroundColor: styleConsts.white,
  },
  certificationTxt: {
    flexDirection: 'row',
    height: 50,
    alignItems: 'center',
    paddingLeft: 8,
  },
  certTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.darkGrey,
  },
  certTxtMind: {
    fontSize: styleConsts.H3,
    color: styleConsts.activeA,
  },
  cenTitle: {
    paddingTop: 11,
    paddingBottom: 11,
    paddingLeft: 15,
    fontSize: styleConsts.H4,
    color: styleConsts.middleGrey,
  }
});

const mapStateToProps = (state) => {
  return {
    $allInfo: state.shopCenter.get('someOneInfo'),
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    goSomeWhere: (opts)=>{
      dispatch(opts)
    },

  }
};
export default connect(mapStateToProps, mapDispatchToProps)(ShopInfo)
