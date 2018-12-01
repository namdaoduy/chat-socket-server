
const express = require('express');
const bodyParser = require('body-parser');
const logger = require('morgan');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io').listen(http);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

let curr_uid = 1;
let users = [];
let messages = [];

io.on('connection', (socket) => {
  console.log('new user');

  socket.on('disconnect', () => console.log('user disconnected'))

  socket.on('message', (obj) => {
    messages.push(obj);
    io.emit('message', obj)
  })

  socket.on('signup', (obj) => {
    if (users.findIndex(x => x.username === obj.username) >= 0) {
      return io.to(socket.id).emit('signup', {
        message: 'Username existed'
      })
    }
    obj.uid = curr_uid++;
    users.push(obj);
    io.to(socket.id).emit('signup', {
      message: 'OK'
    })
  })

  socket.on('login', obj => {
    let user = users.find(x => x.username === obj.username && x.password === obj.password);
    if (user) {
      return io.to(socket.id).emit('login', {
        message: 'OK',
        username: user.username,
        uid: user.uid,
        old_messages: messages
      })
    }
    else {
      io.to(socket.id).emit('login', {
        message: 'Failed'
      })
    }
  })
})

app.get('/', function(req, res){
  res.send('<h1>Omae wa mou shindeiru!</h1>');
});

http.listen(3006, function(){
  console.log('listening on *:3006');
});
