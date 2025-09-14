-- SkillSwap Database Schema
-- Simple SQL database for assignment requirements

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    location TEXT,
    bio TEXT,
    points INTEGER DEFAULT 100,
    skills_offered TEXT, -- JSON string
    skills_wanted TEXT,  -- JSON string
    rating_average REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Exchanges table
CREATE TABLE IF NOT EXISTS exchanges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    requester_id INTEGER NOT NULL,
    provider_id INTEGER NOT NULL,
    skill TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (requester_id) REFERENCES users(id),
    FOREIGN KEY (provider_id) REFERENCES users(id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    exchange_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (exchange_id) REFERENCES exchanges(id),
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

-- Insert sample data
INSERT OR IGNORE INTO users (id, name, email, password, location, bio, points, skills_offered, skills_wanted) VALUES
(1, 'John Doe', 'john@example.com', 'password123', 'New York', 'Web developer', 150, '["JavaScript", "React"]', '["Python", "AI"]'),
(2, 'Jane Smith', 'jane@example.com', 'password123', 'California', 'Data scientist', 200, '["Python", "Machine Learning"]', '["JavaScript", "Web Design"]'),
(3, 'Bob Johnson', 'bob@example.com', 'password123', 'Texas', 'Designer', 75, '["UI/UX", "Figma"]', '["React", "CSS"]');

INSERT OR IGNORE INTO exchanges (id, requester_id, provider_id, skill, description, status) VALUES
(1, 1, 2, 'Python', 'Want to learn Python for data analysis', 'Accepted'),
(2, 3, 1, 'React', 'Need help with React components', 'Pending');

INSERT OR IGNORE INTO messages (exchange_id, sender_id, message) VALUES
(1, 1, 'Hi! Thanks for accepting my Python learning request.'),
(1, 2, 'Great! Lets start with the basics. When are you available?'),
(1, 1, 'I am free this weekend. Looking forward to it!');
