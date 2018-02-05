/*eslint linebreak-style: ["error", "windows"] */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 import React, { Component } from 'react';
 import {
   AppRegistry,
 } from 'react-native'
 import Root from './app/index'

 export default class HllMallApp extends Component {
   render() {
     return (
       <Root />
     );
   }
 }

AppRegistry.registerComponent('hll_mall_app', () => HllMallApp);
