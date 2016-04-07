//connecting to firebase for Channels
angular.module('schedulizer')
  .factory('Channels', function($firebaseArray, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'channels');
    var channels = $firebaseArray(ref);

    return channels;
  });