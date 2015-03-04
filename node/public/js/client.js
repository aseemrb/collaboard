window.onload = function()
{    
    // data for socket.io
    var ipaddr = '192.168.1.5';
    var port = '3700';
    var messages = [];
    var socket = io.connect(ipaddr+':'+port);

    var state = 0;  // to draw or not
    var BRUSHSZ = 2;
    var COLOR = "#000000";
    var canvas = $('#canvas').get(0).getContext("2d");
    var cantools = $('#tools').get(0).getContext('2d');
    var x = 0, y = 0;   // Mouse coordinates
    var WID = 800, HEI =  550;

    // init empty canvas
    canvas.fillStyle = "#FFFFFF"
    canvas.fillRect(0, 0, WID, HEI);

    // init drawing tools
    cantools.fillStyle = "#FFFFFF";
    cantools.strokeStyle = "#000000";
    cantools.fillRect(0, 0, 100, HEI);

    // black
    cantools.fillStyle = "#000000";
    cantools.fillRect(0, 0, 20, 20);
    cantools.strokeRect(0, 0, 20, 20);

    cantools.fillStyle = "#333333";
    cantools.fillRect(20, 0, 20, 20);
    cantools.strokeRect(20, 0, 20, 20);

    cantools.fillStyle = "#777777";
    cantools.fillRect(40, 0, 20, 20);
    cantools.strokeRect(40, 0, 20, 20);

    cantools.fillStyle = "#CCCCCC";
    cantools.fillRect(60, 0, 20, 20);
    cantools.strokeRect(60, 0, 20, 20);

    cantools.fillStyle = "#FFFFFF";
    cantools.fillRect(80, 0, 20, 20);
    cantools.strokeRect(80, 0, 20, 20);

    // red
    cantools.fillStyle = "#280000";
    cantools.fillRect(0, 20, 20, 20);
    cantools.strokeRect(0, 20, 20, 20);

    cantools.fillStyle = "#500000";
    cantools.fillRect(20, 20, 20, 20);
    cantools.strokeRect(20, 20, 20, 20);

    cantools.fillStyle = "#800000";
    cantools.fillRect(40, 20, 20, 20);
    cantools.strokeRect(40, 20, 20, 20);

    cantools.fillStyle = "#A80000";
    cantools.fillRect(60, 20, 20, 20);
    cantools.strokeRect(60, 20, 20, 20);

    cantools.fillStyle = "#FF0000";
    cantools.fillRect(80, 20, 20, 20);
    cantools.strokeRect(80, 20, 20, 20);

    // green
    cantools.fillStyle = "#003300";
    cantools.fillRect(0, 40, 20, 20);
    cantools.strokeRect(0, 40, 20, 20);

    cantools.fillStyle = "#006600";
    cantools.fillRect(20, 40, 20, 20);
    cantools.strokeRect(20, 40, 20, 20);

    cantools.fillStyle = "#009900";
    cantools.fillRect(40, 40, 20, 20);
    cantools.strokeRect(40, 40, 20, 20);

    cantools.fillStyle = "#00CC00";
    cantools.fillRect(60, 40, 20, 20);
    cantools.strokeRect(60, 40, 20, 20);

    cantools.fillStyle = "#00FF00";
    cantools.fillRect(80, 40, 20, 20);
    cantools.strokeRect(80, 40, 20, 20);


    // blue
    cantools.fillStyle = "#000033";
    cantools.fillRect(0, 60, 20, 20);
    cantools.strokeRect(0, 60, 20, 20);

    cantools.fillStyle = "#000066";
    cantools.fillRect(20, 60, 20, 20);
    cantools.strokeRect(20, 60, 20, 20);

    cantools.fillStyle = "#000099";
    cantools.fillRect(40, 60, 20, 20);
    cantools.strokeRect(40, 60, 20, 20);

    cantools.fillStyle = "#0000CC";
    cantools.fillRect(60, 60, 20, 20);
    cantools.strokeRect(60, 60, 20, 20);

    cantools.fillStyle = "#0000FF";
    cantools.fillRect(80, 60, 20, 20);
    cantools.strokeRect(80, 60, 20, 20);

    var keymap = {16: false, 17: false, 187: false, 189: false};
    // 16: shift
    // 17: ctrl
    // 187: =
    // 189: -

    // form data
    var field = document.getElementById("field");
    var sendButton = document.getElementById("sendbtn");
    var content = document.getElementById("content");
    var name = document.getElementById("name");

    // Detect keypresses for board shortcuts
    $(document).on("keydown", function (e) {
        if (e.keyCode in keymap) {
            keymap[e.keyCode] = true;
            if(keymap[16] && keymap[187]) {
                BRUSHSZ+=5;
            }else if(keymap[16] && keymap[189]) {
                BRUSHSZ-=5;
                if(BRUSHSZ<1)BRUSHSZ=1;
            }
        }
    }).on("keyup", function (e) {
        if (e.keyCode in keymap) {
            keymap[e.keyCode] = false;
        }
    });
    

    // Detect mouse events
    $('#canvas').on("mousedown", function (e) {
        state = 1;
        x = e.offsetX, y = e.offsetY;

        canvas.lineJoin = "round";
        canvas.beginPath();
        canvas.moveTo(x-1, y);
        canvas.lineTo(x, y);
        canvas.closePath();
        canvas.strokeStyle=COLOR;
        canvas.lineWidth = BRUSHSZ;
        canvas.stroke();
    }).on("mouseup", function (e) {
        state = 0;
        x = e.offsetX, y = e.offsetY;
        canvas.closePath();
    }).on("mousemove", function (e) {
        if(state==0)return;
        var dataobj = {};
        dataobj.fx = x;
        dataobj.fy = y;
        dataobj.col = COLOR;
        dataobj.bsz = BRUSHSZ;

        canvas.beginPath();
        canvas.moveTo(x, y);
        x = e.offsetX, y = e.offsetY;
        canvas.lineTo(x, y);
        canvas.closePath();
        canvas.strokeStyle=COLOR;
        canvas.lineWidth = BRUSHSZ;
        canvas.stroke();
        
        dataobj.tx = x;
        dataobj.ty = y;
        
        socket.emit('drawn', dataobj);
    }).on("mouseleave", function (e) {
        state = 0;
    });

    // clear board event
    $('#clearbtn').on('click', function(e) {
        canvas.fillStyle = "#FFFFFF";
        canvas.fillRect(0, 0, WID, HEI);
    });

    // drawing tools operated
    $('#tools').on('click', function(e) {
        var p = cantools.getImageData(e.offsetX, e.offsetY, 1, 1).data;
        COLOR = "#" + ("000000" + ((p[0] << 16) | (p[1] << 8) | p[2]).toString(16)).slice(-6);
    });

    

    // What to do on receiving a message
    socket.on('message', function (data) {
        if(data.message) {
            var html = '<b>' + (data.username ? data.username : 'Server') + ': </b>';
            html += data.message + '<br>';
            content.innerHTML += html;
            content.scrollTop = content.scrollHeight;
        }
        else {
            console.log("There is a problem (Empty message?):", data);
        }
    });
 
    // when another client draws
    socket.on('draw', function (data) {
        canvas.beginPath();
        canvas.moveTo(data.fx, data.fy);
        canvas.lineTo(data.tx, data.ty);
        canvas.closePath();
        canvas.strokeStyle=data.col;
        canvas.lineWidth = data.bsz;
        canvas.stroke();
    });
 
    // What to do when a message is to be sent
    sendButton.onclick = function() {
        var text = field.value;
        field.value = "";
        if(name.value.split(' ').length>1)
            alert("You must have a proper name.");
        else
            uname = name.value;
            socket.emit('send', { message: text, username: uname });
    };
}