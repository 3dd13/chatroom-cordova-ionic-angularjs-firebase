angular.module('chatRoom.services', [])

.factory('Rooms', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var rooms = [
    { id: 0, title: 'WDI HK Sept 2013 Instructors', slug: "wdi-hk-sept-2013-instructors", description: 'Instructors only.', messages: [{created_by: "Eddie Lau 1", content: "Hello World", created_at: new Date()}, {created_by: "Eddie Lau 2", content: "Hello World", created_at: new Date()}] },
    { id: 1, title: 'WDI HK Sept 2013 Secrets', slug: "wdi-hk-sept-2013-secrets", description: 'Making fun of instructors. Cats and Baby gif here.', messages: [{created_by: "Eddie Lau 3", content: "Hello World", created_at: new Date()}, {created_by: "Eddie Lau 4", content: "Hello World", created_at: new Date()}] },
    { id: 2, title: 'WDI NY Sept 2013', slug: "wdi-ny-sept-2013", description: 'All students in the course.', messages: [{created_by: "Eddie Lau 5", content: "Hello World", created_at: new Date()}, {created_by: "Eddie Lau 6", content: "Hello World", created_at: new Date()}] },
    { id: 3, title: 'WDI NY Dec 2013', slug: "wdi-ny-dec-2013", description: 'All students in the course.', messages: [{created_by: "Eddie Lau 7", content: "Hello World", created_at: new Date()}, {created_by: "Eddie Lau 8", content: "Hello World", created_at: new Date()}] },
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
        id: rooms.length,
        title: title,
        slug: slug,
        description: description
      };
      rooms.push(newRoom);
      return newRoom;
    }
  }
});
