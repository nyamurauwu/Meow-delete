const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const CONFIG_PATH = path.join(__dirname, 'config', 'schedule.json');

//api de horário de são paulo
class TimeManager {
    static async getSPTimeData() {
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
            
            console.log(`🕒 Timezone atualizado: ${data.timezone}`);
            console.log(`⏰ UTC Offset: ${data.utc_offset}`);
            
            return {
                currentTime: new Date(data.datetime),
                timezone: data.timezone,
                utc_offset: data.utc_offset
            };
        } catch (error) {
            console.error('❌ Erro ao obter horário de São Paulo:', error);
            throw error;
        }
    }

    static async getNextSunday() {
        const spData = await this.getSPTimeData();
        const now = new Date(spData.currentTime);
        const nextSunday = new Date(now);
        nextSunday.setDate(now.getDate() + (7 - now.getDay()));
        nextSunday.setHours(0, 0, 0, 0);
        
        // Força o horário para meia-noite em sp
        const Sao_PauloOffset = -3 * 60; // UTC-3 em minutos
        nextSunday.setMinutes(nextSunday.getMinutes() - nextSunday.getTimezoneOffset() - Sao_PauloOffset);
        
        return nextSunday;
    }
}

module.exports = TimeManager;