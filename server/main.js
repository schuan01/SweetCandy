var PORT = process.env.PORT || 3000;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

app.use(express.static(__dirname + '/public'));

//app.set('port', (process.env.PORT || 3000));
var server_bd_port = 3306;
var server_bd = 'us-cdbr-iron-east-04.cleardb.net';
var server_user = 'b16fa9963b6b69';
var server_pwd = '5080d557';

var connection;
var mysql      = require('mysql');

var db_config = {
  connectionLimit : 10,
  host     : server_bd,
  port     : server_bd_port,
  user     : server_user,
  password : server_pwd,
  database : 'heroku_85b15da8dca88f7'
}; 

//------------------------------------------------------------------
http.listen(PORT, function() {
  console.log('Aplicacion corriendo en: ', PORT);
});

//Creamos el pool de la BD
var pool = mysql.createPool(db_config);

var empleadosCercanos = [];
var empleadosConectados = [];

app.get('/test', function(req, res) {  
  res.status(200).send("Server Online");
});

app.get('/getLoc', function(req, res) {  
  fs.readFile('../public/get_loc.html', function (err, html) {
    if (err) {
        throw err; 
    }

    res.writeHeader(200, {"Content-Type": "text/html"});  
    res.write(html);  
    res.end();  
  });
});

response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  


io.on('connection', function(socket) {
  var address = socket.request.connection.remoteAddress;
  console.log('Nueva conexion desde ' + address);
  //emitimos el array de empleados para que lo tome el cliente
  //socket.emit('conectados', empleadosConectados);

  

//MIS LLAMADAS AL SOCKET
//-----------------------------------------------------------------
//NUEVO EMPLEADO CREADO
socket.on('nuevoempleado', function(data) {
	//handleDisconnect();
    //LE SACAMOS EL ID
    data.id = null;
    var creadoCorrectamente = false;
    pool.getConnection(function(err, connection) {
        if (err) throw err;
        connection.query('INSERT INTO empleado SET ?', data, function(err1, result) {
          if (err1) throw err1;
          connection.release();

          console.log("Empleado insertado a BD correctamente");
          data.id = result.insertId;//Le ponemos el ID
          empleadosConectados.push(data);//Lo agregamos a la lista de conectados POR AHORA
          console.log(data);
        
          io.sockets.emit('empleadocreado', data);
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

  //Se lo mandamos a todos los usuarios
  socket.broadcast.emit('conectados',empleadosConectados);
    
});



//LOGIN EMPLEADO
socket.on('loginempleado', function(data) {
	//handleDisconnect();
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
          
              empleadosConectados.push(results[i]);//Lo agregamos a la lista
              io.sockets.emit('usuariologeado', results[i]);
              
            }     
          }
          
        });
    });
	
	
});

//OBTIENE LOS EMPLEADOS CONECTADOS
socket.on('conectados', function(data) {   
    //Emitimos el array para que todos los clientes lo reciban
     socket.broadcast.emit('conectados',empleadosConectados);
  });

//OBTIENE LOS EMPLEADOS CERCANOS
socket.on('getcercanos', function(data) {
    GetCercanos(data.latitud,data.longitud,data.limite);
    socket.emit('empleadoscercanos', empleadosCercanos);
  });
  
});


 


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
