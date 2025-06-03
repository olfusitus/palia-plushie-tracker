import type { Resource } from './storage';

export const resources: Resource[] = [
	{
		type: 'ore_gold',
		name: 'Gold',
		sizes: {
			small: [0, 1],
			medium: [0, 1, 2],
			large: [0, 1, 2, 3]
		},
		labels: {
			small: 'S',
			medium: 'M',
			large: 'L'
		}
	},
	{
		type: 'ore_silver',
		name: 'Silver',
		sizes: {
			small: [0, 1],
			medium: [0, 1, 2],
			large: [0, 1, 2, 3]
		},
		labels: {
			small: 'S',
			medium: 'M',
			large: 'L'
		}
	},
	{
		type: 'animal_chapaa',
		name: 'Chapaa',
		sizes: {
			small: [0, 1],
			medium: [0, 1],
			large: [0, 1]
		},
		labels: {
			small: 'Gefleckt',
			medium: 'Gestreift',
			large: 'Azur'
		}
	},
	{
		type: 'animal_sernuk',
		name: 'Sernuk',
		sizes: {
			small: [0, 1],
			medium: [0, 1],
			large: [0, 1]
		},
		labels: {
			small: 'Sernuk',
			medium: 'Älter',
			large: 'Stolzgehörnt'
		}
	},
	{
		type: 'animal_muujin',
		name: 'Muujin',
		sizes: {
			small: [0, 1],
			medium: [0, 1],
			large: [0, 1]
		},
		labels: {
			small: 'Muujin',
			medium: 'Gebändert',
			large: 'Blaugeborstet'
		}
	},
	{
		type: 'animal_ogopuu',
		name: 'Ogopuu',
		sizes: {
			small: [0, 1],
			medium: [0, 1],
			large: [0, 1]
		},
		labels: {
			small: 'Ogopuu',
			medium: 'Smaragd',
			large: 'Wellenrücken'
		}
	},
	{
		type: 'animal_shmole',
		name: 'Shmole',
		sizes: {
			small: [0, 1],
			medium: [0, 1],
			large: [0, 1]
		},
		labels: {
			small: 'Shmole',
			medium: 'Holunder',
			large: 'Piksii'
		}
	},
	{
		type: 'bug_rtb',
		name: 'Regenbogenfalter',

	},
	{
		type: 'bug_ladybug',
		name: 'Garten-Marienkäfer',

	},
	{
		type: 'bug_snail',
		name: 'Garten-Schnecke',

	},
	{
		type: 'bug_lunar_fairy_moth',
		name: 'Mondfee-Motte',

	},
	{
		type: 'bug_proudhorn_beetle',
		name: 'Stolzgehörnter Hirschkäfer',

	},
	{
		type: 'bug_lanternbug',
		name: 'Papier-Lampionwürmchen',
	}
];
