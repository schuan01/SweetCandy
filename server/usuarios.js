var bd = require('./bd');

exports = module.exports = function (io, empleadosConectados) {
    io.sockets.on('connection', function (socket) {

        //CREAR UN NUEVO EMPLEADO
        socket.on('nuevoempleado', function (data) {

            //LE SACAMOS EL ID
            data.id = null;
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('INSERT INTO empleado SET ?', data, function (err1, result) {
                    if (err1) throw err1;
                    connection.release();

                    console.log("Empleado insertado a BD correctamente");
                    data.id = result.insertId;//Le ponemos el ID
                    empleadosConectados.push(data);//Lo agregamos a la lista de conectados POR AHORA
                    console.log(data);

                    socket.emit('empleadocreado', data);
                });
            });
        });

        //EDITAR USUARIO
        socket.on('editarusuario', function (data) {

            var modificado = false;

            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('UPDATE empleado SET edad = ? where id = ?', [data.edad, data.id], function (err1, result) {
                    if (err1) throw err1;
                    connection.release();
                    console.log("Usuario: " + data.id + " modificado correctamente");
                    modificado = true;

                    socket.emit('usuarioeditado', modificado);//Devolvemos el resultado   

                });
            });


        });

        //CAMBIA EL ESTADO DEL USUARIO
        socket.on('cambiarestado', function (data) {

            for (var i = 0; i < empleadosConectados.length; i++) {
                if (empleadosConectados[i].id == data.id) {
                    if (empleadosConectados[i].isOnline) {
                        empleadosConectados[i].isOnline = false//Lo cambiamos a False
                    }
                    else {
                        empleadosConectados[i].isOnline = true//Lo cambiamos a True
                    }
                    break;
                }

            }


        });

        //DEVUELVE LA INFORMACION DEL USUARIO CON ESE ID
        socket.on('obtenerusuario', function (data) {
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('SELECT * FROM empleado WHERE id = ?', [data.id], function (error, results, fields) {
                    if (error) throw error;
                    connection.release();

                    if (results.length == 0) {

                        socket.emit('usuarioencontrado', null);
                    }
                    else {
                        for (var i in results) {

                            console.log("Usuario encontrado con ID: " + results[i].id);
                            socket.emit('usuarioencontrado', results[i]);

                        }
                    }

                });
            });
        });


    });
}