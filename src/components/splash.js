import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,Linking,
  View,Image,Button,TouchableHighlight,ScrollView,AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import {headerlogo} from '../constant/const';

class splash extends Component {

  static options(passProps) {
      return {
        topBar: {
          drawBehind: true,
          visible: false,
          animate: false
        },
        statusBar: {
          backgroundColor: '#004587',
          drawBehind: true,
        },
      };
  }

  constructor(props){
    super(props);
  }
  componentDidMount() {
    var that = this;
    AsyncStorage.getItem('@AccessToken')
      .then(token => {
        var screenName = 'login';
        if(token == null){
          screenName = 'login';
        }else{
          screenName = 'home';
        }
        setTimeout(function() {
          Navigation.setStackRoot(that.props.componentId, {
            component: {
              name: screenName,
            }
          });
        }, 500);
      })
    .catch(error => console.log(error));
  }

  render(){
      return (
        <View style={{ flex: 1,backgroundColor: '#0054a4',alignItems: 'center',justifyContent:'center' }}>
            <Image style={{width: 250, height: 400}} source={headerlogo} resizeMode="contain" />
        </View>
      );
  }
}
module.exports = splash;
