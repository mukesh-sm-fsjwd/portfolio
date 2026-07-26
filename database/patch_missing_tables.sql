-- ============================================
-- PORTFOLIO DB PATCH — Missing Tables
-- Run this in phpMyAdmin > portfolio_db > SQL tab
-- ============================================

USE portfolio_db;

-- 1. technologies table (for project tech tags with icons)
CREATE TABLE IF NOT EXISTS technologies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('frontend', 'backend', 'database', 'language') DEFAULT 'backend',
    icon_class VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Sample technologies (add more as needed)
INSERT IGNORE INTO technologies (name, category, icon_class) VALUES
('Java',          'language',  'fab fa-java'),
('Spring Boot',   'backend',   'fas fa-leaf'),
('MySQL',         'database',  'fas fa-database'),
('JavaScript',    'language',  'fab fa-js-square'),
('React',         'frontend',  'fab fa-react'),
('Node.js',       'backend',   'fab fa-node-js'),
('HTML',          'frontend',  'fab fa-html5'),
('CSS',           'frontend',  'fab fa-css3-alt'),
('Python',        'language',  'fab fa-python'),
('Docker',        'backend',   'fab fa-docker'),
('Git',           'backend',   'fab fa-git-alt'),
('GitHub',        'backend',   'fab fa-github'),
('PostgreSQL',    'database',  'fas fa-database'),
('MongoDB',       'database',  'fas fa-leaf'),
('Redis',         'database',  'fas fa-database'),
('Linux',         'backend',   'fab fa-linux'),
('AWS',           'backend',   'fab fa-aws'),
('TypeScript',    'language',  'fab fa-js-square');

-- 2. portfolio_visitors table (visitor analytics)
CREATE TABLE IF NOT EXISTS portfolio_visitors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ip_address VARCHAR(45),
    browser VARCHAR(100),
    os VARCHAR(100),
    screen_size VARCHAR(20),
    page VARCHAR(255) DEFAULT '/',
    time_spent_seconds INT DEFAULT 0,
    visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Add missing columns to existing tables (safe — uses IF NOT EXISTS logic via ALTER IGNORE)
-- Add technologies column to projects if not present
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS technologies TEXT,
    ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add file_path / credential_url aliases used by server
ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS file_path VARCHAR(255),
    ADD COLUMN IF NOT EXISTS verify_url VARCHAR(255),
    ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Add icon_class column to skills (used by React admin)
ALTER TABLE skills
    ADD COLUMN IF NOT EXISTS icon_class VARCHAR(150);

-- Copy icon -> icon_class if icon exists
UPDATE skills SET icon_class = icon WHERE icon_class IS NULL AND icon IS NOT NULL;

-- ============================================
-- DONE! Restart node server.js after this.
-- ============================================
