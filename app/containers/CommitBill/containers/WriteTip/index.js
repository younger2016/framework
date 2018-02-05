/**
 * Created by chenshuang on 2017/8/7.
 */

import React from 'react'
import { View, TextInput, Image, PixelRatio, StyleSheet, TouchableWithoutFeedback, ScrollView } from 'react-native'
import { connect } from 'react-redux'
import { styleConsts } from '../../../../utils/styleSheet/styles';
import  I18n  from 'react-native-i18n'
import HeaderBar from '../../../../components/HeaderBar'

export class WriteTip extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      tip: ''
    }
  }
  componentDidMount(){
    this.setState({
      tip: this.props.navigation.state.params.value
    })
  }

  componentWillReceiveProps(nextProps){

  }
  render(){
    return (
        <View style={styles.container}>
          <HeaderBar
            rightText={'保存'}
            navigation={this.props.navigation}
            title={this.props.navigation.state.params.title}
            cancelCallback = {this.save}
          />
          <ScrollView scrollEnabled={false}>
            <View style={styles.whiteBox}>
              <TextInput
                textAlignVertical="top"
                autoFocus={true}
                value = {this.state.tip}
                multiline={true}
                placeholder={'请输入备注信息'}
                style={styles.inputBox}
                underlineColorAndroid="transparent"
                selectionColor={styleConsts.mainColor}
                onChangeText={(val)=>{
                  this.setState({tip: val })
                }}
              />
            </View>

          </ScrollView>
        </View>
    )
  }
  save = () => {
    this.props.navigation.state.params.getTip(this.state.tip);
    this.props.navigation.goBack()
  }
}

WriteTip.defaultProps = {

};

WriteTip.PropsType = {

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: styleConsts.bgGrey
  },
  whiteBox: {
    height: 150,
    padding: 15,
    backgroundColor: styleConsts.white
  },
  inputBox: {
    flex: 1,
    borderColor: styleConsts.lightGrey,
    borderWidth: 1,
    fontSize: styleConsts.H3,
    color: styleConsts.deepGrey,
    padding: 5
  }
});

const mapStateToProps = (state) => {
  return {

  }
};

const mapDispatchToProps = (dispatch) => {
  return {

  }
};


export default connect(mapStateToProps, mapDispatchToProps)(WriteTip)

