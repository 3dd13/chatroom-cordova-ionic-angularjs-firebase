angular.module('chatRoom.controllers', [])

.controller('AppCtrl', function($scope, $location) {  
  $scope.goToNewRoom = function() {
    $location.path('/rooms/new');
    $scope.toggleSideMenu();
  };
  
  $scope.goToAbout = function() {
    $location.path('/about');
    $scope.toggleSideMenu();
  };
  
  $scope.goToHome = function() {
    $location.path('/home');
  };  
    
  $scope.toggleSideMenu = function() {
    $scope.sideMenuController.toggleLeft();
  };
})

.controller('MainCtrl', function($scope, $timeout, angularFire) {
  $scope.rooms = [];
  var ref = new Firebase('https://chatroom-io.firebaseio.com/opened_rooms');  
  angularFire(ref, $scope, "rooms");
  
  $scope.rightButtons = [
    { 
      type: 'button-positive',
      content: '<i class="icon ion-navicon"></i>',
      tap: function(e) {
      }
    }
  ]
  
  $scope.onRefresh = function() {    
    var stop = $timeout(function() {
      $scope.rooms = [];
      var ref = new Firebase('https://chatroom-io.firebaseio.com/opened_rooms');  
      angularFire(ref, $scope, "rooms");
            
      $scope.$broadcast('scroll.refreshComplete');
    }, 1000);
  };
})

.controller('NewRoomCtrl', function($scope, $location, angularFire) {      
  $scope.newRoomName = "";
  $scope.newRoomNameId = "";
  $scope.newRoomDescription = "";

  $scope.setNewRoomNameId = function() {
    this.newRoomNameId = this.newRoomName.toLowerCase().replace(/\s/g,"-").replace(/[^a-z0-9\-]/g, '');
  };
  
  $scope.createRoom = function() {
    $scope.rooms = [];
    var ref = new Firebase('https://chatroom-io.firebaseio.com/opened_rooms');  
    var promise = angularFire(ref, $scope, "rooms");
    promise.then(function() {
      $scope.rooms.push({
        id: Math.floor(Math.random() * 5000001),
        title: $scope.newRoomName,
        slug: $scope.newRoomNameId, 
        description: $scope.newRoomDescription
      });
      
      $location.path('/home');
    })
  };
})

.controller('RoomCtrl', function($scope, $routeParams, $timeout, angularFire) {
  $scope.newMessage = "";
  $scope.messages = [];
  
  var ref = new Firebase('https://chatroom-io.firebaseio.com/rooms/' + $routeParams.roomId);
  var promise = angularFire(ref.limit(15), $scope, "messages");
  
  $scope.username = 'User' + Math.floor(Math.random() * 501);
  $scope.submitAddMessage = function() {
    $scope.messages.push({
      created_by: this.username,
      content: this.newMessage,
      created_at: new Date()
    });
    this.newMessage = "";
  };
  
  $scope.onRefresh = function() {
    var stop = $timeout(function() {
      $scope.$broadcast('scroll.refreshComplete');
    }, 1000);
  };
})

.controller('AboutCtrl', function($scope) {
});