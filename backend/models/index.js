const User = require('./User');
const ODApplication = require('./ODApplication');
const TreeDataManager = require('./TreeDataManager');

// Initialize TreeDataManager singleton instance
const treeDataManager = TreeDataManager.getInstance();

// Initialize tree data structure with MongoDB data
async function initializeTreeDataManager() {
    try {
        await treeDataManager.initialize(User, ODApplication);
        console.log('✅ Tree data structure initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing tree data structure:', error);
        throw error;
    }
}

module.exports = {
    User,
    ODApplication,
    treeDataManager,
    initializeTreeDataManager
};