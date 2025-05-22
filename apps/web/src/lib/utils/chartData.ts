export function buildDistanceHistogramData(allDistances: number[], binSize = 5) {
	const maxVal = Math.max(...allDistances, 0);
	const bins: { range: string; count: number; min: number; max: number }[] = [];
	for (let start = 0; start <= maxVal; start += binSize) {
		bins.push({
			range: `${start}-${start + binSize - 1}`,
			count: 0,
			min: start,
			max: start + binSize
		});
	}
	allDistances.forEach((d) => {
		const bin = bins.find((b) => d >= b.min && d < b.max);
		if (bin) bin.count++;
	});
	return {
		type: 'bar',
		data: {
			labels: bins.map((b) => b.range),
			datasets: [
				{
					label: 'Anzahl der Abstände',
					data: bins.map((b) => b.count),
					borderWidth: 1,
					barThickness: 1,
					backgroundColor: ['rgba(245, 40, 145, 0.8)']
				}
			]
		},
		options: {
			maintainAspectRatio: false,
			scales: {
				x: { title: { display: true, text: 'Zwischen-Drop-Abstand (Kills)' } },
				y: { title: { display: true, text: 'Häufigkeit' }, beginAtZero: true }
			}
		}
	};
}
