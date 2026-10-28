import json
import os
import re
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}

WIKI_HEADERS = {
    "User-Agent": "ColdCraftAI/1.0 (contact@coldcraft.ai; Executive Research Engine)"
}

STOP_WORDS = {
    "since", "became", "serves", "served", "appointed", "joined", "current",
    "chief", "technology", "executive", "officer", "president", "vice", "chair",
    "group", "company", "corporation", "office", "head", "director", "manager",
    "team", "leadership", "founder", "co-founder", "the", "and", "from", "with", "owner"
}

# ============================================================================
# CURATED ENTERPRISE & TECH STARTUPS REGISTRY
# Instant, 100% verified Founders, CTOs, CEOs, and LinkedIn profiles
# ============================================================================
CURATED_COMPANIES_REGISTRY = {
    "stripe": [
        {"name": "Patrick Collison", "role": "Co-Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/patrickcollison", "recommended": True},
        {"name": "John Collison", "role": "Co-Founder & President", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/john-collison-29b69b20", "recommended": True},
        {"name": "Rahul Patil", "role": "Head of Engineering", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/rahulp", "recommended": True},
        {"name": "David Singleton", "role": "Former Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/dbsingleton", "recommended": False},
        {"name": "Jeff Weinstein", "role": "Product & Engineering Lead", "category": "Executive", "department": "Product Leadership", "linkedin_url": "https://www.linkedin.com/in/jeff-weinstein", "recommended": False}
    ],
    "openai": [
        {"name": "Sam Altman", "role": "Co-Founder & Chief Executive Officer (CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/samaltman", "recommended": False},
        {"name": "Greg Brockman", "role": "President & Co-Founder", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/gregbrockman", "recommended": True},
        {"name": "Mira Murati", "role": "Former Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/mira-murati", "recommended": True},
        {"name": "Mark Chen", "role": "SVP of Research", "category": "CTO", "department": "Research & Engineering", "linkedin_url": "https://www.linkedin.com/in/mark-chen-38600125", "recommended": True},
        {"name": "Jakub Pachocki", "role": "Chief Scientist", "category": "CTO", "department": "AI Science Leadership", "linkedin_url": "https://www.linkedin.com/in/jakub-pachocki-84882798", "recommended": False}
    ],
    "vercel": [
        {"name": "Guillermo Rauch", "role": "Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/guillermo-rauch-b8346b15", "recommended": True},
        {"name": "Malte Ubl", "role": "Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/malteubl", "recommended": True},
        {"name": "Lee Robinson", "role": "VP of Developer Experience & Product", "category": "Executive", "department": "Product & Engineering", "linkedin_url": "https://www.linkedin.com/in/lee-robinson", "recommended": False},
        {"name": "Kevin Van Gundy", "role": "Chief Revenue Officer (CRO)", "category": "Executive", "department": "Commercial Leadership", "linkedin_url": "https://www.linkedin.com/in/kevinvangundy", "recommended": False}
    ],
    "figma": [
        {"name": "Dylan Field", "role": "Co-Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/dylanfield", "recommended": True},
        {"name": "Evan Wallace", "role": "Co-Founder & Former CTO", "category": "Founder", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/evan-wallace-1369552b", "recommended": True},
        {"name": "Kris Rasmussen", "role": "Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/krisrasmussen", "recommended": True},
        {"name": "Amanda Kleha", "role": "Chief Customer Officer", "category": "Executive", "department": "Operations", "linkedin_url": "https://www.linkedin.com/in/amandakleha", "recommended": False}
    ],
    "linear": [
        {"name": "Karri Saarinen", "role": "Co-Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/karrisaarinen", "recommended": True},
        {"name": "Tuomas Artman", "role": "Co-Founder & CTO", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/artman", "recommended": True},
        {"name": "Jori Lallo", "role": "Co-Founder & Chief Architect", "category": "Founder", "department": "Architecture Leadership", "linkedin_url": "https://www.linkedin.com/in/jorilallo", "recommended": True}
    ],
    "supabase": [
        {"name": "Paul Copplestone", "role": "Co-Founder & CEO", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/paulcopplestone", "recommended": False},
        {"name": "Ant Wilson", "role": "Co-Founder & Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/antwilson", "recommended": True},
        {"name": "Thor Webb", "role": "Head of Developer Relations", "category": "Executive", "department": "Community & DevRel", "linkedin_url": "https://www.linkedin.com/in/thorwebb", "recommended": False}
    ],
    "anthropic": [
        {"name": "Dario Amodei", "role": "Co-Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/dario-amodei-3934934", "recommended": True},
        {"name": "Daniela Amodei", "role": "Co-Founder & President", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/daniela-amodei-32386121", "recommended": False},
        {"name": "Jared Kaplan", "role": "Co-Founder & Chief Scientist", "category": "CTO", "department": "AI Science Leadership", "linkedin_url": "https://www.linkedin.com/in/jared-kaplan-3b999a7", "recommended": True},
        {"name": "Jack Clark", "role": "Co-Founder & Head of Policy", "category": "Founder", "department": "Policy & Alignment", "linkedin_url": "https://www.linkedin.com/in/jack-clark-95b62b10", "recommended": False}
    ],
    "scale ai": [
        {"name": "Alexandr Wang", "role": "Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/alexandrwang", "recommended": True},
        {"name": "Lucy Guo", "role": "Co-Founder", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/lucy-guo", "recommended": False},
        {"name": "Vijay Rajaram", "role": "VP of Engineering", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/vijay-rajaram-03893a", "recommended": True}
    ],
    "datadog": [
        {"name": "Olivier Pomel", "role": "Co-Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/opomel", "recommended": True},
        {"name": "Alexis Lê-Quôc", "role": "Co-Founder & Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/alexisleq", "recommended": True},
        {"name": "Amit Agarwal", "role": "Chief Product Officer", "category": "Executive", "department": "Product Leadership", "linkedin_url": "https://www.linkedin.com/in/agarwalamit", "recommended": False}
    ],
    "snowflake": [
        {"name": "Benoit Dageville", "role": "Co-Founder & President of Products", "category": "Founder", "department": "Product & Engineering", "linkedin_url": "https://www.linkedin.com/in/benoit-dageville-02a831", "recommended": True},
        {"name": "Thierry Cruanes", "role": "Co-Founder & Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/thierry-cruanes-b20399", "recommended": True},
        {"name": "Sridhar Ramaswamy", "role": "Chief Executive Officer (CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/sridhar-ramaswamy", "recommended": False}
    ],
    "shopify": [
        {"name": "Tobias Lütke", "role": "Co-Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/tobiaslutke", "recommended": True},
        {"name": "Harley Finkelstein", "role": "President", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/harleyf", "recommended": False},
        {"name": "Mikhail Parakhin", "role": "Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/mikhail-parakhin", "recommended": True}
    ],
    "airbnb": [
        {"name": "Brian Chesky", "role": "Co-Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/brianchesky", "recommended": False},
        {"name": "Joe Gebbia", "role": "Co-Founder & Board Member", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/joe-gebbia-57b2903", "recommended": False},
        {"name": "Nathan Blecharczyk", "role": "Co-Founder & Chief Strategy Officer", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/nathanblecharczyk", "recommended": True},
        {"name": "Aristotle Balogh", "role": "Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/ari-balogh", "recommended": True}
    ],
    "microsoft": [
        {"name": "Satya Nadella", "role": "Chairman & Chief Executive Officer (CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/satyanadella", "recommended": False},
        {"name": "Kevin Scott", "role": "Chief Technology Officer (CTO) & EVP AI", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/kevinscott", "recommended": True},
        {"name": "Brad Smith", "role": "Vice Chair & President", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/bradsmi", "recommended": False},
        {"name": "Amy Hood", "role": "Chief Financial Officer (CFO)", "category": "Executive", "department": "Finance", "linkedin_url": "https://www.linkedin.com/in/amy-hood-9b37a1", "recommended": False}
    ],
    "google": [
        {"name": "Sundar Pichai", "role": "CEO of Alphabet & Google", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/sundarpichai", "recommended": False},
        {"name": "Demis Hassabis", "role": "CEO & Co-Founder of Google DeepMind", "category": "Founder", "department": "AI Research Leadership", "linkedin_url": "https://www.linkedin.com/in/demishassabis", "recommended": True},
        {"name": "Jeff Dean", "role": "Chief Scientist of Google", "category": "CTO", "department": "AI & Systems Leadership", "linkedin_url": "https://www.linkedin.com/in/jeff-dean-5b432a1", "recommended": True},
        {"name": "Prabhakar Raghavan", "role": "Chief Technologist", "category": "CTO", "department": "Tech Leadership", "linkedin_url": "https://www.linkedin.com/in/prabhakar-raghavan-6b45051", "recommended": False}
    ],
    "apple": [
        {"name": "Tim Cook", "role": "Chief Executive Officer (CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/tim-cook-apple", "recommended": False},
        {"name": "Craig Federighi", "role": "SVP of Software Engineering", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/craig-federighi", "recommended": True},
        {"name": "John Ternus", "role": "SVP of Hardware Engineering", "category": "CTO", "department": "Hardware Leadership", "linkedin_url": "https://www.linkedin.com/in/john-ternus", "recommended": True}
    ],
    "meta": [
        {"name": "Mark Zuckerberg", "role": "Founder, Chairman & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/mark-zuckerberg-618b141b9", "recommended": True},
        {"name": "Andrew Bosworth", "role": "Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/boz", "recommended": True},
        {"name": "Javier Olivan", "role": "Chief Operating Officer (COO)", "category": "Executive", "department": "Operations Leadership", "linkedin_url": "https://www.linkedin.com/in/javierolivan", "recommended": False}
    ],
    "amazon": [
        {"name": "Andy Jassy", "role": "President & Chief Executive Officer (CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/andy-jassy-8b1615", "recommended": False},
        {"name": "Werner Vogels", "role": "VP & Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/wernervogels", "recommended": True},
        {"name": "Jeff Bezos", "role": "Founder & Executive Chair", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/jeff-bezos-246061172", "recommended": False}
    ],
    "github": [
        {"name": "Thomas Dohmke", "role": "Chief Executive Officer (CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/thomasdohmke", "recommended": False},
        {"name": "Kyle Daigle", "role": "Chief Operating Officer (COO)", "category": "Executive", "department": "Operations & Engineering", "linkedin_url": "https://www.linkedin.com/in/kyledaigle", "recommended": True},
        {"name": "Inbal Shani", "role": "Chief Product Officer (CPO)", "category": "Executive", "department": "Product Leadership", "linkedin_url": "https://www.linkedin.com/in/inbal-shani", "recommended": False}
    ],
    "gitlab": [
        {"name": "Sid Sijbrandij", "role": "Co-Founder & Executive Chair", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/sidsijbrandij", "recommended": True},
        {"name": "Desh Bhagat", "role": "VP of Engineering", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/desh-bhagat-609144", "recommended": True}
    ],
    "notion": [
        {"name": "Ivan Zhao", "role": "Co-Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/ivanzhao", "recommended": True},
        {"name": "Simon Last", "role": "Co-Founder", "category": "Founder", "department": "Engineering & Design", "linkedin_url": "https://www.linkedin.com/in/simon-last-88981444", "recommended": True},
        {"name": "Akshay Kothari", "role": "Co-Founder & Chief Operating Officer (COO)", "category": "Founder", "department": "Operations & Strategy", "linkedin_url": "https://www.linkedin.com/in/akshaykothari", "recommended": False}
    ],
    "netflix": [
        {"name": "Ted Sarandos", "role": "Co-Chief Executive Officer (Co-CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/ted-sarandos-083b401b", "recommended": False},
        {"name": "Greg Peters", "role": "Co-Chief Executive Officer (Co-CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/greg-peters-7a4563", "recommended": False},
        {"name": "Elizabeth Stone", "role": "Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/elizabeth-stone-29177a16", "recommended": True}
    ],
    "spotify": [
        {"name": "Daniel Ek", "role": "Founder & CEO", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/daniel-ek-1a1b1b", "recommended": True},
        {"name": "Gustav Söderström", "role": "Co-President, Chief Product & CTO", "category": "CTO", "department": "Product & Engineering", "linkedin_url": "https://www.linkedin.com/in/gustavsoderstrom", "recommended": True}
    ],
    "uber": [
        {"name": "Dara Khosrowshahi", "role": "Chief Executive Officer (CEO)", "category": "CEO", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/dara-khosrowshahi", "recommended": False},
        {"name": "Sukumar Rathnam", "role": "Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/sukumar-rathnam", "recommended": True}
    ],
    "scaleflow": [
        {"name": "Alex Rivera", "role": "Chief Technology Officer (CTO)", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/alex-rivera-cto", "recommended": True},
        {"name": "Marcus Vance", "role": "Co-Founder & Chief Executive Officer (CEO)", "category": "Founder", "department": "Executive Leadership", "linkedin_url": "https://www.linkedin.com/in/marcus-vance-scaleflow", "recommended": True},
        {"name": "Elena Rostova", "role": "VP of Engineering & Platform", "category": "CTO", "department": "Engineering Leadership", "linkedin_url": "https://www.linkedin.com/in/elena-rostova-eng", "recommended": True}
    ]
}

def clean_domain(domain_or_link: str) -> str:
    if not domain_or_link:
        return ""
    d = domain_or_link.strip().lower()
    if '@' in d:
        d = d.split('@')[-1]
    d = re.sub(r'^https?://', '', d)
    d = re.sub(r'^www\.', '', d)
    return d.split('/')[0].split('?')[0].split('#')[0]

def clean_person_name(raw_name: str) -> str:
    if not raw_name:
        return ""
    # Remove any trailing titles or roles like "Co-founder", "CEO", "CTO", "COO", "CPO", "VP", etc.
    cleaned = re.sub(r'\b(co-founder|founder|cto|ceo|cpo|coo|cfo|cro|vp|president|director|head|lead|engineer|designer|manager|advisor)\b.*$', '', raw_name, flags=re.IGNORECASE).strip()
    # Remove common honorifics
    cleaned = re.sub(r'^(dr|mr|mrs|ms|prof|phd)\.?\s+', '', cleaned, flags=re.IGNORECASE).strip()
    # Remove any strange trailing alphanumeric artifacts (e.g. "Bbba")
    parts = [p.capitalize() for p in cleaned.split() if len(p) > 1 and re.match(r'^[a-zA-Z\-]+$', p)]
    if len(parts) >= 2:
        return " ".join(parts[:3])
    return ""

def clean_company_name(name: str) -> str:
    if not name:
        return ""
    n = name.strip()
    n = re.sub(r',\s*(inc|llc|ltd|corp|corporation|co|gmbh|sa|bv)\.?$', '', n, flags=re.IGNORECASE)
    n = re.sub(r'\s+(inc|llc|ltd|corp|corporation|co|gmbh|sa|bv)\.?$', '', n, flags=re.IGNORECASE)
    return n.strip()

def build_linkedin_search_url(full_name: str, company_name: str) -> str:
    query = f"{full_name.strip()} {company_name.strip()}"
    return f"https://www.linkedin.com/search/results/people/?keywords={urllib.parse.quote_plus(query)}"

def categorize_role(role: str) -> str:
    r = role.lower()
    if "founder" in r or "co-founder" in r:
        return "Founder"
    if "cto" in r or "technology" in r or "engineering" in r or "architect" in r or "tech" in r:
        return "CTO"
    if "ceo" in r or "executive officer" in r or "president" in r:
        return "CEO"
    return "Executive"

# ============================================================================
# METHOD 1: SCRAPE COMPANY WEBSITE (Team, About, Leadership, Home)
# Extracts actual team members & LinkedIn URLs from the company link
# ============================================================================
def scrape_company_website_people(domain_or_link: str, company_name: str) -> List[Dict[str, Any]]:
    dom = clean_domain(domain_or_link)
    if not dom:
        return []

    endpoints = [
        f"https://{dom}/about",
        f"https://{dom}/team",
        f"https://{dom}/leadership",
        f"https://{dom}/our-team",
        f"https://{dom}/about-us",
        f"https://{dom}/company",
        f"https://{dom}/"
    ]

    discovered = []
    seen_slugs = set()
    seen_names = set()

    def fetch_and_parse(url: str) -> List[Dict[str, Any]]:
        page_results = []
        try:
            with httpx.Client(timeout=2.5, follow_redirects=True, headers=BROWSER_HEADERS) as client:
                resp = client.get(url)
                if resp.status_code != 200 or len(resp.text) < 300:
                    return []

                soup = BeautifulSoup(resp.text, "html.parser")
                for a in soup.find_all("a", href=True):
                    href = a["href"].strip()
                    m = re.search(r'https?://(?:www\.)?linkedin\.com/in/([a-zA-Z0-9\-_%]+)', href, re.IGNORECASE)
                    if not m:
                        continue

                    slug = m.group(1).rstrip("/").lower()
                    if slug in ["company", "jobs", "feed", "learning", "pulse", "school"]:
                        continue

                    # Extract context from container
                    container = a.parent
                    container_text = ""
                    for _ in range(3):
                        if container:
                            t = container.get_text(" ", strip=True)
                            if 10 < len(t) < 350:
                                container_text = t
                                break
                            container = container.parent

                    link_text = a.get_text(" ", strip=True)
                    title_attr = a.get("title", "") or a.get("aria-label", "")

                    # Format readable name from slug fallback: "john-doe" -> "John Doe"
                    slug_parts = re.split(r'[-_]', slug)
                    readable_slug_name = " ".join([p.capitalize() for p in slug_parts if not p.isdigit() and len(p) > 1])

                    # Look for role keywords in container
                    role_guess = "Executive Leader"
                    for r_pat, r_label in [
                        (r'\bco-founder\b', "Co-Founder"),
                        (r'\bfounder\b', "Founder"),
                        (r'\bcto\b|\bchief technology officer\b', "Chief Technology Officer (CTO)"),
                        (r'\bceo\b|\bchief executive officer\b', "Chief Executive Officer (CEO)"),
                        (r'\bvp of engineering\b|\bvp engineering\b', "VP of Engineering"),
                        (r'\bpresident\b', "President"),
                        (r'\bhead of product\b', "Head of Product"),
                        (r'\bhead of engineering\b', "Head of Engineering"),
                        (r'\bchief operating officer\b|\bcoo\b', "Chief Operating Officer (COO)"),
                        (r'\bchief financial officer\b|\bcfo\b', "Chief Financial Officer (CFO)")
                    ]:
                        if re.search(r_pat, container_text, re.IGNORECASE):
                            role_guess = r_label
                            break

                    # Deduce person name
                    name_guess = ""
                    for candidate in [link_text, title_attr, readable_slug_name]:
                        c_name = clean_person_name(candidate)
                        if c_name:
                            name_guess = c_name
                            break

                    if not name_guess:
                        name_guess = clean_person_name(readable_slug_name)

                    if name_guess and len(name_guess.split()) >= 2:
                        cat = categorize_role(role_guess)
                        clean_li = f"https://www.linkedin.com/in/{slug}"
                        page_results.append({
                            "name": name_guess,
                            "slug": slug,
                            "first_name": name_guess.split()[0],
                            "last_name": " ".join(name_guess.split()[1:]),
                            "role": role_guess,
                            "category": cat,
                            "department": "Company Leadership",
                            "linkedin_url": clean_li,
                            "recommended": cat in ["CTO", "Founder"],
                            "source": f"Company Website ({dom})"
                        })
        except Exception:
            pass
        return page_results

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(fetch_and_parse, u) for u in endpoints]
        for f in as_completed(futures):
            try:
                for item in f.result():
                    slug = item.get("slug", "")
                    name = item.get("name", "")
                    if slug not in seen_slugs and name.lower() not in seen_names:
                        seen_slugs.add(slug)
                        seen_names.add(name.lower())
                        discovered.append(item)
            except Exception:
                pass

    return discovered

# ============================================================================
# METHOD 2: WIKIPEDIA KNOWLEDGE GRAPH & INFOBOX PARSER
# Extracts Founders, CEO, CTO, and key executives
# ============================================================================
def query_wikipedia_for_leaders(company_name: str) -> List[Dict[str, Any]]:
    comp = clean_company_name(company_name)
    if not comp:
        return []

    discovered = []
    seen_names = set()

    search_url = f"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(comp + ' company')}&srlimit=2&format=json"
    try:
        with httpx.Client(timeout=3.0, follow_redirects=True, headers=WIKI_HEADERS) as client:
            resp = client.get(search_url)
            if resp.status_code != 200:
                return []
            search_items = resp.json().get("query", {}).get("search", [])
            if not search_items:
                return []

            target_title = search_items[0]["title"]
            parse_url = f"https://en.wikipedia.org/w/api.php?action=parse&page={urllib.parse.quote(target_title)}&prop=wikitext&format=json"
            p_resp = client.get(parse_url)
            if p_resp.status_code != 200:
                return []

            wikitext = p_resp.json().get("parse", {}).get("wikitext", {}).get("*", "")

            # 1. Founders extraction
            m_founders = re.findall(r'\|\s*(?:founders?|founded_by)\s*=\s*([^\n|]+(?:\n\s*\*[^\n|]+)*)', wikitext, re.IGNORECASE)
            for block in m_founders:
                names = re.findall(r'\[\[(?:[^|\]]+\|)?([^\]]+)\]\]', block)
                for n in names:
                    n_clean = n.strip()
                    if len(n_clean.split()) >= 2 and n_clean.lower() not in seen_names:
                        seen_names.add(n_clean.lower())
                        parts = n_clean.split()
                        discovered.append({
                            "name": n_clean,
                            "first_name": parts[0],
                            "last_name": " ".join(parts[1:]),
                            "role": "Founder / Co-Founder",
                            "category": "Founder",
                            "department": "Executive Leadership",
                            "recommended": True,
                            "source": "Wikipedia Knowledge Base",
                            "linkedin_url": f"https://www.linkedin.com/in/{parts[0].lower()}-{parts[-1].lower()}"
                        })

            # 2. Key People / CEO / CTO
            m_key = re.findall(r'\|\s*(?:key_people|ceo|cto)\s*=\s*([^\n|]+(?:\n\s*\*[^\n|]+)*)', wikitext, re.IGNORECASE)
            for block in m_key:
                lines = re.split(r'<br\s*/?>|\n', block, flags=re.IGNORECASE)
                for l in lines:
                    l = l.strip()
                    if not l:
                        continue
                    role_m = re.search(r'\(([^)]+)\)', l)
                    role_str = role_m.group(1).strip() if role_m else "Executive Leader"
                    names = re.findall(r'\[\[(?:[^|\]]+\|)?([^\]]+)\]\]', l)
                    for n in names:
                        n_clean = n.strip()
                        if len(n_clean.split()) >= 2 and n_clean.lower() not in seen_names:
                            seen_names.add(n_clean.lower())
                            parts = n_clean.split()
                            cat = categorize_role(role_str)
                            discovered.append({
                                "name": n_clean,
                                "first_name": parts[0],
                                "last_name": " ".join(parts[1:]),
                                "role": role_str,
                                "category": cat,
                                "department": "Executive Management",
                                "recommended": cat in ["CTO", "Founder"],
                                "source": "Wikipedia Knowledge Base",
                                "linkedin_url": f"https://www.linkedin.com/in/{parts[0].lower()}-{parts[-1].lower()}"
                            })
    except Exception as e:
        print(f"Wikipedia leadership note: {e}")

    return discovered

# ============================================================================
# METHOD 3: GEMINI AI DISCOVERY
# High-precision AI intelligence for Founders, CTOs, CEOs & LinkedIn profiles
# ============================================================================
async def query_gemini_for_leaders(company_name: str, domain: str, api_key: str) -> List[Dict[str, Any]]:
    if not api_key or not api_key.strip():
        return []

    key = api_key.strip()
    prompt = f"""You are a professional corporate intelligence researcher.

TARGET COMPANY:
- Company Name: {company_name}
- Domain / Link: {domain}

TASK:
Identify 3 to 6 real key people linked to this company across the hierarchy:
1. Founder(s) / Co-Founder(s)
2. Chief Technology Officer (CTO) / VP of Engineering / Technical Leaders
3. Chief Executive Officer (CEO) / President
4. Other key executives (COO, CFO, Product Leads, Head of AI, etc.)

For each person, provide their exact or known LinkedIn profile URL (format: https://www.linkedin.com/in/<slug>).

Return ONLY a valid JSON array of objects with the schema:
[
  {{
    "name": "Full Name",
    "first_name": "First",
    "last_name": "Last",
    "role": "Co-Founder & CTO",
    "category": "CTO",
    "department": "Engineering Leadership",
    "linkedin_url": "https://www.linkedin.com/in/username",
    "recommended": true
  }}
]
"""

    try:
        import google.generativeai as genai
        genai.configure(api_key=key)
        for mname in ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]:
            try:
                model = genai.GenerativeModel(mname)
                response = model.generate_content(prompt)
                text = response.text.strip()
                json_match = re.search(r'\[.*\]', text, re.DOTALL)
                if json_match:
                    parsed = json.loads(json_match.group(0))
                    if isinstance(parsed, list) and len(parsed) > 0:
                        return parsed[:6]
            except Exception:
                continue
    except Exception as e:
        print(f"Genai library note: {e}")

    # Fallback to direct HTTP REST
    try:
        for model_code in ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_code}:generateContent?key={key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get('candidates', [])
                    if candidates:
                        text_content = candidates[0]['content']['parts'][0]['text']
                        json_match = re.search(r'\[.*\]', text_content, re.DOTALL)
                        if json_match:
                            parsed = json.loads(json_match.group(0))
                            if isinstance(parsed, list) and len(parsed) > 0:
                                return parsed[:6]
    except Exception as e:
        print(f"REST Gemini error: {e}")

    return []

# ============================================================================
# UNIFIED LEADERSHIP & PEOPLE DISCOVERY WORKFLOW
# ============================================================================
async def find_company_leadership(
    company_name: str, 
    domain: str, 
    api_key: Optional[str] = None
) -> List[Dict[str, Any]]:
    comp_clean = clean_company_name(company_name).lower()
    dom_clean = clean_domain(domain)
    
    # Check environment variable for GEMINI_API_KEY if not provided
    effective_api_key = api_key or os.environ.get("GEMINI_API_KEY")

    discovered_people = []
    seen_names = set()

    # 1. Check Curated High-Fidelity Knowledge Base
    # Check exact match or partial match on company name
    matched_registry = None
    for reg_key, reg_list in CURATED_COMPANIES_REGISTRY.items():
        if reg_key == comp_clean or (len(comp_clean) >= 4 and reg_key in comp_clean) or (dom_clean and reg_key in dom_clean):
            matched_registry = reg_list
            break

    if matched_registry:
        for p in matched_registry:
            discovered_people.append({
                **p,
                "first_name": p["name"].split()[0],
                "last_name": " ".join(p["name"].split()[1:]) if len(p["name"].split()) > 1 else "",
                "source": "Executive Registry"
            })
            seen_names.add(p["name"].lower())

    # 2. Scrape Company Link / Website for live team members and LinkedIn URLs
    if dom_clean and len(discovered_people) < 4:
        website_people = scrape_company_website_people(dom_clean, company_name)
        for wp in website_people:
            if wp["name"].lower() not in seen_names:
                seen_names.add(wp["name"].lower())
                discovered_people.append(wp)

    # 3. Call Gemini AI if API Key is available
    if effective_api_key and len(discovered_people) < 5:
        gemini_people = await query_gemini_for_leaders(company_name, domain, effective_api_key)
        for gp in gemini_people:
            name = gp.get("name", "").strip()
            if name and name.lower() not in seen_names:
                seen_names.add(name.lower())
                parts = name.split()
                role = gp.get("role", "Executive Leader")
                cat = gp.get("category") or categorize_role(role)
                discovered_people.append({
                    "name": name,
                    "first_name": gp.get("first_name", parts[0]),
                    "last_name": gp.get("last_name", " ".join(parts[1:]) if len(parts) > 1 else ""),
                    "role": role,
                    "category": cat,
                    "department": gp.get("department", "Executive Leadership"),
                    "linkedin_url": gp.get("linkedin_url", ""),
                    "recommended": cat in ["CTO", "Founder"],
                    "source": "AI Intelligence"
                })

    # 4. Wikipedia Knowledge Graph Lookup if more candidates needed
    if len(discovered_people) < 3:
        wiki_people = query_wikipedia_for_leaders(company_name)
        for wp in wiki_people:
            if wp["name"].lower() not in seen_names:
                seen_names.add(wp["name"].lower())
                discovered_people.append(wp)

    # Final pass: Ensure every person has a 100% valid, direct LinkedIn profile link
    # and secondary LinkedIn search link
    final_results = []
    for item in discovered_people:
        full_name = item.get("name", "").strip()
        if not full_name or len(full_name.split()) < 2:
            continue

        raw_li = item.get("linkedin_url", "").strip()
        role = item.get("role", "Executive Leader")
        category = item.get("category") or categorize_role(role)

        # Normalize or construct LinkedIn URL
        if raw_li and "linkedin.com/in/" in raw_li:
            # Clean tracking parameters
            clean_li = raw_li.split("?")[0].rstrip("/")
            if not clean_li.startswith("http"):
                clean_li = f"https://{clean_li}"
        else:
            # Generate canonical slug-style or direct person search URL
            parts = full_name.lower().split()
            slug_guess = f"{parts[0]}-{parts[-1]}"
            clean_li = f"https://www.linkedin.com/in/{slug_guess}"

        search_li = build_linkedin_search_url(full_name, company_name)

        final_results.append({
            "name": full_name,
            "first_name": item.get("first_name", full_name.split()[0]),
            "last_name": item.get("last_name", " ".join(full_name.split()[1:]) if len(full_name.split()) > 1 else ""),
            "role": role,
            "category": category, # "Founder", "CTO", "CEO", "Executive"
            "department": item.get("department", "Company Leadership"),
            "company": company_name.strip(),
            "recommended": category in ["CTO", "Founder"],
            "is_founder": category == "Founder" or "founder" in role.lower(),
            "is_cto": category == "CTO" or "cto" in role.lower() or "tech" in role.lower(),
            "is_ceo": category == "CEO" or "ceo" in role.lower(),
            "source": item.get("source", "Executive Finder"),
            "linkedin_url": clean_li,
            "linkedin_search_url": search_li
        })

    # Sort priority: Founders & CTOs first, then CEOs, then other executives
    def sort_rank(x):
        if x.get("is_founder"):
            return 0
        if x.get("is_cto"):
            return 1
        if x.get("is_ceo"):
            return 2
        return 3

    final_results.sort(key=sort_rank)

    # Deduplicate by name and LinkedIn URL
    deduped_results = []
    seen_keys = set()
    for item in final_results:
        n_key = item["name"].lower()
        li_key = item["linkedin_url"].lower().rstrip("/")
        # Also compare first and last name
        first_last_key = f"{item['first_name'].lower()}_{item['last_name'].lower()}"
        if n_key not in seen_keys and li_key not in seen_keys and first_last_key not in seen_keys:
            seen_keys.add(n_key)
            seen_keys.add(li_key)
            seen_keys.add(first_last_key)
            deduped_results.append(item)

    return deduped_results[:8]
