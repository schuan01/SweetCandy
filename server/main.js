var express = require('express');  
var app = express();  
var server = require('http').Server(app);  
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 5000));
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var server_bd_port = 3306;
var server_bd = 'us-cdbr-iron-east-04.cleardb.net';
var server_user = 'b16fa9963b6b69';
var server_pwd = '5080d557';


var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : server_bd,
  port     : server_bd_port,
  user     : server_user,
  password : server_pwd,
  database : 'heroku_85b15da8dca88f7'
});

connection.connect(function(err) {
  if (err) {
    console.error('Error al conectar BD: ' + err.stack);
    return;
  }

  console.log('Conectado exitosamente a la BD con ID ' + connection.threadId);
});


var empleadosCercanos = [];
var empleadosConectados = [{  
  id: 1,
  usuario: "Soy un empleado de ejemplo",
  descripcion : "Descripcion Ejemplo",
  rating: 4.5,
  edad: 25,
  costo: 100,
  latitud: -34.893393,
  longitud: -56.171873,
  email: "test@test.com",
  password: "12345" 
},{  
  id: 2,
  usuario: "Soy un empleado de ejemplo 2",
  descripcion : "Descripcion Ejemplo 2",
  rating: 4.5,
  edad: 25,
  costo: 100,
  latitud: -32.694151,
  longitud: -58.017911,
  email: "test@test.com",
  password: "12345" 
}];

app.use(express.static('public'));

app.get('/test', function(req, res) {  
  res.status(200).send("Server Online");
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
    var creadoCorrectamente = false;
    connection.query('INSERT INTO empleado SET ?', data, function(err, result) {
      if (err) throw err;

      console.log("Empleado insertado a BD correctamente");
      data.id = result.insertId;//Le ponemos el ID
      empleadosConectados.push(data);//Lo agregamos a la lista de conectados POR AHORA
      console.log(data);
      io.sockets.emit('empleadocreado', data);
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
    connection.query('SELECT * FROM empleado WHERE email = ? and password = ?',[data.email,data.password], function(error, results, fields) {
      if (error) throw error;
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

//------------------------------------------------------------------
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
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
