import { Router, Request, Response, RequestHandler } from 'express';
import { logService } from '../services/logger/loggerService';
import { prisma } from '../prisma/prisma';
import { sendMessageToLisa, formatSolutionsWithLisa } from '../services/lisa/lisaService';
import { findSolutionsFromLisaFilters } from '../services/solution/solutionService';
import { authenticate } from '../middlewares/login/authMiddelware';

const helpdeskRouter = Router();

const requireChatAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({
      error: 'auth_required',
      message: 'Um den KI-Chatbot zu nutzen, musst du dich anmelden',
    });
    return;
  }
  authenticate(req, res, next);
};

// Handle chatbot messages
helpdeskRouter.post('/chat', requireChatAuth, async (req: Request, res: Response) => {
  try {
    logService.info('[HELPDESK] Chat endpoint called');
    const { message = '' } = req.body;

    logService.info(`Helpdesk chat message received: ${message}`);

    const hasMessage = message && message.trim().length > 0;

    // User must provide a message
    if (!hasMessage) {
      const botResponse = {
        id: Date.now().toString(),
        text: 'Bitte beschreibe, welche digitale Lösung du suchst.',
        sender: 'bot',
        timestamp: new Date(),
      };
      res.status(200).json(botResponse);
      return;
    }

    try {
      logService.info('[LISA] Calling LISA AI...');
      
      // Step 1: Send message to LISA
      const lisaResponse = await sendMessageToLisa(message);

      logService.info('[LISA] Response received:', { 
        isJson: lisaResponse.isJson,
        hasFilters: !!lisaResponse.filters 
      });

      // Step 2: If LISA returned JSON filters, find matching solutions
      if (lisaResponse.isJson && lisaResponse.filters) {
        logService.info('[LISA] Returned filters, finding solutions...', lisaResponse.filters);

        const solutions = await findSolutionsFromLisaFilters(lisaResponse.filters);
        logService.info('[SQL] Found solutions', { count: solutions.length });

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

        // No solutions found - ask for clarification
        const clarification = await sendMessageToLisa(
          `Es wurden keine passenden Lösungen gefunden. Stelle maximal 3 kurze, spezifische Rückfragen in Deutsch, um die Suche zu verfeinern. Frage nur nach fehlenden Details, nicht nach bereits genannten.`
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

      // Step 3: If no JSON filters, return LISA's conversational response (clarifying questions)
      const botResponse = {
        id: Date.now().toString(),
        text: lisaResponse.content,
        sender: 'bot',
        timestamp: new Date(),
      };

      res.status(200).json(botResponse);
      return;

    } catch (aiError) {
      logService.error('[ERROR] LISA AI Error:', aiError as Error);
      
      // Intelligent fallback based on keywords
      let fallbackResponse = 'Entschuldigung, ich konnte deine Anfrage gerade nicht beantworten. Bitte nutze das Kontaktformular unter /kontakt oder versuche es später erneut.';
      
      if (message.toLowerCase().includes('lösung') || message.toLowerCase().includes('software')) {
        fallbackResponse = 'Du suchst nach digitalen Lösungen? Ich kann dir helfen, passende Tools zu finden. Beschreibe mir genauer, was du benötigst (z.B. Wassermanagement, Monitoring, Datenanalyse). Wenn das nicht hilft, nutze bitte das Kontaktformular unter /kontakt.';
      } else if (message.toLowerCase().includes('wasser')) {
        fallbackResponse = 'Bei Wasserthemen kann ich dir weiterhelfen! Geht es um Wassersparen, Wasserqualität, Abwasser oder etwas anderes? Wenn das nicht hilft, nutze bitte das Kontaktformular unter /kontakt.';
      } else if (message.toLowerCase().includes('klima')) {
        fallbackResponse = 'Klimaschutz ist wichtig! Suchst du nach Informationen zu Klimaanpassung, Emissionsreduktion oder nachhaltigen Technologien? Wenn das nicht hilft, nutze bitte das Kontaktformular unter /kontakt.';
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

  } catch (error) {
    logService.error('Error processing helpdesk chat:', error as Error);
    res.status(500).json({
      error: 'Failed to process message',
      message: 'Entschuldigung, ich konnte deine Anfrage gerade nicht beantworten. Bitte nutze das Kontaktformular unter /kontakt oder versuche es später erneut.',
    });
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
    logService.info('[TEST] Testing LISA API...');
    
    const testPrompt = 'Teste LISA: Antworte kurz auf Deutsch mit "Hallo"';
    const response = await sendMessageToLisa(testPrompt);
    
    res.status(200).json({ 
      success: true,
      message: 'LISA API is working!',
      isJson: response.isJson,
      responsePreview: response.content.substring(0, 100)
    });
  } catch (error) {
    logService.error('[ERROR] Test failed:', error as Error);
    res.status(500).json({ 
      error: 'Failed to test LISA API',
      details: (error as any).message || String(error)
    });
  }
});

// System prompt endpoint removed: LISA agent 'dilowa' now provides the system prompt

export default helpdeskRouter;
