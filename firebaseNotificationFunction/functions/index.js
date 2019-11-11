'use-strict'


const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();


exports.sendNotification = functions.database.ref('/notifications/{user_id}/{notification_id}').onWrite((change, context) => {
    
    const user_id = context.params.user_id;
    const notification_id = context.params.notification_id;

    console.log('We have a notification to send to : ', context.params.user_id);

    if(!change.after.val()){
       console.log('Notification was deleted from the Database : ', context.params.notification_id);
    }

    const fromUser = admin.database().ref(`/notifications/${user_id}/${notification_id}`).once('value');
    return fromUser.then(fromUserResult => {

        const from_user_id = fromUserResult.val().from;

        const userQuery = admin.database().ref(`Users/${from_user_id}/name`).once('value');
        return userQuery.then(userResult => {

            const userName = userResult.val();

            const deviceToken = admin.database().ref('/Users/'+ user_id +'/device_token').once('value');
    
            return deviceToken.then(result => {
                const token_id = result.val();
                const payload = {
                    notification: {
                        title: "Friend Request",
                        body: `${userName} has sent you Friend Request`,
                        icon: "default"
                    }
                };
                return admin.messaging().sendToDevice(token_id,payload).then(response => {
                    return console.log('This was the notification feature');
                });
            });
            
        });

    });
  
});