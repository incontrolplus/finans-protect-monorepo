/**
 * Cloudflare Pages Advanced Mode — _worker.js
 * High-Performance Edge Router & B2B Inquiries API
 * Operated by INCONTROL PLUS ЕООД
 */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle /api/contact endpoint
    if (url.pathname === '/api/contact' || url.pathname === '/api/inquiry') {
      // CORS Preflight
      if (request.method === 'OPTIONS') {
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

      if (request.method !== 'POST') {
        return new Response(JSON.stringify({
          ok: false,
          error: 'METHOD_NOT_ALLOWED',
          message: 'Only POST requests are supported on /api/contact'
        }), {
          status: 405,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      try {
        const body = await request.json();
        const company_name = (body.company_name || '').trim();
        const vat_number = (body.vat_number || '').trim();
        const work_email = (body.work_email || '').trim().toLowerCase();
        const phone_number = (body.phone_number || '').trim();
        const selected_plan = (body.selected_plan || 'B2B Pro SLA Retainer').trim();
        const inquiry_message = (body.inquiry_message || '').trim();
        const payment_preference = (body.payment_preference || 'invoice').trim();
        const language = (body.language || 'en').trim();
        const source = (body.source || 'website_modal').trim();

        // Validation
        if (!company_name || company_name.length < 2) {
          return new Response(JSON.stringify({
            ok: false,
            error: 'VALIDATION_ERROR',
            message: 'Company legal name is required (min 2 characters).'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!work_email || !emailRegex.test(work_email)) {
          return new Response(JSON.stringify({
            ok: false,
            error: 'INVALID_EMAIL',
            message: 'Please provide a valid corporate work email address.'
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
          });
        }

        const client_ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '0.0.0.0';
        const country = request.headers.get('cf-ipcountry') || 'EU';
        const user_agent = request.headers.get('user-agent') || 'Unknown';
        const lead_id = crypto.randomUUID();
        const created_at = new Date().toISOString();

        const leadRecord = {
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
          created_at
        };

        // Webhook dispatch if configured
        if (env && env.N8N_INQUIRY_WEBHOOK_URL) {
          try {
            await fetch(env.N8N_INQUIRY_WEBHOOK_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(leadRecord)
            });
          } catch (e) {
            console.warn('Webhook dispatch error:', e);
          }
        }

        return new Response(JSON.stringify({
          ok: true,
          lead_id,
          status: 'received',
          company_name,
          work_email,
          selected_plan,
          timestamp: created_at,
          message: 'Your enterprise inquiry has been securely registered with INCONTROL PLUS ЕООД. An infrastructure architect will review your cluster requirements and respond with a formal SLA proposal within 2 hours.',
          estimated_response_hours: 2
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });

      } catch (err) {
        return new Response(JSON.stringify({
          ok: false,
          error: 'SERVER_ERROR',
          message: 'Malformed request: ' + (err.message || 'Unknown error')
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    // 2. Default: Serve static assets
    return env.ASSETS.fetch(request);
  }
};
