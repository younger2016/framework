import React, {
  Component,
} from 'react';
import {
  ScrollView,
} from 'react-native';
export default class PullScrollView extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };

  }

  render() {
    return  <ScrollView
            ref="_scrollViewInside"
            {...this.props}
            >
            {this.props.children}
            </ScrollView>


  }
}
