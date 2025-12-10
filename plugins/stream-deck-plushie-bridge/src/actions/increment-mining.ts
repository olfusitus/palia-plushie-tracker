import {
	streamDeck,
	action,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
	DidReceiveSettingsEvent
} from '@elgato/streamdeck';
import WebSocket from 'ws';

const miningTargets = [
	{ resource: 'mining_obsidian_kitsuu', name: 'Obsidian Kitsuu' },
	{ resource: 'mining_caldera_kitsuu', name: 'Caldera Kitsuu' },
	{ resource: 'mining_rainbow_kitsuu', name: 'Rainbow Kitsuu' }
];

function lookupMiningName(resource: string): string | undefined {
	const entry = miningTargets.find((item) => item.resource === resource);
	return entry?.name;
}

@action({ UUID: 'com.olfusitus.stream-deck-plushie-bridge.miningincrement' })
export class MiningCounter extends SingletonAction<MiningCounterSettings> {
	override onWillAppear(ev: WillAppearEvent<MiningCounterSettings>): void | Promise<void> {
		const { settings } = ev.payload;
		const displayName = lookupMiningName(settings.mining ?? '') ?? 'Unbekannt';

		let title = '';
		if (settings.show_name !== false) {
			title += displayName;
		}
		if (settings.show_counter !== false) {
			title += (title ? ` \n ` : '') + (settings.count ?? 0);
		}
		return ev.action.setTitle(title);
	}

	override async onDidReceiveSettings(
		ev: DidReceiveSettingsEvent<MiningCounterSettings>
	): Promise<void> {
		const { settings } = ev.payload;

		settings.count = (isNaN(Number(settings.count)) ? 0 : Number(settings.count)).toString();
		const displayName = lookupMiningName(settings.mining ?? '') ?? 'Unbekannt';
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

	override async onKeyDown(ev: KeyDownEvent<MiningCounterSettings>): Promise<void> {
		streamDeck.logger.info(`Mining key pressed!`);

		const { settings } = ev.payload;

		settings.count = (
			isNaN(Number(settings.count)) ? 0 : Number(settings.count) + (settings.incrementBy ?? 1)
		).toString();

		const displayName = lookupMiningName(settings.mining ?? '') ?? 'Unbekannt';

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
		socket.on('open', () => {
			socket.send(
				JSON.stringify({
					action: 'addEntry',
					resourceType: settings.mining,
					rareDrops: settings.is_plushie ? 1 : 0,
					incrementBy: settings.incrementBy
				})
			);
			socket.close();
		});
	}
}

type MiningCounterSettings = {
	count?: string;
	mining?: string;
	is_plushie?: boolean;
	incrementBy?: number;
	show_name?: boolean;
	show_counter?: boolean;
};
