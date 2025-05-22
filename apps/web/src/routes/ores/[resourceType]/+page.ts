// src/routes/ores/[resourceType]/+page.js
export function load({ params }) {
	return {
		resourceType: params.resourceType
		// …hier kannst du z.B. fetch('/api/ores/'+params.resourceType)
	};
}
