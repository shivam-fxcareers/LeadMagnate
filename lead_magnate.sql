-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 10, 2025 at 01:36 PM
-- Server version: 8.0.41
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lead_magnate`
--

-- --------------------------------------------------------

--
-- Table structure for table `lead_activities`
--

CREATE TABLE `lead_activities` (
  `id` int NOT NULL,
  `organisation_id` int NOT NULL,
  `lead_id` int NOT NULL,
  `user_id` int NOT NULL,
  `activity_type` enum('call','email','meeting','note','status_change','assignment','follow_up') NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `next_follow_up_date` datetime DEFAULT NULL,
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `status` enum('pending','completed','cancelled') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_assignments`
--

CREATE TABLE `lead_assignments` (
  `id` int NOT NULL,
  `organisation_id` int NOT NULL,
  `lead_id` int NOT NULL,
  `assigned_user_id` int DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `assigned_by_user_id` int NOT NULL,
  `previous_user_id` int DEFAULT NULL,
  `reassignment_reason` varchar(255) DEFAULT NULL,
  `notes` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_data`
--

CREATE TABLE `lead_data` (
  `id` int NOT NULL,
  `organisation_id` int NOT NULL,
  `lead_meta_id` int NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `full_name` varchar(200) DEFAULT NULL,
  `raw_field_data` json DEFAULT NULL,
  `consent_time` datetime DEFAULT NULL,
  `platform_key` enum('facebook','instagram','website') NOT NULL,
  `source_page_id` varchar(64) DEFAULT NULL,
  `source_page_name` varchar(150) DEFAULT NULL,
  `status` enum('new','qualified','contacted','meeting_scheduled','proposal_sent','negotiation','won','lost') DEFAULT 'new',
  `assigned_user_id` int DEFAULT NULL,
  `assigned_at` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_meta`
--

CREATE TABLE `lead_meta` (
  `id` int NOT NULL,
  `organisation_id` int NOT NULL,
  `platform_key` enum('facebook','instagram','website') NOT NULL,
  `source_lead_id` varchar(128) NOT NULL,
  `page_id` varchar(64) DEFAULT NULL,
  `form_id` varchar(64) DEFAULT NULL,
  `ad_id` varchar(64) DEFAULT NULL,
  `campaign_id` varchar(64) DEFAULT NULL,
  `created_time` datetime DEFAULT NULL,
  `received_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `page_url` varchar(512) DEFAULT NULL,
  `utm_source` varchar(100) DEFAULT NULL,
  `utm_medium` varchar(100) DEFAULT NULL,
  `utm_campaign` varchar(150) DEFAULT NULL,
  `utm_term` varchar(100) DEFAULT NULL,
  `utm_content` varchar(100) DEFAULT NULL,
  `processing_status` enum('received','processed','failed') DEFAULT 'received'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_stages`
--

CREATE TABLE `lead_stages` (
  `id` int NOT NULL,
  `organisation_id` int NOT NULL,
  `lead_id` int NOT NULL,
  `status_id` int NOT NULL,
  `entered_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `exited_at` timestamp NULL DEFAULT NULL,
  `duration_hours` decimal(10,2) DEFAULT NULL,
  `user_id` int NOT NULL,
  `notes` text,
  `next_action_required` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `lead_statuses`
--

CREATE TABLE `lead_statuses` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `name`, `created_at`, `updated_at`) VALUES
(2, 'roles', '2025-09-05 21:58:23', '2025-09-05 21:58:23'),
(3, 'organisation', '2025-09-05 21:58:36', '2025-09-05 21:58:36'),
(4, 'user', '2025-09-05 21:58:42', '2025-09-05 21:58:42'),
(5, 'permission', '2025-09-05 21:58:50', '2025-09-05 21:58:50'),
(6, 'permission', '2025-09-08 11:58:49', '2025-09-08 11:59:21');

-- --------------------------------------------------------

--
-- Table structure for table `organisations`
--

CREATE TABLE `organisations` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `legal_name` varchar(150) DEFAULT NULL,
  `registration_number` varchar(100) DEFAULT NULL,
  `tax_id` varchar(100) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `website` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `organisations`
--

INSERT INTO `organisations` (`id`, `name`, `legal_name`, `registration_number`, `tax_id`, `industry`, `website`, `phone`, `email`, `city`, `state`, `country`, `logo_url`, `created_at`, `updated_at`) VALUES
(1, 'Test Organisation', 'Test Org Pvt Ltd', 'REG1243', 'TAX1243', 'Technology', 'https://testorg2.com', '+911234567890', 'contact@testorg2.com', 'Mumbai', 'Maharashtra', 'India', 'https://testorg.com/logo.png', '2025-09-05 18:10:25', '2025-09-05 22:18:25'),
(2, 'Test Organisation', 'Test Org Pvt Ltd', 'REG123', 'TAX123', 'Technology', 'https://testorg.com', '+911234567890', 'contact@testorg.com', 'Mumbai', 'Maharashtra', 'India', 'https://testorg.com/logo.png', '2025-09-05 22:15:18', '2025-09-05 22:15:18'),
(3, 'Test Organisation', 'Test Org Pvt Ltd', 'RE12G123', 'TAX12355', 'Technology', 'https://testorg.com', '+911234567890', 'contact@test12org.com', 'Mumbai', 'Maharashtra', 'India', 'https://testorg.com/logo.png', '2025-09-07 07:23:06', '2025-09-07 07:23:06');

-- --------------------------------------------------------

--
-- Table structure for table `organisation_modules`
--

CREATE TABLE `organisation_modules` (
  `id` int NOT NULL,
  `organisation_id` int NOT NULL,
  `module_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `organisation_modules`
--

INSERT INTO `organisation_modules` (`id`, `organisation_id`, `module_id`, `created_at`, `updated_at`) VALUES
(1, 1, 4, '2025-09-06 22:15:09', '2025-09-06 22:15:09'),
(3, 1, 2, '2025-09-07 08:43:28', '2025-09-07 08:43:28');

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` int NOT NULL,
  `otp` varchar(10) NOT NULL,
  `user_id` int DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `otps`
--

INSERT INTO `otps` (`id`, `otp`, `user_id`, `type`, `created_at`, `expires_at`) VALUES
(6, '885534', 6, 'EMAIL_VERIFICATION', '2025-09-06 09:55:13', '2025-09-06 10:10:13');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `created_at`, `updated_at`) VALUES
(1, 'Superadmin', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),
(2, 'Org-admin', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),
(3, 'Manager', '2025-09-05 18:10:25', '2025-09-05 18:10:25');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `id` int NOT NULL,
  `role_id` int NOT NULL,
  `module_id` int NOT NULL,
  `can_create` tinyint(1) DEFAULT '0',
  `can_read` tinyint(1) DEFAULT '0',
  `can_update` tinyint(1) DEFAULT '0',
  `can_delete` tinyint(1) DEFAULT '0',
  `scope` enum('global','org') NOT NULL DEFAULT 'org',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`id`, `role_id`, `module_id`, `can_create`, `can_read`, `can_update`, `can_delete`, `scope`, `created_at`, `updated_at`) VALUES
(2, 1, 2, 0, 1, 0, 0, 'global', '2025-09-06 21:35:57', '2025-09-07 08:07:54'),
(3, 1, 3, 1, 1, 1, 1, 'global', '2025-09-06 21:36:10', '2025-09-06 21:36:10');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `is_verified` tinyint(1) DEFAULT '0',
  `organisation_id` int DEFAULT NULL,
  `role_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `is_verified`, `organisation_id`, `role_id`, `created_at`, `updated_at`) VALUES
(1, 'Shiv SuperAdmin', 'shivam@fxcareer.com', '+919876543210', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 1, 1, '2025-09-05 18:10:25', '2025-09-05 21:20:57'),
(5, 'John Doe', 'shivamw71@gmail.com', '+919876543211', '$2a$12$5sLaHs0PocxMzg5mU9XbcOX20TEqE8DIS0kQxofeiMNt703dT.gNO', 1, NULL, NULL, '2025-09-05 19:16:47', '2025-09-05 19:18:22'),
(6, 'John Doe', 'shivamw711@gmail.com', '+919876543511', '$2a$12$qjFY5I6jArr./I4zUz14s.M7jiFC8wXGQggWbyA8ZOiV2.XTpxImC', 0, NULL, NULL, '2025-09-06 09:55:13', '2025-09-06 09:55:13');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lead_activities`
--
ALTER TABLE `lead_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_leadact_org` (`organisation_id`),
  ADD KEY `fk_leadact_lead` (`lead_id`),
  ADD KEY `fk_leadact_user` (`user_id`);

--
-- Indexes for table `lead_assignments`
--
ALTER TABLE `lead_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_leadassign_org` (`organisation_id`),
  ADD KEY `fk_leadassign_lead` (`lead_id`),
  ADD KEY `fk_leadassign_user` (`assigned_user_id`),
  ADD KEY `fk_leadassign_byuser` (`assigned_by_user_id`);

--
-- Indexes for table `lead_data`
--
ALTER TABLE `lead_data`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_leaddata_org` (`organisation_id`),
  ADD KEY `fk_leaddata_meta` (`lead_meta_id`),
  ADD KEY `fk_leaddata_user` (`assigned_user_id`);

--
-- Indexes for table `lead_meta`
--
ALTER TABLE `lead_meta`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `platform_key` (`platform_key`,`source_lead_id`,`organisation_id`),
  ADD KEY `fk_leadmeta_org` (`organisation_id`);

--
-- Indexes for table `lead_stages`
--
ALTER TABLE `lead_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_leadstage_org` (`organisation_id`),
  ADD KEY `fk_leadstage_lead` (`lead_id`),
  ADD KEY `fk_leadstage_status` (`status_id`),
  ADD KEY `fk_leadstage_user` (`user_id`);

--
-- Indexes for table `lead_statuses`
--
ALTER TABLE `lead_statuses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `organisations`
--
ALTER TABLE `organisations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_number` (`registration_number`),
  ADD UNIQUE KEY `tax_id` (`tax_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `organisation_modules`
--
ALTER TABLE `organisation_modules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organisation_id` (`organisation_id`,`module_id`),
  ADD KEY `resource_id` (`module_id`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_id` (`role_id`,`module_id`),
  ADD KEY `resource_id` (`module_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD KEY `organisation_id` (`organisation_id`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lead_activities`
--
ALTER TABLE `lead_activities`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_assignments`
--
ALTER TABLE `lead_assignments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_data`
--
ALTER TABLE `lead_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_meta`
--
ALTER TABLE `lead_meta`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_stages`
--
ALTER TABLE `lead_stages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_statuses`
--
ALTER TABLE `lead_statuses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `organisations`
--
ALTER TABLE `organisations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `organisation_modules`
--
ALTER TABLE `organisation_modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `lead_activities`
--
ALTER TABLE `lead_activities`
  ADD CONSTRAINT `fk_leadact_lead` FOREIGN KEY (`lead_id`) REFERENCES `lead_data` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leadact_org` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leadact_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_assignments`
--
ALTER TABLE `lead_assignments`
  ADD CONSTRAINT `fk_leadassign_byuser` FOREIGN KEY (`assigned_by_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_leadassign_lead` FOREIGN KEY (`lead_id`) REFERENCES `lead_data` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leadassign_org` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leadassign_user` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lead_data`
--
ALTER TABLE `lead_data`
  ADD CONSTRAINT `fk_leaddata_meta` FOREIGN KEY (`lead_meta_id`) REFERENCES `lead_meta` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leaddata_org` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leaddata_user` FOREIGN KEY (`assigned_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `lead_meta`
--
ALTER TABLE `lead_meta`
  ADD CONSTRAINT `fk_leadmeta_org` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `lead_stages`
--
ALTER TABLE `lead_stages`
  ADD CONSTRAINT `fk_leadstage_lead` FOREIGN KEY (`lead_id`) REFERENCES `lead_data` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leadstage_org` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_leadstage_status` FOREIGN KEY (`status_id`) REFERENCES `lead_statuses` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_leadstage_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `organisation_modules`
--
ALTER TABLE `organisation_modules`
  ADD CONSTRAINT `organisation_modules_ibfk_1` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organisation_modules_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `otps`
--
ALTER TABLE `otps`
  ADD CONSTRAINT `otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
