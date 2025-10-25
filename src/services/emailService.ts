// services/emailService.ts

/**
 * Sends email data to your Next.js API route,
 * which will trigger the n8n workflow to send the actual email.
 * 
 * @param to Recipient email address
 * @param subject Email subject
 * @param html Email body as HTML
 * @returns Success or error from API
 */
export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const response = await fetch('/api/n8n', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || error.toString() };
  }
}
