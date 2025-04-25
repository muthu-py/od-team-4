const Tree = require('./Tree');
const mongoose = require('mongoose');

class TreeDataManager {
    constructor() {
        this.tree = new Tree();
        this.initialized = false;
    }

    // Initialize the tree data structure with MongoDB data
    async initialize(User, ODApplication) {
        if (this.initialized) return;

        try {
            await this.tree.initializeFromMongoDB(User, ODApplication);
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing TreeDataManager:', error);
            throw error;
        }
    }

    // Get student's OD requests for a specific semester
    getStudentODRequests(studentId, semester) {
        if (!this.initialized) {
            throw new Error('TreeDataManager not initialized');
        }
        return this.tree.getStudentODRequests(studentId, semester);
    }

    // Get all OD requests for a mentor's mentees
    getMenteeODRequests(teacherId) {
        if (!this.initialized) {
            throw new Error('TreeDataManager not initialized');
        }
        return this.tree.getMenteeODRequests(teacherId);
    }

    // Get all OD requests for a class advisor's students
    getClassStudentODRequests(teacherId) {
        if (!this.initialized) {
            throw new Error('TreeDataManager not initialized');
        }
        return this.tree.getClassStudentODRequests(teacherId);
    }

    // Add new OD request
    async addODRequest(odRequest, ODApplication) {
        if (!this.initialized) {
            throw new Error('TreeDataManager not initialized');
        }
        return await this.tree.addODRequest(odRequest, ODApplication);
    }

    // Update OD request status
    async updateODRequestStatus(requestId, status, ODApplication) {
        if (!this.initialized) {
            throw new Error('TreeDataManager not initialized');
        }

        try {
            // Update in MongoDB
            const updatedRequest = await ODApplication.findByIdAndUpdate(
                requestId,
                { status },
                { new: true }
            );

            if (!updatedRequest) {
                throw new Error('OD request not found');
            }

            // The tree structure automatically maintains the latest 8 requests
            // No need to explicitly update the tree as it will be reflected in subsequent queries

            return updatedRequest;
        } catch (error) {
            console.error('Error updating OD request status:', error);
            throw error;
        }
    }

    // Get instance (Singleton pattern)
    static getInstance() {
        if (!TreeDataManager.instance) {
            TreeDataManager.instance = new TreeDataManager();
        }
        return TreeDataManager.instance;
    }
}

module.exports = TreeDataManager;