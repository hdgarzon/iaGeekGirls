const fs = require("fs");
const path = require("path");

const resourcesPath = path.resolve(__dirname, "../data/learningResources.json");

function loadResources() {
  try {
    const buffer = fs.readFileSync(resourcesPath, "utf-8");
    return JSON.parse(buffer);
  } catch (error) {
    console.error("Error loading resources:", error);
    return { careerResources: {}, generalResources: {} };
  }
}

function getCareerResources(careerId) {
  const resources = loadResources();
  return resources.careerResources[careerId] || null;
}

function getAllCareerResources() {
  const resources = loadResources();
  return resources.careerResources;
}

function getGeneralResources() {
  const resources = loadResources();
  return resources.generalResources;
}

function getEducationalResources(careerId) {
  const careerResources = getCareerResources(careerId);
  return careerResources?.educationalResources || [];
}

function getSalaryData(careerId) {
  const careerResources = getCareerResources(careerId);
  return careerResources?.salaryData || null;
}

function getMarketData(careerId) {
  const careerResources = getCareerResources(careerId);
  return careerResources?.marketData || null;
}

function updateResourceData(careerId, section, data) {
  try {
    const resources = loadResources();

    if (!resources.careerResources[careerId]) {
      resources.careerResources[careerId] = {};
    }

    resources.careerResources[careerId][section] = {
      ...resources.careerResources[careerId][section],
      ...data,
      lastUpdated: new Date().toISOString()
    };

    fs.writeFileSync(resourcesPath, JSON.stringify(resources, null, 2));
    return true;
  } catch (error) {
    console.error("Error updating resources:", error);
    return false;
  }
}

module.exports = {
  getCareerResources,
  getAllCareerResources,
  getGeneralResources,
  getEducationalResources,
  getSalaryData,
  getMarketData,
  updateResourceData,
  loadResources
};