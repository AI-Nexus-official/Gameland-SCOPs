const ethers = require('ethers');
const EnvironmentManager = require('./EnvironmentManager');
const KnowledgeManager = require('./KnowledgeManager');
const GameDevelopmentSandbox = require('./GameDevelopmentSandbox');
const { ManagerAgent, DesignAgent, DevAgent, TestAgent, MarketAgent, ArtistAgent } = require('./agents');

require('dotenv').config();

class GameDevelopmentSimulation {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
        this.environmentManager = new EnvironmentManager(
            this.provider,
            process.env.AGENT_REGISTRATION_ADDRESS,
            process.env.TASK_MANAGEMENT_ADDRESS
        );
        this.knowledgeManager = new KnowledgeManager(process.env.MONGODB_URI);
        this.sandbox = new GameDevelopmentSandbox();
        this.agents = {};
    }

    async initialize() {
        await this.environmentManager.initialize();
        await this.knowledgeManager.connect();

        // Initialize agents
        this.agents.manager = new ManagerAgent(process.env.MANAGER_PRIVATE_KEY, process.env.AGENT_REGISTRATION_ADDRESS, process.env.TASK_MANAGEMENT_ADDRESS, this.provider);
        this.agents.designer = new DesignAgent(process.env.DESIGNER_PRIVATE_KEY, process.env.AGENT_REGISTRATION_ADDRESS, process.env.TASK_MANAGEMENT_ADDRESS, this.provider);
        this.agents.developer = new DevAgent(process.env.DEVELOPER_PRIVATE_KEY, process.env.AGENT_REGISTRATION_ADDRESS, process.env.TASK_MANAGEMENT_ADDRESS, this.provider);
        this.agents.tester = new TestAgent(process.env.TESTER_PRIVATE_KEY, process.env.AGENT_REGISTRATION_ADDRESS, process.env.TASK_MANAGEMENT_ADDRESS, this.provider);
        this.agents.marketer = new MarketAgent(process.env.MARKETER_PRIVATE_KEY, process.env.AGENT_REGISTRATION_ADDRESS, process.env.TASK_MANAGEMENT_ADDRESS, this.provider);
        this.agents.artist = new ArtistAgent(process.env.ARTIST_PRIVATE_KEY, process.env.AGENT_REGISTRATION_ADDRESS, process.env.TASK_MANAGEMENT_ADDRESS, this.provider);

        // Register agents
        for (const agent of Object.values(this.agents)) {
            await agent.register();
            await this.environmentManager.addAgent(agent);
        }
    }

    async runSimulation() {
        console.log("Starting game development simulation...");

        // Step 1: Create a new game project
        const projectDescription = "Develop a mobile RPG game with blockchain integration";
        const taskId = await this.environmentManager.createTask(projectDescription, ["game design", "mobile development", "blockchain"], 8, ethers.utils.parseEther("100"));
        console.log(`New game project created with task ID: ${taskId}`);

        // Step 2: Design phase
        await this.environmentManager.assignTask(taskId, this.agents.designer.wallet.address);
        const gameDesign = await this.agents.designer.performTask(taskId);
        await this.knowledgeManager.addKnowledge('designs', gameDesign);
        console.log("Game design completed:", gameDesign);

        // Step 3: Art creation
        await this.environmentManager.assignTask(taskId, this.agents.artist.wallet.address);
        const gameArt = await this.agents.artist.performTask(taskId);
        await this.knowledgeManager.addKnowledge('art_assets', gameArt);
        console.log("Game art created:", gameArt);

        // Step 4: Development phase
        await this.environmentManager.assignTask(taskId, this.agents.developer.wallet.address);
        const gameId = this.sandbox.createGameInstance(taskId, gameDesign);
        const developmentResult = await this.agents.developer.performTask(taskId);
        this.sandbox.updateCodebase(gameId, developmentResult.code, 'main');
        console.log("Game development completed:", developmentResult);

        // Step 5: Testing phase
        await this.environmentManager.assignTask(taskId, this.agents.tester.wallet.address);
        const testResults = await this.agents.tester.performTask(taskId);
        this.sandbox.runTests(gameId);
        console.log("Game testing completed:", testResults);

        // Step 6: Market analysis
        await this.environmentManager.assignTask(taskId, this.agents.marketer.wallet.address);
        const marketAnalysis = await this.agents.marketer.performTask(taskId);
        await this.knowledgeManager.addKnowledge('market_analysis', marketAnalysis);
        console.log("Market analysis completed:", marketAnalysis);

        // Step 7: Final optimization and simulation
        const optimizationResult = this.sandbox.optimizeGame(gameId);
        const simulationResult = this.sandbox.runSimulation(gameId, { players: 1000, duration: '7d' });
        console.log("Game optimized and simulated:", { optimization: optimizationResult, simulation: simulationResult });

        // Step 8: Project completion
        await this.environmentManager.updateTaskStatus(taskId, 3); // Completed
        const projectStatus = await this.environmentManager.getProjectStatus();
        console.log("Project completed. Final status:", projectStatus);

        // Step 9: Knowledge analysis
        const trends = await this.knowledgeManager.analyzeProjectTrends();
        console.log("Project trends analysis:", trends);

        console.log("Game development simulation completed successfully!");
    }

    async cleanup() {
        await this.knowledgeManager.disconnect();
        console.log("Simulation resources cleaned up.");
    }
}

async function runFullSimulation() {
    const simulation = new GameDevelopmentSimulation();
    try {
        await simulation.initialize();
        await simulation.runSimulation();
    } catch (error) {
        console.error("Simulation failed:", error);
    } finally {
        await simulation.cleanup();
    }
}

runFullSimulation().then(() => process.exit(0));
