/**
 * 首页和分类页头部搜索框
 */
import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, TextInput, PixelRatio, StatusBar, Platform} from 'react-native';
import { connect } from 'react-redux';
import { styleConsts } from '../../utils/styleSheet/styles'
import {
    NAV_TO_SEARCH_SCENE,
} from '../../redux/actions/nav.action';

class HeaderSearchBtn extends Component{
  constructor(props) {
    super(props);
    this.state = {
      opacity: 0
    };
    this.onSearchPress = this.onSearchPress.bind(this);
  }
  componentDidMount(){
    this.setState({
      opacity: this.props.opacity
    })
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.opacity !== this.props.opacity){
      this.setState({
        opacity: nextProps.opacity
      })
    }
    if(nextProps.$route.routes.length <= 1 && nextProps.$tabNav.toJS().index === 0){
      this.state.opacity === 0 && StatusBar.setBarStyle('light-content');
      this.state.opacity !== 0 && StatusBar.setBarStyle('dark-content');
      Platform.OS === 'android' && StatusBar.setBackgroundColor('rgba(0,0,0,0)');
    } else{
      StatusBar.setBarStyle('dark-content');
    }
  }
  render() {
    return (
      <View style={
        [styles.searchTop,
          {
            backgroundColor: `rgba(255, 255, 255, ${this.state.opacity})`,
            borderColor: `rgba(221, 221, 221, ${this.state.opacity})`,
          }
        ]}
      >
        <StatusBar
          barStyle={ this.state.opacity === 0 ? 'light-content' : 'dark-content' }
          backgroundColor={'rgba(0,0,0,0)'}
          translucent={true}
        />
        <TouchableWithoutFeedback onPress={this.onSearchPress}>
          <View style={[styles.searchCenter, this.state.opacity !== 0 && {backgroundColor: `rgba(238, 238, 238, ${this.state.opacity})`}]}>
            <View style={styles.searchCenterBox}>
              <Image style={styles.searchImg} source={require('./imgs/search.png')} />
              <Text style={[
                  styles.inputBar,
                  Platform.OS === 'ios' ? {lineHeight: 30,} : {textAlignVertical: 'center',},
                ]}>
                {'客官~你想买点什么'}
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    )
  }

  onSearchPress(){
    this.props.navToSearch();
  }
}

HeaderSearchBtn.PropTypes = {
  opacity: 0
};

HeaderSearchBtn.defaultProps = {
  opacity: React.PropTypes.number
};

const styles = StyleSheet.create({
  searchTop: {
    height: styleConsts.headerHeight,
    paddingTop: styleConsts.headerPaddingTop,
    padding: styleConsts.screenLeft,
    paddingBottom: 0,
    position: 'relative',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  inputBar: {
    height: 30 ,
    padding: 0,
    textAlign: 'left',
    color: styleConsts.middleGrey,
    fontSize: styleConsts.H4,
  },
  searchCenter: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    borderRadius: 16,
  },
  searchCenterBox:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchImg: {
    width: 16,
    height: 16,
    marginRight: 10,
    tintColor: styleConsts.middleGrey,
  }
});

const mapStateToProps = (state) => {
  return {
    $tabNav: state.tabNav,
    $route: state.nav,
  }
};
const mapDispatchToProps = (dispatch) => {
  return {
    navToSearch: ()=>{
      dispatch({type: NAV_TO_SEARCH_SCENE})
    }
  }
};
export default connect(mapStateToProps, mapDispatchToProps)(HeaderSearchBtn)
