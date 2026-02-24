use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

mod parser;
mod design_tokens;
mod links;
mod assets;

use parser::extract_text;
use design_tokens::extract_design_tokens;
use links::extract_links;
use assets::extract_assets;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ScraperConfig {
    crawl_depth: Option<u32>,
    max_pages: Option<u32>,
    extract_design_tokens: Option<bool>,
    summarize_brand: Option<bool>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PageData {
    url: String,
    title: String,
    meta_description: String,
    headings: Vec<String>,
    text_content: String,
    links: LinkData,
    design_tokens: Option<DesignTokens>,
    assets: AssetData,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LinkData {
    internal: Vec<String>,
    external: Vec<String>,
}

#[derive(Serialize, Default, Clone)]
#[serde(rename_all = "camelCase")]
pub struct DesignTokens {
    colors: Vec<ColorToken>,
    font_families: Vec<String>,
    font_sizes: Vec<String>,
    spacing: Vec<String>,
    border_radius: Vec<String>,
    shadows: Vec<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ColorToken {
    value: String,
    count: usize,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AssetData {
    logos: Vec<String>,
    images: Vec<String>,
    favicon: Option<String>,
    og_image: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ScraperResult {
    pages: Vec<PageData>,
    site: SiteData,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SiteData {
    design_tokens: Option<DesignTokens>,
    all_links: LinkData,
}

#[wasm_bindgen]
pub async fn scrape(html: String, base_url: String, config: JsValue) -> Result<JsValue, JsValue> {
    let config: ScraperConfig = serde_wasm_bindgen::from_value(config)
        .map_err(|e| JsValue::from_str(&format!("Config parse error: {}", e)))?;

    let page_data = parse_page(&html, &base_url, &config)?;
    
    let result = ScraperResult {
        pages: vec![page_data.clone()],
        site: SiteData {
            design_tokens: page_data.design_tokens.clone(),
            all_links: page_data.links.clone(),
        },
    };

    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

fn parse_page(html: &str, base_url: &str, config: &ScraperConfig) -> Result<PageData, JsValue> {
    let document = scraper::Html::parse_document(html);
    
    let (title, meta_description, headings, text_content) = extract_text(&document);
    let links = extract_links(&document, base_url)?;
    let design_tokens = if config.extract_design_tokens.unwrap_or(true) {
        Some(extract_design_tokens(&document, html)?)
    } else {
        None
    };
    let assets = extract_assets(&document, base_url)?;

    Ok(PageData {
        url: base_url.to_string(),
        title,
        meta_description,
        headings,
        text_content,
        links,
        design_tokens,
        assets,
    })
}
