var dateFormat = require('dateformat');
var bd = require('./bd');

exports = module.exports = function (io, idBusquedaCliente, empleadosConectados, hashSocketEmpleados) {
    io.sockets.on('connection', function (socket) {
        //ENVIAR SOLICITUD BUSQUEDA
        socket.on('buscardisponible', function (data) {
            if (data != null) {
                idBusquedaCliente++;
                data.idBusquedaTransaccion = idBusquedaCliente;
                socket.join('transaccion-' + data.idBusquedaTransaccion);//Unimos al room
                console.log("El cliente " + data.clienteTransaccion.id + " buscando un servicio con ID transaccion: " + data.idBusquedaTransaccion);
                socket.broadcast.emit('solicitudcliente', data);

            }
        });

        //ENVIAR SOLICITUD AL ID DE SOCKET
        socket.on('enviarsolicitudausuario', function (data) {
            if (data != null) {
                var socketEmpleado = "";
                for (var i = 0; i < hashSocketEmpleados.length; i++) {//Recorremos todo los hashes
                    if (data.empleadoTransaccion.id == hashSocketEmpleados[i].idEmpleado)//Si esta
                    {
                        socketEmpleado = hashSocketEmpleados[i].socketId;//Paso el socket para poder emitir el evento
                        break;
                    }

                }
                if (socketEmpleado != "") {
                    idBusquedaCliente++;
                    data.idBusquedaTransaccion = idBusquedaCliente;
                    socket.join('transaccion-' + data.idBusquedaTransaccion);//Unimos al room
                    console.log("El cliente " + data.clienteTransaccion.id + " solicitando un servicio al Socket " + socketEmpleado + " con ID transaccion: " + data.idBusquedaTransaccion);
                    io.to(socketEmpleado).emit('solicitudrecibida', data);
                }




            }
        });

        //CANCELAR SOLICITUD BUSQUEDA
        socket.on('cancelarsolicitud', function (data) {
            if (data != null) {
                socket.leave('transaccion-' + data.idBusquedaTransaccion);//Nos vamos del room
                console.log("El cliente " + data.clienteTransaccion.id + " ha cancelado la solicitud");
                socket.broadcast.emit('solicitudcancelada', data);

            }
        });

        //ACEPTAR SOLICITUD BUSQUEDA
        //EMPLEADO ACEPTA
        socket.on('aceptarsolicitud', function (data) {
            if (data != null)//Trae la transaccion
            {
                var room = "";

                console.log("Solicitud aceptada por Empleado " + data.empleadoTransaccion.usuario);

                for (var j = 0; j < empleadosConectados.length; j++) {
                    if (empleadosConectados[j].id == data.empleadoTransaccion.id) {

                        empleadosConectados[j].isOnline = false//Lo cambiamos a False siempre que acepta la solicitud
                        break;
                    }

                }
                console.log("Solicitud aceptada para el Cliente " + data.clienteTransaccion.usuario);

                var idTemporalRoom = data.idBusquedaTransaccion;//ID TRANSACCION TEMPORAL
                room = 'transaccion-' + idTemporalRoom;
                socket.join('transaccion-' + idTemporalRoom);

                //LE SACAMOS EL ID
                var transaccionActual = data;
                transaccionActual.id = null;
                var empleadoTr = data.empleadoTransaccion.id;
                var clienteTr = data.clienteTransaccion.id;
                var activoTr = data.isActiva;
                var totalTr = data.totalTransaccion;
                var fechaIniTr = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                var idTr = transaccionActual.id;

                console.log("Creando transaccion...");
                bd.getConnection(function (err, connection) {
                    if (err) throw err;
                    connection.query('INSERT INTO transaccion SET empleadoTransaccion = ?,clienteTransaccion = ?,fechaInicioTransaccion = ?,isActiva = ?,totalTransaccion = ?', [empleadoTr, clienteTr, fechaIniTr, activoTr, totalTr], function (err1, result) {
                        if (err1) throw err1;
                        connection.release();
                        idTr = result.insertId;//Le ponemos el ID
                        console.log("Transaccion creada con ID: " + idTr);

                        transaccionActual.id = idTr;
                        transaccionActual.fechaInicioTransaccion = fechaIniTr;
                        io.to(room).emit('transaccioniniciada', transaccionActual);//Solo a los participantes del room(Cliente)
                    });
                });



            }
        });
        //FINALIZAR TRANSACCION
        socket.on('finalizartransaccion', function (data) {

            var room = 'transaccion-' + data.idBusquedaTransaccion;

            var fechaFin = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            data.isActiva = false;//Siempre es false

            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('UPDATE transaccion SET fechaFinTransaccion = ?, isActiva = ? where id = ?', [fechaFin, data.isActiva, data.id], function (err1, result) {
                    if (err1) throw err1;
                    connection.release();

                    console.log("Transaccion con ID: " + data.id + " finalizada correctamente");
                    data.fechaFinTransaccion = fechaFin;

                    io.to(room).emit('transaccionfinalizada', data);//Devolvemos la transaccion
                    socket.leave('transaccion-' + data.clienteTransaccion.id);
                });
            });

        });
    });//---TERMINA CONNECTION ------------
}