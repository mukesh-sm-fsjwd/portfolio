-- ============================================
-- PORTFOLIO DB PATCH — Part 2: Add missing columns
-- Compatible with MySQL 5.7 + (WAMP)
-- Run this in phpMyAdmin > portfolio_db > SQL tab
-- (Ignore "Duplicate column" errors — means column already exists)
-- ============================================

USE portfolio_db;

-- Helper procedure to safely add a column only if it doesn't exist
DROP PROCEDURE IF EXISTS safe_add_column;

DELIMITER $$
CREATE PROCEDURE safe_add_column(
    tbl VARCHAR(64),
    col VARCHAR(64),
    col_def TEXT
)
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME   = tbl
          AND COLUMN_NAME  = col
    ) THEN
        SET @sql = CONCAT('ALTER TABLE `', tbl, '` ADD COLUMN `', col, '` ', col_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END$$
DELIMITER ;

-- projects table
CALL safe_add_column('projects', 'technologies',  'TEXT');
CALL safe_add_column('projects', 'display_order', 'INT DEFAULT 0');
CALL safe_add_column('projects', 'updated_at',    'TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

-- certificates table
CALL safe_add_column('certificates', 'file_path',   'VARCHAR(255)');
CALL safe_add_column('certificates', 'verify_url',  'VARCHAR(255)');
CALL safe_add_column('certificates', 'display_order', 'INT DEFAULT 0');

-- skills table
CALL safe_add_column('skills', 'icon_class', 'VARCHAR(150)');

-- Copy icon → icon_class where needed
UPDATE skills SET icon_class = icon WHERE icon_class IS NULL AND icon IS NOT NULL;

-- Cleanup
DROP PROCEDURE IF EXISTS safe_add_column;

-- ============================================
-- DONE! Restart node server.js after this.
-- ============================================

