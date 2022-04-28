var msg = document.getElementById('message');
var user = 'Anonymous';
window.onload = function() {
  
  var ws = new WebSocket("ws://0.0.0.0:8080/");

  if (user == 'Anonymous') {
    user = prompt('Enter your nickname:');
  }

  msg.focus();
  msg.addEventListener('keydown', (e) => {  
    if (e.keyCode == 13) {
      ws.send(JSON.stringify({type: 'message', user: user, content: e.currentTarget.value }));
      msg.value = '';
      msg.focus();
    }
  });

  ws.onmessage = function(evt) {
    obj = JSON.parse(evt.data);

    if (obj.type == 'updateUserList') {
      updateUserList(obj.user, obj.content);
    } 

    if (obj.type == 'joined') {
      displayMessage(obj.user + ' has joined.', 'green');  
    }

    if (obj.type == 'left') {
      displayMessage(obj.user + ' has left.', 'grey');  
    }

    if (obj.type == 'message') {
      displayMessageFromUser(obj.user, obj.content);  
    }
    
  };

  ws.onopen = function() {
    ws.send(JSON.stringify({type: 'join', user: user }));
  }

  ws.onclose = function() { displayMessage("--WebSocket server is down", 'red'); };
}

function updateUserList(user, list) {
  let user_list = document.getElementById('user-list');
  user_list.innerHTML = '';
  list.forEach(addUserToList);
}

function addUserToList(v) {
  let user_list = document.getElementById('user-list');
  user_list.innerHTML += '<div class="user-item">' + v + '</div>';
}

function displayMessage(msg, color) {
  msgs = document.getElementById('messages');
  msgs.innerHTML = msgs.innerHTML + '<div class="msg-item"><div class="msg-user">*</div><div class="msg-content ' + color + '">' + msg + '</div></div>';
}

function displayMessageFromUser(user, msg) {
  msgs = document.getElementById('messages');
  msgs.innerHTML = msgs.innerHTML + '<div class="msg-item"><div class="msg-user">' + user + '</div><div class="msg-content">' + msg + '</div></div>';
}