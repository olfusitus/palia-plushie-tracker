import type { Resource } from './storage';

export const resources: Resource[] = [
	{
		type: 'animal_chapaa',
		name: 'Chapaa',
		availableSizes: ['small', 'medium', 'large'],
		labels: {
			small: 'Gefleckt',
			medium: 'Gestreift',
			large: 'Azur'
		}
	},
	{
		type: 'animal_sernuk',
		name: 'Sernuk',
		availableSizes: ['small', 'medium', 'large'],
		labels: {
			small: 'Sernuk',
			medium: 'Älter',
			large: 'Stolzgehörnt'
		}
	},
	{
		type: 'animal_muujin',
		name: 'Muujin',
		availableSizes: ['small', 'medium', 'large'],
		labels: {
			small: 'Muujin',
			medium: 'Gebändert',
			large: 'Blaugeborstet'
		}
	},
	{
		type: 'animal_ogopuu',
		name: 'Ogopuu',
		availableSizes: ['small', 'medium', 'large'],
		labels: {
			small: 'Ogopuu',
			medium: 'Smaragd',
			large: 'Wellenrücken'
		}
	},
	{
		type: 'animal_shmole',
		name: 'Shmole',
		availableSizes: ['small', 'medium', 'large'],
		labels: {
			small: 'Shmole',
			medium: 'Holunder',
			large: 'Piksii'
		}
	},
	{
		type: 'bug_rtb',
		name: 'Regenbogenfalter'
	},
	{
		type: 'bug_ladybug',
		name: 'Garten-Marienkäfer'
	},
	{
		type: 'bug_snail',
		name: 'Garten-Schnecke'
	},
	{
		type: 'bug_lunar_fairy_moth',
		name: 'Mondfee-Motte'
	},
	{
		type: 'bug_proudhorn_beetle',
		name: 'Stolzgehörnter Hirschkäfer'
	},
	{
		type: 'bug_lanternbug',
		name: 'Papier-Lampionwürmchen'
	}
];
