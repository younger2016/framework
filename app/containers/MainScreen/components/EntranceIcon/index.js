/*eslint linebreak-style: ["error", "windows"] */
/**
*首页，图标列表展示
*/
import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, Image,  TouchableWithoutFeedback, TextInput, PixelRatio} from 'react-native';
import { connect } from 'react-redux';
import { styleConsts } from '../../../../utils/styleSheet/styles'
import iconListData from './data';//小图标列表假数据

import {
  NAV_TO_LOGIN_SCENE,
} from '../../../../redux/actions/nav.action';

class IconListRender extends Component {
  constructor(props) {
    super(props);
    this.state = {
      disabled: false
    };
  }

  componentDidMount(){

  }
  render() {
    return (
        <View style={styles.iconList}>
        {
          iconListData.map((item, idx)=>{
            item.key = idx ;
            return (
                <TouchableWithoutFeedback disabled={this.state.disabled} key={item.key} onPress={()=>{
                  this.goToSomeWhere(item.nav)
                }}>
                  <View style={styles.iconInfo} >
                    <Image source = {item.imgurl} style={styles.iconImg} />
                    <Text style={styles.iconTitle}>{item.title}</Text>
                  </View>
                </TouchableWithoutFeedback>
            )

          })
        }
      </View>

    )
  }

  goToSomeWhere = (nav) => {
    if( !this.props.user.get('token') || this.props.user.get('token') === ''){
      return this.props.goToSomeWhere({type: NAV_TO_LOGIN_SCENE, payload: nav})
    }
    this.props.goToSomeWhere(nav);
  }
}

//props标准
IconListRender.PropTypes = {
};

IconListRender.defaultProps = {
};

const styles = StyleSheet.create({
  iconList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  iconInfo: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 11,
  },
  iconImg: {
    width:40,
    height:40,
  },
  iconTitle: {
    paddingBottom: 8,
    paddingTop: 9.5,
    fontSize: styleConsts.H4,
    color: styleConsts.darkGrey
  }
})

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    goToSomeWhere : (opts)=>{
      dispatch(opts);
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(IconListRender)
