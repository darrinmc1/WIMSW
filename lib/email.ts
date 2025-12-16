import { Resend } from 'resend';

// Initialize Resend
// Note: In production, this would use process.env.RESEND_API_KEY
// For this environment, we'll check multiple possible locations
const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Send a password reset email
 */
export async function sendPasswordResetEmail(email: string, resetPin: string) {
  if (!resend) {
    console.warn('⚠️ Resend API key not found. Email simulation only.');
    console.log(`[EMAIL SIMULATION] To: ${email}, PIN: ${resetPin}`);
    return { success: true, simulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'WhatIsMyStuffWorth <onboarding@resend.dev>', // Update this with your verified domain
      to: [email],
      subject: 'Reset your password PIN',
      html: `
        <div style="font-family: sans-serif; max-w-md mx-auto; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested to reset your password. Use the PIN below to proceed:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #4f46e5;">${resetPin}</span>
          </div>
          <p>This PIN will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}
