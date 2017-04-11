exports = module.exports = function (io, empleadosConectados,clientesConectados,idClienteDisponible,idBusquedaCliente) {

    io.sockets.on('connection', function (socket) {


        socket.on('getempleadosconectados', function (data) {
            socket.emit('getempleadosconectados', empleadosConectados);
        });

        socket.on('getclientesconectados', function (data) {
            socket.emit('getclientesconectados', clientesConectados);
        });

        socket.on('getidClienteDisponible', function (data) {
            socket.emit('getidClienteDisponible', idClienteDisponible);
        });

        socket.on('getidBusquedaCliente', function (data) {
            socket.emit('getidBusquedaCliente', idBusquedaCliente);
        });

        
    });
}