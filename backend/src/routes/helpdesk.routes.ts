import { Router, Request, Response } from 'express';
import { logService } from '../services/logger/loggerService';
import { prisma } from '../prisma/prisma';

const helpdeskRouter = Router();

// Handle chatbot messages
helpdeskRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message = '', userId, taxonomySelection } = req.body;

    logService.info(`Helpdesk chat message received: ${message}, taxonomySelection: ${JSON.stringify(taxonomySelection)}`);

    // STATE MACHINE LOGIC
    // If taxonomySelection is provided, respond with next-level suggestions or acknowledgement
    if (Array.isArray(taxonomySelection) && taxonomySelection.length > 0) {
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

    // START: If no selection yet or message is greeting/empty, show root categories
    const normalized = String(message).trim().toLowerCase();
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

    // FALLBACK: generic acknowledgement (if user typed something that doesn't trigger categories)
    const botResponse = {
      id: Date.now().toString(),
      text: 'Vielen Dank für deine Nachricht. Unser Team wird sich bald bei dir melden!',
      sender: 'bot',
      timestamp: new Date(),
    };

    res.status(200).json(botResponse);
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

export default helpdeskRouter;
