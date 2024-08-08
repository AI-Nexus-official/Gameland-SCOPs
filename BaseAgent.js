const ethers = require('ethers');
const AgentRegistrationABI = require('../abis/AgentRegistration.json');
const TaskManagementABI = require('../abis/TaskManagement.json');

class BaseAgent {
    constructor(privateKey, agentRegistrationAddress, taskManagementAddress, provider) {
        this.wallet = new ethers.Wallet(privateKey, provider);
        this.agentRegistrationContract = new ethers.Contract(agentRegistrationAddress, AgentRegistrationABI, this.wallet);
        this.taskManagementContract = new ethers.Contract(taskManagementAddress, TaskManagementABI, this.wallet);
        this.agentType = "BaseAgent";
        this.skills = [];
    }

    async register() {
        try {
            const tx = await this.agentRegistrationContract.registerAgent(this.agentType);
            await tx.wait();
            console.log(`${this.agentType} registered successfully`);
        } catch (error) {
            console.error(`Error registering ${this.agentType}:`, error);
        }
    }

    async updateTaskStatus(taskId, newStatus) {
        try {
            const tx = await this.taskManagementContract.updateTaskStatus(taskId, newStatus);
            await tx.wait();
            console.log(`Task ${taskId} status updated to ${newStatus}`);
        } catch (error) {
            console.error(`Error updating task status:`, error);
        }
    }

    async getAssignedTasks() {
        try {
            const filter = this.taskManagementContract.filters.TaskAssigned(null, this.wallet.address);
            const events = await this.taskManagementContract.queryFilter(filter);
            return events.map(event => event.args.taskId.toNumber());
        } catch (error) {
            console.error(`Error getting assigned tasks:`, error);
            return [];
        }
    }

    async getTaskDetails(taskId) {
        try {
            return await this.taskManagementContract.getTaskDetails(taskId);
        } catch (error) {
            console.error(`Error getting task details:`, error);
            return null;
        }
    }

    async performTask(taskId) {
        console.log(`${this.agentType} is performing task ${taskId}`);
        // This method should be overridden by subclasses
    }

    async reportTaskProgress(taskId, progress) {
        console.log(`${this.agentType} reports ${progress}% progress on task ${taskId}`);
        // In a real implementation, this could update a separate contract or off-chain database
    }
}

module.exports = BaseAgent;
