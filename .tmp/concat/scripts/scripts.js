'use strict';

//main model for app
angular
  .module('schedulizer', [
    'firebase',
    'angular-md5',
    'ui.router'
  ])
  .config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'home/home.html',
        resolve: {
          requireNoAuth: function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('channels');
            }, function(error){
              return;
            });
          }
        }
      })
      .state('login', {
        url: '/login',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/login.html',
        resolve: {
          requireNoAuth: function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('home');
            }, function(error){
              return;
            });
          }
        }
      })
      .state('register', {
        url: '/register',
        controller: 'AuthCtrl as authCtrl',
        templateUrl: 'auth/register.html',
        resolve: {
          requireNoAuth: function($state, Auth){
            return Auth.$requireAuth().then(function(auth){
              $state.go('home');
            }, function(error){
              return;
            });
          }
        }
      })
      .state('schedule', {
        url: '/schedule',
        controller: 'ScheduleCtrl as scheduleCtrl',
        templateUrl: 'calendar/calendar.html',
        resolve: {
            auth: function($state, Users, Auth){
                return Auth.$requireAuth().catch(function(){
                    $state.go('schedule');
      });
    },
    profile: function(Users, Auth){
        return Auth.$requireAuth().then(function(auth){
            return Users.getProfile(auth.uid).$loaded();
        });
            }
        }
    })
      .state('profile', {
        url: '/profile',
        controller: 'ProfileCtrl as profileCtrl',
        templateUrl: 'users/profile.html',
        resolve: {
          auth: function($state, Users, Auth){
            return Auth.$requireAuth().catch(function(){
              $state.go('home');
            });
          },
          profile: function(Users, Auth){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded();
            });
          }
        }
      })
      .state('channels', {
        url: '/channels',
        controller: 'ChannelsCtrl as channelsCtrl',
        templateUrl: 'channels/index.html',
        resolve: {
          channels: function (Channels){
            return Channels.$loaded();
          },
          profile: function ($state, Auth, Users){
            return Auth.$requireAuth().then(function(auth){
              return Users.getProfile(auth.uid).$loaded().then(function(profile){
                if(profile.displayName){
                  return profile;
                } else {
                  $state.go('profile');
                }
              });
            }, function(error){
              $state.go('home');
            });
          }
      }
    })
    .state('channels.create', {
      url: '/create',
      templateUrl: 'channels/create.html',
      controller: 'ChannelsCtrl as channelsCtrl'
    })
    .state('channels.messages', {
      url: '/{channelId}/messages',
      templateUrl: 'channels/messages.html',
      controller: 'MessagesCtrl as messagesCtrl',
      resolve: {
        messages: function($stateParams, Messages){
          return Messages.forChannel($stateParams.channelId).$loaded();
        },
        channelName: function($stateParams, channels){
          return '#'+channels.$getRecord($stateParams.channelId).name;
        }
      }
    })
    .state('channels.direct', {
      url: '/{uid}/messages/direct',
      templateUrl: 'channels/messages.html',
      controller: 'MessagesCtrl as messagesCtrl',
      resolve: {
          //get the messages
        messages: function($stateParams, Messages, profile){
          return Messages.forUsers($stateParams.uid, profile.$id).$loaded();
        },
        channelName: function($stateParams, Users){
          return Users.all.$loaded().then(function(){
            return '@'+Users.getDisplayName($stateParams.uid);
          });
        }
      }
    });

    $urlRouterProvider.otherwise('/');
  })
  .constant('FirebaseUrl', 'https://finalprojectgarza.firebaseio.com/');

'use strict';
//ins module
angular.module('schedulizer')
  .controller('AuthCtrl', function(Auth, $state){
    var authCtrl = this;

    console.log(Auth);
    
    authCtrl.user = {
      email: '',
      password: ''
    };

    authCtrl.login = function (){
        // pulling user auth data then redirecting to home state
      Auth.$authWithPassword(authCtrl.user).then(function (auth){
        $state.go('home');
      }, function (error){
        authCtrl.error = error;
      });
    };

    authCtrl.register = function (){
        //sending data from register to firebase then loging in
      Auth.$createUser(authCtrl.user).then(function (user){
        authCtrl.login();
      }, function (error){
        authCtrl.error = error;
      })
    }
  });
'use strict';

angular.module('schedulizer')
//connectiong to firebase
  .factory('Auth', function($firebaseAuth, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl);
    var auth = $firebaseAuth(ref);

    return auth;
  });
angular.module('schedulizer')
  .factory('Users', function($firebaseArray, $firebaseObject, FirebaseUrl) {

    var usersRef = new Firebase(FirebaseUrl+'users');
    var connectedRef = new Firebase(FirebaseUrl+'.info/connected');
    var users = $firebaseArray(usersRef);
    var firebaseRef = new Firebase("https://finalprojectgarza.firebaseio.com/");
    var geoFire = new GeoFire(firebaseRef);
    var ref = geoFire.ref();
    console.log("Geo Ref ",ref);

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
          console.log("online");
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
angular.module('schedulizer')
  .controller('ProfileCtrl', function($state, md5, auth, profile){
    var profileCtrl = this;

    profileCtrl.profile = profile;
    //updating the users profile then directing to the channels state.
    profileCtrl.updateProfile = function(){
      profileCtrl.profile.emailHash = md5.createHash(auth.password.email);
      profileCtrl.profile.$save().then(function(){
        $state.go('channels');
      });
    }
  });
angular.module('schedulizer')
  .controller('ChannelsCtrl', function($state, Auth, Users, profile, channels){
    var channelsCtrl = this;

    channelsCtrl.profile = profile;
    channelsCtrl.channels = channels;
    
    //access all users in database
    channelsCtrl.users = Users.all;
    //getting user info
    channelsCtrl.getDisplayName = Users.getDisplayName;
    channelsCtrl.getGravatar = Users.getGravatar;
    //setting user online based on id
    Users.setOnline(profile.$id);
    //logout using $unauth then sending to home
    channelsCtrl.logout = function(){
        //save that user is no longer online
      channelsCtrl.profile.online = null;
      channelsCtrl.profile.$save().then(function(){
        Auth.$unauth();
        $state.go('home');
      });
    };

    channelsCtrl.newChannel = {
      name: ''
    };
    //adding a new channel then redirecting to channels.messages state based on the Id
    channelsCtrl.createChannel = function() {
      channelsCtrl.channels.$add(channelsCtrl.newChannel).then(function(ref){
          $state.go('channels.messages', {channelId: ref.key()});
        });
    }
  });
//connecting to firebase for Channels
angular.module('schedulizer')
  .factory('Channels', function($firebaseArray, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl+'channels');
    var channels = $firebaseArray(ref);

    return channels;
  });
angular.module('schedulizer')
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
angular.module('schedulizer')
  .controller('MessagesCtrl', function(profile, channelName, messages){
    var messagesCtrl = this;
    
    //injected via scope
    messagesCtrl.messages = messages;
    messagesCtrl.channelName = channelName;
    
    //setting blank message
    messagesCtrl.message = '';
    //validating and sending the message
    messagesCtrl.sendMessage = function(){
        //if not empty
      if(messagesCtrl.message.length > 0) {
          //adding to the array
        messagesCtrl.messages.$add({
            //profile info
          uid: profile.$id,
            //body of message
          body: messagesCtrl.message,
          timestamp: Firebase.ServerValue.TIMESTAMP
        }).then(function(){
            //reseting to blank
          messagesCtrl.message = '';
        });
      }
    }
  });
angular.module('schedulizer')

.controller('ScheduleCtrl', function($scope, $firebaseObject, $firebaseArray, $firebase) { 
  
  // connect to firebase 
  var ref = new Firebase("https://finalprojectschedule.firebaseio.com/days");  
  var fb =  $firebaseArray(ref); 
  $scope.days = fb;

$scope.reset = function() {
    
  ref.set({
    monday: {
        name: 'Monday',
        slots: {
          900: {
            time: '9:00am',
            booked: false
          },
          0110: {
            time: '11:00am',
            booked: false
          },
          100: {
            time: '1:00pm',
            booked: false
          },
          300: {
            time: '3:00pm',
            booked: false
          },
          500: {
            time: '5:00pm',
            booked: false
          },
          700: {
            time: '7:00pm',
            booked: false
          }
    	  }
      },
      tuesday: {
        name: 'Tuesday',
        slots: {
          900: {
            time: '9:00am',
            booked: false
          },
          0110: {
            time: '11:00am',
            booked: false
          },
          100: {
            time: '1:00pm',
            booked: false
          },
          300: {
            time: '3:00pm',
            booked: false
          },
          500: {
            time: '5:00pm',
            booked: false
          },
          700: {
            time: '7:00pm',
            booked: false
          }
    	  }
      },
      wednesday: {
        name: 'Wednesday',
        slots: {
          900: {
            time: '9:00am',
            booked: false
          },
          0110: {
            time: '11:00am',
            booked: false
          },
          100: {
            time: '1:00pm',
            booked: false
          },
          300: {
            time: '3:00pm',
            booked: false
          },
          500: {
            time: '5:00pm',
            booked: false
          },
          700: {
            time: '7:00pm',
            booked: false
          }
        }
      }
      
  });
}
});