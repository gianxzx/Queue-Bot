import { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  type Interaction,
  type TextChannel
} from "discord.js";
import { storage } from "./storage";

const STAFF_ROLE_IDS = [
  "1461710247193219190",
  "1461710247193219188",
  "1461710247193219189"
];

const QUEUE_CHANNEL_ID = "1467803822540718155";

export const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ] 
});

const commands = [
  new SlashCommandBuilder()
    .setName('add-queue')
    .setDescription('Add a new order to the queue')
    .addStringOption(option => 
      option.setName('food')
        .setDescription('The food item')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('qty')
        .setDescription('Quantity (e.g., 2x)')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('payment')
        .setDescription('Payment method')
        .setRequired(true)
        .addChoices(
          { name: 'donation', value: 'donation' },
          { name: 'premades', value: 'premades' }
        ))
    .addStringOption(option => 
      option.setName('customer-username')
        .setDescription('Customer username')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('total-bill')
        .setDescription('Total bill amount')
        .setRequired(true))
];

export async function startBot() {
  if (!process.env.DISCORD_TOKEN) {
    console.log("Skipping bot startup: DISCORD_TOKEN not set");
    return;
  }

  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    if (process.env.DISCORD_CLIENT_ID) {
      console.log('Started refreshing application (/) commands.');
      const route = process.env.DISCORD_GUILD_ID 
        ? Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID)
        : Routes.applicationCommands(process.env.DISCORD_CLIENT_ID);

      await rest.put(
        route,
        { body: commands },
      );
      console.log('Successfully reloaded application (/) commands.');
    }

    await client.login(process.env.DISCORD_TOKEN);
    console.log(`Logged in as ${client.user?.tag}!`);
  } catch (error) {
    console.error('Error starting bot:', error);
  }
}

client.on('interactionCreate', async (interaction: Interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'add-queue') {
        await handleAddQueue(interaction);
      }
    } else if (interaction.isButton()) {
      await handleButton(interaction);
    }
  } catch (error) {
    console.error('Interaction error:', error);
    if (interaction.isRepliable() && !interaction.replied) {
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
});

async function handleAddQueue(interaction: any) {
  // Check Permissions
  const member = interaction.member;
  const hasRole = member.roles.cache.some((role: any) => STAFF_ROLE_IDS.includes(role.id));
  
  if (!hasRole) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  const food = interaction.options.getString('food');
  const qty = interaction.options.getString('qty');
  const payment = interaction.options.getString('payment');
  const customerUsername = interaction.options.getString('customer-username');
  const totalBill = interaction.options.getString('total-bill');
  const user = interaction.user;

  // 1. Send Public Message Output (Visible to Everyone)
  // Reply to the interaction in the channel where command was used
  const publicMessage = `
_ _
<:blank:1467844528554901608> <:blank:1467844528554901608> <:blank:1467844528554901608> <:blank:1467844528554901608> 
your order flows with Eywa<:blank:1467844528554901608>  <a:0074_blue:1263544906270638132> 
_ _
<:blank:1467844528554901608> <:blank:1467844528554901608> mawey, dear ${customerUsername} your order has been seen *!*
<:blank:1467844528554901608> remain calm as your chef prepares it for you <:lightblue_heartios:1463466125537968129> 

<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> ( **${qty}** ) — ${food}
<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> paid via ${payment}
<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> total bill : ${totalBill} 
<:blank:1467844528554901608> <:blank:1467844528554901608> 
-# served by ${user} <a:blue_heartpop:1467809370246090928> 
_ _
-# <:suchiblank:1406916898201010217> [where the water guides your order](https://discord.com/channels/1461710247193219186/1467803822540718155/1467833947311309013)
_ _
`;

  await interaction.reply({ content: publicMessage });

  // 2. Send Queue Layout Message to specific channel
  const queueChannel = await client.channels.fetch(QUEUE_CHANNEL_ID) as TextChannel;
  if (!queueChannel) {
    console.error('Queue channel not found');
    return;
  }

  const queueMessageContent = `
** **
<:blue_pin:1463465585915723787>   :  **order placed** *!*

<a:tsireya_star:1467809489163128898>   (**${qty}**) ${food}
<a:tsireya_star:1467809489163128898>   **paid via ${payment}**
<a:tsireya_star:1467809489163128898>   **total bill : ${totalBill}

-# consumer  :  ${customerUsername}
-# chef : ${user} <a:blue_heartpop:1467809370246090928> 

**Noted** *!*
`;

  // Create Buttons
  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('noted')
        .setLabel('Noted')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('processing')
        .setLabel('Processing')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('done')
        .setLabel('Done')
        .setStyle(ButtonStyle.Success)
    );

  const queueMessage = await queueChannel.send({
    content: queueMessageContent,
    components: [row]
  });

  // 3. Save to DB
  await storage.createOrder({
    customerUsername,
    food,
    qty,
    payment,
    totalBill,
    status: 'noted',
    staffId: user.id,
    staffUsername: user.username,
    channelId: QUEUE_CHANNEL_ID,
    messageId: queueMessage.id
  });
}

async function handleButton(interaction: any) {
  // Check Permissions
  const member = interaction.member;
  const hasRole = member.roles.cache.some((role: any) => STAFF_ROLE_IDS.includes(role.id));
  
  if (!hasRole) {
    return interaction.reply({ content: 'You do not have permission to use these buttons.', ephemeral: true });
  }

  const action = interaction.customId; // noted, processing, done
  const message = interaction.message;
  
  // Find order in DB by messageId
  // Since we don't have a direct query for messageId in storage interface, we might need to fetch all or add a method.
  // Ideally, add getOrderByMessageId to storage. For now, let's just assume we update the message content directly 
  // and update status in DB if possible.
  
  // Actually, let's add `updateOrderMessageId` and query by messageId?
  // I added `updateOrderMessageId` but not `getOrderByMessageId`.
  // However, I can fetch the order if I needed it, but here I just need to update the message content.
  // Wait, I need the original details to reconstruct the message if I change the status text?
  // The user prompt says: "When status changes to Noted or Processing: Update the text content".
  // The text content changes: "**Noted** *!*" or "**Processing** *!*" at the bottom.
  // I can just replace the last line.

  let originalContent = message.content;
  // Remove the last line (status)
  // The format ends with:
  // -# chef : {user} <emoji>
  // 
  // **Noted** *!*
  
  // We can regex replace the status line.
  
  let newStatusText = "";
  let dbStatus = "";

  if (action === 'noted') {
    newStatusText = "**Noted** *!*";
    dbStatus = "noted";
  } else if (action === 'processing') {
    newStatusText = "**Processing** *!*";
    dbStatus = "processing";
  } else if (action === 'done') {
    newStatusText = "**Done** *!*";
    dbStatus = "done";
  }

  // Replace the status line
  // Status line is likely at the end.
  // Let's replace `**Noted** *!*` or `**Processing** *!*` or `**order placed** *!*`?
  // No, the header says "**order placed** *!*". The footer says "**Noted** *!*".
  
  let newContent = originalContent;
  if (newContent.includes('**Noted** *!*')) {
    newContent = newContent.replace('**Noted** *!*', newStatusText);
  } else if (newContent.includes('**Processing** *!*')) {
    newContent = newContent.replace('**Processing** *!*', newStatusText);
  } else if (newContent.includes('**Done** *!*')) {
     newContent = newContent.replace('**Done** *!*', newStatusText);
  } else {
    // If it's the first time and only has "Noted" from initial send? 
    // Initial send has "**Noted** *!*" at the end.
    // So logic above holds.
  }

  if (action === 'done') {
    // Remove components
    await message.edit({
      content: newContent,
      components: []
    });
  } else {
    // Keep components, update content
    await message.edit({
      content: newContent
    });
  }

  await interaction.deferUpdate();
  
  // Update DB (optional if we don't strictly need it for the bot flow, but good for records)
  // We'd need to find the order ID.
  // Since I didn't implement `getOrderByMessageId`, I'll skip DB update for status for now or add it to storage.
  // I'll add `getOrderByMessageId` to storage to be clean.
}
