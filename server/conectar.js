var bd = require('./bd');

exports = module.exports = function (io, idClienteDisponible, empleadosConectados, clientesConectados) {
    io.sockets.on('connection', function (socket) {

        //LOGIN EMPLEADO
        socket.on('loginempleado', function (data) {
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('SELECT * FROM empleado WHERE email = ? and password = ?', [data.email, data.password], function (error, results, fields) {
                    if (error) throw error;
                    connection.release();

                    if (results.length == 0) {

                        socket.emit('usuariologeado', null);
                    }
                    else {
                        for (var i in results) {

                            results[i].isOnline = true;//No viene de la BD por eso lo agregamos
                            empleadosConectados.push(results[i]);//Lo agregamos a la lista
                            console.log("Nuevo Empleado logeado");
                            console.log("Empleados conectados ahora: " + empleadosConectados.length);
                            socket.emit('usuariologeado', results[i]);

                        }
                    }

                });
            });


            //CONECTAMOS AL USUARIO DEL SERVIDOR
            socket.on('conectarclienteanonimo', function (data) {

                if (data != null) {
                    idClienteDisponible++;//Le agrego un nuevo valor al cliente conectado
                    data.id = idClienteDisponible;
                    clientesConectados.push(data);

                    //Mandamos los usuarios que quedan
                    console.log("Cliente conectado con ID " + data.id);
                    console.log("Clientes conectados ahora: " + clientesConectados.length);
                    socket.emit("clienteanonimoconectado", data);//Devolvemos el cliente conectado con un ID
                }



            });

            //CONECTAMOS AL USUARIO DEL SERVIDOR
            socket.on('conectarusuario', function (data) {

                if (data != null) {
                    empleadosConectados.push(data);

                    //Mandamos los usuarios que quedan
                    console.log("Empleado conectado");
                    console.log("Empleados conectados ahora: " + empleadosConectados.length);
                }

            });

            //DESCONECTAMOS AL USUARIO DEL SERVIDOR
            socket.on('desconectarusuario', function (data) {

                for (var i = 0; i < empleadosConectados.length; i++) {
                    if (empleadosConectados[i].id == data.id) {
                        empleadosConectados.splice(i, 1);//Sacamos el usuario de conectados
                        //Mandamos los usuarios que quedan
                        console.log("Empleado desconectado");
                        console.log("Empleado conectados ahora: " + empleadosConectados.length);
                        break;
                    }

                }


            });

            //DESCONECTAMOS AL CLIENTE DEL SERVIDOR
            socket.on('desconectarclienteanonimo', function (data) {

                for (var i = 0; i < clientesConectados.length; i++) {
                    if (clientesConectados[i].id == data.id) {
                        clientesConectados.splice(i, 1);//Sacamos el cliente de conectados
                        //Mandamos los usuarios que quedan
                        console.log("Cliente desconectado");
                        console.log("Clientes conectados ahora: " + clientesConectados.length);
                        break;
                    }

                }
            });



        });
    });
}