'use strict';

//dependencies
const webpush = require('web-push'),
    gcm = require('node-gcm');

exports.sendPushNotification = function (webEndPoint, senderGCM, notificationData) {
    webNotifications(webEndPoint, notificationData);
    mobileNotifications(senderGCM, notificationData);
};

function webNotifications(webEndPoint, notificationData) {
    if (webEndPoint) {
        webpush.setGCMAPIKey('AIzaSyC_cF6XxPyOpQXdM01txENJsPfLQ61lDzE');
        webpush.setVapidDetails(
            'mailto:arel-g@hotmail.com',
            "BA9TXkOAudBsHZCtma-VftBiXmAc-Ho4M7SwAXRpZDR-DsE6pdMP_HVTTQaa3vkQuHLcB6hB87yiunJFUEa4Pas",
            "9wDAtLKaQZh08dyQzkLkXHnLSGbMeeLA0TErWrE_Gjw"
        );
        webpush.sendNotification(webEndPoint, JSON.stringify(notificationData));
    }
}

function mobileNotifications(senderGCM, data) {
    if (senderGCM !== null && typeof senderGCM !== 'undefined' && senderGCM.valid) {
        // Set up the sender with your GCM/FCM API key (declare this once for multiple messages)
        const sender = new gcm.Sender('AIzaSyAy5Z6ByEm4CX3YwohagPTOi0qlMC3XPaU');

        // Prepare a message to be sent
        const message = new gcm.Message();

        message.addData('data', data);
        message.addNotification('message', data.message ? data.message : "New Invite");

        // Specify which registration IDs to deliver the message to
        const regTokens = [senderGCM.senderId];

        // Actually send the message
        sender.send(message, {registrationTokens: regTokens}, function (err, response) {
            if (err) console.error(err);
            else console.log('success');
        });

    }
}
