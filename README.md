# Palia Hunting Tracker

A hunting and plushie drop tracker for Palia, made up of three parts that work together:

## Components

### Web Application (SPA)
- Progressive Web App for tracking hunting stats and plushie drops
- Interactive charts and data visualization
- Works on mobile and desktop browsers
- Saves data locally for offline use

### Desktop Application (Tauri)
- Native desktop app built with Tauri
- Local data storage and management
- WebSocket server for Stream Deck integration

### Stream Deck Plugin
- Custom Stream Deck plugin for interfacing with the Desktop Application via WebSockets

## Development

This project uses:
- SvelteKit for the web app
- Tauri for the desktop app
- Stream Deck SDK for the plugin

### Prerequisites

- Node.js (v18 or later)
- Rust (for Tauri development)
- Stream Deck SDK (for plugin development)
