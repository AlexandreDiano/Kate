// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::Command;
use serde::{Deserialize, Serialize};
use reqwest::blocking::get;
use scraper::{Html, Selector};
use tokio::task;

#[derive(Deserialize)]
struct GenerateRequest {
    model: String,
    prompt: String,
}

#[derive(Deserialize)]
struct CurlResponse {
    response: String,
    done: Option<bool>,
}

#[derive(Serialize, Deserialize)]
struct ApiResponse {
    success: bool,
    data: Option<String>,
    error: Option<String>,
}

#[tauri::command]
async fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}!", name))
}

#[tauri::command]
async fn index_models() -> Result<String, String> {
    let output = task::spawn_blocking(|| {
        Command::new("curl")
            .arg("http://localhost:11434/api/tags")
            .output()
    })
    .await
    .map_err(|e| format!("Failed to join task: {}", e))?
    .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        match String::from_utf8(output.stdout) {
            Ok(stdout) => {
                let response = ApiResponse {
                    success: true,
                    data: Some(stdout),
                    error: None,
                };
                Ok(serde_json::to_string_pretty(&response).unwrap())
            },
            Err(err) => {
                let response = ApiResponse {
                    success: false,
                    data: None,
                    error: Some(format!("Failed to parse output: {}", err)),
                };
                Ok(serde_json::to_string_pretty(&response).unwrap())
            },
        }
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        let response = ApiResponse {
            success: false,
            data: None,
            error: Some(format!("Command executed with failing error code: {}", error_message)),
        };
        Ok(serde_json::to_string_pretty(&response).unwrap())
    }
}

#[tauri::command]
async fn generate_text(model: String, prompt: String) -> Result<String, String> {
    let data = format!(r#"{{ "model": "{}", "prompt": "{}" }}"#, model, prompt);

    let output = task::spawn_blocking(move || {
        Command::new("curl")
            .arg("-X")
            .arg("POST")
            .arg("http://localhost:11434/api/generate")
            .arg("-d")
            .arg(&data)
            .output()
    })
    .await
    .map_err(|e| format!("Failed to join task: {}", e))?
    .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        match String::from_utf8(output.stdout) {
            Ok(stdout) => {
                let mut full_response = String::new();
                for line in stdout.lines() {
                    if let Ok(parsed) = serde_json::from_str::<CurlResponse>(line) {
                        full_response.push_str(&parsed.response);
                    }
                }
                Ok(full_response)
            },
            Err(err) => {
                Err(format!("Failed to parse output: {}", err))
            },
        }
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        Err(format!("Command executed with failing error code: {}", error_message))
    }
}

#[tauri::command]
async fn delete_model(name: String) -> Result<String, String> {
    let data = format!(r#"{{ "name": "{}" }}"#, name);

    let output = task::spawn_blocking(move || {
        Command::new("curl")
            .arg("-X")
            .arg("DELETE")
            .arg("http://localhost:11434/api/delete")
            .arg("-d")
            .arg(&data)
            .output()
    })
    .await
    .map_err(|e| format!("Failed to join task: {}", e))?
    .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        match String::from_utf8(output.stdout) {
            Ok(stdout) => {
                index_models().await
            },
            Err(err) => {
                Err(format!("Failed to parse output: {}", err))
            },
        }
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        Err(format!("Command executed with failing error code: {}", error_message))
    }
}

#[tauri::command]
async fn new_model(name: String) -> Result<String, String> {
    let data = format!(r#"{{ "name": "{}" }}"#, name);

    let output = task::spawn_blocking(move || {
        Command::new("curl")
            .arg("http://localhost:11434/api/pull")
            .arg("-d")
            .arg(&data)
            .output()
    })
    .await
    .map_err(|e| format!("Failed to join task: {}", e))?
    .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        match String::from_utf8(output.stdout) {
            Ok(stdout) => {
                index_models().await
            },
            Err(err) => {
                Err(format!("Failed to parse output: {}", err))
            },
        }
    } else {
        let error_message = String::from_utf8_lossy(&output.stderr);
        Err(format!("Command executed with failing error code: {}", error_message))
    }
}

#[tauri::command]
async fn fetch_ul_content() -> Result<ApiResponse, String> {
    let html_content = task::spawn_blocking(|| {
        let response = get("https://ollama.com/library")
            .map_err(|e| format!("Failed to fetch URL: {}", e))?;
        response.text().map_err(|e| format!("Failed to read response text: {}", e))
    })
    .await
    .map_err(|e| format!("Failed to join task: {}", e))?
    .map_err(|e| format!("Failed to fetch URL or read response text: {}", e))?;

    let document = Html::parse_document(&html_content);
    let ul_selector = Selector::parse("ul[role='list']").map_err(|e| format!("Failed to parse selector: {:?}", e))?;

    let ul_content: Vec<String> = document
        .select(&ul_selector)
        .map(|ul| ul.html())
        .collect();

    if ul_content.is_empty() {
        Ok(ApiResponse {
            success: false,
            data: None,
            error: Some("No <ul role=\"list\"> elements found.".into()),
        })
    } else {
        Ok(ApiResponse {
            success: true,
            data: Some(ul_content.join("\n")),
            error: None,
        })
    }
}

#[tauri::command]
fn open_app(name: String) -> Result<(), String> {
    Command::new(name)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            greet,
            generate_text,
            index_models,
            delete_model,
            fetch_ul_content,
            new_model,
            open_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
