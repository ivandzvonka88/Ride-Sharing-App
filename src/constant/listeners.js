import { Platform, AsyncStorage, AppState } from 'react-native';
import { Navigation } from 'react-native-navigation';
import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType, NotificationActionType, NotificationActionOption, NotificationCategoryOption} from "react-native-fcm";
let lastGoogleId = '';
let isShowNotification = true;

AsyncStorage.getItem('lastNotification').then(data=>{
  if(data){
    // if notification arrives when app is killed, it should still be logged here
    console.log('notif -- last notification - ', JSON.parse(data));
    AsyncStorage.removeItem('lastNotification');
  }
})

AsyncStorage.getItem('lastMessage').then(data=>{
  if(data){
    // if notification arrives when app is killed, it should still be logged here
    console.log('notif -- last message- ', JSON.parse(data));
    AsyncStorage.removeItem('lastMessage');
  }
})

export function registerKilledListener(){
  // these callback will be triggered even when app is killed
  FCM.on(FCMEvent.Notification, notif => {
    AsyncStorage.setItem('lastNotification', JSON.stringify(notif));
    if(notif.opened_from_tray){
      setTimeout(()=>{
        if(notif._actionIdentifier === 'reply'){
          if(AppState.currentState !== 'background'){
            console.log('notif -- User replied -'+ JSON.stringify(notif._userText))
            // alert('User replied '+ JSON.stringify(notif._userText));
          } else {
            AsyncStorage.setItem('lastMessage', JSON.stringify(notif._userText));
          }
        }
        if(notif._actionIdentifier === 'view'){
          // alert("User clicked View in App");
        }
        if(notif._actionIdentifier === 'dismiss'){
          // alert("User clicked Dismiss");
        }
      }, 1000)
    }
  });
}

// these callback will be triggered only when app is foreground or background
export function registerAppListener(navigation){
  // FCM.on(FCMEvent.Notification, notif => {
  //   console.log("notif -- Notification ***** -- ", notif);
  //
  //   if(Platform.OS ==='ios' && notif._notificationType === NotificationType.WillPresent && !notif.local_notification){
  //     // this notification is only to decide if you want to show the notification when user if in foreground.
  //     // usually you can ignore it. just decide to show or not.
  //     notif.finish(WillPresentNotificationResult.All)
  //     return;
  //   }
  //   if(Platform.OS ==='ios'){
  //           //optional
  //           //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
  //           //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
  //           //notif._notificationType is available for iOS platfrom
  //           switch(notif._notificationType){
  //             case NotificationType.Remote:
  //               if(notif.opened_from_tray){
  //                 if(isShowNotification){
  //                   setTimeout(()=>{
  //                       // navigation.navigate('Home')
  //                       navigation.resetTo({
  //                           screen: "Home",
  //                           navigatorStyle: {
  //                             navBarHidden: true,
  //                           },
  //                           passProps:{
  //                             from:'notif',
  //                             audio_link: 'https://storage.googleapis.com/kvorum_test_bucket/app/video/65/a/out.m3u8',
  //                             video_link: 'https://storage.googleapis.com/kvorum_test_bucket/app/video/65/v/out.m3u8',
  //                             audio_seek: 1444.1,
  //                             video_seek: 1444.1,
  //                             stream_id: 65,
  //                             ocurrence_id: 1,
  //                             thumbnail: 'https://kvorum.hr:7443/storage/ffmpeg/65/out144.ts.png',
  //                           }
  //                       });
  //                       isShowNotification = true;
  //                   }, 500)
  //                   isShowNotification = false;
  //                 }
  //               }else{
  //                 isShowNotification = true;
  //                 FCM.presentLocalNotification({
  //                   channel: 'default',
  //                   id: 1, // (optional for instant notification)
  //                   title: notif.aps.alert.title, // as FCM payload
  //                   body: notif.aps.alert.body, // as FCM payload (required)
  //                   icon: 'notification_icon_color',
  //                   color:'#020B27',
  //                   // sound: "bell.mp3", // "default" or filename
  //                   // priority: "high", // as FCM payload
  //                   show_in_foreground: true, // notification when app is in foreground (local & remote)
  //                   click_action: "fcm.ACTION.HELLO"
  //                 });
  //               }
  //               notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
  //               break;
  //             case NotificationType.NotificationResponse:
  //               notif.finish();
  //               break;
  //             case NotificationType.WillPresent:
  //               notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
  //               // this type of notificaiton will be called only when you are in foreground.
  //               // if it is a remote notification, don't do any app logic here. Another notification callback will be triggered with type NotificationType.Remote
  //               break;
  //           }
  //   }else {
  //     if(notif.opened_from_tray){
  //       if(isShowNotification){
  //         setTimeout(()=>{
  //             // navigation.navigate('Home')
  //             navigation.resetTo({
  //                 screen: "Home",
  //                 navigatorStyle: {
  //                   navBarHidden: true,
  //                 },
  //                 passProps:{
  //                   from:'notif',
  //                   audio_link: 'https://storage.googleapis.com/kvorum_test_bucket/app/video/65/a/out.m3u8',
  //                   video_link: 'https://storage.googleapis.com/kvorum_test_bucket/app/video/65/v/out.m3u8',
  //                   audio_seek: 1444.1,
  //                   video_seek: 1444.1,
  //                   stream_id: 65,
  //                   ocurrence_id: 1,
  //                   thumbnail: 'https://kvorum.hr:7443/storage/ffmpeg/65/out144.ts.png',
  //                 }
  //             });
  //             isShowNotification = true;
  //         }, 500)
  //         isShowNotification = false;
  //       }
  //     }else{
  //       isShowNotification = true;
  //       FCM.presentLocalNotification({
  //         channel: 'default',
  //         id: 1, // (optional for instant notification)
  //         title: notif.fcm.title, // as FCM payload
  //         body: notif.fcm.body, // as FCM payload (required)
  //         icon: 'notification_icon_color',
  //         color:'#020B27',
  //         // sound: "bell.mp3", // "default" or filename
  //         // priority: "high", // as FCM payload
  //         show_in_foreground: true, // notification when app is in foreground (local & remote)
  //         click_action: "fcm.ACTION.HELLO"
  //       });
  //     }
  //   }
  // });

  FCM.on(FCMEvent.RefreshToken, token => {
    console.log("notif --  TOKEN (refreshUnsubscribe)- ", token);
  });
  FCM.on("FCMTokenRefreshed", token => {
        //update token to server
        console.log("notif --  TOKEN (refreshUnsubscribe)- ", token);
  });

  FCM.enableDirectChannel();
  FCM.on(FCMEvent.DirectChannelConnectionChanged, (data) => {
    console.log('notif -- direct channel connected- ' + data);
  });
  setTimeout(function() {
    FCM.isDirectChannelEstablished().then(d => console.log(d));
  }, 1000);


}
