module.exports = class Voice_channel
{
	constructor(voiceChannel)
	{
		this._voiceChannel = voiceChannel;
	}
	constructor(bot, voiceChannel)
	{
		this._voiceChannel = voiceChannel;
		this._bot = bot;
	}

	getUsers(voiceChannel = this._voiceChannel)
	{
		return voiceChannel.members;
	}

	moveUser(voiceChannel, user = undefined)
	{
		if (typeof user !== 'undefined' && !voiceChannel.members.has(user))
		{
			user.voice.setChannel(voiceChannel);
		}
	}

	moveUsers(voiceChannel = this._voiceChannel, users = this.getUsers())
	{
		users.each(function (user) { this.moveUser(voiceChannel, user); });
	}


}