const Game = require('../game.js');
module.exports = class TicTacToe extends Game
{
	constructor(gameID, channel, players)
	{
		super(gameID, channel, 'tictactoe');
		this._symbols = this._JSON['tictactoe']["symbols"];
		this._players = players;
		this._playerOne = players[0];
		this._playerTwo = players[1];
		this._currentPlayer = this._playerOne;
		this._playerOneSymbol = this._symbols[0];
		this._playerTwoSymbol = this._symbols[1];
	}

	turn(message, args)
	{
		this._channel = message.channel;
	}

	isValidMove()
	{

	}

	isValidPlayer()
	{

	}

	isCurrentPlayer()
	{

	}

	playMove(move)
	{

	}

	checkForWin()
	{

	}

}