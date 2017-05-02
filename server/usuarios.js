/*
------ TODO ----------
- Verificar si existe mail, usuario antes de crearlo
*/

var bd = require('./bd');

exports = module.exports = function (io, empleadosConectados) {
    io.sockets.on('connection', function (socket) {

        //CREAR UN NUEVO EMPLEADO
        socket.on('nuevoempleado', function (data) {

            //LE SACAMOS EL ID
            data.id = null;
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('INSERT INTO usuario(usuario,descripcion,edad,urlFoto,email,password,rating) VALUES (?,?,?,?,?,?,?)', [data.usuario, data.descripcion, data.edad, data.urlFoto, data.email, data.password, data.rating], function (err1, result) {
                    if (err1) throw err1;
                    connection.release();
                    bd.getConnection(function (err2, connection2) {
                        if (err2) throw err2;
                        connection2.query('INSERT INTO empleado(idEmpleado,costo) VALUES (?,?)', [result.insertId, data.costo], function (err3, result2) {
                            if (err3) throw err3;
                            connection2.release();

                            console.log("Empleado insertado a BD correctamente");
                            data.id = result.insertId;//Le ponemos el ID
                            empleadosConectados.push(data);//Lo agregamos a la lista de conectados POR AHORA
                            console.log(data);

                            socket.emit('empleadocreado', data);
                        });
                    });


                });
            });
        });

        //CREAR UN NUEVO Cliente
        socket.on('nuevocliente', function (data) {

            //LE SACAMOS EL ID
            data.id = null;
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('INSERT INTO usuario(usuario,descripcion,edad,urlFoto,email,password,rating) VALUES (?,?,?,?,?,?,?)', [data.usuario, data.descripcion, data.edad, data.urlFoto, data.email, data.password, data.rating], function (err1, result) {
                    if (err1) throw err1;
                    connection.release();
                    bd.getConnection(function (err2, connection2) {
                        if (err2) throw err2;
                        connection2.query('INSERT INTO cliente(idCliente) VALUES (?)', [result.insertId], function (err3, result2) {
                            if (err3) throw err3;
                            connection2.release();

                            console.log("Cliente insertado a BD correctamente");
                            data.id = result.insertId;//Le ponemos el ID
                            empleadosConectados.push(data);//Lo agregamos a la lista de conectados POR AHORA
                            console.log(data);

                            socket.emit('clientecreado', data);
                        });
                    });


                });
            });
        });

        //EDITAR USUARIO EMPLEADO
        socket.on('editarempleado', function (data) {

            var modificado = false;

            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('UPDATE usuario SET edad = ?,descripcion = ?,urlFoto = ? where id = ?', [data.edad, data.descripcion, data.urlFoto, data.id], function (err1, result) {
                    if (err1) throw err1;
                    connection.release();
                    bd.getConnection(function (err2, connection2) {
                        if (err2) throw err2;
                        connection2.query('UPDATE empleado SET costo = ? where idEmpleado = ?', [data.costo, data.id], function (err3, result3) {
                            if (err3) throw err3;
                            connection2.release();
                            console.log("Usuario: " + data.id + " modificado correctamente");
                            modificado = true;

                            socket.emit('usuarioeditado', modificado);//Devolvemos el resultado   

                        });
                    });

                });
            });
        });

        //EDITAR USUARIO CLIENTE
        socket.on('editarcliente', function (data) {

            var modificado = false;

            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('UPDATE usuario SET edad = ?,descripcion = ?,urlFoto = ? where id = ?', [data.edad, data.descripcion, data.urlFoto, data.id], function (err1, result) {
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
                connection.query('SELECT s.id,s.usuario,s.descripcion,s.edad,s.urlFoto,s.email,s.rating,e.costo,f.urlFoto FROM usuario s JOIN Empleado e on e.idEmpleado = s.id  LEFT JOIN FotosUsuario f on f.usuarioFoto = e.idEmpleado where e.idEmpleado = ?', [data.id], function (error, results, fields) {
                    if (error) throw error;
                    connection.release();

                    if (results.length == 0) {

                        socket.emit('usuarioencontrado', null);
                    }
                    else {
                        var fotos = [];
                        var info = {};
                        for (var i in results) {
                            if (i == 0) {
                                info = {
                                    "id": results[i].id,
                                    "usuario": results[i].usuario,
                                    "descripcion": results[i].descripcion,
                                    "rating": results[i].rating,
                                    "edad": results[i].edad,
                                    "costo": results[i].costo,
                                    "email": results[i].email,
                                    "fotos": [{ "urlFoto": results[i].urlFoto }]
                                }
                            }
                            else {
                                info.fotos.push({ "urlFoto": results[i].urlFoto })
                            }

                        }

                        console.log("Usuario Empleado encontrado con ID: " + info.id);
                        console.log("Cantidad de Fotos encontradas: " + info.fotos.length);
                        socket.emit('usuarioencontrado', info);
                    }

                });
            });
        });

        //DEVUELVE LA INFORMACION DEL USUARIO CON ESE ID
        socket.on('obtenercliente', function (data) {
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('SELECT s.id,s.usuario,s.descripcion,s.edad,s.urlFoto,s.email,s.rating,f.urlFoto FROM usuario s JOIN Cliente e on e.idCliente = s.id  LEFT JOIN FotosUsuario f on f.usuarioFoto = e.idCliente where e.idCliente = ?', [data.id], function (error, results, fields) {
                    if (error) throw error;
                    connection.release();

                    if (results.length == 0) {

                        socket.emit('usuarioencontrado', null);
                    }
                    else {
                        var fotos = [];
                        var info = {};
                        for (var i in results) {
                            if (i == 0) {
                                info = {
                                    "id": results[i].id,
                                    "usuario": results[i].usuario,
                                    "descripcion": results[i].descripcion,
                                    "rating": results[i].rating,
                                    "edad": results[i].edad,
                                    "email": results[i].email,
                                    "fotos": [{ "urlFoto": results[i].urlFoto }]
                                }
                            }
                            else {
                                info.fotos.push({ "urlFoto": results[i].urlFoto })
                            }

                        }

                        console.log("Usuario Cliente encontrado con ID: " + info.id);
                        console.log("Cantidad de Fotos encontradas: " + info.fotos.length);
                        socket.emit('usuarioencontrado', info);
                    }

                });
            });
        });


    });//FIN CONNECCION
}//FIN MODULE