import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,Image,Button,TouchableHighlight,ScrollView, StatusBar, AsyncStorage
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import {headerHeight,headerBackColor,headerlogo,headerLeftMenuSize,checkIphoneX} from '../constant/const';

const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam id dui vitae nunc venenatis hendrerit. Donec facilisis ultricies fringilla. Vivamus aliquam quam vitae mauris pellentesque finibus. Curabitur finibus nec mauris in interdum. Pellentesque id vulputate libero, sit amet mollis nisi. Quisque efficitur turpis a dolor lobortis laoreet. Etiam at neque nulla. Pellentesque nulla eros, venenatis non sem vitae, vestibulum pharetra orci. Pellentesque quam velit, posuere eget dui vitae, commodo pellentesque quam. \n\n Nunc laoreet, purus pharetra viverra lacinia, tellus eros pulvinar sapien, sit amet laoreet sapien enim in mi. Maecenas nulla justo, dapibus ac pulvinar nec, malesuada ut arcu. Sed vehicula diam convallis risus euismod iaculis. Maecenas volutpat mattis ipsum ut imperdiet. Curabitur eget lacus ut eros fringilla facilisis. Proin sed diam eget urna pretium pulvinar ac sed quam.\n\nAenean placerat ex non orci efficitur, quis finibus velit placerat. Curabitur ac libero blandit, mattis nisl quis, pharetra orci. Sed sed risus quis libero consequat lobortis. Vivamus nec est nulla. Curabitur ac leo faucibus, blandit arcu sed, placerat nunc. Nam eu orci non enim congue iaculis. Sed mollis, purus in suscipit finibus, felis dui facilisis dui, eu lobortis sapien massa sed leo. In venenatis porttitor purus sit amet faucibus.\n\nNulla luctus semper purus, sit amet suscipit orci maximus eu. Ut pulvinar a massa blandit mollis. Morbi fringilla rhoncus\n\n purus vel malesuada. Nam ac auctor turpis, ac accumsan sem. Donec diam tortor, porttitor vel tincidunt sit amet, feugiat a massa. Curabitur condimentum maximus felis, eu lobortis mi hendrerit in. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.';

class appInfo extends Component {
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
    StatusBar.setBarStyle('light-content', true);
    this.state = {
      topbarTopMargin:0,
    }
  }
  componentDidMount() {
    this.setState({topbarTopMargin:checkIphoneX()});
  }
  onBackClick(){
    Navigation.pop(this.props.componentId);
  }

  render(){
      return (
        <View style={{ flex: 1,backgroundColor: '#fff' }}>
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
          {/*---------- content ------- */}
          <View style={{flex: 1,marginTop:8}}>
            <ScrollView contentContainerStyle={{backgroundColor:'transparent',paddingTop:10,paddingBottom:10}}>
                <Text style={{color: '#333333',fontSize:16,marginLeft:25,marginRight:25}}>{longText}</Text>
            </ScrollView>
          </View>
        </View>
      );
  }
}
const styles = StyleSheet.create({
});
module.exports = appInfo;
