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