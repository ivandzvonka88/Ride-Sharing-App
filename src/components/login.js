import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,Dimensions,Alert,
  Text,Linking,TextInput,StatusBar,KeyboardAvoidingView,
  View,Image,Button,TouchableHighlight,ScrollView,AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay';
import {appName,headerlogo} from '../constant/const';
import Api from '../Api/Api';

var width,height;
var commanWidth,commanHeight;

class login extends Component {

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
    height = Dimensions.get('window').height;
    width = Dimensions.get('window').width;
    super(props);
    this.state={
      username : '',
      password:'',
    }
    commanWidth = width - 45;
    commanHeight = 45;
  }
  componentDidMount() {
    // var that = this;
    // AsyncStorage.getItem('@AccessToken')
    //   .then(token => {
    //     var screenName = 'terms';
    //     if(token == null){
    //       screenName = 'terms';
    //     }else{
    //       screenName = 'home';
    //     }
    //     setTimeout(function() {
    //       Navigation.push(that.props.componentId, {
    //         component: {
    //           name: screenName,
    //           options: {
    //             topBar: {
    //               drawBehind: true,
    //               visible: false,
    //               animate: false
    //             }
    //           }
    //         }
    //       });
    //     }, 500);
    //   })
    // .catch(error => console.log(error));
  }

  onRegister(){
    if(this.state.username != ''){
      if(this.state.password != ''){
        this._modalLoadingSpinnerOverLay.show();
        Api.doLogin(this, this.state.username, this.state.password, function(parent, data){
            parent._modalLoadingSpinnerOverLay.hide();
            if(data.error == '1'){

            }else{
                console.log('------ doLogin response --- '+ JSON.stringify(data));
                if(data.header.status == 200){
                    try {
                      AsyncStorage.setItem('@AccessToken', data.body.user.access_token.toString());
                      AsyncStorage.setItem('@driver_car_id', data.body.user.id_driver_car.toString());
                      AsyncStorage.setItem('@code', data.body.user.code.toString());
                      AsyncStorage.setItem('@user_id', data.body.user.id_user.toString());
                    } catch (error) {
                      // alert('error - ' + error);
                    }
                    Navigation.setStackRoot(parent.props.componentId, {
                      component: {
                        name: 'home',
                        // passProps: {
                        //   code:data.body.user.code,
                        //   driver_car_id:data.body.user.id_driver_car,
                        //   user_id:data.body.user.id_user,
                        // },
                      }
                    });
                }else{
                  Alert.alert(appName,data.header.message);
                }

            }
        });
      }else{
        Alert.alert(appName,'Please add valid password!');
      }
    }else{
      Alert.alert(appName,'Please add valid code!');
    }
  }
  render(){
      return (
        <ScrollView contentContainerStyle={{flex: 1,backgroundColor: '#0054a4'}}>
          <KeyboardAvoidingView style={{flex: 1,backgroundColor: '#0054a4'}}>
          <View style={{flex: 1}}>
          <LoadingSpinnerOverlay style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} ref={ component => this._modalLoadingSpinnerOverLay = component } />
              {/*header logo*/}
              <View style={{flex:0.5,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
                  <Image style={{width: 250, height: 400}} source={headerlogo} resizeMode="contain" />
              </View>
              <View style={{flex:0.5,flexDirection:'column',marginLeft:20,marginRight:20,backgroundColor:'transparent'}}>
                  {/* username */}
                  <View style={styles.textInputView}>
                      <TextInput
                        style={[{width:commanWidth,height:commanHeight},styles.textInput]}
                        onChangeText={(username) => this.setState({username})}
                        value={this.state.username}
                        placeholder='Username'
                      />
                  </View>
                  {/* password */}
                  <View style={styles.textInputView}>
                      <TextInput
                        style={[{width:commanWidth,height:commanHeight},styles.textInput]}
                        onChangeText={(password) => this.setState({password})}
                        value={this.state.password}
                        placeholder='password'
                        secureTextEntry={true}
                      />
                  </View>
                  {/* register device */}
                  <View style={{flex:0.3}}>
                      <TouchableHighlight style={{width:commanWidth,height:commanHeight,borderRadius: 25,alignSelf: 'center',justifyContent:'center',marginTop:30,backgroundColor:'#a39161'}} underlayColor='transparent' onPress={() => { this.onRegister(); }}>
                            <Text style={{textAlign: 'center',fontSize: 16,color: '#FFF',fontWeight: 'bold'}} >REGISTER DEVICE</Text>
                      </TouchableHighlight>
                  </View>
                  {/* not registre bottom text */}
                  <View style={{flex:0.3,alignSelf: 'center',justifyContent:'center',marginTop:30,backgroundColor:'transparent'}}>
                        <Text style={{padding: 4,textAlign: 'center',fontSize: 12,color: '#FFF'}} >{'If you do not know your username/password,\nget in touch with dispatch'}</Text>
                  </View>
              </View>
          </View>
          </KeyboardAvoidingView>
        </ScrollView>
      );
  }
}
const styles = StyleSheet.create({
  textInputView : {flex:0.2,backgroundColor: 'transparent',alignItems: 'center',justifyContent:'center'},
  textInput : {
    backgroundColor:'#fff',
    color:'#000',
    borderRadius:25,
    paddingLeft:12,
    paddingRight:12,
    paddingTop:8,
    paddingBottom:8,
    fontSize:15,
  }

});
module.exports = login;
