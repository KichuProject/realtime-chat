import brevo from "@getbrevo/brevo";

export async function sendOtpEmail(email, otp) {
  try {
    // Initialize Brevo API client
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    // Email content
    const sendSmtpEmail = {
      sender: { name: "Peslamaa", email: process.env.SENDER_EMAIL },
      to: [{ email }],
      subject: "Your OTP Code - Peslamaa",
      htmlContent: `
        <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

          <div style="background: linear-gradient(90deg, #4CAF50, #45A049); padding: 25px; text-align: center; color: #fff;">
            <h2 style="margin: 0; font-size: 24px;">Welcome to Peslamaa!</h2>
          </div>

          <div style="padding: 30px; text-align: center; color: #333;">
            <p style="font-size: 16px; color: #555;">Your One-Time Password (OTP) for registration is:</p>

            <div style="background-color: #f4f4f4; padding: 20px; margin: 20px 0; border-radius: 8px;">
              <h1 style="color: #4CAF50; font-size: 36px; margin: 0; letter-spacing: 5px;">${otp}</h1>
            </div>

            <p style="font-size: 14px; color: #777;">This OTP is valid for <b>10 minutes</b>.</p>
            <p style="font-size: 14px; color: #777;">If you didn't request this code, please ignore this email.</p>
          </div>

          <div style="background: #f9f9f9; padding: 20px; text-align: center; color: #555; font-size: 12px;">
            <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;" />
            <p>— Peslamaa Team</p>
          </div>

        </div>`,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ OTP email sent to:", email);
  } catch (error) {
    console.error("❌ Error sending email:", error.response?.body || error.message);
    throw error;
  }
}
