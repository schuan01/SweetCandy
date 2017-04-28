exports = module.exports = function (io, empleadosConectados,clientesConectados,idClienteDisponible,idBusquedaCliente,clientesAnonimosConectados) {

    io.sockets.on('connection', function (socket) {


        socket.on('getempleadosconectados', function (data) {
            socket.emit('getempleadosconectados', empleadosConectados);
        });

        socket.on('getclientesconectados', function (data) {
            socket.emit('getclientesconectados', clientesConectados);
        });

        socket.on('getidClienteDisponible', function (data) {
            console.log("Se envio getidClienteDisponible: " + idClienteDisponible )
            socket.emit('getidClienteDisponible', idClienteDisponible);
        });

        socket.on('getidBusquedaCliente', function (data) {
            console.log("Se envio getidBusquedaCliente: " + idBusquedaCliente )
            socket.emit('getidBusquedaCliente', idBusquedaCliente);
        });

        
    });
}