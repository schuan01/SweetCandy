var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var empleadosCercanos = [];
var empleadosConectados = [];
var clientesConectados = [];
var idClienteDisponible = 0;
var idBusquedaCliente = 0;


//-----MIS MODULOS-----
var transaccionesJS = require('./transacciones')(io,idBusquedaCliente,empleadosConectados);
var conectarJS = require('./conectar')(io,idClienteDisponible,empleadosConectados,clientesConectados);
var ubicacionesJS = require('./ubicaciones')(io,empleadosConectados,empleadosCercanos);
var usuariosJS = require('./usuarios')(io,empleadosConectados);
var fotosJS = require('./fotos')(io);

//---------------------
var fs = require('fs');
app.use(express.static(__dirname + '/../public'));//Aplica como estaticos los archivos de la carpeta publica

//------------------------------------------------------------------
http.listen(PORT, function () {
  console.log('Aplicacion corriendo en: ', PORT);
});

app.get('/test', function (req, res) {
  res.status(200).send("Server Online");
});

app.get('/getLoc', function (req, res) {
  fs.readFile('./public/get_loc.html', function (err, html) {
    if (err) {
      res.status(200).send(err);
    }
    else {

      res.writeHeader(200, { "Content-Type": "text/html" });
      res.write(html);
      res.end();
    }
  });
});


io.on('connection', function (socket) {
  var address = socket.request.connection.remoteAddress;
  console.log('Nueva conexion desde ' + address);

});//---TERMINA CONNECTION ------------
//------------------------------ CALCULO DE CERCANOS -----------------
/*
socket.emit('message', "this is a test"); //sending to sender-client only
socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
io.emit('message', "this is a test"); //sending to all clients, include sender
io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
socket.emit(); //send to all connected clients
socket.broadcast.emit(); //send to all connected clients except the one that sent the message
socket.on(); //event listener, can be called on client to execute on server
io.sockets.socket(); //for emiting to specific clients
io.sockets.emit(); //send to all connected clients (same as socket.emit)
io.sockets.on() ; //initial connection from a client.
*/