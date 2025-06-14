-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: kiosko
-- ------------------------------------------------------
-- Server version	9.2.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administracion`
--

DROP TABLE IF EXISTS `administracion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administracion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `rol` enum('vendedor','admin') DEFAULT 'vendedor',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_usuario` (`usuario`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administracion`
--

LOCK TABLES `administracion` WRITE;
/*!40000 ALTER TABLE `administracion` DISABLE KEYS */;
INSERT INTO `administracion` VALUES (1,'manuel','ManuelAguirr@gmail.com','$2y$10$Q/cQroypCnPaBJpiuLh3F.FapkOCbjt7nmMQmpRxbCNG2SZeVmRCW','vendedor'),(2,'AAPC','AAPC@gmail.com','$2y$10$SP7PlQHIzXCTVmhGC0J2o.HLKp962p/RI552oR5fFOtV1pwk9TSwW','admin');
/*!40000 ALTER TABLE `administracion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalles_venta`
--

DROP TABLE IF EXISTS `detalles_venta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `imagen` varchar(255) NOT NULL,
  `tipo` enum('bebida','comida','postre','dulce','salado','galletitas') NOT NULL,
  `estado` enum('activo','inactivo') NOT NULL DEFAULT 'activo',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'milanguche de sanwhinesa',1.00,'imagenes/sanguche-de-milanesa.jpg','comida','activo'),(2,'Coca-Cola 1.5L',1.00,'imagenes/coca-cola-1.5l.jpg','bebida','activo'),(3,'Hamburguesa Paty Clásica',1800.00,'imagenes/hamburguesa-paty-clasica.jpg','comida','activo'),(4,'Papas Lays Clásicas',900.00,'imagenes/papas-lays-clasicas.jpg','comida','activo'),(5,'Empanada de Carne',700.00,'imagenes/empanada-de-carne.jpg','comida','activo'),(6,'Choripán',2000.00,'imagenes/choripan.jpg','comida','activo'),(7,'Pizza Muzzarella',3200.00,'imagenes/pizza-muzzarella.jpg','comida','activo'),(8,'Fanta 1.5L',1200.00,'imagenes/fanta-1.5l.jpg','bebida','activo'),(9,'Sprite 1.5L',1200.00,'imagenes/sprite-1.5l.jpg','bebida','activo'),(10,'Panchos Vienissima',950.00,'imagenes/panchos-vienissima.jpg','comida','activo'),(11,'Helado de Dulce de Leche',2800.00,'imagenes/helado-dulce-de-leche.jpg','postre','activo'),(12,'Alfajor Jorgito',300.00,'imagenes/alfajor-jorgito.jpg','dulce','activo'),(13,'Chocolatada Cindor',600.00,'imagenes/chocolatada-cindor.jpg','bebida','activo'),(14,'Medialuna de Manteca',400.00,'imagenes/medialuna-de-manteca.jpg','comida','activo'),(15,'Tostado de Jamón y Queso',1400.00,'imagenes/tostado-jamon-queso.jpg','comida','activo'),(16,'Galletitas Oreo',500.00,'imagenes/galletitas-oreo.jpg','dulce','activo'),(17,'Bizcochitos Don Satur',650.00,'imagenes/bizcochitos-don-satur.jpg','dulce','activo'),(18,'Empanada de Pollo',700.00,'imagenes/empanada-de-pollo.jpg','comida','activo'),(19,'Agua Mineral 1.5L',850.00,'imagenes/agua-mineral-1.5l.jpg','bebida','activo'),(20,'Arroz con Leche',900.00,'imagenes/arroz-con-leche.jpg','postre','activo'),(21,'Tarta de Verdura',2400.00,'imagenes/tarta-de-verdura.jpg','comida','activo'),(22,'Brownie de Chocolate',1500.00,'imagenes/brownie-de-chocolate.jpg','postre','activo'),(23,'proje',244.00,'imagenes/thumb.png','salado','activo');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'manuel','ManuelAguirr@gmail.com','2da ','123232323','$2y$10$GQs9xzbDb3Ymb/AETlyg4O0bDu0KqLTBBLFed5nLveqqo4IrncBhy','aprobado'),(2,'thiago avalos','chuckytato08@gmail.com','7mo 2da','1133334444','$2y$10$OCURFct9dk36b2B27hD5I.Bs/yuhiozzf4LDEhHxfSgA8fy1K0ezm','aprobado'),(4,'david','david@gmail.com','7mo 3ra','1123456789','$2y$10$gUn5NRLNDyZ7lWmsaSQjluhXr1tuGmqbZxP4OCujeeeQTPhJBa8l.','aprobado'),(5,'ciro','ciro@gmail.com','4to 1ra','1123456789','$2y$10$FCaMq58K3xSCTSK90RiRp.yQr5HTPTqDmr9QumVCUmlwQKe1CnQze','aprobado'),(7,'alex','alex@gmail.com','23','12332232','$2y$10$gPd5Jg4PNLcui.jRADMWlucFLNhGC6HJ4iR5XQyVNrOdMPe0mMr4S','aprobado');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ventas`
--

DROP TABLE IF EXISTS `ventas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `fecha_venta` datetime DEFAULT CURRENT_TIMESTAMP,
  `total` decimal(10,2) NOT NULL,
  `estado_pedido` enum('esperando','preparando','entregado','pedido_listo') NOT NULL DEFAULT 'esperando',
  `mensaje` varchar(255) DEFAULT NULL,
  `pago_en` enum('efectivo','transferencia') DEFAULT 'efectivo',
  PRIMARY KEY (`id`),
  KEY `fk_id_usuario` (`id_usuario`),
  CONSTRAINT `fk_ventas_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ventas`
--

LOCK TABLES `ventas` WRITE;
/*!40000 ALTER TABLE `ventas` DISABLE KEYS */;
INSERT INTO `ventas` VALUES (31,1,'2025-05-17 04:29:35',6300.00,'entregado',NULL,'efectivo'),(33,1,'2025-05-17 17:10:41',44500.00,'entregado',NULL,'efectivo'),(34,5,'2025-05-18 04:28:18',1300.00,'entregado',NULL,'efectivo'),(36,1,'2025-05-19 00:14:31',1300.00,'entregado',NULL,'efectivo'),(37,1,'2025-05-19 00:15:02',2500.00,'entregado',NULL,'efectivo'),(38,1,'2025-05-19 00:53:52',900.00,'entregado',NULL,'efectivo'),(39,1,'2025-05-19 01:04:10',2800.00,'entregado',NULL,'efectivo'),(40,1,'2025-05-21 01:19:00',3100.00,'entregado',NULL,'efectivo'),(41,1,'2025-05-21 01:23:00',1300.00,'entregado',NULL,'efectivo'),(42,1,'2025-05-21 01:27:00',1300.00,'entregado',NULL,'efectivo'),(43,1,'2025-05-21 01:28:00',1300.00,'entregado',NULL,'efectivo'),(44,1,'2025-05-21 01:39:00',2600.00,'entregado',NULL,'efectivo'),(45,1,'2025-05-21 01:55:00',1300.00,'entregado',NULL,'efectivo'),(46,1,'2025-05-21 01:58:00',1300.00,'entregado',NULL,'efectivo'),(47,1,'2025-05-21 02:16:00',1300.00,'entregado',NULL,'efectivo'),(48,1,'2025-05-21 02:17:00',1300.00,'entregado',NULL,'efectivo'),(49,1,'2025-05-21 02:17:00',2500.00,'entregado',NULL,'efectivo'),(50,1,'2025-05-21 02:17:00',2500.00,'entregado',NULL,'efectivo'),(51,1,'2025-05-22 05:15:00',1.00,'esperando',NULL,'efectivo'),(52,1,'2025-05-22 05:17:26',1.00,'esperando',NULL,'efectivo'),(53,1,'2025-05-22 05:18:02',1.00,'esperando',NULL,'efectivo'),(54,1,'2025-05-22 05:18:03',1.00,'esperando',NULL,'efectivo'),(55,1,'2025-05-22 05:19:14',2.00,'esperando',NULL,'efectivo'),(56,1,'2025-05-22 05:19:58',2.00,'esperando',NULL,'efectivo'),(57,1,'2025-05-22 05:19:58',2.00,'esperando',NULL,'efectivo'),(58,7,'2025-05-22 05:21:13',2.00,'esperando',NULL,'efectivo'),(59,7,'2025-05-22 05:21:53',2.00,'esperando',NULL,'efectivo'),(60,7,'2025-05-22 05:21:54',2.00,'esperando',NULL,'efectivo'),(61,1,'2025-05-22 05:31:04',1.00,'esperando',NULL,'efectivo'),(62,7,'2025-05-22 05:34:13',2.00,'esperando',NULL,'efectivo'),(63,7,'2025-05-22 05:34:57',2.00,'esperando',NULL,'efectivo'),(64,7,'2025-05-22 05:34:58',2.00,'esperando',NULL,'efectivo'),(65,1,'2025-05-22 05:36:08',1.00,'esperando',NULL,'efectivo'),(66,1,'2025-05-22 05:36:19',2.00,'esperando',NULL,'efectivo'),(67,7,'2025-05-22 05:38:03',2.00,'esperando',NULL,'efectivo'),(68,7,'2025-05-22 05:38:45',2.00,'esperando',NULL,'efectivo'),(69,7,'2025-05-22 05:38:45',2.00,'esperando',NULL,'efectivo'),(70,7,'2025-05-22 05:40:33',2.00,'esperando',NULL,'efectivo'),(71,7,'2025-05-22 05:46:03',1.00,'esperando',NULL,'efectivo'),(72,7,'2025-05-22 05:46:43',1.00,'esperando',NULL,'efectivo'),(73,7,'2025-05-22 05:47:38',1.00,'esperando',NULL,'efectivo'),(74,7,'2025-05-22 05:47:39',1.00,'esperando',NULL,'efectivo'),(75,7,'2025-05-22 05:51:08',2.00,'esperando',NULL,'efectivo'),(76,7,'2025-05-22 05:56:19',2.00,'esperando',NULL,'efectivo'),(77,7,'2025-05-22 06:00:26',2.00,'esperando',NULL,'efectivo'),(78,7,'2025-05-22 06:00:34',3.00,'esperando',NULL,'efectivo'),(79,1,'2025-05-22 06:05:51',1.00,'esperando',NULL,'efectivo'),(80,7,'2025-05-22 06:06:35',1.00,'esperando',NULL,'efectivo'),(81,1,'2025-05-22 06:11:08',1.00,'esperando',NULL,'efectivo'),(82,1,'2025-05-22 06:11:16',2.00,'esperando',NULL,'efectivo'),(83,7,'2025-05-22 06:16:37',2.00,'esperando',NULL,'efectivo'),(84,7,'2025-05-22 06:25:47',2.00,'esperando',NULL,'efectivo'),(85,7,'2025-05-22 06:30:30',2.00,'esperando',NULL,'efectivo'),(86,7,'2025-05-22 06:35:28',3.00,'esperando',NULL,'efectivo'),(87,7,'2025-05-22 06:40:34',1.00,'esperando',NULL,'efectivo'),(88,1,'2025-05-22 20:05:42',3.00,'esperando',NULL,'efectivo'),(89,1,'2025-05-22 20:06:22',3.00,'esperando',NULL,'efectivo'),(90,1,'2025-05-22 20:12:32',3.00,'esperando',NULL,'efectivo'),(91,5,'2025-05-22 20:14:39',3.00,'esperando',NULL,'efectivo'),(92,5,'2025-05-22 21:45:00',3.00,'esperando',NULL,'efectivo'),(93,5,'2025-05-22 21:49:00',3.00,'entregado','sd asdasd asd','efectivo'),(94,5,'2025-05-22 22:06:03',1.00,'esperando','','transferencia'),(95,5,'2025-05-22 22:21:03',1.00,'esperando','','transferencia'),(96,5,'2025-05-22 22:21:58',1.00,'esperando','','transferencia');
/*!40000 ALTER TABLE `ventas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-05-22 23:00:20
