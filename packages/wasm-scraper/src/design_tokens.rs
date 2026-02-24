use crate::{DesignTokens, ColorToken, Typography, TextColors};
use scraper::{Html, Selector};
use regex::Regex;
use std::collections::HashMap;
use wasm_bindgen::JsValue;
use once_cell::sync::Lazy;

// Pre-compiled regex patterns for better performance
static HEX_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})(?:[^0-9a-fA-F]|$)").unwrap()
});

static RGB_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"rgba?\([^)]+\)").unwrap()
});

static HSL_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"hsla?\([^)]+\)").unwrap()
});

static FONT_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"font-family:\s*([^;]+)").unwrap()
});

static SIZE_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"font-size:\s*([^;]+)").unwrap()
});

static SPACING_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"(?:margin|padding):\s*([^;]+)").unwrap()
});

static RADIUS_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"border-radius:\s*([^;]+)").unwrap()
});

static SHADOW_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"box-shadow:\s*([^;]+)").unwrap()
});

pub fn extract_design_tokens(document: &Html) -> Result<DesignTokens, JsValue> {
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

    // Extract typography
    tokens.typography = extract_typography_from_fonts(&tokens.font_families);

    // Extract text colors
    tokens.text_colors = extract_text_colors_from_colors(&tokens.colors);

    Ok(tokens)
}

fn extract_colors(css: &str) -> Vec<ColorToken> {
    let mut color_counts: HashMap<String, usize> = HashMap::new();
    
    // Hex colors
    for cap in HEX_REGEX.captures_iter(css) {
        if let Some(color) = cap.get(0) {
            let color_str = color.as_str().trim_end_matches(|c: char| !c.is_ascii_hexdigit() && c != '#').to_lowercase();
            *color_counts.entry(color_str).or_insert(0) += 1;
        }
    }
    
    // RGB/RGBA
    for cap in RGB_REGEX.captures_iter(css) {
        let color_str = cap.get(0).unwrap().as_str().to_string();
        *color_counts.entry(color_str).or_insert(0) += 1;
    }
    
    // HSL/HSLA
    for cap in HSL_REGEX.captures_iter(css) {
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
    let mut families = Vec::new();
    
    for cap in FONT_REGEX.captures_iter(css) {
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
    let mut sizes = Vec::new();
    
    for cap in SIZE_REGEX.captures_iter(css) {
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
    let mut spacing = Vec::new();
    
    for cap in SPACING_REGEX.captures_iter(css) {
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
    let mut radii = Vec::new();
    
    for cap in RADIUS_REGEX.captures_iter(css) {
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
    let mut shadows = Vec::new();
    
    for cap in SHADOW_REGEX.captures_iter(css) {
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

// Extract typography information from font families
fn extract_typography_from_fonts(font_families: &[String]) -> Typography {
    if font_families.is_empty() {
        return Typography::default();
    }

    // Parse first font family for heading
    let empty_string = String::new();
    let first_font = font_families.first().unwrap_or(&empty_string);
    let (heading_font, heading_fallbacks) = parse_font_family(first_font);
    
    // Use second font for body, or same as heading if only one
    let body_family = if font_families.len() > 1 {
        &font_families[1]
    } else {
        first_font
    };
    let (body_font, body_fallbacks) = parse_font_family(body_family);

    Typography {
        heading_font,
        heading_fallbacks,
        body_font,
        body_fallbacks,
    }
}

// Parse a font-family string into primary font and fallbacks
fn parse_font_family(family_str: &str) -> (String, Vec<String>) {
    let fonts: Vec<String> = family_str
        .split(',')
        .map(|s| s.trim().trim_matches('"').trim_matches('\'').to_string())
        .filter(|s| !s.is_empty())
        .collect();

    if fonts.is_empty() {
        return (String::new(), Vec::new());
    }

    let primary = fonts[0].clone();
    let fallbacks = if fonts.len() > 1 {
        fonts[1..].to_vec()
    } else {
        vec!["Helvetica Neue".to_string(), "Calibri".to_string(), "sans-serif".to_string()]
    };

    (primary, fallbacks)
}

// Extract text colors with semantic categorization
fn extract_text_colors_from_colors(colors: &[ColorToken]) -> TextColors {
    if colors.is_empty() {
        return TextColors::default();
    }

    // Simple heuristic: darker colors are likely text colors
    let mut text_colors = TextColors::default();
    
    for color in colors {
        if is_dark_color(&color.value) {
            if text_colors.primary.is_none() {
                text_colors.primary = Some(color.value.clone());
            } else if text_colors.secondary.is_none() {
                text_colors.secondary = Some(color.value.clone());
            }
        } else if is_muted_color(&color.value) && text_colors.muted.is_none() {
            text_colors.muted = Some(color.value.clone());
        } else if is_light_color(&color.value) && text_colors.on_primary.is_none() {
            text_colors.on_primary = Some(color.value.clone());
        }
    }

    text_colors
}

// Check if a color is dark (likely text color)
fn is_dark_color(color: &str) -> bool {
    if color.starts_with('#') {
        if let Ok(brightness) = hex_to_brightness(color) {
            return brightness < 100;
        }
    } else if color.starts_with("rgb") {
        if let Some(brightness) = rgb_to_brightness(color) {
            return brightness < 100;
        }
    }
    false
}

// Check if a color is muted (medium brightness)
fn is_muted_color(color: &str) -> bool {
    if color.starts_with('#') {
        if let Ok(brightness) = hex_to_brightness(color) {
            return brightness >= 100 && brightness < 180;
        }
    } else if color.starts_with("rgb") {
        if let Some(brightness) = rgb_to_brightness(color) {
            return brightness >= 100 && brightness < 180;
        }
    }
    false
}

// Check if a color is light (likely background or on-primary text)
fn is_light_color(color: &str) -> bool {
    if color.starts_with('#') {
        if let Ok(brightness) = hex_to_brightness(color) {
            return brightness >= 200;
        }
    } else if color.starts_with("rgb") {
        if let Some(brightness) = rgb_to_brightness(color) {
            return brightness >= 200;
        }
    }
    false
}

// Calculate brightness from hex color
fn hex_to_brightness(hex: &str) -> Result<u32, ()> {
    let hex = hex.trim_start_matches('#');
    let hex = if hex.len() == 3 {
        format!("{}{}{}{}{}{}", 
            &hex[0..1], &hex[0..1],
            &hex[1..2], &hex[1..2],
            &hex[2..3], &hex[2..3])
    } else {
        hex.to_string()
    };

    if hex.len() != 6 {
        return Err(());
    }

    let r = u32::from_str_radix(&hex[0..2], 16).map_err(|_| ())?;
    let g = u32::from_str_radix(&hex[2..4], 16).map_err(|_| ())?;
    let b = u32::from_str_radix(&hex[4..6], 16).map_err(|_| ())?;

    Ok((r + g + b) / 3)
}

// Calculate brightness from rgb/rgba color
fn rgb_to_brightness(rgb: &str) -> Option<u32> {
    let rgb = rgb.trim_start_matches("rgb(")
        .trim_start_matches("rgba(")
        .trim_end_matches(')');
    
    let parts: Vec<&str> = rgb.split(',').collect();
    if parts.len() < 3 {
        return None;
    }

    let r = parts[0].trim().parse::<u32>().ok()?;
    let g = parts[1].trim().parse::<u32>().ok()?;
    let b = parts[2].trim().parse::<u32>().ok()?;

    Some((r + g + b) / 3)
}
