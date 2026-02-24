use scraper::{Html, Selector};
use regex::Regex;
use std::collections::HashSet;
use once_cell::sync::Lazy;

// Email regex pattern
static EMAIL_REGEX: Lazy<Regex> = Lazy::new(|| {
    Regex::new(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}").unwrap()
});

pub fn extract_text(document: &Html) -> (String, String, Vec<String>, String, Vec<String>) {
    // Extract title
    let title_selector = Selector::parse("title").unwrap();
    let title = document
        .select(&title_selector)
        .next()
        .map(|el| el.text().collect::<String>())
        .unwrap_or_default()
        .trim()
        .to_string();

    // Extract meta description
    let meta_selector = Selector::parse("meta[name='description'], meta[property='og:description']").unwrap();
    let meta_description = document
        .select(&meta_selector)
        .next()
        .and_then(|el| el.value().attr("content"))
        .unwrap_or_default()
        .to_string();

    // Extract headings
    let heading_selector = Selector::parse("h1, h2, h3, h4, h5, h6").unwrap();
    let headings: Vec<String> = document
        .select(&heading_selector)
        .map(|el| el.text().collect::<String>().trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    // Extract body text
    let body_selector = Selector::parse("body").unwrap();
    let text_content = document
        .select(&body_selector)
        .next()
        .map(|el| {
            el.text()
                .collect::<Vec<_>>()
                .join(" ")
                .split_whitespace()
                .collect::<Vec<_>>()
                .join(" ")
        })
        .unwrap_or_default();

    // Extract emails from text content and href attributes
    let mut emails = HashSet::new();
    
    // Extract from text content
    for email_match in EMAIL_REGEX.captures_iter(&text_content) {
        if let Some(email) = email_match.get(0) {
            emails.insert(email.as_str().to_lowercase());
        }
    }
    
    // Extract from mailto: links
    let link_selector = Selector::parse("a[href^='mailto:']").unwrap();
    for element in document.select(&link_selector) {
        if let Some(href) = element.value().attr("href") {
            if let Some(email) = href.strip_prefix("mailto:") {
                // Remove query parameters if any
                let clean_email = email.split('?').next().unwrap_or(email);
                emails.insert(clean_email.to_lowercase());
            }
        }
    }
    
    let emails_vec: Vec<String> = emails.into_iter().collect();

    (title, meta_description, headings, text_content, emails_vec)
}
