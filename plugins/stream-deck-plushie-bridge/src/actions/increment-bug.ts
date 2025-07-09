import {
	streamDeck,
	action,
	KeyDownEvent,
	SingletonAction,
	WillAppearEvent,
	DidReceiveSettingsEvent
} from '@elgato/streamdeck';
import WebSocket from 'ws';

const bugNames = [
	{ bug: 'bug_rtb', name: 'Regenbogen-\nFalter' },
	{ bug: 'bug_ladybug', name: 'Marienkäfer' },
	{ bug: 'bug_snail', name: 'Schnecke' },
	{ bug: 'bug_lunar_fairy_moth', name: 'Mondfee-\nMotte' },
	{ bug: 'bug_proudhorn_beetle', name: 'Stolzhorn-\nKäfer' },
	{ bug: 'bug_lanternbug', name: 'Laternenkäfer' },
	{ bug: 'bug_rockhopper', name: 'Felsenhüpfer' }
];

function lookupBugName(bug: string): string | undefined {
	const entry = bugNames.find((item) => item.bug === bug);
	return entry?.name;
}

@action({ UUID: 'com.olfusitus.stream-deck-plushie-bridge.bugincrement' })
export class BugCounter extends SingletonAction<BugCounterSettings> {
	override onWillAppear(ev: WillAppearEvent<BugCounterSettings>): void | Promise<void> {
		const { settings } = ev.payload;
		const displayName = lookupBugName(settings.bug ?? '') ?? 'Unbekannt';

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
		ev: DidReceiveSettingsEvent<BugCounterSettings>
	): Promise<void> {
		const { settings } = ev.payload;

		settings.count = (isNaN(Number(settings.count)) ? 0 : Number(settings.count)).toString();
		const displayName = lookupBugName(settings.bug ?? '') ?? 'Unbekannt';
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

	override async onKeyDown(ev: KeyDownEvent<BugCounterSettings>): Promise<void> {
		streamDeck.logger.info(`Key pressed!`);

		const { settings } = ev.payload;

		settings.count = (
			isNaN(Number(settings.count)) ? 0 : Number(settings.count) + (settings.incrementBy ?? 1)
		).toString();

		const displayName = lookupBugName(settings.bug ?? '') ?? 'Unbekannt';

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
				JSON.stringify({
					action: 'addEntry',
					resourceType: settings.bug,
					rareDrops: settings.is_plushie ? 1 : 0,
					incrementBy: settings.incrementBy,
					size: settings.bugSize ? settings.bugSize : ''
				})
			);
			socket.close();
		});
	}
}

type BugCounterSettings = {
	count?: string;
	bug?: string;
	bugSize?: string;
	is_plushie?: boolean;
	incrementBy?: number;
	show_name?: boolean;
	show_counter?: boolean;
};

