// src/lib/ws-client.ts
// wird nur in Tauri inkludiert

if (__TAURI__) {
  console.log("Läuft in Tauri-Umgebung!");
  
  const socket = new WebSocket('ws://localhost:1234');

  socket.addEventListener('open', () => {
    console.log('WebSocket verbunden (nur in Tauri)');
  });

  socket.addEventListener('message', (event) => {
    const data = JSON.parse(event.data);
    // Handle dein Plugin-Event hier
  });
}