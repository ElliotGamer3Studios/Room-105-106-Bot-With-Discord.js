const Game = require('./game.js');
module.exports = class Hangman extends Game
{
	constructor(gameID, channel, guesses = 5)
	{
		super(channel, 'hangman');
		this._gameID = "" + gameID;
		let fs = require('fs');
		this._channel = channel;
		this._gameover = false;
		this._guessesLeft = guesses;
		this._guessedLetters = "";
		this._HangmanJSON = JSON.parse(fs.readFileSync('json/games.json'));
		this._words = this._HangmanJSON['hangman']['words']
		this._word = this._words[parseInt(Math.floor(Math.random() * this._words.length))].toLowerCase();
		this._hiddenWord = '-'.repeat(this._word.length);
		this._chars = Array.from(this._word);
		this._channel.send(this.toString());
	}

	get hiddenWord()
	{
		return this._hiddenWord;
	}

	// required methods

	get gameID()
	{ return this._gameID; }

	gameover()
	{
		return this._gameover;
	}

	turn(channel, args)
	{
		this._channel = channel;
		let guess = args.toString();
		if (guess.length === 1)
		{
			this.guessLetter(guess.toLowerCase());
		}
		else if (guess.length >= 2)
		{
			this.guessWord(guess.toLowerCase());
		}
	}

	toString()
	{
		return `Hangman\nGuesses Left: ${this._guessesLeft}\nAlready Guessed: \n${this._guessedLetters}\nWord: ${this._hiddenWord}`;
	}

	//game specific methods

	hasWon()
	{
		return this._hiddenWord.toLowerCase() === this._word.toLowerCase();
	}

	hasLost()
	{
		return this._guessesLeft == 0 && (this._hiddenWord.toLowerCase() !== this._word.toLowerCase());
	}

	guessWord(word)
	{
		console.log(word);
		if (this._word.toLowerCase() === word.toLowerCase())
		{
			this._channel.send(`You win. The word was ${this._word}.`);
		}
		else
		{
			this._channel.send(`You lose. The word was ${this._word}.`);
		}
		this._gameover = true;
	}

	guessLetter(letter)
	{
		console.log(letter);
		letter = letter.toLowerCase();
		let findCount = 0;
		this._guessedLetters += letter + ' ';
		for (let i = 0; i < this._chars.length; i++)
		{
			if (letter === this._chars[i])
			{
				this._hiddenWord = this._hiddenWord.slice(0, i) + letter + this._hiddenWord.substr(i + 1);
				findCount++;
			}
		}

		if (findCount === 0)
		{
			this._guessesLeft--;
			this._channel.send(`${letter} is incorrect.`);
		}
		else
		{
			this._channel.send(`${letter} is correct.`);
		}

		if (this.hasLost())
		{
			this._channel.send(`You lose. The word was ${this._word}.`);
			this._gameover = true;
		}
		else if (this.hasWon())
		{
			this._channel.send(`You win. The word was ${this._word}.`);
			this._gameover = true;
		}
		else
		{
			this._channel.send(this.toString());
		}

	}

};