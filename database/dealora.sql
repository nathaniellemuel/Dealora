-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: dealora
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `activities` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agreement_id` bigint(20) unsigned NOT NULL,
  `actor_wallet` varchar(42) DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `activities_agreement_id_created_at_index` (`agreement_id`,`created_at`),
  CONSTRAINT `activities_agreement_id_foreign` FOREIGN KEY (`agreement_id`) REFERENCES `agreements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES (8,3,'0x3011fc89e6eed3711ba20a92c810d13bd27c419c','created','Agreement created',NULL,'2026-09-15 02:13:50','2026-09-15 02:13:50'),(9,3,'0x3011fc89e6eed3711ba20a92c810d13bd27c419c','sow_generated','Scope of work generated','{\"summary\":\"kopdesk merah putih\",\"deliverables\":[\"3 pages\"],\"timeline\":\"Delivery by 2027-01-01.\",\"payment\":\"1\",\"revision_policy\":\"Two revision rounds within scope. Additional scope requires a new agreement.\"}','2026-09-15 02:13:50','2026-09-15 02:13:50'),(10,3,'0x3011fc89e6eed3711ba20a92c810d13bd27c419c','pending','Agreement updated','{\"status\":\"pending\"}','2026-09-15 02:14:13','2026-09-15 02:14:13'),(11,3,'0x476c8545e14d7b92cbf277c245f0de5c6a67f872','accepted','Agreement updated','{\"status\":\"accepted\"}','2026-09-15 02:14:28','2026-09-15 02:14:28'),(12,3,'0x3011fc89e6eed3711ba20a92c810d13bd27c419c','locked','Agreement locked on BOT Chain','{\"tx_hash\":\"0xa3fa57970c2766aead0df9e13dcc049f1ef2c3d4b39203b8aafd1057e3c9006b\",\"chain_id\":1}','2026-09-15 02:17:10','2026-09-15 02:17:10');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `agreements`
--

DROP TABLE IF EXISTS `agreements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `agreements` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agreement_id` varchar(32) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `sow` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`sow`)),
  `deliverables` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `budget` decimal(10,2) DEFAULT NULL,
  `funded_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `escrow_status` varchar(20) NOT NULL DEFAULT 'unfunded',
  `escrow_tx_hash` varchar(66) DEFAULT NULL,
  `payment_terms` varchar(255) DEFAULT NULL,
  `revision_policy` varchar(255) DEFAULT NULL,
  `status` enum('draft','pending','locked','accepted','rejected','changes_requested','completed') NOT NULL DEFAULT 'draft',
  `client_wallet` varchar(42) NOT NULL,
  `freelancer_wallet` varchar(42) DEFAULT NULL,
  `client_id` bigint(20) unsigned DEFAULT NULL,
  `freelancer_id` bigint(20) unsigned DEFAULT NULL,
  `sow_hash` varchar(66) DEFAULT NULL,
  `tx_hash` varchar(66) DEFAULT NULL,
  `chain_id` bigint(20) unsigned DEFAULT NULL,
  `contract_address` varchar(42) DEFAULT NULL,
  `locked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agreements_agreement_id_unique` (`agreement_id`),
  KEY `agreements_client_id_foreign` (`client_id`),
  KEY `agreements_freelancer_id_foreign` (`freelancer_id`),
  KEY `agreements_status_client_wallet_index` (`status`,`client_wallet`),
  KEY `agreements_status_freelancer_wallet_index` (`status`,`freelancer_wallet`),
  KEY `agreements_client_wallet_index` (`client_wallet`),
  KEY `agreements_freelancer_wallet_index` (`freelancer_wallet`),
  CONSTRAINT `agreements_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `agreements_freelancer_id_foreign` FOREIGN KEY (`freelancer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agreements`
--

LOCK TABLES `agreements` WRITE;
/*!40000 ALTER TABLE `agreements` DISABLE KEYS */;
INSERT INTO `agreements` VALUES (3,'AG-20260915-RRESSD','Jokowi','kopdesk merah putih','{\"summary\":\"kopdesk merah putih\",\"deliverables\":[\"3 pages\"],\"timeline\":\"Delivery by 2027-01-01.\",\"payment\":\"1\",\"revision_policy\":\"Two revision rounds within scope. Additional scope requires a new agreement.\"}','3 pages','2027-01-01',1.00,0.00,'unfunded',NULL,'1',NULL,'locked','0x3011fc89e6eed3711ba20a92c810d13bd27c419c','0x476c8545e14d7b92cbf277c245f0de5c6a67f872',1,2,'0x87b507da5bc266f43ec03456f53120b39eb001d03261f769bcc54249ad81b247','0xa3fa57970c2766aead0df9e13dcc049f1ef2c3d4b39203b8aafd1057e3c9006b',1,NULL,'2026-09-15 02:17:10','2026-09-15 02:13:50','2026-09-15 02:17:10');
/*!40000 ALTER TABLE `agreements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache`
--

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache`
--

LOCK TABLES `cache` WRITE;
/*!40000 ALTER TABLE `cache` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cache_locks`
--

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cache_locks`
--

LOCK TABLES `cache_locks` WRITE;
/*!40000 ALTER TABLE `cache_locks` DISABLE KEYS */;
/*!40000 ALTER TABLE `cache_locks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deliverables`
--

DROP TABLE IF EXISTS `deliverables`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deliverables` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agreement_id` bigint(20) unsigned NOT NULL,
  `milestone_id` bigint(20) unsigned DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `file_url` varchar(255) DEFAULT NULL,
  `status` enum('draft','submitted','approved','rejected') NOT NULL DEFAULT 'draft',
  `submitted_by` varchar(42) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `deliverables_agreement_id_foreign` (`agreement_id`),
  KEY `deliverables_milestone_id_foreign` (`milestone_id`),
  CONSTRAINT `deliverables_agreement_id_foreign` FOREIGN KEY (`agreement_id`) REFERENCES `agreements` (`id`) ON DELETE CASCADE,
  CONSTRAINT `deliverables_milestone_id_foreign` FOREIGN KEY (`milestone_id`) REFERENCES `milestones` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deliverables`
--

LOCK TABLES `deliverables` WRITE;
/*!40000 ALTER TABLE `deliverables` DISABLE KEYS */;
/*!40000 ALTER TABLE `deliverables` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `failed_jobs`
--

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) NOT NULL,
  `connection` varchar(255) NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `failed_jobs`
--

LOCK TABLES `failed_jobs` WRITE;
/*!40000 ALTER TABLE `failed_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `failed_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `job_batches`
--

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `job_batches`
--

LOCK TABLES `job_batches` WRITE;
/*!40000 ALTER TABLE `job_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `job_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `jobs`
--

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` smallint(5) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `jobs`
--

LOCK TABLES `jobs` WRITE;
/*!40000 ALTER TABLE `jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `migrations`
--

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `migrations`
--

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (1,'0001_01_01_000000_create_users_table',1),(2,'0001_01_01_000001_create_cache_table',1),(3,'0001_01_01_000002_create_jobs_table',1),(4,'2026_09_15_074244_add_wallet_fields_to_users',1),(5,'2026_09_15_074245_create_agreements_table',1),(6,'2026_09_15_074246_create_activities_table',1),(7,'2026_09_15_074247_create_milestones_table',1),(8,'2026_09_15_074248_create_deliverables_table',1),(9,'2026_09_15_074448_create_personal_access_tokens_table',1),(10,'2026_09_15_092137_add_escrow_fields_to_agreements',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `milestones`
--

DROP TABLE IF EXISTS `milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `milestones` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `agreement_id` bigint(20) unsigned NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('pending','in_progress','submitted','approved','rejected') NOT NULL DEFAULT 'pending',
  `escrow_status` varchar(20) NOT NULL DEFAULT 'unfunded',
  `due_date` date DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `milestones_agreement_id_foreign` (`agreement_id`),
  CONSTRAINT `milestones_agreement_id_foreign` FOREIGN KEY (`agreement_id`) REFERENCES `agreements` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `milestones`
--

LOCK TABLES `milestones` WRITE;
/*!40000 ALTER TABLE `milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_tokens`
--

DROP TABLE IF EXISTS `password_reset_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_tokens`
--

LOCK TABLES `password_reset_tokens` WRITE;
/*!40000 ALTER TABLE `password_reset_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `password_reset_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `personal_access_tokens`
--

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) unsigned NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `personal_access_tokens`
--

LOCK TABLES `personal_access_tokens` WRITE;
/*!40000 ALTER TABLE `personal_access_tokens` DISABLE KEYS */;
INSERT INTO `personal_access_tokens` VALUES (1,'App\\Models\\User',1,'wallet','e47c8661e444a357e78192ee9ad88f5223dd536534d575529fd857daed7ed570','[\"*\"]','2026-09-15 01:03:39',NULL,'2026-09-15 01:00:07','2026-09-15 01:03:39'),(2,'App\\Models\\User',1,'wallet','f74c928f46dec9901799e56824a2c5105cff52481a5575d8607af99333cd5591','[\"*\"]','2026-09-15 01:03:49',NULL,'2026-09-15 01:03:49','2026-09-15 01:03:49'),(3,'App\\Models\\User',1,'wallet','0ff9a8880d9560e3f3e3c4c66fb429f0c8a910f795f7447d6fd9ca532d90d68b','[\"*\"]','2026-09-15 01:17:19',NULL,'2026-09-15 01:17:18','2026-09-15 01:17:19'),(4,'App\\Models\\User',1,'wallet','fca1bb323bae4c0ac256e03a4cfca931ab91359b9e57d481898a5a2136a55b3f','[\"*\"]','2026-09-15 02:17:44',NULL,'2026-09-15 01:17:50','2026-09-15 02:17:44'),(5,'App\\Models\\User',2,'wallet','6c890ad52d9574a10ee5042cb1c649d7952cea5b7489531ade01d5c07cd88035','[\"*\"]','2026-09-15 02:18:44',NULL,'2026-09-15 01:34:34','2026-09-15 02:18:44'),(6,'App\\Models\\User',1,'wallet','83a8c3945ede54e3a809f8813501700404bc4a431f3239b5d7766892598e2938','[\"*\"]','2026-09-15 02:21:29',NULL,'2026-09-15 02:18:18','2026-09-15 02:21:29');
/*!40000 ALTER TABLE `personal_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sessions`
--

LOCK TABLES `sessions` WRITE;
/*!40000 ALTER TABLE `sessions` DISABLE KEYS */;
INSERT INTO `sessions` VALUES ('3dTDtsC8KYnxT3ocU5zfOM9PIXoLhYuly0U5flkX',NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36','eyJfdG9rZW4iOiJmNnNsNk9zdGFyZjAwWXg5WUEyUTZEcVZ0VnRacFp0U2NEaDlQSmJkIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hcHBcL2FncmVlbWVudHNcLzMiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1789463918),('kHnfPrbRTaByYGmmEFp5PJpYy79silKOYeADgNTz',NULL,'127.0.0.1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36','eyJfdG9rZW4iOiI1RDI4UW5nSHhJMUxjNlQ1OURqT3dJVGhKbnA5QnZtUzF4U1ZTVmNBIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hcHBcL2FncmVlbWVudHNcLzMiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=',1789463825);
/*!40000 ALTER TABLE `sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `wallet_address` varchar(42) DEFAULT NULL,
  `role` enum('client','freelancer') DEFAULT NULL,
  `nonce` varchar(64) DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_wallet_address_unique` (`wallet_address`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'0x3011...419c',NULL,'0x3011fc89e6eed3711ba20a92c810d13bd27c419c','client','clm0cM2CGZOeLK4q',NULL,NULL,NULL,'2026-09-15 01:00:07','2026-09-15 02:07:20'),(2,'0x476c...f872',NULL,'0x476c8545e14d7b92cbf277c245f0de5c6a67f872','freelancer','Z604WnKaEif25W2k',NULL,NULL,NULL,'2026-09-15 01:34:33','2026-09-15 01:34:44');
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

-- Dump completed on 2026-09-15 16:23:53
