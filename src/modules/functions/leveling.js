const config = require("../../config");
const users = require("../../database/models/users");
const Canvas = require("canvas");
const { getColorFromURL } = require('color-thief-node');
const { MessageAttachment } = require("discord.js");

/**
 * Check the users level
 * 
 * @param {Message} message 
 */
exports.checkLevel = async (message) => {
    // Try to find the user in the database
    let user = await users.findOne({ _id: message.author.id });

    // If the user or the guild doesn't exist create the data
    if (!user) {
        user = await new users({
            _id: message.author.id,
            usernames: [{
                username: message.author.username,
                time: Date.now()
            }],
            guilds: [{
                id: message.guild.id,
                leveling: {
                    xp: 0,
                    level: 1,
                    lastGained: 0
                }
            }]
        }).save();
    } else if (!user.guilds.find(g => g.id == message.guild.id)) {
        user = await users.findOneAndUpdate({ _id: message.author.id }, {
            $push: {
                guilds: {
                    id: message.guild.id,
                    leveling: {
                        xp: 0,
                        level: 1,
                        lastGained: 0
                    }
                }
            }
        });
    }

    // Get the guild data
    const gData = user.guilds.find(g => g.id == message.guild.id);

    // If the user is on cooldown return
    if (gData.leveling.lastGained && (gData.leveling.lastGained + 60000) > Date.now())
        return;

    // Get the xp, xp needed for next level and the new xp
    const stats = gData.leveling,
    xp = Math.floor((Math.random() * (25 - 5) + 5) * message.settings.leveling.multiplier),
    nextLvl = Math.floor(20 * (stats.level ** 2) + (100 * stats.level) + 100),
    newXp = stats.xp + xp;

    if (nextLvl <= newXp && stats.messages) {
        // Send the level up message
        message.reply(`${config.emojis.level_up} ${message.author} just reached level **${stats.level + 1}**!`).then(msg => {
            setTimeout(() => {
                msg.delete().catch(() => {});
            }, 30000);
        });

        // Update the DB
        await users.findOneAndUpdate({ _id: message.author.id, "guilds.id": message.guild.id }, {
            $inc: {
                "guilds.$.leveling.level": 1,
                "guilds.$.leveling.xp": xp
            },
            $set: {
                "guilds.$.leveling.lastGained": Date.now()
            }
        });
    } else {
        // Update the DB
        await users.findOneAndUpdate({ _id: message.author.id, "guilds.id": message.guild.id }, {
            $inc: {
                "guilds.$.leveling.xp": xp
            },
            $set: {
                "guilds.$.leveling.lastGained": Date.now()
            }
        });
    }
};

/**
 * Get all the data for a specific guild
 * 
 * @param {String} guild 
 * 
 * @returns {Array} Array with all the guild data
 */
exports.getGuildMemberData = async (guild) => {
    const data = await users.aggregate([
        {
            $match: {
                guilds: {
                    $elemMatch: {
                        id: guild
                    }
                }
            }
        },
        {
            $project: {
                _id: 1,
                guilds: {
                    $filter: {
                        input: "$guilds",
                        as: "guilds",
                        cond: {
                            $eq: ["$$guilds.id", guild]
                        }
                    }
                }
            }
        }
    ]);

    return data;
};

/**
 * Get the users rank card
 * 
 * @param {Object} user 
 * @param {Object} data 
 * @param {String} guild 
 * 
 * @returns {Promise.<MessageAttachment>} The users rank card
 */
exports.getRankCard = async (user, data, guild) => {
    // Create the canvas, get the context and load the images in
    const canvas = Canvas.createCanvas(700, 250),
    ctx = canvas.getContext("2d"),
    avatar = await Canvas.loadImage(user.displayAvatarURL({ format: "png", dynamic: true })),
    blur = await Canvas.loadImage("https://i.imgur.com/E0We0O9.png");

    // Get the XP data
    const xp = data.leveling.xp - Math.floor(20 * ((data.leveling.level - 1) ** 2) + (100 * (data.leveling.level - 1)) + 100),
    xpNeeded = Math.floor(20 * (data.leveling.level ** 2) + (100 * data.leveling.level) + 100) - Math.floor(20 * ((data.leveling.level - 1) ** 2) + (100 * (data.leveling.level - 1)) + 100),
    percentage = Math.round(Math.floor((xp / xpNeeded) * 100));

    // Get the users rank
    const gData = await this.getGuildMemberData(guild),
    sorted = gData.sort((a, b) => b.guilds[0].leveling.xp - a.guilds[0].leveling.xp),
    rank = sorted.map(a => a._id).indexOf(user.id) + 1;

    // Get the dominant color from the users avatar
    const color = await getColorFromURL(user.displayAvatarURL({ format: "png", dynamic: true }));
    // Define the status colors
    const colors = {
        online: "#3BA55D",
        idle: "#FBA91A",
        offline: "#747E8C",
        dnd: "#ED4344"
    };

    // Draw the background
    ctx.fillStyle = this.rgbToHex(color);
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add blur
    ctx.drawImage(blur, 0, 0, canvas.width, canvas.height);

    // Create circle for the avatar
    ctx.beginPath();
    ctx.arc(125, 125, 75, 0, Math.PI * 2, true);
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.closePath();

    // Save & Clip
    ctx.save();
    ctx.clip();

    // Draw the avatar & restore
    ctx.drawImage(avatar, 50, 50, 150, 150);
    ctx.restore();

    // Draw the users status
    ctx.beginPath();
    ctx.arc(185, 175, 20, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.fillStyle = colors[user.presence.status];
    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    // Create the progress bar
    for (let i = 0; i < 100; i ++) {
        ctx.beginPath();
        ctx.lineWidth = 15;
        ctx.arc(250 + (i * 3.95), 178, 8, 0, Math.PI * 2, true);
        ctx.stroke();
        ctx.closePath();
    }

    // Fill the progress bar with the current percentage
    for (let i = 0; i < percentage; i ++) {
        ctx.beginPath();
        ctx.fillStyle = this.rgbToHex(color);
        ctx.arc(250 + (i * 3.95), 178, 8, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();
    }

    // If the users username is longer than 18 characters shorten it
    if (user.username.length > 18)
        user.username = user.username.slice(0, 18);

    // Get the font size
    const fontSize = this.getFontSize(canvas, user.username, "Whitney Semibold", 200);

    // Draw the username
    ctx.font = `${fontSize}px Whitney Semibold`;
    ctx.fillStyle = "white";
    ctx.fillText(user.username, 240, 145);

    // Measure the username size
    const measured = ctx.measureText(user.username).width;

    // Draw the descriminator
    ctx.font = `${fontSize - 3}px Whitney Book`;
    ctx.fillStyle = "#cccccc";
    ctx.fillText("#" + user.discriminator, 248 + measured, 145);

    // Draw the users XP / XP needed
    ctx.font = `${fontSize}x Whitney Semibold`;
    ctx.fillStyle = "#cccccc";
    ctx.textAlign = "right";
    ctx.fillText(`${xp} / ${xpNeeded} XP`, 650, 145);

    // Draw the users level
    ctx.font = `40px Whitney Semibold`;
    ctx.fillStyle = this.rgbToHex(color);
    ctx.fillText(data.leveling.level, 675, 50);

    // Get the width of the level
    const levelWidth = ctx.measureText(data.leveling.level).width;

    // Draw the level text
    ctx.font = `20px Whitney Semibold`;
    ctx.fillStyle = this.shadeColor(this.rgbToHex(color), -5);
    ctx.fillText("LEVEL", 670 - levelWidth, 50);

    // Get the width of the level text
    const lvlTextWidth = ctx.measureText("LEVEL").width;

    // Draw the users rank
    ctx.font = `40px Whitney Semibold`;
    ctx.fillStyle = "white";
    ctx.fillText(`#${rank}`, 660 - levelWidth - lvlTextWidth, 50);

    // Get the width of the rank
    const rankWidth = ctx.measureText(`#${rank}`).width;

    // Draw the rank text
    ctx.font = `20px Whitney Semibold`;
    ctx.fillStyle = "#e5e5e5";
    ctx.fillText("RANK", 650 - levelWidth - lvlTextWidth - rankWidth, 50);

    // Create & return the attachment
    return new MessageAttachment(canvas.toBuffer(), "rank-card.png");
};

/**
 * Get the font size for the username and xp count
 * 
 * @param {Canvas} canvas
 * @param {String} text
 * @param {String} font
 * @param {Number} maxWidth
 * 
 * @returns {Number} The font size
 */
exports.getFontSize = (canvas, text, font, maxWidth) => {
    // Get the canvas context
	const context = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = 40;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		context.font = `${fontSize -= 10}px ${font}`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (context.measureText(text).width > maxWidth);

	// Return the result to use in the actual canvas
	return fontSize;
};

/**
 * Convert RGB to Hex
 * 
 * @param {Array} array
 * 
 * @returns {String} Hex Color
 */
exports.rgbToHex = (array) => {
    const componentToHex = (a) => {
        const hex = a.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };

    return "#" + componentToHex(array[0]) + componentToHex(array[1]) + componentToHex(array[2]);
};

/**
 * Brighten or darken a hex color by a certain percentage
 * 
 * @param {String} color
 * @param {String} percent
 * 
 * @returns {String} color 
 */
exports.shadeColor = (color, percent) => {
    let R = parseInt(color.substring(1,3),16);
    let G = parseInt(color.substring(3,5),16);
    let B = parseInt(color.substring(5,7),16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R<255)?R:255;  
    G = (G<255)?G:255;  
    B = (B<255)?B:255;  

    const RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
    const GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
    const BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

    return "#"+RR+GG+BB;
};