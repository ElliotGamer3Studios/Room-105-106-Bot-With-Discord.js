module.exports = class Game
{
	constructor(gameID, channel, gameType)
	{
		this._gameID = "" + gameID;
		this._channel = channel;
		this._gameType = gameType;
		this._gameover = false;
		let fs = require('fs');
		this._JSON = JSON.parse(fs.readFileSync('gameClasses/json/games.json'));
	}

	get gameID()
	{ return this._gameID; }

	get gameType()
	{ return this._gameType; }

	get channel()
	{ return this._channel; }

	set channel(newChannel)
	{ this._channel = newChannel; }

	//required method that is overrided in child classes
	turn(message, args)
	{ }

	gameover()
	{
		return this._gameover;
	}

	toString()
	{
		return `Channel: ${this._channel} :: GameType: ${this._gameType}`;
	}

	info()
	{
		return `Channel: ${this._channel} :: GameType: ${this._gameType}`;
	}
};