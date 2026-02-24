use crate::{Typography, TextColors, ColorToken};

// Extract typography information from font families
pub fn extract_typography(font_families: &[String]) -> Typography {
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
pub fn parse_font_family(family_str: &str) -> (String, Vec<String>) {
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
pub fn extract_text_colors(colors: &[ColorToken]) -> TextColors {
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
pub fn is_dark_color(color: &str) -> bool {
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
pub fn is_muted_color(color: &str) -> bool {
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
pub fn is_light_color(color: &str) -> bool {
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
pub fn hex_to_brightness(hex: &str) -> Result<u32, ()> {
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
pub fn rgb_to_brightness(rgb: &str) -> Option<u32> {
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
