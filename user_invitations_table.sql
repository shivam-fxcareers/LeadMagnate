-- Create user_invitations table for managing user invitations
CREATE TABLE IF NOT EXISTS user_invitations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    organisation_id INT,
    role_id INT,
    invited_by INT NOT NULL,
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('pending', 'accepted', 'cancelled', 'expired') DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    accepted_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (organisation_id) REFERENCES organisations(id) ON DELETE SET NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE SET NULL,
    FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for better performance
    INDEX idx_email (email),
    INDEX idx_token (invitation_token),
    INDEX idx_status (status),
    INDEX idx_expires_at (expires_at),
    INDEX idx_organisation_id (organisation_id)
);

-- Add some sample data for testing (optional)
-- INSERT INTO user_invitations (email, organisation_id, role_id, invited_by, invitation_token, expires_at) VALUES
-- ('test@example.com', 1, 4, 1, 'sample_token_123', DATE_ADD(NOW(), INTERVAL 7 DAY));