# ai-agent Edge Function

Deploy:
```bash
supabase functions deploy ai-agent
```

Required in Owner Settings / AI Agent Settings:
- Google Service Account JSON
- Vertex Project ID (optional if JSON contains project_id)
- Vertex Location (default us-central1)
- Vertex Model (default gemini-1.5-flash-002)

Enable Vertex AI API and give service account Vertex AI User/Admin permission.
