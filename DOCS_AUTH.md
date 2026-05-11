# Aether Engine: Authentication Setup Guide

To enable Google Authentication for the Infinite Adventure Engine, follow these steps in your Supabase Dashboard:

## 1. Supabase Configuration
1. Go to the [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project: `ugedscjzlezumceczfrk` (Infinite-Adventure-Engine).
3. Navigate to **Authentication** > **Providers**.
4. Locate **Google** and click to expand.
5. Toggle **Enable Google IDP** to **ON**.

## 2. Google Cloud Console Configuration
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select **Web application** as the Application type.
6. Add the following **Authorized redirect URIs**:
   - `https://ugedscjzlezumceczfrk.supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**.

## 3. Finalize Supabase Setup
1. Back in the Supabase Dashboard, paste the **Client ID** and **Client Secret** into the Google Provider settings.
2. Click **Save**.

## 4. Local Environment
Ensure your `.env` or `SupabaseService` configuration uses the correct URL and Anon Key. The current implementation defaults to the production project.

*Note: Without these steps, the "Continue with Google" button will return a 400 error (provider_not_enabled).*
