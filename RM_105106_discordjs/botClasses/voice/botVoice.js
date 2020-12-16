module.exports = class BotVoice
{
	constructor()
	{
		this._volume = 1.0;
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
			this.connection = await message.member.voice.channel.join();
			return Promise.resolve(url);
		} 
		else 
		{
			message.reply('You need to join a voice channel first!');
			return Promise.reject("Not in Voice.");
		}

	}
	
	play(url)
	{
		this.dispatcher = this.connection.play(url);
		this.dispatcher.on('finished', function()
		{
			console.log("Played " + url);
		});
		this.dispatcher.destroy();
	}

	disconnectVoice()
	{
		this.dispatcher.destroy();
		this.connection.disconnect();
	}

 	connected()
	{
		this._isConnected = true;
	}

	notConnected()
	{
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