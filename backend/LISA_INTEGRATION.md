# LISA AI Integration Guide

## Overview

LISA (Language Intelligence Solution Assistant) is the AI service that powers the Dilowa chatbot. It processes user queries and returns structured JSON filters or clarification questions to help users find relevant digital solutions.

## Configuration

### 1. Environment Variables

Configure LISA in `/backend/.env`:

```env
LISA_API_TOKEN=your-api-token-here
LISA_API_BASE=https://your-lisa-endpoint.com/
LLM_MODEL=your-model-name
USE_MOCK_LISA=false
```

- **LISA_API_TOKEN**: API authentication token for LISA service (obtain from your LISA API provider)
- **LISA_API_BASE**: Base URL for the LISA API endpoint
- **LLM_MODEL**: Name of the LISA model to use (check available models with your API key)
- **USE_MOCK_LISA**: Set to `false` for production, `true` for testing without real API

### 2. Endpoint Configuration

The `.llm_endpoint` file maps model names to their API endpoints:

```
model-name-1=https://your-endpoint.com/api/chat/completions
model-name-2=https://your-endpoint.com/api/chat/completions
```

This allows different models to use different endpoints if needed.

## Available LISA Models

Available models depend on your API key permissions. Check with your LISA API provider for the list of models you have access to.

Typical model categories:

- **Text understanding models** (for chatbot queries and natural language processing)
- **Vision models** (for image analysis tasks)
- **Code models** (for code-related tasks)
- **Specialized domain models** (trained for specific use cases)

To see available models for your API key, consult your LISA provider's documentation or admin panel.

## How It Works

### 3-Layer Architecture

1. **User Query** → LISA processes natural language
2. **LISA Response** → Returns JSON filters OR clarification questions
3. **Database Query** → Filters are mapped to taxonomy nodes
4. **Solution Retrieval** → Matching digital solutions are fetched
5. **LISA Formatting** → Solutions are formatted into natural language response

### JSON Filter Format

LISA returns structured filters like:

```json
{
  "lösungskategorie": ["Monitoring"],
  "anwendungsbereich": ["Abwasser", "Klärwerk"],
  "aufgabenbereich": ["Qualitätsüberwachung", "Alarmierung"],
  "technischer_bereich": ["Sensorik", "Datenerfassung"],
  "digitalisierung": ["Echtzeit", "Dashboard", "Datenvisualisierung"]
}
```

## Testing LISA

### Test from Browser

Visit your LISA web interface (URL provided by your LISA administrator).

### Test API Endpoint

```bash
curl -X POST https://your-lisa-endpoint.com/api/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -d '{
    "model": "your-model-name",
    "messages": [{"role": "user", "content": "Test"}]
  }'
```

### Test in Dilowa Chatbot

1. Start backend: `npm run dev`
2. Send message via API:

```bash
curl -X POST http://localhost:3001/api/helpdesk/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Ich brauche eine Lösung für Wasserqualität"}'
```

## Network Requirements

Backend must have outbound HTTPS access to your LISA API endpoint:

- Host: Your LISA endpoint hostname
- Port: `443` (HTTPS)
- Protocol: HTTPS

**Verify connectivity:**

```bash
curl -I https://your-lisa-endpoint.com/api/chat/completions
```

## Mock Mode (Development/Testing)

For testing without real API access, enable mock mode:

```env
USE_MOCK_LISA=true
```

Mock mode returns generic clarification messages without calling the real API.

## Troubleshooting

### "fetch failed" Error

**Symptom:** Backend logs show timeout errors after 10-75 seconds
**Cause:** Network connectivity issue from backend host to LISA endpoint
**Solution:**

- Check firewall rules
- Verify VPN connection
- Test with `curl` from backend host
- Enable mock mode temporarily: `USE_MOCK_LISA=true`

### Wrong/No Results

**Symptom:** LISA returns clarification instead of filters
**Cause:** Query too vague or ambiguous
**Solution:** Provide more specific queries with domain context (e.g., "Wasserqualität", "Abwasser", "Monitoring")

### Hallucinated Solutions

**Symptom:** Bot returns solutions not in database
**Cause:** LISA creating fictional solutions
**Solution:** Code already includes safeguards - only DB solutions are returned. Check `formatSolutionsWithLisa()` in `lisaService.ts`.

## Key Files

- `/backend/src/services/lisa/lisaService.ts` - Main LISA service
- `/backend/src/services/taxonomy/taxonomyService.ts` - Filter-to-taxonomy mapping
- `/backend/src/services/solution/solutionService.ts` - Database queries
- `/backend/src/routes/helpdesk.routes.ts` - Chatbot endpoint orchestration
- `/backend/.env` - Configuration
- `/backend/.llm_endpoint` - Endpoint mappings

## API Reference

### `sendMessageToLisa(userMessage, context)`

Sends user message to LISA and returns parsed response.

**Returns:**

```typescript
{
  content: string,
  isJson: boolean,
  hasFilters: boolean,
  filters?: LisaFilters
}
```

### `formatSolutionsWithLisa(solutions, originalQuery)`

Formats database solutions using LISA for natural language output.

**Returns:** Formatted text string
