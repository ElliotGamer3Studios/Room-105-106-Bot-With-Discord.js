const _Hangman = require("./hangman.js");
module.exports = class Game
{
	constructor(message, args, gameType)
	{
		this._message = message;
		this._args = args;
		this._gameover = false;
		switch (gameType.toLowerCase())
		{
			case 'hangman':
				this._game = new _Hangman(this._message, this._args[0], this._args[1]);
			default:
				this._game = undefined;
		}
	}

	get game()
	{
		return this._game;
	}

	gameover()
	{
		if (typeof this._game !== 'undefined')
		{
			return this._game.gameover();
		}
	}

	turn(message, args)
	{
		if (typeof this._game !== 'undefined')
		{
			this._game.turn(message, args);
		}
	}

	toString()
	{
		if (typeof this._game !== 'undefined')
		{
			return this._game.toString();
		}
		return undefined;
	}
};