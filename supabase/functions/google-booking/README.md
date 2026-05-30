# google-booking Edge Function

Uploads Room/Villa ID proof image to Google Drive and creates Google Calendar event with attachment.

Deploy:

```bash
supabase functions deploy google-booking
```

Restaurant Settings required:
- Google Calendar ID
- Google Drive Folder ID
- Google Service Account JSON

Google setup:
1. Create Service Account in Google Cloud.
2. Enable Google Drive API and Google Calendar API.
3. Share the Drive folder with service account email as Editor.
4. Share the Google Calendar with service account email with Make changes to events permission.
5. Paste service account JSON in restaurant settings.
