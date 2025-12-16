
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key_for_build');

interface SendPasswordResetEmailProps {
    email: string;
    pin: string;
}

export async function sendPasswordResetEmail({ email, pin }: SendPasswordResetEmailProps) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'WhatIsMyStuffWorth <onboarding@resend.dev>', // Should be updated to custom domain later
            to: [email],
            subject: 'Reset Your PIN - WhatIsMyStuffWorth',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5;">Reset Your PIN</h2>
          <p>You requested to reset your PIN for WhatIsMyStuffWorth.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #6b7280;">Your Temporary Reset PIN:</p>
            <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${pin}</p>
          </div>
          <p>Please use this PIN to log in immediately. You can then change it in your dashboard settings.</p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
            If you didn't request this, please ignore this email. Your account is safe.
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (err) {
        console.error('Email sending failed:', err);
        return { success: false, error: err };
    }
}
