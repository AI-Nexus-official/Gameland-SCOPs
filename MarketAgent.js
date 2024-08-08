const BaseAgent = require('./BaseAgent');

class MarketAgent extends BaseAgent {
    constructor(privateKey, agentRegistrationAddress, taskManagementAddress, provider) {
        super(privateKey, agentRegistrationAddress, taskManagementAddress, provider);
        this.agentType = "MarketAgent";
        this.skills = ["market analysis", "trend forecasting", "user acquisition", "monetization strategy"];
    }

    async analyzeMarket(taskId, gameDesign) {
        console.log(`Analyzing market for game in task ${taskId}`);
        // Simulating market analysis process
        await new Promise(resolve => setTimeout(resolve, 7000));

        const marketAnalysis = {
            targetAudience: this.determineTargetAudience(gameDesign),
            marketSize: this.estimateMarketSize(),
            competitorAnalysis: this.analyzeCompetitors(gameDesign),
            revenueProjection: this.projectRevenue(),
            marketingRecommendations: this.generateMarketingRecommendations(gameDesign),
            monetizationStrategy: this.suggestMonetizationStrategy(gameDesign)
        };

        console.log(`Market analysis completed for task ${taskId}:`, marketAnalysis);
        return marketAnalysis;
    }

    determineTargetAudience(gameDesign) {
        const ageGroups = ["Kids (6-12)", "Teenagers (13-17)", "Young Adults (18-24)", "Adults (25-40)", "Mature Adults (40+)"];
        const platforms = ["Mobile", "PC", "Console", "Cross-platform"];
        return {
            primaryAgeGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
            secondaryAgeGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
            preferredPlatform: platforms[Math.floor(Math.random() * platforms.length)],
            interests: [gameDesign.genre, gameDesign.theme, gameDesign.mainMechanic]
        };
    }

    estimateMarketSize() {
        return {
            potentialPlayers: Math.floor(Math.random() * 10000000) + 1000000, // 1M - 11M
            estimatedMarketValue: `$${(Math.random() * 1000 + 100).toFixed(2)} million`
        };
    }

    analyzeCompetitors(gameDesign) {
        const competitors = [
            "AAA Studio Game",
            "Popular Indie Title",
            "Rising Mobile Game",
            "Established Franchise Entry"
        ];
        return competitors.map(competitor => ({
            name: competitor,
            similarityScore: Math.floor(Math.random() * 100),
            strengths: [this.getRandomStrength(), this.getRandomStrength()],
            weaknesses: [this.getRandomWeakness(), this.getRandomWeakness()]
        }));
    }

    getRandomStrength() {
        const strengths = ["Strong brand recognition", "Large player base", "Innovative features", "High production value", "Effective monetization"];
        return strengths[Math.floor(Math.random() * strengths.length)];
    }

    getRandomWeakness() {
        const weaknesses = ["Aging graphics", "Repetitive gameplay", "Limited content updates", "Poor user acquisition", "Negative user reviews"];
        return weaknesses[Math.floor(Math.random() * weaknesses.length)];
    }

    projectRevenue() {
        const firstYearRevenue = Math.floor(Math.random() * 10000000) + 1000000; // $1M - $11M
        return {
            firstYear: `$${(firstYearRevenue / 1000000).toFixed(2)} million`,
            secondYear: `$${((firstYearRevenue * (1 + Math.random())) / 1000000).toFixed(2)} million`,
            thirdYear: `$${((firstYearRevenue * (1 + Math.random() * 2)) / 1000000).toFixed(2)} million`
        };
    }

    generateMarketingRecommendations(gameDesign) {
        const recommendations = [
            `Focus on ${gameDesign.genre} game communities`,
            `Highlight the unique ${gameDesign.mainMechanic} in promotional materials`,
            "Leverage influencer partnerships for user acquisition",
            "Implement a robust social media strategy",
            `Emphasize the ${gameDesign.artStyle} art style in visual promotions`,
            "Consider early access or beta testing programs"
        ];
        return recommendations.sort(() => 0.5 - Math.random()).slice(0, 4); // Return 4 random recommendations
    }

    suggestMonetizationStrategy(gameDesign) {
        const strategies = [
            "Free-to-play with in-app purchases",
            "Premium pricing model",
            "Subscription-based access",
            "Ad-supported free version with premium upgrade",
            "Season pass model",
            "Microtransactions for cosmetic items"
        ];
        return {
            primaryStrategy: strategies[Math.floor(Math.random() * strategies.length)],
            alternativeStrategy: strategies[Math.floor(Math.random() * strategies.length)],
            estimatedAverageRevenuePerUser: `$${(Math.random() * 20 + 1).toFixed(2)}`
        };
    }

    async performTask(taskId) {
        await super.performTask(taskId);
        const taskDetails = await this.getTaskDetails(taskId);
        // Assume the game design is stored in the task description (in a real scenario, you'd use a more robust method)
        const gameDesign = JSON.parse(taskDetails.description);
        const marketAnalysis = await this.analyzeMarket(taskId, gameDesign);
        await this.reportTaskProgress(taskId, 100);
        await this.updateTaskStatus(taskId, 3); // Completed
        return marketAnalysis;
    }
}

module.exports = MarketAgent;
