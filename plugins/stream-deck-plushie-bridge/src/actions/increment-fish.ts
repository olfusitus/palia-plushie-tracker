import { streamDeck, action, KeyDownEvent, SingletonAction, WillAppearEvent, DidReceiveSettingsEvent } from "@elgato/streamdeck";
import WebSocket from 'ws';

const fishNames = [
    { fish: 'fish_kilima_waters', name: 'Kilima-Gewässer' },
    { fish: 'fish_ponds', name: 'Teiche' },
];

function lookupFishName(fish: string): string | undefined {
    const entry = fishNames.find(
        (item) => item.fish === fish
    );
    return entry?.name;
}

@action({ UUID: "com.olfusitus.stream-deck-plushie-bridge.fishincrement" })
export class FishCounter extends SingletonAction<FishCounterSettings> {
	override onWillAppear(ev: WillAppearEvent<FishCounterSettings>): void | Promise<void> {
		const { settings } = ev.payload;
		const displayName = lookupFishName(settings.fish ?? '') ?? 'Unbekannt';

		let title = '';
		if (settings.show_name !== false) {
			title += displayName;
		}
		if (settings.show_counter !== false) {
			title += (title ? ` \n ` : '') + (settings.count ?? 0);
		}
		return ev.action.setTitle(title);
	}

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<FishCounterSettings>): Promise<void> {
		const { settings } = ev.payload;

		settings.count = (isNaN(Number(settings.count)) ? 0 : Number(settings.count)).toString();
		const displayName = lookupFishName(settings.fish ?? '') ?? 'Unbekannt';
		await ev.action.setSettings(settings);

		let title = '';
		if (settings.show_name !== false) {
			title += displayName;
		}
		if (settings.show_counter !== false) {
			title += (title ? ` \n ` : '') + (settings.count ?? 0);
		}
		await ev.action.setTitle(title);
	}

	override async onKeyDown(ev: KeyDownEvent<FishCounterSettings>): Promise<void> {
		streamDeck.logger.info(`Key pressed!`);

		const { settings } = ev.payload;

		settings.count = (isNaN(Number(settings.count)) ? 0 : Number(settings.count) + (settings.incrementBy ?? 1)).toString();

		const displayName = lookupFishName(settings.fish ?? '') ?? 'Unbekannt';

		await ev.action.setSettings(settings);

		let title = '';
		if (settings.show_name !== false) {
			title += displayName;
		}
		if (settings.show_counter !== false) {
			title += (title ? ` \n ` : '') + (settings.count ?? 0);
		}
		await ev.action.setTitle(title);


		const socket = new WebSocket('ws://localhost:8422');
		// streamDeck.logger.info(`Connecting to websocket...`);
		socket.on('open', () => {
			// streamDeck.logger.info(`Websocket connected!`);

			socket.send(
				JSON.stringify({ action: 'addEntry', resourceType: settings.fish, rareDrops: settings.is_plushie ? 1 : 0, incrementBy: settings.incrementBy }));
			socket.close();
		});
	}
}

type FishCounterSettings = {
	count?: string;
	fish?: string;
	is_plushie?: boolean;
	incrementBy?: number;
	show_name?: boolean;
	show_counter?: boolean;
};