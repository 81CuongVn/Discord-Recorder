'use strict';
const fs = require('fs');
const voice = require('@discordjs/voice');
const sep = require('path').sep;
const prism = require('prism-media');
const discord = require('discord.js');
module.exports = class Recorder {
	constructor(client) {
		if (!(client instanceof discord.Client)) {
			throw new TypeError('client must be an instance of discord.Client');
		}
		this.client = client;
		this.cache = new discord.Collection(); // Collection<guildId, collection<userId, pipeStream>>
	}
	async record(
		guildId,
		userId,
		folderPath,
		fileName,
		options = {
			end: {
				behavior: voice.EndBehaviorType.AfterSilence,
				duration: 100,
			},
		},
	) {
		// check folder is exist
		if (!fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
			console.log(`${folderPath} is created`);
		}
		const w = fs.createWriteStream(`${folderPath}${sep}${fileName}.ogg`);
		const connection = await voice.getVoiceConnection(guildId);
		if (!connection) {
			throw new Error(`No voice connection found (GuildId:${guildId})`);
		}
		await voice.entersState(
			connection,
			voice.VoiceConnectionStatus.Ready,
			30000,
		);
		const audio = connection.receiver.subscribe(userId, options);
		const oggStream = new prism.opus.OggLogicalBitstream({
			opusHead: new prism.opus.OpusHead({
				channelCount: 2,
				sampleRate: 48000,
			}),
			pageSizeControl: {
				maxPackets: 10,
			},
		});
		return new Promise((resolve, reject) => {
			const stream = audio.pipe(oggStream).pipe(w);
			stream.once('close', () => {
				resolve('✅ Recorded file: ' + `${folderPath}${sep}${fileName}.ogg`);
			}).on('error', (err) => {
				reject(err);
			});
			const server = this.cache.get(guildId) ?? new discord.Collection();
			server.set(userId, {
				audio,
				stream
			});
			this.cache.set(guildId, server);
		});
	}
	manualDestroy(guildId, userId) {
		const server = this.cache.get(guildId);
		if (!server) throw new Error(`No voice connection found (GuildId:${guildId})`);
		const stream = server.get(userId);
		if (!stream) throw new Error(`No voice connection found (GuildId:${guildId}, UserId:${userId})`);
		stream.stream.destroy();
		server.delete(userId);
		this.cache.set(guildId, server);
		return true;
	}
	manualPause(guildId, userId) {
		const server = this.cache.get(guildId);
		if (!server) throw new Error(`No voice connection found (GuildId:${guildId})`);
		const stream = server.get(userId);
		if (!stream) throw new Error(`No voice connection found (GuildId:${guildId}, UserId:${userId})`);
		stream.audio.pause();
		return true;
	}
	manualResume(guildId, userId) {
		const server = this.cache.get(guildId);
		if (!server) throw new Error(`No voice connection found (GuildId:${guildId})`);
		const stream = server.get(userId);
		if (!stream) throw new Error(`No voice connection found (GuildId:${guildId}, UserId:${userId})`);
		stream.audio.resume();
		return true;
	}
};