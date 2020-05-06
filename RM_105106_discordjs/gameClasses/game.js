module.exports = class Game
{
	constructor(gameID, channel, gameType)
	{
		this._gameID = "" + gameID;
		this._channel = channel;
		this._gameType = gameType;
	}

	get gameID()
	{ return this._gameID; }

	get gameType()
	{ return this._gameType; }

	get channel()
	{ return this._channel; }

	set channel(newChannel)
	{ this._channel = newChannel; }

	turn(channel, args)
	{ }

	info()
	{
		return `Channel: ${this._channel} :: GameType: ${this._gameType}`;
	}

	toString()
	{
		return `Channel: ${this._channel} :: GameType: ${this._gameType}`;
	}

};