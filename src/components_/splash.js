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
        }
      };
  }

  constructor(props){
    super(props);
  }
  componentDidMount() {
    if (Platform.OS === 'android') {
      Linking.getInitialURL().then(url => {
        // this.navigate(url);
        console.log('Navigate url componentDidMount ------> ' + url);
        this.navigate(url);
      });
    } else {
        Linking.addEventListener('url', this.handleOpenURL);
    }
  }
  componentWillUnmount() { // C
      Linking.removeEventListener('url', this.handleOpenURL);
  }
  handleOpenURL = (event) => { // D
      console.log('Navigate url handleOpenURL ------> ' + event.url);
      this.navigate(url);
  }
  navigate = (url) => { // E
      // console.log('Navigate url ------> ' + url);
      const route = url.replace(/.*?:\/\//g, '');
      const id = route.match(/\/([^\/]+)\/?$/)[1];
      var routeArr = route.split('/');

      // console.log('navigate routeName length------> ' + routeArr.length);
      for(var i = 0 ; i < routeArr.length ; i++){
        console.log('navigate routeName ------> ' + routeArr[i]);
      }

      if(routeArr[1] === 'feedback'){
        // give-feedback url
        Navigation.push(this.props.componentId, {
          component: {
            name: 'home',
            passProps:{
              from:'deeplink',
              token:routeArr[2],
            }
          }
        });
      }else if(routeArr[1] === 'token' || routeArr[1] === 'submit-feedback'){
        // re-send past request url OR get-feedback url
        Navigation.push(this.props.componentId, {
          component: {
            name: 'giveFeedback',
            passProps: {
              from:'deeplink',
              personName:'',
              token:routeArr[2],
            },
          }
        });
      }else if(url == null){
        var that = this;
        AsyncStorage.getItem('@AccessToken')
          .then(token => {
            var screenName = 'terms';
            if(token == null){
              screenName = 'terms';
            }else{
              screenName = 'home';
            }
            setTimeout(function() {
              Navigation.push(that.props.componentId, {
                component: {
                  name: screenName,
                  options: {
                    topBar: {
                      drawBehind: true,
                      visible: false,
                      animate: false
                    }
                  }
                }
              });
            }, 500);
          })
        .catch(error => console.log(error));
      }
  }

  render(){
      return (
        <View style={{ flex: 1,backgroundColor: '#fff',alignItems: 'center',justifyContent:'center' }}>
            <Image style={{width: 250, height: 400}} source={headerlogo} resizeMode="contain" />
        </View>
      );
  }
}
module.exports = splash;
