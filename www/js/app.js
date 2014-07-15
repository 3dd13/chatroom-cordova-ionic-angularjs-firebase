//global default user position
userPosition =[40.777225004040009, 73.95218489597806];

//active watch...
var activeWatch;
document.addEventListener("deviceready", onDeviceReady, false);
document.addEventListener("resume", onDeviceReady, false);


document.addEventListener('deviceready', function() {
 

    setTimeout(function(){
      navigator.splashscreen.hide();

    }, 2000);
      
  });


     // device APIs are available
    //

   
    function onDeviceReady() {
      //reset the locErrorShow message for no location, so that a user will only see the no location message once each session.  
  locErrorShown=false;


      //clear old intervals that were running
      //logout();
      logout();
      setupWatch(10000);

        if(navigator.network.connection.type== "none"){
              userOffline();
            }


        navigator.geolocation.getCurrentPosition(onSuccess, onError);
      }



    // onSuccess Geolocation
    //
    function onSuccess(position) {

    


      userPosition=[position.coords.latitude, position.coords.longitude];
      localStorage.setItem("lat", position.coords.latitude );
      localStorage.setItem("lon", position.coords.longitude);
      
      jGlob.onRefresh();

        var element = document.getElementById('geolocation');
        console.log ( 'Latitude: '           + position.coords.latitude              + '<br />' +
                            'Longitude: '          + position.coords.longitude             + '<br />' +
                            'Altitude: '           + position.coords.altitude              + '<br />' +
                            'Accuracy: '           + position.coords.accuracy              + '<br />' +
                            'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
                            'Heading: '            + position.coords.heading               + '<br />' +
                            'Speed: '              + position.coords.speed                 + '<br />' +
                            'Timestamp: '          + position.timestamp                    + '<br />');



    }

    // onError Callback receives a PositionError object
    //
    
    function onError(error) {
    if(locErrorShown==false){
      locErrorShown=true;
               navigator.notification.alert(
        'There was a problem getting your location. We are defaulting you to the Upper East Side of Manhattan in New York City, USA. \n To change this, please visit your phone\'s settings. Find this app in Location, and turn it on.',  // message
        noLocation,         // callback
        'Location Settings',            // title
        'OK'                  // buttonName
        );
    }

   
       // alert('code: '    + error.code    + '\n' +
            //  'message: ' + error.message + '\n');
    }



// sets up the interval at the specified frequency
function setupWatch(freq) {
    // global var here so it can be cleared on logout (or whenever).
    activeWatch = setInterval(watchLocation, freq);
}

// this is what gets called on the interval.
function watchLocation() {
  
    var gcp = navigator.geolocation.getCurrentPosition(
            onSuccess, onError);


    // console.log(gcp);

}


// stop watching

function logout() {
    clearInterval(activeWatch);
}      


//chat bot ... extra

chatBotOn =true;
function sayHelloUponEnter(msgParams){


  chatBotOn=false;
 
  msgParams['msg']="hello";
  $.ajax({
    url:"http://talk2bot-tester588.rhcloud.com/chatbot",
    data:msgParams,
    complete:function(transport){
     
      console.log(transport.responseText);
    }

  })

} 

function respondEveryUser(msgParams){
  if(chatBotOn==false){
    setTimeout(function(){
      chatBotOn=true;
    }, 6000);
    return;

  }
  chatBotOn=false;
  $.ajax({
    url:"http://talk2bot-tester588.rhcloud.com/chatbot",
    data:msgParams,
    complete:function(transport){
     
      console.log(transport.responseText);
    }

  })


}                                

function userOffline(){

   navigator.notification.alert(
    'You are not currently connected to the internet. \nPlease connect to use all features of this application.',  // message
    alertDismissed,         // callback
    'Offline',            // title
    'OK'                  // buttonName
);
}

function doNothing(){}


function alertDismissed(){


}
function noLocation(){

}

//for lat/lon dist calc in controller
function deg2rad(deg) {
  return deg * (Math.PI/180)
}



angular.module('chatRoom', ['ionic', 'ngRoute', 'ngAnimate', 'chatRoom.services', 'chatRoom.controllers', 'firebase'])

.config(function ($compileProvider){
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.config(function($routeProvider, $locationProvider) {
  $routeProvider.when('/home', {
    templateUrl: 'templates/home.html',
    controller: 'MainCtrl'
  });


  
  $routeProvider.when('/rooms/new', {
    templateUrl: 'templates/new_room.html',
    controller: 'NewRoomCtrl'
  });  

  $routeProvider.when('/location', {
    templateUrl: 'templates/new_room.html',
    controller: 'LocCtrl'
  });  
  
  $routeProvider.when('/rooms/:roomId', {
    templateUrl: 'templates/room.html',
    controller: 'RoomCtrl'
  });

  
  $routeProvider.when('/about', {
    templateUrl: 'templates/about.html',
    controller: 'AboutCtrl'
  });    
  
  $routeProvider.otherwise({
    redirectTo: '/home'
  });

});


angular.module('myApp.filters', [])
   .filter('interpolate', ['version', function(version) {
      return function(text) {
         return String(text).replace(/\%VERSION\%/mg, version);
      }
   }])

   .filter('reverse', function() {
      function toArray(list) {
         var k, out = [];
         if( list ) {
            if( angular.isArray(list) ) {
               out = list;
            }
            else if( typeof(list) === 'object' ) {
               for (k in list) {
                  if (list.hasOwnProperty(k)) { out.push(list[k]); }
               }
            }
         }
         return out;
      }
      return function(items) {
         return toArray(items).slice().reverse();
      };
   });




