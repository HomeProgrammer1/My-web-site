#!/usr/bin/env python3
"""Builds the static site in site/ from src/.

One HTML file per page and language: English at the root, Polish in /pl/, Ukrainian in /ua/.
Every page gets the shared shell (layout.html), its canonical URL, hreflang alternates and
Open Graph tags; the build also writes lang/<code>.js (strings for main.js), sitemap.xml
and robots.txt.

Usage: python3 src/build.py

Tokens in layout.html and pages/<lang>/<page>.html:
  {{root}}               path back to the site root ('' or '../'), for img/, styles.css ...
  {{href:about}}         link to a page in the same language, {{href:home#calc}} with an anchor key
  {{anchor:book}}        the section id for an anchor key in this language (site.json "anchors")
  {{t:nav.about}}        a shared string from i18n/<lang>.json
  {{current:about}}      aria-current="page" when this is the page being built
Each page file starts with a front matter block: title and description.
"""
import json
import re
from html import escape
from pathlib import Path

SRC = Path(__file__).resolve().parent
OUT = SRC.parent / 'site'
CFG = json.loads((SRC / 'site.json').read_text(encoding='utf-8'))
LANGS = CFG['langs']
PAGES = CFG['pages']
BASE = CFG['base'].rstrip('/')
DEFAULT = next(l for l in LANGS if l['code'] == CFG['default'])
LAYOUT = (SRC / 'layout.html').read_text(encoding='utf-8')
I18N = {l['code']: json.loads((SRC / 'i18n' / f"{l['code']}.json").read_text(encoding='utf-8')) for l in LANGS}
TOKEN = re.compile(r'\{\{([a-z]+)(?::([^}]+))?\}\}')


def path_of(page, lang):
    return lang['dir'] + PAGES[page][lang['code']]


def url_of(page, lang):
    """Canonical URL: index pages end at their folder, every other page keeps its file name."""
    file = PAGES[page][lang['code']]
    return f"{BASE}/{lang['dir']}{'' if file == 'index.html' else file}"


def rel(from_page, from_lang, to_page, to_lang):
    up = '../' if from_lang['dir'] else ''
    if from_lang['code'] == to_lang['code']:
        return PAGES[to_page][to_lang['code']]
    return up + path_of(to_page, to_lang)


def lookup(strings, key):
    node = strings
    for part in key.split('.'):
        if not isinstance(node, dict) or part not in node:
            raise KeyError(f'missing i18n key: {key}')
        node = node[part]
    return node


def front_matter(text, where):
    m = re.match(r'---\n(.*?)\n---\n', text, re.S)
    if not m:
        raise ValueError(f'{where}: no front matter')
    meta = dict(line.split(': ', 1) for line in m.group(1).splitlines() if line.strip())
    return meta, text[m.end():]


def lang_links(page, lang, cls):
    items = []
    for other in LANGS:
        current = ' aria-current="true"' if other['code'] == lang['code'] else ''
        items.append(f'<a href="{rel(page, lang, page, other)}" hreflang="{other["hreflang"]}" lang="{other["html"]}"{current} title="{other["name"]}">{other["label"]}</a>')
    return f'<span class="{cls}" aria-label="{I18N[lang["code"]]["langLabel"]}" role="group">' + ''.join(items) + '</span>'


def seo(page, lang, meta):
    t = I18N[lang['code']]
    tags = [f'<link rel="canonical" href="{url_of(page, lang)}">']
    for other in LANGS:
        tags.append(f'<link rel="alternate" hreflang="{other["hreflang"]}" href="{url_of(page, other)}">')
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{url_of(page, DEFAULT)}">')
    tags += [
        '<meta property="og:type" content="website">',
        f'<meta property="og:site_name" content="{escape(t["name"])}">',
        f'<meta property="og:title" content="{escape(meta["title"])}">',
        f'<meta property="og:description" content="{escape(meta["description"])}">',
        f'<meta property="og:url" content="{url_of(page, lang)}">',
        f'<meta property="og:image" content="{BASE}/img/me-hero.jpg">',
        f'<meta property="og:locale" content="{lang["og"]}">',
    ]
    tags += [f'<meta property="og:locale:alternate" content="{o["og"]}">' for o in LANGS if o is not lang]
    if page == 'home':
        person = {
            '@context': 'https://schema.org', '@type': 'Person', 'name': 'Mykhailo Lohaza',
            'alternateName': 'Михайло Логаза', 'url': url_of('home', lang), 'image': f'{BASE}/img/me-hero.jpg',
            'jobTitle': t['schema']['jobTitle'], 'description': meta['description'],
            'address': {'@type': 'PostalAddress', 'addressLocality': 'Poznań', 'addressCountry': 'PL'},
            'knowsLanguage': ['pl', 'uk', 'en'],
            'sameAs': t['schema']['sameAs'],
        }
        tags.append('<script type="application/ld+json">' + json.dumps(person, ensure_ascii=False) + '</script>')
    return '\n'.join(tags)


def render(text, page, lang, meta):
    t = I18N[lang['code']]
    anchors = CFG['anchors'][lang['code']]

    def sub(m):
        kind, arg = m.group(1), m.group(2)
        if kind == 'root':
            return '../' if lang['dir'] else ''
        if kind == 'href':
            target, _, anchor = arg.partition('#')
            anchor = anchors.get(anchor, anchor)
            if target == page:
                return f'#{anchor}' if anchor else PAGES[page][lang['code']]
            return rel(page, lang, target, lang) + (f'#{anchor}' if anchor else '')
        if kind == 'anchor':
            return anchors[arg]
        if kind == 't':
            return lookup(t, arg)
        if kind == 'current':
            return ' aria-current="page"' if arg == page else ''
        if kind == 'langs':
            return lang_links(page, lang, arg or 'langs')
        if kind in ('title', 'description'):
            return escape(meta[kind])
        if kind == 'seo':
            return seo(page, lang, meta)
        if kind == 'lang':
            return lang[arg]
        raise KeyError(f'unknown token {m.group(0)}')

    return TOKEN.sub(sub, text)


def build():
    written = []
    for lang in LANGS:
        (OUT / lang['dir']).mkdir(parents=True, exist_ok=True)
        for page in PAGES:
            src = SRC / 'pages' / lang['code'] / f'{page}.html'
            meta, body = front_matter(src.read_text(encoding='utf-8'), src)
            doc = LAYOUT.replace('{{content}}', body.strip('\n'))
            out = render(render(doc, page, lang, meta), page, lang, meta)
            leftover = TOKEN.search(out)
            if leftover:
                raise ValueError(f'{src}: unresolved {leftover.group(0)}')
            (OUT / path_of(page, lang)).write_text(out, encoding='utf-8')
            written.append(path_of(page, lang))
        js = I18N[lang['code']]['js']
        (OUT / 'lang').mkdir(exist_ok=True)
        (OUT / 'lang' / f"{lang['code']}.js").write_text(
            '/* generated by src/build.py from src/i18n/%s.json, edit that file */\nwindow.T = %s;\n'
            % (lang['code'], json.dumps(js, ensure_ascii=False, indent=1)), encoding='utf-8')

    # A renamed slug must not leave the old page online: drop built pages that no longer have a source.
    for lang in LANGS:
        for old in (OUT / lang['dir']).glob('*.html'):
            if (lang['dir'] + old.name) not in written:
                old.unlink()
                print(f'removed stale {lang["dir"]}{old.name}')

    urls = []
    for page in PAGES:
        for lang in LANGS:
            alts = ''.join(f'\n    <xhtml:link rel="alternate" hreflang="{o["hreflang"]}" href="{url_of(page, o)}"/>' for o in LANGS)
            alts += f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{url_of(page, DEFAULT)}"/>'
            urls.append(f'  <url>\n    <loc>{url_of(page, lang)}</loc>{alts}\n    <priority>{CFG["sitemap"][page]}</priority>\n  </url>')
    (OUT / 'sitemap.xml').write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + '\n'.join(urls) + '\n</urlset>\n', encoding='utf-8')
    (OUT / 'robots.txt').write_text(f'User-agent: *\nAllow: /\n\nSitemap: {BASE}/sitemap.xml\n', encoding='utf-8')
    print(f'built {len(written)} pages, {len(LANGS)} string files, sitemap.xml, robots.txt')


if __name__ == '__main__':
    build()
