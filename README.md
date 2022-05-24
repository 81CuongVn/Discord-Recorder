# Discord-Recorder
 This module helps you to record sweet words in Discord VoiceChannel

## Features
- [X] Record voice (.ogg)
- [X] Manual pause and resume
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
    ]
});

const recorder = new Recorder(client);
```

## New Record file

```js
const voice = require('@discordjs/voice');
recorder.record(
		'guildId',
		'userId',
		'./folderPath',
		'fileName',
		{
			end: {
				behavior: voice.EndBehaviorType.AfterSilence,
				duration: 100,
			},
		},
	) // Return Promise<string>
// guildId, userId, folderPath, fileName, options
```

## Pause Record

```js
recorder.manualPause('guildId', 'userId');
```

## Resume Record

```js
recorder.manualResume('guildId', 'userId');
```

## Stop Record

```js
recorder.manualDestroy('guildId', 'userId');
// Promise `record file` ended
```