const ethers = require('ethers');
const AgentRegistrationABI = require('../abis/AgentRegistration.json');
const TaskManagementABI = require('../abis/TaskManagement.json');

class EnvironmentManager {
    constructor(provider, agentRegistrationAddress, taskManagementAddress) {
        this.provider = provider;
        this.agentRegistrationContract = new ethers.Contract(agentRegistrationAddress, AgentRegistrationABI, provider);
        this.taskManagementContract = new ethers.Contract(taskManagementAddress, TaskManagementABI, provider);
        this.agents = new Map();
        this.tasks = new Map();
    }

    async initialize() {
        await this.loadAgents();
        await this.loadTasks();
    }

    async loadAgents() {
        const agentCount = await this.agentRegistrationContract.getAgentCount();
        for (let i = 0; i < agentCount; i++) {
            const agentAddress = await this.agentRegistrationContract.agentList(i);
            const agentDetails = await this.agentRegistrationContract.getAgentDetails(agentAddress);
            this.agents.set(agentAddress, agentDetails);
        }
    }

    async loadTasks() {
        const taskCount = await this.taskManagementContract.getTasksCount();
        for (let i = 0; i < taskCount; i++) {
            const taskDetails = await this.taskManagementContract.getTaskDetails(i);
            this.tasks.set(i, taskDetails);
        }
    }

    async addAgent(agent) {
        this.agents.set(agent.wallet.address, {
            agentType: agent.agentType,
            agentAddress: agent.wallet.address,
            reputation: 100,
            isActive: true
        });
    }

    async createTask(description, requiredSkills, complexity, reward) {
        const managerAgent = Array.from(this.agents.values()).find(a => a.agentType === "ManagerAgent");
        if (!managerAgent) {
            throw new Error("No ManagerAgent available");
        }
        const taskId = await this.taskManagementContract.createTask(description, requiredSkills, complexity, reward);
        const taskDetails = await this.taskManagementContract.getTaskDetails(taskId);
        this.tasks.set(taskId, taskDetails);
        return taskId;
    }

    async assignTask(taskId, agentAddress) {
        const task = this.tasks.get(taskId);
        const agent = this.agents.get(agentAddress);
        if (!task || !agent) {
            throw new Error("Invalid task or agent");
        }
        await this.taskManagementContract.assignTask(taskId, agentAddress);
        task.assignedTo = agentAddress;
        task.status = 1; // Assigned
    }

    async updateTaskStatus(taskId, newStatus) {
        const task = this.tasks.get(taskId);
        if (!task) {
            throw new Error("Invalid task");
        }
        await this.taskManagementContract.updateTaskStatus(taskId, newStatus);
        task.status = newStatus;
    }

    getAgentByType(agentType) {
        return Array.from(this.agents.values()).find(a => a.agentType === agentType);
    }

    getAllAgents() {
        return Array.from(this.agents.values());
    }

    getAllTasks() {
        return Array.from(this.tasks.values());
    }

    getTasksByStatus(status) {
        return Array.from(this.tasks.values()).filter(t => t.status === status);
    }

    async getProjectStatus() {
        const totalTasks = this.tasks.size;
        const completedTasks = this.getTasksByStatus(3).length; // Completed status
        const inProgressTasks = this.getTasksByStatus(2).length; // InProgress status

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            pendingTasks: totalTasks - completedTasks - inProgressTasks
        };
    }
}

module.exports = EnvironmentManager;
