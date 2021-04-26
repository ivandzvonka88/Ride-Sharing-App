import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,Alert,
  Text,TextInput,FlatList,KeyboardAvoidingView,
  View,Image,Button,TouchableHighlight,ScrollView, StatusBar, AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Accordion from 'react-native-collapsible/Accordion';
import DeviceInfo from 'react-native-device-info';
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay';
import Share from 'react-native-share';
import {appName,headerHeight,headerBackColor,headerlogo,headerLeftMenuSize,checkIphoneX} from '../constant/const';
import Api from '../Api/Api';

var feedbackArr = [];

class giveFeedback extends Component {
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
    this.state={
      feedbackPerson : '',
      feedback:'',
      activeSections:[],
      topbarTopMargin:0,
      thumbnailArr : [],
    }
  }
  componentDidMount() {
    this.setState({topbarTopMargin:checkIphoneX()});
    this.setState({feedbackPerson : this.props.personName});
    this.getThumbnailList();
    if(this.props.from === 'deeplink'){
      this.getDeepLinkData();
    }
  }
  getDeepLinkData(){
    this._modalLoadingSpinnerOverLay.show();
    Api.getSubmitFeedbackDeeplinkData(this, this.props.token, function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
          // console.log('------ getSubmitFeedbackDeeplinkData --- '+ JSON.stringify(data));
          if(data.data.provider_name != null){
            parent.setState({feedbackPerson : data.data.provider_name});
          }
        }
    });
  }
  getThumbnailList(){
    this._modalLoadingSpinnerOverLay.show();
    Api.getThumbnailList(this, function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
          parent.setState({thumbnailArr : data.data});
            // console.log('------ getHomeCategoryData --- '+ JSON.stringify(openMockData));
        }
    });
  }

  onBackClick(){
    if(this.props.from === 'deeplink'){
      Navigation.setStackRoot(this.props.componentId, {
        component: {
          name: 'home',
        }
      });
    }else{
      Navigation.pop(this.props.componentId);
    }
  }

  onSendFeedback(){
    if(this.state.feedbackPerson != ''){
      if(feedbackArr.length > 0){
        this._modalLoadingSpinnerOverLay.show();
        Api.sendFeedback(this, this.state.feedbackPerson, feedbackArr, DeviceInfo.getUniqueID(), function(parent, data){
            parent._modalLoadingSpinnerOverLay.hide();
            if(data.error == '1'){

            }else{
                console.log('------ onSendFeedback qniue url --- '+ JSON.stringify(data));
                // Alert.alert(appName,'Feedback done successfully!');
                // parent.onBackClick();
                parent.openShareLinkDialog(data.data.url);
            }
        });
      }else{
        Alert.alert(appName,'Please add atleast one feedback!');
      }
    }else{
      Alert.alert(appName,'Please add person name to whom you want to give feedback!');
    }
  }
  openShareLinkDialog(shareUrl){
    const shareOptions = {
      title: appName,
      url: shareUrl,
    };
    return Share.open(shareOptions);
  }

  onFeedbackTextChange(id,feedbackText){
    // console.log('onFeedbackTextChange -------------------------------------> ' + id + ' --- ' + feedbackText);
    var found = feedbackArr.some(function (el) {
      // console.log('onFeedbackTextChange ----------------------------------> ' + el.id + ' -- ' + id);
      if(el.id === id){
        el.content = feedbackText;
      }
      return el.id === id;
    });
    if (!found) { feedbackArr.push({'id':id,'content':feedbackText}); }
    // console.log('onFeedbackTextChange -----------> ' + feedbackArr.length + ' --- ' + JSON.stringify(feedbackArr));
  }

  _renderHeader = (content, index, isActive, sections) => {
    // console.log('give feedback -----------> ' + index + ' -- ' + isActive + ' \n-- ' + JSON.stringify(sections) + ' \n--- ' + JSON.stringify(content)) ;
    let commonHeight = 140;
    return(
      <View style={{flexDirection: 'column',height:commonHeight,marginTop:4,marginBottom:4,backgroundColor:'#fff',elevation: 1}} >
          <View style={{flex:0.25,flexDirection:'row'}}>
              <Text style={{flex:0.9,color: "#000",fontSize:16,padding:4}}>{content.name}</Text>
          </View>
          <View style={{flex:0.75,alignItems: 'center',flexDirection:'row'}}>
                <Image style={{flex:0.3,width: 90, height: commonHeight}} source={{ uri : 'http://natably.com/images/thumbnails/'+content.thumbnail}} resizeMode="contain" />
                <Text style={{color: "#000",fontSize:14,flex:0.6}} numberOfLines={5}>{content.description}</Text>
                {isActive &&
                  <View style={{flex:0.1}}>
                      <Image style={{width: 20, height: 20}} source={require('../img/checkmark.png')} resizeMode="contain" />
                  </View>
                }
          </View>
      </View>
    );
  };
  _renderContent = (content, index, isActive, sections) => {
    // console.log('_renderContent -----------> ' + index + ' -- ' + isActive + ' \n-- ' + JSON.stringify(sections) + ' \n------ ' + JSON.stringify(content)) ;
    return (
      <View style={[styles.content,{backgroundColor:'#e1eaef',marginTop:4,marginBottom:8}]} >
        <TextInput
          style={{height: 100,borderBottomWidth:1,borderColor:'#e8e8e8',textAlignVertical:'top',paddingTop:8,paddingBottom:8}}
          onChangeText={(feedback) => this.onFeedbackTextChange(content.id,feedback)}
          // value={this.state.feedback}
          placeholder={'enter your feedback..'}
          numberOfLines={5}
          multiline={true}
        />
      </View>
    );
  };

  _updateSections = activeSections => {
    this.setState({ activeSections });
  };
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
              {/*--------input data--------*/}
              <View style={{flex:0.3,flexDirection:'column',backgroundColor:'transparent',paddingLeft:16,paddingRight:16,marginTop:16}}>
                  <Text style={{flex:0.2,color: "#000",fontSize:18}}>Give feedback to:</Text>
                  <TextInput
                    style={{flex:0.25,borderBottomWidth:1,borderColor:'#e8e8e8',backgroundColor:'transparent',textAlignVertical:'bottom'}}
                    onChangeText={(feedbackPerson) => this.setState({feedbackPerson})}
                    value={this.state.feedbackPerson}
                    placeholder={'enter person name'}
                  />
              </View>
              {/*--------category list--------*/}
              <ScrollView style={{flex:1,paddingLeft:16,paddingRight:16,backgroundColor:'transparent'}}>
                <View style={{flex:1,flexDirection:'column',backgroundColor:'transparent'}}>
                    <Text style={{flex:0.2,color: "#8a8a8a",fontSize:12,marginTop:8}}>Please scroll through the roles below and select up to three you believe [Name] can play really well:</Text>
                    <Accordion
                      sections={this.state.thumbnailArr}
                      activeSections={this.state.activeSections}
                      // renderSectionTitle={this._renderSectionTitle}
                      renderHeader={this._renderHeader}
                      renderContent={this._renderContent}
                      onChange={this._updateSections}
                      expandMultiple={true}
                    />

                    <TouchableHighlight style={{flex:0.1,justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',backgroundColor:'#4ec5c1',borderWidth:1,marginTop:32,marginBottom:32,paddingTop:8,paddingBottom:8}} underlayColor='transparent' onPress={() => { this.onSendFeedback(); }}>
                         <Text style={{color: "#fff",fontSize:20}}>Send Feedback</Text>
                    </TouchableHighlight>
                </View>
              </ScrollView>
          </View>
        </KeyboardAvoidingView>
      );
  }
}
const styles = StyleSheet.create({
});
module.exports = giveFeedback;
