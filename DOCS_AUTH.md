# Aether Engine: Authentication Setup & Troubleshooting Guide

## 1. Google OAuth Behavior (Expected)
When you click **"Continue with Google"**, you will see a series of redirects:
1.  **Google Account Picker**: You choose your Google account.
2.  **Supabase Redirect**: You may briefly see a page on `ugedscjzlezumceczfrk.supabase.co` asking you to "Sign in to Infinite-Adventure-Engine". **This is standard Supabase behavior** and confirms the provider is correctly configured.
3.  **Return to Game**: You will be redirected back to `http://localhost:3000` (or your production URL).

## 2. Token in URL Hash
If you see `#access_token=...` in your browser address bar after redirecting, the authentication was **successful**.

With the latest updates (v5.0.3), the Aether Engine now automatically:
- Detects this token in the URL.
- Establishes a session.
- Updates the HUD with your identity (e.g., your email prefix).
- Cleans up the URL hash.

## 3. Manual Provider Enablement (If errors occur)
If you encounter a `400: Unsupported Provider` error **before** reaching the Google account picker, ensure the following in your Supabase Dashboard:

1.  Navigate to **Authentication** > **Providers**.
2.  Expand **Google**.
3.  Ensure **Enable Google IDP** is toggled **ON**.
4.  Verify that **Client ID** and **Client Secret** (from Google Cloud Console) are correct.
5.  Ensure the **Redirect URI** in Google Cloud Console is set to:
    `https://ugedscjzlezumceczfrk.supabase.co/auth/v1/callback`

## 4. Local Development
For `localhost:3000` development, ensure the "Site URL" in **Authentication** > **URL Configuration** is set to `http://localhost:3000`.
