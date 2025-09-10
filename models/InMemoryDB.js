// Simple in-memory database for demo purposes
class InMemoryDB {
  constructor() {
    this.users = [];
    this.exchanges = [];
    this.nextUserId = 1;
    this.nextExchangeId = 1;
  }

  // User methods
  createUser(userData) {
    const user = {
      _id: this.nextUserId++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  findUserById(id) {
    return this.users.find(user => user._id === id);
  }

  findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  updateUser(id, updateData) {
    const userIndex = this.users.findIndex(user => user._id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updateData, updatedAt: new Date() };
      return this.users[userIndex];
    }
    return null;
  }

  findUsers(query = {}) {
    let filteredUsers = [...this.users];
    
    if (query.skill) {
      filteredUsers = filteredUsers.filter(user => 
        user.skillsOffered?.some(skill => 
          skill.skill.toLowerCase().includes(query.skill.toLowerCase())
        )
      );
    }
    
    if (query.location) {
      filteredUsers = filteredUsers.filter(user => 
        user.location?.toLowerCase().includes(query.location.toLowerCase())
      );
    }
    
    if (query.level) {
      filteredUsers = filteredUsers.filter(user => 
        user.skillsOffered?.some(skill => skill.level === query.level)
      );
    }
    
    return filteredUsers.slice(0, query.limit || 20);
  }

  // Exchange methods
  createExchange(exchangeData) {
    const exchange = {
      _id: this.nextExchangeId++,
      ...exchangeData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.exchanges.push(exchange);
    return exchange;
  }

  findExchangesByUser(userId) {
    return this.exchanges.filter(exchange => 
      exchange.requester === userId || exchange.provider === userId
    );
  }

  findExchangeById(id) {
    return this.exchanges.find(exchange => exchange._id === id);
  }

  updateExchange(id, updateData) {
    const exchangeIndex = this.exchanges.findIndex(exchange => exchange._id === id);
    if (exchangeIndex !== -1) {
      this.exchanges[exchangeIndex] = { ...this.exchanges[exchangeIndex], ...updateData, updatedAt: new Date() };
      return this.exchanges[exchangeIndex];
    }
    return null;
  }

  // Skills methods
  getAllSkills() {
    const skills = new Set();
    this.users.forEach(user => {
      user.skillsOffered?.forEach(skill => {
        skills.add(skill.skill);
      });
    });
    return Array.from(skills).sort();
  }

  getSkillMatches(userId) {
    const user = this.findUserById(userId);
    if (!user) return [];

    const userSkillsWanted = user.skillsWanted?.map(s => s.skill) || [];
    const userSkillsOffered = user.skillsOffered?.map(s => s.skill) || [];

    const matches = this.users
      .filter(u => u._id !== userId)
      .map(matchUser => {
        const offeredSkills = matchUser.skillsOffered?.filter(skill => 
          userSkillsWanted.includes(skill.skill)
        ) || [];
        
        const wantedSkills = matchUser.skillsWanted?.filter(skill => 
          userSkillsOffered.includes(skill.skill)
        ) || [];

        const matchScore = offeredSkills.length + wantedSkills.length;

        return {
          user: matchUser,
          offeredSkills,
          wantedSkills,
          matchScore,
          canExchange: wantedSkills.length > 0
        };
      })
      .filter(match => match.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    return matches;
  }
}

// Create singleton instance
const db = new InMemoryDB();

module.exports = db;
