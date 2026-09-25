import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.FROM_EMAIL || 'InsightAI <noreply@insightai.dev>';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend. Silently fails if RESEND_API_KEY is not set.
 */
async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!resend) {
    console.log('[Email] Skipped (no RESEND_API_KEY):', payload.subject);
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    if (error) {
      console.error('[Email] Send error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[Email] Failed:', err);
    return false;
  }
}

// ============================
// Template: Task Completed
// ============================
export async function sendTaskCompletedEmail(
  to: string,
  taskTitle: string,
  datasetName: string,
  rowCount: number,
  qualityScore: number,
  taskUrl: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `✅ Task Complete: ${taskTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Inter',system-ui,sans-serif;background:#0a0a0f;color:#e0e0f0;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;font-weight:700;">InsightAI</div>
    </div>
    <div style="background:#12121a;border:1px solid #1e1e2e;border-radius:12px;padding:28px;">
      <div style="font-size:13px;color:#10b981;font-weight:600;margin-bottom:8px;">TASK COMPLETED</div>
      <h1 style="font-size:20px;font-weight:600;color:#f0f0ff;margin:0 0 16px 0;">${taskTitle}</h1>
      
      <div style="display:flex;gap:12px;margin-bottom:20px;">
        <div style="flex:1;background:#1a1a2e;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#f0f0ff;">${rowCount}</div>
          <div style="font-size:11px;color:#888;">Records</div>
        </div>
        <div style="flex:1;background:#1a1a2e;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:${qualityScore > 70 ? '#10b981' : '#f59e0b'};">${qualityScore}%</div>
          <div style="font-size:11px;color:#888;">Quality</div>
        </div>
      </div>
      
      <div style="font-size:13px;color:#888;margin-bottom:16px;">
        Dataset: <strong style="color:#e0e0f0;">${datasetName}</strong>
      </div>
      
      <a href="${taskUrl}" style="display:block;text-align:center;padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none;">
        View Results →
      </a>
    </div>
    <div style="text-align:center;margin-top:20px;font-size:11px;color:#555;">
      You received this because a task completed in your InsightAI account.
    </div>
  </div>
</body>
</html>`,
  });
}

// ============================
// Template: Task Failed
// ============================
export async function sendTaskFailedEmail(
  to: string,
  taskTitle: string,
  errorMessage: string,
  taskUrl: string
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `❌ Task Failed: ${taskTitle}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Inter',system-ui,sans-serif;background:#0a0a0f;color:#e0e0f0;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;font-weight:700;">InsightAI</div>
    </div>
    <div style="background:#12121a;border:1px solid #1e1e2e;border-radius:12px;padding:28px;">
      <div style="font-size:13px;color:#ef4444;font-weight:600;margin-bottom:8px;">TASK FAILED</div>
      <h1 style="font-size:20px;font-weight:600;color:#f0f0ff;margin:0 0 16px 0;">${taskTitle}</h1>
      
      <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-size:12px;color:#ef4444;font-weight:500;margin-bottom:4px;">Error Message</div>
        <div style="font-size:13px;color:#fca5a5;">${errorMessage.slice(0, 200)}</div>
      </div>
      
      <a href="${taskUrl}" style="display:block;text-align:center;padding:12px 24px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:600;font-size:14px;border-radius:8px;text-decoration:none;">
        View Task & Retry →
      </a>
    </div>
  </div>
</body>
</html>`,
  });
}

// ============================
// Template: Weekly Digest
// ============================
export async function sendWeeklyDigestEmail(
  to: string,
  stats: {
    tasksCompleted: number;
    totalRecords: number;
    avgQuality: number;
    topDataset: string;
  }
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `📊 Your InsightAI Weekly Summary`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;font-family:'Inter',system-ui,sans-serif;background:#0a0a0f;color:#e0e0f0;">
  <div style="max-width:560px;margin:0 auto;padding:32px 24px;">
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:24px;font-weight:700;">InsightAI</div>
    </div>
    <div style="background:#12121a;border:1px solid #1e1e2e;border-radius:12px;padding:28px;">
      <h1 style="font-size:18px;font-weight:600;color:#f0f0ff;margin:0 0 20px 0;">Weekly Summary</h1>
      
      <div style="display:flex;gap:12px;margin-bottom:20px;">
        <div style="flex:1;background:#1a1a2e;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#6366f1;">${stats.tasksCompleted}</div>
          <div style="font-size:11px;color:#888;">Tasks</div>
        </div>
        <div style="flex:1;background:#1a1a2e;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#8b5cf6;">${stats.totalRecords}</div>
          <div style="font-size:11px;color:#888;">Records</div>
        </div>
        <div style="flex:1;background:#1a1a2e;border-radius:8px;padding:12px;text-align:center;">
          <div style="font-size:22px;font-weight:700;color:#10b981;">${stats.avgQuality}%</div>
          <div style="font-size:11px;color:#888;">Quality</div>
        </div>
      </div>
      
      ${stats.topDataset ? `<div style="font-size:13px;color:#888;">Top dataset: <strong style="color:#e0e0f0;">${stats.topDataset}</strong></div>` : ''}
    </div>
  </div>
</body>
</html>`,
  });
}
