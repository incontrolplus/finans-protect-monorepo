/**
 * Cloudflare Pages Function — /api/contact
 * Handles B2B Inquiries, SLA Requests, and Enterprise Consultations
 * Operated by INCONTROL PLUS ЕООД
 */

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json();

    const company_name = (body.company_name || '').trim();
    const vat_number = (body.vat_number || '').trim();
    const work_email = (body.work_email || '').trim().toLowerCase();
    const phone_number = (body.phone_number || '').trim();
    const selected_plan = (body.selected_plan || 'B2B Pro SLA Retainer').trim();
    const inquiry_message = (body.inquiry_message || '').trim();
    const language = (body.language || 'en').trim();
    const source = (body.source || 'website_b2b_modal').trim();

    // 1. Validation
    if (!company_name || company_name.length < 2) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'VALIDATION_ERROR',
        message: 'Company legal name is required (min 2 characters).'
      }), { status: 400, headers });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!work_email || !emailRegex.test(work_email)) {
      return new Response(JSON.stringify({
        ok: false,
        error: 'INVALID_EMAIL',
        message: 'Please provide a valid corporate work email address.'
      }), { status: 400, headers });
    }

    // 2. Metadata extraction
    const client_ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0';
    const country = request.headers.get('cf-ipcountry') || 'EU';
    const user_agent = request.headers.get('user-agent') || 'Unknown';
    const lead_id = crypto.randomUUID();
    const created_at = new Date().toISOString();

    const leadPayload = {
      id: lead_id,
      company_name,
      vat_number,
      work_email,
      phone_number,
      selected_plan,
      inquiry_message,
      language,
      source,
      ip_address: client_ip,
      country,
      user_agent,
      created_at,
      recipient: 'INCONTROL PLUS EOOD <support@openbalancer.com>'
    };

    // 3. Optional Webhook dispatch to n8n / Supabase if configured in env
    if (env && env.N8N_INQUIRY_WEBHOOK_URL) {
      try {
        await fetch(env.N8N_INQUIRY_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(leadPayload)
        });
      } catch (webhookErr) {
        console.warn('Webhook dispatch skipped/failed:', webhookErr);
      }
    }

    // 4. Return success response
    return new Response(JSON.stringify({
      ok: true,
      lead_id,
      status: 'received',
      company_name,
      work_email,
      selected_plan,
      timestamp: created_at,
      message: 'Your enterprise inquiry has been securely registered with INCONTROL PLUS ЕООД. Our infrastructure lead will reply with an official proposal within 2 hours.',
      estimated_response_hours: 2
    }), { status: 200, headers });

  } catch (err) {
    return new Response(JSON.stringify({
      ok: false,
      error: 'SERVER_ERROR',
      message: 'Failed to process inquiry payload: ' + (err.message || 'Unknown error')
    }), { status: 500, headers });
  }
}
