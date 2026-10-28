import re
import urllib.parse
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
}

def clean_domain(domain: str) -> str:
    if not domain:
        return ""
    dom = domain.strip().lower()
    if '@' in dom:
        dom = dom.split('@')[-1]
    dom = re.sub(r'https?://', '', dom)
    dom = re.sub(r'www\.', '', dom)
    return dom.split('/')[0].split('?')[0].split('#')[0]

def strip_titles(name: str) -> str:
    if not name:
        return ""
    name = name.strip()
    name = re.sub(r'^(dr|mr|mrs|ms|prof|phd)\.?\s+', '', name, flags=re.IGNORECASE)
    return name

def clean_name(name: str) -> str:
    if not name:
        return ""
    name = strip_titles(name)
    name = re.sub(r'[^a-zA-Z0-9]', '', name.strip().lower())
    return name

def parse_full_name(first_name: str, last_name: str) -> tuple[str, str]:
    fn_raw = strip_titles(first_name)
    ln_raw = strip_titles(last_name)
    
    if fn_raw and not ln_raw:
        parts = fn_raw.split()
        if len(parts) > 1:
            fn_raw = parts[0]
            ln_raw = " ".join(parts[1:])
            
    return clean_name(fn_raw), clean_name(ln_raw)

# ============================================================================
# TIER 1: On-Page Scraping & Web OSINT (.well-known, security.txt, mailto)
# ============================================================================
def run_tier1_web_osint(domain: str) -> List[str]:
    """Scrapes security.txt, .well-known, and contact endpoints for explicit domain emails."""
    dom = clean_domain(domain)
    if not dom:
        return []

    endpoints = [
        f"https://{dom}/.well-known/security.txt",
        f"https://{dom}/security.txt"
    ]

    discovered_emails = set()
    email_regex = re.compile(rf'[a-zA-Z0-9._%+-]+@{re.escape(dom)}', re.IGNORECASE)

    def scrape_url(url: str):
        try:
            with httpx.Client(timeout=2.0, follow_redirects=True, headers=BROWSER_HEADERS) as client:
                resp = client.get(url)
                if resp.status_code == 200:
                    matches = email_regex.findall(resp.text)
                    for m in matches:
                        discovered_emails.add(m.lower())
        except Exception:
            pass

    with ThreadPoolExecutor(max_workers=2) as executor:
        executor.map(scrape_url, endpoints)

    return list(discovered_emails)

# ============================================================================
# TIER 2: Search Engine Footprinting (Extracting pattern from Google/DDG)
# ============================================================================
def run_tier2_search_footprinting(domain: str) -> Optional[Dict[str, Any]]:
    """Scrapes public search footprints to infer the domain's dominant corporate email formula."""
    dom = clean_domain(domain)
    if not dom:
        return None

    query = f'"{dom}" "@{dom}"'
    url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote_plus(query)}"

    try:
        with httpx.Client(timeout=2.5, follow_redirects=True, headers=BROWSER_HEADERS) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                html = resp.text
                email_regex = re.compile(rf'([a-zA-Z0-9._%+-]+)@{re.escape(dom)}', re.IGNORECASE)
                matches = email_regex.findall(html)
                
                patterns_found = []
                for username in matches:
                    u = username.lower()
                    if '.' in u:
                        patterns_found.append("first.last")
                    elif '_' in u:
                        patterns_found.append("first_last")
                    elif len(u) <= 10 and not any(char.isdigit() for char in u):
                        patterns_found.append("first")
                    else:
                        patterns_found.append("f.last")

                if patterns_found:
                    dominant_pattern = max(set(patterns_found), key=patterns_found.count)
                    return {
                        "inferred_pattern": dominant_pattern,
                        "sample_count": len(matches),
                        "description": f"Domain footprint analysis discovered {len(matches)} public emails matching pattern '{dominant_pattern}'"
                    }
    except Exception:
        pass

    return None

# ============================================================================
# TIER 3: Executive GitHub User Search (Profile API + Commit Filtering)
# ============================================================================
def run_tier3_github_search(first_name: str, last_name: str, domain: str) -> List[str]:
    """Queries GitHub User API and commit author headers for matching corporate emails."""
    fn, ln = parse_full_name(first_name, last_name)
    dom = clean_domain(domain)
    
    if not fn or not dom:
        return []

    discovered = set()
    query_name = f"{fn}+{ln}" if ln else fn
    url = f"https://api.github.com/search/users?q={query_name}+in:name"

    try:
        with httpx.Client(timeout=2.5, follow_redirects=True, headers={"User-Agent": "ColdCraftAI-OSINT"}) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                users = resp.json().get("items", [])[:2]
                for u in users:
                    username = u.get("login")
                    if not username:
                        continue
                    
                    user_url = f"https://api.github.com/users/{username}"
                    u_resp = client.get(user_url)
                    if u_resp.status_code == 200:
                        u_data = u_resp.json()
                        email = u_data.get("email")
                        if email and dom in email.lower():
                            discovered.add(email.lower())
    except Exception:
        pass

    return list(discovered)

# ============================================================================
# TIER 4: Public PGP Key Server Lookups (keyserver.ubuntu.com)
# ============================================================================
def run_tier4_pgp_keyserver(first_name: str, last_name: str, domain: str) -> List[str]:
    """Queries public PGP key servers (Ubuntu PGP keyserver) for registered keys."""
    fn, ln = parse_full_name(first_name, last_name)
    dom = clean_domain(domain)
    
    if not fn or not dom:
        return []

    discovered = set()
    search_term = f"{fn} {ln} {dom}".strip()
    url = f"https://keyserver.ubuntu.com/pks/lookup?search={urllib.parse.quote(search_term)}&op=index"

    try:
        with httpx.Client(timeout=2.5, follow_redirects=True, headers=BROWSER_HEADERS) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                html = resp.text
                email_regex = re.compile(rf'([a-zA-Z0-9._%+-]+)@{re.escape(dom)}', re.IGNORECASE)
                matches = email_regex.findall(html)
                for m in matches:
                    discovered.add(f"{m.lower()}@{dom}")
    except Exception:
        pass

    return list(discovered)

# ============================================================================
# UNIFIED 5-TIER OSINT PIPELINE EXECUTOR
# ============================================================================
def run_full_osint_pipeline(first_name: str, last_name: str, domain: str) -> Dict[str, Any]:
    """Executes Tiers 1-4 sequentially in parallel and returns aggregated evidence."""
    dom = clean_domain(domain)
    
    results = {
        "tier1_onpage_emails": [],
        "tier2_pattern": None,
        "tier3_github_emails": [],
        "tier4_pgp_emails": [],
        "evidence_summary": []
    }

    with ThreadPoolExecutor(max_workers=4) as executor:
        f_t1 = executor.submit(run_tier1_web_osint, dom)
        f_t2 = executor.submit(run_tier2_search_footprinting, dom)
        f_t3 = executor.submit(run_tier3_github_search, first_name, last_name, dom)
        f_t4 = executor.submit(run_tier4_pgp_keyserver, first_name, last_name, dom)

        try:
            results["tier1_onpage_emails"] = f_t1.result()
            if results["tier1_onpage_emails"]:
                results["evidence_summary"].append(f"Tier 1 Web OSINT: Found {len(results['tier1_onpage_emails'])} explicit email(s) on domain contact/security pages.")
        except Exception:
            pass

        try:
            results["tier2_pattern"] = f_t2.result()
            if results["tier2_pattern"]:
                results["evidence_summary"].append(f"Tier 2 Search Footprint: Discovered dominant domain pattern '{results['tier2_pattern']['inferred_pattern']}'.")
        except Exception:
            pass

        try:
            results["tier3_github_emails"] = f_t3.result()
            if results["tier3_github_emails"]:
                results["evidence_summary"].append(f"Tier 3 GitHub OSINT: Discovered {len(results['tier3_github_emails'])} commit/profile email(s).")
        except Exception:
            pass

        try:
            results["tier4_pgp_emails"] = f_t4.result()
            if results["tier4_pgp_emails"]:
                results["evidence_summary"].append(f"Tier 4 PGP Key Server: Found {len(results['tier4_pgp_emails'])} registered public PGP key email(s).")
        except Exception:
            pass

    return results
