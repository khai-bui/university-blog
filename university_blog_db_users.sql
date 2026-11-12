-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: university_blog_db
-- ------------------------------------------------------
-- Server version	8.0.46

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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ROLE_ADMIN','ROLE_STUDENT','ROLE_TEACHER') NOT NULL,
  `username` varchar(50) NOT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT '1',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`),
  UNIQUE KEY `UKr43af9ap4edm43mmtq01oddj6` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'2026-11-05 04:39:20.611518','khai@example.com','password123','ROLE_STUDENT','student_khai',1,1),(2,'2026-11-05 04:39:20.634153','admin@example.com','password123','ROLE_TEACHER','lecturer_admin',1,1),(3,'2026-11-06 05:24:48.166659','b@b.com','$2a$10$gLUVY9cqzzUxHW2EwCSSoOLtBqDUqCuRsA.WlQlX9pd2heVcfG8Hm','ROLE_STUDENT','khai2',1,1),(4,'2026-11-08 11:43:54.337929','khai.buiminh05@gmail.com','$2a$10$4HGMB4N2OyCJoays3GS91O3mwssu/ds6.gVZgRiPPld73xjUboJCy','ROLE_ADMIN','khai.buiminh05',1,1),(5,'2026-11-08 11:44:11.286385','minhkhai3105@gmail.com','$2a$10$1JLoWyNlrY597GHroj7.Ze.E8kkSlom3yQylDyuNfgo9RABdA1fFS','ROLE_STUDENT','minhkhai3105',1,1),(6,'2026-11-09 07:34:53.076637','52300033@student.tdtu.edu.vn','$2a$10$cSkbsyhf1YjM.IGuxkQ7yOyNYsghTohENbeviyiSSMXkXzcf0wihm','ROLE_STUDENT','52300033',1,1),(10,'2026-11-11 04:07:41.375507','minhkhai12309@gmail.com','$2a$10$i1B5BACs9s0Q6Js.Y2LKX.y4uUtYdx6Cn.Zg1ftuH45of9QEm7trK','ROLE_STUDENT','minhkhai123',1,1),(11,'2026-11-11 16:30:19.305962','tbich7084@gmail.com','$2a$10$AuZBQ6Pu6aoytSesd/KSOuTagACFP2VVtcBDQsTP0tvzDzEK0Cobq','ROLE_STUDENT','ngocbich',1,1);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-12 20:44:19
