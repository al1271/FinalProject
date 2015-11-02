angular.module('angularfireSlackApp')
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