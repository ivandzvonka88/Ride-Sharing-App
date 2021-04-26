import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,Image,Button,TouchableHighlight,ScrollView,AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import {headerlogo} from '../constant/const';

class sidemenu extends Component {

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
  }

  onEditProfile(){
    Navigation.push('appStack', {
      component: {
        name: 'profile',
        passProps: {
          from:'edit',
        },
      }
    });
    this.closeDrawer();
  }
  onAppInfo(){
    Navigation.push('appStack', {
      component: {
        name: 'info',
        passProps: {
          from:'menu',
        },
      }
    });
    this.closeDrawer();
  }
  closeDrawer(){
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
        left: {
          visible: false
        }
      }
    });
  }

  render(){
      return (
        <View style={{ flex: 1,backgroundColor: '#fff' }}>
          <View style={{flex: 0.2,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
            <Image style={{width: 200, height: 450,alignItems:'center'}} source={headerlogo} resizeMode="contain" />
          </View>
          <View style={{flex: 0.8,flexDirection:'column'}}>
            <TouchableHighlight style={{flex:0.1,padding:16,justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onEditProfile(); }}>
               <Text style={{fontSize: 20,color: '#4ec5c1',padding:16}}>Edit Profile</Text>
            </TouchableHighlight>
            <TouchableHighlight style={{flex:0.1,padding:16,backgroundColor:'transparent',justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onAppInfo(); }}>
               <Text style={{fontSize: 20,color: '#4ec5c1',padding:16}}>App Info</Text>
            </TouchableHighlight>
          </View>
        </View>
      );
  }
}
module.exports = sidemenu;
