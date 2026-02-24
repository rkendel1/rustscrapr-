use crate::{AssetData};
use scraper::{Html, Selector};
use url::Url;
use wasm_bindgen::JsValue;

pub fn extract_assets(document: &Html, base_url: &str) -> Result<AssetData, JsValue> {
    let base = Url::parse(base_url)
        .map_err(|e| JsValue::from_str(&format!("Invalid base URL: {}", e)))?;
    
    let mut logos = Vec::new();
    let mut images = Vec::new();
    let mut favicon = None;
    let mut og_image = None;

    // Find logos
    let logo_selector = Selector::parse("img[alt*='logo' i], header img, .logo img, #logo img").unwrap();
    for element in document.select(&logo_selector) {
        if let Some(src) = element.value().attr("src") {
            if let Ok(url) = base.join(src) {
                let url_str = url.to_string();
                if !logos.contains(&url_str) {
                    logos.push(url_str);
                }
            }
        }
    }

    // Find all images
    let img_selector = Selector::parse("img[src]").unwrap();
    for element in document.select(&img_selector) {
        if let Some(src) = element.value().attr("src") {
            if let Ok(url) = base.join(src) {
                let url_str = url.to_string();
                if !images.contains(&url_str) && !logos.contains(&url_str) {
                    images.push(url_str);
                }
            }
        }
    }

    // Find favicon
    let favicon_selector = Selector::parse("link[rel~='icon']").unwrap();
    if let Some(element) = document.select(&favicon_selector).next() {
        if let Some(href) = element.value().attr("href") {
            if let Ok(url) = base.join(href) {
                favicon = Some(url.to_string());
            }
        }
    }

    // Find OG image
    let og_selector = Selector::parse("meta[property='og:image']").unwrap();
    if let Some(element) = document.select(&og_selector).next() {
        if let Some(content) = element.value().attr("content") {
            if let Ok(url) = base.join(content) {
                og_image = Some(url.to_string());
            }
        }
    }

    Ok(AssetData {
        logos,
        images,
        favicon,
        og_image,
    })
}
