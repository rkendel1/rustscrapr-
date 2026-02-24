use crate::{DesignTokens, ColorToken};
use scraper::{Html, Selector};
use regex::Regex;
use std::collections::HashMap;
use wasm_bindgen::JsValue;

pub fn extract_design_tokens(document: &Html, _html: &str) -> Result<DesignTokens, JsValue> {
    let mut tokens = DesignTokens::default();
    
    // Extract from style tags
    let style_selector = Selector::parse("style").unwrap();
    let mut css_content = String::new();
    
    for element in document.select(&style_selector) {
        css_content.push_str(&element.text().collect::<String>());
        css_content.push('\n');
    }

    // Also check inline styles
    let inline_selector = Selector::parse("[style]").unwrap();
    for element in document.select(&inline_selector) {
        if let Some(style) = element.value().attr("style") {
            css_content.push_str(style);
            css_content.push('\n');
        }
    }

    // Extract colors
    tokens.colors = extract_colors(&css_content);
    
    // Extract font families
    tokens.font_families = extract_font_families(&css_content);
    
    // Extract font sizes
    tokens.font_sizes = extract_font_sizes(&css_content);
    
    // Extract spacing values
    tokens.spacing = extract_spacing(&css_content);
    
    // Extract border radius
    tokens.border_radius = extract_border_radius(&css_content);
    
    // Extract shadows
    tokens.shadows = extract_shadows(&css_content);

    Ok(tokens)
}

fn extract_colors(css: &str) -> Vec<ColorToken> {
    let mut color_counts: HashMap<String, usize> = HashMap::new();
    
    // Hex colors
    let hex_regex = Regex::new(r"#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?:[^0-9a-fA-F]|$)").unwrap();
    for cap in hex_regex.captures_iter(css) {
        if let Some(color) = cap.get(0) {
            let color_str = color.as_str().trim_end_matches(|c: char| !c.is_ascii_hexdigit() && c != '#').to_lowercase();
            *color_counts.entry(color_str).or_insert(0) += 1;
        }
    }
    
    // RGB/RGBA
    let rgb_regex = Regex::new(r"rgba?\([^)]+\)").unwrap();
    for cap in rgb_regex.captures_iter(css) {
        let color_str = cap.get(0).unwrap().as_str().to_string();
        *color_counts.entry(color_str).or_insert(0) += 1;
    }
    
    // HSL/HSLA
    let hsl_regex = Regex::new(r"hsla?\([^)]+\)").unwrap();
    for cap in hsl_regex.captures_iter(css) {
        let color_str = cap.get(0).unwrap().as_str().to_string();
        *color_counts.entry(color_str).or_insert(0) += 1;
    }
    
    // Convert to sorted vector by frequency
    let mut colors: Vec<ColorToken> = color_counts
        .into_iter()
        .map(|(value, count)| ColorToken { value, count })
        .collect();
    
    colors.sort_by(|a, b| b.count.cmp(&a.count));
    
    // Limit to top 20 colors
    colors.truncate(20);
    
    colors
}

fn extract_font_families(css: &str) -> Vec<String> {
    let font_regex = Regex::new(r"font-family:\s*([^;]+)").unwrap();
    let mut families = Vec::new();
    
    for cap in font_regex.captures_iter(css) {
        if let Some(family) = cap.get(1) {
            let family_str = family.as_str().trim().to_string();
            if !families.contains(&family_str) {
                families.push(family_str);
            }
        }
    }
    
    families.truncate(10);
    families
}

fn extract_font_sizes(css: &str) -> Vec<String> {
    let size_regex = Regex::new(r"font-size:\s*([^;]+)").unwrap();
    let mut sizes = Vec::new();
    
    for cap in size_regex.captures_iter(css) {
        if let Some(size) = cap.get(1) {
            let size_str = size.as_str().trim().to_string();
            if !sizes.contains(&size_str) {
                sizes.push(size_str);
            }
        }
    }
    
    sizes.truncate(15);
    sizes
}

fn extract_spacing(css: &str) -> Vec<String> {
    let spacing_regex = Regex::new(r"(?:margin|padding):\s*([^;]+)").unwrap();
    let mut spacing = Vec::new();
    
    for cap in spacing_regex.captures_iter(css) {
        if let Some(value) = cap.get(1) {
            let value_str = value.as_str().trim().to_string();
            if !spacing.contains(&value_str) {
                spacing.push(value_str);
            }
        }
    }
    
    spacing.truncate(15);
    spacing
}

fn extract_border_radius(css: &str) -> Vec<String> {
    let radius_regex = Regex::new(r"border-radius:\s*([^;]+)").unwrap();
    let mut radii = Vec::new();
    
    for cap in radius_regex.captures_iter(css) {
        if let Some(radius) = cap.get(1) {
            let radius_str = radius.as_str().trim().to_string();
            if !radii.contains(&radius_str) {
                radii.push(radius_str);
            }
        }
    }
    
    radii.truncate(10);
    radii
}

fn extract_shadows(css: &str) -> Vec<String> {
    let shadow_regex = Regex::new(r"box-shadow:\s*([^;]+)").unwrap();
    let mut shadows = Vec::new();
    
    for cap in shadow_regex.captures_iter(css) {
        if let Some(shadow) = cap.get(1) {
            let shadow_str = shadow.as_str().trim().to_string();
            if !shadows.contains(&shadow_str) {
                shadows.push(shadow_str);
            }
        }
    }
    
    shadows.truncate(10);
    shadows
}
