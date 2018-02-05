/**
 * Created by chenshuang on 2017/8/22.
 */
import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, Image, TouchableWithoutFeedback, TextInput, PixelRatio, Modal} from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons'

import { styleConsts } from '../../utils/styleSheet/styles'
import {
    NAV_TO_SEARCH_SCENE,
} from '../../redux/actions/nav.action';

class DropDownList extends Component{
  constructor(props) {
    super(props);
    this.state = {
      current: 0,
      visible: false
    };
  }

  componentDidMount(){

  }
  componentWillReceiveProps(nextProps){

  }
  render() {
    return (
        <View style={[styles.container, this.props.style]}>
          <TouchableWithoutFeedback onPress={this.toggleShowList} >
            <View style={[styles.flex, {justifyContent: 'center'}]}>
              <Text style={[styles.selectedTxtStyle, this.props.selectedTxtStyle]}>
                {
                  this.props.data.find((item)=> item.value === this.state.current) &&
                  this.props.data.find((item)=> item.value === this.state.current)[this.props.labelName] ||
                  this.props.data[0][this.props.labelName]
                }
              </Text>
              {this.props.showIcon}
            </View>
          </TouchableWithoutFeedback>

            <Modal
              visible={this.state.visible}
              transparent={true}
              onRequestClose={ () => {}}
            >
              <TouchableWithoutFeedback onPress={this.hide}>
                <View style={{flex: 1}}>
                  <View style = {[styles.listModal, this.props.listModal]}>
                    {this.renderList()}
                    <View style={styles.sanjiao}/>
                  </View>
                </View>
              </TouchableWithoutFeedback>

            </Modal>

        </View>
    )
  }
  renderList = () =>{
    return this.props.data.map((item, index)=>{
      return(
          <TouchableWithoutFeedback onPress={() => this.onSelected(item.value)} key={`${item.value}`}>
            <View style={[styles.itemStyle, this.props.itemStyle, index === 0 && { borderTopWidth: 0}]}>
              <Text style={[styles.itemTxtStyle, this.props.itemTxtStyle,]}>
                {item[this.props.labelName]}
              </Text>
            </View>
          </TouchableWithoutFeedback>
      )
    });
  };


  toggleShowList = () =>{
    this.setState({
      visible: !this.state.visible
    })
  };


  hide = () =>{

    if(this.state.visible){
      this.setState({
        visible: false
      })
    }
  };

  onSelected = (val) =>{
    this.setState({
      current: val,
      visible: false
    }, this.props.onChange(val))
  }
}


const styles = StyleSheet.create({
  container:{
    position: 'relative',
    width: 50,
    marginHorizontal: 10
  },
  itemStyle: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 1
  },
  itemTxtStyle:{
    color: styleConsts.white,
    fontSize: styleConsts.H4,
  },
  listModal: {
    top: 60,
    left: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    position: 'relative',
    borderRadius: 3,
    width: 80,
  },
  selectedTxtStyle: {
    textAlign: 'center',
    fontSize: styleConsts.H4,
    color: styleConsts.darkGrey,
    marginRight: 5,
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sanjiao: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    borderRightWidth: 4,
    borderRightColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0, 0, 0, 0.4)',
    position: 'absolute',
    top: -4,
    left: 5,
  }
});

DropDownList.PropTypes = {
  style: View.propTypes.style,
  itemStyle: View.propTypes.style,
  selectedTxtStyle: View.propTypes.style,
  itemTxtStyle: View.propTypes.style,
  listModal: View.propTypes.style,
  data: React.PropTypes.array,
  labelName: React.PropTypes.string,
  showIcon: React.PropTypes.element,
  onChange: PropTypes.func,
};

DropDownList.defaultProps = {
  style: styles.container,
  itemStyle: styles.itemStyle,
  selectedTxtStyle: styles.selectedTxtStyle,
  itemTxtStyle: styles.itemTxtStyle,
  listModal: styles.listModal,
  data: [],
  labelName: 'label',
  onChange: () => {},
  showIcon: <Icon name={'md-arrow-dropdown'} size={10} />,
};

const mapStateToProps = (state) => {
  return {

  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    search: ()=>{
      dispatch({type: NAV_TO_SEARCH_SCENE})
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(DropDownList)
