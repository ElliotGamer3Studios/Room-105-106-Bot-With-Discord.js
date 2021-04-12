module.exports = class Streamdeck
{
	constructor(bot)
	{
		this._bot = bot;
		this._websocket = null;
		this._pluginUUID = null;
		this._DestinationEnum = Object.freeze({ "HARDWARE_AND_SOFTWARE": 0, "HARDWARE_ONLY": 1, "SOFTWARE_ONLY": 2 })
		this._timer;
		this._counterAction = {
			type: "com.elgato.counter.action",

			onKeyDown: function (context, settings, coordinates, userDesiredState)
			{

				timer = setTimeout(function ()
				{
					var updatedSettings = {};
					updatedSettings["keyPressCounter"] = -1;

					counterAction.SetSettings(context, updatedSettings);
					counterAction.SetTitle(context, 0);
				}, 1500);
			},

			onKeyUp: function (context, settings, coordinates, userDesiredState, bot)
			{

				clearTimeout(timer);

				var keyPressCounter = 0;
				if (settings != null && settings.hasOwnProperty('keyPressCounter'))
				{
					keyPressCounter = settings["keyPressCounter"];
				}

				keyPressCounter++;

				updatedSettings = {};
				updatedSettings["keyPressCounter"] = keyPressCounter;

				this.SetSettings(context, updatedSettings);

				this.SetTitle(context, keyPressCounter);
				bot.channels.fetch("693142072017813658").send(keyPressCounter);
			},

			onWillAppear: function (context, settings, coordinates)
			{

				var keyPressCounter = 0;
				if (settings != null && settings.hasOwnProperty('keyPressCounter'))
				{
					keyPressCounter = settings["keyPressCounter"];
				}

				this.SetTitle(context, keyPressCounter);
			},

			SetTitle: function (context, keyPressCounter)
			{
				var json = {
					"event": "setTitle",
					"context": context,
					"payload": {
						"title": "" + keyPressCounter,
						"target": DestinationEnum.HARDWARE_AND_SOFTWARE
					}
				};

				websocket.send(JSON.stringify(json));
			},

			SetSettings: function (context, settings)
			{
				var json = {
					"event": "setSettings",
					"context": context,
					"payload": settings
				};

				websocket.send(JSON.stringify(json));
			}
		}
	}





	connectElgatoStreamDeckSocket(inPort, inPluginUUID, inRegisterEvent, inInfo)
	{
		pluginUUID = inPluginUUID

		// Open the web socket
		websocket = new WebSocket("ws://127.0.0.1:" + inPort);

		function registerPlugin(inPluginUUID)
		{
			var json = {
				"event": inRegisterEvent,
				"uuid": inPluginUUID
			};

			websocket.send(JSON.stringify(json));
		};

		websocket.onopen = function ()
		{
			// WebSocket is connected, send message
			registerPlugin(pluginUUID);
		};

		websocket.onmessage = function (evt)
		{
			// Received message from Stream Deck
			var jsonObj = JSON.parse(evt.data);
			var event = jsonObj['event'];
			var action = jsonObj['action'];
			var context = jsonObj['context'];

			if (event == "keyDown")
			{
				var jsonPayload = jsonObj['payload'];
				var settings = jsonPayload['settings'];
				var coordinates = jsonPayload['coordinates'];
				var userDesiredState = jsonPayload['userDesiredState'];
				counterAction.onKeyDown(context, settings, coordinates, userDesiredState);
			}
			else if (event == "keyUp")
			{
				var jsonPayload = jsonObj['payload'];
				var settings = jsonPayload['settings'];
				var coordinates = jsonPayload['coordinates'];
				var userDesiredState = jsonPayload['userDesiredState'];
				counterAction.onKeyUp(context, settings, coordinates, userDesiredState, this._bot);

			}
			else if (event == "willAppear")
			{
				var jsonPayload = jsonObj['payload'];
				var settings = jsonPayload['settings'];
				var coordinates = jsonPayload['coordinates'];
				counterAction.onWillAppear(context, settings, coordinates);
			}
		};

		websocket.onclose = function ()
		{
			// Websocket is closed
		};
	};
}