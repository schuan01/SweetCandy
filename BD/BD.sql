create database TestNode;
use TestNode;

CREATE TABLE Usuario(
id INT AUTO_INCREMENT PRIMARY KEY,
usuario VARCHAR(30) NOT NULL UNIQUE,
descripcion VARCHAR(30),
edad INT,
urlFoto VARCHAR(200),
email VARCHAR(50) NOT NULL UNIQUE, 
password VARCHAR(200) NOT NULL,
rating FLOAT
);

CREATE TABLE Empleado (
idEmpleado INT PRIMARY KEY,
costo FLOAT,
FOREIGN KEY (idEmpleado) REFERENCES Usuario(id)
);

CREATE TABLE Cliente (
idCliente INT PRIMARY KEY,
FOREIGN KEY (idCliente) REFERENCES Usuario(id)
);


CREATE TABLE Transaccion (
id INT AUTO_INCREMENT PRIMARY KEY,
empleadoTransaccion INT NOT NULL,
clienteTransaccion INT NOT NULL,/*POR AHORA NO HACEMOS REFERENCIA YA QUE PUEDE SER ANONIMO(ID 0)*/
fechaInicioTransaccion DATETIME NOT NULL,
fechaFinTransaccion DATETIME,
isActiva BIT,
totalTransaccion DOUBLE,
FOREIGN KEY (empleadoTransaccion) REFERENCES Empleado(idEmpleado)
);

CREATE TABLE FotosUsuario(
id INT AUTO_INCREMENT PRIMARY KEY,
usuarioFoto INT NOT NULL,
urlFoto VARCHAR(200) NOT NULL,
FOREIGN KEY (usuarioFoto) REFERENCES Usuario(id));