/**
 * 版本更新提示
 */
import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, Image, Modal, } from 'react-native';
import { styleConsts } from '../../utils/styleSheet/styles';
import { TouchableWithoutFeedbackD } from '../touchBtn'

class UpdateAlert extends Component{
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  componentDidMount(){

  }
  componentWillReceiveProps(nextProps){

  }
  render() {
    const {version, desc=[], mustUpdate, okCallBack = () => {}, cancelCallBack = () => {}} = this.props;
    return (
      <Modal
        animationType={'fade'}
        visible={this.state.visible}
        transparent={true}
        onRequestClose={!mustUpdate ? this.hide : () => {}}
        supportedOrientations={['portrait', 'portrait-upside-down', 'landscape', 'landscape-left', 'landscape-right']}
      >
        <View style={[styles.container, mustUpdate && {paddingBottom: 80}]}>
          <View style={styles.center}>
            <View style={styles.txtBox}>
              <Image style={styles.headerBg} source={require('./imgs/header.png')}/>
              <View style={styles.remindBox}>
                <View style={styles.titleBox}>
                  <Image style={styles.title} source={require('./imgs/title.png')}/>
                </View>
                <View sty={styles.version}>
                  <Text style={styles.versionTxt}>V{version}</Text>
                </View>
                <View style={styles.desBox}>
                  <Text style={styles.remindTitle}>更新内容：</Text>
                  {
                    desc.map((desc, index) => {
                      return <Text key={index} style={styles.remindTxt}>{index + 1}. {desc}</Text>
                    })
                  }
                  <Text style={styles.remindTxtBottom}>新版本更好用！</Text>
                </View>
                <TouchableWithoutFeedbackD delayTime={200} onPress={() => { okCallBack() }}>
                  <View style={styles.updateBtn}>
                    <Text style={styles.updateBtnTxt}>好！立即去更新</Text>
                  </View>
                </TouchableWithoutFeedbackD>
              </View>
              {!mustUpdate && <View style={{alignItems: 'center'}}>
                <Image style={{width: 10.5, height: 35.5}} source={require('./imgs/line.png')}/>
              </View>}
            </View>
            {!mustUpdate && <View style={{alignItems: 'center'}}>
              <TouchableWithoutFeedbackD delayTime={200} onPress={() => {
                this.hide();
                cancelCallBack()
              }}>
                <View style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnTxt}>我就不更新</Text>
                </View>
              </TouchableWithoutFeedbackD>
            </View>}
          </View>
        </View>

      </Modal>
    )
  }

  hide = () => {
    this.hideBack instanceof Function && this.hideBack();
    this.setState({
      visible: false,
    })
  };

  show = (callBack) => {
    this.hideBack = callBack;
    this.setState({
      visible: true,
    })
  }

}


const styles = StyleSheet.create({
  container:{
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center'
  },
  center: {
    width: 250,
  },
  headerBg: {
    width: 240,
    height: 146 * 24 / 25,
    position: 'absolute',
    top: 0,
    left: 5,
    zIndex: 99,
  },
  titleBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: styleConsts.white,
    paddingTop: 30,
    paddingBottom: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  title: {
    width: 150,
    height: 15,
    tintColor: styleConsts.mainColor,
  },
  txtBox: {
    paddingTop: 146 * 24 / 25 - 19,
    position: 'relative',
  },
  version: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  versionTxt: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
    textAlign: 'center',
  },
  desBox: {
    paddingLeft: 17.5,
    paddingRight: 17.5,
  },
  remindBox: {
    backgroundColor: styleConsts.white,
    borderRadius: 5,
  },
  remindTxt: {
    lineHeight: 18,
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
  },
  remindTitle: {
    fontSize: styleConsts.H4,
    color: styleConsts.deepGrey,
    marginBottom: 10,
    marginTop: 12,
  },
  remindTxtBottom: {
    fontSize: styleConsts.H5,
    color: styleConsts.grey,
    marginTop: 15,
  },
  updateBtn: {
    padding: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateBtnTxt: {
    fontSize: styleConsts.H3,
    color: styleConsts.mainColor,
    textAlign: 'center',
  },
  cancelBtn: {
    height: 34,
    paddingLeft: 15,
    paddingRight: 15,
    borderColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnTxt: {
    fontSize: styleConsts.H3,
    color: '#fff',
  },
});

UpdateAlert.PropTypes = {

};
UpdateAlert.defaultProps = {

};
export default UpdateAlert
