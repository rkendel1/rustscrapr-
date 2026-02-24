use crate::{LinkData};
use scraper::{Html, Selector};
use url::Url;
use wasm_bindgen::JsValue;

pub fn extract_links(document: &Html, base_url: &str) -> Result<LinkData, JsValue> {
    let base = Url::parse(base_url)
        .map_err(|e| JsValue::from_str(&format!("Invalid base URL: {}", e)))?;
    
    let link_selector = Selector::parse("a[href]").unwrap();
    let mut internal = Vec::new();
    let mut external = Vec::new();

    for element in document.select(&link_selector) {
        if let Some(href) = element.value().attr("href") {
            // Skip anchors, javascript:, mailto:, tel:
            if href.starts_with('#') 
                || href.starts_with("javascript:")
                || href.starts_with("mailto:")
                || href.starts_with("tel:") {
                continue;
            }

            // Try to parse as absolute or relative URL
            if let Ok(url) = base.join(href) {
                let url_str = url.to_string();
                
                // Check if same domain
                if url.host() == base.host() {
                    if !internal.contains(&url_str) {
                        internal.push(url_str);
                    }
                } else {
                    if !external.contains(&url_str) {
                        external.push(url_str);
                    }
                }
            }
        }
    }

    Ok(LinkData { internal, external })
}
