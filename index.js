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
 
 client.on('interactionCreate', async interaction => {
   if (!interaction.isButton()) return;
 
   if (interaction.customId === 'start_form') {
     await interaction.reply({ content: 'Zaraz zadam Ci kilka pytań. Odpowiadaj po kolei.', ephemeral: true });
 
     const questions = [
       'Jak masz na imię?',
       'Ile masz lat?',
       'Jaki jest Twój ulubiony kolor?'
     ];
 
     const answers = [];
 
     const dmChannel = await interaction.user.createDM();
 
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
 
       answers.push(collected.first().content);
     }
 
     dmChannel.send(`Dziękuję za odpowiedzi! Oto one:\n1. ${answers[0]}\n2. ${answers[1]}\n3. ${answers[2]}`);
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