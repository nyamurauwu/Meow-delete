const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config', 'schedule.json');

class TimeManager {
    static async getSPTimeData() {
        while (true) {
            try {
                const response = await fetch('http://worldtimeapi.org/api/timezone/America/Sao_Paulo');
                const data = await response.json();
                
                // Lê a configuração atual
                const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
                
                // Atualiza os campos
                config.timezone = data.timezone;
                config.utc_offset = data.utc_offset;
                config.last_sync = new Date().toISOString();
                
                // Salva as alterações
                fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
                
                console.log(`✅ WorldTimeAPI conectada com sucesso!`);
                console.log(`🕒 Timezone atualizado: ${data.timezone}`);
                console.log(`⏰ UTC Offset: ${data.utc_offset}`);
                
                return {
                    currentTime: new Date(data.datetime),
                    timezone: data.timezone,
                    utc_offset: data.utc_offset
                };
            } catch (error) {
                console.log(`🔴 Erro ao acessar WorldTimeAPI: ${error.message}`);
                console.log('🔄 Nova tentativa em 30 segundos...');
                await new Promise(resolve => setTimeout(resolve, 30000));
            }
        }
    }

    static async getNextSunday() {
        const spData = await this.getSPTimeData();
        const now = new Date(spData.currentTime);
        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + (7 - now.getDay()));
        nextSunday.setHours(0, 0, 0, 0);
        
        // Força o horário para meia-noite em Brasília
        const brasiliaOffset = -3 * 60; // UTC-3 em minutos
        nextSunday.setMinutes(nextSunday.getMinutes() - nextSunday.getTimezoneOffset() - brasiliaOffset);
        
        return nextSunday;
    }
}

module.exports = TimeManager;
