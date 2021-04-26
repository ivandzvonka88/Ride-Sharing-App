import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,Dimensions,Alert,
  Text,TextInput,FlatList,KeyboardAvoidingView,
  View,Image,Button,TouchableHighlight,ScrollView, StatusBar, AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Modal from "react-native-modal";
import DeviceInfo from 'react-native-device-info';
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay';
import Share from 'react-native-share';
import {appName,headerHeight,headerBackColor,headerlogo,headerLeftMenuSize,checkIphoneX} from '../constant/const';
import Api from '../Api/Api';

var width,height;
var deleteId = '';
var session;

class getFeedback extends Component {
  static options(passProps) {
      return {
        topBar: {
          drawBehind: true,
          visible: false,
          animate: false
        },
        sideMenu: {
            left: {
                // height:50,
                // visible: false, // hide drwaer from showing first when this screen is loaded
                enabled: false, // hide drawer for this screen
            }
        }
      };
  }

  constructor(props){
    super(props);
    StatusBar.setBarStyle('light-content', true);
    height = Dimensions.get('window').height;
    width = Dimensions.get('window').width;
    this.state={
      feedbackPerson : '',
      topbarTopMargin:0,
      postRequestData:[],
      isModalVisible:false,
    }
    session = this;
  }
  componentDidMount() {
    this.setState({topbarTopMargin:checkIphoneX()});
    this.getPastRequestApi();
  }
  getPastRequestApi(){
    this._modalLoadingSpinnerOverLay.show();
    Api.getPastRequest(this, DeviceInfo.getUniqueID(), function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
            // console.log('------ getPastRequest response >>> '+JSON.stringify(data));
            parent.setState({postRequestData : data.data});
            // console.log('------ getPastRequest --- '+ JSON.stringify(openMockData));
        }
    });
  }

  onBackClick(){
    Navigation.pop(this.props.componentId);
  }

  onGenerateFeedbackLink(){
    this._modalLoadingSpinnerOverLay.show();
    Api.getFeedbackUniqueUrl(this, this.state.feedbackPerson, DeviceInfo.getUniqueID(), function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){
        }else{
          console.log('------ onGenerateFeedback Link ------> '+ data.data.url);
          parent.openShareLinkDialog(data.data.url);
        }
    });
  }
  openShareLinkDialog(shareUrl){
    const shareOptions = {
      title: appName,
      url: shareUrl,
    };
    return Share.open(shareOptions);
  }

  onResendRequestClick(id){
    this._modalLoadingSpinnerOverLay.show();
    Api.resendPastRequest(this, id, DeviceInfo.getUniqueID(), function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
          console.log('------ onResend Request Click Link ------> '+ data.data.url);
            parent.openShareLinkDialog(data.data.url);
            // console.log('------ getPastRequest response >>> '+JSON.stringify(data));
            // parent.setState({postRequestData : data.data});
            // console.log('------ getPastRequest --- '+ JSON.stringify(openMockData));
        }
    });
  }
  onCancelRequestClick(id){
    this._modalLoadingSpinnerOverLay.show();
    Api.cancelPastRequest(this, id, DeviceInfo.getUniqueID(), function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
            // for(var i = 0 ; i < parent.state.postRequestData.length ; i++){
            //   if(parent.state.postRequestData[i].id == id){
            //       parent.state.postRequestData.splice(i, 1);
            //   }
            // }
            parent.getPastRequestApi();
        }
    });
  }
  onDeleteRequestClick(id){
    deleteId = id;
    this.setState({isModalVisible : true});
  }
  deleteApi(){
    this._modalLoadingSpinnerOverLay.show();
    Api.deletePastRequest(this, deleteId, DeviceInfo.getUniqueID(), function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
            for(var i = 0 ; i < parent.state.postRequestData.length ; i++){
              if(parent.state.postRequestData[i].id == deleteId){
                  parent.state.postRequestData.splice(i, 1);
              }
            }
            // console.log('------ deletePastRequest --- '+ JSON.stringify(openMockData));
        }
    });
  }

  onCancelPopup(){
    this.setState({isModalVisible : false})
  }
  onAcceptPopup(){
    this.setState({isModalVisible : false})
    setTimeout(function(){
      session.deleteApi();
    },1000);
  }
  _renderModalContent = () => (
      <View style={{width:width-30, height:150, backgroundColor: "white", justifyContent:'center', alignItems: "center", borderRadius: 4, borderColor: "rgba(0, 0, 0, 0.1)"}}>
          <View style={{flex:0.5,justifyContent:'center',alignItems:'center',backgroundColor:'transparent'}}>
              <Text style={{color: "#000",fontSize:20,padding:8, justifyContent:'center',alignItems:'center'}}>Are you sure want to delete?</Text>
          </View>
          <View style={{flex:0.5,width:width-50 ,height:50, justifyContent:'center',backgroundColor:'transparent'}}>
              <View style={{flex:1,flexDirection: 'row'}}>
                  <TouchableHighlight style={{flex:0.5,borderRadius: 3,alignSelf: 'center',backgroundColor: '#4ec5c1',alignItems: 'center',borderRadius: 3,marginRight:4}} underlayColor='transparent' onPress={() => { this.onAcceptPopup(); }}>
                      <Text style={{padding: 12,textAlign: 'center',fontSize: 18,color: 'white'}} >Yes</Text>
                  </TouchableHighlight>
                  <TouchableHighlight style={{flex:0.5,borderRadius: 3,alignSelf: 'center',backgroundColor: '#ec576b',alignItems: 'center',borderRadius: 3,marginLeft:4}} underlayColor='transparent' onPress={() => { this.onCancelPopup(); }}>
                      <Text style={{padding: 12,textAlign: 'center',fontSize: 18,color: 'white'}} >No</Text>
                 </TouchableHighlight>
              </View>
          </View>
      </View>
  );

  _renderItem = ({ item: rowData, index }) => {
    // console.log('-----> ' + JSON.stringify(rowData));
    var dateArr = rowData.date_sent.split('-'); //"2019-02-04"
    var statusColor = '#4dc5c1';
    if(rowData.status == 'open'){
      statusColor = '#e8d638';
    }
    return(
      <View style={{flexDirection: 'row',alignItems:'center',paddingTop:16,paddingBottom:16,borderBottomWidth:1,borderColor:'#e8e8e8'}}>
          <View style={{flex:0.5,flexDirection: 'column',backgroundColor:'transparent'}} >
              <Text style={{color: "#000",fontSize:18,fontWeight:'bold'}}>{rowData.provider_name}</Text>
              <Text style={{color: "#515151",fontSize:16}}>{dateArr[2]+'.'+dateArr[1]+'.'+dateArr[0]}</Text>
          </View>
          <View style={{flex:0.4,flexDirection: 'column',alignItems:'flex-end',backgroundColor:'transparent'}} >
              <Text style={{color: statusColor,fontSize:16,marginRight:16}}>{rowData.status.charAt(0).toUpperCase() + rowData.status.substr(1)}</Text>
          </View>
          {rowData.status != 'open' ?
            <TouchableHighlight style={{flex:0.05,backgroundColor:'transparent',justifyContent:'center',alignItems:'flex-end',padding:8}} underlayColor='transparent' onPress={() => { this.onDeleteRequestClick(rowData.id); }}>
                 <Image style={{width: 20, height: 20}} source={require('../img/cancel.png')} resizeMode="contain" />
            </TouchableHighlight>
          :
            <View>
                <TouchableHighlight style={{flex:0.05,backgroundColor:'transparent',justifyContent:'center',alignItems:'flex-end',padding:8}} underlayColor='transparent' onPress={() => { this.onResendRequestClick(rowData.id); }}>
                     <Image style={{width: 20, height: 20}} source={require('../img/reload.png')} resizeMode="contain" />
                </TouchableHighlight>
                <TouchableHighlight style={{flex:0.05,backgroundColor:'transparent',justifyContent:'center',alignItems:'flex-end',padding:8}} underlayColor='transparent' onPress={() => { this.onCancelRequestClick(rowData.id); }}>
                     <Image style={{width: 20, height: 20}} source={require('../img/cancel.png')} resizeMode="contain" />
                </TouchableHighlight>
            </View>
          }
      </View>
    )
  }
  render(){
      return (
        <KeyboardAvoidingView style = {{flex: 1}}>
          <View style={{ flex: 1,backgroundColor: '#fff' }}>
              <LoadingSpinnerOverlay style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} ref={ component => this._modalLoadingSpinnerOverLay = component } />
              {/*--------header--------*/}
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
              {/*--------title--------*/}
              <View style={{flex:0.1,flexDirection:'column',backgroundColor:'#fff',paddingLeft:16,paddingRight:16}}>
                  <Text style={{color: "#000",fontSize:20,fontWeight:'bold',alignSelf:'center',marginTop:8,marginBottom:8}}>Get Feedback</Text>
              </View>
              {/*--------sub - title--------*/}
              <View style={{flex:0.4,flexDirection:'column',backgroundColor:'transparent',paddingLeft:16,paddingRight:16}}>
                  <Text style={{flex:0.2,color: "#000",fontSize:18}}>Get feedback from:</Text>
                  <TextInput
                    style={{flex:0.1,height: 40,borderBottomWidth:1,borderColor:'#e8e8e8'}}
                    onChangeText={(feedbackPerson) => this.setState({feedbackPerson})}
                    value={this.state.feedbackPerson}
                  />
                  <Text style={{flex:0.2,color: "#8a8a8a",fontSize:12,marginTop:8}}>Enter name to request single use/user feedback, leave blank to request multi-use/user feedback</Text>
                  <TouchableHighlight style={{flex: 0.2,marginTop:20,alignItems: 'center',justifyContent:'center',borderColor:'#4ec5c1',borderWidth:1,borderRadius:5,backgroundColor:'#4ec5c1'}} underlayColor='transparent' onPress={() => { this.onGenerateFeedbackLink(); }}>
                       <Text style={{color: "#fff",fontSize:18,padding:16}}>GENERATE FEEDBACK LINK</Text>
                  </TouchableHighlight>
              </View>
              {/*--------past request--------*/}
              <View style={{flex:0.05}}/>
              {this.state.postRequestData.length > 0 &&
                <View style={{flex:0.45,flexDirection:'column',backgroundColor:'transparent'}}>
                    <Text style={{flex:0.2,color: "#000",fontSize:25,fontWeight:'bold',paddingLeft:16,paddingRight:16}}>Past request:</Text>
                    <FlatList
                      style={{flex:0.8,marginTop:8,paddingLeft:16,paddingRight:16}}
                      data={this.state.postRequestData}
                      extraData={this.state}
                      keyExtractor={(item, index)=> index.toString()}
                      renderItem={this._renderItem}
                    />
                </View>
              }
              {/*-----------modal---------*/}
              <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
                style={{flex: 1,justifyContent: "center",alignItems: "center"}} isVisible={this.state.isModalVisible}>
                {this._renderModalContent()}
              </Modal>
          </View>
        </KeyboardAvoidingView>
      );
  }
}
const styles = StyleSheet.create({
});
module.exports = getFeedback;
