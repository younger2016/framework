/**
 * 删除提示框
 */
import React, { Component } from 'react';
import { StyleSheet, View, Text, Modal, TouchableWithoutFeedback } from 'react-native';
import { styleConsts } from '../../utils/styleSheet/styles';

export default class DeleteModal extends Component{
  constructor(props){
    super(props);
    this.state = {
      visible: false
    };
  }
  componentDidMount(){
    this.setState({
      visible: this.props.visible
    })
  }
  componentWillReceiveProps(nextProps){
    if(this.props.visible !== nextProps.visible){
      this.setState({
        visible: nextProps.visible
      })
    }
  }
  render() {
    return (
      <Modal visible={this.state.visible} transparent={true} onRequestClose={() => {}}>
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.title}>{this.props.title}</Text>
            <View style={styles.tipWrapper}>
              <Text style={styles.tipTxt} numberOfLines={2}>{this.props.tipTxt}</Text>
            </View>
            <View>
              <View style={styles.btnWrapper}>
                <TouchableWithoutFeedback onPress={() => {this.props.leftBtnCallBack()}}>
                  <View style={styles.leftBtnWrapper}>
                    <Text style={styles.leftBtnText}>{this.props.leftBtnTxt}</Text>
                  </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback onPress={() => {this.props.rightBtnCallBack()}}>
                  <View style={[styles.leftBtnWrapper,{ marginLeft: 10,}]}>
                    <Text style={[styles.leftBtnText, { color: styleConsts.mainColor, }]}>{this.props.rightBtnTxt}</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    )
  }
}
const styles = StyleSheet.create({
  modalBg: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalBox: {
    width: 275,
    height: 150,
    backgroundColor: styleConsts.white,
    borderRadius: 5,
    marginTop: 258,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: styleConsts.H2,
    color: styleConsts.mainColor,
  },
  tipWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  tipTxt: {
    fontSize: styleConsts.H4,
    color: styleConsts.grey,
    lineHeight: 20,
  },
  btnWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  leftBtnWrapper: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftBtnText: {
    fontSize: styleConsts.H3,
    color: styleConsts.grey,
  },
});
