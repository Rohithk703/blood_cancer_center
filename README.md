# AP Blood & Blood Cancer Centre — Website

Single-page clinic website (HTML, CSS, JavaScript).

## Project structure

```
blood_cancer_center/
├── index.html          # Main page
├── thank-you.html      # Form success page (Netlify)
├── css/
│   └── style.css       # All styles
├── js/
│   └── main.js         # Navigation, form, scroll
├── assets/
│   └── favicon.svg     # Site icon
├── site.webmanifest    # PWA / mobile browser metadata
├── robots.txt          # Search engine rules
├── sitemap.xml         # Sitemap for SEO
└── netlify.toml        # Netlify deploy settings
```

## Run locally

Open `index.html` in a browser, or use a simple server:

```bash
# Python
python -m http.server 8080

# Node (if npx available)
npx serve .
```

Then visit `http://localhost:8080`.

## Deploy to Netlify

See deployment steps in the project documentation or ask your developer for the latest Netlify workflow.
