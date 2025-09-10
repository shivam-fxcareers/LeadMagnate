-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 06, 2025 at 11:39 PM
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
(5, 'permission', '2025-09-05 21:58:50', '2025-09-05 21:58:50');

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


CREATE TABLE lead_meta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT NOT NULL,                       -- map to your organisations
    platform_key ENUM('facebook','instagram','website') NOT NULL,
    source_lead_id VARCHAR(128) NOT NULL,               -- lead_id from FB/IG/web
    page_id VARCHAR(64),
    form_id VARCHAR(64),
    ad_id VARCHAR(64),
    campaign_id VARCHAR(64),
    created_time DATETIME,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    page_url VARCHAR(512),
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(150),
    utm_term VARCHAR(100),
    utm_content VARCHAR(100),
    processing_status ENUM('received','processed','failed') DEFAULT 'received',

    CONSTRAINT fk_leadmeta_org FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE,
    UNIQUE (platform_key, source_lead_id, organisation_id) -- avoid duplicates
);
CREATE TABLE lead_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT NOT NULL,
    lead_meta_id INT NOT NULL,                          -- link to raw meta
    email VARCHAR(150),
    phone VARCHAR(30),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200),
    raw_field_data JSON,                                -- custom Q&A storage
    consent_time DATETIME,
    platform_key ENUM('facebook','instagram','website') NOT NULL,
    source_page_id VARCHAR(64),
    source_page_name VARCHAR(150),
    status ENUM('new','qualified','contacted','meeting_scheduled','proposal_sent','negotiation','won','lost') DEFAULT 'new',
    assigned_user_id INT DEFAULT NULL,
    assigned_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_leaddata_org FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE,
    CONSTRAINT fk_leaddata_meta FOREIGN KEY (lead_meta_id) REFERENCES lead_meta(id) ON DELETE CASCADE,
    CONSTRAINT fk_leaddata_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL
);


CREATE TABLE lead_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT NOT NULL,
    lead_id INT NOT NULL,
    assigned_user_id INT DEFAULT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    assigned_by_user_id INT NOT NULL,
    previous_user_id INT DEFAULT NULL,
    reassignment_reason VARCHAR(255),
    notes TEXT,
    updated_by INT DEFAULT NULL,

    CONSTRAINT fk_leadassign_org FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE,
    CONSTRAINT fk_leadassign_lead FOREIGN KEY (lead_id) REFERENCES lead_data(id) ON DELETE CASCADE,
    CONSTRAINT fk_leadassign_user FOREIGN KEY (assigned_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_leadassign_byuser FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_leadassign_updatedby FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE assignment_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    old_status VARCHAR(50) DEFAULT NULL,
    new_status VARCHAR(50) NOT NULL,
    changed_by INT DEFAULT NULL,
    reason TEXT DEFAULT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_assignhist_assignment FOREIGN KEY (assignment_id) REFERENCES lead_assignments(id) ON DELETE CASCADE,
    CONSTRAINT fk_assignhist_changedby FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE lead_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT NOT NULL,
    lead_id INT NOT NULL,
    user_id INT NOT NULL,
    activity_type ENUM('call','email','meeting','note','status_change','assignment','follow_up') NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_follow_up_date DATETIME,
    priority ENUM('low','medium','high','urgent') DEFAULT 'medium',
    status ENUM('pending','completed','cancelled') DEFAULT 'pending',

    CONSTRAINT fk_leadact_org FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE,
    CONSTRAINT fk_leadact_lead FOREIGN KEY (lead_id) REFERENCES lead_data(id) ON DELETE CASCADE,
    CONSTRAINT fk_leadact_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE lead_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lead_stages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    organisation_id INT NOT NULL,
    lead_id INT NOT NULL,
    status_id INT NOT NULL,
    entered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exited_at TIMESTAMP NULL,
    duration_hours DECIMAL(10,2),
    user_id INT NOT NULL,
    notes TEXT,
    next_action_required VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_leadstage_org FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE CASCADE,
    CONSTRAINT fk_leadstage_lead FOREIGN KEY (lead_id) REFERENCES lead_data(id) ON DELETE CASCADE,
    CONSTRAINT fk_leadstage_status FOREIGN KEY (status_id) REFERENCES lead_statuses(id) ON DELETE RESTRICT,
    CONSTRAINT fk_leadstage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


--
-- Dumping data for table `organisations`
--

INSERT INTO `organisations` (`id`, `name`, `legal_name`, `registration_number`, `tax_id`, `industry`, `website`, `phone`, `email`, `city`, `state`, `country`, `logo_url`, `created_at`, `updated_at`) VALUES
(1, 'Test Organisation', 'Test Org Pvt Ltd', 'REG1243', 'TAX1243', 'Technology', 'https://testorg2.com', '+911234567890', 'contact@testorg2.com', 'Mumbai', 'Maharashtra', 'India', 'https://testorg.com/logo.png', '2025-09-05 18:10:25', '2025-09-05 22:18:25'),
(2, 'Test Organisation', 'Test Org Pvt Ltd', 'REG123', 'TAX123', 'Technology', 'https://testorg.com', '+911234567890', 'contact@testorg.com', 'Mumbai', 'Maharashtra', 'India', 'https://testorg.com/logo.png', '2025-09-05 22:15:18', '2025-09-05 22:15:18');

-- --------------------------------------------------------

--
-- Table structure for table `organisation_resources`
--

CREATE TABLE `organisation_resources` (
  `id` int NOT NULL,
  `organisation_id` int NOT NULL,
  `resource_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(2, 1, 2, 1, 1, 1, 1, 'global', '2025-09-06 21:35:57', '2025-09-06 21:35:57'),
(3, 1, 3, 1, 1, 1, 1, 'global', '2025-09-06 21:36:10', '2025-09-06 21:36:10'),
(4, 1, 4, 1, 1, 1, 1, 'global', '2025-09-06 21:36:21', '2025-09-06 21:36:21'),
(5, 1, 5, 1, 1, 1, 1, 'global', '2025-09-06 21:36:35', '2025-09-06 21:36:35');

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
-- Indexes for table `organisation_resources`
--
ALTER TABLE `organisation_resources`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `organisation_id` (`organisation_id`,`resource_id`),
  ADD KEY `resource_id` (`resource_id`);

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
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `organisations`
--
ALTER TABLE `organisations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `organisation_resources`
--
ALTER TABLE `organisation_resources`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `organisation_resources`
--
ALTER TABLE `organisation_resources`
  ADD CONSTRAINT `organisation_resources_ibfk_1` FOREIGN KEY (`organisation_id`) REFERENCES `organisations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `organisation_resources_ibfk_2` FOREIGN KEY (`resource_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE;

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
