use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;
use std::collections::HashMap;

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

// Aggregate design tokens from multiple pages
fn aggregate_design_tokens(pages: &[PageData]) -> Option<DesignTokens> {
    if pages.is_empty() {
        return None;
    }

    let tokens_list: Vec<&DesignTokens> = pages
        .iter()
        .filter_map(|p| p.design_tokens.as_ref())
        .collect();

    if tokens_list.is_empty() {
        return None;
    }

    // Aggregate colors with counts
    let mut color_map: HashMap<String, usize> = HashMap::new();
    for tokens in &tokens_list {
        for color in &tokens.colors {
            *color_map.entry(color.value.clone()).or_insert(0) += color.count;
        }
    }
    let mut aggregated_colors: Vec<ColorToken> = color_map
        .into_iter()
        .map(|(value, count)| ColorToken { value, count })
        .collect();
    aggregated_colors.sort_by(|a, b| b.count.cmp(&a.count));
    aggregated_colors.truncate(10); // Limit to top 10 most used colors

    // Aggregate font families (unique values)
    let mut font_families_set: HashMap<String, usize> = HashMap::new();
    for tokens in &tokens_list {
        for font in &tokens.font_families {
            *font_families_set.entry(font.clone()).or_insert(0) += 1;
        }
    }
    let mut aggregated_fonts: Vec<(String, usize)> = font_families_set.into_iter().collect();
    aggregated_fonts.sort_by(|a, b| b.1.cmp(&a.1));
    let aggregated_font_families: Vec<String> = aggregated_fonts
        .into_iter()
        .map(|(font, _)| font)
        .take(5)
        .collect();

    // Aggregate font sizes (unique values, sorted by frequency)
    let mut font_sizes_set: HashMap<String, usize> = HashMap::new();
    for tokens in &tokens_list {
        for size in &tokens.font_sizes {
            *font_sizes_set.entry(size.clone()).or_insert(0) += 1;
        }
    }
    let mut aggregated_sizes: Vec<(String, usize)> = font_sizes_set.into_iter().collect();
    aggregated_sizes.sort_by(|a, b| b.1.cmp(&a.1));
    let aggregated_font_sizes: Vec<String> = aggregated_sizes
        .into_iter()
        .map(|(size, _)| size)
        .take(8)
        .collect();

    // Aggregate spacing (unique values, sorted by frequency)
    let mut spacing_set: HashMap<String, usize> = HashMap::new();
    for tokens in &tokens_list {
        for space in &tokens.spacing {
            *spacing_set.entry(space.clone()).or_insert(0) += 1;
        }
    }
    let mut aggregated_spacings: Vec<(String, usize)> = spacing_set.into_iter().collect();
    aggregated_spacings.sort_by(|a, b| b.1.cmp(&a.1));
    let aggregated_spacing: Vec<String> = aggregated_spacings
        .into_iter()
        .map(|(space, _)| space)
        .take(10)
        .collect();

    // Aggregate border radius (unique values, sorted by frequency)
    let mut radius_set: HashMap<String, usize> = HashMap::new();
    for tokens in &tokens_list {
        for radius in &tokens.border_radius {
            *radius_set.entry(radius.clone()).or_insert(0) += 1;
        }
    }
    let mut aggregated_radii: Vec<(String, usize)> = radius_set.into_iter().collect();
    aggregated_radii.sort_by(|a, b| b.1.cmp(&a.1));
    let aggregated_border_radius: Vec<String> = aggregated_radii
        .into_iter()
        .map(|(radius, _)| radius)
        .take(6)
        .collect();

    // Aggregate shadows (unique values, sorted by frequency)
    let mut shadows_set: HashMap<String, usize> = HashMap::new();
    for tokens in &tokens_list {
        for shadow in &tokens.shadows {
            *shadows_set.entry(shadow.clone()).or_insert(0) += 1;
        }
    }
    let mut aggregated_shadow_vec: Vec<(String, usize)> = shadows_set.into_iter().collect();
    aggregated_shadow_vec.sort_by(|a, b| b.1.cmp(&a.1));
    let aggregated_shadows: Vec<String> = aggregated_shadow_vec
        .into_iter()
        .map(|(shadow, _)| shadow)
        .take(5)
        .collect();

    Some(DesignTokens {
        colors: aggregated_colors,
        font_families: aggregated_font_families,
        font_sizes: aggregated_font_sizes,
        spacing: aggregated_spacing,
        border_radius: aggregated_border_radius,
        shadows: aggregated_shadows,
    })
}

#[wasm_bindgen]
pub async fn scrape(html: String, base_url: String, config: JsValue) -> Result<JsValue, JsValue> {
    let config: ScraperConfig = serde_wasm_bindgen::from_value(config)
        .map_err(|e| JsValue::from_str(&format!("Config parse error: {}", e)))?;

    let page_data = parse_page(&html, &base_url, &config)?;
    let pages = vec![page_data.clone()];
    
    // Aggregate design tokens from all pages for site-level summary
    let site_design_tokens = aggregate_design_tokens(&pages);
    
    let result = ScraperResult {
        pages,
        site: SiteData {
            design_tokens: site_design_tokens,
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
        Some(extract_design_tokens(&document)?)
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
