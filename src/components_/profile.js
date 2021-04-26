import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,TextInput,Alert,
  View,Image,Button,TouchableHighlight,ScrollView,AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import DeviceInfo from 'react-native-device-info';
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay';
import FCM, {NotificationType} from 'react-native-fcm';
import { registerKilledListener, registerAppListener } from "../constant/listeners";
import {appName,headerHeight,headerBackColor,headerlogo,headerLeftMenuSize,checkIphoneX} from '../constant/const';
import Api from '../Api/Api';

var circle_size = 65;
var circle_icon_size = 30;
var access_token = '';
var gender_data = '';
var notif_data = '';

registerKilledListener();

class profile extends Component {

  static options(passProps) {
      return {
        topBar: {
          drawBehind: true,
          visible: false,
          animate: false
        },
        sideMenu: {
            left: {
                enabled: false, // hide drawer for this screen
            }
        }
      };
  }

  constructor(props){
    super(props);
    this.state={
      name : '',
      female_img : require('../img/female.png'),
      female_back : '#f5f5f5',
      male_img : require('../img/male.png'),
      male_back : '#f5f5f5',
      notif_on_back:'#f5f5f5',
      notif_off_back:'#f5f5f5',
      notif_on: require('../img/notif_on.png'),
      notif_off: require('../img/notif_off.png'),
      isFromEdit : false,
      titleText : 'SET YOUR PROFILE',
      topbarTopMargin:0,
    }
  }

  componentDidMount() {
    this.setState({topbarTopMargin:checkIphoneX()});
    if(this.props.from == 'edit'){
      this.setState({isFromEdit : true,titleText : 'EDIT YOUR PROFILE',});
      this.getUserProfileData();
    }else{
      this.setState({isFromEdit : false,titleText : 'SET YOUR PROFILE',});
    }
  }
  async fnGetFCMToken(){
    registerAppListener(this.props.navigator);
    FCM.getInitialNotification().then(notif => {
      console.log("notif -- open ** " + notif + " -- " + JSON.stringify(notif));
      this.setState({
        initNotif: notif
      });
    });
    try {
      let result = FCM.requestPermissions({
        badge: false,
        sound: true,
        alert: true
      });
    } catch (e) {
      console.error('error - '+e);
    }

    FCM.getFCMToken().then(token => {
      console.log("notif ---- TOKEN (getFCMToken) NOTIFICATION**>>> ", token);
      access_token = token;
      this.sendUserDataOnServer();
      try {
        AsyncStorage.setItem('@AccessToken', token);
      } catch (error) {
        // alert('error - ' + error);
      }
    });
  }
  getUserProfileData(){
    this._modalLoadingSpinnerOverLay.show();
    Api.getUserProfile(this, DeviceInfo.getUniqueID(), function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
            console.log('------ getUserProfile response >>> '+JSON.stringify(data));
            parent.setState({name : data.data.name});
            if(data.data.gender == "f"){
              parent.onFemaleSelect();
            }else{
              parent.onMaleSelect();
            }
            if(data.data.should_be_notified == 1){
              parent.onNotificationON();
            }else{
              parent.onNotificationOFF();
            }
        }
    });
  }

  onBackClick(){
    Navigation.pop(this.props.componentId);
  }

  onFemaleSelect(){
    this.setState({
      female_img : require('../img/female_selected.png'),
      female_back : '#fff0f5',
      male_img : require('../img/male.png'),
      male_back : '#f5f5f5',
    });
    gender_data = 'f';
  }
  onMaleSelect(){
    this.setState({
      female_img : require('../img/female.png'),
      female_back : '#f5f5f5',
      male_img : require('../img/male_selected.png'),
      male_back : '#eff6ff',
    });
    gender_data = 'm';
  }

  onNotificationON(){
    this.setState({notif_on_back:'#e6f7f6',notif_off_back:'#f5f5f5',
        notif_on: require('../img/notif_on_selected.png'),
        notif_off: require('../img/notif_off.png')});
    notif_data = 'selected';
  }
  onNotificationOFF(){
    this.setState({notif_on_back:'#f5f5f5',notif_off_back:'#e6f7f6',
        notif_on: require('../img/notif_on.png'),
        notif_off: require('../img/notif_off_selected.png')});
    notif_data = 'not_selected';
  }

  onNextClick(){
    if(this.state.name != '' && gender_data != '' && notif_data != ''){
      AsyncStorage.getItem('@AccessToken')
        .then(token => {
          if(token == null){
            this.fnGetFCMToken();
          }else{
            access_token = token;
            console.log("notif ---- @AccessToken>>> ", access_token);
            this.sendUserDataOnServer();
          }
        })
      .catch(error => console.log(error));
    }else{
      Alert.alert(appName,'Please fill all information!');
      console.log('------ profile data >>> '+ this.state.name +' - '+ gender_data +' - '+ notif_data );
    }
  }
  sendUserDataOnServer(){
    this._modalLoadingSpinnerOverLay.show();
    var notif_data_api = 0;
    if(notif_data == 'selected'){
      notif_data_api = 1;
    }
    Api.saveUserProfile(this, this.state.name, DeviceInfo.getUniqueID(), access_token, gender_data, notif_data_api, function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
            console.log('------ profile response >>> '+JSON.stringify(data));
            Navigation.push(parent.props.componentId, {
              component: {
                name: 'home',
                passProps: {
                  display:'home',
                },
                options: {
                  topBar: {
                    drawBehind: true,
                    visible: false,
                    animate: false
                  }
                }
              }
            });
        }
    });
  }
  onSubmitClick(){
    // alert((this.state.name != '') + ' -- ' + (gender_data != '') + ' -- ' + (notif_data != '') + ' -- ' + notif_data);
    if(this.state.name != '' && gender_data != '' && notif_data != ''){
      this._modalLoadingSpinnerOverLay.show();
      var notif_data_api = 0;
      if(notif_data == 'selected'){
        notif_data_api = 1;
      }
      Api.editUserProfile(this, this.state.name, DeviceInfo.getUniqueID(), gender_data, notif_data_api, function(parent, data){
          parent._modalLoadingSpinnerOverLay.hide();
          if(data.error == '1'){

          }else{
              console.log('------ profile response >>> '+JSON.stringify(data));
              Alert.alert(appName,'Profile data saved successfully!');
              setTimeout(function(){
                Navigation.pop(parent.props.componentId);
              },1000);
          }
      });
    }else{
      Alert.alert(appName,'Please fill all information!');
      console.log('------ profile data >>> '+ this.state.name +' - '+ gender_data +' - '+ notif_data );
    }
  }

  render(){
      return (
        <View style={{flex: 1,backgroundColor: '#fff',flexDirection:'column'}}>
          {/*--------header--------*/}
          <LoadingSpinnerOverlay style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} ref={ component => this._modalLoadingSpinnerOverLay = component } />
          {this.state.isFromEdit ?
            <View style={{marginTop:this.state.topbarTopMargin,height:headerHeight,backgroundColor:headerBackColor,flexDirection:'row',paddingLeft:16,paddingRight:16}}>
                {/*left*/}
                <TouchableHighlight style={{flex: 0.1,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}} underlayColor='transparent' onPress={() => { this.onBackClick(); }}>
                  <Image style={{width: headerLeftMenuSize, height: headerLeftMenuSize}} source={require('../img/back.png')} resizeMode="contain" />
                </TouchableHighlight>
                {/*center*/}
                <View style={{flex: 0.8,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
                  <Image style={{width: 150, height: 56}} source={headerlogo} resizeMode="contain" />
                </View>
                {/*right*/}
                <View style={{flex: 0.1}}/>
            </View>
            :
            <View style={{marginTop:this.state.topbarTopMargin,flex:0.2}}>
                <View style={{flex:0.1}}/>
                <View style={{flex:0.1,paddingLeft:32,paddingRight:32,backgroundColor:'transparent'}}>
                    <Image style={{width: 150, height: 56}} source={headerlogo} resizeMode="contain" />
                </View>
            </View>
          }
          <View style={{flex:0.1,paddingLeft:32,paddingRight:32,backgroundColor:'transparent'}}>
              <Text style={{color: "#000",fontSize:25,fontWeight:'bold'}}>{this.state.titleText}</Text>
          </View>
          {/*------------Name-------------*/}
          <View style={{flex:0.2,flexDirection:'column',paddingLeft:32,paddingRight:32,backgroundColor:'transparent'}}>
              <Text style={{flex:0.3,color: "#909090",fontSize:18}}>Name</Text>
              <TextInput
                style={{flex:0.3,color:'#000',fontSize:20}}
                onChangeText={(name) => this.setState({name})}
                value={this.state.name}
                placeholder={'enter name'}
              />
              <View style={{flex:0.04,flexDirection:'row',backgroundColor:'transparent'}}>
                <View style={{flex:0.33,backgroundColor:'#f2473f'}}/>
                <View style={{flex:0.33,backgroundColor:'#4ec5c1'}}/>
                <View style={{flex:0.33,backgroundColor:'#f3d471'}}/>
              </View>
          </View>
          {/*------------Gender-------------*/}
          <View style={{flex:0.2,flexDirection:'column',paddingLeft:32,paddingRight:32,backgroundColor:'transparent'}}>
              <Text style={{flex:0.2,color: "#515151",fontSize:18}}>Gender Preference:</Text>
              <View style={{flex:0.3,flexDirection:'row',backgroundColor:'transparent',marginTop:8}}>
                <TouchableHighlight style={{width: circle_size, height: circle_size,padding:8,borderRadius:50,backgroundColor:this.state.female_back,alignItems:'center',justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onFemaleSelect(); }}>
                     <Image style={{width: circle_icon_size, height: circle_icon_size}} source={this.state.female_img} resizeMode="contain" />
                </TouchableHighlight>
                <View style={{flex:0.05}}/>
                <TouchableHighlight style={{width: circle_size, height: circle_size,padding:8,borderRadius:50,backgroundColor:this.state.male_back,alignItems:'center',justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onMaleSelect(); }}>
                     <Image style={{width: circle_icon_size, height: circle_icon_size}} source={this.state.male_img} resizeMode="contain" />
                </TouchableHighlight>
              </View>
          </View>
          {/*------------Notification-------------*/}
          <View style={{flex:0.2,flexDirection:'column',paddingLeft:32,paddingRight:32,backgroundColor:'transparent'}}>
              <Text style={{flex:0.2,color: "#515151",fontSize:18}}>Notification:</Text>
              <View style={{flex:0.3,flexDirection:'row',backgroundColor:'transparent',marginTop:8}}>
                <TouchableHighlight style={{width: circle_size, height: circle_size,padding:8,borderRadius:50,backgroundColor:this.state.notif_on_back,alignItems:'center',justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onNotificationON(); }}>
                     <Image style={{width: circle_icon_size, height: circle_icon_size}} source={this.state.notif_on} resizeMode="contain" />
                </TouchableHighlight>
                <View style={{flex:0.05}}/>
                <TouchableHighlight style={{width: circle_size, height: circle_size,padding:8,borderRadius:50,backgroundColor:this.state.notif_off_back,alignItems:'center',justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onNotificationOFF(); }}>
                     <Image style={{width: circle_icon_size, height: circle_icon_size}} source={this.state.notif_off} resizeMode="contain" />
                </TouchableHighlight>
              </View>
          </View>
          {/*------------Next button-------------*/}
          <View style={{flex:0.2,paddingLeft:32,paddingRight:32,justifyContent:'center',alignItems:'center'}}>
            {this.state.isFromEdit ?
              <TouchableHighlight style={{width: 120, height: 50,padding:8,borderRadius:5,backgroundColor:'#4ec5c1',alignItems:'center',justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onSubmitClick(); }}>
                   <Text style={{color: "#fff",fontSize:20}}>Submit</Text>
              </TouchableHighlight>
              :
              <TouchableHighlight style={{width: 80, height: 60,padding:8,borderRadius:5,backgroundColor:'#4ec5c1',alignItems:'center',justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onNextClick(); }}>
                   <Image style={{width: circle_icon_size, height: circle_icon_size}} source={require('../img/next.png')} resizeMode="contain" />
              </TouchableHighlight>
            }
          </View>

        </View>
      );
  }
}
module.exports = profile;
