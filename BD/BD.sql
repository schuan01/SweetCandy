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
email VARCHAR(50) NOT NULL, /*HAY QUE HACERLO UNIQUE*/
password VARCHAR(200) NOT NULL
)