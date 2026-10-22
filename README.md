# pramod.cloud

Personal site of Pramod B N, Cloud & Agentic AI Solutions Architect and Working Group Chair for IEEE P4211 and IEEE P4213.

<h2>🚀 Visit <a href="https://pramod.cloud" target="_blank"><img alt="pramod.cloud" src="https://img.shields.io/badge/pramod.cloud-844FBA" /></a></h2>

⚡ Plain HTML, CSS and JS with no build step, hosted on AWS S3 behind CloudFront and deployed by GitHub Actions ([`.github/workflows/cicd.yml`](.github/workflows/cicd.yml)) on every push to `main`.

## Structure

```
index.html                       home
about/index.html                 bio, recognition, credentials, education
projects/index.html              open source projects
standards/index.html             IEEE P4211 and P4213
community/index.html             community leadership and volunteering
contact/index.html               contact topics
assets/css/style.css             design tokens and all styles
assets/js/main.js                theme toggle, mobile menu, scroll reveal
sitemap.xml, robots.txt          SEO
```

Every page shares the same header and footer, so changes to navigation or footer text must be made on each page.
When adding a page, add it to `sitemap.xml` too.

Preview locally with `python3 -m http.server` and open http://localhost:8000.

## Content rules

- No past employers, job history or company logos anywhere.
- Neutral voice: no "I" or "my".
- IEEE P4211 and P4213 are standards projects under development (Active PAR), never "published standards".
- No placeholder copy on the live site; leave a section out until its content is ready.

## Archive

The previous version of the site is preserved on the `archive/legacy-portfolio` branch and the `legacy-portfolio-v1` tag.
