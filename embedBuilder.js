const { EmbedBuilder } = require('discord.js');

// Modifique os textos e elementos do embed conforme a sua necessidade.
// O exemplo abaixo é apenas um modelo base que você pode alterar à vontade.

class MessageEmbed {
    static create(nextRunDate, status, deletedCount = 0) {
        const embed = new EmbedBuilder()
            // Adicione ou substitua a imagem conforme o contexto do seu bot
            .setImage('https://i.pinimg.com/originals/a7/f1/a7/a7f1a7457882688e2784ad46e82ab9ad.gif')
            // Personalize o rodapé com as informações desejadas
            .setFooter({
                text: `Meow Delete System - Limpeza Automática | Última limpeza: ${deletedCount} mensagens deletadas`
            })
            .setTimestamp();

        // Adicione ou altere os campos do embed conforme a necessidade
        embed.addFields({
            name: '💬 Sua mensagem aqui',
            value: 'Para personalizar, substitua este texto com as instruções ou informações relevantes para o seu caso. Este é apenas um exemplo. 💖'
        });

        // Customize os títulos, descrições e cores de acordo com o status
        switch (status) {
            case 'deleting':
                embed.setTitle('🗑️ Limpeza em Andamento')
                    .setDescription('Personalize esta mensagem para descrever o processo de limpeza atual.')
                    .setColor('#FFA500'); // Substitua pelo código hexadecimal da cor desejada
                break;
            case 'completed':
                embed.setTitle('✅ Limpeza Concluída')
                    .setDescription(`Personalize esta mensagem para exibir detalhes sobre a limpeza concluída.\n\n**Próxima limpeza:**\n${nextRunDate ? nextRunDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Data não definida.'}`)
                    .setColor('#00FF00'); // Substitua pelo código hexadecimal da cor desejada
                break;
            default:
                embed.setTitle('📅 Próxima Limpeza Programada')
                    .setDescription(`Personalize esta mensagem para exibir informações sobre a próxima limpeza agendada.\n\n**Próxima limpeza:**\n${nextRunDate ? nextRunDate.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : 'Data não definida.'}`)
                    .setColor('#00FF00'); // Substitua pelo código hexadecimal da cor desejada
        }

        return embed;
    }
}

module.exports = MessageEmbed;
