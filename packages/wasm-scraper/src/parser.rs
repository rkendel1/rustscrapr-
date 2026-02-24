use scraper::{Html, Selector};

pub fn extract_text(document: &Html) -> (String, String, Vec<String>, String) {
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

    (title, meta_description, headings, text_content)
}
