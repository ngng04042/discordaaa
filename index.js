require('dotenv').config();
 const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
 require('dotenv').config();
 
 const client = new Client({
   intents: [
     GatewayIntentBits.Guilds,
     GatewayIntentBits.GuildMessages,
     GatewayIntentBits.MessageContent,
     GatewayIntentBits.DirectMessages
   ],
   partials: [Partials.Channel]
 });
 
 client.once('ready', () => {
   console.log(`Zalogowano jako ${client.user.tag}`);
 });
 
 for (let i = 0; i < questions.length; i++) {
  await dmChannel.send(questions[i]);

  const collected = await dmChannel.awaitMessages({
    max: 1,
    time: 60000,
    errors: ['time'],
    filter: m => m.author.id === interaction.user.id
  }).catch(() => null);

  if (!collected) {
    return dmChannel.send('Czas minął. Spróbuj ponownie klikając przycisk jeszcze raz.');
  }

  const answer = collected.first().content;
  answers.push(answer);

  // Tworzenie i wysyłanie logu po każdej odpowiedzi
  const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'logi-formularzy');

  if (logChannel && logChannel.isTextBased()) {
    const { EmbedBuilder } = require('discord.js');

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('Nowa odpowiedź z formularza')
      .addFields(
        { name: 'Użytkownik', value: `${interaction.user.tag} (${interaction.user.id})` },
        { name: 'Pytanie', value: questions[i], inline: false },
        { name: 'Odpowiedź', value: answer, inline: false },
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });
  }
}

 
 client.login(process.env.TOKEN);