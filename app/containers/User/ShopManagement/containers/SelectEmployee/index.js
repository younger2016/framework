/**
 * 选择员工
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import I18n from 'react-native-i18n';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import Toast from 'react-native-root-toast';
import Immutable from 'immutable';
import { toastShort } from '../../../../../components/toastShort'
import HeaderBar from '../../../../../components/HeaderBar';
import { PullFlatList } from '../../../../../components/PullList';
import BlankPage from '../../../../../components/BlankPage';
import { styleConsts } from '../../../../../utils/styleSheet/styles';
import { employeeTitleList } from '../config';
import { roleTypes } from '../../../EmployeeManagement/config';
import {
  fetchEmployeeListAC,
} from '../../../../../redux/actions/employeeManagement.action';

class SelectEmployee extends Component{
  constructor(props){
    super(props);
    this.state = {
      showIndex: 0,                  // 当前顶部tab显示的是哪个
      employeeTitleList: employeeTitleList,
      refreshing: false,
      hasLoad: false,
      loadingSuccess: false,
      moreLoading: false,
      visible: false,
    };
  }
  componentDidMount() {
    // 请求员工列表
    this.setState({
      visible: true,
    }, () => {
      // 判断员工列表是否请求过，有的话直接从store中拿，否则请求数据
      if(!this.props.$employeeInfo.getIn(['employeeList','selectEmployeeInitialize'])) {
        this.fetchEmployeeList();
      } else {
        let employeeList = this.props.$employeeInfo.getIn(['employeeList','list']).toJS();
        this.handleEmployeeList(employeeList);
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if(!Immutable.is(this.props.$employeeInfo.get('employeeList'),nextProps.$employeeInfo.get('employeeList'))) {
      let employeeList = Immutable.Map.isMap(nextProps.$employeeInfo.get('employeeList')) ?
        nextProps.$employeeInfo.toJS().employeeList : nextProps.$employeeInfo.employeeList;

      if('success' === employeeList.status) {
        this.handleEmployeeList(employeeList.list);
      }

    }
  }
  render() {
    let { employeeTitleList, showIndex, refreshing, loadingSuccess, moreLoading, } = this.state;
    return (
      <View style={styles.container}>
        <HeaderBar
          title='选择员工'
          navigation={this.props.navigation}
          cancelHide={true}
          goBackCallBack={() => this.handleGoBack()}
        />
        <ScrollableTabView
          initialPage={showIndex}
          renderTabBar={() =>
            <DefaultTabBar
              activeTextColor={styleConsts.mainColor}
              inactiveTextColor={styleConsts.grey}
              underlineStyle={{height: 1, backgroundColor: styleConsts.mainColor,}}
              style={{height: 50,backgroundColor: styleConsts.white, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: styleConsts.lightGrey,}}
              textStyle={{fontWeight: 'normal',fontSize: styleConsts.H3,}}
              tabStyle={{ height: 50, paddingBottom: 0,}}
            />
          }
          onChangeTab={(a) => {
            this.setState({
              showIndex: Object.keys(employeeTitleList).find((key) => I18n.t(key) === a.ref.props.tabLabel),
            })
          }}
        >
          {
            employeeTitleList.map( (titleItem) => {
              return (
                <View style={{flex: 1}} key={titleItem.id} tabLabel={I18n.t(titleItem.title)}>
                  <PullFlatList
                    keyExtractor={({ employeeID }) => employeeID}
                    data={titleItem.list}
                    refreshing={refreshing}
                    onRefresh={(resove) => this.fetchEmployeeList(resove)}
                    renderItem={({item}) => this.renderItem(item,titleItem.selectEmployee)}
                    ListFooterComponent={() => this.listFooter(titleItem.list.length)}
                    ListEmptyComponent={() => this.renderNothing()}
                    canLoadMore={moreLoading}
                  />

                  {/*全选*/}
                  {
                    loadingSuccess && titleItem.list.length !== 0 ?
                      <View style={styles.footer}>
                        <TouchableWithoutFeedback onPress={() => this.checkAll(titleItem)}>
                          <View style={styles.footerLeftPart}>
                            <Image
                              style={styles.selectImg}
                              source={titleItem.list.length === titleItem.selectEmployee.size ?
                                require('../../../EmployeeManagement/imgs/selected.png') :
                                require('../../../EmployeeManagement/imgs/noSelect.png')
                              }
                            />
                            <Text style={[styles.total,{ marginLeft: 10, }]}>全选</Text>
                          </View>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={() => titleItem.selectEmployee.size !== 0 ? this.save() : {}}>
                          <View style={[styles.footerRightPart, titleItem.selectEmployee.size === 0 ? {backgroundColor: styleConsts.mainColorOpacity} : {}]}>
                            <Text style={styles.footBtnTxt}>保存</Text>
                          </View>
                        </TouchableWithoutFeedback>
                      </View> : null
                  }

                </View>
              );
            })
          }
        </ScrollableTabView>
      </View>
    )
  }

  // 列表中每一项
  renderItem = (item,selectEmployee) => {
    return (
      <TouchableWithoutFeedback onPress={() => this.selectEmployee(item,selectEmployee)}>
        <View style={styles.itemWrapper}>
          <Image
            style={styles.selectImg}
            source={selectEmployee.has(item.employeeID) ?
              require('../../../EmployeeManagement/imgs/selected.png') :
              require('../../../EmployeeManagement/imgs/noSelect.png')
            }
          />
          <View style={styles.item}>
            <Text style={[styles.txt, selectEmployee.has(item.employeeID) ? {color: styleConsts.deepGrey} : {}]}>
              {item.employeeName}
            </Text>
            <View style={styles.rightPart}>
              <Text style={[styles.rightTxt, selectEmployee.has(item.employeeID) ? {color: styleConsts.grey} : {}]}>
                {item.shopAccount}
              </Text>
              <Image
                style={[styles.img, selectEmployee.has(item.employeeID) ? { tintColor: styleConsts.grey } : {}]}
                source={require('../../../../../components/HeaderWithShopInfo/imgs/shopImg.png')}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    )
  };

  // 全选
  checkAll = (titleItem) => {
    if(titleItem.list.length !== titleItem.selectEmployee.size) {
      titleItem.list.forEach((item) => {
        titleItem.selectEmployee.add(item.employeeID);
      })
    } else {
      titleItem.selectEmployee.clear();
    }
    this.setState({ employeeTitleList });
  };

  // 请求员工列表
  fetchEmployeeList = (resove) => {
    return (
      this.props.fetchEmployeeList({
        data: {
          pageNum: 1,
          pageSize: 9999,
        },
        type: 'selectEmployee',
        success: () => {
          if(resove instanceof Function) {
            resove('success');
          }
        },
        fail: (res) => {
          this.setState({
            refreshing: false,
            hasLoad: true,
            loadingSuccess: false,
            visible: false,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort(res.response.message || '诶呀，服务器开小差了');
          if(resove instanceof Function) {
            resove('fail');
          }
        },
        timeout: () => {
          this.setState({
            refreshing: false,
            hasLoad: true,
            loadingSuccess: false,
            visible: false,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
          if(resove instanceof Function) {
            resove('timeout');
          }
        },
      })
    )
  };

  // 从store中拿到获取的数据
  handleEmployeeList = (employeeList) => {
    // 把服务器返回的数据处理为想要的结构
    let list = employeeList.map( (employee) => {
      let roleName = employee.roles.split('、')[0];
      let type = roleTypes.find( roleType => {
        return roleType.label === roleName;
      }).type;
      employee.roleName = roleName;
      employee.type = type;
      return employee;
    });

    // 为employeeTitleList中不同的list赋值
    let { employeeTitleList } = this.state;
    employeeTitleList.forEach((titleItem) => {
      titleItem.list = list.filter((item) => {
        return item.roleName == I18n.t(titleItem.key);
      });

      // 编辑门店时需要展示该门店下负责的员工,新增时不用处理
      let params = this.props.navigation.state.params;  // 传过来的选中的员工ID
      if(params.employeeIdList) {                       // 从employeeTitleList中每一个list中查找到选中的员工ID，为selectEmployee赋值
        titleItem.list.forEach((item) => {
          params.employeeIdList.forEach((employeeId) => {
            if(item.employeeID === employeeId) {
              titleItem.selectEmployee.add(employeeId);
            }
          });
        })
      }

    });

    this.setState({
      employeeTitleList,
      refreshing: false,
      hasLoad: true,
      loadingSuccess: true,
      visible: false,
    });

  };

  // 选择员工
  selectEmployee = (item,selectEmployee) => {
    if(selectEmployee.has(item.employeeID)) {
      selectEmployee.delete(item.employeeID)
    } else {
      selectEmployee.add(item.employeeID)
    }
    this.setState({ employeeTitleList });
  };

  // 显示加载、没有更多
  listFooter = (length) => {
    if(length === 0) {
      return <View />;
    }
    // 允许加载更多
    if(this.state.moreLoading){
      return(
        <View style={{height: 60, width, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../../../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    // 没有更多
    let nowHeight = length * 50;
    let cHeight =  nowHeight - (height - styleConsts.headerHeight - 49);
    return (
      <View style={{height: 90, width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: cHeight >= 0 ? -90 :  cHeight-45}}>
        <Text style={{fontSize: styleConsts.H4, color: styleConsts.middleGrey}}>{I18n.t('noMoreData')}</Text>
      </View>
    )
  };

  // 空白页、网络错误页
  renderNothing = () => {
    let { hasLoad, loadingSuccess } = this.state;
    return (
      <BlankPage
        visable={true}
        type={ !hasLoad ? 'loading' : loadingSuccess ? 'blank' : 'error' }
        loadAgain={() => {
          this.setState({
            visible: true,
          },() => {
            this.fetchEmployeeList()
          });
        }}
      >
        <Text style={{fontSize: styleConsts.H4,color: styleConsts.middleGrey, marginTop: 15}}>哎呀，还没有员工列表呢</Text>
      </BlankPage>
    );
  };

  // 保存选中的员工ID
  save = () => {
    let { employeeTitleList } = this.state;
    let selectList = [];
    employeeTitleList.forEach((titleItem) => {
      selectList = selectList.concat(Array.from(titleItem.selectEmployee));
    });
    let saveSelectEmployee = this.props.navigation.state.params.saveSelectEmployee;
    saveSelectEmployee && saveSelectEmployee(Array.from(selectList));
    this.props.navigation.goBack();
  };

  // 返回时清除选中的员工列表
  handleGoBack = () => {
    let { employeeTitleList } = this.state;
    employeeTitleList.forEach((titleItem) => {
      titleItem.selectEmployee.clear();
    });
    this.setState({ employeeTitleList });
    this.props.navigation.goBack();
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  itemWrapper: {
    width: width,
    height: 50,
    flexDirection: 'row',
    backgroundColor: styleConsts.white,
    paddingLeft: 10,
    paddingRight: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.lightGrey,
    alignItems: 'center',
  },
  unSelected: {
    width: 16,
    height: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: styleConsts.headerLine,
    borderRadius: 8,
  },
  center: {
    alignItems:'center',
    justifyContent: 'center',
    backgroundColor: styleConsts.mainColor,
    borderColor: styleConsts.mainColor,
  },
  item: {
    width: width - 20 - 16 - 10 - StyleSheet.hairlineWidth * 2,
    marginLeft: 10,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'space-between',
  },
  txt: {
    fontSize: styleConsts.H3,
    color: styleConsts.middleGrey,
  },
  rightPart: {
    flexDirection: 'row',
    alignItems:'center',
  },
  rightTxt: {
    fontSize: styleConsts.H4,
    color: styleConsts.middleGrey,
  },
  selectImg: {
    width: 13,
    height: 13,
  },
  img: {
    width: 10,
    height: 10,
    marginLeft: 5,
    tintColor: styleConsts.middleGrey,
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
});

const mapStateToProps = (state) => {
  return {
    $employeeInfo: state.employeeInfo,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 请求员工列表
    fetchEmployeeList: (opts) => {
      dispatch(fetchEmployeeListAC(opts));
    },
  }
};
export default connect(mapStateToProps,mapDispatchToProps)(SelectEmployee);