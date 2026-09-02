# DealSafe

## Moolre sandbox setup

DealSafe uses Moolre Mobile Money Collection through the Netlify function at
`/.netlify/functions/moolre-payment`. The function keeps credentials off the
client and defaults to the Moolre sandbox.

1. Create or sign in to a business account at [app.moolre.com](https://app.moolre.com/#!/signup).
2. Open the Moolre dashboard and create an **API Service**.
3. Generate the service's **Public API Key** and note the Moolre username and account number.
4. Test requests against `https://sandbox.moolre.com` first. Moolre's documented payment endpoint is `/open/transact/payment`; status checks use `/open/transact/status`.
5. In Netlify, open `Site configuration > Environment variables` and add these values for the production deploy context:

```text
MOOLRE_ENVIRONMENT=sandbox
MOOLRE_API_USER=your_moolre_username
MOOLRE_API_PUBKEY=your_public_api_key
MOOLRE_ACCOUNT_NUMBER=your_moolre_account_number
```

6. Redeploy the site. The buyer enters their payer number and network. For a first-time payer, Moolre may send a one-time SMS verification code; enter that code in DealSafe so it can be verified before Moolre sends the payment prompt.
7. Select **Check payment status** after approval. Only a Moolre response with `data.txstatus` equal to `1` changes the DealSafe transaction to `payment_secured`.

When ready for production, change `MOOLRE_ENVIRONMENT` to `live` and use live API credentials. Do not commit API keys or expose them as `VITE_` variables.

Official references: [Moolre authentication](https://docs.moolre.com/authentication), [mobile money collection](https://docs.moolre.com/api/payments/initiate), [payment status](https://docs.moolre.com/api/payments/status), and [sandbox testing](https://docs.moolre.com/guides/sandbox-testing).

## Current payment behavior

The integration uses direct debit/USSD prompts, first-time payer OTP verification, and status polling. It does not yet automatically process Moolre webhooks; the buyer must click **Check payment status** after approving the prompt. Moolre's webhook callback can be added after the callback URL and deployment secret are configured in the Moolre API Service.

## Original Vite notes

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
