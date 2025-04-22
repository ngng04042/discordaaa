require('dotenv').config(); 
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

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

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'start_form') {
    await interaction.reply({ content: 'Zaraz zadam Ci kilka pytań. Odpowiadaj po kolei.', ephemeral: true });

    const questions = [
      { question: 'Jak masz na imię?', validate: val => val.length > 0 },
      { question: 'Ile masz lat?', validate: val => !isNaN(val) && val > 0 },
      { question: 'Jaki jest Twój ulubiony kolor?', validate: val => val.length > 0 }
    ];

    const answers = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      const questionMessage = await interaction.channel.send({
        content: question.question
      });

      const collected = await interaction.channel.awaitMessages({
        max: 1,
        time: 60000,
        errors: ['time'],
        filter: m => m.author.id === interaction.user.id
      }).catch(() => null);

      if (!collected) {
        return interaction.channel.send({ content: 'Czas minął. Spróbuj ponownie klikając przycisk jeszcze raz.' });
      }

      const answer = collected.first().content;

      if (!question.validate(answer)) {
        return interaction.channel.send({ content: 'Odpowiedź jest nieprawidłowa. Proszę spróbuj ponownie.' });
      }

      answers.push(answer);
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('Dziękujemy za odpowiedzi!')
      .setDescription(`Oto Twoje odpowiedzi:\n1. Imię: ${answers[0]}\n2. Wiek: ${answers[1]}\n3. Ulubiony kolor: ${answers[2]}`)
      .setTimestamp();

    await interaction.channel.send({ embeds: [embed] });
  }
});

client.on('messageCreate', async message => {
  if (message.author.bot) return; // Zapobiega reakcji na własne wiadomości bota

  if (message.content === '!start') {
    const button = new ButtonBuilder()
      .setCustomId('start_form')
      .setLabel('Wypełnij formularz')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await message.channel.send({
      content: 'Kliknij przycisk, aby wypełnić formularz:',
      components: [row]
    });
  }
});

client.login(process.env.TOKEN);
