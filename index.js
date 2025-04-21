require('dotenv').config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

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

// Obsługa przycisku
client.on('interactionCreate', async interaction => {
  if (interaction.isButton() && interaction.customId === 'start_form') {
    const modal = new ModalBuilder()
      .setCustomId('user_form_modal')
      .setTitle('Formularz użytkownika');

    const nameInput = new TextInputBuilder()
      .setCustomId('user_name')
      .setLabel('Jak masz na imię?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const ageInput = new TextInputBuilder()
      .setCustomId('user_age')
      .setLabel('Ile masz lat?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const colorInput = new TextInputBuilder()
      .setCustomId('user_color')
      .setLabel('Jaki jest Twój ulubiony kolor?')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const firstRow = new ActionRowBuilder().addComponents(nameInput);
    const secondRow = new ActionRowBuilder().addComponents(ageInput);
    const thirdRow = new ActionRowBuilder().addComponents(colorInput);

    modal.addComponents(firstRow, secondRow, thirdRow);

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === 'user_form_modal') {
    const name = interaction.fields.getTextInputValue('user_name');
    const age = interaction.fields.getTextInputValue('user_age');
    const color = interaction.fields.getTextInputValue('user_color');

    // Prosta walidacja wieku
    if (isNaN(age) || parseInt(age) <= 0) {
      return interaction.reply({
        content: 'Wiek musi być liczbą większą od zera.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle('Dziękujemy za odpowiedzi!')
      .setDescription(`Oto Twoje odpowiedzi:\n1. Imię: ${name}\n2. Wiek: ${age}\n3. Kolor: ${color}`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// Komenda !start wysyłająca przycisk
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
