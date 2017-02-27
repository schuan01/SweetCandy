var dateFormat = require('dateformat');
var bd = require('./bd');

exports = module.exports = function (io) {
    io.sockets.on('connection', function (socket) {

        //GUARDAR FOTOS
        socket.on('guardarfoto', function (data) {
            var urlFoto = data.urlFoto;
            var usu = data.id;
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('INSERT INTO FotosUsuario SET empleadoFoto = ?,urlFoto = ?', [usu, urlFoto], function (err1, result) {
                    if (err1) throw err1;
                    connection.release();
                    idTr = result.insertId;//Le ponemos el ID
                    console.log("Foto agregada con ID: " + idTr);
                });
            });


        });

        //OBTIENE LAS FOTOS
        socket.on('getfotosusuario', function (data) {
            bd.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query('SELECT * FROM FotosUsuario WHERE empleadoFoto = ?', [data.id], function (error, results, fields) {
                    if (error) throw error;
                    connection.release();
                    var fotos = [];
                    for (var i in results) {
                        fotos.push(results[i]);
                    }
                    console.log("Fotos obtenidas del Usuario " + data.id + " : " + fotos.length);
                    socket.emit('fotosobtenidas', fotos);

                });
            });
        });
    });
}