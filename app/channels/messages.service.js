angular.module('angularfireSlackApp')
  .factory('Messages', function($firebaseArray, FirebaseUrl){
    var channelMessagesRef = new Firebase(FirebaseUrl+'channelMessages');
    var userMessagesRef = new Firebase(FirebaseUrl+'userMessages');

    return {
        //sending messages in channels
      forChannel: function(channelId){
        return $firebaseArray(channelMessagesRef.child(channelId));
      },
        //tracking by diffrent user ids
      forUsers: function(uid1, uid2){
          //sending messages to users
          //user with lower id will hold convo with user with higher id
        var path = uid1 < uid2 ? uid1+'/'+uid2 : uid2+'/'+uid1;
          //way to insure users pulling messages from right path
        return $firebaseArray(userMessagesRef.child(path));
      }
    }
  });