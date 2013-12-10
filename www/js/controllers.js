angular.module('chatRoom.controllers', [])

.controller('AppCtrl', function($scope) {
  // Main app controller, empty for the example
})

.controller('RoomsTabCtrl', function($scope, $timeout, Rooms) {
  $scope.rooms = Rooms.all();
  
  $scope.onRefresh = function() {    
    var stop = $timeout(function() {
      $scope.rooms = Rooms.all();
      $scope.$broadcast('scroll.refreshComplete');
    }, 1000);
  };

  $scope.$on('tab.shown', function() {
    // Might do a load here
  });
  $scope.$on('tab.hidden', function() {
    // Might recycle content here
  });
})

.controller('NewRoomCtrl', function($scope, $routeParams, $location, Rooms) {
  $scope.newRoomName = "";
  $scope.newRoomNameId = "";
  
  $scope.$on('tab.shown', function() {
    $scope.newRoomName = "";
    $scope.newRoomNameId = "";
  });
  
  $scope.$on('tab.hidden', function() {
    // Might recycle content here
  });
    
  $scope.setNewRoomNameId = function() {
    this.newRoomNameId = this.newRoomName.toLowerCase().replace(/\s/g,"-").replace(/[^a-z0-9\-]/g, '');
  };
  
  $scope.createRoom = function() { 
    Rooms.add(this.newRoomName, this.newRoomNameId, this.newRoomDescription);    
    $scope.controllers[0].tabsController.select(0);
  }
})

.controller('RoomCtrl', function($scope, $routeParams, $timeout, Rooms) {
  $scope.room = Rooms.get($routeParams.roomId);
  $scope.newMessage = "";
  
  $scope.onRefresh = function() {    
    var stop = $timeout(function() {
      $scope.$broadcast('scroll.refreshComplete');
    }, 1000);
  };
  
  $scope.submitAddMessage = function() {
    data = {
      created_by: "Eddie Lau Current",
      content: this.newMessage,
      created_at: new Date()
    };
    this.room.messages.push(data);
    
    this.newMessage = "";
  }
});
