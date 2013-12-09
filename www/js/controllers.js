angular.module('chatRoom.controllers', [])

.controller('AppCtrl', function($scope) {
  // Main app controller, empty for the example
})

.controller('RoomsTabCtrl', function($scope, Rooms) {
  $scope.rooms = Rooms.all();

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
    $scope.controllers[0].tabsController.select(2);
  }
})

.controller('RoomCtrl', function($scope, $routeParams, Rooms) {
  $scope.room = Rooms.get($routeParams.roomId);
});
