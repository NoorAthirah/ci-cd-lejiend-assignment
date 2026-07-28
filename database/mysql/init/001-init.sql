CREATE TABLE IF NOT EXISTS deployment_checks (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO deployment_checks (message)
VALUES ('MySQL database initialized successfully');
