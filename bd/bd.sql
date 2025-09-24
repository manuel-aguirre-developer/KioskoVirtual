
DROP TABLE IF EXISTS `administracion`;
DROP TABLE IF EXISTS `ventas`;
DROP TABLE IF EXISTS `productos`;
DROP TABLE IF EXISTS `usuarios`;
DROP TABLE IF EXISTS `detalles_venta`;
CREATE TABLE `administracion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('vendedor','admin') DEFAULT 'vendedor',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_usuario` (`usuario`),
  UNIQUE KEY `unique_email` (`email`)
);
LOCK TABLES `administracion` WRITE;
INSERT INTO `administracion` VALUES (1,'manuel','ManuelAguirr@gmail.com','$2y$10$Q/cQroypCnPaBJpiuLh3F.FapkOCbjt7nmMQmpRxbCNG2SZeVmRCW','vendedor'),(2,'AAPC','AAPC@gmail.com','$2y$10$SP7PlQHIzXCTVmhGC0J2o.HLKp962p/RI552oR5fFOtV1pwk9TSwW','admin');
UNLOCK TABLES;

CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `tipo` enum('bebida','comida','postre','dulce','salado','galletitas') NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id`)
);
LOCK TABLES `productos` WRITE;

INSERT INTO `productos` VALUES (1,'milanguche de sanwhinesa',1.00,'imagenes/sanguche-de-milanesa.jpg','comida','activo'),(2,'Coca-Cola 1.5L',1.00,'imagenes/coca-cola-1.5l.jpg','bebida','activo'),(3,'Hamburguesa Paty Clásica',1800.00,'imagenes/hamburguesa-paty-clasica.jpg','comida','activo'),(4,'Papas Lays Clásicas',900.00,'imagenes/papas-lays-clasicas.jpg','comida','activo'),(5,'Empanada de Carne',700.00,'imagenes/empanada-de-carne.jpg','comida','activo'),(6,'Choripán',2000.00,'imagenes/choripan.jpg','comida','activo'),(7,'Pizza Muzzarella',3200.00,'imagenes/pizza-muzzarella.jpg','comida','activo'),(8,'Fanta 1.5L',1200.00,'imagenes/fanta-1.5l.jpg','bebida','activo'),(9,'Sprite 1.5L',1200.00,'imagenes/sprite-1.5l.jpg','bebida','activo'),(10,'Panchos Vienissima',950.00,'imagenes/panchos-vienissima.jpg','comida','activo'),(11,'Helado de Dulce de Leche',2800.00,'imagenes/helado-dulce-de-leche.jpg','postre','activo'),(12,'Alfajor Jorgito',300.00,'imagenes/alfajor-jorgito.jpg','dulce','activo'),(13,'Chocolatada Cindor',600.00,'imagenes/chocolatada-cindor.jpg','bebida','activo'),(14,'Medialuna de Manteca',400.00,'imagenes/medialuna-de-manteca.jpg','comida','activo'),(15,'Tostado de Jamón y Queso',1400.00,'imagenes/tostado-jamon-queso.jpg','comida','activo'),(16,'Galletitas Oreo',500.00,'imagenes/galletitas-oreo.jpg','dulce','activo'),(17,'Bizcochitos Don Satur',650.00,'imagenes/bizcochitos-don-satur.jpg','dulce','activo'),(18,'Empanada de Pollo',700.00,'imagenes/empanada-de-pollo.jpg','comida','activo'),(19,'Agua Mineral 1.5L',850.00,'imagenes/agua-mineral-1.5l.jpg','bebida','activo'),(20,'Arroz con Leche',900.00,'imagenes/arroz-con-leche.jpg','postre','activo'),(21,'Tarta de Verdura',2400.00,'imagenes/tarta-de-verdura.jpg','comida','activo'),(22,'Brownie de Chocolate',1500.00,'imagenes/brownie-de-chocolate.jpg','postre','activo'),(23,'proje',244.00,'imagenes/thumb.png','salado','activo');

UNLOCK TABLES;

CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `curso` varchar(255) DEFAULT NULL,
  `telefono` varchar(30) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `estado` enum('baneado','pendiente','aprobado') DEFAULT 'pendiente',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email` (`email`)
);
LOCK TABLES `usuarios` WRITE;
INSERT INTO `usuarios` VALUES (1,'manuel','ManuelAguirr@gmail.com','2da ','123232323','$2y$10$GQs9xzbDb3Ymb/AETlyg4O0bDu0KqLTBBLFed5nLveqqo4IrncBhy','aprobado'),(2,'thiago avalos','chuckytato08@gmail.com','7mo 2da','1133334444','$2y$10$OCURFct9dk36b2B27hD5I.Bs/yuhiozzf4LDEhHxfSgA8fy1K0ezm','aprobado'),(4,'david','david@gmail.com','7mo 3ra','1123456789','$2y$10$gUn5NRLNDyZ7lWmsaSQjluhXr1tuGmqbZxP4OCujeeeQTPhJBa8l.','aprobado'),(5,'ciro','ciro@gmail.com','4to 1ra','1123456789','$2y$10$FCaMq58K3xSCTSK90RiRp.yQr5HTPTqDmr9QumVCUmlwQKe1CnQze','aprobado'),(7,'alex','alex@gmail.com','23','12332232','$2y$10$gPd5Jg4PNLcui.jRADMWlucFLNhGC6HJ4iR5XQyVNrOdMPe0mMr4S','aprobado');
UNLOCK TABLES;


CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha_venta` datetime DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL,
  `estado_pedido` enum('esperando','preparando','entregado','pedido_listo') NOT NULL DEFAULT 'esperando',
  `mensaje` text,
  `pago_en` enum('efectivo','transferencia') NOT NULL,
  `abono` decimal(10,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `fk_id_usuario` (`id_usuario`),
  CONSTRAINT `fk_ventas_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);

LOCK TABLES `ventas` WRITE;

INSERT INTO `ventas` VALUES (92,1,'2025-05-31 15:57:00',1800.00,'esperando','','efectivo',0.00),(93,5,'2025-05-31 16:22:00',23600.00,'esperando','','efectivo',0.00),(94,5,'2025-05-31 16:24:00',2400.00,'esperando','','efectivo',0.00),(95,2,'2025-05-31 21:44:46',4600.00,'esperando','','transferencia',0.00),(96,1,'2025-06-02 19:39:00',1800.00,'esperando','','efectivo',0.00),(97,1,'2025-06-02 19:40:00',6600.00,'esperando','','efectivo',0.00),(98,1,'2025-06-02 19:40:00',3300.00,'esperando','','efectivo',0.00),(99,1,'2025-06-02 19:41:00',3200.00,'esperando','','efectivo',0.00),(100,1,'2025-06-02 19:41:00',3300.00,'esperando','','efectivo',0.00),(101,1,'2025-06-03 18:11:00',1800.00,'entregado','adjskfj','efectivo',0.00),(102,1,'2025-06-04 01:13:00',14500.00,'esperando','','efectivo',0.00),(103,1,'2025-06-05 18:22:00',3300.00,'esperando','','efectivo',0.00),(104,1,'2025-06-06 18:16:00',4600.00,'esperando','','efectivo',0.00),(105,2,'2025-06-09 21:12:00',1300.00,'entregado','','efectivo',0.00),(106,2,'2025-06-09 21:13:00',3300.00,'entregado','','efectivo',0.00),(107,2,'2025-06-10 01:32:00',1300.00,'entregado','','efectivo',0.00),(108,2,'2025-06-10 01:32:00',3300.00,'entregado','','efectivo',0.00),(109,2,'2025-06-10 01:40:00',3300.00,'entregado','','efectivo',0.00),(110,2,'2025-06-10 01:45:00',3300.00,'entregado','','efectivo',0.00),(111,2,'2025-06-10 01:57:00',3300.00,'entregado','','efectivo',0.00),(112,2,'2025-06-13 19:10:00',1300.00,'esperando','','efectivo',0.00),(113,2,'2025-06-13 19:11:00',4600.00,'esperando','','efectivo',0.00),(114,2,'2025-06-13 19:13:00',1800.00,'esperando','','efectivo',0.00),(115,2,'2025-06-13 19:15:00',900.00,'entregado','','efectivo',0.00),(116,2,'2025-06-13 20:12:00',3300.00,'esperando','','efectivo',0.00),(117,2,'2025-06-13 20:13:00',3300.00,'esperando','','efectivo',0.00),(118,2,'2025-06-13 20:15:00',1300.00,'esperando','','efectivo',0.00),(119,2,'2025-06-13 20:40:00',1800.00,'esperando','','efectivo',1800.00),(120,2,'2025-06-13 20:45:00',1300.00,'esperando','','efectivo',2300.00),(121,2,'2025-06-13 20:54:00',1300.00,'esperando','','efectivo',2300.00),(122,2,'2025-06-14 03:46:00',3100.00,'entregado','','efectivo',3100.00),(123,2,'2025-06-14 03:55:00',1300.00,'esperando','','efectivo',1300.00);

UNLOCK TABLES;

CREATE TABLE `detalles_venta` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_venta` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL DEFAULT '1',
  `subtotal` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_id_venta` (`id_venta`),
  KEY `fk_id_producto` (`id_producto`),
  CONSTRAINT `fk_detalles_venta_productos` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_detalles_venta_ventas` FOREIGN KEY (`id_venta`) REFERENCES `ventas` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
);