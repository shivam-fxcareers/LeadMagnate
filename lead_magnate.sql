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
  `activity_type` enum('call','email','meeting','note','task','follow_up','demo','proposal','contract','other') NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text,
  `activity_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date` timestamp NULL DEFAULT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `outcome` text,
  `next_action` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `lead_activities`
--

INSERT INTO `lead_activities` (`id`, `organisation_id`, `lead_id`, `user_id`, `activity_type`, `subject`, `description`, `activity_date`, `due_date`, `status`, `priority`, `outcome`, `next_action`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 3, 'call', 'Initial qualification call', 'Called to understand business needs and budget', '2025-09-01 12:00:00', NULL, 'completed', 'high', 'Qualified lead - budget confirmed $50K+', 'Schedule product demo', '2025-09-01 12:00:00', '2025-09-01 12:30:00'),
(2, 1, 1, 3, 'email', 'Demo scheduling follow-up', 'Sent calendar invite for product demonstration', '2025-09-01 14:00:00', NULL, 'completed', 'medium', 'Demo scheduled for next week', NULL, '2025-09-01 14:00:00', '2025-09-01 14:00:00'),
(3, 1, 2, 4, 'meeting', 'Product demonstration', 'Conducted comprehensive product demo focusing on enterprise features', '2025-09-02 10:00:00', NULL, 'completed', 'high', 'Very positive response, interested in enterprise plan', 'Send proposal within 2 days', '2025-09-02 10:00:00', '2025-09-02 11:00:00'),
(4, 1, 2, 4, 'task', 'Prepare enterprise proposal', 'Create customized proposal for enterprise package', '2025-09-02 15:00:00', '2025-09-04 17:00:00', 'pending', 'high', NULL, NULL, '2025-09-02 15:00:00', '2025-09-02 15:00:00'),
(5, 1, 3, 3, 'note', 'Lead research notes', 'Researched company background - growing startup in fintech space', '2025-09-02 11:00:00', NULL, 'completed', 'low', NULL, 'Prepare targeted pitch for fintech industry', '2025-09-02 11:00:00', '2025-09-02 11:00:00'),
(6, 2, 5, 7, 'call', 'Discovery call', 'Initial call to understand retail business requirements', '2025-09-03 14:00:00', NULL, 'completed', 'medium', 'Small business, budget around $10K', 'Send basic package information', '2025-09-03 14:00:00', '2025-09-03 14:30:00'),
(7, 2, 7, 8, 'email', 'Fashion industry case study', 'Sent relevant case studies from fashion retail clients', '2025-09-04 10:00:00', NULL, 'completed', 'medium', 'Positive response, wants to discuss further', 'Schedule follow-up call', '2025-09-04 10:00:00', '2025-09-04 10:00:00'),
(8, 3, 8, 10, 'demo', 'B2B platform demo', 'Demonstrated B2B features and integration capabilities', '2025-09-04 17:00:00', NULL, 'completed', 'high', 'Impressed with API capabilities', 'Discuss technical implementation', '2025-09-04 17:00:00', '2025-09-04 18:00:00'),
(9, 3, 9, 11, 'follow_up', 'Manufacturing solution follow-up', 'Following up on manufacturing industry specific requirements', '2025-09-05 09:00:00', '2025-09-07 09:00:00', 'pending', 'medium', NULL, NULL, '2025-09-05 09:00:00', '2025-09-05 09:00:00'),
(10, 1, 10, 4, 'proposal', 'Consulting services proposal', 'Sent detailed proposal for consulting engagement', '2025-09-05 16:00:00', NULL, 'completed', 'high', 'Proposal under review', 'Follow up in 3 days', '2025-09-05 16:00:00', '2025-09-05 16:00:00'),
(11, 1, 4, 2, 'contract', 'Contract negotiation', 'Discussing contract terms and pricing for enterprise deal', '2025-09-03 11:00:00', '2025-09-10 17:00:00', 'pending', 'urgent', NULL, 'Finalize pricing and terms', '2025-09-03 11:00:00', '2025-09-03 11:00:00'),
(12, 2, 6, 9, 'other', 'LinkedIn connection', 'Connected on LinkedIn and sent personalized message', '2025-09-04 13:00:00', NULL, 'completed', 'low', 'Connection accepted', 'Share relevant content weekly', '2025-09-04 13:00:00', '2025-09-04 13:00:00');

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

--
-- Dumping data for table `lead_assignments`
--

INSERT INTO `lead_assignments` (`id`, `organisation_id`, `lead_id`, `assigned_user_id`, `assigned_at`, `assigned_by_user_id`, `previous_user_id`, `reassignment_reason`, `notes`) VALUES
(1, 1, 1, 3, '2025-09-01 11:00:00', 2, NULL, NULL, 'Initial assignment to Mike Wilson for qualification'),
(2, 1, 2, 4, '2025-09-01 15:30:00', 2, NULL, NULL, 'High-value lead assigned to Emily Davis'),
(3, 1, 3, 3, '2025-09-02 10:00:00', 2, NULL, NULL, 'Instagram lead assigned to Mike Wilson'),
(4, 1, 4, 2, '2025-09-02 17:00:00', 1, NULL, NULL, 'Enterprise lead assigned to Sarah Johnson (Org Admin)'),
(5, 2, 5, 7, '2025-09-03 12:00:00', 7, NULL, NULL, 'Self-assignment by Robert Brown'),
(6, 2, 7, 8, '2025-09-04 09:00:00', 7, NULL, NULL, 'Fashion industry lead assigned to Lisa Anderson'),
(7, 3, 8, 10, '2025-09-04 16:30:00', 10, NULL, NULL, 'B2B demo request assigned to Jennifer Taylor'),
(8, 3, 9, 11, '2025-09-05 13:00:00', 10, NULL, NULL, 'Manufacturing lead assigned to Chris Martinez'),
(9, 1, 10, 4, '2025-09-05 18:00:00', 2, NULL, NULL, 'Consulting lead assigned to Emily Davis'),
(10, 1, 1, 4, '2025-09-02 14:30:00', 2, 3, 'Workload balancing', 'Reassigned from Mike to Emily due to high workload'),
(11, 1, 1, 3, '2025-09-03 09:15:00', 2, 4, 'Expertise match', 'Reassigned back to Mike - better industry expertise'),
(12, 2, 5, 8, '2025-09-04 16:20:00', 7, 7, 'Specialization', 'Reassigned to Lisa for retail industry expertise');

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

--
-- Dumping data for table `lead_data`
--

INSERT INTO `lead_data` (`id`, `organisation_id`, `lead_meta_id`, `email`, `phone`, `first_name`, `last_name`, `full_name`, `raw_field_data`, `consent_time`, `platform_key`, `source_page_id`, `source_page_name`, `status`, `assigned_user_id`, `assigned_at`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 'alex.thompson@email.com', '+919876543301', 'Alex', 'Thompson', 'Alex Thompson', '{"company": "Tech Solutions Inc", "job_title": "Marketing Manager", "budget": "50000-100000", "timeline": "3-6 months"}', '2025-09-01 10:30:00', 'facebook', '123456789', 'Test Organisation Page', 'qualified', 3, '2025-09-01 11:00:00', '2025-09-01 10:30:15', '2025-09-02 09:15:20'),
(2, 1, 2, 'maria.garcia@email.com', '+919876543302', 'Maria', 'Garcia', 'Maria Garcia', '{"company": "Digital Marketing Co", "job_title": "CEO", "budget": "100000+", "timeline": "immediate"}', '2025-09-01 14:15:00', 'facebook', '123456789', 'Test Organisation Page', 'meeting_scheduled', 4, '2025-09-01 15:30:00', '2025-09-01 14:15:20', '2025-09-02 10:45:30'),
(3, 1, 3, 'james.wilson@email.com', '+919876543303', 'James', 'Wilson', 'James Wilson', '{"company": "StartupXYZ", "job_title": "Founder", "budget": "25000-50000", "timeline": "6-12 months"}', '2025-09-02 09:45:00', 'instagram', '987654321', 'Test Organisation Instagram', 'contacted', 3, '2025-09-02 10:00:00', '2025-09-02 09:45:10', '2025-09-03 14:20:15'),
(4, 1, 4, 'sarah.johnson@email.com', '+919876543304', 'Sarah', 'Johnson', 'Sarah Johnson', '{"company": "Enterprise Corp", "job_title": "IT Director", "budget": "200000+", "timeline": "1-3 months"}', '2025-09-02 16:20:00', 'website', NULL, 'Contact Form', 'proposal_sent', 2, '2025-09-02 17:00:00', '2025-09-02 16:20:05', '2025-09-04 11:30:25'),
(5, 2, 5, 'michael.brown@email.com', '+919876543305', 'Michael', 'Brown', 'Michael Brown', '{"company": "Retail Solutions", "job_title": "Operations Manager", "budget": "75000-150000", "timeline": "3-6 months"}', '2025-09-03 11:00:00', 'facebook', '456789123', 'Test Organisation 2 Page', 'negotiation', 7, '2025-09-03 12:00:00', '2025-09-03 11:00:12', '2025-09-05 16:45:40'),
(6, 2, 6, 'lisa.davis@email.com', '+919876543306', 'Lisa', 'Davis', 'Lisa Davis', '{"company": "Healthcare Plus", "job_title": "Marketing Director", "budget": "30000-60000", "timeline": "6-12 months"}', '2025-09-03 13:30:00', 'website', NULL, 'Newsletter Signup', 'new', NULL, NULL, '2025-09-03 13:30:08', '2025-09-03 13:30:08'),
(7, 2, 7, 'david.miller@email.com', '+919876543307', 'David', 'Miller', 'David Miller', '{"company": "Fashion Forward", "job_title": "Brand Manager", "budget": "40000-80000", "timeline": "immediate"}', '2025-09-04 08:15:00', 'instagram', '789123456', 'Test Organisation 2 Instagram', 'won', 8, '2025-09-04 09:00:00', '2025-09-04 08:15:18', '2025-09-06 13:20:50'),
(8, 3, 8, 'jennifer.taylor@email.com', '+919876543308', 'Jennifer', 'Taylor', 'Jennifer Taylor', '{"company": "B2B Services Ltd", "job_title": "Sales Director", "budget": "150000+", "timeline": "1-3 months"}', '2025-09-04 15:45:00', 'website', NULL, 'Demo Request', 'qualified', 10, '2025-09-04 16:30:00', '2025-09-04 15:45:25', '2025-09-05 08:15:35'),
(9, 3, 9, 'robert.anderson@email.com', '+919876543309', 'Robert', 'Anderson', 'Robert Anderson', '{"company": "Manufacturing Inc", "job_title": "Plant Manager", "budget": "100000-200000", "timeline": "3-6 months"}', '2025-09-05 12:20:00', 'facebook', '321654987', 'Test Organisation 3 Page', 'contacted', 11, '2025-09-05 13:00:00', '2025-09-05 12:20:30', '2025-09-06 09:40:45'),
(10, 1, 10, 'amanda.white@email.com', '+919876543310', 'Amanda', 'White', 'Amanda White', '{"company": "Consulting Group", "job_title": "Partner", "budget": "80000-120000", "timeline": "6-12 months"}', '2025-09-05 17:10:00', 'website', NULL, 'Quote Request', 'lost', 4, '2025-09-05 18:00:00', '2025-09-05 17:10:15', '2025-09-07 14:25:10');

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

--
-- Dumping data for table `lead_meta`
--

INSERT INTO `lead_meta` (`id`, `organisation_id`, `platform_key`, `source_lead_id`, `page_id`, `form_id`, `ad_id`, `campaign_id`, `created_time`, `received_at`, `page_url`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `processing_status`) VALUES
(1, 1, 'facebook', 'fb_lead_001', '123456789', 'form_001', 'ad_001', 'camp_001', '2025-09-01 10:30:00', '2025-09-01 10:30:15', 'https://facebook.com/testorg', 'facebook', 'social', 'summer_campaign_2025', 'lead_generation', 'cta_button', 'processed'),
(2, 1, 'facebook', 'fb_lead_002', '123456789', 'form_001', 'ad_002', 'camp_001', '2025-09-01 14:15:00', '2025-09-01 14:15:20', 'https://facebook.com/testorg', 'facebook', 'social', 'summer_campaign_2025', 'lead_generation', 'carousel_ad', 'processed'),
(3, 1, 'instagram', 'ig_lead_001', '987654321', 'form_002', 'ad_003', 'camp_002', '2025-09-02 09:45:00', '2025-09-02 09:45:10', 'https://instagram.com/testorg', 'instagram', 'social', 'brand_awareness_2025', 'brand_awareness', 'story_ad', 'processed'),
(4, 1, 'website', 'web_lead_001', NULL, 'contact_form', NULL, NULL, '2025-09-02 16:20:00', '2025-09-02 16:20:05', 'https://testorg2.com/contact', 'google', 'organic', NULL, 'contact_us', 'contact_form', 'processed'),
(5, 2, 'facebook', 'fb_lead_003', '456789123', 'form_003', 'ad_004', 'camp_003', '2025-09-03 11:00:00', '2025-09-03 11:00:12', 'https://facebook.com/testorg2', 'facebook', 'social', 'autumn_promo_2025', 'promotion', 'video_ad', 'processed'),
(6, 2, 'website', 'web_lead_002', NULL, 'newsletter_signup', NULL, NULL, '2025-09-03 13:30:00', '2025-09-03 13:30:08', 'https://testorg.com/newsletter', 'google', 'cpc', 'newsletter_campaign', 'newsletter', 'signup_form', 'processed'),
(7, 2, 'instagram', 'ig_lead_002', '789123456', 'form_004', 'ad_005', 'camp_004', '2025-09-04 08:15:00', '2025-09-04 08:15:18', 'https://instagram.com/testorg2', 'instagram', 'social', 'product_launch_2025', 'product_launch', 'reel_ad', 'processed'),
(8, 3, 'website', 'web_lead_003', NULL, 'demo_request', NULL, NULL, '2025-09-04 15:45:00', '2025-09-04 15:45:25', 'https://test12org.com/demo', 'linkedin', 'social', 'b2b_campaign', 'demo_request', 'cta_button', 'processed'),
(9, 3, 'facebook', 'fb_lead_004', '321654987', 'form_005', 'ad_006', 'camp_005', '2025-09-05 12:20:00', '2025-09-05 12:20:30', 'https://facebook.com/test12org', 'facebook', 'social', 'lead_gen_campaign', 'business_leads', 'lead_form', 'processed'),
(10, 1, 'website', 'web_lead_004', NULL, 'quote_request', NULL, NULL, '2025-09-05 17:10:00', '2025-09-05 17:10:15', 'https://testorg2.com/quote', 'bing', 'cpc', 'quote_campaign', 'get_quote', 'quote_form', 'received');

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

--
-- Dumping data for table `lead_stages`
--

INSERT INTO `lead_stages` (`id`, `organisation_id`, `lead_id`, `status_id`, `entered_at`, `exited_at`, `duration_hours`, `user_id`, `notes`, `next_action_required`, `updated_at`) VALUES
(1, 1, 1, 1, '2025-09-01 10:30:15', '2025-09-01 11:00:00', 0.50, 3, 'Lead entered system from Facebook ad', 'Initial qualification call', '2025-09-01 11:00:00'),
(2, 1, 1, 2, '2025-09-01 11:00:00', '2025-09-02 09:15:20', 22.25, 3, 'Initial qualification completed - budget confirmed $50K+', 'Schedule product demo', '2025-09-02 09:15:20'),
(3, 1, 1, 3, '2025-09-02 09:15:20', NULL, NULL, 3, 'Demo scheduled and conducted successfully', 'Follow up on demo feedback', '2025-09-02 09:15:20'),
(4, 1, 2, 1, '2025-09-01 14:15:20', '2025-09-01 15:30:00', 1.25, 4, 'High-value enterprise lead from Facebook', 'Quick qualification due to high budget', '2025-09-01 15:30:00'),
(5, 1, 2, 2, '2025-09-01 15:30:00', '2025-09-02 10:45:30', 19.25, 4, 'Quick qualification - enterprise budget confirmed $100K+', 'Schedule comprehensive demo', '2025-09-02 10:45:30'),
(6, 1, 2, 4, '2025-09-02 10:45:30', NULL, NULL, 4, 'Product demo completed with very positive feedback', 'Prepare and send proposal', '2025-09-02 10:45:30'),
(7, 1, 3, 1, '2025-09-02 09:45:10', '2025-09-02 10:00:00', 0.25, 3, 'Instagram lead - fintech startup', 'Research company background', '2025-09-02 10:00:00'),
(8, 1, 3, 3, '2025-09-02 10:00:00', '2025-09-03 14:20:15', 28.33, 3, 'Initial contact made - researched company background', 'Prepare targeted fintech pitch', '2025-09-03 14:20:15'),
(9, 1, 4, 1, '2025-09-02 16:20:05', '2025-09-02 17:00:00', 0.67, 2, 'Enterprise lead from website contact form', 'Fast-track due to enterprise size', '2025-09-02 17:00:00'),
(10, 1, 4, 5, '2025-09-02 17:00:00', '2025-09-04 11:30:25', 42.50, 2, 'Fast-tracked to proposal stage due to enterprise requirements', 'Prepare comprehensive enterprise proposal', '2025-09-04 11:30:25'),
(11, 2, 5, 1, '2025-09-03 11:00:12', '2025-09-03 12:00:00', 1.00, 7, 'Retail business lead from Facebook ad', 'Initial qualification call', '2025-09-03 12:00:00'),
(12, 2, 5, 6, '2025-09-03 12:00:00', '2025-09-05 16:45:40', 52.75, 7, 'Qualified and moved to negotiation - budget $75K-150K', 'Finalize contract terms', '2025-09-05 16:45:40'),
(13, 2, 6, 1, '2025-09-03 13:30:08', NULL, NULL, 9, 'Newsletter signup - needs nurturing', 'Assign to sales rep for follow-up', '2025-09-03 13:30:08'),
(14, 2, 7, 1, '2025-09-04 08:15:18', '2025-09-04 09:00:00', 0.75, 8, 'Fashion retail lead from Instagram', 'Quick qualification due to immediate timeline', '2025-09-04 09:00:00'),
(15, 2, 7, 2, '2025-09-04 09:00:00', '2025-09-04 10:00:00', 1.00, 8, 'Qualified - interested in fashion industry features', 'Send fashion industry case studies', '2025-09-04 10:00:00'),
(16, 2, 7, 7, '2025-09-04 10:00:00', '2025-09-06 13:20:50', 51.33, 8, 'Deal closed successfully - $60K contract', 'Onboarding and implementation', '2025-09-06 13:20:50'),
(17, 3, 8, 1, '2025-09-04 15:45:25', '2025-09-04 16:30:00', 0.75, 10, 'B2B demo request from website', 'Schedule demo immediately', '2025-09-04 16:30:00'),
(18, 3, 8, 2, '2025-09-04 16:30:00', '2025-09-05 08:15:35', 15.75, 10, 'Demo completed - impressed with API capabilities', 'Discuss technical implementation details', '2025-09-05 08:15:35'),
(19, 3, 9, 1, '2025-09-05 12:20:30', '2025-09-05 13:00:00', 0.67, 11, 'Manufacturing lead from Facebook', 'Initial contact and qualification', '2025-09-05 13:00:00'),
(20, 3, 9, 3, '2025-09-05 13:00:00', '2025-09-06 09:40:45', 20.67, 11, 'Initial contact made - manufacturing requirements discussed', 'Follow up on specific industry needs', '2025-09-06 09:40:45'),
(21, 1, 10, 1, '2025-09-05 17:10:15', '2025-09-05 18:00:00', 0.83, 4, 'Consulting services inquiry from website', 'Prepare consulting proposal', '2025-09-05 18:00:00'),
(22, 1, 10, 8, '2025-09-05 18:00:00', '2025-09-07 14:25:10', 44.42, 4, 'Lead lost - chose competitor solution', 'Analyze loss reasons for improvement', '2025-09-07 14:25:10');

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

--
-- Dumping data for table `lead_statuses`
--

INSERT INTO `lead_statuses` (`id`, `name`, `description`, `is_active`, `created_at`) VALUES
(1, 'new', 'Newly received lead that needs initial review', 1, '2025-09-05 18:10:25'),
(2, 'qualified', 'Lead has been qualified and meets our criteria', 1, '2025-09-05 18:10:25'),
(3, 'contacted', 'Initial contact has been made with the lead', 1, '2025-09-05 18:10:25'),
(4, 'meeting_scheduled', 'Meeting or demo has been scheduled with the lead', 1, '2025-09-05 18:10:25'),
(5, 'proposal_sent', 'Proposal or quote has been sent to the lead', 1, '2025-09-05 18:10:25'),
(6, 'negotiation', 'Currently in negotiation phase with the lead', 1, '2025-09-05 18:10:25'),
(7, 'won', 'Lead has been successfully converted to customer', 1, '2025-09-05 18:10:25'),
(8, 'lost', 'Lead has been lost or declined our offer', 1, '2025-09-05 18:10:25');

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
(1, 'dashboard', '2025-09-05 21:58:15', '2025-09-05 21:58:15'),
(2, 'roles', '2025-09-05 21:58:23', '2025-09-05 21:58:23'),
(3, 'organisation', '2025-09-05 21:58:36', '2025-09-05 21:58:36'),
(4, 'user', '2025-09-05 21:58:42', '2025-09-05 21:58:42'),
(5, 'permission', '2025-09-05 21:58:50', '2025-09-05 21:58:50'),
(7, 'leads', '2025-09-05 21:59:05', '2025-09-05 21:59:05'),
(8, 'lead_activities', '2025-09-05 21:59:15', '2025-09-05 21:59:15'),
(9, 'lead_assignments', '2025-09-05 21:59:25', '2025-09-05 21:59:25'),
(10, 'analytics', '2025-09-05 21:59:35', '2025-09-05 21:59:35'),
(11, 'reports', '2025-09-05 21:59:45', '2025-09-05 21:59:45'),
(12, 'settings', '2025-09-05 21:59:55', '2025-09-05 21:59:55');

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
-- TechCorp Solutions (org_id=1) - Full access to all modules
(1, 1, 1, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- dashboard
(2, 1, 2, '2025-09-06 22:15:09', '2025-09-06 22:15:09'),  -- roles
(3, 1, 3, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- organisation
(4, 1, 4, '2025-09-07 08:43:28', '2025-09-07 08:43:28'),  -- user
(5, 1, 5, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- permission
(6, 1, 7, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- leads
(7, 1, 8, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_activities
(8, 1, 9, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_assignments
(9, 1, 10, '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- analytics
(10, 1, 11, '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- reports
(11, 1, 12, '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- settings
-- RetailMax Inc (org_id=2) - Standard business modules
(12, 2, 1, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- dashboard
(13, 2, 4, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- user
(14, 2, 7, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- leads
(15, 2, 8, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_activities
(16, 2, 9, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_assignments
(17, 2, 10, '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- analytics
(18, 2, 11, '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- reports
-- Manufacturing Pro (org_id=3) - Core lead management modules
(19, 3, 1, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- dashboard
(20, 3, 4, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- user
(21, 3, 7, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- leads
(22, 3, 8, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_activities
(23, 3, 9, '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_assignments
(24, 3, 11, '2025-09-05 18:10:25', '2025-09-05 18:10:25'); -- reports

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
-- Superadmin (role_id=1) - Full access to all modules
(1, 1, 1, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- dashboard
(2, 1, 2, 1, 1, 1, 1, 'global', '2025-09-06 21:35:57', '2025-09-07 08:07:54'),  -- roles
(3, 1, 3, 1, 1, 1, 1, 'global', '2025-09-06 21:36:10', '2025-09-06 21:36:10'),  -- organisation
(4, 1, 4, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- user
(5, 1, 5, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- permission
(6, 1, 7, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- leads
(7, 1, 8, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_activities
(8, 1, 9, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_assignments
(9, 1, 10, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- analytics
(10, 1, 11, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- reports
(11, 1, 12, 1, 1, 1, 1, 'global', '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- settings
-- Org-admin (role_id=2) - Full access within organization
(12, 2, 1, 1, 1, 1, 1, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- dashboard
(13, 2, 4, 1, 1, 1, 1, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- user
(14, 2, 7, 1, 1, 1, 1, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- leads
(15, 2, 8, 1, 1, 1, 1, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_activities
(16, 2, 9, 1, 1, 1, 1, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_assignments
(17, 2, 10, 1, 1, 1, 1, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- analytics
(18, 2, 11, 1, 1, 1, 1, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- reports
(19, 2, 12, 0, 1, 1, 0, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- settings (limited)
-- Manager (role_id=3) - Management level access
(20, 3, 1, 0, 1, 0, 0, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- dashboard (read-only)
(21, 3, 7, 1, 1, 1, 0, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- leads (no delete)
(22, 3, 8, 1, 1, 1, 0, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_activities (no delete)
(23, 3, 9, 1, 1, 1, 0, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'),  -- lead_assignments (no delete)
(24, 3, 10, 0, 1, 0, 0, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- analytics (read-only)
(25, 3, 11, 0, 1, 0, 0, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'), -- reports (read-only)
(26, 3, 12, 0, 1, 0, 0, 'org', '2025-09-05 18:10:25', '2025-09-05 18:10:25'); -- settings (read-only)

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
(2, 'Sarah Johnson', 'sarah.johnson@testorg2.com', '+919876543212', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 1, 2, '2025-09-05 18:15:25', '2025-09-05 18:15:25'),
(3, 'Mike Wilson', 'mike.wilson@testorg2.com', '+919876543213', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 1, 3, '2025-09-05 18:20:25', '2025-09-05 18:20:25'),
(4, 'Emily Davis', 'emily.davis@testorg2.com', '+919876543214', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 1, 3, '2025-09-05 18:25:25', '2025-09-05 18:25:25'),
(5, 'John Doe', 'shivamw71@gmail.com', '+919876543211', '$2a$12$5sLaHs0PocxMzg5mU9XbcOX20TEqE8DIS0kQxofeiMNt703dT.gNO', 1, NULL, NULL, '2025-09-05 19:16:47', '2025-09-05 19:18:22'),
(6, 'John Doe', 'shivamw711@gmail.com', '+919876543511', '$2a$12$qjFY5I6jArr./I4zUz14s.M7jiFC8wXGQggWbyA8ZOiV2.XTpxImC', 0, NULL, NULL, '2025-09-06 09:55:13', '2025-09-06 09:55:13'),
(7, 'Robert Brown', 'robert.brown@testorg.com', '+919876543215', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 2, 2, '2025-09-05 18:30:25', '2025-09-05 18:30:25'),
(8, 'Lisa Anderson', 'lisa.anderson@testorg.com', '+919876543216', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 2, 3, '2025-09-05 18:35:25', '2025-09-05 18:35:25'),
(9, 'David Miller', 'david.miller@testorg.com', '+919876543217', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 2, 3, '2025-09-05 18:40:25', '2025-09-05 18:40:25'),
(10, 'Jennifer Taylor', 'jennifer.taylor@test12org.com', '+919876543218', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 3, 2, '2025-09-05 18:45:25', '2025-09-05 18:45:25'),
(11, 'Chris Martinez', 'chris.martinez@test12org.com', '+919876543219', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 3, 3, '2025-09-05 18:50:25', '2025-09-05 18:50:25'),
(12, 'Amanda White', 'amanda.white@test12org.com', '+919876543220', '$2a$12$RHSYukiu9CkVqXshenQwM.LXEgeXrE4dMKNWONhf0SdrZ/8dCAGxG', 1, 3, 3, '2025-09-05 18:55:25', '2025-09-05 18:55:25');

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `lead_assignments`
--
ALTER TABLE `lead_assignments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `lead_data`
--
ALTER TABLE `lead_data`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lead_meta`
--
ALTER TABLE `lead_meta`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `lead_stages`
--
ALTER TABLE `lead_stages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `lead_statuses`
--
ALTER TABLE `lead_statuses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
