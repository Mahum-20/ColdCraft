// API Service helper functions

const API_BASE = '';

export async function verifyEmailAddress(firstName, lastName, domain) {
  const response = await fetch(`${API_BASE}/api/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      first_name: firstName,
      last_name: lastName,
      domain: domain
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Email verification request failed.');
  }
  return response.json();
}

export async function extractPainPoints(jobSnippet) {
  const response = await fetch(`${API_BASE}/api/extract-pain-points`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_snippet: jobSnippet })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Pain point extraction failed.');
  }
  return response.json();
}

export async function generatePitches(payload) {
  const response = await fetch(`${API_BASE}/api/generate-pitches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cto_name: payload.ctoName,
      company_name: payload.companyName,
      domain: payload.domain,
      verified_email: payload.verifiedEmail,
      job_snippet: payload.jobSnippet,
      sender_name: payload.senderName || 'Mahum',
      sender_title: payload.senderTitle || 'CS Gold Medalist & Senior Backend Engineer',
      sender_specialty: payload.senderSpecialty || 'high-throughput Django/Celery architectures & PostgreSQL optimization',
      availability: payload.availability || 'Available for up to 20 hours/week with zero onboarding lag',
      gemini_api_key: payload.geminiApiKey || null
    })
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Pitch generation failed.');
  }
  return response.json();
}
