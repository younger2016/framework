/**
 * 员工管理
 */
import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, TouchableWithoutFeedback, Alert } from 'react-native';
import { connect } from 'react-redux'
import Swipeout from 'react-native-swipeout'
import I18n from 'react-native-i18n';
import Immutable from 'immutable';
import Platform from 'Platform';
import { toastShort } from '../../../components/toastShort';
import Toast from 'react-native-root-toast';
import { styleConsts } from '../../../utils/styleSheet/styles'
import HeaderBar from '../../../components/HeaderBar';
import BlankPage from '../../../components/BlankPage';
import DeleteModal from '../../../components/DeleteModal';
import { headerImgs, jobBackgroundColor, roleTypes } from './config';
import Dimensions from 'Dimensions';
const { width, height } = Dimensions.get('window');
import { PullFlatList } from '../../../components/PullList';

import {
  NAV_TO_ADD_OR_EDIT_EMPLOYEE,
} from '../../../redux/actions/nav.action'
import {
  fetchEmployeeListAC,
  deleteEmployeeAC,
} from '../../../redux/actions/employeeManagement.action';

class EmployeeManagment extends Component{
  constructor(props){
    super(props);
    this.state = {
      showIndex: -1,        // tab切换默认的下标
      employeeList: [],     // 员工列表
      refreshing: false,    // FlatList下拉刷新，默认不刷新
      isLoading: false,     // 是否加载过
      loadingSuccess: false,// 是否加载成功
      showModal: false,     // 删除提示框是否显示，默认不显示
      employee: {
        employeeID: '',
        employeeName: '',
      },
      pageNum: 1,
      pageSize: 20,
      moreLoading: false,   // 是否还有更多
      visible: false,
    };
  }
  componentDidMount() {
    this.setState({
      visible: true,
    },() => {
      // 判断员工列表是否请求过，有的话直接从store中拿，否则请求数据
      if(!this.props.$employeeInfo.getIn(['employeeList','employeeListInitialize'])) {
        this.fetchEmployeeList();
      } else {
        let employeeList = this.props.$employeeInfo.getIn(['employeeList','list']).toJS();
        this.handleEmployeeList(employeeList);
      }
    });
  }
  componentWillReceiveProps(nextProps){
    if(!Immutable.is(this.props.$employeeInfo.get('employeeList'),nextProps.$employeeInfo.get('employeeList'))) {
      let employeeList = Immutable.Map.isMap(nextProps.$employeeInfo.get('employeeList')) ?
        nextProps.$employeeInfo.toJS().employeeList : nextProps.$employeeInfo.employeeList;

      if('success' === employeeList.status) {
        this.handleEmployeeList(employeeList.list);
      }

    }
  }
  render () {
    let { employeeList, refreshing, employee, index, moreLoading } = this.state;
    return (
      <View style={styles.container}>
        <HeaderBar
          title='员工管理'
          rightText={I18n.t('addmore')}
          cancelCallback={() => this.props.navToAddEditEmployee({
            fetchEmployeeListCallBack: this.fetchEmployeeList
          })}
          navigation={this.props.navigation}
        />
        <PullFlatList
          data={employeeList}
          refreshing={refreshing}
          onRefresh={(resove) => this.updateEmployeeList(resove)}
          keyExtractor={({ employeeID }) => employeeID}
          renderItem={ ({item,index}) => this.renderItem(item,index)}
          ListEmptyComponent={ () => this.renderNoEmplOrNetworkError()}
          onEndReachedThreshold={0}
          onEndReached={(resove) => this.fetchMoreEmployeeList(resove)}
          ListFooterComponent={() => this.listFooter()}
          canLoadMore={moreLoading}
        />

        <DeleteModal
          visible={this.state.showModal}
          title='删除员工'
          tipTxt={`${'您确定要删除'}` + employee.employeeName + `${'嘛？'}`}
          leftBtnTxt={I18n.t('cancel')}
          rightBtnTxt= {I18n.t('confirm')}
          leftBtnCallBack={() => {
            this.setState({showModal: false});
          }}
          rightBtnCallBack={() => {
            this.setState({showModal: false});
            this.props.deleteEmployee({
              data: {
                employeeID:employee.employeeID,
              },
              success: (res) => {
                this.toast && Toast.hide(this.toast);
                this.toast = toastShort(res && res.message || '删除成功');
              },
              index: index,
              fail: (res) => {
                this.toast && Toast.hide(this.toast);
                this.toast = toastShort(res && res.response && res.response.message || '删除失败');
              },
              timeout: () => {
                this.toast && Toast.hide(this.toast);
                this.toast = toastShort('诶呀，服务器开小差了');
              }
            })
          }}
        />
      </View>
    )
  }

  // 员工列表每一项
  renderItem = (employee,index) => {
    return (
      <View style={{paddingLeft: 10, paddingRight: 10, marginTop: 10,}}>
        <Swipeout
          key={employee.employeeID}
          close={this.state.showIndex !== index}
          style={{backgroundColor: styleConsts.white, borderRadius: 5,}}
          onOpen={() => { this.setState({ showIndex: index }) }}
          right={
            [
              {
                text: I18n.t('delete'),
                backgroundColor: styleConsts.mainColor,
                color: styleConsts.white,
                underlayColor: styleConsts.mainColor,
                onPress: () => this.deleteEmployee(employee,index),
              },
            ]
          }
        >
          <TouchableWithoutFeedback key={employee.employeeID}
            onPress={() => this.props.navToAddEditEmployee({employeeID: employee.employeeID,index: index})}
          >
            <View style={styles.item}>
              <Image style={styles.headerImg} source={headerImgs[employee.type-1]} />
              <View style={styles.itemRight}>
                <View style={[styles.rowWrapper,Platform.OS === 'ios' ? {marginBottom: 15,} : {marginBottom: 12,}]}>
                  <View style={[styles.administorWrapper,jobBackgroundColor[employee.type-1]]}>
                    <Text style={styles.administorTxt}>{employee.roleName}</Text>
                  </View>
                  <Text style={styles.employeeName}>{employee.employeeName}</Text>
                </View>
                <View style={[styles.rowWrapper,Platform.OS === 'ios' ? {marginBottom: 5,} : {marginBottom: 3,}]}>
                  <Image style={styles.img} source={require('./imgs/tel.png')} />
                  <Text style={styles.text}>{employee.loginPhone}</Text>
                </View>
                <View style={[styles.rowWrapper,{marginBottom: 0,}]}>
                  <Image style={styles.img} source={require('./imgs/shop.png')} />
                  <Text style={styles.text}>负责门店{employee.shopAccount}个</Text>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Swipeout>
      </View>
    )
  };

  // 显示空白页/网络错误页
  renderNoEmplOrNetworkError = () => {
    let { isLoading, loadingSuccess } = this.state;
    return (
      <BlankPage
        visable={true}
        type={ !isLoading ? 'loading' : loadingSuccess ? 'blank' : 'error' }
        loadAgain={() => {
          this.setState({
            visible: true,
          },() => {
            this.fetchEmployeeList && this.fetchEmployeeList()
          });
        }}
      >
        <View style={{alignItems: 'center'}}>
          <Text style={styles.firstTxt}>哎呀，还没有设置员工呢</Text>
          <Text style={styles.secondTxt}>快点击右上角<Text style={{ color: styleConsts.mainColor}}>添加</Text>创建吧～</Text>
        </View>
      </BlankPage>
    );
  };

  // 请求员工列表
  fetchEmployeeList = (currPageNum,resove) => {
    let { pageNum, pageSize } = this.state;
    return (
      this.props.fetchEmployeeList({
        data: {
          pageNum: currPageNum ? currPageNum : pageNum,
          pageSize,
        },
        type: 'employeeList',
        fail: (res) => {
          this.setState({
            refreshing: false,
            isLoading: true,
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
            isLoading: true,
            loadingSuccess: false,
            visible: false,
          });
          this.toast && Toast.hide(this.toast);
          this.toast = toastShort('诶呀，服务器开小差了');
          if(resove instanceof Function) {
            resove('timeout');
          }
        },
        success: (res) => {
          this.setState({
            moreLoading: res.data.length >= pageSize,
          });
          if(resove instanceof Function) {
            resove('success');
          }
        }
      })
    )
  };

  // 从store中拿到获取的数据
  handleEmployeeList = (employeeList) => {
    // 把数据处理为想要的结构
    let list = employeeList.map( (employee) => {
      let roleName = employee.roles.split('、')[0];
      let type = roleTypes.find( roleType => {
        return roleType.label === roleName;
      }).type;
      employee.roleName = roleName;
      employee.type = type;
      return employee;
    });
    this.setState({
      employeeList: list,
      refreshing: false,
      isLoading: true,
      loadingSuccess: true,
      visible: false,
    })
  };

  // 下拉刷新员工列表
  updateEmployeeList = (resove) => {
    this.setState({
      refreshing: true,
    },() => {
      this.fetchEmployeeList(null,resove);
    });
  };

  // 删除员工
  deleteEmployee = (employee,index) => {
    this.setState({
      showModal: true,
      employee: employee,
      index: index,
    })
  };

  // 上拉加载更多
  fetchMoreEmployeeList = (resove) => {
    let { pageNum, pageSize, moreLoading, employeeList } = this.state;
    if(moreLoading) {
      pageNum = Math.floor(employeeList.length / pageSize) + 1;
      this.fetchEmployeeList(pageNum,resove);
    }
  };

  // 底部加载和没有更多
  listFooter = () => {
    let { employeeList, moreLoading } = this.state;
    // 允许加载更多
    if(moreLoading) {
      return (
        <View style={{height: 60, flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image source={require('../../../imgs/loading.gif')} style={{width: 26, height: 26}}/>
        </View>
      )
    }
    // 没有更多
    let cHeight = employeeList.length * 80 - height;
    return (
      <View style={{height: 90, width: width, justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: cHeight >= 0 ? -90 : cHeight - 45}}>
        <Text style={{fontSize: styleConsts.H4, color: styleConsts.middleGrey}}>
          {I18n.t('noMoreData')}
        </Text>
      </View>
    );
  };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey,
  },
  item: {
    width: width - 20,
    height: 80,
    backgroundColor: styleConsts.white,
    flexDirection: 'row',
    borderRadius: 5,
  },
  headerImg: {
    width: 80,
    height: 80,
    marginRight: 10,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
  },
  itemRight: {
    marginTop: 12,
  },
  rowWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  administorWrapper: {
    width: 30,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: styleConsts.mainColor,
    marginRight: 7,
    borderRadius: 2,
  },
  administorTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.white,
  },
  employeeName: {
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
  },
  img: {
    width: 10,
    height: 10,
  },
  text: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
    marginLeft: 5,
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
    marginBottom: 17.5,
  },
  secondTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.moreGrey,
  }
});

const mapStateToProps = (state) => {
  return {
    $employeeInfo: state.employeeInfo,
    $user: state.user,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    // 获取员工列表
    fetchEmployeeList: (opts) => {
      dispatch(fetchEmployeeListAC(opts));
    },
    // 添加/编辑员工信息
    navToAddEditEmployee: (opts) => {
      dispatch({type: NAV_TO_ADD_OR_EDIT_EMPLOYEE, payload: opts});
    },
    // 删除员工
    deleteEmployee: (opts) => {
      dispatch(deleteEmployeeAC(opts));
    },
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(EmployeeManagment)
