// Imports básicos
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const TimeManager = require('./timeManager');

const configDir = path.join(__dirname, 'config');
const CONFIG_PATH = path.join(configDir, 'schedule.json');

// Configurações principais do bot no arquivo .env e schedule.json
const CONFIG = {
    token: process.env.DISCORD_TOKEN,
    channelId: process.env.CHANNEL_ID,
    configPath: CONFIG_PATH,
    defaultConfig: {
        nextRunDate: null,
        deletedCount: 0,
        embedMessageId: null,
        additionalExemptIds: [],
        timezone: null,
        utc_offset: null,
        last_sync: null
    }
};

// Criar diretório e arquivo de configuração inicial
fs.mkdirSync(configDir, { recursive: true });
if (!fs.existsSync(CONFIG_PATH)) {
    const initialConfig = {
        nextRunDate: null,
        deletedCount: 0,
        embedMessageId: null,
        additionalExemptIds: [],
        timezone: null,
        utc_offset: null,
        last_sync: null
    };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(initialConfig, null, 2));
}

// Funções de gerenciamento de config
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function saveConfig(config) {
    const spData = await TimeManager.getSPTimeData();
    const nextRun = await TimeManager.getNextSunday();
    
    config.nextRunDate = nextRun.toISOString();
    config.timezone = spData.timezone;
    config.utc_offset = spData.utc_offset;
    config.last_sync = spData.currentTime.toISOString();
    
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

module.exports = { CONFIG, loadConfig, saveConfig };
