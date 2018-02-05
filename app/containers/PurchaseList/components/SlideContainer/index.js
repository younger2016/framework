import React, { Component } from 'react';
import { StyleSheet, View, Text, Modal, TouchableWithoutFeedback,Animated,PanResponder } from 'react-native';
import Dimensions from 'Dimensions'

const {width, height} = Dimensions.get('window')
console.log('width',width)
export default class SlideContainer extends React.Component{
  constructor(props){
    super(props)
    this.state={
      left:new Animated.Value(width),
      opacity:new Animated.Value(1),
    }
  }

  show=()=>{
    Animated.parallel([
      Animated.timing(
        this.state.left,
        {
          toValue: 0,
          duration:200,
        }
      ).start(),
    ])
  }

  push=(left)=>{
    console.log('left',left)
    Animated.parallel([
      Animated.timing(
        this.state.left,
        {
          toValue: left,
          duration:0,
        }
      ).start(),
      Animated.timing(
        this.state.opacity,
        {
          toValue: 0,
          duration:0,
        }
      ).start(),
    ])
  }

  hide=()=>{
    Animated.parallel([
      Animated.timing(
        this.state.left,
        {
          toValue: width,
          duration:200,
        }
      ).start(),
    ])
  }


  //props是该组件传给子组件的参数
  customComponent=(props)=>{
  }





  onPanResponderMove=(evt,gestureState)=>{
    console.log('parent move')
    if(gestureState.dx>0.5){
      this.push(gestureState.dx)
    }
  }

  onPanResponderRelease=(evt,gestureState)=>{
    console.log('vx',gestureState.vx)
    if(gestureState.dx>(width/3)){
      this.hide()
    }else{
      this.show()
    }
  }


  onMoveShouldSetResponder=(evt,gestureState)=>{
    if(gestureState.dx>0.5){
      console.log('father-true----')
      return true
    }else{
      console.log('father-false----')
      return false
    }
  }

  componentWillMount(){
    this._panResponder = PanResponder.create({
      onMoveShouldSetPanResponder:this.onMoveShouldSetResponder,
      onPanResponderMove:this.onPanResponderMove,
      onPanResponderRelease:this.onPanResponderRelease,
    })
  }
  render(){
    let {left,opacity,}=this.state
    return(
      <Animated.View style={[styles.container,{left:left}]}
                     {...this._panResponder.panHandlers}
      >
        <View style={styles.content}>
            <View style={[styles.leftContainer,{width:width-this.props.width,backgroundColor:'rgba(0,0,0,0)'}]}>

            </View>
            <View style={[styles.rightContainer,{width:this.props.width}]}>
              {this.customComponent({hideSlide:this.hide})}
            </View>
          </View>
      </Animated.View>
    )
  }
}


SlideContainer.defaultProps = {
  width:300,
};


const styles=StyleSheet.create({
  container:{
    flex:1,
    position:'absolute',
    top:0,
    bottom:0,
    width:width,
  },
  content:{
    flex:1,
    flexDirection:'row',
    width:width,
    backgroundColor:'rgba(0,0,0,0.2)'
  },
  leftContainer:{

  },
  rightContainer:{
    backgroundColor:'rgba(0,0,0,0.)'
  }
})