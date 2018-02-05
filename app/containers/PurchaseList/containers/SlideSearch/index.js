import React, { Component } from 'react';
import { StyleSheet, View, Text, Modal, TouchableWithoutFeedback,Animated, } from 'react-native';
import Dimensions from 'Dimensions'
import SlideContainer from '../../components/SlideContainer'
import FilterPurchaseList from '../../containers/FilterPurchaseList'
const {width, height} = Dimensions.get('window')

export default class SlideSearch extends SlideContainer{
  constructor(props){
    super(props)
  }

  customComponent=(props)=>{
    return (
      <View style={styles.container}>
          {/*slideProps接收的是侧滑栏组件传递的隐藏函数*/}
          <FilterPurchaseList slideProps={props}/>
      </View>
    )
  }


}



const styles=StyleSheet.create({
  container:{
    flex:1,
  },
})