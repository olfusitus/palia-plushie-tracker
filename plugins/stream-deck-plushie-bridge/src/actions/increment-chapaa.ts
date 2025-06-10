import { streamDeck, action, KeyDownEvent, SingletonAction, WillAppearEvent, DidReceiveSettingsEvent } from "@elgato/streamdeck";
import WebSocket from 'ws';


const animalNames = [
    { animal: "animal_chapaa", size: "small", name: "Kleiner\nChapaa" },
    { animal: "animal_chapaa", size: "medium", name: "Mittlerer\nChapaa" },
    { animal: "animal_chapaa", size: "large", name: "Großer\nChapaa" },
	{ animal: "animal_ogopuu", size: "small", name: "Kleiner\nOgopuu" },
    { animal: "animal_ogopuu", size: "medium", name: "Mittlerer\nOgopuu" },
    { animal: "animal_ogopuu", size: "large", name: "Großer\nOgopuu" },
	{ animal: "animal_shmole", size: "small", name: "Kleiner\nShmole" },
    { animal: "animal_shmole", size: "medium", name: "Mittlerer\nShmole" },
    { animal: "animal_shmole", size: "large", name: "Großer\nShmole" },
    { animal: "animal_sernuk", size: "small", name: "Kleiner\nSernuk" },
    { animal: "animal_sernuk", size: "medium", name: "Mittlerer\nSernuk" },
    { animal: "animal_sernuk", size: "large", name: "Großer\nSernuk" },
    { animal: "animal_muujin", size: "small", name: "Kleiner\nMuujin" },
    { animal: "animal_muujin", size: "medium", name: "Mittlerer\nMuujin" },
    { animal: "animal_muujin", size: "large", name: "Großer\nMuujin" },

    // ...weitere Einträge...
];

// Lookup-Funktion
function lookupAnimalName(animal: string, size: string): string | undefined {
    const entry = animalNames.find(
        (item) => item.animal === animal && item.size === size
    );
    return entry?.name;
}

/**
 * An example action class that displays a count that increments by one each time the button is pressed.
 */
@action({ UUID: "com.olfusitus.stream-deck-plushie-bridge.chapaaincrement" })
export class ChapaaCounter extends SingletonAction<CounterSettings> {
	/**
	 * The {@link SingletonAction.onWillAppear} event is useful for setting the visual representation of an action when it becomes visible. This could be due to the Stream Deck first
	 * starting up, or the user navigating between pages / folders etc.. There is also an inverse of this event in the form of {@link streamDeck.client.onWillDisappear}. In this example,
	 * we're setting the title to the "count" that is incremented in {@link IncrementCounter.onKeyDown}.
	 */
	override onWillAppear(ev: WillAppearEvent<CounterSettings>): void | Promise<void> {
		return ev.action.setTitle(`${ev.payload.settings.animal} \n ${ev.payload.settings.count ?? 0}`);
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<CounterSettings>): Promise<void> {
		// Handle the settings changing in the property inspector (UI).
		const { settings } = ev.payload;

		settings.count = (isNaN(Number(settings.count)) ? 0 : Number(settings.count)).toString();
		const displayName = lookupAnimalName(settings.animal ?? "", settings.animal_size ?? "") ?? "Unbekannt";
		await ev.action.setSettings(settings);
		await ev.action.setTitle(`${displayName} \n ${settings.count}`);


	}
	/**
	 * Listens for the {@link SingletonAction.onKeyDown} event which is emitted by Stream Deck when an action is pressed. Stream Deck provides various events for tracking interaction
	 * with devices including key down/up, dial rotations, and device connectivity, etc. When triggered, {@link ev} object contains information about the event including any payloads
	 * and action information where applicable. In this example, our action will display a counter that increments by one each press. We track the current count on the action's persisted
	 * settings using `setSettings` and `getSettings`.
	 */
	override async onKeyDown(ev: KeyDownEvent<CounterSettings>): Promise<void> {
		streamDeck.logger.info(`Key pressed!`);

		const { settings } = ev.payload;

		settings.count = (isNaN(Number(settings.count)) ? 0 : Number(settings.count) + (settings.incrementBy ?? 1)).toString();

		const displayName = lookupAnimalName(settings.animal ?? "", settings.animal_size ?? "") ?? "Unbekannt";

		// Update the current count in the action's settings, and change the title.
		await ev.action.setSettings(settings);
		await ev.action.setTitle(`${displayName} \n ${settings.count}`);


		const socket = new WebSocket('ws://localhost:8422');
		streamDeck.logger.info(`Connecting to websocket...`);
		socket.on('open', () => {
			streamDeck.logger.info(`Websocket connected!`);

			socket.send(
				JSON.stringify({ action: 'addEntry', resourceType: settings.animal, size: settings.animal_size, rareDrops: settings.is_plushie ? 1 : 0, incrementBy: settings.incrementBy }));
			socket.close();
		});



	}
}

/**
 * Settings for {@link IncrementCounter}.
 */
type CounterSettings = {
	count?: string;
	animal?: string;
	animal_size?: string;
	is_plushie?: boolean;
	incrementBy?: number;
};
