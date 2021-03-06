let nicknameChanges = 0;
module.exports = {

    getMemberCount(guild, client) {
        if (!guild)
            return 0;
        return new Promise((resolve, reject) => {
            client.db.getGuildConfig(guild).then((cfg) => {
                let membs = guild.members.filter((m) => cfg.countBots || !m.user.bot);
                let all = membs.size;
                let online = membs.filter((m) => m.presence.status != 'offline').size;
                let offline = all - online;
                resolve({all, online, offline});
            }).catch(reject);
        });
    },

    formatCount(countObj, format) {
        if (!format)
            format = "%all%";
    	Object.keys(countObj)
    		.forEach((k) => {
    			format = format.replace(`%${k}%`, countObj[k]);
    		});
    	return format;
    },

    setNickname(guild, client, cb) {
    	this.getMemberCount(guild, client).then((count) => {
            client.db.getGuildConfig(guild).then((cfg) => {
                let formated = this.formatCount(count, cfg.format);
                guild.fetchMember(client.user).then(guildMe => {
                    guildMe.setNickname(formated)
                    .then(() => nicknameChanges++);
                });
                if (cb) cb(formated);
            });
        });
    },

    updateNicknameChanges(client) {
        if (nicknameChanges > 0) {
            let statsChannel = client.guilds.get(client.config.supportGuild).channels.find(c => c.name.startsWith("Nickname changes:"));
            let changedBefore = parseInt(statsChannel.name.split(": ").slice(1), 10);
            statsChannel.setName(`Nickname changes: ${changedBefore + nicknameChanges}`);
            nicknameChanges = 0;
        }
    },

    encapsuleString(data) {
        if (typeof data == 'string')
            return '"' + data + '"'
        return data;
    }

};