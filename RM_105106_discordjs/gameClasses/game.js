module.exports = class Game
{
	constructor(channel, gameType)
	{
		this._channel = channel;
		this._gameType = gameType;
	}

	get gameType()
	{ return this._gameType; }

	get channel()
	{ return this._channel; }

	set channel(newChannel)
	{ this._channel = newChannel; }

	info()
	{
		return `Channel: ${this._channel} :: GameType: ${this._gameType}`;
	}

};