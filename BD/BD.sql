use TestNode;

CREATE TABLE Empleado (
id INT AUTO_INCREMENT PRIMARY KEY,
usuario VARCHAR(30) NOT NULL,
descripcion VARCHAR(30),
rating FLOAT,
edad INT,
costo FLOAT,
latitud DOUBLE,
longitud DOUBLE,
urlFoto VARCHAR(200),
email VARCHAR(50) NOT NULL, /*HAY QUE HACERLO UNIQUE*/
password VARCHAR(200) NOT NULL
);

CREATE TABLE Transaccion (
id INT AUTO_INCREMENT PRIMARY KEY,
empleadoTransaccion INT NOT NULL,
clienteTransaccion INT NOT NULL,
fechaInicioTransaccion DATETIME NOT NULL,
fechaFinTransaccion DATETIME,
isActiva BIT,
totalTransaccion DOUBLE,
FOREIGN KEY (empleadoTransaccion) REFERENCES Empleado(id)
);

CREATE TABLE FotosUsuario(
id INT AUTO_INCREMENT PRIMARY KEY,
empleadoFoto INT NOT NULL,
urlFoto VARCHAR(200) NOT NULL,
FOREIGN KEY (empleadoFoto) REFERENCES Empleado(id));

select * from empleado