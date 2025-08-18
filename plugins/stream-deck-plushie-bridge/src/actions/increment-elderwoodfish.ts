import { streamDeck, action, KeyDownEvent, SingletonAction, WillAppearEvent, DidReceiveSettingsEvent } from "@elgato/streamdeck";
import WebSocket from 'ws';

const fishNames = [
    { fish: 'fish_elderwood_waters', name: 'Elderwood-Fisch' },
    // { fish: 'fish_ponds', name: 'Teiche' },
];

function lookupFishName(fish: string): string | undefined {
    const entry = fishNames.find(
        (item) => item.fish === fish
    );
    return entry?.name;
}

@action({ UUID: "com.olfusitus.stream-deck-plushie-bridge.elderwoodfishincrement" })
export class ElderwoodFishCounter extends SingletonAction<ElderwoodFishCounterSettings> {
	override onWillAppear(ev: WillAppearEvent<ElderwoodFishCounterSettings>): void | Promise<void> {
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

	override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<ElderwoodFishCounterSettings>): Promise<void> {
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

	override async onKeyDown(ev: KeyDownEvent<ElderwoodFishCounterSettings>): Promise<void> {
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
				JSON.stringify({ action: 'addEntry', resourceType: settings.fish, rareDrops: settings.is_plushie ? 1 : 0, size: settings.type, incrementBy: settings.incrementBy }));
			socket.close();
		});
	}
}

type ElderwoodFishCounterSettings = {
	count?: string;
	fish?: string;
	type?: string;
	is_plushie?: boolean;
	incrementBy?: number;
	show_name?: boolean;
	show_counter?: boolean;
};