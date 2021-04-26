import { Navigation } from 'react-native-navigation';
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['RCTBridge']);


import splash from './src/components/splash';
import login from './src/components/login';
// import terms from './src/components/terms';
// import info from './src/components/info';
// import sidemenu from './src/components/sidemenu';
// import getFeedback from './src/components/getFeedback';
// import profile from './src/components/profile';
import home from './src/components/home';
// import giveFeedback from './src/components/giveFeedback';
// import appInfo from './src/components/appInfo';


Navigation.registerComponent('splash', () => splash);
Navigation.registerComponent('login', () => login);
// Navigation.registerComponent('terms', () => terms);
// Navigation.registerComponent('info', () => info);
// Navigation.registerComponent('sidemenu', () => sidemenu);
// Navigation.registerComponent('getFeedback', () => getFeedback);
// Navigation.registerComponent('profile', () => profile);
Navigation.registerComponent('home', () => home);
// Navigation.registerComponent('giveFeedback', () => giveFeedback);
// Navigation.registerComponent('appInfo', () => appInfo);


Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setRoot({
    root: {
      stack: {
        children: [{
          component: {
            name: 'splash'
          }
        }]
      }
    }
  });
});

// // with sidemenu
// Navigation.events().registerAppLaunchedListener(() => {
//   Navigation.setRoot({
//   root: {
//     sideMenu: {
//       left: {
//         component: {
//           name: 'sidemenu',
//         }
//       },
//       center: {
//         stack: {
//           children: [
//             {
//               component: {
//                 id: 'appStack',
//                 name: 'login',
//               }
//             }
//           ]
//         }
//       },
//     }
//   }
//   })
// });
