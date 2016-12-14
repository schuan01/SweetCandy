var socket = io.connect('https://warm-basin-61084.herokuapp.com', { 'forceNew': true });

socket.on('conectados', function(data) {  
  for(var i = 0; i < data.length; i++) {
	var obj = data[i];
	var uluru = {lat: obj.latitud, lng: obj.longitud};
    var map = new google.maps.Map(document.getElementById('map'), {
          zoom: 4,
          center: uluru
        });
    var marker = new google.maps.Marker({
          position: uluru,
          map: map
        });
  }
})