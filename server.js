#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var userList = new Map();
var cc = 0;

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
    return true;
}

wsServer.on('request', function(request) {

    if (!originIsAllowed(request.origin)) {
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
        
    var connection = request.accept(null, request.origin);
    connection.cc = cc;
    cc += 1;

    userList.set(connection.cc, {connection: connection, user: ''});

    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
      
      obj = JSON.parse(message.utf8Data);
      
      if (obj.type == 'join') {
        u = userList.get(connection.cc);
        u.user = obj.user;

        let listOrdered = [];
        userList.forEach(function (v, k) {
          listOrdered.push(v.user);
        });
        listOrdered.sort();
  

        userList.forEach(function(v, k) {
          v.connection.send(JSON.stringify({ type: 'updateUserList', user: obj.user, content: listOrdered }));
          v.connection.send(JSON.stringify({ type: 'joined', user: obj.user, content: '' })); 
        });


      }

      if (obj.type == 'message') {
        userList.forEach(function(v, k) {
          v.connection.send(JSON.stringify(obj));
        });
      }

    });

    connection.on('close', function(reasonCode, description) {
      let u = userList.get(connection.cc);
      userList.delete(connection.cc);

      let listOrdered = [];
      userList.forEach(function (v, k) {
        listOrdered.push(v.user);
      });
      listOrdered.sort();

      userList.forEach(function(v, k) {
        v.connection.send(JSON.stringify({ type: 'updateUserList', user: u.user, content: listOrdered }));
        v.connection.send(JSON.stringify({ type: 'left', user: u.user, content: '' })); 
      });
    });
});
