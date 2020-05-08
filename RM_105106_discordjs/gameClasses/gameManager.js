const Games = require('./games');
module.exports = class GameManager
{
	constructor()
	{
		this._GameArray = [];
	}

	get gameArray()
	{
		return this._GameArray;
	}

	getEmptyIndex()
	{
		return this._GameArray.findIndex(function (game) { return typeof game === 'undefined'; });
	}
	getGameById(id)
	{
		return this._GameArray.find(function (game) { return game.gameID === "" + id; });
	}
	getGameByIndex(index)
	{
		return this._GameArray.find(function (game, currIndex) { return currIndex === index; });
	}

	//creates a unique id and returns it
	getUniqueId()
	{
		let id = "" + (this.getEmptyIndex() === -1) ? this._GameArray.length + 1 : this.getEmptyIndex();
		let uniqueId = "" + id;
		let count = 1;
		while (!this.isUniqueId(uniqueId))
		{
			uniqueId = "" + id + count;
			count++;
		}
		return uniqueId;
	}

	//checks is the given id exists already
	isUniqueId(id)
	{
		return typeof this.getGameById(id) === 'undefined';
	}

	//turns an id into a unique id and returns it
	makeUnique(id)
	{
		let uniqueId = "" + id;
		let count = 1;
		while (!this.isUniqueId(uniqueId))
		{
			uniqueId = "" + id + count;
			count++;
		}
		return uniqueId;
	}

	//returns an array of all the active games
	checkGames()
	{
		this._GameArray = this._GameArray.filter(function (game) { return (typeof game !== 'undefined') && !game.gameover(); });
		return this._GameArray;
	}

	//pushes at end if no empty spots are found
	//returns the length of the array 
	//length will only change if no empty elements are found
	push(game)
	{
		if (this.getEmptyIndex() === -1)
		{
			this._GameArray.push(game);
		}
		else
		{
			this._GameArray[this.getEmptyIndex()] = game;
		}
		return this._GameArray.length;
	}

	//makes a new hangman game and adds it to the array
	//returns the validated gameID
	newHangman(channel, gameId = this.getUniqueId(), guesses = 5)
	{
		let uniqueGameId = this.makeUnique(gameId);
		this.push(new Games.Hangman(uniqueGameId, channel, guesses));
		return uniqueGameId;
	}

	//makes a new tictactoe game and adds it to the array
	//returns the validated gameID
	newTicTacToe(channel, gameId = this.getUniqueId(), players)
	{
		let uniqueGameId = this.makeUnique(gameId);
		this.push(new Games.TicTacToe(uniqueGameId, channel, players));
		return uniqueGameId;
	}

}