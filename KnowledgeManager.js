const { MongoClient } = require('mongodb');

class KnowledgeManager {
    constructor(mongoUri) {
        this.mongoUri = mongoUri;
        this.client = new MongoClient(mongoUri);
        this.db = null;
    }

    async connect() {
        await this.client.connect();
        this.db = this.client.db('gameland_knowledge');
        console.log('Connected to MongoDB');
    }

    async disconnect() {
        await this.client.close();
        console.log('Disconnected from MongoDB');
    }

    async addKnowledge(category, data) {
        const collection = this.db.collection(category);
        const result = await collection.insertOne({ ...data, timestamp: new Date() });
        console.log(`Knowledge added to ${category} with id: ${result.insertedId}`);
        return result.insertedId;
    }

    async getKnowledge(category, query = {}) {
        const collection = this.db.collection(category);
        return await collection.find(query).toArray();
    }

    async updateKnowledge(category, id, data) {
        const collection = this.db.collection(category);
        const result = await collection.updateOne({ _id: id }, { $set: { ...data, lastUpdated: new Date() } });
        console.log(`Knowledge in ${category} updated: ${result.modifiedCount} document(s)`);
        return result.modifiedCount;
    }

    async deleteKnowledge(category, id) {
        const collection = this.db.collection(category);
        const result = await collection.deleteOne({ _id: id });
        console.log(`Knowledge deleted from ${category}: ${result.deletedCount} document(s)`);
        return result.deletedCount;
    }

    async analyzeProjectTrends() {
        const projects = await this.getKnowledge('projects');
        
        const trends = {
            totalProjects: projects.length,
            averageCompletionTime: this.calculateAverageCompletionTime(projects),
            popularGenres: this.identifyPopularGenres(projects),
            commonFeatures: this.identifyCommonFeatures(projects),
            averageTeamSize: this.calculateAverageTeamSize(projects)
        };

        await this.addKnowledge('trends', trends);
        return trends;
    }

    calculateAverageCompletionTime(projects) {
        const completedProjects = projects.filter(p => p.completionTime);
        if (completedProjects.length === 0) return 0;
        const totalTime = completedProjects.reduce((sum, p) => sum + p.completionTime, 0);
        return totalTime / completedProjects.length;
    }

    identifyPopularGenres(projects) {
        const genreCounts = projects.reduce((counts, p) => {
            counts[p.genre] = (counts[p.genre] || 0) + 1;
            return counts;
        }, {});
        return Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([genre, count]) => ({ genre, count }));
    }

    identifyCommonFeatures(projects) {
        const featureCounts = projects.reduce((counts, p) => {
            p.features.forEach(feature => {
                counts[feature] = (counts[feature] || 0) + 1;
            });
            return counts;
        }, {});
        return Object.entries(featureCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([feature, count]) => ({ feature, count }));
    }

    calculateAverageTeamSize(projects) {
        if (projects.length === 0) return 0;
        const totalTeamSize = projects.reduce((sum, p) => sum + (p.teamSize || 0), 0);
        return totalTeamSize / projects.length;
    }
}

module.exports = KnowledgeManager;
