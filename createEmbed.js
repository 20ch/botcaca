/*
 * Copyright © [2023-2024] Vienna Softworks. All Rights Reserved.
 * I obtained the author's explicit consent to use this code."
*/

const { EmbedBuilder } = require('discord.js');

/**
 * Creates a Discord embed with the provided options.
 *
 * @param {Object} options - The options for the embed.
 * @param {string} options.title - The title of the embed.
 * @param {string} options.description - The description of the embed.
 * @param {string} options.color - The color of the embed.
 * @param {string} [options.url] - The URL of the embed.
 * @param {string} [options.author] - The author of the embed.
 * @param {string} [options.authorUrl] - The URL of the author.
 * @param {string} [options.authorIcon] - The icon URL of the author.
 * @param {string} [options.thumbnail] - The thumbnail URL of the embed.
 * @param {Array} [options.fields] - The fields of the embed.
 * @param {string} [options.image] - The image URL of the embed.
 * @param {string} [options.footer] - The footer text of the embed.
 * @param {string} [options.footerIcon] - The icon URL of the footer.
 * @param {Date} [options.timestamp] - The timestamp of the embed.
 * @returns {EmbedBuilder} - The created embed.
 */
function createEmbed({
  title,
  description,
  color,
  url,
  author,
  authorUrl,
  authorIcon,
  thumbnail,
  fields,
  image,
  footer,
  footerIcon,
  timestamp
}) {
  const embed = new EmbedBuilder()
    .setTitle(title || 'WhatExpsAre.Online')
    .setColor(color || "#b38de5");

  if (description) embed.setDescription(description);
  if (url) embed.setURL(url);
  if (author) embed.setAuthor({ name: author, iconURL: authorIcon, url: authorUrl });
  if (thumbnail) embed.setThumbnail(thumbnail);
  if (fields) embed.addFields(fields);
  if (image) embed.setImage(image);
  if (footer) embed.setFooter({ text: footer, iconURL: footerIcon });
  if (timestamp) embed.setTimestamp(timestamp);

  return embed;
}

module.exports = { createEmbed };
