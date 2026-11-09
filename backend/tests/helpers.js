const fs = require('fs');
const os = require('os');
const path = require('path');

/** Point the store at a fresh temp folder for each test, so real data is never touched. */
const useTempDataDir = () => {
    let dir;
    beforeEach(() => {
        dir = fs.mkdtempSync(path.join(os.tmpdir(), 'tasks-test-'));
        process.env.DATA_DIR = dir;
    });
    afterEach(() => {
        fs.rmSync(dir, { recursive: true, force: true });
        delete process.env.DATA_DIR;
    });
};

module.exports = { useTempDataDir };
