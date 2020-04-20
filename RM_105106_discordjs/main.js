const Discord = require("discord.js");
const Events = require("events");
const fs = require("fs");
const Game = require("./gameClasses/game.js");
const TimerEmitter = new Events.EventEmitter();
const CommandEmitter = new Events.EventEmitter();
const GameEmitter = new Events.EventEmitter();
const Bot = new Discord.Client();
const auth = require("./json/auth.json");
const config = readJSON("./json/config.json");


let commandList = [
	"help",
	"ping",
	"timer"//,
	// "game",
	// "hangman"
]
let games = [];

// Game events

GameEmitter.on("newGame", function (message, args, gameType, gameList)
{
	_newGame(message, args, gameType, gameList);
});

GameEmitter.on("endGame", function (gameList, gameIndex)
{
	_endGame(gameList, gameIndex);
});

// Game Functions

function checkGames(gameList)
{
	for (let i = 0; i < gameList.length; i++)
	{
		if (gameList[i].game.gameover())
		{
			GameEmitter.emit("endGame", gameList, i);
		}
	}
}

// Game Callbacks


function _newGame(message, args, gameType, gameList)
{
	message.channel.send(`Your game number is ${gameList.push(new Game(message, args, gameType))}`);
}

function _endGame(gameList, gameIndex)
{
	gameList.splice(gameIndex, 1);
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

function _hangman(message, args)
{
	GameEmitter.emit('newGame', message, args, 'hangman', games);
}

function _help(message, args)
{
	let response = "";
	switch (args)
	{
		// case "game":
		// 	response = config.prefix + "game <gameNumber> <gameAction> :: Does <gameAction> in game <gameNumber>.";
		// 	break;
		// case "hangman":
		// 	response = config.prefix + "hangman <difficulty> [guesses] :: Starts a <difficulty> hangman game (Default Guesses = 5).";
		// 	break;
		case "help":
			response = config.prefix + "help [command] :: Shows additional info about [command]\n";
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
	if (typeof args[0] === 'number' && (args[0] >= 0 && args[0] < games.length))
	{
		games[args.shift() - 1].turn(message, args);
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
			// case 'game':
			// 	CommandEmitter.emit('game', message, args);
			// 	break;
			// case 'hangman':
			// 	CommandEmitter.emit('hangman', message, args);
			// 	break;
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
