angular.module('angularfireSlackApp')
  .factory('Users', function($firebaseArray, $firebaseObject, FirebaseUrl){

    var usersRef = new Firebase(FirebaseUrl+'users');
    var connectedRef = new Firebase(FirebaseUrl+'.info/connected');
    var users = $firebaseArray(usersRef);

    var Users = {
        //getting profile based on Id
      getProfile: function(uid) {
        return $firebaseObject(usersRef.child(uid));
      },
        //getting display name based on Id
      getDisplayName: function(uid){
        return users.$getRecord(uid).displayName;
      },
        //getting gravatar based on emailHash
      getGravatar: function(uid){
        return '//www.gravatar.com/avatar/' + users.$getRecord(uid).emailHash;
      },
        //setting user to online
      setOnline: function(uid){
        var connected = $firebaseObject(connectedRef);
        var online = $firebaseArray(usersRef.child(uid+'/online'));

        connected.$watch(function(){
            //watching to see if the user online status changes
          if(connected.$value === true){
            online.$add(true).then(function(connectedRef){
                //on disconect online status is removed
              connectedRef.onDisconnect().remove();
            });
          }
        });
      },
        //grabbing all user data
      all: users
    };

    return Users;
  });