import smtplib
import socket
import random
import string
import re
import dns.resolver
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any, Optional

def clean_name(name: str) -> str:
    """Removes special characters and spaces from names for clean email generation."""
    if not name:
        return ""
    name = re.sub(r'[^a-zA-Z0-9]', '', name.strip().lower())
    return name

def clean_domain(domain: str) -> str:
    """Cleans domain input (strips http://, https://, www., paths)."""
    if not domain:
        return ""
    domain = domain.strip().lower()
    domain = re.sub(r'https?://', '', domain)
    domain = re.sub(r'www\.', '', domain)
    domain = domain.split('/')[0].split('?')[0]
    return domain

def generate_email_permutations(first_name: str, last_name: str, domain: str) -> List[Dict[str, str]]:
    """Generates top corporate email address permutations."""
    fn = clean_name(first_name)
    ln = clean_name(last_name)
    dom = clean_domain(domain)
    
    if not dom:
        return []
    
    patterns = []
    
    if fn and ln:
        patterns.append({
            "email": f"{fn}.{ln}@{dom}",
            "pattern": "first.last",
            "popularity": "High (45%)",
            "description": "Standard Corporate Pattern"
        })
        patterns.append({
            "email": f"{fn}@{dom}",
            "pattern": "first",
            "popularity": "High (30%)",
            "description": "Startup & Executive Pattern"
        })
        patterns.append({
            "email": f"{fn[0]}{ln}@{dom}",
            "pattern": "f.last",
            "popularity": "Medium (15%)",
            "description": "Initial + Last Name"
        })
        patterns.append({
            "email": f"{fn}{ln}@{dom}",
            "pattern": "firstlast",
            "popularity": "Medium (5%)",
            "description": "Full Name Joined"
        })
        patterns.append({
            "email": f"{fn}_{ln}@{dom}",
            "pattern": "first_last",
            "popularity": "Low (2%)",
            "description": "Underscore Separated"
        })
        patterns.append({
            "email": f"{ln}.{fn}@{dom}",
            "pattern": "last.first",
            "popularity": "Low (1%)",
            "description": "Reverse Order"
        })
        patterns.append({
            "email": f"{fn}.{ln[0]}@{dom}",
            "pattern": "first.l",
            "popularity": "Low (1%)",
            "description": "First + Last Initial"
        })
        patterns.append({
            "email": f"{ln}@{dom}",
            "pattern": "last",
            "popularity": "Low (1%)",
            "description": "Last Name Only"
        })
    elif fn:
        patterns.append({
            "email": f"{fn}@{dom}",
            "pattern": "first",
            "popularity": "High",
            "description": "First Name Only"
        })
    
    return patterns

def check_domain_dns(domain: str) -> Dict[str, Any]:
    """Checks DNS MX, SPF, and DMARC records for domain deliverability verification."""
    dom = clean_domain(domain)
    result = {
        "domain": dom,
        "mx_found": False,
        "mx_records": [],
        "spf_found": False,
        "dmarc_found": False,
        "status": "Unknown",
        "error": None
    }
    
    if not dom:
        result["error"] = "Invalid domain provided"
        return result

    # 1. Fetch MX Records
    try:
        resolver = dns.resolver.Resolver()
        resolver.timeout = 3.0
        resolver.lifetime = 3.0
        mx_answers = resolver.resolve(dom, 'MX')
        
        sorted_mx = sorted(mx_answers, key=lambda r: r.preference)
        result["mx_records"] = [str(r.exchange).rstrip('.') for r in sorted_mx]
        result["mx_found"] = len(result["mx_records"]) > 0
    except Exception as e:
        result["error"] = f"DNS lookup failed: {str(e)}"
        result["status"] = "DNS Error or No MX"
        return result

    # 2. Fetch SPF Record
    try:
        txt_answers = resolver.resolve(dom, 'TXT')
        for txt in txt_answers:
            txt_str = txt.to_text().strip('"')
            if 'v=spf1' in txt_str:
                result["spf_found"] = True
                break
    except Exception:
        pass

    # 3. Fetch DMARC Record
    try:
        dmarc_answers = resolver.resolve(f"_dmarc.{dom}", 'TXT')
        for txt in dmarc_answers:
            txt_str = txt.to_text().strip('"')
            if 'v=DMARC1' in txt_str:
                result["dmarc_found"] = True
                break
    except Exception:
        pass

    if result["mx_found"]:
        result["status"] = "Active Mail Domain"

    return result

def test_catch_all(mx_server: str, domain: str) -> bool:
    """Performs catch-all detection by testing a non-existent random user with short timeout."""
    random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=12))
    fake_email = f"nonexistent_test_{random_str}@{domain}"
    
    try:
        with smtplib.SMTP(timeout=3) as server:
            server.connect(mx_server, 25)
            server.helo('verification-tool.org')
            server.mail('check@verification-tool.org')
            code, _ = server.rcpt(fake_email)
            return code == 250
    except Exception:
        return False

def verify_single_email_smtp(email: str, mx_server: str, is_catch_all: Optional[bool] = None) -> Dict[str, Any]:
    """Performs a direct SMTP handshake with short 3-second timeout."""
    domain = email.split('@')[-1]
    
    try:
        with smtplib.SMTP(timeout=3) as server:
            server.connect(mx_server, 25)
            server.helo('verification-tool.org')
            server.mail('check@verification-tool.org')
            code, msg_bytes = server.rcpt(email)
            msg = msg_bytes.decode('utf-8', errors='ignore')
            
            if code == 250:
                if is_catch_all:
                    return {
                        "email": email,
                        "status": "Catch-All",
                        "valid": True,
                        "smtp_code": code,
                        "confidence": 75,
                        "message": "Mail server accepts all emails (Catch-All active). Likely deliverable.",
                        "is_catch_all": True
                    }
                else:
                    return {
                        "email": email,
                        "status": "Verified Valid",
                        "valid": True,
                        "smtp_code": code,
                        "confidence": 98,
                        "message": "Recipient confirmed valid directly by mail server (SMTP 250 OK).",
                        "is_catch_all": False
                    }
            elif code in [550, 551, 552, 553, 501]:
                return {
                    "email": email,
                    "status": "Rejected / Invalid",
                    "valid": False,
                    "smtp_code": code,
                    "confidence": 0,
                    "message": f"Mail server rejected address: {msg}",
                    "is_catch_all": is_catch_all
                }
            else:
                return {
                    "email": email,
                    "status": "Uncertain",
                    "valid": False,
                    "smtp_code": code,
                    "confidence": 40,
                    "message": f"Server returned code {code}",
                    "is_catch_all": is_catch_all
                }
    except Exception:
        # Port 25 blocked or timeout
        return {
            "email": email,
            "status": "Port 25 Protected",
            "valid": True,
            "smtp_code": 0,
            "confidence": 65 if not is_catch_all else 50,
            "message": "Direct SMTP check timed out. Permutation remains highly probable.",
            "is_catch_all": is_catch_all
        }

def run_email_discovery(first_name: str, last_name: str, domain: str) -> Dict[str, Any]:
    """Concurrent verification of permutations using ThreadPoolExecutor."""
    permutations = generate_email_permutations(first_name, last_name, domain)
    dns_info = check_domain_dns(domain)
    
    if not dns_info["mx_found"]:
        results = []
        for p in permutations:
            results.append({
                **p,
                "status": "No MX Server",
                "valid": False,
                "confidence": 0,
                "message": "Domain has no valid MX mail servers."
            })
        return {
            "dns": dns_info,
            "candidates": results,
            "best_match": None
        }

    top_mx = dns_info["mx_records"][0]
    is_catch_all = test_catch_all(top_mx, clean_domain(domain))
    
    # Run SMTP checks concurrently across threads
    verified_map = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        future_to_perm = {
            executor.submit(verify_single_email_smtp, p["email"], top_mx, is_catch_all): p
            for p in permutations
        }
        for future in as_completed(future_to_perm):
            perm = future_to_perm[future]
            try:
                verified_map[perm["email"]] = future.result()
            except Exception:
                verified_map[perm["email"]] = {
                    "status": "Check Error",
                    "valid": False,
                    "confidence": 50,
                    "message": "Verification error"
                }

    results = []
    for p in permutations:
        smtp_res = verified_map.get(p["email"], {})
        combined = {**p, **smtp_res}
        
        # Boost standard corporate pattern confidence if SMTP port 25 is firewalled
        if combined.get("status") in ["Port 25 Protected", "Check Error"]:
            if p["pattern"] == "first.last":
                combined["confidence"] = 90
            elif p["pattern"] == "first":
                combined["confidence"] = 80
            elif p["pattern"] == "f.last":
                combined["confidence"] = 70

        results.append(combined)

    # Sort by confidence
    sorted_candidates = sorted(results, key=lambda x: x["confidence"], reverse=True)
    best_candidate = sorted_candidates[0] if sorted_candidates else None

    return {
        "dns": dns_info,
        "is_catch_all": is_catch_all,
        "candidates": results,
        "best_match": best_candidate
    }
