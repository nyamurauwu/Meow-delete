// Função principal de remoção de mensagens
class MessageHandler {
    constructor(channel, config) {
        this.channel = channel;
        this.config = config;
        this.isDeleting = false;
    }

    async deleteMessages() {
        if (this.isDeleting) {
            console.log('⚠️ Processo de remoção já em andamento');
            return 0;
        }

        this.isDeleting = true;
        let deletedCount = 0;

        try {
            while (true) {
                const messages = await this.channel.messages.fetch({ limit: 100 });
                const messagesToDelete = messages.filter(msg => 
                    ![this.config.embedMessageId, ...this.config.additionalExemptIds].includes(msg.id)
                );

                if (messagesToDelete.size === 0) break;

                await this.channel.bulkDelete(messagesToDelete, true);
                deletedCount += messagesToDelete.size;
                await new Promise(resolve => setTimeout(resolve, 1500));
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

module.exports = MessageHandler;
