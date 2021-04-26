import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,Dimensions,
  Text,Linking,TextInput,StatusBar,AppState,Alert,
  View,Image,Button,TouchableHighlight,ScrollView,AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import MapView, {Marker} from 'react-native-maps';
import Modal from "react-native-modal";
import { Dropdown } from 'react-native-material-dropdown';
import Checkbox from 'react-native-modest-checkbox'
import {appName,headerlogo,headerHeight,headerBackColor,API_ENDPOINT} from '../constant/const';
import CheckBox from 'react-native-checkbox';
import io from 'socket.io-client';
import { BackHandler, DeviceEventEmitter } from 'react-native';
import LocationServicesDialogBox from "react-native-android-location-services-dialog-box";
import Api from '../Api/Api';
import MapViewDirections from 'react-native-maps-directions';
import Geocode from "react-geocode";
import TextFit from "react-native-textfit"

// const origin = {latitude: 23.0350, longitude: 72.5293};
// const destination = {latitude: 23.0120, longitude: 72.5108};
const GOOGLE_MAPS_APIKEY = 'AIzaSyAvn6N_9AZXiYeZTAYgsRnGHPvYW5g9ar0';
// set Google Maps Geocoding API for purposes of quota management. Its optional but recommended.
Geocode.setApiKey(GOOGLE_MAPS_APIKEY);
// Enable or disable logs. Its optional.
Geocode.enableDebug();

var commanWidth,commanHeight;

var data = [{ value: 'No'}, {value: 'Yes (Must be Accompanied)'}, {value: 'Yes (Pet can ride alone)'}];
var socket,session;

var {width, height} = Dimensions.get('window')
var SCREEN_HEIGHT = height
var SCREEN_WIDTH = width
var ASPECT_RATIO = width / height
var LATITUDE_DELTA = 0.0922
var LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO
var driver_car_id,user_id,accessToken;
var isJobCalled = false;

class home extends Component {

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
      isModalVisible:false,
      Childseats:false,
      Delivery:false,
      onDutyTabColor:'#e40000',
      isOnDuty:false,
      onDutyTabText:'OFF DUTY',
      onDutyTabTextColor:'#f28080',
      lat:37.78825,
      lng:-122.4324,
      showJobUpdate:false,
      jobAccepted:false,
      isPickupJob:false,
      passenger:'', //Natami
      pickup:'', //32 Old Slip, New York, NY 10005,New York, NY 10005,
      dropoff:'', //77 Water St, New York, NY 10005,New York, NY 10005,
      telephone:'', //123-456-7890
      pickupRate:'', //$123.00
      job_id:0,
      code:'',
      origin:{latitude: 0, longitude: 0},
      destination:{latitude: 0, longitude: 0},
      // origin:{latitude: 40.703800, longitude: -74.008163},
      // destination:{latitude: 40.704308, longitude: -74.008367}
    }
    commanWidth = width - 45;
    commanHeight = 45;
    session = this;
  }
  async componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    AsyncStorage.getItem('@AccessToken')
      .then(token => {
        accessToken = token;
      })
    .catch(error => console.log(error));
    AsyncStorage.getItem('@code')
      .then(value => {
        // alert(value);
        session.setState({code:value});
      })
    .catch(error => console.log(error));
    AsyncStorage.getItem('@driver_car_id')
      .then(value => {
        driver_car_id = value;
      })
    .catch(error => console.log(error));
    AsyncStorage.getItem('@user_id')
      .then(value => {
        user_id = value;
      })
    .catch(error => console.log(error));


    if(this.state.isOnDuty){
      this.setState({isOnDuty:true,onDutyTabColor:'#05bf05', onDutyTabText:'ON DUTY', onDutyTabTextColor:'#82df82'})
    }else{
      this.setState({isOnDuty:false,onDutyTabColor:'#e40000', onDutyTabText:'OFF DUTY', onDutyTabTextColor:'#f28080'})
    }
    socket = io(API_ENDPOINT);
    socket.on('connect', function(){
      console.log('connect -----> ' + socket.id);
      // socket.emit('skt_init_drv', {"id":driver_car_id,"id_user":user_id}, (data) => {
      //   console.log('skt_init_drv emit ------> ' + JSON.stringify(data)); // data will be 'woot'
      // });
    });
    // socket.on('skt_init_drv', function(data){
    //   console.log('skt_init_drv ------> ' + JSON.stringify(data))
    // });
    socket.on('connect_error', (err) => {
       console.log('-------------> err -- '+err)
     })
    socket.on('disconnect', function(){
      console.log('disconnect -----> ')
    });
    this.getCurrentLocation('first');
  }

  onChangeText(value, index){
    // alert(value+'--'+index+' -- ')
  }
  onChildSeatstSelected(value){
    this.setState({Childseats : value});
  }
  onDeliverySelected(value){
    this.setState({Delivery : value});
  }
  onCancelPopup(){
    this.setState({isModalVisible : false})
  }
  onGoPopup(){
    this.setState({isModalVisible : false})
  }
  _renderModalContent = () => (
      <View style={{width:width-40, height:height*60/100, backgroundColor: "white", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)"}}>
          {/*--- header part ----*/}
          <View style={{flex:0.15,flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:headerBackColor}}>
              <View style={{flex: 0.15}}/>
              <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{color: "#fff",fontSize:20,padding:8}}>CAR FEATURES</Text>
              </View>
              <TouchableHighlight style={{flex: 0.15,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}} underlayColor='transparent' onPress={() => { this.onCancelPopup(); }}>
                <Image style={{width: 20, height: 20}} source={require('../img/cancel.png')} resizeMode="contain" />
              </TouchableHighlight>
          </View>
          {/*--- bottom part ----*/}
          <View style={{flex:0.6,flexDirection: 'column',justifyContent:'center',backgroundColor:'transparent'}}>
              <View style={{flex:0.1}}/>
              {/* Allow pets*/}
              <View style={{flex:0.3,flexDirection: 'row',marginRight:16,marginLeft:16}}>
                  <View style={{flex:0.3,borderRadius: 3,justifyContent:'center'}}>
                      <Text style={{fontSize: 16,color: '#000'}} >Allow Pets</Text>
                  </View>
                  <View style={{flex:0.7,backgroundColor:'#ebebeb',marginLeft:4}}>
                    <Dropdown
                      data={data}
                      fontSize={13}
                      onChangeText={this.onChangeText}
                      dropdownOffset={{ top: 2, left: 0 }}
                      // dropdownMargins={{ min: 0, max: 0 }}
                      inputContainerStyle={{ borderBottomColor: 'transparent'}}
                      pickerStyle={{flex:0.9}}
                      containerStyle={{padding:8}}
                      shadeOpacity={0}
                      rippleOpacity={0}
                      dropdownPosition={0}
                    />
                  </View>
              </View>
              {/*Childseats*/}
              <View style={{flex:0.3,flexDirection: 'row',marginRight:16,marginLeft:16}}>
                  <View style={{flex:0.3,borderRadius: 3,justifyContent:'center'}}>
                      <Text style={{fontSize: 16,color: '#000'}} >Childseats</Text>
                  </View>
                  <View style={{flex:0.7,alignItems:'flex-end',justifyContent:'center'}}>
                    <Checkbox
                      checkedImage={require('../img/checkbox_selected.png')} uncheckedImage={require('../img/checkbox.png')}
                      onChange={(checked) => this.onChildSeatstSelected(checked)}
                      label=''
                      checked={this.state.Childseats}
                      labelBefore={true}
                      labelStyle={{fontSize:0}}
                      noFeedback={true}
                      />
                  </View>
              </View>
              {/*Delivery*/}
              <View style={{flex:0.3,flexDirection: 'row',marginRight:16,marginLeft:16}}>
                  <View style={{flex:0.3,borderRadius: 3,justifyContent:'center'}}>
                      <Text style={{fontSize: 16,color: '#000'}} >Delivery</Text>
                  </View>
                  <View style={{flex:0.7,alignItems:'flex-end',justifyContent:'center'}}>
                  <CheckBox
                      label='Label'
                      checked={this.state.Delivery}
                      checkedImage={require('../img/checkbox_selected.png')} uncheckedImage={require('../img/checkbox.png')}
                      onChange={(checked) => this.onDeliverySelected(checked)}
                    />
                  </View>
              </View>
              <View style={{flex:0.1}}/>
          </View>
          {/*--- bottom button ---*/}
          <View style={{flex:0.3}}>
              <TouchableHighlight style={{width:width-80,height:50,borderRadius: 25,alignSelf: 'center',justifyContent:'center',marginTop:30,backgroundColor:'#05bf05'}} underlayColor='transparent' onPress={() => { this.onGoPopup(); }}>
                    <Text style={{textAlign: 'center',fontSize: 16,color: '#FFF',fontWeight: 'bold'}} >GO!</Text>
              </TouchableHighlight>
          </View>
      </View>
  );

  onChangeDuty(){
    var isDriverOnDuty;
    if(this.state.isOnDuty){
      isDriverOnDuty = false;
      this.setState({isOnDuty:false,onDutyTabColor:'#e40000', onDutyTabText:'OFF DUTY', onDutyTabTextColor:'#f28080'})
    }else{
      isDriverOnDuty = true;
      this.setState({isOnDuty:true,onDutyTabColor:'#05bf05', onDutyTabText:'ON DUTY', onDutyTabTextColor:'#82df82'})
    }
    // alert(isDriverOnDuty)
    if(isDriverOnDuty){
      console.log('this.state.isOnDuty ------> ' + isDriverOnDuty)
      this.interval = setInterval(() => {
                    console.log('this.state.isOnDuty called------> ')
                    session.getCurrentLocation('repeat');
                 }, 15000)  // 1000 = 1 sec
    }else{
        clearInterval(this.interval);
    }

    socket = io(API_ENDPOINT);
    socket.on('connect', function(){
      console.log('connect onChangeDuty -----> ' + socket.id + ' ---> ' + driver_car_id + ' --- ' + isDriverOnDuty);
      socket.emit('skt_driver_available', {"idDriverCar":driver_car_id,"available":isDriverOnDuty}, (data) => {
        console.log('skt_driver_available emit ------> ' + JSON.stringify(data)); // data will be 'woot'
      });
      socket.on('skt_driver_available', function(data){
        console.log('skt_driver_available ------> ' + JSON.stringify(data))
      });
    });

  }
  getCurrentLocation(from){
    LocationServicesDialogBox.checkLocationServicesIsEnabled({
        message: "<h2>Use Location ?</h2>This app wants to change your device settings:<br/><br/>Use GPS, Wi-Fi, and cell network for location<br/><br/><a href='#'>Learn more</a>",
        ok: "YES",
        cancel: "NO",
        enableHighAccuracy: false, // true => GPS AND NETWORK PROVIDER, false => GPS OR NETWORK PROVIDER
        showDialog: true, // false => Opens the Location access page directly
        openLocationServices: true, // false => Directly catch method is called if location services are turned off
        preventOutSideTouch: false, //true => To prevent the location services popup from closing when it is clicked outside
        preventBackClick: false, //true => To prevent the location services popup from closing when it is clicked back button
        providerListener: true // true ==> Trigger "locationProviderStatusChange" listener when the location state changes
    }).then(function(success) {
          console.log('success location ----> ' + JSON.stringify(success));
          // success => {alreadyEnabled: true, enabled: true, status: "enabled"}
            navigator.geolocation.getCurrentPosition((position) => {
                console.log('success getCurrentPosition ----> ' +JSON.stringify(position));
                session.setState({lat : position.coords.latitude, lng: position.coords.longitude});
                session.map.animateToRegion({
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude,
                      latitudeDelta: LATITUDE_DELTA,
                      longitudeDelta: LONGITUDE_DELTA,
                    });
                if(from === 'repeat'){
                  session.sendDriverLocation(position.coords.latitude,position.coords.longitude,position.coords.accuracy);
                }
            }, error => {
              this.getCurrentLocation('first');
              console.log('error getCurrentPosition ----> ' +JSON.stringify(error))
            },{enableHighAccuracy: false});
        }.bind(this)
    ).catch((error) => {
        console.log('error location ----> ' +error.message);
    });

    DeviceEventEmitter.addListener('locationProviderStatusChange', function(status) { // only trigger when "providerListener" is enabled
        // console.log('-------DeviceEventEmitter----->' + status); //  status => {enabled: false, status: "disabled"} or {enabled: true, status: "enabled"}
    });
    BackHandler.addEventListener('hardwareBackPress', () => { //(optional) you can use it if you need it
       //do not use this method if you are using navigation."preventBackClick: false" is already doing the same thing.
       LocationServicesDialogBox.forceCloseDialog();
       // console.log('-------BackHandler----->');
    });
  }
  sendDriverLocation(lat,lng,acr){
    var obj = {"idDriverCar": driver_car_id,
         "code": this.state.code,
         "available": this.state.isOnDuty,
         "coords":[
            {
               "lat":lat,
               "lng":lng,
               "acr":acr
            }
         ]
    };
    socket = io(API_ENDPOINT);
    socket.on('connect', function(){
      console.log('connect sendDriverLocation -----> ' + socket.id + ' --- ' + JSON.stringify(obj));
      socket.emit('skt_driver_track_coords',obj, (data) => {
        console.log('skt_driver_track_coords emit ------> ' + JSON.stringify(data)); // data will be 'woot'
      });
      socket.on('skt_driver_track_coords', function(data){
        console.log('skt_driver_track_coords ------> ' + JSON.stringify(data))
      });
    });
    if(!this.state.showJobUpdate){
      this.getJobUpdate();
    }
  }
  getJobUpdate(){
    socket = io(API_ENDPOINT);
    socket.on('connect', function(){
      console.log('connect getJobUpdate -----> ' + socket.id + ' --- driver_car_id -->' + driver_car_id);
      socket.on('skt_drv_dispatch', function(id_job, dispatch_time, id_driver_car){
        console.log('skt_drv_dispatch result------> ' + id_job + " - " + dispatch_time + " - " + id_driver_car);
        // skt_drv_dispatch result------> 31 - 10:03:39 AM - 4 - undefined -
        Api.getCurrentJob(session, accessToken, function(parent, data){
            console.log('------ getJobUpdate response --- '+ JSON.stringify(data));
            if(id_driver_car === driver_car_id){
                session.setState({showJobUpdate:true});
                var pickup = data.body.last_job.pick_up + " " + data.body.last_job.pick_up_city + " " + data.body.last_job.pick_up_state;
                var dropoff = data.body.last_job.drop_off + " " + data.body.last_job.drop_off_city + " " + data.body.last_job.drop_off_state;
                session.setState({
                  passenger:data.body.last_job.passenger,
                  pickup:pickup,
                  dropoff:dropoff,
                  telephone:data.body.last_job.telephone,
                  job_id:data.body.last_job.id_job,
                  time:data.body.last_job.time,
                  pickupRate:'$'+data.body.last_job.fare+'.00',
                })
                if(!isJobCalled){
                  isJobCalled = true;
                  session.getLatLngFromAddress();
                }
            }
        });

      });
    });
  }
  getLatLngFromAddress(){
    // Get latidude & longitude from address.
    Geocode.fromAddress(this.state.pickup).then(
      response => {
        const { lat, lng } = response.results[0].geometry.location;
        console.log('----------origin ---------> '+lat, lng);
        var myData = {latitude: lat, longitude: lng}
        session.setState({origin:myData});
      },
      error => {console.error(error); }
    );
    Geocode.fromAddress(this.state.dropoff).then(
      response => {
        const { lat, lng } = response.results[0].geometry.location;
        console.log('----------destination ---------> '+lat, lng);
        var myData = {latitude: lat, longitude: lng}
        session.setState({destination:myData});
      },
      error => {console.error(error);}
    );
    console.log('----------render------------method---------> '+ JSON.stringify(this.state.origin)+ ' --- ' + JSON.stringify(this.state.destination));
  }

  onAcceptJob(){
    this.setState({showJobUpdate:true,jobAccepted:true,isPickupJob:false});
  }
  onSkipJob(){
    isJobCalled = false;
    Api.skipDriverJob(session, accessToken, function(parent, data){
        console.log('------ onSkipJob response --- '+ JSON.stringify(data));
        if(data.header.status == 400){
          Alert.alert(appName,data.header.message);
        }else{
          parent.setState({showJobUpdate:false,jobAccepted:false,isPickupJob:false});
        }
    });
  }
  onCancelJob(){
    isJobCalled = false;
    this.setState({showJobUpdate:false,jobAccepted:false,isPickupJob:false});
    var jobId = this.state.job_id;
    Api.cancelJob(session, jobId, accessToken, function(parent, data){
        console.log('------ cancelJob response --- '+ JSON.stringify(data));
    });
  }
  onNoShowJob(){
    isJobCalled = false;
    this.setState({showJobUpdate:false,jobAccepted:false,isPickupJob:false});
    var jobId = this.state.job_id;
    Api.nagativeJob(session, jobId, accessToken, function(parent, data){
        console.log('------ onNoShowJob response --- '+ JSON.stringify(data));
    });
  }
  onPickupJob(){
    this.setState({showJobUpdate:true,jobAccepted:true,isPickupJob:true});
    var jobId = this.state.job_id;
    Api.pickupJob(session, jobId, accessToken, function(parent, data){
        console.log('------ onPickupJob response --- '+ JSON.stringify(data));
    });
  }
  onDoneJob(){
    isJobCalled = false;
    this.setState({showJobUpdate:false,jobAccepted:false,isPickupJob:false});
    var jobId = this.state.job_id;
    Api.dropoffJob(session, jobId, accessToken, function(parent, data){
        console.log('------ dropoffJob response --- '+ JSON.stringify(data));
    });
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('------------> _handleAppStateChange ----> ' + nextAppState)
    if(nextAppState === 'background'){
      console.log('------------> App is in background!')
      clearInterval(this.interval);
    }
    if(nextAppState === 'active'){
      console.log('------------> App has come to the foreground! --> ' + this.state.isOnDuty)
      if(this.state.isOnDuty){
        console.log('this.state.isOnDuty ------> ' +  this.state.isOnDuty)
        this.interval = setInterval(() => {
                console.log('this.state.isOnDuty called------> ')
                session.getCurrentLocation();
        }, 15000)  // 1000 = 1 sec
      }
    }
  }
  componentWillUnmount() {
      // used only when "providerListener" is enabled
      LocationServicesDialogBox.stopListener(); // Stop the "locationProviderStatusChange" listener
      AppState.removeEventListener('change', this._handleAppStateChange);
  }

  render(){
      console.log('----------render---------> '+ JSON.stringify(this.state.origin)+ ' --- ' + JSON.stringify(this.state.destination));
      return (
        <View style={{ flex: 1,backgroundColor: '#fff' }}>
          {/*--------header--------*/}
          <View style={{height:headerHeight,backgroundColor:headerBackColor,flexDirection:'row',paddingLeft:16,paddingRight:16,alignItems:'center',justifyContent:'center',alignSelf:'center'}}>
              {/*left*/}
              <View style={{flex: 0.2,backgroundColor:'transparent',alignItems:'flex-start',justifyContent:'center',marginTop:25}}>
                <Text style={{fontSize: 12,color: '#FFF'}} >DN: {this.state.code}</Text>
              </View>
              {/*center*/}
              <View style={{flex: 0.6,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent',marginTop:25}}>
                <Image style={{width: 110, height: 40}} source={headerlogo} resizeMode="contain" />
              </View>
              {/*right*/}
              <TouchableHighlight style={{flex: 0.2,backgroundColor:this.state.onDutyTabColor,marginTop:25,borderRadius:25,padding:8,alignItems:'center',justifyContent:'center'}} underlayColor='transparent' onPress={() => { this.onChangeDuty(); }}>
                <Text style={{fontSize: 12,color: this.state.onDutyTabTextColor}} >{this.state.onDutyTabText}</Text>
              </TouchableHighlight>
          </View>
          {/*---------- content ------- */}
          <View style={{flex: 1}}>
            {/* --- map view ----*/}
            <MapView
              ref={ref => { this.map = ref; }}
              style={styles.map}
              onMapReady={this.onMapReady}
              initialRegion={{
                latitude: this.state.lat,
                longitude: this.state.lng,
                latitudeDelta: LATITUDE_DELTA,
                longitudeDelta: LONGITUDE_DELTA,
                }} >
              <MapView.Marker
                key={0}
                coordinate={{
                  latitude: this.state.lat,
                  longitude: this.state.lng}}
                image={require('../img/car_marker.png')}
                />
                {this.state.jobAccepted &&
                  <MapView.Marker coordinate={this.state.origin} image={require('../img/location_marker.png')}/>
                }
                {this.state.jobAccepted &&
                    <MapView.Marker coordinate={this.state.destination} image={require('../img/location_marker.png')}/>
                }
                {this.state.jobAccepted &&
                  <MapViewDirections
                    origin={this.state.pickup}
                    destination={this.state.dropoff}
                    apikey={GOOGLE_MAPS_APIKEY}
                    strokeWidth={3}
                    strokeColor="#e40000"
                    onReady={result => {
                      this.map.fitToCoordinates(result.coordinates, {});
                    }}
                  />
                }
            </MapView>
            {/* --- detail view ----*/}
            {!this.state.isOnDuty &&
              <View style={{flex:0.1,backgroundColor:'#fb5656',marginLeft:20,marginRight:20,borderBottomLeftRadius:30,borderBottomRightRadius:30,justifyContent:'center',alignItems:'center'}}>
                  <Text style={{fontSize: 16,color: '#FFF',fontWeight:'bold'}} >OFF DUTY</Text>
              </View>
            }
            {/*----  accept/reject view ----- */}
            {this.state.showJobUpdate &&
              <View style={{backgroundColor: 'rgba(255,255,255,0.8)',position: 'absolute',bottom:0,width:width,height:250}}>
                  {this.state.jobAccepted ?
                    <View style={{flex: 1,flexDirection:'column'}}>
                      {/*text details*/}
                      <View style={{flex: 0.5,justifyContent: "center",alignItems: "center",marginLeft:12,marginRight:12,backgroundColor:'transparent'}}>
                          <Text style={{flex:0.2,fontSize: 16,color: '#181818',fontWeight:'bold',marginTop:4,backgroundColor:'transparent'}} >{this.state.passenger}</Text>
                          <Text style={{flex:0.25,fontSize: 18,color: '#0054a4',marginTop:4,marginBottom:8,backgroundColor:'transparent'}} >{this.state.telephone}</Text>
                          <View style={{flex:0.4,width:width-80,flexDirection:'row',justifyContent: "center",alignItems: "center",marginTop:0,backgroundColor:'transparent'}}>
                              <Image style={{width: 15, height: 10}} source={require('../img/dash_green.png')} resizeMode="contain" />
                              {/*<TextFit height={20} width={width-80} style={{fontSize: 16,color: '#7b7b7b',marginLeft:8,backgroundColor:'transparent'}}>
                                {this.state.pickup}
                              </TextFit>*/}
                              <Text style={{fontSize: 15,color: '#7b7b7b',marginLeft:4,textAlign:'center'}} numberOfLines={2}>{this.state.pickup}</Text>
                          </View>
                          {this.state.isPickupJob &&
                            <View style={{flex:0.4,flexDirection:'column'}}>
                              <View style={{flexDirection:'row',width:width-80,justifyContent: "center",alignItems: "center",marginTop:1}}>
                                  <Image style={{width: 15, height: 10}} source={require('../img/dash_red.png')} resizeMode="contain" />
                                  {/*<TextFit height={20} width={width-80} style={{fontSize: 16,color: '#7b7b7b',marginLeft:8,backgroundColor:'transparent'}}>
                                    {this.state.dropoff}
                                  </TextFit>*/}
                                  <Text style={{fontSize: 15,color: '#7b7b7b',marginLeft:4,textAlign:'center'}} numberOfLines={2} >{this.state.dropoff}</Text>
                              </View>
                              <View style={{flexDirection:'row',justifyContent: "center",alignItems: "center",marginTop:4}}>
                                  <Text style={{fontSize: 16,color: '#181818'}} >{"Total:"}</Text>
                                  <Text style={{fontSize: 16,color: '#e40000',marginLeft:8}} >{this.state.pickupRate}</Text>
                              </View>
                            </View>
                          }
                      </View>
                      {/*--- button ---*/}
                      <View style={{flex: 0.5,flexDirection:'row',justifyContent: "center",alignItems: "center",marginTop:0}}>
                          {this.state.isPickupJob ?
                            <View style={{flexDirection:'row',justifyContent: "center"}}>
                                <TouchableHighlight style={[{flex: 0.8,backgroundColor:'#05bf05',marginTop:12},styles.bottomBtn]} underlayColor='transparent' onPress={() => { this.onDoneJob(); }}>
                                  <Text style={{fontSize: 22,color: '#FFF',fontWeight:'bold'}}>DONE</Text>
                                </TouchableHighlight>
                            </View>
                            :
                            <View style={{flex:1,flexDirection:'column'}}>
                                <View style={{flex:0.5,flexDirection:'row',justifyContent: "center"}}>
                                  <TouchableHighlight style={[{flex: 0.8,backgroundColor:'#0a55a4'},styles.bottomBtn]} underlayColor='transparent' onPress={() => { this.onPickupJob(); }}>
                                    <Text style={{fontSize: 22,color: '#FFF',fontWeight:'bold'}}>PICKED UP</Text>
                                  </TouchableHighlight>
                                </View>
                                <View style={{flex:0.5,flexDirection:'row'}}>
                                  <TouchableHighlight style={[{flex: 0.5,backgroundColor:'#fad400',margin:12},styles.smallBottomBtn]} underlayColor='transparent' onPress={() => { this.onNoShowJob(); }}>
                                    <Text style={{fontSize: 18,color: '#FFF',fontWeight:'bold'}}>NO SHOW</Text>
                                  </TouchableHighlight>
                                  <TouchableHighlight style={[{flex: 0.5,backgroundColor:'#fa7000',margin:12},styles.smallBottomBtn]} underlayColor='transparent' onPress={() => { this.onCancelJob(); }}>
                                    <Text style={{fontSize: 18,color: '#FFF',fontWeight:'bold'}}>CANCELLED</Text>
                                  </TouchableHighlight>
                                </View>
                            </View>
                          }
                      </View>
                    </View>
                    :
                    <View style={{flex: 1,flexDirection:'column'}}>
                      {/*text details*/}
                      <View style={{flex: 0.6,justifyContent: "center",alignItems: "center",marginTop:4,marginLeft:12,marginRight:12,backgroundColor:'transparent'}}>
                          <Text style={{fontSize: 16,color: '#0054a4'}} >Available Job</Text>
                          <Text style={{fontSize: 18,color: '#181818',fontWeight:'bold',marginTop:6}} >{this.state.passenger}</Text>
                          <Text style={{fontSize: 16,color: '#0054a4',marginTop:6}} >{this.state.telephone}</Text>
                          {/*<TextFit  height={40} width={width-50} style={{fontSize: 16,color: '#7b7b7b',marginTop:6,backgroundColor:'transparent'}}>
                            {this.state.pickup}
                          </TextFit>*/}
                          <Text style={{fontSize: 16,width:width-80,color: '#7b7b7b',marginTop:6,textAlign:'center'}} numberOfLines={2}>{this.state.pickup}</Text>
                      </View>
                      {/*--- button ---*/}
                      <View style={{flex: 0.4,flexDirection:'row',justifyContent: "center",alignItems: "center",marginTop:0,backgroundColor:'transparent'}}>
                          <View style={{flex:0.1}}/>
                          <TouchableHighlight style={[{flex: 0.4,backgroundColor:'#05bf05'},styles.bottomBtn]} underlayColor='transparent' onPress={() => { this.onAcceptJob(); }}>
                            <Text style={{fontSize: 22,color: '#FFF',fontWeight:'bold'}}>ACCEPT</Text>
                          </TouchableHighlight>
                          <View style={{flex:0.05}}/>
                          <TouchableHighlight style={[{flex: 0.4,backgroundColor:'#e40000'},styles.bottomBtn]} underlayColor='transparent' onPress={() => { this.onSkipJob(); }}>
                            <Text style={{fontSize: 22,color: '#FFF',fontWeight:'bold'}}>SKIP</Text>
                          </TouchableHighlight>
                          <View style={{flex:0.1}}/>
                      </View>
                    </View>
                  }
              </View>
            }
            {/*-----------modal---------*/}
            <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
              style={{flex: 1,justifyContent: "center",alignItems: "center"}} isVisible={this.state.isModalVisible}>
              {this._renderModalContent()}
            </Modal>
          </View>
        </View>
      );
  }
}
const styles = StyleSheet.create({
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBtn:{borderRadius:20,paddingLeft:8,paddingRight:8,paddingTop:18,paddingBottom:18,alignItems:'center',justifyContent:'center'},
  smallBottomBtn:{borderRadius:10,paddingLeft:6,paddingRight:6,paddingTop:18,paddingBottom:18,alignItems:'center',justifyContent:'center'},
});
module.exports = home;
