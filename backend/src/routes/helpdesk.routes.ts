import { Router, Request, Response } from 'express';
import { logService } from '../services/logger/loggerService';
import { prisma } from '../prisma/prisma';
import { sendMessageToLisa, formatSolutionsWithLisa, getSystemPrompt } from '../services/lisa/lisaService';
import { findSolutionsFromLisaFilters } from '../services/solution/solutionService';

const helpdeskRouter = Router();

// Handle chatbot messages
helpdeskRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    console.log('[HELPDESK] Chat endpoint called');
    const { message = '', userId, taxonomySelection } = req.body;

    logService.info(`Helpdesk chat message received: ${message}, taxonomySelection: ${JSON.stringify(taxonomySelection)}`);

    const normalized = String(message).trim().toLowerCase();
    const hasMessage = message && message.trim().length > 0;

    // Priority 1: If user has a message, use LISA AI
    if (hasMessage) {
      try {
        // Build context from taxonomy selection if provided
        let context = '';
        if (Array.isArray(taxonomySelection) && taxonomySelection.length > 0) {
          const selection = taxonomySelection.slice(0, 3);
          const nodes = await prisma.taxonomyNode.findMany({ 
            where: { id: { in: selection } },
            orderBy: { sort: 'asc' }
          });
          const names = nodes.map(n => n.nameDe || n.nameEn || n.slug);
          const selectionPath = names.join(' › ');
          context = `Ausgewählte Kategorien: ${selectionPath}`;
        }

        console.log('[LISA] Calling LISA AI...');
        
        // Step 1: Send message to LISA
        const lisaResponse = await sendMessageToLisa(message, context);

        console.log('[LISA] Response received:', { 
          isJson: lisaResponse.isJson,
          hasFilters: !!lisaResponse.filters 
        });

        // Step 2: If LISA returned JSON filters, find matching solutions
        if (lisaResponse.isJson && lisaResponse.filters) {
          console.log('[LISA] Returned filters, finding solutions...', lisaResponse.filters);
          logService.info('LISA provided filters, searching for solutions...', { 
            filters: lisaResponse.filters 
          });

          const solutions = await findSolutionsFromLisaFilters(lisaResponse.filters);
          console.log('[SQL] Found', solutions.length, 'solutions');

          if (solutions.length > 0) {
            // Step 3: Format solutions with LISA
            const formattedResponse = await formatSolutionsWithLisa(solutions, message);

            const botResponse = {
              id: Date.now().toString(),
              text: formattedResponse,
              sender: 'bot',
              timestamp: new Date(),
              solutions: solutions.slice(0, 5).map(s => ({ // Return top 5
                id: s.id,
                name: s.name,
                shortDescription: s.shortDescription,
                link: s.link
              }))
            };

            res.status(200).json(botResponse);
            return;
          }

          const clarification = await sendMessageToLisa(
            `Es wurden keine passenden Lösungen gefunden. Stelle 1–2 kurze Rückfragen in Deutsch, um die Suche zu verfeinern.`
          );
          const fallbackText = 'Ich habe keine passenden Lösungen gefunden. Kannst du deine Anfrage präziser formulieren?';
          const botResponse = {
            id: Date.now().toString(),
            text: clarification.isJson ? fallbackText : clarification.content,
            sender: 'bot',
            timestamp: new Date(),
          };
          res.status(200).json(botResponse);
          return;
        }

        // Step 4: If no JSON filters, return LISA's conversational response
        const botResponse = {
          id: Date.now().toString(),
          text: lisaResponse.content,
          sender: 'bot',
          timestamp: new Date(),
        };

        res.status(200).json(botResponse);
        return;

      } catch (aiError) {
        console.error('[ERROR] LISA AI Error:', aiError);
        logService.error('Error with LISA AI:', aiError as Error);
        
        // Intelligent fallback based on keywords
        let fallbackResponse = 'Entschuldigung, ich habe gerade technische Schwierigkeiten. Bitte versuche es später erneut oder kontaktiere unser Support-Team.';
        
        if (message.toLowerCase().includes('lösung') || message.toLowerCase().includes('software')) {
          fallbackResponse = 'Du suchst nach digitalen Lösungen? Ich kann dir helfen, passende Tools zu finden. Beschreibe mir genauer, was du benötigst (z.B. Wassermanagement, Monitoring, Datenanalyse).';
        } else if (message.toLowerCase().includes('wasser')) {
          fallbackResponse = 'Bei Wasserthemen kann ich dir weiterhelfen! Geht es um Wassersparen, Wasserqualität, Abwasser oder etwas anderes?';
        } else if (message.toLowerCase().includes('klima')) {
          fallbackResponse = 'Klimaschutz ist wichtig! Suchst du nach Informationen zu Klimaanpassung, Emissionsreduktion oder nachhaltigen Technologien?';
        }
        
        const botResponse = {
          id: Date.now().toString(),
          text: fallbackResponse,
          sender: 'bot',
          timestamp: new Date(),
        };
        res.status(200).json(botResponse);
        return;
      }
    }
    // STATE MACHINE LOGIC (only for category navigation without message)
    // If taxonomySelection is provided and NO message, show next-level suggestions
    if (Array.isArray(taxonomySelection) && taxonomySelection.length > 0 && !hasMessage) {
      // Limit selection to 3
      const selection = taxonomySelection.slice(0, 3);
      // Fetch selected node names
      const nodes = await prisma.taxonomyNode.findMany({ 
        where: { id: { in: selection } },
        orderBy: { sort: 'asc' }
      });
      const names = nodes.map(n => n.nameDe || n.nameEn || n.slug);

      // Find children of last selected node (if any)
      const lastId = selection[selection.length - 1];
      const children = await prisma.taxonomyNode.findMany({ 
        where: { parentId: lastId }, 
        orderBy: { sort: 'asc' } 
      });

      const suggestions = children.map(c => ({ id: c.id, label: c.nameDe || c.nameEn || c.slug }));

      // Build response text
      const selectionPath = names.join(' › ');
      let responseText = '';
      
      if (suggestions.length > 0) {
        responseText = `Du hast ausgewählt: ${selectionPath}.\n\nWähle bitte eine Unterkategorie:`;
      } else if (selection.length < 3) {
        responseText = `Du hast ausgewählt: ${selectionPath}.\n\nMöchtest du noch eine weitere Kategorie hinzufügen oder soll ich dir weiterhelfen?`;
      } else {
        responseText = `Du hast ausgewählt: ${selectionPath}.\n\nWie kann ich dir noch helfen?`;
      }

      const botResponse = {
        id: Date.now().toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        suggestions,
        selectedPath: selection,
      };

      res.status(200).json(botResponse);
      return;
    }

    // START: If no selection and no message, or message is greeting/empty, show root categories
    const requestCategoriesTriggers = [
      'kategorie', 'kategorien', 'category', 'categories', 
      'hilfe', 'hilfe bitte', 'start', 'menu', 'kategorien anzeigen',
      'wasser', 'klima', 'boden', ''
    ];

    const shouldShowCategories = 
      normalized.length === 0 || 
      normalized.length < 20 || 
      requestCategoriesTriggers.some(t => t && normalized.includes(t));

    if (shouldShowCategories) {
      // fetch root nodes (depth: 0 = top-level categories)
      const nodes = await prisma.taxonomyNode.findMany({ 
        where: { depth: 0 }, 
        orderBy: [{ sort: 'asc' }, { nameDe: 'asc' }] 
      });
      const suggestions = nodes.map(n => ({ id: n.id, label: n.nameDe || n.nameEn || n.slug }));

      const botResponse = {
        id: Date.now().toString(),
        text: 'Willkommen! Bitte wähle eine Kategorie, damit ich dir besser helfen kann:',
        sender: 'bot',
        timestamp: new Date(),
        suggestions,
      };

      res.status(200).json(botResponse);
      return;
    }

  } catch (error) {
    logService.error('Error processing helpdesk chat:', error as Error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Handle contact form submissions
helpdeskRouter.post('/contact', async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    logService.info(`Helpdesk contact form submitted: ${email} - ${subject}`);

    // TODO: Implement your contact handling logic here
    // This could be:
    // 1. Send email to support team
    // 2. Store in database
    // 3. Create ticket in support system
    // 4. Send confirmation email to user

    res.status(200).json({ 
      success: true,
      message: 'Your message has been sent successfully' 
    });
  } catch (error) {
    logService.error('Error processing helpdesk contact:', error as Error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Test endpoint to verify LISA API is working
helpdeskRouter.post('/test-ai', async (req: Request, res: Response) => {
  try {
    console.log('[TEST] Testing LISA API...');
    
    const testPrompt = 'Teste LISA: Antworte kurz auf Deutsch mit "Hallo"';
    const response = await sendMessageToLisa(testPrompt);
    
    res.status(200).json({ 
      success: true,
      message: 'LISA API is working!',
      isJson: response.isJson,
      responsePreview: response.content.substring(0, 100)
    });
  } catch (error) {
    console.error('[ERROR] Test failed:', error);
    res.status(500).json({ 
      error: 'Failed to test LISA API',
      details: (error as any).message || String(error)
    });
  }
});

helpdeskRouter.get('/system-prompt', async (req: Request, res: Response) => {
  try {
    const prompt = getSystemPrompt();
    res.status(200).json({
      prompt,
      model: process.env.LLM_MODEL || 'lisa-v40-rc2-gpt-oss120b',
      usesMock: process.env.USE_MOCK_LISA === 'true'
    });
  } catch (error) {
    console.error('[ERROR] Failed to fetch system prompt:', error);
    res.status(500).json({ error: 'Failed to fetch system prompt' });
  }
});

export default helpdeskRouter;
