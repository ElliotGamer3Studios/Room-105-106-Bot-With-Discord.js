const auth = require("./json/auth.json");
const Discord = require("discord.js");
const fs = require("fs");
const Events = require("events");
const GameManager = require("./gameClasses/gameManager.js");
const VoiceManager = require("./botClasses/voice/botVoice.js");

const TimerEmitter = new Events.EventEmitter();
const CommandEmitter = new Events.EventEmitter();
const Bot = new Discord.Client();
const config = readJSON("./json/config.json");
let gameManager = new GameManager();
let voiceManager = new VoiceManager()

let commandList = [
	"help",
	"ping",
	"timer",
	"game",
	"hangman",
	"tictactoe",
	"play",
	"disconnect"
]
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
	console.log(gameManager.checkGames());
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
CommandEmitter.on('tictactoe', function (message, args) 
{
	_tictactoe(message, args);
});
CommandEmitter.on("timer", function (message, args)
{
	_timer(message, args.shift(), args.join(" "));
});
CommandEmitter.on("prefix", function (message, args)
{
	_prefix(message, args.shift());
});
CommandEmitter.on("play", function (message, args)
{
	_play(message, args.shift());
});
CommandEmitter.on("disconnect", function (message, args)
{
	_disconnect();
});
CommandEmitter.on("moveUsers", function (message, args)
{
	_moveUsers(message, args);
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

function _game(message, args)
{
	let game = undefined;
	let gameID = args.shift();
	game = gameManager.getGameById(gameID);
	let gameAction = args.filter(isString);
	if (typeof game === 'undefined')
	{
		message.channel.send(`That game does not exist.`);
		console.log(`Not a game::${gameID}`);
	}
	else if (gameAction.length <= 0)
	{
		message.channel.send(game.toString());
		console.info(game.info());
	}
	else
	{
		game.turn(message, gameAction[0]);
	}
}
function _hangman(message, args)
{
	message.channel.send(`Your gameID is ${gameManager.newHangman(message.channel, args[0], (/^ [0 - 9] * $/.test(args[1])) ? args[1] : 5)}`);
}
function _help(message, args)
{
	let response = "";
	switch (args)
	{
		case "game":
			response = config.prefix + "game <gameID> [gameAction] :: Does [gameAction] in game <gameID>.";
			response += config.prefix + "game <gameID> :: Shows info about game <gameID>.";
			response += "\nExample: ~game 1 a\nExample: ~game myGame apple\nExample: ~game 3";
			break;
		case "hangman":
			response = config.prefix + "hangman [gameID] [guesses] :: Starts a new hangman game with id [gameID] (Default Guesses = 5).";
			response += "\nExample: ~hangman lynching\nExample: ~hangman myGame 5\nExample: ~hangman";
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
function _play(message, media)
{

	//RM_105106_discordjs\media\audio\test.mp3
	if (!voiceManager.isConnected())
	{
		voiceManager.joinVoice(message).then(function(media) 
			{
				voiceManager.connected();
				console.log(media);
				voiceManager.play(media);
			},
			function(reason)
			{
				console.log(reason);
				voiceManager.notConnected();
			});
	}
}

function _disconnect()
{
	voiceManager.disconnectVoice();
}

function _prefix(message, newPrefix)
{
	message.channel.send(setPrefix(newPrefix));
}
function _tictactoe(message, args)
{
	let filter = function (reaction, user)
	{
		return (reaction.emoji.name === ':ok:') && (!user.bot) && (user !== message.author)
	};
	let options =
	{
		time: 60000,
		max: 1,
		maxEmojis: 1,
		maxUsers: 1
	}
	message.react('🆗');
	//gets first reactor userid
	let firstReact = message.awaitReactions(filter, options);
	let players = [message.author.id, firstReact.user.id];
	message.channel.send(`Your gameID is ${gameManager.newTicTacToe(message.channel, args[0], players)}`);
}
function _timer(message, name, time)
{
	time = typeof parseInt(time) !== "number" ? 60 : parseInt(time);
	name = typeof name === "undefined" ? parseInt(stopwatch.length) : name;
	TimerEmitter.emit("start", startTimer(time, name, message));
	console.log(`Timer ${name} set for ${time} seconds`);
	message.reply(`Timer ${name} set for ${time} seconds`);
}
function _moveUsers(message, args)
{
	let voice_channel = new Voice_channel(message.member.voice.channel);
	voice_channel.moveUsers(args[1]);
}

// Bot Events

Bot.on("ready", function ()
{
	_botReady();
});
Bot.on("rateLimit", function (rateLimitInfo)
{
	_botRateLimit(rateLimitInfo);
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

Bot.login(auth.token);

// Bot Callback Functions

function _botWarned(warning)
{
	console.warn(warning);
}
function _botRateLimit(rateLimitInfo)
{
	Bot.setTimeout(function () { console.log(`Rate Limited for ${rateLimitInfo.timeout}.`); }, rateLimitInfo.timeout);
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
			// case 'tictactoe':
			// 	CommandEmitter.emit('tictactoe', message, args);
			// 	break;
			case "help":
				CommandEmitter.emit("help", message, args);
				break;
			case "ping":
				CommandEmitter.emit("ping", message, args);
				break;
			case "timer":
				CommandEmitter.emit("timer", message, args);
				break;
			// case "moveUsers":
			// 	CommandEmitter.emit("moveUsers", message, args);
			// 	break;
			case "play":
				CommandEmitter.emit("play", message, args);
				break;
			case "disconnect":
				CommandEmitter.emit("disconnect", message, args);
				break;
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
