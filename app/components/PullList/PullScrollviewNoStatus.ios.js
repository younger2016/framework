import React, {
  Component,
} from 'react';
import {
  ScrollView,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
export default class PullScrollviewNoStatus extends Component {

  constructor(props) {
    super(props);
    this.state = {

    };

  }

  render() {
    return  <KeyboardAwareScrollView
            ref="_scrollViewInside"
            {...this.props}
            >
            {this.props.children}
            </KeyboardAwareScrollView>


  }
}
