const { MessageActionRow, MessageButton, MessageMenuOption, MessageMenu } = require('discord-buttons');
const { MessageEmbed } = require('discord.js');
const db = require('quick.db')

module.exports = {
    name: 'setticket',
    description: 'Configurer les paramètres du ticket',
    run: async (client, message, args, prefix, color) => {

        let perm = ""
        message.member.roles.cache.forEach(role => {
            if (db.get(`admin_${message.guild.id}_${role.id}`)) perm = true
            if (db.get(`ownerp_${message.guild.id}_${role.id}`)) perm = true
        })
        if (client.config.owner.includes(message.author.id) || db.get(`ownermd_${client.user.id}_${message.author.id}`) === true || perm) {

            let botAvatar = client.user.displayAvatarURL();
            const embed = new MessageEmbed()
                .setTitle('Configuration des ticket')
                .setFooter(`${client.user.username}`, botAvatar)
                .setTimestamp()
                .setColor(color)
                .setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** Pas encore configuré\n > **Salon de Ticket :** Pas encore configuré\n > **Catégorie :** Pas encore configuré\n> **Emoji Button :** Pas encore configuré\n> **Nom Button :** Pas encore configuré`);

            const menuOptions = [
                { value: 'adminrole', label: 'Le role admin', emoji: '1140558858335563796' },
                { value: 'Salondeticket', label: 'Salon de ticket', emoji: '1140558615913168946' },
                { value: 'categoriedeticket', label: 'Catégories de ticket', emoji: '1141397316029399070' },
                { value: 'title', label: 'le titre', emoji: '1140558694686412801' },
                { value: 'description', label: 'la description l\'embed', emoji: '1134881237455098026' },
                { value: 'couleur', label: 'la couleur de l\'embed', emoji: '🎨' },
                { value: 'nom du button', label: 'le nom du button', emoji: '1140558526276706306' },
                { value: 'emoji du button', label: 'l\'emoji du button', emoji: '1141364641776271473' },
                { value: 'couleur du button', label: 'la couleur du button', emoji: '1141018061298749600' }
                // Ajoutez d'autres options de paramètres ici
            ];

            let interactiveMenu = new MessageMenu()
                .setID('ticket_settings_menu')
                .setMaxValues(1)
                .setMinValues(1)
                .setPlaceholder('Sélectionnez un paramètre à configurer');

            menuOptions.forEach(option => {
                let menuOption = new MessageMenuOption()
                    .setLabel(option.label)
                    .setValue(option.value)
                    .setDescription(`Modifier ${option.label.toLowerCase()}`)
                    .setDefault()
                    .setEmoji(option.emoji);
                interactiveMenu.addOption(menuOption);
            });

            const cancelButton = new MessageButton()
                .setStyle('gray')
                .setID('cancel_settings')
                .setEmoji('1140559036509593670')
                .setLabel('Désactiver les ticket');

            const ticketsend = new MessageButton()
                .setStyle('blurple')
                .setID('ticketenvoyer')
                .setEmoji('1140559009460539473')
                .setLabel('Ticket-Envoyer');

            const viewButton = new MessageButton()
                .setStyle('green')
                .setEmoji('1141362225022505090')
                .setLabel('Voir l\'embed')
                .setID('view_embed');

            const components = [
                new MessageActionRow().addComponent(interactiveMenu),
                new MessageActionRow().addComponent(cancelButton),
                new MessageActionRow().addComponent(ticketsend),
                new MessageActionRow().addComponent(viewButton),
            ];

            const msg = await message.channel.send({ embed: embed, components: components });
            const userResponses = {};
            client.on('clickMenu', async menu => {
                if (menu.message.id === msg.id && menu.clicker.user.id === message.author.id) {
                    menu.reply.defer(true);
                    await handleMenuSelection(menu, menu.clicker.user.id); // Passer l'ID de l'utilisateur ici
                }
            });
            client.on('clickButton', async button => {
                if (button.message.id === msg.id && button.clicker.user.id === message.author.id) {
                    if (button.id === 'cancel_settings') {
                        button.reply.defer(true);
                        const Desactiverticket = await message.channel.send('Les Ticket on été Désactiver !');
                        setTimeout(() => Desactiverticket.delete(), 3000);
                        const guildId = message.guild.id;
                        db.set(`ticketsalon_${guildId}`, "undefined");
                    } else if (button.id === 'view_embed') {
                        button.reply.defer(true);

                        const configuration = userResponses[button.clicker.user.id];
                        if (configuration) {
                            const embed = new MessageEmbed();

                            // Ajoutez le titre si configuré
                            if (configuration.title) {
                                embed.setTitle(configuration.title);
                            }

                            // Ajoutez la description si configurée
                            if (configuration.description) {
                                embed.setDescription(configuration.description);
                            }

                            // Ajoutez la couleur si configurée
                            if (configuration.color) {
                                embed.setColor(configuration.color);
                            }
                            const ticketbuttoncolor = configuration.ticketbuttoncolor || "blurple";
                            const buttonName = configuration.buttonName || "Ouvrir Un ticket";
                            const buttonEmoji = configuration.buttonEmoji || "🎫";
                            // Ajout du bouton bleu à l'intérieur de l'embed
                            const blueButton = new MessageButton()
                                .setStyle(ticketbuttoncolor)
                                .setLabel(buttonName)
                                .setID(buttonName)
                                .setEmoji(buttonEmoji);

                            message.channel.send(embed, blueButton);
                        } else {
                            message.channel.send("Aucune configuration n'a été enregistrée pour cet utilisateur.");
                        }
                    }
                    if (button.id === 'ticketenvoyer') {
                        const configuration = userResponses[button.clicker.user.id];

                        if (!configuration || !configuration.description || !configuration.adminrole || !configuration.categoriedeticket || !configuration.ticketsalon) {
                            button.reply.send("Vous n'avez pas encore tout configuré !", true);
                            return; // Arrêtez le traitement si les paramètres nécessaires ne sont pas configurés
                        }

                        button.reply.defer(true);
                        if (configuration) {
                            const ticketembed = new MessageEmbed();

                            // Ajoutez le titre si configuré
                            if (configuration.title) {
                                ticketembed.setTitle(configuration.title);
                            }

                            // Ajoutez la description si configurée
                            if (configuration.description) {
                                ticketembed.setDescription(configuration.description);
                            }

                            // Ajoutez la couleur si configurée
                            if (configuration.color) {
                                ticketembed.setColor(configuration.color);
                            }
                            const ticketbuttoncolor = configuration.ticketbuttoncolor || "blurple";
                            const buttonName = configuration.buttonName || "Ouvrir Un ticket";
                            const buttonEmoji = configuration.buttonEmoji || "🎫";
                            // Ajout du bouton bleu à l'intérieur de l'embed
                            const createButton = new MessageButton()
                                .setStyle(ticketbuttoncolor)
                                .setLabel(buttonName)
                                .setID('create_ticket')
                                .setEmoji(buttonEmoji);

                            const targetChannelID = configuration.ticketsalon; // L'ID du salon cible
                            const targetChannel = client.channels.cache.get(targetChannelID);
                            const row = new MessageActionRow().addComponents(createButton);
                            message.channel.send(`Le ticket a bien été envoyer dans le salon <#${targetChannelID}>`)
                            const embedMessage = await targetChannel.send({ embed: ticketembed, components: [row] });
                            const filter = () => true;
                            const collector = embedMessage.createButtonCollector(filter);

                            collector.on('collect', async (button) => {
                                await button.reply.defer();
                                let botAvatar = client.user.displayAvatarURL();
                                const user = button.clicker.user; // Obtenir l'utilisateur qui a cliqué sur le bouton

                                const ticketChannel = await message.guild.channels.create(`ticket-${user.username}`, {
                                    type: 'text',
                                    parent: configuration.categoriedeticket,
                                    permissionOverwrites: [

                                        {
                                            id: user.id,
                                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'],
                                        },
                                        {
                                            id: configuration.adminrole,
                                            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'],
                                        },
                                        {
                                            id: message.guild.roles.everyone,
                                            deny: ['VIEW_CHANNEL'], // Refuser la vue à tout le monde par défaut
                                        },
                                    ],
                                });

                                const welcomeEmbed = new MessageEmbed()
                                    .setColor(color)
                                    .setTitle(`Ticket créé par ${user.tag}`)
                                    .setDescription(`Salut ${user}, bienvenue dans votre ticket !`)
                                    .addField(`Action : `, `Merci de nous fournir la raison de la création de votre ticket. Cela permettra aux modérateurs de vous aider plus rapidement lorsque l'un d'entre eux arrivera.`);


                                const closeButton = new MessageButton()
                                    .setStyle('red')
                                    .setLabel('Fermer le ticket')
                                    .setID('close_ticket');

                                const claimButton = new MessageButton()
                                    .setStyle('grey')
                                    .setLabel('Claim')
                                    .setID('claim_ticket');

                                const actionRow = new MessageActionRow().addComponents(closeButton, claimButton);

                                welcomeEmbed
                                    .addField('Actions', 'Cliquez sur le bouton pour fermer le ticket ou le claimer :')
                                    .setTimestamp()
                                    .setFooter(`${client.user.username}`, botAvatar);

                                const userMentionMessage = await ticketChannel.send(`<@${user.id}><@&${configuration.adminrole}>`, { embed: welcomeEmbed, components: [actionRow] });

                                const closeFilter = () => true;
                                const closeCollector = userMentionMessage.createButtonCollector(closeFilter);

                                closeCollector.on('collect', async (closeButton) => {
                                    if (closeButton.id === 'close_ticket') {
                                        await closeButton.reply.defer();

                                        const confirmationEmbed = new MessageEmbed()
                                            .setColor(color)
                                            .setDescription("```Êtes-vous sûr de vouloir fermer ce ticket ?```");

                                        const confirmButton = new MessageButton()
                                            .setStyle('red')
                                            .setLabel('Confirmer')
                                            .setID('confirm_close_ticket');

                                        const cancelButton = new MessageButton()
                                            .setStyle('green')
                                            .setLabel('Annuler')
                                            .setID('cancel_close_ticket');

                                        const confirmationActionRow = new MessageActionRow().addComponents(confirmButton, cancelButton);

                                        const confirmationMessage = await ticketChannel.send({ embed: confirmationEmbed, components: [confirmationActionRow] });

                                        const confirmationFilter = () => true; // Ne pas filtrer les interactions
                                        const confirmationCollector = confirmationMessage.createButtonCollector(confirmationFilter, { time: 15000 });

                                        confirmationCollector.on('collect', async (confirmationButton) => {
                                            if (confirmationButton.id === 'confirm_close_ticket') {
                                                await confirmationButton.reply.defer();

                                                const closeMessage = await ticketChannel.send('**Le ticket sera fermé dans 3 secondes...**');

                                                setTimeout(async () => {
                                                    await ticketChannel.delete();
                                                }, 3000);
                                            } else if (confirmationButton.id === 'cancel_close_ticket') {
                                                await confirmationButton.reply.defer();
                                                await confirmationMessage.delete();
                                            }
                                        });

                                        confirmationCollector.on('end', () => {
                                            confirmationMessage.delete();
                                        });
                                    }
                                });

                                const claimRole = message.guild.roles.cache.find(role => role.id === configuration.adminrole,);

                                if (claimRole) {
                                    const claimFilter = (button) => {
                                        if (button.clicker.user.id === user.id) {
                                            button.reply.send('Vous ne pouvez pas utiliser ce bouton pour votre propre ticket.', true);
                                            return false;
                                        }

                                        if (!button.clicker.member.roles.cache.has(configuration.adminrole)) {
                                            button.reply.send('Vous n\'avez pas la permission de fermer ce ticket.', true);
                                            return false;
                                        }

                                        if (!button.clicker.member.roles.cache.has(claimRole.id)) {
                                            button.reply.send('Vous n\'avez pas la permission de claim ce ticket.', true);
                                            return false;
                                        }

                                        return true;
                                    };

                                    const claimCollector = userMentionMessage.createButtonCollector(claimFilter);

                                    claimCollector.on('collect', async (claimButton) => {
                                        if (claimButton.id === 'claim_ticket') {
                                            await claimButton.reply.defer();

                                            const claimEmbed = new MessageEmbed()
                                                .setColor(color)
                                                .setDescription(`Ce ticket a été claim par ${claimButton.clicker.member}`)

                                            await ticketChannel.send(claimEmbed);

                                            welcomeEmbed
                                                .setTitle(`Ticket créé par ${user.tag}`)
                                                .setDescription(`Salut <@${user.id}>, bienvenue dans votre ticket !`)
                                                .addField(`Action : `, `Merci de nous fournir la raison de la création de votre ticket. Cela permettra aux modérateurs de vous aider plus rapidement lorsque l'un d'entre eux arrivera.`)
                                                .addField('Claim Par :', claimButton.clicker.member)
                                                .setTimestamp()
                                                .setFooter(`${client.user.username}`, botAvatar);

                                            const inactiveClaimButton = new MessageButton()
                                                .setStyle('grey')
                                                .setLabel('Claim')
                                                .setID('claim_ticket')
                                                .setDisabled(true);

                                            const newActionRow = new MessageActionRow().addComponents(closeButton, inactiveClaimButton);
                                            await userMentionMessage.edit({ embed: welcomeEmbed, components: [newActionRow] });
                                        }
                                    });

                                    claimCollector.on('end', () => {
                                        const creatorButton = actionRow.components.find(button => button.id === 'create_ticket');
                                        if (creatorButton) {
                                            creatorButton.setDisabled();
                                            userMentionMessage.edit({ components: [actionRow] });
                                        }
                                    });

                                }
                            });
                        } else {
                            message.channel.send("Vous n'avez pas encore rien configurer !");
                        }
                    }

                }
            });



            async function handleMenuSelection(menu, userId) { // Ajouter userId ici
                const selectedValue = menu.values[0];

                switch (selectedValue) {
                    case 'title':
                        await tickettitre(userId, 'title', message.channel); // Passer le canal ici
                        break;

                    case 'description':
                        await ticketdescription(userId, 'description', message.channel); // Passer le canal ici
                        break;

                    case 'couleur':
                        await ticketcolor(userId, 'color', message.channel); // Passer le canal ici
                        break;
                    case 'nom du button':
                        await ticketbutton(userId, 'nom du button', message.channel); // Passer le canal ici
                        break;
                    case 'emoji du button':
                        await ticketmojibutton(userId, 'emoji du button', message.channel); // Passer le canal ici
                        break;
                    case 'couleur du button':
                        await ticketbuttoncolor(userId, 'couleur du button', message.channel); // Passer le canal ici
                        break;
                    case 'adminrole':
                        await ticketadminrole(userId, 'adminrole', message.channel); // Passer le canal ici
                        break;
                    case 'Salondeticket':
                        await ticketsalon(userId, 'Salondeticket', message.channel); // Passer le canal ici
                        break;
                    case 'categoriedeticket':
                        await categoriedeticket(userId, 'categoriedeticket', message.channel); // Passer le canal ici
                        break;
                    // Ajoutez d'autres cas pour les autres options
                    default:
                        break;
                }
            }
            async function ticketdescription(userId, field, channel, guildId) {
                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });

                let descriptionMessage = await channel.send(`Veuillez entrer la nouvelle description du ticket.`);
                responseCollector.on('collect', async response => {
                    const content = response.content;
                    userResponses[userId] = { ...userResponses[userId], description: content }; // Ajoutez la description

                    // Supprimer les messages du bot et de l'utilisateur
                    const guildId = channel.guild.id;
                    db.set(`ticketdescription_${guildId}`, content);
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => botMessage.delete(), 500);
                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';

                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);

                    await msg.edit({ embed: embed, components: components });
                });
            }

            async function tickettitre(userId, field, channel) {
                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });

                let descriptionMessage = await channel.send(`Veuillez entrer le nouveau titre du ticket.`);
                responseCollector.on('collect', async response => {
                    const content = response.content;
                    userResponses[userId] = { ...userResponses[userId], title: content }; // Ajoutez le titre

                    const guildId = channel.guild.id;
                    db.set(`tickettitre_${guildId}`, content);
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => botMessage.delete(), 500);

                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';

                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);

                    await msg.edit({ embed: embed, components: components });
                });
            }

            async function ticketcolor(userId, field, channel) {
                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });

                let descriptionMessage = await channel.send(`Veuillez entrer la nouvelle couleur (html) du ticket.`);
                responseCollector.on('collect', async response => {
                    const content = response.content;

                    const isValidColor = /^#([0-9A-Fa-f]{3}){1,2}$/.test(content);
                    if (!isValidColor) {
                        const invalidMessage = await channel.send('Merci de donner une couleur HTML valide (format : #RRGGBB).');
                        setTimeout(() => {
                            invalidMessage.delete().catch(error => console.error(error));
                        }, 3000); // Supprime le message après 3 secondes
                        descriptionMessage.delete();
                        response.delete();
                        return;
                    }

                    userResponses[userId] = { ...userResponses[userId], color: content };

                    // Supprimer les messages du bot et de l'utilisateur
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => {
                        botMessage.delete();
                        // Supprimer le message de réponse du membre après un court délai
                        channel.bulkDelete([response, botMessage]).catch(error => console.error(error));
                    }, 500);
                    const configuration = userResponses[userId];
                    const guildId = channel.guild.id;
                    db.set(`ticketcolor_${guildId}`, configuration.color);
                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';

                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);

                    await msg.edit({ embed: embed, components: components });
                });
            }

            async function ticketbutton(userId, field, channel) {
                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });

                let descriptionMessage = await channel.send(`Veuillez entrer le nom du bouton du ticket.`);
                responseCollector.on('collect', async response => {
                    const content = response.content;
                    userResponses[userId] = { ...userResponses[userId], buttonName: content }; // Utilisez la propriété buttonName

                    // Supprimer les messages du bot et de l'utilisateur
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => botMessage.delete(), 500);
                    const configuration = userResponses[userId];
                    const guildId = channel.guild.id;
                    db.set(`ticketbuttonname_${guildId}`, configuration.buttonName);
                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';

                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);

                    await msg.edit({ embed: embed, components: components });
                });
            }

            async function ticketadminrole(userId, field, channel) {
                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });

                let descriptionMessage = await channel.send(`Veuillez entrer le rôle admin (mentionnez-le ou entrez son ID).`);
                responseCollector.on('collect', async response => {
                    const content = response.content;
                    let adminRoleId = content;

                    // Extract the role ID if a mention is used
                    const mentionMatch = content.match(/^<@&(\d+)>$/);
                    if (mentionMatch) {
                        adminRoleId = mentionMatch[1];
                    }

                    const adminRole = channel.guild.roles.cache.get(adminRoleId);
                    if (!adminRole) {
                        const invalidMessage = await channel.send('Merci de donner un rôle admin valide.');
                        setTimeout(() => {
                            invalidMessage.delete().catch(error => console.error(error));
                        }, 3000); // Supprime le message après 3 secondes
                        descriptionMessage.delete();
                        response.delete();
                        return;
                    }

                    userResponses[userId] = { ...userResponses[userId], adminrole: adminRoleId };

                    // Supprimer les messages du bot et de l'utilisateur
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => {
                        botMessage.delete();
                        // Supprimer le message de réponse du membre après un court délai
                        channel.bulkDelete([response, botMessage]).catch(error => console.error(error));
                    }, 500);

                    const configuration = userResponses[userId];
                    const guildId = channel.guild.id;
                    db.set(`ticketadminrole_${guildId}`, configuration.adminrole);
                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';

                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);

                    await msg.edit({ embed: embed, components: components });
                });
            }

            async function ticketmojibutton(userId, field, channel) {
                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });
            
                let descriptionMessage = await channel.send(`Veuillez entrer l'emoji du bouton du ticket.`);
                responseCollector.on('collect', async response => {
                    const content = response.content.trim();
            
                    const customEmojiMatch = content.match(/^<a?:.+:(\d+)>$/);
                    const emojiId = customEmojiMatch ? customEmojiMatch[1] : null;
            
                    const isUnicodeEmoji = !emojiId && /\p{Emoji}/u.test(content);
            
                    if (!emojiId && !isUnicodeEmoji) {
                        const invalidMessage = await channel.send('Merci de donner un emoji valide.');
                        setTimeout(() => {
                            invalidMessage.delete().catch(error => console.error(error));
                        }, 3000);
                        descriptionMessage.delete();
                        response.delete();
                        return;
                    }
            
                    userResponses[userId] = { ...userResponses[userId], buttonEmoji: emojiId || content };
            
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => {
                        botMessage.delete();
                        channel.bulkDelete([response, botMessage]).catch(error => console.error(error));
                    }, 500);
            
                    const configuration = userResponses[userId];
                    const guildId = channel.guild.id;
                    db.set(`ticketmojibutton_${guildId}`, configuration.buttonEmoji);
            
                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';
            
                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);
            
                    await msg.edit({ embed: embed, components: components });
                });
            }

            async function ticketbuttoncolor(userId, field, channel) {
                const validColors = ['blurple', 'grey', 'green', 'red'];

                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });

                let descriptionMessage = await channel.send(`Veuillez entrer la couleur du bouton : (\`blurple , grey , green , red\`)`);
                responseCollector.on('collect', async response => {
                    const content = response.content.toLowerCase();
                    if (!validColors.includes(content)) {
                        const invalidMessage = await channel.send('Merci de donner une couleur valide (blurple, grey, green, red).');
                        setTimeout(() => {
                            invalidMessage.delete().catch(error => console.error(error));
                        }, 3000);
                        descriptionMessage.delete();
                        response.delete();
                        return;
                    }

                    userResponses[userId] = { ...userResponses[userId], ticketbuttoncolor: content };

                    // Supprimer les messages du bot et de l'utilisateur
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => {
                        botMessage.delete();
                        // Supprimer le message de réponse du membre après un court délai
                        channel.bulkDelete([response, botMessage]).catch(error => console.error(error));
                    }, 500);

                    const configuration = userResponses[userId];
                    const guildId = channel.guild.id;
                    db.set(`ticketbuttoncolor_${guildId}`, configuration.ticketbuttoncolor);
                    // Mettre à jour la description de l'embed avec les nouvelles valeurs des paramètres
                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';

                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);

                    await msg.edit({ embed: embed, components: components });
                });
            }

            async function categoriedeticket(userId, field, channel) {
                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });

                let descriptionMessage = await channel.send(`Veuillez entrer l'id de la catégorie de ticket !`);
                responseCollector.on('collect', async response => {
                    const content = response.content;
                    let categoriedeticket = content;

                    // Extract the category ID if a mention is used
                    const mentionMatch = content.match(/^<#(\d+)>$/);
                    if (mentionMatch) {
                        categoriedeticket = mentionMatch[1];
                    }

                    const isValidCategory = channel.guild.channels.cache.get(categoriedeticket);
                    if (!isValidCategory || isValidCategory.type !== 'category') {
                        const invalidMessage = await channel.send('Merci de donner une catégorie valide.');
                        setTimeout(() => {
                            invalidMessage.delete().catch(error => console.error(error));
                        }, 500); // Supprime le message après 3 secondes
                        descriptionMessage.delete();
                        response.delete();
                        return;
                    }

                    userResponses[userId] = { ...userResponses[userId], categoriedeticket: categoriedeticket }; // Ajoutez la catégorie de ticket

                    // Supprimer les messages du bot et de l'utilisateur
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => {
                        botMessage.delete();
                        // Supprimer le message de réponse du membre après un court délai
                        channel.bulkDelete([response, botMessage]).catch(error => console.error(error));
                    }, 500);

                    const configuration = userResponses[userId];
                    const guildId = channel.guild.id;
                    db.set(`categoriedeticket_${guildId}`, configuration.categoriedeticket);
                    // Mettre à jour la description de l'embed avec les nouvelles valeurs des paramètres
                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';

                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);

                    await msg.edit({ embed: embed, components: components });
                });
            }

            async function ticketsalon(userId, field, channel) {
                const filter = response => response.author.id === userId;
                const responseCollector = channel.createMessageCollector(filter, { max: 1, time: 60000 });

                let descriptionMessage = await channel.send(`Veuillez entrer le salon de ticket (mentionnez-le ou entrez son ID).`);
                responseCollector.on('collect', async response => {
                    const content = response.content;
                    let ticketsalon = content;

                    // Extract the channel ID if a mention is used
                    const mentionMatch = content.match(/^<#(\d+)>$/);
                    if (mentionMatch) {
                        ticketsalon = mentionMatch[1];
                    }

                    const isValidChannel = channel.guild.channels.cache.has(ticketsalon);
                    if (!isValidChannel) {
                        const invalidMessage = await channel.send('Merci de donner un salon valide.');
                        setTimeout(() => {
                            invalidMessage.delete().catch(error => console.error(error));
                        }, 500); // Supprime le message après 3 secondes
                        descriptionMessage.delete();
                        response.delete();
                        return;
                    }

                    userResponses[userId] = { ...userResponses[userId], ticketsalon: ticketsalon }; // Ajoutez le salon de ticket

                    // Supprimer les messages du bot et de l'utilisateur
                    response.delete();
                    responseCollector.stop();
                    descriptionMessage.delete();
                    const botMessage = await channel.send('Réponse enregistrée.');
                    setTimeout(() => {
                        botMessage.delete();
                        // Supprimer le message de réponse du membre après un court délai
                        channel.bulkDelete([response, botMessage]).catch(error => console.error(error));
                    }, 500);

                    const configuration = userResponses[userId];
                    const guildId = channel.guild.id;
                    db.set(`ticketsalon_${guildId}`, configuration.ticketsalon);
                    // Mettre à jour la description de l'embed avec les nouvelles valeurs des paramètres
                    let adminRoleMention = userResponses[userId].adminrole ? `<@&${userResponses[userId].adminrole}>` : 'Pas encore configuré';
                    let categorieValue = userResponses[userId].categoriedeticket ? `<#${userResponses[userId].categoriedeticket}>` : 'Pas encore configuré';
                    let salonTicketValue = userResponses[userId].ticketsalon ? `<#${userResponses[userId].ticketsalon}>` : 'Pas encore configuré';
                    let emojibuttonTicketValue = userResponses[userId].buttonEmoji || 'Pas encore configuré';
                    let buttonnameTicketValue = userResponses[userId].buttonName || 'Pas encore configuré';

                    embed.setDescription(`Utilisez le menu déroulant ci-dessous pour configurer les paramètres du ticket.\n\n> __**Configuration :**__\n\n> **Role Admin :** ${adminRoleMention}\n > **Catégorie :** ${categorieValue}\n > **Salon Ticket :** ${salonTicketValue}\n > **Emoji Button :** ${emojibuttonTicketValue}\n > **Nom Button :** ${buttonnameTicketValue}`);

                    await msg.edit({ embed: embed, components: components });
                });
            }

        }

    }

};

