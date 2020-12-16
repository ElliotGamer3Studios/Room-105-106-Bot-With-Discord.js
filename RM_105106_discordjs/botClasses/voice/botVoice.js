module.exports = class BotVoice
{
	constructor()
	{
		this._volume;
		this._dispatcher;
		this._connection;
		this._isConnected = false;
	}
	isConnected()
	{ return this._isConnected; }

	async joinVoice(message, url)
	{
		//voice works in guilds only!!!!
		if(!message.guild)
		{ return; }

		if (message.member.voice.channel) 
		{
			const connection = await message.member.voice.channel.join();
			this._dispatcher = connection.play(url);
			return Promise.resolve("playing");
		} 
		else 
		{
			message.reply('You need to join a voice channel first!');
			return Promise.reject("Not in Voice.");
		}

	}
 	connected()
	{
		this._isConnected = true;
	}

	notConnected()
	{
		this._isConnected = false;
	}

	disconnectVoice()
	{
		this._dispatcher.destroy();
		this._isConnected = false;
	}
	pause()
	{
		this._dispatcher.pause();
	}
	resume()
	{
		this._dispatcher.resume();
	}
	setVolume(vol)
	{
		isVolValid = (vol >= 0.0) && (vol <= 1.0) && (vol !== this._volume);
		if(isVolValid)
		{
			this._dispatcher.setVolume(vol);
		}
	}
}