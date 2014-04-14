var express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);


var config = require('./config')(app, express);

var squares = [];

io.sockets.on('connection', function(socket){
    console.log('Client сonnected! Synchronizing squares...');
    socket.emit('syncSquares', squares);
    
    socket.on('addSquare', function(data){
        socket.broadcast.emit('addSquare', data);

        squares.push({x:data.x, y:data.y, color:data.color, id:data.id});
    	console.log('Client added square #'+data.id);
    });
    socket.on('moveSquare', function(data){
        socket.broadcast.emit('moveSquare', data);

        for(var i in squares){
            var square = squares[i];
            if(square.id == data.id){square.x = data.x; square.y = data.y;}
        }
    	console.log('Client moved square #'+data.id);
    });
    socket.on('changeColor', function(data){
    	socket.broadcast.emit('changeColor', data);

        for(var i in squares){
            var square = squares[i];
            if(square.id == data.id)square.color = data.color;
        }
    	console.log('Client changed color of square #'+data.id);
    });
    socket.on('disconnect', function(socket){
       console.log('Client disconnected');
    });
});

server.listen(8000);
