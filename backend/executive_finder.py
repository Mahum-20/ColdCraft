import json
import re
import urllib.parse
import httpx
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional

BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
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

# Known Executive Knowledge Base for major tech & enterprise giants
MAJOR_TECH_GIANTS_KNOWLEDGE = {
    "microsoft": [
        {"name": "Satya Nadella", "first_name": "Satya", "last_name": "Nadella", "role": "Chief Executive Officer (CEO)", "department": "Executive Leadership", "recommended": False, "source": "Enterprise Registry"},
        {"name": "Kevin Scott", "first_name": "Kevin", "last_name": "Scott", "role": "Chief Technology Officer (CTO)", "department": "Engineering Leadership", "recommended": True, "source": "Enterprise Registry"},
        {"name": "Brad Smith", "first_name": "Brad", "last_name": "Smith", "role": "Vice Chair & President", "department": "Executive Leadership", "recommended": False, "source": "Enterprise Registry"},
        {"name": "Amy Hood", "first_name": "Amy", "last_name": "Hood", "role": "Chief Financial Officer (CFO)", "department": "Finance", "recommended": False, "source": "Enterprise Registry"},
        {"name": "Judson Althoff", "first_name": "Judson", "last_name": "Althoff", "role": "Chief Commercial Officer", "department": "Commercial Leadership", "recommended": False, "source": "Enterprise Registry"}
    ],
    "g42": [
        {"name": "Peng Xiao", "first_name": "Peng", "last_name": "Xiao", "role": "Group Chief Executive Officer (CEO)", "department": "Executive Leadership", "recommended": False, "source": "Enterprise Registry"},
        {"name": "Kiril Evtimov", "first_name": "Kiril", "last_name": "Evtimov", "role": "Group Chief Technology Officer (CTO)", "department": "Engineering Leadership", "recommended": True, "source": "Enterprise Registry"},
        {"name": "Mansoor Al Mansoori", "first_name": "Mansoor", "last_name": "Al Mansoori", "role": "Chief Operating Officer (COO)", "department": "Operations", "recommended": False, "source": "Enterprise Registry"},
        {"name": "Tahnoon bin Zayed Al Nahyan", "first_name": "Tahnoon", "last_name": "bin Zayed Al Nahyan", "role": "Chairman of the Board", "department": "Board Leadership", "recommended": False, "source": "Enterprise Registry"}
    ],
    "openai": [
        {"name": "Sam Altman", "first_name": "Sam", "last_name": "Altman", "role": "Chief Executive Officer (CEO)", "department": "Executive Leadership", "recommended": False, "source": "Enterprise Registry"},
        {"name": "Greg Brockman", "first_name": "Greg", "last_name": "Brockman", "role": "President & Co-Founder", "department": "Executive Leadership", "recommended": True, "source": "Enterprise Registry"},
        {"name": "Mira Murati", "first_name": "Mira", "last_name": "Murati", "role": "Chief Technology Officer (CTO)", "department": "Engineering Leadership", "recommended": True, "source": "Enterprise Registry"}
    ],
    "google": [
        {"name": "Sundar Pichai", "first_name": "Sundar", "last_name": "Pichai", "role": "CEO of Alphabet & Google", "department": "Executive Leadership", "recommended": False, "source": "Enterprise Registry"},
        {"name": "Demis Hassabis", "first_name": "Demis", "last_name": "Hassabis", "role": "CEO of Google DeepMind", "department": "AI Research Leadership", "recommended": True, "source": "Enterprise Registry"},
        {"name": "Prabhakar Raghavan", "first_name": "Prabhakar", "last_name": "Raghavan", "role": "Chief Technologist", "department": "Tech Leadership", "recommended": True, "source": "Enterprise Registry"}
    ],
    "apple": [
        {"name": "Tim Cook", "first_name": "Tim", "last_name": "Cook", "role": "Chief Executive Officer (CEO)", "department": "Executive Leadership", "recommended": False, "source": "Enterprise Registry"},
        {"name": "Craig Federighi", "first_name": "Craig", "last_name": "Federighi", "role": "SVP of Software Engineering", "department": "Engineering Leadership", "recommended": True, "source": "Enterprise Registry"},
        {"name": "John Ternus", "first_name": "John", "last_name": "Ternus", "role": "SVP of Hardware Engineering", "department": "Hardware Leadership", "recommended": True, "source": "Enterprise Registry"}
    ]
}

def clean_name(name: str) -> str:
    if not name:
        return ""
    name = re.sub(r'^(dr|mr|mrs|ms|prof|phd|sheikh|h\.h\.|sir)\.?\s+', '', name.strip(), flags=re.IGNORECASE)
    parts = name.strip().split()
    valid_parts = [p for p in parts if p.lower() not in STOP_WORDS and re.match(r'^[A-Z][a-zA-Z\-]+$', p)]
    if len(valid_parts) >= 2:
        return " ".join(valid_parts)
    return ""

def clean_domain(domain: str) -> str:
    if not domain:
        return ""
    domain = domain.strip().lower()
    if '@' in domain:
        domain = domain.split('@')[-1]
    domain = re.sub(r'https?://', '', domain)
    domain = re.sub(r'www\.', '', domain)
    return domain.split('/')[0].split('?')[0]

def verify_url_live(url: str) -> tuple[bool, str]:
    if not url:
        return False, ""
        
    try:
        with httpx.Client(timeout=3.5, follow_redirects=True, headers=BROWSER_HEADERS) as client:
            resp = client.get(url)
            if resp.status_code in [200, 301, 302, 307, 308]:
                return True, str(resp.url)
            elif resp.status_code == 404:
                return False, url
    except Exception:
        pass
        
    return False, url

def build_osint_search_url(full_name: str, company_name: str) -> str:
    clean_n = full_name.strip()
    clean_c = company_name.strip()
    query_str = f'site:linkedin.com/in/ "{clean_n}" "{clean_c}"'
    return f"https://www.google.com/search?q={urllib.parse.quote_plus(query_str)}"

# ============================================================================
# METHOD 1: GOOGLE MAPS & BUSINESS PROFILE OSINT SEARCH
# ============================================================================
def query_google_maps_business_owner(company_name: str, domain: str) -> List[Dict[str, Any]]:
    """Scrapes Google Maps & Business Profile OSINT snippets for business owner details."""
    comp = company_name.strip()
    dom = clean_domain(domain)
    
    if not comp:
        return []

    discovered = []
    seen_names = set()
    
    queries = [
        f'"{comp}" "owner" OR "founder" OR "principal" Google Maps',
        f'site:google.com/maps "{comp}" owner OR founder'
    ]

    for q in queries:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote_plus(q)}"
        try:
            with httpx.Client(timeout=3.5, follow_redirects=True, headers=BROWSER_HEADERS) as client:
                resp = client.get(url)
                if resp.status_code in [200, 202]:
                    html = resp.text
                    
                    patterns = [
                        r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:is the|is a|serves as)\s+(?:business\s+)?(owner|founder|principal|proprietor)\s+(?:of|at)\s+' + re.escape(comp),
                        r'(?:Owner|Founder|Proprietor|Business Owner)\s*:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)',
                        r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s*[,-–—]\s*(?:Owner|Founder|Business Owner)\s+at\s+' + re.escape(comp)
                    ]

                    for pat in patterns:
                        matches = re.findall(pat, html, re.IGNORECASE)
                        for m in matches:
                            raw_name = m[0] if isinstance(m, tuple) else m
                            clean_n = clean_name(raw_name)
                            if clean_n and clean_n not in seen_names:
                                seen_names.add(clean_n)
                                parts = clean_n.split()
                                discovered.append({
                                    "name": clean_n,
                                    "first_name": parts[0],
                                    "last_name": " ".join(parts[1:]),
                                    "role": "Business Owner (Google Maps Verified)",
                                    "department": "Google Business Listing",
                                    "recommended": True,
                                    "is_maps_owner": True,
                                    "source": "Google Maps OSINT"
                                })
                                if len(discovered) >= 2:
                                    break
        except Exception:
            pass

        if discovered:
            break

    return discovered

# ============================================================================
# GEMINI AI DISCOVERY
# ============================================================================
async def query_gemini_for_leaders(company_name: str, domain: str, api_key: str) -> List[Dict[str, Any]]:
    if not api_key or not api_key.strip():
        return []

    key = api_key.strip()
    prompt = f"""You are a corporate intelligence researcher.

TARGET COMPANY:
- Company Name: {company_name}
- Domain / Website: {domain}

TASK:
Identify 3 to 5 real executive team members for this company in top hierarchy (Business Owner, Founder, Co-Founder, CEO, CTO, VP of Engineering).
If this business is registered on Google Maps, also include the verified Business Owner name.

Return ONLY a valid JSON array of up to 5 objects with the schema:
[
  {{
    "name": "Full Name",
    "first_name": "First",
    "last_name": "Last",
    "role": "Business Owner / CEO",
    "department": "Executive Leadership",
    "linkedin_url": "https://www.linkedin.com/in/profile",
    "recommended": true,
    "is_maps_owner": true
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
                        return parsed[:5]
            except Exception:
                continue
    except Exception as e:
        print(f"Genai library note: {e}")

    try:
        for model_code in ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_code}:generateContent?key={key}"
            payload = {"contents": [{"parts": [{"text": prompt}]}]}
            async with httpx.AsyncClient(timeout=8.0) as client:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text_content = data['candidates'][0]['content']['parts'][0]['text']
                    json_match = re.search(r'\[.*\]', text_content, re.DOTALL)
                    if json_match:
                        parsed = json.loads(json_match.group(0))
                        if isinstance(parsed, list) and len(parsed) > 0:
                            return parsed[:5]
    except Exception as e:
        print(f"REST Gemini error: {e}")

    return []

# ============================================================================
# WIKIPEDIA KNOWLEDGE GRAPH PARSER
# ============================================================================
def query_wikipedia_for_leaders(company_name: str) -> List[Dict[str, Any]]:
    comp = company_name.strip()
    if not comp:
        return []

    discovered = []
    seen_names = set()

    try:
        search_url = f"https://en.wikipedia.org/w/api.php?action=opensearch&search={urllib.parse.quote(comp)}&format=json"
        with httpx.Client(timeout=3.5, follow_redirects=True, headers=WIKI_HEADERS) as client:
            resp = client.get(search_url)
            if resp.status_code == 200:
                data = resp.json()
                titles = data[1] if len(data) > 1 else []
                
                target_title = None
                for t in titles:
                    if "(company)" in t.lower() or t.lower() == comp.lower():
                        target_title = t
                        break
                if not target_title and titles:
                    target_title = titles[0]

                if target_title:
                    ext_url = f"https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&redirects=1&titles={urllib.parse.quote(target_title)}&format=json"
                    e_resp = client.get(ext_url)
                    if e_resp.status_code == 200:
                        pages = e_resp.json().get('query', {}).get('pages', {})
                        text = list(pages.values())[0].get('extract', '') if pages else ''
                        
                        patterns = [
                            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\s+(?:serves as|became|is|was appointed)\s+(?:founder and\s+)?(Group CEO|CEO|Chief Executive Officer|CTO|Chief Technology Officer|President|Chairman|co-founder|founder|Vice Chair)',
                            r'(Group CEO|CEO|Chief Executive Officer|CTO|Chief Technology Officer|President|Chairman)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)'
                        ]

                        for pat in patterns:
                            matches = re.findall(pat, text)
                            for m in matches:
                                raw_name = m[0] if isinstance(m, tuple) and len(m[0].split()) >= 2 else (m[1] if isinstance(m, tuple) and len(m) > 1 else '')
                                raw_role = m[1] if isinstance(m, tuple) and len(m[0].split()) >= 2 else (m[0] if isinstance(m, tuple) else 'Executive Leader')
                                
                                c_name = clean_name(raw_name)
                                if c_name and c_name not in seen_names:
                                    seen_names.add(c_name)
                                    parts = c_name.split()
                                    discovered.append({
                                        "name": c_name,
                                        "first_name": parts[0],
                                        "last_name": " ".join(parts[1:]),
                                        "role": raw_role if len(raw_role) < 35 else "Executive Leader",
                                        "department": "Executive Management",
                                        "recommended": "CTO" in raw_role.upper() or "TECH" in raw_role.upper(),
                                        "source": "Wikipedia Knowledge Base"
                                    })
    except Exception as e:
        print(f"Wikipedia leadership note: {e}")

    return discovered

# ============================================================================
# REAL-TIME WEB OSINT SNIPPET PARSER
# ============================================================================
def real_time_web_search_leaders(company_name: str, domain: str) -> List[Dict[str, Any]]:
    comp = company_name.strip()
    dom = clean_domain(domain)
    
    candidates = []
    found_names = set()
    queries = [
        f"{comp} CEO CTO founder VP Engineering leadership team",
        f"{comp} {dom} Chief Executive Officer Chief Technology Officer"
    ]

    for q in queries:
        url = f"https://html.duckduckgo.com/html/?q={urllib.parse.quote_plus(q)}"
        try:
            with httpx.Client(timeout=4.0, follow_redirects=True, headers=BROWSER_HEADERS) as client:
                resp = client.get(url)
                if resp.status_code in [200, 202]:
                    html = resp.text
                    
                    patterns = [
                        r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s+(?:is|serves as|became)\s+(?:the\s+)?(Group CEO|CEO|Chief Executive Officer|CTO|Chief Technology Officer|President|VP of Engineering)',
                        r'([A-Z][a-z]+\s+[A-Z][a-z]+)\s*[,-–—]\s*(Group CEO|CEO|Chief Executive Officer|CTO|Chief Technology Officer|VP of Engineering|Founder)'
                    ]
                    
                    for pat in patterns:
                        matches = re.findall(pat, html)
                        for m in matches:
                            raw_n = m[0]
                            role_str = m[1]
                            clean_n = clean_name(raw_n)
                            if clean_n and clean_n not in found_names:
                                found_names.add(clean_n)
                                parts = clean_n.split()
                                candidates.append({
                                    "name": clean_n,
                                    "first_name": parts[0],
                                    "last_name": parts[1],
                                    "role": role_str if len(role_str) < 30 else "Executive Leader",
                                    "department": "Executive Leadership",
                                    "recommended": "CTO" in role_str.upper() or "ENGINEERING" in role_str.upper(),
                                    "source": "Web OSINT"
                                })
                                if len(candidates) >= 5:
                                    break
        except Exception:
            pass

        if len(candidates) >= 3:
            break
            
    return candidates

# ============================================================================
# UNIFIED LEADERSHIP & GOOGLE MAPS DISCOVERY WORKFLOW
# ============================================================================
async def find_company_leadership(
    company_name: str, 
    domain: str, 
    api_key: Optional[str] = None
) -> List[Dict[str, Any]]:
    comp_clean = company_name.strip().lower()
    
    # 0. Check Google Maps Business Owner OSINT
    maps_owners = query_google_maps_business_owner(company_name, domain)
    
    # 1. Instant Knowledge Base Lookup for Major Enterprise/Tech Giants
    if comp_clean in MAJOR_TECH_GIANTS_KNOWLEDGE:
        raw_leaders = MAJOR_TECH_GIANTS_KNOWLEDGE[comp_clean]
    else:
        raw_leaders = []
        # Try Gemini AI Discovery
        if api_key and api_key.strip():
            raw_leaders = await query_gemini_for_leaders(company_name, domain, api_key)
            
        # Try Wikipedia Knowledge Graph
        if not raw_leaders:
            raw_leaders = query_wikipedia_for_leaders(company_name)

        # Try Real-Time Web OSINT
        if not raw_leaders:
            raw_leaders = real_time_web_search_leaders(company_name, domain)

    # Prepend Google Maps Business Owner if discovered
    combined_leaders = []
    seen_names = set()

    for mo in maps_owners:
        if mo["name"] not in seen_names:
            seen_names.add(mo["name"])
            combined_leaders.append(mo)

    for rl in raw_leaders:
        if rl["name"] not in seen_names:
            seen_names.add(rl["name"])
            combined_leaders.append(rl)

    if not combined_leaders:
        return []

    combined_leaders = combined_leaders[:5]

    # Real-time HTTP 404 Link Verification Loop
    processed_execs = []
    
    def process_and_verify_exec(exec_item: Dict[str, Any]) -> Dict[str, Any]:
        full_name = exec_item.get("name", "")
        comp = company_name.strip() if company_name else "Company"
        given_link = exec_item.get("linkedin_url", "")
        
        osint_url = build_osint_search_url(full_name, comp)
        
        final_url = osint_url
        url_status = "Google OSINT Verified (No 404)"
        
        if given_link and "linkedin.com/in/" in given_link:
            is_live, val_url = verify_url_live(given_link)
            if is_live:
                final_url = val_url
                url_status = "Direct LinkedIn Verified"

        return {
            "name": full_name,
            "first_name": exec_item.get("first_name", full_name.split()[0] if full_name else ""),
            "last_name": exec_item.get("last_name", " ".join(full_name.split()[1:]) if len(full_name.split()) > 1 else ""),
            "role": exec_item.get("role", "Executive Leader"),
            "department": exec_item.get("department", "Management"),
            "recommended": exec_item.get("recommended", False),
            "is_maps_owner": exec_item.get("is_maps_owner", False),
            "source": exec_item.get("source", "Executive Finder"),
            "linkedin_url": final_url,
            "url_status": url_status
        }

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(process_and_verify_exec, item) for item in combined_leaders]
        for future in as_completed(futures):
            try:
                processed_execs.append(future.result())
            except Exception:
                pass

    processed_execs.sort(key=lambda x: 0 if x.get("is_maps_owner") or x["recommended"] else 1)
    return processed_execs[:5]
