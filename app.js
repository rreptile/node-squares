var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);


var config = require('./config')(app, express);

io.sockets.on('connection', function(socket){
    console.log('Client сonnected!');
    
    socket.on('addSquare', function(data){
    	socket.broadcast.emit('addSquare', data);
    	console.log('Client added square #'+data.id);
    });
    socket.on('moveSquare', function(data){
    	socket.broadcast.emit('moveSquare', data);
    	console.log('Client moved square #'+data.id);
    });
    socket.on('changeColor', function(data){
    	socket.broadcast.emit('changeColor', data);
    	console.log('Client changed color of square #'+data.id);
    });
    socket.on('disconnect', function(socket){
       console.log('Client disconnected');
    });
});

server.listen(8000);
