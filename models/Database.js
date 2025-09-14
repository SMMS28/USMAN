const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    // Create database directory if it doesn't exist
    const dbDir = path.join(__dirname, '..', 'database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Initialize SQLite database
    this.dbPath = path.join(dbDir, 'skillswap.db');
    this.db = new sqlite3.Database(this.dbPath);
    
    console.log('📊 SQLite database initialized:', this.dbPath);
    this.initializeTables();
  }

  initializeTables() {
    // Create tables directly instead of reading from file
    const createTablesSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        location TEXT,
        bio TEXT,
        points INTEGER DEFAULT 100,
        skills_offered TEXT DEFAULT '[]',
        skills_wanted TEXT DEFAULT '[]',
        rating_average REAL DEFAULT 0,
        rating_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

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

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exchange_id INTEGER NOT NULL,
        sender_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exchange_id) REFERENCES exchanges(id),
        FOREIGN KEY (sender_id) REFERENCES users(id)
      );
    `;

    this.db.exec(createTablesSQL, (err) => {
      if (err) {
        console.error('❌ Error creating tables:', err);
      } else {
        console.log('✅ Database tables created successfully');
        this.insertSampleData();
      }
    });
  }

  insertSampleData() {
    // Insert sample data
    const sampleDataSQL = `
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
    `;

    this.db.exec(sampleDataSQL, (err) => {
      if (err) {
        console.error('❌ Error inserting sample data:', err);
      } else {
        console.log('✅ Sample data inserted successfully');
      }
    });
  }

  // User methods
  createUser(userData) {
    return new Promise((resolve, reject) => {
      const { name, email, password, location, bio } = userData;
      const sql = `INSERT INTO users (name, email, password, location, bio, skills_offered, skills_wanted) 
                   VALUES (?, ?, ?, ?, ?, '[]', '[]')`;
      
      this.db.run(sql, [name, email, password, location, bio], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            id: this.lastID, 
            name, 
            email, 
            location, 
            bio, 
            points: 100,
            skillsOffered: [],
            skillsWanted: [],
            rating: { average: 0, count: 0 }
          });
        }
      });
    });
  }

  findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE email = ?`;
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            // Parse JSON fields
            row.skillsOffered = JSON.parse(row.skills_offered || '[]');
            row.skillsWanted = JSON.parse(row.skills_wanted || '[]');
            row.rating = { average: row.rating_average || 0, count: row.rating_count || 0 };
            row._id = row.id; // For compatibility
          }
          resolve(row);
        }
      });
    });
  }

  findUserById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE id = ?`;
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            // Parse JSON fields
            row.skillsOffered = JSON.parse(row.skills_offered || '[]');
            row.skillsWanted = JSON.parse(row.skills_wanted || '[]');
            row.rating = { average: row.rating_average || 0, count: row.rating_count || 0 };
            row._id = row.id; // For compatibility
          }
          resolve(row);
        }
      });
    });
  }

  updateUser(id, updateData) {
    return new Promise((resolve, reject) => {
      const { name, location, bio, skillsOffered, skillsWanted } = updateData;
      const sql = `UPDATE users SET 
                   name = COALESCE(?, name),
                   location = COALESCE(?, location),
                   bio = COALESCE(?, bio),
                   skills_offered = COALESCE(?, skills_offered),
                   skills_wanted = COALESCE(?, skills_wanted),
                   updated_at = CURRENT_TIMESTAMP
                   WHERE id = ?`;
      
      const skillsOfferedJson = skillsOffered ? JSON.stringify(skillsOffered) : null;
      const skillsWantedJson = skillsWanted ? JSON.stringify(skillsWanted) : null;
      
      this.db.run(sql, [name, location, bio, skillsOfferedJson, skillsWantedJson, id], (err) => {
        if (err) {
          reject(err);
        } else {
          this.findUserById(id).then(resolve).catch(reject);
        }
      });
    });
  }

  getAllUsers() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users ORDER BY created_at DESC`;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const users = rows.map(row => {
            row.skillsOffered = JSON.parse(row.skills_offered || '[]');
            row.skillsWanted = JSON.parse(row.skills_wanted || '[]');
            row.rating = { average: row.rating_average || 0, count: row.rating_count || 0 };
            row._id = row.id;
            return row;
          });
          resolve(users);
        }
      });
    });
  }

  // Exchange methods
  createExchange(exchangeData) {
    return new Promise((resolve, reject) => {
      const { requester, provider, skill, description } = exchangeData;
      const sql = `INSERT INTO exchanges (requester_id, provider_id, skill, description) 
                   VALUES (?, ?, ?, ?)`;
      
      this.db.run(sql, [requester._id || requester, provider._id || provider, skill, description], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ 
            _id: this.lastID, 
            id: this.lastID,
            requester, 
            provider, 
            skill, 
            description, 
            status: 'Pending',
            messages: []
          });
        }
      });
    });
  }

  findExchangesByUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT e.*, 
               u1.name as requester_name, u1.email as requester_email,
               u2.name as provider_name, u2.email as provider_email
        FROM exchanges e
        JOIN users u1 ON e.requester_id = u1.id
        JOIN users u2 ON e.provider_id = u2.id
        WHERE e.requester_id = ? OR e.provider_id = ?
        ORDER BY e.created_at DESC
      `;
      
      this.db.all(sql, [userId, userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const exchanges = rows.map(row => ({
            _id: row.id,
            id: row.id,
            requester: {
              _id: row.requester_id,
              name: row.requester_name,
              email: row.requester_email
            },
            provider: {
              _id: row.provider_id,
              name: row.provider_name,
              email: row.provider_email
            },
            skill: row.skill,
            description: row.description,
            status: row.status,
            createdAt: row.created_at,
            messages: [] // Will be loaded separately if needed
          }));
          resolve(exchanges);
        }
      });
    });
  }

  // Message methods
  addMessage(exchangeId, senderId, message) {
    return new Promise((resolve, reject) => {
      const sql = `INSERT INTO messages (exchange_id, sender_id, message) VALUES (?, ?, ?)`;
      
      this.db.run(sql, [exchangeId, senderId, message], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            sender: senderId,
            message: message,
            timestamp: new Date()
          });
        }
      });
    });
  }

  getExchangeMessages(exchangeId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT m.*, u.name as sender_name 
                   FROM messages m 
                   JOIN users u ON m.sender_id = u.id 
                   WHERE m.exchange_id = ? 
                   ORDER BY m.created_at ASC`;
      
      this.db.all(sql, [exchangeId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const messages = rows.map(row => ({
            sender: row.sender_id,
            message: row.message,
            timestamp: row.created_at,
            senderName: row.sender_name
          }));
          resolve(messages);
        }
      });
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = new Database();
