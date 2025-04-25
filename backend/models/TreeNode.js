class TreeNode {
    constructor(type, data = null) {
        this.type = type;  // 'root', 'students', 'teachers', 'student', 'teacher', 'semester', 'mentees', 'cls_students'
        this.data = data;  // Can store user data or other relevant information
        this.children = new Map();  // Using Map to store named children
        this.circularQueue = null;  // For storing OD requests
    }

    // Initialize a circular queue with fixed size
    initCircularQueue(size = 8) {
        this.circularQueue = {
            items: new Array(size).fill(null),
            front: -1,
            rear: -1,
            size: size
        };
    }

    // Add an OD request to the circular queue
    enqueueODRequest(odRequest) {
        if (!this.circularQueue) {
            this.initCircularQueue();
        }

        const queue = this.circularQueue;
        if ((queue.rear + 1) % queue.size === queue.front) {
            // Queue is full, remove oldest request
            queue.front = (queue.front + 1) % queue.size;
        }

        if (queue.front === -1) {
            queue.front = 0;
        }
        queue.rear = (queue.rear + 1) % queue.size;
        queue.items[queue.rear] = odRequest;

        return true;
    }

    // Get all OD requests from the circular queue
    getODRequests() {
        if (!this.circularQueue || this.circularQueue.front === -1) {
            return [];
        }

        const requests = [];
        let current = this.circularQueue.front;
        while (current !== this.circularQueue.rear) {
            if (this.circularQueue.items[current]) {
                requests.push(this.circularQueue.items[current]);
            }
            current = (current + 1) % this.circularQueue.size;
        }
        if (this.circularQueue.items[current]) {
            requests.push(this.circularQueue.items[current]);
        }

        return requests;
    }

    // Add a child node
    addChild(key, node) {
        this.children.set(key, node);
    }

    // Get a child node
    getChild(key) {
        return this.children.get(key);
    }

    // Remove a child node
    removeChild(key) {
        return this.children.delete(key);
    }

    // Get all children
    getAllChildren() {
        return Array.from(this.children.values());
    }

    // Get all child keys
    getAllChildKeys() {
        return Array.from(this.children.keys());
    }
}

module.exports = TreeNode;