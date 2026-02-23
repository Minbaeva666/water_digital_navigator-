# Chatbot Implementation Guide (Dilowa)

## Overview

The Dilowa chatbot is integrated into the Digital Atlas platform to help users find digital solutions for water management challenges. It uses **LISA AI** (a German LLM) to understand user queries and filter solutions from the database.

---

## Architecture

### Tech Stack

- **Frontend**: React + TypeScript + Ant Design UI
- **Backend**: Node.js + Express + TypeScript
- **Database**: MySQL (Prisma ORM)
- **LLM Integration**: LISA AI (via API)
- **Deployment**: Docker + Docker Compose

### Key Files

```
backend/
├── src/
│   ├── routes/
│   │   └── helpdesk.routes.ts          # Main chatbot endpoint
│   ├── services/
│   │   ├── lisa/
│   │   │   └── lisaService.ts          # LISA AI communication
│   │   ├── solution/
│   │   │   └── solutionService.ts      # Query digital solutions
│   │   └── taxonomy/
│   │       └── taxonomyService.ts      # Map LISA filters to taxonomy
│   └── middlewares/
│       └── login/
│           └── authMiddleware.ts       # Require login for chatbot

frontend/
├── src/
│   ├── components/
│   │   └── helpdesk/
│   │       ├── HelpdeskWidget.tsx      # Chat UI component
│   │       └── HelpdeskWidget.less     # Styling
│   └── services/
│       └── helpdeskService.ts          # API calls to chatbot endpoint
```

---

## How It Works: 3-Layer Flow

### Step 1: User Query → LISA AI (Language Understanding)

**File**: `backend/src/services/lisa/lisaService.ts`

The user types a message → Backend sends to LISA AI API with this context:

- User's message
- Model: `dilowa` (special agent trained for this domain)
- System prompt: "Extract solution filters from user query or ask clarification"

**LISA Response**: Either JSON filters (solution keywords) or German clarification question.

**Example**:

```
User: "Ich brauche eine Lösung für Wasserqualität"
↓
LISA: {
  "lösungskategorie": ["Monitoring", "Datenanalyse"],
  "technischer_bereich": ["IoT", "Sensorik"]
}
```

### Step 2: Filters → Taxonomy Mapping (DB Lookup)

**File**: `backend/src/services/taxonomy/taxonomyService.ts`

LISA returns generic filter terms (e.g., "Monitoring", "IoT"). Backend:

1. Searches TaxonomyNode table for matching category names
2. Maps filter terms to internal taxonomy IDs
3. Returns list of matching taxonomy node IDs

**Example**:

```
LISA filters: ["Monitoring"]
↓
DB Query: SELECT id FROM TaxonomyNode WHERE nameDe LIKE '%Monitoring%'
↓
Result: taxonomy_id = "abc-123-def"
```

### Step 3: Query Solutions (Database Search)

**File**: `backend/src/services/solution/solutionService.ts`

Backend queries DigitalSolution table using taxonomy IDs:

```sql
SELECT DISTINCT ds.*
FROM DigitalSolution ds
JOIN DigitalSolutionTaxonomy dst ON ds.id = dst.solutionId
JOIN TaxonomyNode tn ON dst.taxonomyId = tn.id
WHERE tn.id IN (taxonomy_ids_from_step_2)
AND ds.state = 'ACTIVATED'
LIMIT 10
```

Returns: Array of matching digital solutions with name, description, link.

### Step 4: Format Response (LISA Re-formatting)

**File**: `backend/src/services/lisa/lisaService.ts` - `formatSolutionsWithLisa()`

Backend sends solutions to LISA again with strict instructions:

- Format as markdown list with links
- Add 1-line summary
- **Must end with**: "Die Vorschläge stammen aus unserer Datenbank."
- No hallucination allowed (only use provided solutions)

**Flow**:

```
User message → LISA filters → Find taxonomy → Query solutions → Format with LISA → Send to frontend
```

---

## Database Schema: Key Tables

### TaxonomyNode (Categories)

```sql
CREATE TABLE TaxonomyNode (
  id VARCHAR(36) PRIMARY KEY,
  nameDe VARCHAR(255),          -- German name (e.g., "Wassermanagement")
  nameEn VARCHAR(255),
  slug VARCHAR(255),
  depth INT,                    -- 0=root, 1=sublevel, etc.
  sort INT,
  parentId VARCHAR(36),         -- Parent category
  FOREIGN KEY (parentId) REFERENCES TaxonomyNode(id)
);
```

### DigitalSolution (Solutions in Database)

```sql
CREATE TABLE DigitalSolution (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255),            -- Solution name
  shortDescription TEXT,
  state ENUM('ACTIVATED', 'ARCHIVED'),
  link VARCHAR(500),            -- External link or internal route
  created TIMESTAMP
);
```

### DigitalSolutionTaxonomy (Junction Table)

```sql
CREATE TABLE DigitalSolutionTaxonomy (
  solutionId VARCHAR(36),
  taxonomyId VARCHAR(36),
  PRIMARY KEY (solutionId, taxonomyId),
  FOREIGN KEY (solutionId) REFERENCES DigitalSolution(id),
  FOREIGN KEY (taxonomyId) REFERENCES TaxonomyNode(id)
);
```

---

## Configuration: How to Customize

### 1. Change LISA Model or API Endpoint

**Files**: `backend/.env`, `backend/.env.prod`, `backend/.env.development`

```env
# Which LISA agent to use
LLM_MODEL=your_model_name

# LISA API endpoint
LISA_API_BASE=https://chat-1.ki-awz.iisys.de/

# Your LISA API token
LISA_API_TOKEN=sk-YOUR_TOKEN_HERE
```

## How to Make Changes & Deploy

### Local Development Changes

1. **Edit code**:

   ```bash
   cd backend
   # Edit src/services/lisa/lisaService.ts
   npm run dev  # Hot reload
   ```

2. **Test in browser**: http://localhost:5173
   - Open chat widget
   - Type test message
   - Check backend logs: `npm run dev` console

3. **Debug**:
   - Backend logs show LISA API calls
   - Check `.env` is loaded correctly
   - Verify DB connection: `npm run prisma:studio`

### Production Deployment

1. **Update code** (Git):

   ```bash
   git add .
   git commit -m "Update chatbot behavior"
   git push origin main
   ```

2. **Rebuild & Deploy** (Docker Compose):

   ```bash
   cd /var/docker-dilowa  # Your production folder
   git pull
   docker-compose -f docker-compose.prod.yml down
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

3. **Verify**:

   ```bash
   docker ps  # Check containers running
   docker logs dilowa_backend  # Check startup
   curl http://localhost:3001/api/health  # Health check
   ```

4. **Test**: Visit http://192.168.84.86/dilowa (production URL)

---
