require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, EmbedBuilder } = require('discord.js');

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

// Funkcja obsługująca formularz
async function startForm(interaction) {
  await interaction.reply({ content: 'Zaraz zadam Ci kilka pytań. Odpowiadaj po kolei.', ephemeral: true });

  const questions = [
    { question: 'Jak masz na imię?', validate: val => val.length > 0 },  // Prosta walidacja imienia
    { question: 'Ile masz lat?', validate: val => !isNaN(val) && val > 0 },  // Wiek musi być liczbą
    { question: 'Jaki jest Twój ulubiony kolor?', validate: val => val.length > 0 }  // Kolor nie może być pusty
  ];

  const answers = [];
  const dmChannel = await interaction.user.createDM();

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    // Wysyłanie pytania
    await dmChannel.send(question.question);

    // Czekanie na odpowiedź użytkownika
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

    // Walidacja odpowiedzi
    if (!question.validate(answer)) {
      return dmChannel.send('Odpowiedź jest nieprawidłowa. Proszę spróbuj ponownie.');
    }

    answers.push(answer);
  }

  // Wysłanie podsumowania
  const embed = new EmbedBuilder()
    .setColor(0x0099FF)
    .setTitle('Dziękujemy za odpowiedzi!')
    .setDescription(`Oto Twoje odpowiedzi:\n1. Imię: ${answers[0]}\n2. Wiek: ${answers[1]}\n3. Ulubiony kolor: ${answers[2]}`)
    .setTimestamp();

  dmChannel.send({ embeds: [embed] });
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === 'start_form') {
    startForm(interaction);
  }
});

client.on('messageCreate', async message => {
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
