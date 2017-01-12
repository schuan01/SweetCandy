var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var dateFormat = require('dateformat');

app.use(express.static(__dirname + '/../public'));//Aplica como estaticos los archivos de la carpeta publica
                                                  //Pongo los /../ para acceder a la raiz
var server_bd_port = 3306;
var server_bd = 'us-cdbr-iron-east-04.cleardb.net';
var server_user = 'b16fa9963b6b69';
var server_pwd = '5080d557';

var connection;
var mysql      = require('mysql');
var pool = null;

var db_config = {
  connectionLimit : 10,
  host     : server_bd,
  port     : server_bd_port,
  user     : server_user,
  password : server_pwd,
  database : 'heroku_85b15da8dca88f7'
};

var db_config_local = {
  host     : 'localhost',
  user     : 'root',
  password : 'admin',
  database : 'testnode'
};    

//------------------------------------------------------------------
http.listen(PORT, function() {
  console.log('Aplicacion corriendo en: ', PORT);
});

//Creamos el pool de la BD
if(PORT == 3000)
{
  pool = mysql.createPool(db_config_local);
}
else
{
  pool = mysql.createPool(db_config);
}

var empleadosCercanos = [];
var empleadosConectados = [];
var clientesConectados = [];
var idClienteDisponible = 0;
var idBusquedaCliente = 0;

app.get('/test', function(req, res) {  
  res.status(200).send("Server Online");
});

app.get('/getLoc', function(req, res) {  
  fs.readFile('./public/get_loc.html', function (err, html) {
    if (err) {
        res.status(200).send(err); 
    }
    else
    {

      res.writeHeader(200, {"Content-Type": "text/html"});  
      res.write(html);  
      res.end();
    }  
  });
});


io.on('connection', function(socket) {
  var address = socket.request.connection.remoteAddress;
  console.log('Nueva conexion desde ' + address);
  //emitimos el array de empleados para que lo tome el cliente
  //socket.emit('conectados', empleadosConectados);

  

//MIS LLAMADAS AL SOCKET
//-----------------------------------------------------------------
//NUEVO EMPLEADO CREADO
socket.on('nuevoempleado', function(data) {
	
    //LE SACAMOS EL ID
    data.id = null;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query('INSERT INTO empleado SET ?', data, function(err1, result) {
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

//UBICACION DEL EMPLEADO CONECTADO
socket.on('setubacionempleado', function(data) {

  for (var i=0;i< empleadosConectados.length;i++) 
  {
          if(empleadosConectados[i].id == data.id)
          {
            empleadosConectados[i].latitud = data.latitud;//Edita en tiempo real
            empleadosConectados[i].longitud = data.longitud;//Edita en tiempo real
            break;
          }

  }
    
});

//CAMBIA EL ESTADO DEL USUARIO
socket.on('cambiarestado', function(data) {

  for (var i=0;i< empleadosConectados.length;i++) 
  {
          if(empleadosConectados[i].id == data.id)
          {
            if(empleadosConectados[i].isOnline)
            {
              empleadosConectados[i].isOnline = false//Lo cambiamos a False
            }
            else
            {
              empleadosConectados[i].isOnline = true//Lo cambiamos a True
            }
            break;
          }

  }

    
});

//CONECTAMOS AL USUARIO DEL SERVIDOR
socket.on('conectarclienteanonimo', function(data) {

  if(data != null)
  {
    idClienteDisponible++;//Le agrego un nuevo valor al cliente conectado
    data.id = idClienteDisponible; 
    clientesConectados.push(data);

    //Mandamos los usuarios que quedan
    console.log("Cliente conectado con ID " + data.id);
    console.log("Clientes conectados ahora: " + clientesConectados.length);
    socket.emit("clienteanonimoconectado",data);//Devolvemos el cliente conectado con un ID
  }

  
    
});

//CONECTAMOS AL USUARIO DEL SERVIDOR
socket.on('conectarusuario', function(data) {

  if(data != null)
  {
    empleadosConectados.push(data);

    //Mandamos los usuarios que quedan
    console.log("Empleado conectado");
    console.log("Empleados conectados ahora: " + empleadosConectados.length);
  }

});

//DESCONECTAMOS AL USUARIO DEL SERVIDOR
socket.on('desconectarusuario', function(data) {

  for (var i=0;i< empleadosConectados.length;i++) 
  {
          if(empleadosConectados[i].id == data.id)
          {
            empleadosConectados.splice(i, 1);//Sacamos el usuario de conectados
            //Mandamos los usuarios que quedan
            console.log("Empleado desconectado");
            console.log("Empleado conectados ahora: " + empleadosConectados.length);
            break;
          }

  }

  
});

//DESCONECTAMOS AL CLIENTE DEL SERVIDOR
socket.on('desconectarclienteanonimo', function(data) {

  for (var i=0;i< clientesConectados.length;i++) 
  {
          if(clientesConectados[i].id == data.id)
          {
            clientesConectados.splice(i, 1);//Sacamos el cliente de conectados
            //Mandamos los usuarios que quedan
            console.log("Cliente desconectado");
            console.log("Clientes conectados ahora: " + clientesConectados.length);
            break;
          }

  }
});



//LOGIN EMPLEADO
socket.on('loginempleado', function(data) {
  pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query('SELECT * FROM empleado WHERE email = ? and password = ?',[data.email,data.password], function(error, results, fields) {
          if (error) throw error;
          connection.release();

          if(results.length == 0)
          {
        
            io.sockets.emit('usuariologeado', null);
          }
          else
          {
            for (var i in results) 
            {

              results[i].isOnline = true;//No viene de la BD por eso lo agregamos
              empleadosConectados.push(results[i]);//Lo agregamos a la lista
              console.log("Nuevo Empleado logeado");
              console.log("Empleados conectados ahora: " + empleadosConectados.length);
              socket.emit('usuariologeado', results[i]);
              
            }     
          }
          
        });
    });
	
	
});

//EDITAR USUARIO
socket.on('editarusuario', function(data) {

  var modificado = false;

  pool.getConnection(function(err, connection) {
           if (err) throw err;
           connection.query('UPDATE empleado SET edad = ? where id = ?', [data.edad,data.id], function(err1, result) {
             if (err1) throw err1;
               connection.release();
               console.log("Usuario: " + data.id + " modificado correctamente");
               modificado = true;  

            });
      });

  socket.emit('usuarioeditado', modificado);//Devolvemos el resultado   
});

//OBTIENE LOS EMPLEADOS CONECTADOS
socket.on('conectados', function(data) {   
    //Emitimos el array para que todos los clientes lo reciban
     socket.broadcast.emit('conectados',empleadosConectados);
  });

//OBTIENE LOS EMPLEADOS CERCANOS
socket.on('getcercanos', function(data) {
    empleadosCercanos = [];
    if(empleadosConectados.length > 0)
    {
      GetCercanos(data.latitud,data.longitud,data.limite);
      socket.emit('empleadoscercanos', empleadosCercanos);
    }
    
    
  });

  //ENVIAR SOLICITUD BUSQUEDA
socket.on('buscardisponible', function(data) {
    if(data != null)
    {
      idBusquedaCliente++;
      data.idBusquedaTransaccion = idBusquedaCliente;
      socket.join('transaccion-'+ data.idBusquedaTransaccion);//Unimos al room
      console.log("El cliente " + data.clienteTransaccion.id + " buscando un servicio");
      socket.broadcast.emit('solicitudcliente',data);
      
    }
 });

//CANCELAR SOLICITUD BUSQUEDA
socket.on('cancelarsolicitud', function(data) {
    if(data != null)
    {
      socket.leave('transaccion-'+ data.idBusquedaTransaccion);//Nos vamos del room
      console.log("El cliente " + data.id + " ha cancelado la solicitud");
      socket.broadcast.emit('solicitudcancelada',data);
      
    }
 });

 //ACEPTAR SOLICITUD BUSQUEDA
 //EMPLEADO ACEPTA
socket.on('aceptarsolicitud', function(data) {
    if(data != null && data.length > 0)//data es un array(trae cliente aceptado/empleado aceptador/Transaccion)
    {
      var room = "";

      for (var i=0;i< data.length;i++) 
      {
          if(data[i].tipo == "Empleado")
          {
            console.log("Solicitud aceptada por Empleado " + data[i].usuario);

            for (var j=0;j< empleadosConectados.length;j++) 
            {
              if(empleadosConectados[j].id == data[i].id)
              {

                empleadosConectados[j].isOnline = false//Lo cambiamos a False siempre que acepta la solicitud
                break;
              }

            }
          }

          if(data[i].tipo == "Cliente")
          {
            console.log("Solicitud aceptada para el Cliente " + data[i].usuario);
          }

          if(data[i].tipo == "Transaccion")
          {
            var idTemporalRoom = data[i].idBusquedaTransaccion;//ID TRANSACCION TEMPORAL
            room = 'transaccion-'+ idTemporalRoom;
            socket.join('transaccion-'+ idTemporalRoom);

            //LE SACAMOS EL ID
            var transaccionActual = data[i];
            transaccionActual.id = null;
            var empleadoTr = data[i].empleadoTransaccion.id;
            var clienteTr = data[i].clienteTransaccion.id;
            var activoTr = data[i].isActiva;
            var totalTr = data[i].totalTransaccion;
            var fechaIniTr = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            var idTr = transaccionActual.id;
            
            console.log("Creando transaccion");
            pool.getConnection(function(err, connection) {
                if (err) throw err;
                connection.query('INSERT INTO transaccion SET empleadoTransaccion = ?,clienteTransaccion = ?,fechaInicioTransaccion = ?,isActiva = ?,totalTransaccion = ?', [empleadoTr,clienteTr,fechaIniTr,activoTr,totalTr], function(err1, result) {
                  if (err1) throw err1;
                  connection.release();
                  idTr = result.insertId;//Le ponemos el ID
                  console.log("Transaccion creada con ID: " + idTr);  

                  transaccionActual.id = idTr;
                  transaccionActual.fechaInicioTransaccion = fechaIniTr;
                  io.to(room).emit('transaccioniniciada',transaccionActual);//Solo a los participantes del room(Cliente)
                });
            });

            

          }
      }
    }
 });
//------------ TRANSACCIONES --------------------
//FINALIZAR TRANSACCION
socket.on('finalizartransaccion', function(data) {

    var room = 'transaccion-'+ data.idBusquedaTransaccion;

    var fechaFin = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    data.isActiva = false;//Siempre es false

    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query('UPDATE transaccion SET fechaFinTransaccion = ?, isActiva = ? where id = ?', [fechaFin,data.isActiva,data.id], function(err1, result) {
          if (err1) throw err1;
          connection.release();

          console.log("Transaccion con ID: "+ data.id+ " finalizada correctamente");
          data.fechaFinTransaccion = fechaFin;
        
          io.to(room).emit('transaccionfinalizada', data);//Devolvemos la transaccion
          socket.leave('transaccion-'+ data.clienteTransaccion.id);
        });
    });
    
  });
//---------- FIN TRANSACCIONES ------------------  
  
});//---TERMINA CONNECTION ------------


 


//------------------------------ CALCULO DE CERCANOS -----------------
// Convert Degress to Radians
function Deg2Rad(deg) {
  return deg * Math.PI / 180;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
  lat1 = Deg2Rad(lat1);
  lat2 = Deg2Rad(lat2);
  lon1 = Deg2Rad(lon1);
  lon2 = Deg2Rad(lon2);
  var R = 6371; // km
  var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
  var y = (lat2 - lat1);
  var d = Math.sqrt(x * x + y * y) * R;
  return d;
}

function GetCercanos(latitude, longitude, limite) {
  empleadosCercanos = [];//LO DEJAMOS VACIO
  var mindif = limite;
  var closest;
  
  for(var i = 0; i < empleadosConectados.length; i++) {
    var obj = empleadosConectados[i];
    var dif = PythagorasEquirectangular(latitude, longitude, obj.latitud,obj.longitud);
    if (dif < mindif) 
    {
      empleadosCercanos.push(obj);//Lo agregamos a la lista
    }
  }

  console.log("Usuarios Cercanos: " + empleadosCercanos.length);
}
//------------------------------ CALCULO DE CERCANOS -----------------
/*
socket.emit('message', "this is a test"); //sending to sender-client only
socket.broadcast.emit('message', "this is a test"); //sending to all clients except sender
socket.broadcast.to('game').emit('message', 'nice game'); //sending to all clients in 'game' room(channel) except sender
socket.to('game').emit('message', 'enjoy the game'); //sending to sender client, only if they are in 'game' room(channel)
socket.broadcast.to(socketid).emit('message', 'for your eyes only'); //sending to individual socketid
io.emit('message', "this is a test"); //sending to all clients, include sender
io.in('game').emit('message', 'cool game'); //sending to all clients in 'game' room(channel), include sender
io.of('myNamespace').emit('message', 'gg'); //sending to all clients in namespace 'myNamespace', include sender
socket.emit(); //send to all connected clients
socket.broadcast.emit(); //send to all connected clients except the one that sent the message
socket.on(); //event listener, can be called on client to execute on server
io.sockets.socket(); //for emiting to specific clients
io.sockets.emit(); //send to all connected clients (same as socket.emit)
io.sockets.on() ; //initial connection from a client.
*/