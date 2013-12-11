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

