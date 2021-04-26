import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,Dimensions,
  View,Image,FlatList,TouchableHighlight,ScrollView, StatusBar, AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import { BarChart } from 'react-native-charts';
import {headerHeight,headerBackColor,headerlogo,headerLeftMenuSize,checkIphoneX} from '../constant/const';

const barData = [
{
  fillColor: '#46b3f7',
  data: [
    { value: 10 },
  ]
},
{
  fillColor: '#3386b9',
  data: [
    { value: 14 },
  ]
},
];

var width,height;

class info extends Component {

  static options(passProps) {
      return {
        topBar: {
          translucent: false,
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
    StatusBar.setBarStyle('light-content', true);
    height = Dimensions.get('window').height;
    width = Dimensions.get('window').width;
    this.state = {
      topbarTopMargin:0,
    }
  }
  componentDidMount() {
    this.setState({topbarTopMargin:checkIphoneX()})
  }

  onInfoSubmitClick(){
    if(this.props.from == 'menu'){
      Navigation.pop(this.props.componentId);
    }else{
      Navigation.push(this.props.componentId, {
        component: {
          name: 'profile',
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
  }

  _renderItem = () => {
    let commonHeight = 140;
    return(
      <View style={{flexDirection: 'column',height:commonHeight,marginTop:4,marginBottom:4,backgroundColor:'#fff',elevation: 1}} >
          <View style={{flex:0.25,flexDirection:'row'}}>
              <Text style={{flex:0.9,color: "#000",fontSize:16,padding:4}}>Category Name</Text>
          </View>
          <View style={{flex:0.75,alignItems: 'center',flexDirection:'row'}}>
                <Image style={{width: 90, height: commonHeight}} source={require('../img/testing.png')} resizeMode="contain" />
                <Text style={{color: "#000",fontSize:14,flex:0.9}} numberOfLines={5}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam id dui vitae nunc venenatis hendrerit. Donec facilisis ultricies fringilla. Vivamus aliquam quam vitae mauris pellentesque finibus.</Text>
          </View>
      </View>
    )
  }

  render(){
      return (
        <View style={{flex: 1,backgroundColor: '#fff',flexDirection:'column'}}>
          {/*--------header--------*/}
          <View style={{marginTop:this.state.topbarTopMargin,height:headerHeight,backgroundColor:headerBackColor,flexDirection:'row',paddingLeft:16,paddingRight:16}}>
              {/*left*/}
              <View style={{flex: 0.1}}/>
              {/*center*/}
              <View style={{flex: 0.8,alignItems: 'center',justifyContent:'center',backgroundColor:'transparent'}}>
                <Image style={{width: 150, height: 56}} source={headerlogo} resizeMode="contain" />
              </View>
              {/*right*/}
              <View style={{flex: 0.1}}/>
          </View>
          <ScrollView contentContainerStyle={{paddingLeft:16,paddingRight:16}}>
              {/*--------title and description--------*/}
              <View style={{flex:0.3,flexDirection:'column'}}>
                  <Text style={{color: "#000",fontSize:20,fontWeight:'bold',alignSelf:'center',marginTop:8,marginBottom:8}}>How to</Text>
                  <Text style={{color: "#000",fontSize:14,alignSelf:'center',marginTop:8,marginBottom:8,paddingLeft:32,paddingRight:32}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam id dui vitae nunc venenatis hendrerit. Donec facilisis ultricies fringilla. Vivamus aliquam quam vitae mauris pellentesque finibus.</Text>
              </View>
              {/*--------category barchart--------*/}
              <View style={{flex:0.2,flexDirection:'column'}}>
                  <BarChart
                      dataSets={barData}
                      graduation={10}
                      horizontal={false}
                      showGrid={true}
                      barSpacing={5}
                      style={{
                      height: 100,
                      margin: 15,
                  }}/>
              </View>
              {/*--------category list---------*/}
              <View style={{flex:0.8,Direction:'column'}}>
                  <FlatList
                    style={{flex:0.9,marginTop:8}}
                    data={[{key: 'a'}, {key: 'b'},{key: 'c'}, {key: 'd'}]}
                    extraData={this.state}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                  />
              </View>
              {/*--------another description--------*/}
              <View style={{flexDirection:'column',paddingLeft:32,paddingRight:32,marginTop:32}}>
                  <Text style={{color: "#000",fontSize:14,alignSelf:'center',marginTop:8,marginBottom:8}}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam id dui vitae nunc venenatis hendrerit. Donec facilisis ultricies fringilla. Vivamus aliquam quam vitae mauris pellentesque finibus.</Text>
              </View>
              {/*--------send and receive ghraphic--------*/}
              <View style={{flexDirection:'column',paddingLeft:32,paddingRight:32,marginTop:32,alignItems:'center'}}>
                  <Image style={{width: 150, height: 90}} source={require('../img/testing.png')} resizeMode="contain" />
              </View>
              {/*--------another description--------*/}
              <TouchableHighlight style={{borderRadius: 3,alignSelf: 'center',marginTop:30,marginBottom:30}} underlayColor='transparent' onPress={() => { this.onInfoSubmitClick(); }}>
                  <View style={{backgroundColor: '#4ec5c1',alignItems: 'center',borderRadius: 3}}>
                    <Text style={{padding: 12,textAlign: 'center',fontSize: 16,color: '#FFF',fontWeight: 'bold',paddingLeft:80,paddingRight:80}} >OK</Text>
                  </View>
               </TouchableHighlight>
          </ScrollView>
        </View>
      );
  }
}
const styles = StyleSheet.create({

});
module.exports = info;
