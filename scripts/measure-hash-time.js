const bcrypt = require('bcryptjs');

const COST_FACTORS = [10, 11, 12, 13];
const SAMPLE_PASSWORD = 'sample-password-123';
const REPETITIONS = 5;

const measureAverageMs = async (costFactor) => {
    const start = process.hrtime.bigint();
    for (let repetition = 0; repetition < REPETITIONS; repetition += 1) {
        await bcrypt.hash(SAMPLE_PASSWORD, costFactor);
    }
    const elapsedNs = Number(process.hrtime.bigint() - start);
    return elapsedNs / REPETITIONS / 1e6;
};

const run = async () => {
    for (const costFactor of COST_FACTORS) {
        const averageMs = await measureAverageMs(costFactor);
        console.log(`cost ${costFactor}: ${averageMs.toFixed(0)} ms per hash`);
    }
};

run();
