# Discord-Recorder

This module helps you to record sweet words in Discord VoiceChannel

## Features

- [x] Record voice (.ogg)
- [ ] Manual pause and resume
- [x] Stream audio from Server A to Server B
- [ ] ...

## Dependencies

- `discord.js@13.7.0`
- `@discordjs/voice@0.9.0`
- `node-crc@1.3.2`
- `path@0.12.7`
- `prism-media@2.0.0-alpha.0`

## Using

```sh
$ npm install discord-recorder
```

```js
const Recorder = require('discord-recorder');
const client = new Discord.Client({
	intents: [
		// your intents
	],
});

const recorder = new Recorder(client);
```

## New Record file

```js
const voice = require('@discordjs/voice');
recorder.record('guildId', 'userId', './folderPath', 'fileName', true , {
	end: {
		behavior: voice.EndBehaviorType.AfterSilence,
		duration: 100,
	},
}); // Return Promise<string>
// guildId, userId, folderPath, fileName, recordFile (True: Record to File, False: stream audio from Server A to Server B), options
```

## Stream audio from Server A to Server B

```js
const serverA = {
	guildId: 'guildId',
	channelId: 'channelId',
	userId: 'userId',
};
const serverB = {
	guildId: 'guildId',
	channelId: 'channelId',
};
const voice = require('@discordjs/voice');
// Connect to Server A (VoiceChannel)
let connection = await voice.joinVoiceChannel({
	channelId: serverA.channelId,
	guildId: serverA.guildId,
	adapterCreator: client.guilds.cache.get(serverA.guildId).voiceAdapterCreator,
	selfDeaf: false,
});
connection = await voice.entersState(
	connection,
	voice.VoiceConnectionStatus.Ready,
	10000,
);
// Listening User (Server A)
const res = await client.recorder.record(
	serverA.guildId,
	serverA.userId,
	null,
	null,
	false,
); // Return Opus Stream

// Connect to Server B (VoiceChannel)
let connection2 = await voice.joinVoiceChannel({
	channelId: serverB.channelId,
	guildId: serverB.guildId,
	adapterCreator: client.guilds.cache.get(serverB.guildId).voiceAdapterCreator,
	selfDeaf: false,
});
connection2 = await voice.entersState(
	connection2,
	voice.VoiceConnectionStatus.Ready,
	10000,
);
// Create AudioResource (Opus)
const resource = voice.createAudioResource(res, {
	inputType: voice.StreamType.Opus,
});
const player = voice.createAudioPlayer({
	behaviors: {
		noSubscriber: voice.NoSubscriberBehavior.Play,
	},
});
player.play(resource);
// Stream to Server B
connection2.subscribe(player);
```

## Pause Record

- Not working

```js
recorder.manualPause('guildId', 'userId');
```

## Resume Record

- Not working

```js
recorder.manualResume('guildId', 'userId');
```

## Stop Record

```js
recorder.manualDestroy('guildId', 'userId');
// Promise `record file` ended
```
