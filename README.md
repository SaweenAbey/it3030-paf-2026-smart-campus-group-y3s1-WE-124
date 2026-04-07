# UNI360-Smart-Campus-Operations-Hub
Smart Campus Operations Hub

## Google Login Setup (Local Development)

If Google Sign-In shows `Access blocked: Authorization Error` with `Error 401: invalid_client` or `no registered origin`, update the OAuth client in Google Cloud Console:

1. Open Google Cloud Console > APIs & Services > Credentials.
2. Select your OAuth 2.0 Client ID used by `VITE_GOOGLE_CLIENT_ID`.
3. Ensure the client type is **Web application**.
4. Add these **Authorized JavaScript origins**:
	- `http://localhost:5173`
	- `http://127.0.0.1:5173`
5. Save and wait 1-5 minutes for propagation.

Project config notes:

- Frontend Google client ID: `Frontend/.env` -> `VITE_GOOGLE_CLIENT_ID`
- Backend verifier client ID: `Backend/src/main/resources/application.properties` -> `google.client-id` (or `GOOGLE_CLIENT_ID` env var)
- Frontend and backend must use the same Google OAuth client ID.
