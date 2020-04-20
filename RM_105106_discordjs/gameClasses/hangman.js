module.exports = class Hangman
{
	constructor(message, difficulty = 'normal', guesses = 5)
	{
		let fs = require('fs');
		this._gameover = false;
		this._guessesLeft = guesses;
		this._guessedLetters = "";
		this._message = message;
		this._HangmanJSON = JSON.parse(fs.readFileSync('json/games.json'));
		this._words = this._HangmanJSON['hangman']['words']
		this._word = this._words[parseInt(Math.random() % this._words.length - 1)].toLowerCase();
		this._hiddenWord = '*'.repeat(this._word.length);
		this._chars = [];
		for (let i = 0; i < this._word.length; i++)
		{ this._chars[i] = this._word.charAt(i); }

		message.channel.send(this.toString());

	}

	// required methods

	gameover()
	{
		return this._gameover;
	}

	turn(message, args)
	{
		if (args[0].length === 1)
		{
			this.guessLetter(args[0].toLowerCase());
		}
		else if (args[0].length >= 2)
		{
			this.guessWord(args[0].toLowerCase());
		}
		message.channel.send(this.toString());
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
			this._message.channel.send(`You win. the word was ${this._word}.`);
		}
		else
		{
			this._message.channel.send(`You lose. the word was ${this._word}.`);
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
				this._hiddenWord[i] = letter;
				findCount++;
			}
		}

		if (findCount === 0)
		{
			this._guessesLeft--;
			this._message.reply(`${letter} is incorrect.`);
		}
		else
		{
			this._message.reply(`${letter} is correct.`);
		}

		if (this.hasLost())
		{
			this._message.channel.send(`You loss. the word was ${this._word}.`);
			this._gameover = true;
		}
		else if (this.hasWon())
		{
			this._message.channel.send(`You win. the word was ${this._word}.`);
			this._gameover = true;
		}
		else
		{
			this._message.channel.send(this.toString());
		}

	}

};