import Discord from 'discord.js';
import Voice from '@discordjs/voice';
declare class Recorder {
    constructor(client: Discord.Client);
    client: Discord.Client;
    cache: Discord.Collection<Discord.Snowflake, Discord.Collection<Discord.Snowflake, { audio: Voice.AudioReceiveStream, stream: pipeStream }>>;
    /**
     * Recorder a user
     * @param guildId Guild Id
     * @param userId User id to record
     * @param folderPath Folder path to save the file
     * @param fileName File name to save (.ogg)
     * @param options AudioReceiveStreamOptions
     * @returns {Promise<string>} Logs
     */
    record(guildId: Discord.Snowflake, userId: Discord.Snowflake, folderPath: string, fileName: string, options: Voice.AudioReceiveStreamOptions | null): Promise<string>;
    /**
     * Stop recording a user
     * @param guildId Guild Id
     * @param userId User id to stop recording
     * @returns {boolean} Stop
     */
    manualDestroy(guildId: Discord.Snowflake, userId: Discord.Snowflake): boolean;
    /**
     * Pause recording a user
     * @param guildId Guild Id
     * @param userId User id to pause recording
     * @returns {boolean} Pause
     */
    manualPause(guildId: Discord.Snowflake, userId: Discord.Snowflake): boolean;
    /**
     * Resume recording a user
     * @param guildId Guild Id
     * @param userId User id to resume recording
     * @returns {boolean} Resume
     */
    manualResume(guildId: Discord.Snowflake, userId: Discord.Snowflake): boolean;
}
declare var Recorder: Recorder;
export = Recorder;
