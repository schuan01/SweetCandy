var socket = io.connect('https://warm-basin-61084.herokuapp.com', { 'forceNew': true });
//var socket = io.connect('http://localhost:3000', { 'forceNew': true });


function callServer() {  
  socket.emit('getempleadosconectados', "");
  socket.emit('getclientesconectados', "");
  socket.emit('getidClienteDisponible', "");
  socket.emit('getidBusquedaCliente', "");
  return false;
}


socket.on('getempleadosconectados', function(data) {
    var newElement = document.createElement('div');
    newElement.innerHTML = "<p>Empleados Conectados: "+data.length+"</p>";
    document.getElementById("listados").appendChild(newElement);  

});

socket.on('getclientesconectados', function(data) {
    var newElement = document.createElement('div');
    newElement.innerHTML = "<p>Clientes Conectados: "+data.length+"</p>";
    document.getElementById("listados").appendChild(newElement);    

});

socket.on('getidClienteDisponible', function(data) { 
    var newElement = document.createElement('div');
    newElement.innerHTML = "<p>Ultimo Id Cliente Disponible: "+data+"</p>";
    document.getElementById("listados").appendChild(newElement);    

});

socket.on('getidBusquedaCliente', function(data) {
    var newElement = document.createElement('div');
    newElement.innerHTML = "<p>Ultimo Id Busqueda(Transacciones) Disponibile: "+data+"</p>";
    document.getElementById("listados").appendChild(newElement); 

});