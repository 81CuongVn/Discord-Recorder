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
		this.oggStream = new prism.opus.OggLogicalBitstream({
			opusHead: new prism.opus.OpusHead({
				channelCount: 2,
				sampleRate: 48000,
			}),
			pageSizeControl: {
				maxPackets: 10,
			},
		});
	}
	async record(
		guildId,
		userId,
		folderPath,
		fileName,
		writeFile = true,
		options = {
			end: {
				behavior: voice.EndBehaviorType.AfterSilence,
				duration: 100,
			},
		},
	) {
		// check folder is exist
		if (writeFile && !fs.existsSync(folderPath)) {
			fs.mkdirSync(folderPath);
			console.log(`${folderPath} is created`);
		}
		const w = writeFile
			? fs.createWriteStream(`${folderPath}${sep}${fileName}.ogg`)
			: null;
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
		if (w)
			return new Promise((resolve, reject) => {
				const stream = audio.pipe(this.oggStream).pipe(w);
				stream
					.once('close', () => {
						resolve(
							'✅ Recorded file: ' + `${folderPath}${sep}${fileName}.ogg`,
						);
					})
					.on('error', (err) => {
						reject(err);
					});
				const server = this.cache.get(guildId) ?? new discord.Collection();
				server.set(userId, {
					audio,
					stream,
					writeStream: w,
					pause: false,
				});
				this.cache.set(guildId, server);
			});
		else {
			const server = this.cache.get(guildId) ?? new discord.Collection();
			server.set(userId, {
				audio,
				stream: connection,
				writeStream: null,
				pause: null,
			});
			this.cache.set(guildId, server);
			return audio;
		}
	}
	manualDestroy(guildId, userId) {
		const server = this.cache.get(guildId);
		if (!server)
			throw new Error(`No voice connection found (GuildId:${guildId})`);
		const stream = server.get(userId);
		if (!stream)
			throw new Error(
				`No voice connection found (GuildId:${guildId}, UserId:${userId})`,
			);
		stream.stream.destroy();
		server.delete(userId);
		this.cache.set(guildId, server);
		return true;
	}
	manualPause(guildId, userId) {
		const server = this.cache.get(guildId);
		if (!server)
			throw new Error(`No voice connection found (GuildId:${guildId})`);
		const stream = server.get(userId);
		if (!stream)
			throw new Error(
				`No voice connection found (GuildId:${guildId}, UserId:${userId})`,
			);
		if (!stream.writeStream)
			throw new Error(
				`No writeStream found (GuildId:${guildId}, UserId:${userId}, Debug: No writeStream file)`,
			);
		console.error('[Feature] Pause not working');
		stream.pause = true;
		stream.audio.pause();
		stream.audio.unpipe(stream.writeStream);
		stream.audio.readableFlowing = false;
		server.set(userId, stream);
		this.cache.set(guildId, server);
		return true;
	}
	manualResume(guildId, userId) {
		const server = this.cache.get(guildId);
		if (!server)
			throw new Error(`No voice connection found (GuildId:${guildId})`);
		const stream = server.get(userId);
		if (!stream)
			throw new Error(
				`No voice connection found (GuildId:${guildId}, UserId:${userId})`,
			);
		if (!stream.writeStream)
			throw new Error(
				`No writeStream found (GuildId:${guildId}, UserId:${userId}, Debug: No writeStream file)`,
			);
		console.error('[Feature] Resume not working');
		stream.pause = false;
		stream.audio.resume();
		stream.audio.pipe(stream.writeStream);
		stream.audio.readableFlowing = true;
		server.set(userId, stream);
		this.cache.set(guildId, server);
		return true;
	}
};
