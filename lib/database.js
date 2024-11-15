import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('../database.json');

function loadDatabase() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ premiumUsers: [], groupsOnly: [] }, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbPath));
}

function isPremiumUser(username) {
  const db = loadDatabase();
  return db.premiumUsers.includes(username);
}

function isGroupOnly(groupId) {
  const db = loadDatabase();
  return db.groupsOnly.includes(groupId);
}

function addPremiumUser(username) {
  const db = loadDatabase();
  if (!db.premiumUsers.includes(username)) {
    db.premiumUsers.push(username);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
}

function addGroupOnly(groupId) {
  const db = loadDatabase();
  if (!db.groupsOnly.includes(groupId)) {
    db.groupsOnly.push(groupId);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
  }
}

export { isPremiumUser, isGroupOnly, addPremiumUser, addGroupOnly };