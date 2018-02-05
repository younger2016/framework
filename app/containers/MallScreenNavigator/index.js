/*eslint linebreak-style: ["error", "windows"] */
/**
 * @Author: Xiao Feng Wang  <xf>
 * @Date:   2017-07-20T14:43:05+08:00
 * @Email:  wangxiaofeng@hualala.com
 * @Filename: index.jsx
 * @Last modified by:   xf
 * @Last modified time: 2017-09-23T16:26:01+08:00
 * @Copyright: Copyright(c) 2017-present Hualala Co.,Ltd.
 */

import React from 'react'
import { TabNavigator,StackNavigator, addNavigationHelpers} from 'react-navigation'
import { View, Text, Button, Image, PixelRatio, StyleSheet } from 'react-native'
import { connect } from 'react-redux'
import MainScreen from '../MainScreen'
import Cart from '../Cart'
import User from '../User'
import Category from '../Category'
import tabDataIcon from './config'//图片资源
import  I18n  from 'react-native-i18n'
import { styleConsts } from '../../utils/styleSheet/styles';
import Platform from 'Platform';
import { GET_UPDATE_VERSION } from '../../config/config.staging';
import { CHANGE_APP_VERSION } from '../../redux/actions/user.action';

//在此处同意添加底部Icon,并设置效果
const setTabIcon = (imgData, open) =>{
  const tabBarLabel = I18n.t(imgData.title) ;
  const tabBarIcon = (({tintColor, focused})=> {
    return(
      <View style={{position: 'relative', width: 40, height: 20, alignItems: 'center',}}>
        {
          open &&
          <View style={{height: 5, width: 5, backgroundColor: 'red', borderRadius: 2.5, position: 'absolute', right: 2, top: 0}} />
        }
        <Image
          source={ focused ? imgData.url_active : imgData.url}
          style={[{ height: imgData.height, width: imgData.width }, {tintColor: tintColor}]}
        />
    </View>
    )
  });

  return {tabBarLabel, tabBarIcon}
};

// ben
let MallScreenNavigator = TabNavigator({
  MainScreen: {
    screen: MainScreen,
    navigationOptions: ()=> setTabIcon(tabDataIcon.home),
  },
  Category: {
    screen: Category,
    navigationOptions: ()=> setTabIcon(tabDataIcon.category),
  },
  Cart: {
    screen: Cart,
    navigationOptions: ()=> setTabIcon(tabDataIcon.cart),
  },
  User: {
    screen: User,
    navigationOptions: ({screenProps}) => setTabIcon(tabDataIcon.user, screenProps.openUserRemind),
  },
},
  {
    tabBarPosition: 'bottom',
    swipeEnabled: false,
    animationEnabled: false,
    lazy: true,
    backBehavior: 'none',
    tabBarOptions: {
      indicatorStyle: {
        height: 0,
      },
      activeTintColor: styleConsts.mainColor, // label和icon的前景色 活跃状态下（选中）。
      inactiveTintColor: styleConsts.darkGrey, // label和icon的前景色 不活跃状态下(未选中)。
      showIcon: true,
      labelStyle: {
        fontSize:10,
        margin: 0,
      },
      iconStyle:{
        width:40,
        height:25,
        marginTop:6,
        justifyContent: 'center',
        alignItems: 'center',
      },
      tabStyle: {
        padding: 0,
        paddingTop: 0,
      },
      style:{
        backgroundColor: styleConsts.white,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: styleConsts.headerLine,
        padding: 0,
        elevation: Platform.OS === 'ios' ? 8 : 20,
        shadowColor: "black",
        shadowOffset: { height: -1 },
        shadowOpacity: 0.1,
        paddingBottom: Platform.OS === 'ios' ? 6 : 0,
        height: 49,
      }
    }});

class TabNavigatorWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openUserRemind: this.props.$user.get('versionData').toJS().open,  // 提醒用户有更新的标识
    };
  }
  componentDidMount() {
    fetch(GET_UPDATE_VERSION,{ method: 'GET' })
      .then(response => {
        if (response.status >= 200 && response.status < 300) {
          if (response.headers.get("content-type").indexOf('application/json') !== -1) {
            return response.json();
          }
          return response.text();
        }
      })
      .then((response) => {
        if(response){
          // 去设置版本信息
          this.props.dispatch({
            type: CHANGE_APP_VERSION,
            payload: {
              data: response,
            }
          })
        }else{
          throw new Error(`The response is valid`);
        }
      })
      .catch((res) => {
        throw new Error(`The response is bad`);
      })
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      openUserRemind: nextProps.$user.get('versionData').toJS().open,
    })
  }

  render() {
    return <MallScreenNavigator screenProps={{openUserRemind: this.state.openUserRemind}} navigation={addNavigationHelpers({
      dispatch: this.props.dispatch,
      state: this.props.$tabNav.toJS()
    })}/>
  }
}

const mapStateToProps = (state)=>{
  return {
    $tabNav: state.tabNav,
    $user: state.user,
  }
};
export default connect(mapStateToProps)(TabNavigatorWrapper)
// export default TabNavigatorWrapper ///RecentChatsScreen
