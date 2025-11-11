const profiles = new Map();
let counter = 1;

function saveProfile(payload) {
  const id = `profile-${counter++}`;
  const record = {
    id,
    createdAt: new Date().toISOString(),
    ...payload
  };

  profiles.set(id, record);
  return record;
}

function updateProfile(id, payload) {
  if (!profiles.has(id)) {
    return null;
  }

  const record = {
    ...profiles.get(id),
    ...payload,
    updatedAt: new Date().toISOString()
  };
  profiles.set(id, record);
  return record;
}

function getProfile(id) {
  return profiles.get(id) || null;
}

function listProfiles() {
  return Array.from(profiles.values());
}

module.exports = {
  saveProfile,
  updateProfile,
  getProfile,
  listProfiles
};

