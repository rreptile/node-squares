$(document).ready(function(){
	document.oncontextmenu = function(){return false;}

	var canvas = document.getElementById("canvas");
	var ctx = canvas.getContext("2d");

	var canvasOffset = $(canvas).offset();
	var offsetX = canvasOffset.left;
	var offsetY = canvasOffset.top;
	var squareSize = 50;

	var isMouseDown = false;
	var startX;
	var startY;
	var dragX;
	var dragY;

	var items = [];

	// Сервер
	var socket;
	if(io) {
		socket = io.connect('http://localhost/');
		socket.on('addSquare', function (data){
			addSquare(false, data.x, data.y, data.color, data.id);
		});

		socket.on('moveSquare', function(data){
			var square = _.where(items, {id: data.id})[0];
			square.x = data.x;
			square.y = data.y;
			draw();
		});

		socket.on('changeColor', function(data){
			var square = _.where(items, {id: data.id})[0];
			square.color = data.color;
			draw();
		});

		socket.on('syncSquares', function(squares){
			console.log("Squares sync: "+JSON.stringify(squares));
			for(var i in squares){
	            var data = squares[i];
	            addSquare(false, data.x, data.y, data.color, data.id);
	        }
		});
	}

	draw();

	function draw() {
	    ctx.clearRect(0, 0, canvas.width, canvas.height);
	    for (var i = 0; i < items.length; i++) {
	        var item = items[i];
	        ctx.beginPath();
	        if (item.isDragging) {
	            ctx.rect(item.x + dragX, item.y + dragY, item.width, item.height);
	            if(socket && item.own)socket.emit('moveSquare', {x:(item.x + dragX), y:(item.y + dragY), id:item.id});
	        } else {
	            ctx.rect(item.x, item.y, item.width, item.height);
	        }
	        ctx.fillStyle = item.color
	        ctx.fill();
	    }
	}


	function checkDragging(e, onlyCheck) {
		x = parseInt(e.clientX - offsetX);
	    y = parseInt(e.clientY - offsetY);

	    startX = x;
	    startY = y;

	    for (var i = 0; i < items.length; i++) {
	        var item = items[i];
	        if(!item.own)continue;
	        if (x >= item.x && x <= item.x + item.width && y >= item.y && y <= item.y + item.height) {
	            if(!onlyCheck)item.isDragging = true;
	            return item;
	        }
	    }
	    return false;
	}

	function clearDragging(x, y) {
	    for (var i = 0; i < items.length; i++) {
	        var item = items[i];
	        if (item.isDragging) {
	            items[i].isDragging = false;
	            item.x += dragX;
	            item.y += dragY;
	        }
	    }
	}

	function handleMouseDown(e) {
	    checkDragging(e);
	    isMouseDown = true;
	}

	function handleMouseUp(e) {
	    mouseX = parseInt(e.clientX - offsetX);
	    mouseY = parseInt(e.clientY - offsetY);

	    isMouseDown = false;
	    clearDragging();
	}

	function handleMouseOut(e) {
	    mouseX = parseInt(e.clientX - offsetX);
	    mouseY = parseInt(e.clientY - offsetY);

	    isMouseDown = false;
	    clearDragging();
	}

	function handleMouseMove(e) {
	    mouseX = parseInt(e.clientX - offsetX);
	    mouseY = parseInt(e.clientY - offsetY);

	    if (isMouseDown) {
	        dragX = mouseX - startX;
	        dragY = mouseY - startY;
	        draw();
	    }
	}

	function addSquare(own, x, y, color, id){
		if(!color)color = "#FF0000";
		if(!id)id = items.length;
		var square = {
			x: x,
		    y: y,
		    width: squareSize,
		    height: squareSize,
		    color: color,
		    isDragging: false,
		    id: id,
		    own: own
		}
		items.push(square);
		// Отслыаем на сервер
		if(own && socket)socket.emit('addSquare', {x: x, y: y, color: color, id: id});
		console.log(JSON.stringify(items));
		draw();
	}

	function changeColor(item){
		if(!item.own){console.log("Client can modify only his own items"); return;}
		item.color = getRandomColor();
		draw();
		socket.emit('changeColor', {color: item.color, id: item.id});
	}

	function getRandomColor() {
	    var letters = '0123456789ABCDEF'.split('');
	    var color = '#';
	    for (var i = 0; i < 6; i++ ) {
	        color += letters[Math.round(Math.random() * 15)];
	    }
	    return color;
	}

	$(canvas).mousedown(function (e) {
		if(e.button == 2){
			// правая кнопка
			var underCursor = checkDragging(e, true);
			if(!underCursor){
				addSquare(true, Math.round(Math.random()*($(canvas).width()-squareSize)+squareSize), Math.round(Math.random()*$(canvas).height()), getRandomColor());
			}else{
				changeColor(underCursor);
			}
			
		}else{
			// левая кнопка
			handleMouseDown(e);
		} 
	});


	$(canvas).mousemove(function (e) {
	    handleMouseMove(e);
	});
	$(canvas).mouseup(function (e) {
	    handleMouseUp(e);
	});
	$(canvas).mouseout(function (e) {
	    handleMouseOut(e);
	});
	
});
