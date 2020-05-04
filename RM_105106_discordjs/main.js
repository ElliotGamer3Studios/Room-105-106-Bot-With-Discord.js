const Discord = require("discord.js");
const Events = require("events");
const fs = require("fs");
const Game = require("./gameClasses/game.js");
const Hangman = require("./gameClasses/hangman.js");
const TimerEmitter = new Events.EventEmitter();
const CommandEmitter = new Events.EventEmitter();
const GameEmitter = new Events.EventEmitter();
const Bot = new Discord.Client();
const auth = require("./json/auth.json");
const config = readJSON("./json/config.json");


let commandList = [
	"help",
	"ping",
	"timer",
	"game",
	"hangman"
]
let games = [];

// Game events

GameEmitter.on("game", function (message, args) 
{
	_game(message, args);
});

GameEmitter.on("display", function (channel, gameIndex, gameList) 
{
	_game(message, args);
});

GameEmitter.on("endGame", function (gameList, gameIndex)
{
	_endGame(gameList, gameIndex);
});

// Game Functions

function checkGameAt(gameList, index)
{
	if (!(typeof gameList[index] === 'undefined') && gameList[index].gameover())
	{
		GameEmitter.emit("endGame", gameList, index);
	}
}

function getGameIndex(gameList, gameId)
{
	let index = -1;

	for (let i = 0; i < gameList.length; i++)
	{
		if (!(typeof gameList[i] === 'undefined') && (parseInt(gameList[i].gameID) === parseInt(gameId)))
		{
			index = i;
		}
	}
	return index;
}

function getGame(gameList, gameID)
{
	if (getGameIndex(gameList, gameID) === -1)
	{
		return undefined;
	}
	return gameList[getGameIndex(gameList, gameID)];

}

function checkGames(gameList)
{
	for (let i = 0; i < gameList.length; i++)
	{
		checkGameAt(gameList, i);
	}
}

// Game Callbacks

function _endGame(gameList, gameIndex)
{
	gameList.splice(gameIndex, 1, undefined);
}

let stopwatch = {
	timers: [],
	names: [],
	messages: [],
	handle: [],
	length: 0,
	push(timer, name, message)
	{
		this.timers.push(timer);
		this.names.push(name);
		this.messages.push(message);
		return this.length++;
	},
	pop()
	{
		if (this.length > 0)
		{
			this.length--;
			return {
				name: this.names.pop(),
				timer: this.timers.pop(),
				message: this.messages.pop(),
			};
		}
		return { name: "undefined", timer: "undefined", message: "undefined" };
	},
	at(index)
	{
		if (index < 0 || index >= this.length)
		{
			return {
				name: "undefined",
				timer: "undefined",
				message: "undefined",
			};
		}
		return {
			name: this.names[index],
			timer: this.timers[index],
			message: this.messages[index],
		};
	},
};

// Timer events

TimerEmitter.on("start", function (timerIndex)
{
	_timerStart(timerIndex);
});
TimerEmitter.on("end", function (timerIndex)
{
	_timerEnd(timerIndex);
});

// Timer Functions

function startTimer(time, name, message)
{
	// min:sec
	return (timerIndex = stopwatch.push(time, name, message));
}

// Timer Callback Functions

function _timerStart(timerIndex)
{
	stopwatch.handle[timerIndex] = setInterval(function ()
	{
		TimerEmitter.emit("end", timerIndex);
	}, stopwatch.timers[timerIndex] * 1000);
}

function _timerEnd(timerIndex)
{
	clearInterval(stopwatch.handle[timerIndex]);
	let timer = stopwatch.at(timerIndex);
	console.log(`Timer ${timer.name} has finished.`);
	timer.message.reply(`Timer ${timer.name} has finished.`);
}

// Command Events

CommandEmitter.on('game', function (message, args) 
{
	_game(message, args);
	checkGames(games);
});
CommandEmitter.on('hangman', function (message, args) 
{
	_hangman(message, args);
});
CommandEmitter.on("help", function (message, args)
{
	_help(message, args[0]);
});
CommandEmitter.on("ping", function (message)
{
	_ping(message);
});
CommandEmitter.on("timer", function (message, args)
{
	_timer(message, args.shift(), args.join(" "));
});
CommandEmitter.on("prefix", function (message, args)
{
	_prefix(message, args.shift());
});

// Command Functions

function readJSON(filename)
{
	return JSON.parse(fs.readFileSync(filename));
}

function writeJSON(filename, JSONobj)
{
	fs.writeFileSync(filename, JSON.stringify(JSONobj));
}

function isString(value) 
{
	return typeof value === 'string';
}

function isValidPrefix(prefix)
{
	let exemptChars = "\\;";
	let isUndefined = typeof prefix === "undefined";
	let isExemptChar = exemptChars.includes(prefix);
	return !isUndefined && !isExemptChar;
}

function setPrefix(newPrefix)
{
	if (isValidPrefix(newPrefix))
	{
		config.prefix = newPrefix;
		writeJSON("./json/config.json");
	}
	return config.prefix;
}

function listCommands()
{
	list = 'Commands:';
	for (let i = 0; i < commandList.length; i++)
	{
		list += `\n${config.prefix}${commandList[i]}`;
	}
	return list;
}

// Command Callback Functions

function _hangman(message, args, gameID = games.length + 1)
{
	message.channel.send(`Your game number is ${games.push(new Hangman(gameID, message.channel, args[0]))}`);
}

function _help(message, args)
{
	let response = "";
	switch (args)
	{
		case "game":
			response = config.prefix + "game <gameNumber> [gameAction] :: Does [gameAction] in game <gameNumber>.";
			response += config.prefix + "game <gameNumber> :: Shows info about game <gameNumber>.";
			response += "\nExample: ~game 1 a\nExample: ~game 2 apple\nExample: ~game 3";
			break;
		case "hangman":
			response = config.prefix + "hangman [guesses] :: Starts a new hangman game (Default Guesses = 5).";
			break;
		case "help":
			response = config.prefix + "help [command] :: Shows additional info about [command].\n";
			response += config.prefix + "help :: Shows all commands.";
			break;
		case "ping":
			response = config.prefix + "ping :: Pings the bot.";
			break;
		case "timer":
			response = config.prefix + "timer <name> <length> :: Sets a timer named <name> for <length> seconds.";
			break;
		default:
			response = listCommands();
			break;
	}
	console.log(response);
	message.channel.send(response);
}

function _ping(message)
{
	console.log("pinged " + message.channel);
	message.reply("pong");
}

function _prefix(message, newPrefix)
{
	message.channel.send(setPrefix(newPrefix));
}

function _game(message, args)
{
	let game = undefined;
	let arg1 = args.shift();
	game = getGame(games, parseInt(arg1));
	let gameAction = args.filter(isString);
	if (typeof game === 'undefined')
	{
		console.log('Not a game');
	}
	else if (gameAction.length <= 0)
	{
		message.channel.send(game.toString());
		console.info(game.info());
	}
	else
	{
		game.turn(message.channel, gameAction[0]);
	}
}

function _timer(message, name, time)
{
	time = typeof parseInt(time) !== "number" ? 60 : parseInt(time);
	name = typeof name === "undefined" ? parseInt(stopwatch.length) : name;
	TimerEmitter.emit("start", startTimer(time, name, message));
	console.log(`Timer ${name} set for ${time} seconds`);
	message.reply(`Timer ${name} set for ${time} seconds`);
}

// Bot Events

Bot.on("ready", function ()
{
	_botReady();
});
Bot.on("message", function (message)
{
	if (!message.author.bot)
	{
		_botMessaged(message);
	}
});
Bot.on("warn", function (warning)
{
	_botWarned(warning);
});
Bot.on("emojiDelete", function (guild_emoji)
{
	_botEmojiDeleted(guild_emoji);
});
Bot.on("disconnect", function (evt, error)
{
	_botDisconnected(error);
});

// Bot Functions

Bot.setInterval(function () { checkGames(games); }, 3600000); //runs every hour
Bot.login(auth.token);

// Bot Callback Functions

function _botWarned(warning)
{
	console.warn(warning);
}

function _botReady()
{
	console.log("Ready at " + new Date().toString());
}

function _botMessaged(message)
{
	let messageArr = message.content.split(" ");
	if (messageArr[0].indexOf(config.prefix) === 0)
	{
		let command = messageArr
			.shift()
			.replace(config.prefix, "")
			.toLowerCase();
		let args = messageArr;
		switch (command)
		{
			case 'game':
				CommandEmitter.emit('game', message, args);
				break;
			case 'hangman':
				CommandEmitter.emit('hangman', message, args);
				break;
			case "help":
				CommandEmitter.emit("help", message, args);
				break;
			case "ping":
				CommandEmitter.emit("ping", message, args);
				break;
			case "timer":
				CommandEmitter.emit("timer", message, args);
			default:
				break;
		}
	}
}

function _botEmojiDeleted(guild_emoji)
{
	new Discord.GuildEmojiManager(guild_emoji.guild).create(
		guild_emoji.url,
		guild_emoji.name
	);
}

function _botDisconnected(error)
{
	console.log("Disconnected");
	console.error(error);
}
