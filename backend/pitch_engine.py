import re
import json
import httpx
from typing import Dict, List, Any, Optional

COMMON_TECH_TAGS = {
    "Python": ["python", "django", "fastapi", "flask", "celery", "pydantic", "pytest"],
    "Celery": ["celery", "kombu", "task queue", "worker", "task processing"],
    "PostgreSQL": ["postgresql", "postgres", "psycopg2", "sqlalchemy", "orm", "database query"],
    "Django": ["django", "drf", "django rest framework", "orm"],
    "React": ["react", "next.js", "nextjs", "typescript", "redux"],
    "Node.js": ["node", "express", "nest", "typescript"],
    "Go": ["golang", "go", "goroutines"],
    "AWS": ["aws", "s3", "ec2", "rds", "lambda", "ecs", "eks", "cloud"],
    "Redis": ["redis", "cache", "pubsub"],
    "Kafka": ["kafka", "event streaming", "rabbitmq"],
    "Docker/K8s": ["docker", "kubernetes", "k8s", "container"],
    "Microservices": ["microservices", "gRPC", "distributed systems"]
}

PAIN_POINT_CATEGORIES = {
    "Celery / Task Queue Backlog": [
        "celery", "queue", "backing up", "lagging", "worker", "task queue", "async jobs", "delayed tasks"
    ],
    "PostgreSQL Query Bottlenecks": [
        "postgresql", "postgres", "slow queries", "database", "query optimization", "n+1", "indexing", "db lock"
    ],
    "High Traffic Spikes & Latency": [
        "scaling", "peak traffic", "latency", "throughput", "concurrency", "load", "bottleneck"
    ],
    "Legacy Monolith Refactoring": [
        "refactoring", "legacy", "monolith", "technical debt", "cleanup", "decoupling"
    ],
    "Infrastructure & Cost Overhead": [
        "aws costs", "ec2", "infrastructure", "devops", "ci/cd", "deployment lag"
    ]
}

def extract_tech_and_pain_points(job_text: str) -> Dict[str, Any]:
    """Analyzes text to extract tech stack tags and primary engineering pain points."""
    text_lower = job_text.lower() if job_text else ""
    
    detected_tech = []
    for tech, keywords in COMMON_TECH_TAGS.items():
        if any(kw in text_lower for kw in keywords):
            detected_tech.append(tech)
            
    detected_pain_points = []
    for category, keywords in PAIN_POINT_CATEGORIES.items():
        if any(kw in text_lower for kw in keywords):
            detected_pain_points.append(category)
            
    if not detected_pain_points:
        if "data pipeline" in text_lower or "pipeline" in text_lower:
            detected_pain_points.append("Data Pipeline Latency & Queue Bottlenecks")
        else:
            detected_pain_points.append("Backend Architecture & Query Optimization")

    return {
        "tech_stack": detected_tech or ["Python", "Django", "PostgreSQL"],
        "pain_points": detected_pain_points,
        "primary_pain_point": detected_pain_points[0] if detected_pain_points else "Backend System Optimization"
    }

def calculate_spam_score(subject: str, body: str) -> Dict[str, Any]:
    """Evaluates subject line & body against common spam triggers."""
    spam_triggers = [
        "100% free", "guaranteed", "no cost", "buy now", "click here", "act now",
        "make money", "limited time", "earn $", "risk free", "urgent", "congratulations"
    ]
    
    score = 100
    flags = []
    
    text_combined = (subject + " " + body).lower()
    
    for trigger in spam_triggers:
        if trigger in text_combined:
            score -= 15
            flags.append(f"Spam keyword found: '{trigger}'")
            
    if len(subject) > 60:
        score -= 10
        flags.append("Subject line exceeds 60 characters (shorter subject lines get higher open rates).")
        
    if subject.isupper():
        score -= 25
        flags.append("Subject line is ALL CAPS.")
        
    if "!" in subject:
        score -= 10
        flags.append("Exclamation mark in subject line reduces open rates for technical CTOs.")
        
    return {
        "deliverability_score": max(score, 20),
        "rating": "Excellent" if score >= 85 else ("Good" if score >= 70 else "Needs Improvement"),
        "flags": flags
    }

def generate_fallback_pitches(
    cto_name: str,
    company_name: str,
    domain: str,
    job_snippet: str,
    extracted_info: Dict[str, Any],
    sender_name: str = "Mahum",
    sender_title: str = "CS Gold Medalist & Senior Backend Engineer",
    sender_specialty: str = "high-throughput Django/Celery architectures & PostgreSQL optimization",
    availability: str = "Available for up to 20 hours/week with zero onboarding lag"
) -> List[Dict[str, Any]]:
    """High-quality template engine fallback when no AI API key is configured."""
    first_name = cto_name.strip().split()[0] if cto_name else "there"
    comp = company_name.strip() if company_name else "your engineering team"
    primary_pain = extracted_info["primary_pain_point"]
    tech_str = ", ".join(extracted_info["tech_stack"][:4])
    
    # 1. Technical Bottleneck Fix
    p1_subject = f"fixing {comp.lower()}'s backend bottlenecks?"
    p1_preview = f"Saw {comp} is scaling infrastructure—if task queues or DB queries are backing up..."
    p1_body = f"""Hi {first_name},

I saw {comp} is scaling its backend data pipelines. If your Celery task queues are backing up during peak traffic hours or PostgreSQL queries are hitting latencies, I can step in immediately to clean up task execution flows and optimize query performance.

I'm a {sender_title} specializing in {sender_specialty}. {availability}.

Worth a quick 5-minute intro chat this week to see if I can help clear that backlog?

Best,
{sender_name}"""

    # 2. Low-Friction Quick Question
    p2_subject = f"quick question re: {comp.lower()} backend"
    p2_preview = f"Notice you're looking for extra {tech_str} hands for optimization..."
    p2_body = f"""Hi {first_name},

Noticed {comp}'s engineering team is scaling up backend systems. If query latency or pipeline throughput is slowing down your current sprint, I have immediate bandwidth to take those tasks off your hands.

I specialize in {tech_str} backend optimization and scaling.

Do you have 5 minutes for a quick chat tomorrow?

Best,
{sender_name}"""

    # 3. Problem-Agitate-Solve (PAS) Framework
    p3_subject = f"{comp.lower()} celery queue lag & db queries"
    p3_preview = f"Backlog tasks and DB locks can slow down engineering velocity fast..."
    p3_body = f"""Hi {first_name},

When backend queues start backing up during traffic spikes, engineering velocity slows down and database locks can paralyze real-time features.

I noticed {comp} is looking for Python/Django expertise to address these exact scaling bottlenecks. I help fast-growing teams audit task execution pipelines, rewrite heavy ORM queries, and stabilize Celery worker pools.

I have immediate availability with zero onboarding lag.

Would you be open to a 5-minute call on Thursday to discuss your current bottleneck?

Best,
{sender_name}"""

    # 4. Value-First Case Study / Immediate Impact
    p4_subject = f"idea for {comp.lower()}'s query performance"
    p4_preview = f"A simple fix for Celery queue backups during peak load..."
    p4_body = f"""Hi {first_name},

I've worked on high-throughput Django/Celery setups where queue congestion was resolved by refactoring task granularity and implementing connection pooling in PostgreSQL—reducing task execution lag by over 70%.

Saw {comp}'s recent engineering posting regarding {primary_pain.lower()}. I'd love to share a couple of immediate optimizations that might save your team sprint cycles.

Would you be open to a quick 5-min exchange this week?

Best,
{sender_name}"""

    variations = [
        {
            "id": "tech-bottleneck",
            "title": "1. Technical Bottleneck Fix",
            "tag": "Direct & Highly Technical",
            "subject": p1_subject,
            "preview": p1_preview,
            "body": p1_body,
            "spam_analysis": calculate_spam_score(p1_subject, p1_body)
        },
        {
            "id": "low-friction",
            "title": "2. Low-Friction Internal Message",
            "tag": "Conversational & Casual",
            "subject": p2_subject,
            "preview": p2_preview,
            "body": p2_body,
            "spam_analysis": calculate_spam_score(p2_subject, p2_body)
        },
        {
            "id": "pas-framework",
            "title": "3. Problem-Agitate-Solve (PAS)",
            "tag": "High-Converting Framework",
            "subject": p3_subject,
            "preview": p3_preview,
            "body": p3_body,
            "spam_analysis": calculate_spam_score(p3_subject, p3_body)
        },
        {
            "id": "value-first",
            "title": "4. Immediate Value & Case Study",
            "tag": "Solution-Oriented",
            "subject": p4_subject,
            "preview": p4_preview,
            "body": p4_body,
            "spam_analysis": calculate_spam_score(p4_subject, p4_body)
        }
    ]
    
    return variations

async def generate_pitches_with_gemini(
    api_key: str,
    cto_name: str,
    company_name: str,
    domain: str,
    job_snippet: str,
    extracted_info: Dict[str, Any],
    sender_name: str = "Mahum",
    sender_title: str = "CS Gold Medalist & Senior Backend Engineer",
    sender_specialty: str = "high-throughput Django/Celery architectures & PostgreSQL optimization",
    availability: str = "Available for up to 20 hours/week with zero onboarding lag"
) -> List[Dict[str, Any]]:
    """Calls Google Gemini API (v1beta or gemini-1.5-flash / gemini-2.0-flash) to generate dynamic email pitches."""
    
    prompt = f"""You are an expert technical B2B cold email copywriter specializing in CTO outreach for high-end software engineering.

TARGET CONTEXT:
- Target CTO/VP Eng: {cto_name}
- Target Company: {company_name} ({domain})
- Job Post / Tech Context: {job_snippet}
- Detected Tech Stack: {', '.join(extracted_info['tech_stack'])}
- Primary Bottleneck/Pain Point: {extracted_info['primary_pain_point']}

SENDER PROFILE:
- Name: {sender_name}
- Title/Background: {sender_title}
- Specialty: {sender_specialty}
- Availability: {availability}

TASK:
Generate 4 distinct, highly personalized cold email variations that a senior developer can send to this CTO.
Each variation must sound natural, concise, low-friction, extremely technical, and professional. NO buzzwords, NO aggressive sales talk, NO generic flattery.

Return ONLY a valid JSON array of 4 objects with the following schema:
[
  {{
    "id": "tech-bottleneck",
    "title": "1. Technical Bottleneck Fix",
    "tag": "Direct & Highly Technical",
    "subject": "lowercase punchy subject line",
    "preview": "1-sentence inbox snippet preview",
    "body": "Hi Alex,\\n\\n..."
  }},
  ...
]
"""
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        payload = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "responseMimeType": "application/json"
            }
        }
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text_content = data['candidates'][0]['content']['parts'][0]['text']
                # Parse JSON
                parsed = json.loads(text_content)
                
                # Add deliverability analysis
                for item in parsed:
                    item['spam_analysis'] = calculate_spam_score(item.get('subject', ''), item.get('body', ''))
                return parsed
    except Exception as e:
        print(f"Gemini API error, falling back to local engine: {e}")

    # Fallback if Gemini fails or rate limited
    return generate_fallback_pitches(
        cto_name, company_name, domain, job_snippet, extracted_info,
        sender_name, sender_title, sender_specialty, availability
    )
