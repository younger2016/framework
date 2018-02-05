/**
 * Created by chenshuang on 2017/8/7.
 */

import React, { Component, PropTypes } from 'react';
import { View, Text, StyleSheet, Image,  TouchableWithoutFeedback, FlatList} from 'react-native';
import { styleConsts } from '../../../../utils/styleSheet/styles'
import Dimensions from 'Dimensions';

const { height, width } = Dimensions.get('window');

class BottomLine extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render(){
    let bot = height - 321.5 - 50;
    let bottom = this.props.len * 181 > bot ? -90 : -90 + this.props.len * 181 - bot;
    return(
        <View style={[styles.container, {bottom,}]}>
          <View style={styles.lineContainer}>
            <Text style={styles.line}> </Text>
          </View>
          <View style={styles.tip}>
            <Text  style={styles.tipText}>甭拽了,见底儿啦</Text>
          </View>
          <View style={styles.lineContainer}>
            <Text style={styles.line}> </Text>
          </View>
        </View>
    )
  }
}

BottomLine.defaultProps = {

};

BottomLine.PropTypes = {

};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginBottom: 30,
    width: '100%',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    position: 'absolute',
    bottom: -90,
  },
  lineContainer:{
    height: styleConsts.H5,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
  line: {
    width: 100,
    height: styleConsts.sepLine,
    lineHeight: styleConsts.H5,
    backgroundColor: styleConsts.lightGrey
  },
  tip: {
    marginLeft: 10,
    marginRight: 10
  },
  tipText: {
    fontSize: styleConsts.H5,
    color: styleConsts.middleGrey
  }
});
export default BottomLine;
