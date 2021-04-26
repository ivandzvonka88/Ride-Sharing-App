import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,Dimensions,TextInput,
  View,Image,FlatList,TouchableHighlight,ScrollView, StatusBar, AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import ExpanableList from 'react-native-expandable-section-flatlist';
import TextFit from 'react-native-textfit';
import Modal from "react-native-modal";
import DeviceInfo from 'react-native-device-info';
import LoadingSpinnerOverlay from 'react-native-smart-loading-spinner-overlay';
import {headerHeight,headerBackColor,headerlogo,headerLeftMenuSize,checkIphoneX} from '../constant/const';
import Api from '../Api/Api';

var width,height;
var barHeight = 30;
var collapseBarChartBackHeight = 240;
var openBarChartBackHeight;
var isBarCollapse = true;
var session;
var deleteFrom='';
var deleteId='';
var feedbackThumbnailId='';
var feedbackProviderName='';

class home extends Component {

  static options(passProps) {
      return {
        topBar: {
          drawBehind: true,
          visible: false,
          animate: false
        },
        sideMenu: {
            left: {
                width:250,
                visible: false, // hide drwaer from showing first when this screen is loaded
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
    this.state = {
      barchartData : [],
      feedbackData : [],
      barchartHeight : collapseBarChartBackHeight,
      barchartHeaderFlex:0.3,
      barchartListFlex:0.65,
      barchartButtonFlex:0.15,
      barChartArrow : require('../img/down_arrow.png'),
      isModalVisible:false,
      topbarTopMargin:0,
      barchartTitle:'',
      feedback:'',
    }
    openBarChartBackHeight = height-10;
    session = this;
  }
  componentDidMount() {
    isBarCollapse = false;
    this.setState({topbarTopMargin:checkIphoneX()});
    this.navigationEventListener = Navigation.events().bindComponent(this);
    this.onBarChartArrowClick();
    if(this.props.from === 'deeplink'){
      this.getDeepLinkData();
    }else{
      this.getHomeCategoryData();
    }
  }

  getDeepLinkData(){
    Api.addRecipientForDeepLink(this, this.props.token, DeviceInfo.getUniqueID(), function(parent, data){
        if(data.error == '1'){

        }else{
            parent.getHomeCategoryData();
        }
    });
  }
  getHomeCategoryData(){
    Api.getUserProfile(this, DeviceInfo.getUniqueID(), function(parent, data){
        if(data.error == '1'){
        }else{
            // console.log('------ getUserProfile response >>> '+ data.data.name);
            if(data.data.name != ''){
              parent.setState({barchartTitle : data.data.name + "'s Info"})
            }else{
              parent.setState({barchartTitle : "User's Info"})
            }
        }
    });
    this._modalLoadingSpinnerOverLay.show();
    Api.getHomeCategories(this, DeviceInfo.getUniqueID(), function(parent, data){
        if(data.error == '1'){

        }else{
            // console.log('------ getHomeCategoryData response >>> '+JSON.stringify(data));
            var openMockData = [];
            for(var i = 0 ; i < data.data.categories.length ; i++){
              var headerdata = data.data.categories[i].name+'+'+data.data.categories[i].bar_width+'+'+data.data.categories[i].bar_color;
              openMockData.push({header:headerdata,content:data.data.categories[i].thumbnails});
            }
            parent.setState({barchartData : openMockData});
            parent.setState({feedbackData:data.data.feedbacks.feedbacks})
            // console.log('------ getHomeCategoryData --- '+ JSON.stringify(openMockData));
        }
         parent._modalLoadingSpinnerOverLay.hide();
    });
  }

  headerOnPress(){
    isBarCollapse = false;
    this.setState({barchartHeight:openBarChartBackHeight,
                  barchartHeaderFlex:0.07,barchartListFlex:8,barChartArrow : require('../img/up_arrow.png')});
  }
  componentDidAppear() {
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
          left: {
              visible: false,
          }}
    });
  }
  onMenuClick(){
    Navigation.mergeOptions(this.props.componentId, {
      sideMenu: {
          left: {
              visible: true,
          }}
    });
  }
  onBarChartArrowClick(){
    if(isBarCollapse){
      isBarCollapse = false;
      this.setState({barchartHeight:openBarChartBackHeight,
                    barchartHeaderFlex:0.07,barchartListFlex:8,barChartArrow : require('../img/up_arrow.png')});
    }else{
      isBarCollapse = true;
      this.setState({barchartHeight:collapseBarChartBackHeight,barchartHeaderFlex:0.3,
                    barchartListFlex:65,barChartArrow: require('../img/down_arrow.png')});
      for (var i = 0; i < this.state.barchartData.length; i++) {
        this.ExpandableList.setSectionState(i, false);
      }
    }
  }

  onAcceptAllFeedback(){
    this._modalLoadingSpinnerOverLay.show();
    Api.setAcceptAllFeedback(this, DeviceInfo.getUniqueID(), function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
            parent.getHomeCategoryData();
            // console.log('------ setFeedbackStatus response >>> '+JSON.stringify(data));
        }
    });
  }
  onAcceptSingleFeedback(id){
    this.setFeedbackStatus(id,'accepted');
  }
  onIgnoreFeedback(id){
    // alert(id);
    deleteFrom = 'ignored';
    deleteId = id;
    this.onDeleteCategoryFeedback('ignored',id);
  }
  setFeedbackStatus(id,status){
    this._modalLoadingSpinnerOverLay.show();
    Api.setFeedbackStatus(this, id, DeviceInfo.getUniqueID(), status, function(parent, data){
        parent._modalLoadingSpinnerOverLay.hide();
        if(data.error == '1'){

        }else{
          for(var i = 0 ; i < session.state.feedbackData.length ; i++){
            // console.log('------ onAcceptPopup content ---> '+session.state.barchartData[i].content.length);
            for(var j=0 ; j < session.state.feedbackData[i].content.length ; j++){
              // console.log('------ onAcceptPopup feedbacks ---> '+session.state.barchartData[i].content[j].feedbacks.length);
                if(session.state.feedbackData[i].content[j].id == deleteId){
                  session.state.feedbackData[i].content.splice(j, 1);
                }
            }
          }
          parent.getHomeCategoryData();
          deleteFrom = '';
          deleteId = '';
            // console.log('------ setFeedbackStatus response >>> '+JSON.stringify(data));
        }
    });
  }

  onDeleteCategoryFeedback(from,id){
    deleteFrom = from;
    deleteId = id;
    this.setState({isModalVisible : true})
  }
  deleteApi(){
    if(deleteFrom == 'feedback'){
      this._modalLoadingSpinnerOverLay.show();
      Api.setFeedbackStatus(this, deleteId, DeviceInfo.getUniqueID(), 'ignored', function(parent, data){
          parent._modalLoadingSpinnerOverLay.hide();
          if(data.error == '1'){

          }else{
              var tempArr = session.state.barchartData;
              for(var i = 0 ; i < tempArr.length ; i++){
                // console.log('------ onAcceptPopup content ---> '+session.state.barchartData[i].content.length);
                for(var j=0 ; j < tempArr[i].content.length ; j++){
                  // console.log('------ onAcceptPopup feedbacks ---> '+session.state.barchartData[i].content[j].feedbacks.length);
                  for(var k=0 ; k < tempArr[i].content[j].feedbacks.length ; k++){
                    // console.log('------ onAcceptPopup feedbacks data---> '+session.state.barchartData[i].content[j].feedbacks[k].id + ' -- ' + (session.state.barchartData[i].content[j].feedbacks[k].id == deleteId));
                    if(tempArr[i].content[j].feedbacks[k].id == deleteId){
                       tempArr[i].content[j].feedbacks.splice(k, 1);
                    }
                  }
                }
              }
            deleteFrom = '';
            deleteId = '';
            session.setState({barchartData : tempArr});
            // console.log('------ setFeedbackStatus response >>> '+JSON.stringify(session.state.barchartData));
          }
      });
      // Api.deleteFeedback(this, deleteId, DeviceInfo.getUniqueID(), function(parent, data){
      //     parent._modalLoadingSpinnerOverLay.hide();
      //     if(data.error == '1'){
      //
      //     }else{
      //       for(var i = 0 ; i < session.state.barchartData.length ; i++){
      //         // console.log('------ onAcceptPopup content ---> '+session.state.barchartData[i].content.length);
      //         for(var j=0 ; j < session.state.barchartData[i].content.length ; j++){
      //           // console.log('------ onAcceptPopup feedbacks ---> '+session.state.barchartData[i].content[j].feedbacks.length);
      //           for(var k=0 ; k < session.state.barchartData[i].content[j].feedbacks.length ; k++){
      //             console.log('------ onAcceptPopup feedbacks data---> '+session.state.barchartData[i].content[j].feedbacks[k].id + ' -- ' + (session.state.barchartData[i].content[j].feedbacks[k].id == deleteId));
      //             if(session.state.barchartData[i].content[j].feedbacks[k].id == deleteId){
      //               session.state.barchartData[i].content[j].feedbacks.splice(k, 1);
      //             }
      //           }
      //         }
      //       }
      //       console.log('------ onAcceptPopup delete ---> '+JSON.stringify(this.state.barchartData));
      //       deleteFrom = '';
      //       deleteId = '';
      //     }
      // });
    }else{
      this.setFeedbackStatus(deleteId,'ignored');
    }
  }

  onGetFeedbackClick(){
    Navigation.push(this.props.componentId, {
      component: {
        name: 'getFeedback',
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
  onGiveFeedbackClick(from){
    Navigation.push(this.props.componentId, {
      component: {
        name: 'giveFeedback',
        passProps: {
          personName:from,
        },
      }
    });
  }

  onSendReciprocateFeedback(name){
    this.onGiveFeedbackClick(name);
  }

  onCancelPopup(){
    this.setState({isModalVisible : false})
  }
  onAcceptPopup(){
    session.setState({isModalVisible : false})
    setTimeout(function(){
      session.deleteApi();
    },500);
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

  _renderfeedbackChildItem = ({ item: rowData, index }) => {
    let commonHeight = 140;
    return(
      <View style={{flexDirection: 'row',height:commonHeight,marginTop:4,marginBottom:4}} >
          <View style={{flex: 0.15}}/>
          <View style={{flex:0.85,flexDirection:'column',backgroundColor:'#fff',elevation: 1}}>
              <View style={{flex:0.2,flexDirection:'row'}}>
                  <Text style={{flex:0.7,color: "#000",fontSize:18,paddingLeft:4,paddingRight:4,paddingTop:4,paddingBottom:4,flexWrap:'wrap'}} numberOfLines={1}>{rowData.thumbnailName}</Text>
                  <View style={{flex:0.3,alignItems:'center',justifyContent:'center',padding:4,flexDirection:'row',marginRight:4}}>
                      <TouchableHighlight style={{flex:0.75,justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',borderWidth:1,marginRight:4}} underlayColor='transparent' onPress={() => { this.onAcceptSingleFeedback(rowData.id); }}>
                           <Text style={{color: "#4ec5c1",fontSize:12}}>Accept</Text>
                      </TouchableHighlight>
                      <TouchableHighlight style={{flex:0.25,alignItems:'flex-end'}} underlayColor='transparent' onPress={() => { this.onIgnoreFeedback(rowData.id); }}>
                           <Image style={{width: 16, height: 16}} source={require('../img/cancel.png')} resizeMode="contain" />
                      </TouchableHighlight>
                  </View>
              </View>
              <View style={{flex:0.8,flexDirection:'row'}}>
                  <View style={{flex: 0.95,alignItems: 'center',flexDirection:'row'}}>
                    <Image style={{width: 90, height: commonHeight}} source={{ uri : 'http://natably.com/images/thumbnails/'+rowData.thumbnailUrl}} resizeMode="contain" />
                    <Text style={{color: "#000",fontSize:14,flex:0.9}} >{rowData.feedback}</Text>
                  </View>
              </View>
          </View>
      </View>
    )
  }
  _renderfeedbackItem = ({ item: rowData, index }) => {
    // console.log('------ _renderfeedbackItem >>> '+JSON.stringify(rowData));
    return(
      <View style={{flexDirection: 'column',marginTop:4,marginBottom:8}}>
          <View style={{flexDirection: 'row',alignItems:'center'}} >
              <View style={{flex: 0.15,alignItems: 'center',justifyContent:'center',backgroundColor:'#efbf88',padding:2,borderRadius:5}}>
                <Text style={{color: "#fff",fontSize:16}}>New</Text>
              </View>
              <View style={{flex: 0.75,alignItems: 'center',marginLeft:8,flexDirection:'row'}}>
                <Text style={{color: "#000",fontSize:16,fontWeight:'bold'}}>{rowData.provider_name}</Text>
                <Text style={{color: "#000",fontSize:16}}> thinks you are:</Text>
              </View>
              {/*<TouchableHighlight style={{flex:0.15,justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',borderWidth:1,paddingLeft:8,paddingRight:8}} underlayColor='transparent' onPress={() => { this.onAcceptSingleFeedback(); }}>
                   <Text style={{color: "#4ec5c1",fontSize:12}}>Accept</Text>
              </TouchableHighlight>*/}
          </View>
          <FlatList
            style={{marginTop:8,marginBottom:4}}
            data={rowData.content}
            extraData={this.state}
            renderItem={this._renderfeedbackChildItem}
            keyExtractor={(item, index)=> index.toString()}
          />
            <TouchableHighlight style={{flex:0.1,justifyContent:'center',alignItems:'center',borderRadius:5,borderColor:'#4ec5c1',borderWidth:1,padding:8}} underlayColor='transparent' onPress={() => { this.onSendReciprocateFeedback(rowData.provider_name); }}>
                 <Text style={{color: "#4ec5c1",fontSize:15}}>Reciprocate, send [{rowData.provider_name}] feedback, too!</Text>
            </TouchableHighlight>
      </View>
    )
  }

  _renderRow = (rowItem, rowId, sectionId) => {
      // console.log('color ----------------> ' + JSON.stringify(rowItem));
      var feedbackItems = rowItem.feedbacks.map(function(item, index) {
          if(rowItem.feedbacks.length > index)
          {
            // console.log('color ----------------> ' + JSON.stringify(rowItem.feedbacks[index]));
            return (
              <View key={index} style={{flex:1,flexDirection: 'column',elevation:1,backgroundColor:'#fcfcfc',marginTop:4,marginBottom:4,paddingLeft:12,paddingRight:12,paddingTop:4,paddingBottom:4}} >
                  <View style={{flex: 0.1,flexDirection:'row'}}>
                      <Text style={{flex:0.9,color: "#000",fontSize:16,fontWeight:'bold'}} numberOfLines={1}>{rowItem.feedbacks[index].provider_name}:</Text>
                      <TouchableHighlight style={{flex:0.1,alignItems:'flex-end',padding:4}} underlayColor='transparent' onPress={() => { session.onDeleteCategoryFeedback('feedback',rowItem.feedbacks[index].id); }}>
                           <Image style={{width: 15, height: 15}} source={require('../img/cancel.png')} resizeMode="contain" />
                      </TouchableHighlight>
                  </View>
                  <Text style={{color: "#000",fontSize:14,flex:0.9}} numberOfLines={5}>{rowItem.feedbacks[index].feedback}</Text>
              </View>
            );
          }
      });
      return (
        <View key={rowId} style={{flex:1,flexDirection: 'column',backgroundColor:'#fff',marginTop:4,marginBottom:8}} >
            {/*<Text style={{flex:0.1,color: "#000",fontSize:18}}>Thumbnail Name</Text>*/}
            <View style={{flex: 0.2,flexDirection:'row',alignItems:'center',backgroundColor:'transparent',paddingTop:4,paddingBottom:4}}>
              <Image style={{width: 100, height: 100}} source={{uri:rowItem.thumbanail}} resizeMode="contain" />
              <Text style={{color: "#000",fontSize:12,flex:0.9,marginLeft:8}}>{rowItem.description}</Text>
            </View>
            <Text style={{flex:0.1,color: "#000",fontSize:20,fontWeight:'bold'}}>{rowItem.feedbacks.length} feedbacks:</Text>
            {feedbackItems}
        </View>
      );
  };
  _renderSection = (section, sectionId)  => {
    let res = section.split("+");
    let commonHeight = 30;
    // console.log('color ----------------> ' +section + " -- " +  width*res[1]/100 + ' -- ' + width);
    return (
      <View style={{flex:0.1,height:commonHeight,flexDirection: 'row',marginTop:8,marginBottom:8}} >
          <View style={{width:width*res[1]/100-32,height:commonHeight,backgroundColor:res[2],borderRadius:5,flexDirection: 'row',paddingLeft:10,paddingRight:10,alignItems:'center'}} >
              <Text style={{flex:1,color: "#fff",fontSize:15,fontWeight:'bold',flexWrap: 'wrap'}} numberOfLines={1}>{res[0]}</Text>
              {/*<View style={{flex:0.4,alignItems:'flex-end'}}>
                <Text style={{color: "#fff",fontSize:15,fontWeight:'bold'}}>{res[1]}</Text>
                <TextFit height={commonHeight} width={30} color={"#fff"} style={{color: "#fff",fontSize:15,fontWeight:'bold'}} >
                  {res[1]}
                </TextFit>
              </View>*/}
          </View>
      </View>
    );
  };

  render(){
      return (
        <View style={{flex: 1,backgroundColor: '#f9f9f9',flexDirection:'column'}}>
          {/*--------header--------*/}
          <LoadingSpinnerOverlay style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}} ref={ component => this._modalLoadingSpinnerOverLay = component } />
          <View style={{marginTop:this.state.topbarTopMargin,height:headerHeight,backgroundColor:headerBackColor,flexDirection:'row',paddingLeft:16,paddingRight:16}}>
              {/*left*/}
              <TouchableHighlight style={{flex: 0.1,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}} underlayColor='transparent' onPress={() => { this.onMenuClick(); }}>
                <Image style={{width: headerLeftMenuSize, height: headerLeftMenuSize}} source={require('../img/menu.png')} resizeMode="contain" />
              </TouchableHighlight>
              {/*center*/}
              <View style={{flex: 0.8,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
                <Image style={{width: 150, height: 56}} source={headerlogo} resizeMode="contain" />
              </View>
              {/*right*/}
              <View style={{flex: 0.1}}/>
          </View>
          {/*--------category barchart--------*/}
          {this.state.barchartData.length > 0 &&
            <View style={{flexDirection:'column',height:this.state.barchartHeight}}>
                <View style={{flex:0.8,flexDirection:'column',backgroundColor:'#fff',paddingBottom:16}}>
                    <View style={{flex:this.state.barchartHeaderFlex,alignItems:'center',backgroundColor:'#fff',marginTop:4,marginBottom:4}} >
                        <Text style={{color: "#000",fontSize:20,fontWeight:'bold',alignSelf:'center',paddingLeft:16,paddingRight:16}}>{this.state.barchartTitle}</Text>
                    </View>
                    <ExpanableList
                        ref={instance => this.ExpandableList = instance}
                        style={{flex:this.state.barchartListFlex,backgroundColor:'#fff',paddingLeft:16,paddingRight:16}}
                        dataSource={this.state.barchartData}
                        headerKey="header"
                        memberKey="content"
                        renderRow={this._renderRow}
                        renderSectionHeaderX={this._renderSection}
                        headerOnPress={(index) => this.headerOnPress(index)}
                    />
                </View>
                <View style={{flex:0.2,alignItems:'center',bottom:2}} >
                  <Image style={{width: 150, height: 30,backgroundColor:'transparent'}} source={require('../img/wave.png')} resizeMode="contain" />
                  <TouchableHighlight style={{bottom:40,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent',padding:8}} underlayColor='transparent' onPress={() => { this.onBarChartArrowClick(); }}>
                       <Image style={{width: 30, height: 30}} source={this.state.barChartArrow} resizeMode="contain" />
                  </TouchableHighlight>
                </View>
            </View>
          }
          {/*--------feedback---------*/}
          <View style={{flex:0.8,backgroundColor:'transparent'}}>
            {this.state.feedbackData.length > 0 &&
              <ScrollView contentContainerStyle={{paddingLeft:16,paddingRight:16,paddingTop:25}}>
                  {/*----- title------*/}
                  <View style={{flexDirection: 'row',alignItems:'center'}} >
                      <Text style={{flex:0.7,color: "#000",fontSize:25,fontWeight:'bold'}}>Notifications</Text>
                      <TouchableHighlight style={{flex:0.3,justifyContent:'center',alignItems:'center',backgroundColor:'transparent',paddingLeft:4,paddingRight:4}} underlayColor='transparent' onPress={() => { this.onAcceptAllFeedback(); }}>
                           <Text style={{color: "#f2473f",fontSize:15}}>Accept All</Text>
                      </TouchableHighlight>
                  </View>
                  <FlatList
                    style={{marginTop:16}}
                    data={this.state.feedbackData}
                    extraData={this.state}
                    renderItem={this._renderfeedbackItem}
                    keyExtractor={(item, index)=> index.toString()}
                  />
              </ScrollView>
            }
          </View>
          {/*--------give / get feedback---------*/}
          <View style={{flex:0.2,flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'#fff'}}>
              <TouchableHighlight style={{flex: 0.42,alignItems: 'center',justifyContent:'center',borderColor:'#4ec5c1',borderWidth:1,borderRadius:5,backgroundColor:'transparent'}} underlayColor='transparent' onPress={() => { this.onGetFeedbackClick(); }}>
                   <Text style={{color: "#4ec5c1",fontSize:18,padding:8,fontWeight:'bold'}}>Get Feedback</Text>
              </TouchableHighlight>
              <View style={{flex:0.05}}/>
              <TouchableHighlight style={{flex: 0.42,alignItems: 'center',justifyContent:'center',borderColor:'#4ec5c1',borderWidth:1,borderRadius:5,backgroundColor:'#4ec5c1'}} underlayColor='transparent' onPress={() => { this.onGiveFeedbackClick(''); }}>
                   <Text style={{color: "#fff",fontSize:18,padding:8,fontWeight:'bold'}}>Give Feedback</Text>
              </TouchableHighlight>
          </View>
          {/*-----------modal---------*/}
          <Modal animationIn={'fadeInDown'} animationOut={'fadeOutDown'} useNativeDriver={true}
            style={{flex: 1,justifyContent: "center",alignItems: "center"}} isVisible={this.state.isModalVisible}>
            {this._renderModalContent()}
          </Modal>
        </View>
      );
  }
}
const styles = StyleSheet.create({

});
module.exports = home;
