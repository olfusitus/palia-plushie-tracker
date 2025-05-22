/* eslint-disable @typescript-eslint/no-explicit-any */

//importing chartjs from node_modules
import { Chart } from 'chart.js/auto';

interface ChartRenderOptions {
	type: string;
	data: any;
	options?: any;
}

//here we are exporting const variable, which is an arrow function,
//and the arrow function takes one argument called node
export const chartRender = (node: HTMLCanvasElement, options: ChartRenderOptions) => {
	// console.log('Action');
	// console.log(node);
	// console.log(options);

	const _chart = new Chart(node, options);

	return {
		update(updatedoptions: ChartRenderOptions) {
			_chart.data = updatedoptions.data;
			_chart.update();
		},
		destroy() {
			console.log('Destroy function is called:');
			_chart.destroy();
		}
	};
};
