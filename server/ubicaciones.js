exports = module.exports = function (io,empleadosConectados,empleadosCercanos) {
    io.sockets.on('connection', function (socket) {

        //UBICACION DEL EMPLEADO CONECTADO
        socket.on('setubacionempleado', function (data) {

            for (var i = 0; i < empleadosConectados.length; i++) {
                if (empleadosConectados[i].id == data.id) {
                    empleadosConectados[i].latitud = data.latitud;//Edita en tiempo real
                    empleadosConectados[i].longitud = data.longitud;//Edita en tiempo real
                    break;
                }

            }

        });

        //OBTIENE LOS EMPLEADOS CERCANOS
        socket.on('getcercanos', function (data) {
            empleadosCercanos = [];
            if (empleadosConectados.length > 0) {
                GetCercanos(data.latitud, data.longitud, data.limite);
                socket.emit('empleadoscercanos', empleadosCercanos);
            }


        });

    });
}

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

    for (var i = 0; i < empleadosConectados.length; i++) {
        var obj = empleadosConectados[i];
        var dif = PythagorasEquirectangular(latitude, longitude, obj.latitud, obj.longitud);
        if (dif < mindif) {
            empleadosCercanos.push(obj);//Lo agregamos a la lista
        }
    }

    console.log("Usuarios Cercanos: " + empleadosCercanos.length);
}
//------------------------------ CALCULO DE CERCANOS -----------------