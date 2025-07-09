use tauri::{Manager, WebviewWindow};
use tauri::AppHandle;
use tokio::net::TcpListener;
use tokio_tungstenite::accept_async;
use futures_util::{StreamExt, SinkExt};
use serde::Deserialize;
use tauri::Emitter;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[derive(Deserialize)]
struct IncomingMessage {
    action: String,
    key: Option<String>,
    value: Option<serde_json::Value>,
}


#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            println!("Tauri-Setup");
            let window = app.get_webview_window("main").unwrap();

            // Starte WebSocket-Server im Hintergrund
            tauri::async_runtime::spawn(start_websocket_server(window));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn start_websocket_server(window: WebviewWindow) {
    let listener = TcpListener::bind("127.0.0.1:8422")
        .await
        .expect("WebSocket port konnte nicht gebunden werden");

    println!("WebSocket-Server läuft auf ws://localhost:8422");

    while let Ok((stream, _)) = listener.accept().await {
        // println!("WebSocket-Verbindung akzeptiert");
        let window = window.clone();

        tauri::async_runtime::spawn(async move {
            if let Ok(ws_stream) = accept_async(stream).await {
                let (_write, mut read) = ws_stream.split();

                while let Some(Ok(msg)) = read.next().await {
                    if msg.is_text() {
                        let text = msg.to_text().unwrap();
                        if let Ok(payload) = serde_json::from_str::<IncomingMessage>(text) {
                            if payload.action == "addEntry" {
                                // println!("addEntry: {:?}", text.to_string());
                                // An Webview (SPA) weiterleiten
                                let _ = window.emit("ws-to-webview", text.to_string());
                            }
                            if payload.action == "setLocalStorage" {
                                println!("setLocalStorage: {:?}", text.to_string());
                                // An Webview (SPA) weiterleiten
                                let _ = window.emit("ws-to-webview", text.to_string());
                            }
                        }
                    }
                }
            }
        });
    }
}
