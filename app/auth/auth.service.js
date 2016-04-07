'use strict';

angular.module('schedulizer')
//connectiong to firebase
  .factory('Auth', function($firebaseAuth, FirebaseUrl){
    var ref = new Firebase(FirebaseUrl);
    var auth = $firebaseAuth(ref);

    return auth;
  });