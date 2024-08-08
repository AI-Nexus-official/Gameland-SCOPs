const BaseAgent = require('./BaseAgent');

class TestAgent extends BaseAgent {
    constructor(privateKey, agentRegistrationAddress, taskManagementAddress, provider) {
        super(privateKey, agentRegistrationAddress, taskManagementAddress, provider);
        this.agentType = "TestAgent";
        this.skills = ["quality assurance", "bug detection", "performance testing", "user experience testing"];
    }

    async testGameFeature(taskId, implementedFeature) {
        console.log(`Testing game feature for task ${taskId}`);
        // Simulating testing process
        await new Promise(resolve => setTimeout(resolve, 6000));

        const testResults = {
            featureTested: implementedFeature.featureType,
            functionalityScore: this.generateFunctionalityScore(),
            performanceScore: this.evaluatePerformance(implementedFeature.performanceMetrics),
            bugsFound: this.findBugs(implementedFeature.bugs),
            userExperienceScore: this.generateUserExperienceScore()
        };

        console.log(`Test results for task ${taskId}:`, testResults);
        return testResults;
    }

    generateFunctionalityScore() {
        return Math.floor(Math.random() * 40) + 60; // 60-100 score
    }

    evaluatePerformance(performanceMetrics) {
        const fpsScore = performanceMetrics.fps > 60 ? 100 : (performanceMetrics.fps / 60) * 100;
        const memoryScore = 100 - (parseInt(performanceMetrics.memoryUsage) / 600) * 100;
        const loadTimeScore = 100 - (parseFloat(performanceMetrics.loadTime) / 5) * 100;
        return Math.floor((fpsScore + memoryScore + loadTimeScore) / 3);
    }

    findBugs(existingBugs) {
        // Simulating finding some existing bugs and potentially new ones
        const detectionRate = 0.8; // 80% chance of finding each existing bug
        const foundBugs = existingBugs.filter(() => Math.random() < detectionRate);
        
        const newBugTypes = ["Edge case error", "Localization issue", "Compatibility problem"];
        const newBugCount = Math.floor(Math.random() * 3); // 0-2 new bugs
        for (let i = 0; i < newBugCount; i++) {
            foundBugs.push(newBugTypes[Math.floor(Math.random() * newBugTypes.length)]);
        }

        return foundBugs;
    }

    generateUserExperienceScore() {
        return Math.floor(Math.random() * 40) + 60; // 60-100 score
    }

    async performTask(taskId) {
        await super.performTask(taskId);
        const taskDetails = await this.getTaskDetails(taskId);
        // Assume the implemented feature is stored in the task description (in a real scenario, you'd use a more robust method)
        const implementedFeature = JSON.parse(taskDetails.description);
        const testResults = await this.testGameFeature(taskId, implementedFeature);
        await this.reportTaskProgress(taskId, 100);
        await this.updateTaskStatus(taskId, 3); // Completed
        return testResults;
    }
}

module.exports = TestAgent;
