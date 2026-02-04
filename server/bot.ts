import { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  ActionRowBuilder,
  StringSelectMenuBuilder
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

client.on('interactionCreate', async (interaction: any) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === 'add-queue') {
        await handleAddQueue(interaction);
      }
    } else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction);
    }
  } catch (error) {
    console.error('Interaction error:', error);
    if (interaction.isRepliable() && !interaction.replied) {
      await interaction.reply({ content: 'An error occurred.', ephemeral: true });
    }
  }
});

async function handleAddQueue(interaction: any) {
  const member = interaction.member;
  const hasRole = member?.roles?.cache?.some((role: any) => STAFF_ROLE_IDS.includes(role.id));
  
  if (!hasRole) {
    return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
  }

  const food = interaction.options.getString('food');
  const qty = interaction.options.getString('qty');
  const payment = interaction.options.getString('payment');
  const customerUsername = interaction.options.getString('customer-username');
  const totalBill = interaction.options.getString('total-bill');
  const user = interaction.user;

  const publicMessage = `
_ _
<:blank:1467844528554901608> <:blank:1467844528554901608> <:blank:1467844528554901608> <:blank:1467844528554901608> 
your order flows with Eywa<:blank:1467844528554901608>  <a:blue_dolphin:1467855473989386314>
_ _
<:blank:1467844528554901608> <:blank:1467844528554901608> mawey, dear ${customerUsername} your order has been seen *!*
<:blank:1467844528554901608> remain calm as your chef prepares it for you <:lightblue_heartios:1463466125537968129> 

<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> ( **${qty}** ) — ${food}
<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> paid via ${payment}
<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> total bill : ${totalBill} 
<:blank:1467844528554901608> <:blank:1467844528554901608> 
-# served by ${user} <a:blue_heartpop:1467809370246090928> 
_ _
-# <:blank:1467844528554901608> [where the water guides your order](https://discord.com/channels/1461710247193219186/1467803822540718155/1467833947311309013)
_ _
`;

  await interaction.reply({ content: publicMessage });

  const queueChannel = await client.channels.fetch(QUEUE_CHANNEL_ID) as any;
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

Noted *!*
`;

  const select = new StringSelectMenuBuilder()
    .setCustomId('order-status')
    .setPlaceholder('set order status...')
    .addOptions([
      { label: 'Noted', value: 'noted' },
      { label: 'Processing', value: 'processing' },
      { label: 'Done', value: 'done' }
    ]);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

  const queueMessage = await queueChannel.send({
    content: queueMessageContent,
    components: [row]
  });

  await storage.createOrder({
    customerUsername,
    food,
    qty,
    payment,
    totalBill,
    staffId: user.id,
    staffUsername: user.username,
    channelId: QUEUE_CHANNEL_ID,
    messageId: queueMessage.id
  });
}

async function handleSelectMenu(interaction: any) {
  const member = interaction.member;
  const hasRole = member?.roles?.cache?.some((role: any) => STAFF_ROLE_IDS.includes(role.id));
  
  if (!hasRole) {
    return interaction.reply({ content: 'You do not have permission to use this menu.', ephemeral: true });
  }

  const action = interaction.values[0];
  const message = interaction.message;
  const channel = interaction.channel;
  
  let newStatusText = "";

  if (action === 'noted') {
    newStatusText = "Noted *!*";
  } else if (action === 'processing') {
    newStatusText = "Processing *!*";
  } else if (action === 'done') {
    newStatusText = "Done *!*";
  }

  let newContent = message.content;
  // Update the status line in the message content
  const statusMatch = newContent.match(/(Noted|Processing|Done) \*!\*/);
  if (statusMatch) {
    newContent = newContent.replace(statusMatch[0], newStatusText);
  } else {
    // If somehow missing, append it
    newContent += `\n\n${newStatusText}`;
  }

  if (action === 'done') {
    try {
      console.log("Status set to Done. Updating message and sending notification...");
      
      await message.edit({
        content: newContent,
        components: [] // Remove components when done
      });

      // Update status in database
      const order = await storage.getOrderByMessageId(message.id);
      if (order) {
        await storage.updateOrderStatus(order.id, 'done');
      }

      // Extract order details from message content for the public notification
      const contentLines = message.content.split('\n');
      const foodQtyLine = contentLines.find((l: string) => l.includes('tsireya_star') && l.includes('('));
      const paymentLine = contentLines.find((l: string) => l.includes('paid via'));
      const billLine = contentLines.find((l: string) => l.includes('total bill'));
      const consumerLine = contentLines.find((l: string) => l.includes('consumer'));
      const chefLine = contentLines.find((l: string) => l.includes('chef'));

      // Improved extraction logic - finding text between emoji/parentheses
      const qtyMatch = foodQtyLine?.match(/\(\s*\*\*([^\*]+)\*\*\s*\)/) || foodQtyLine?.match(/\(\*\*([^\*]+)\*\*\)/);
      const qty = qtyMatch ? qtyMatch[1] : "1";
      
      // Split by emoji or dash to get food name
      const food = foodQtyLine?.split(')')?.pop()?.replace(/^[—\s]+/, '')?.trim() || "Food";
      
      const payment = paymentLine?.split('paid via')?.pop()?.trim() || "donation";
      const totalBill = billLine?.split(':')?.pop()?.trim() || "0";
      const customerUsername = consumerLine?.split(':')?.pop()?.trim() || "Customer";
      const chefMention = chefLine?.split(':')?.pop()?.split('<')[0]?.trim() || "Chef";

      const doneMessageContent = `
_ _
<:blank:1467844528554901608> <:blank:1467844528554901608> <:blank:1467844528554901608> <:blank:1467844528554901608> 
your order flows with Eywa<:blank:1467844528554901608>  <a:blue_dolphin:1467855473989386314>
_ _
<:blank:1467844528554901608> <:blank:1467844528554901608> mawey, dear ${customerUsername} your order is **done** *!*
<:blank:1467844528554901608> your meal is ready for pickup — enjoy the tides <:lightblue_heartios:1463466125537968129> 

<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> ( **${qty}** ) — ${food}
<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> paid via ${payment}
<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> total bill : ${totalBill}
<:blank:1467844528554901608> <a:tsireya_star:1467809489163128898> NBH: \`\`Mr_Lambo221\`\`
<:blank:1467844528554901608> <:blank:1467844528554901608> 
-# served by ${chefMention} <a:blue_heartpop:1467809370246090928> 
_ _
-# <:blank:1467844528554901608> [where the water guides your order](https://discord.com/channels/1461710247193219186/1462273166432014641/1467927596200362087)
_ _
`;
      await channel.send({ content: doneMessageContent });
      console.log("Done message sent successfully.");
    } catch (e) {
      console.error("Error in done status processing:", e);
    }
  } else {
    try {
      // Re-create the components so they stay active for the next update
      const select = new StringSelectMenuBuilder()
        .setCustomId('order-status')
        .setPlaceholder('set order status...')
        .addOptions([
          { label: 'Noted', value: 'noted' },
          { label: 'Processing', value: 'processing' },
          { label: 'Done', value: 'done' }
        ]);
      
      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

      await message.edit({
        content: newContent,
        components: [row]
      });

      // Update status in database
      const order = await storage.getOrderByMessageId(message.id);
      if (order) {
        await storage.updateOrderStatus(order.id, action);
      }
    } catch (e) {
      console.error("Error in status update processing:", e);
    }
  }

  try {
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate();
    }
  } catch (e) {
    // Ignore if already acknowledged
  }
}
