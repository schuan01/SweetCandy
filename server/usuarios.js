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
        socket.on('obtenerempleado', function (data) {
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('SELECT * FROM empleado e LEFT JOIN FotosUsuario f on f.empleadoFoto = e.id WHERE e.id = ?', [data.id], function (error, results, fields) {
                    if (error) throw error;
                    connection.release();

                    if (results.length == 0) {

                        socket.emit('usuarioencontrado', null);
                    }
                    else {
                        var fotos = [];
                        var info = {};
                        for (var i in results) {
                            if(i == 0)
                            {
                                info = {
                                    "id" : results[i].id,
                                    "usuario" : results[i].usuario,
                                    "descripcion" : results[i].descripcion,
                                    "rating" : results[i].rating,
                                    "edad" : results[i].edad,
                                    "latitud" : results[i].latitud,
                                    "longitud" : results[i].longitud, 
                                    "costo" : results[i].costo,
                                    "email" : results[i].email,
                                    "usuario" : results[i].usuario,
                                    "fotos" :[{"urlFoto":results[i].urlFoto }]
                                }
                            }
                            else
                            {
                                info.fotos.push({"urlFoto":results[i].urlFoto})
                            }

                        }

                        console.log("Usuario encontrado con ID: " + info.id);
                        console.log("Cantidad de Fotos encontradas: " + info.fotos.length);
                        socket.emit('usuarioencontrado', info);
                    }

                });
            });
        });


    });
}