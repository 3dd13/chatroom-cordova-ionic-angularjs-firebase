angular.module('chatRoom.services', [])

.factory('Rooms', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var rooms = [
    { id: 0, title: 'WDI HK Sept 2013 Instructors', description: 'Instructors only.' },
    { id: 1, title: 'WDI HK Sept 2013 Secrets', description: 'Making fun of instructors. Cats and Baby gif here.' },
    { id: 2, title: 'WDI NY Sept 2013', description: 'All students in the course.' },
    { id: 3, title: 'WDI NY Dec 2013', description: 'All students in the course.' },
  ];

  return {
    all: function() {
      return rooms;
    },
    get: function(roomId) {
      // Simple index lookup
      return rooms[roomId];
    },
    add: function(title, slug, description) {
      var newRoom = {
        id: rooms.length + 1,
        title: title,
        slug: slug,
        description: description
      };
      rooms.push(newRoom);
      return newRoom;
    }
  }
});
