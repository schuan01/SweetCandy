var bd = require('./bd');

exports = module.exports = function (io, idClienteDisponible, empleadosConectados, clientesConectados, hashSocketEmpleados,clientesAnonimosConectados) {
    io.sockets.on('connection', function (socket) {

        //LOGIN EMPLEADO
        socket.on('loginusuario', function (data) {
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                //TODO, CAMBIAR UN POCO ESTO PORQUE EL * TRAE TODA LA INFO.
                connection.query('SELECT * FROM usuario u LEFT JOIN Empleado e on e.idEmpleado = u.id LEFT JOIN Cliente c on c.idCliente = u.id WHERE u.email = ? and u.password = ?', [data.email, data.password], function (error, results, fields) {
                    if (error) throw error;
                    connection.release();

                    if (results.length == 0) {

                        socket.emit('usuariologeado', null);
                    }
                    else {
                        for (var i in results) {

                            var tipoUsuario = "";

                            if(results[i].idEmpleado != null)
                            {
                                results[i].tipoUsuario = "Empleado";
                            }

                            if(results[i].idCliente != null)
                            {
                                results[i].tipoUsuario = "Cliente";
                            }
            
                            if(results[i].tipoUsuario == "Empleado")
                            {
                                //Se utiliza el socket id para poder emitirle a un empleado especifico

                                var hayRenovacion = false;

                                for (var i = 0; i < hashSocketEmpleados.length; i++) {//Recorremos todo los hashes
                                    if (results[i].id == hashSocketEmpleados[i].idEmpleado)//Si esta
                                    {
                                        hashSocketEmpleados[i].socketId = socket.id;//Renuevo el Socket
                                        hayRenovacion = true;
                                        break;
                                    }

                                }

                                
                                empleadosConectados.push(results[i]);//Lo agregamos a la lista
                                console.log("Nuevo Empleado logeado");
                                console.log("Empleados conectados ahora: " + empleadosConectados.length);
                                if (!hayRenovacion) {
                                    hashSocketEmpleados.push({ "idEmpleado": results[i].id, "socketId": socket.id });
                                }
                                console.log("Empleado con ID:" + results[i].id + " agregado con Socket:" + socket.id);
                            }
                            else if(results[i].tipoUsuario == "Cliente")
                            {
                                clientesConectados.push(results[i]);
                                console.log("Nuevo Cliente logeado");
                                console.log("Clientes conectados ahora: " + clientesConectados.length);

                            }

                            results[i].isOnline = true;//No viene de la BD por eso lo agregamos
                            socket.emit('usuariologeado', results[i]);

                        }
                    }

                });
            });
        });


        //CONECTAMOS AL USUARIO ANONIMO DEL SERVIDOR
        socket.on('conectarclienteanonimo', function (data) {

            if (data != null) {
                idClienteDisponible++;//Le agrego un nuevo valor al cliente conectado
                data.id = idClienteDisponible;
                clientesAnonimosConectados.push(data);

                //Mandamos los usuarios que quedan
                console.log("Cliente Anonimo conectado con ID " + data.id);
                console.log("Clientes Anonimos conectados ahora: " + clientesAnonimosConectados.length);
                socket.emit("clienteanonimoconectado", data);//Devolvemos el cliente conectado con un ID
            }



        });

        //DESCONECTAMOS AL USUARIO DEL SERVIDOR
        socket.on('desconectarusuario', function (data) {

            if(data.tipoUsuario)

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
}