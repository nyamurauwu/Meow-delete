// Permissões necessárias para o client
const { Client, GatewayIntentBits } = require('discord.js');
const schedule = require('node-schedule');
const { CONFIG, loadConfig, saveConfig } = require('./config');
const TimeManager = require('./timeManager');
const MessageEmbed = require('./embedBuilder');
const MessageHandler = require('./messageHandler');

class MeowBot {
    constructor() {
        this.isDeleting = false; // Adicionar flag de controle
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
        this.setup();
    }

    // Evento que vai executar log no console
    setup() {
        this.client.once('ready', () => this.onReady());
        process.on('unhandledRejection', this.handleError);
    }

    async onReady() {
        console.log(`🤖 Bot conectado como ${this.client.user.tag}`);
        try {
            const channel = await this.client.channels.fetch(CONFIG.channelId);
            const config = loadConfig();
            const messageHandler = new MessageHandler(channel, config);

            // Obtém dados do timezone de SP
            const spTimeData = await TimeManager.getSPTimeData();
            console.log(`🕒 Timezone configurado: ${spTimeData.timezone}`);

            const nextRunDate = await TimeManager.getNextSunday();
            await this.updateEmbed(channel, nextRunDate, 'scheduled');

            // Agenda usando timezone específico de SP
            schedule.scheduleJob({ 
                dayOfWeek: 0, 
                hour: 0, 
                minute: 0, 
                tz: 'America/Sao_Paulo' 
            }, async () => {
                console.log('⏰ Iniciando tarefa agendada');
                await this.executeTask(channel, messageHandler);
            });
            
        } catch (error) {
            this.handleError(error);
        }
    }

    async executeTask(channel, messageHandler) {
        const config = loadConfig();
        try {
            const spData = await TimeManager.getSPTimeData();
            await this.updateEmbed(channel, spData.currentTime, 'deleting');
        
            const deletedCount = await this.deleteAllMessages(channel);
            const nextRun = await TimeManager.getNextSunday();
        
            config.deletedCount = deletedCount;
            await saveConfig(config);
        
            await this.updateEmbed(channel, nextRun, 'completed', deletedCount);
            console.log(`✅ Tarefa concluída! ${deletedCount} mensagens deletadas`);
        
            schedule.scheduleJob({
                dayOfWeek: 0,
                hour: 0,
                minute: 0,
                tz: 'America/Sao_Paulo'
            }, () => this.executeTask(channel, messageHandler));
        
        } catch (error) {

            console.error('❌ Erro na execução da tarefa:', error);
            const retryIn = new Date(Date.now() + 3600000);
            schedule.scheduleJob(retryIn, () => this.executeTask(channel, messageHandler));
        }

    }
 //tratamentos de erros
    async updateEmbed(channel, nextRunDate, status, deletedCount = 0) {
        const embed = MessageEmbed.create(nextRunDate, status, deletedCount);
        const config = loadConfig();
        
        try {
            if (config.embedMessageId) {
                try {
                    const message = await channel.messages.fetch(config.embedMessageId);
                    await message.edit({ embeds: [embed] });
                    console.log(`✅ Embed atualizado com sucesso! Status: ${status}`);
                } catch (error) {
                    if (error.code === 10008) {
                        const message = await channel.send({ embeds: [embed] });
                        config.embedMessageId = message.id;
                        saveConfig(config);
                        console.log(`🔄 Nova mensagem embed criada! ID: ${message.id}`);
                    }
                }
            } else {
                const message = await channel.send({ embeds: [embed] });
                config.embedMessageId = message.id;
                saveConfig(config);
                console.log(`📝 Primeira mensagem embed criada! ID: ${message.id}`);
            }
        } catch (error) {
            console.error('❌ Erro ao atualizar embed:', error);
            this.handleError(error);
        }
    }
    

    // Tratamento de erros não capturados
    handleError(error) {
        console.error('❌ Erro:', error);
    }

    start() {
        this.client.login(CONFIG.token);
    }

    async deleteAllMessages(channel) {
        if (this.isDeleting) {
            console.log('⚠️ Processo de remoção já em andamento');
            return 0;
        }

        const config = loadConfig();
        this.isDeleting = true;
        let deletedCount = 0;

        try {
            await this.updateEmbed(channel, null, 'deleting');

            while (true) {
                const messages = await channel.messages.fetch({ limit: 100 });
                const messagesToDelete = messages.filter((msg) =>
                    ![config.embedMessageId, ...config.additionalExemptIds].includes(msg.id)
                );

                if (messagesToDelete.size === 0) break;

                await channel.bulkDelete(messagesToDelete, true);
                deletedCount += messagesToDelete.size;

                await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            console.log(`✅ Processo finalizado - Deletadas: ${deletedCount} mensagens`);
            return deletedCount;
        } catch (error) {
            console.error('❌ Erro ao deletar mensagens:', error);
            throw error;
        } finally {
            this.isDeleting = false;
        }
    }
}
module.exports = MeowBot;
