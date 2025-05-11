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
	}
];
