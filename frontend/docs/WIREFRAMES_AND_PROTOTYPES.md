# Wireframes And Prototypes

Version: 1.0  
Date: 2026-03-17  
Project: Dilowa Frontend UX

## 1. UX Goals

- Make solution discovery fast and intuitive.
- Reduce cognitive load for non-technical municipal users.
- Keep role-specific actions visible only when relevant.
- Keep chatbot support context-aware and non-intrusive.

## 2. Primary User Journeys

1. Discover digital solution by category and problem.
2. Evaluate solution details and related taxonomy tags.
3. Ask AI helpdesk for recommendations.
4. Manage own profile and organization data.
5. Admin/moderator manages content and governance data.

## 3. Low-Fidelity Wireframes

## 3.1 Home And Catalog Entry

```text
+----------------------------------------------------------------------------------+
| Header: Logo | Search | Language | Login/Profile | Helpdesk                      |
+----------------------------------------------------------------------------------+
| Hero: "Find digital water solutions faster" + CTA: Browse Catalog              |
| Quick Filters: [Monitoring] [Infrastructure] [Data Analysis] [Communication]     |
+----------------------------------------------------------------------------------+
| Featured Solutions (cards)                                                       |
| [Card] [Card] [Card] [Card]                                                      |
+----------------------------------------------------------------------------------+
| Expert Videos teaser | FAQ teaser | Footer                                       |
+----------------------------------------------------------------------------------+
```

## 3.2 Catalog Search And Filter Page

```text
+----------------------------------------------------------------------------------+
| Header + breadcrumb                                                               |
+----------------------------------------------------------------------------------+
| Left Panel: Taxonomy Filters       | Main Panel: Results                         |
| - Solution Category                 | - Search bar + sort                         |
| - Application Area                  | - Result count                              |
| - Technical Area                    | - Solution cards list                       |
| - Digitalization Features           | - Pagination                                |
| [Reset] [Apply]                     |                                             |
+----------------------------------------------------------------------------------+
| Floating Helpdesk button                                                          |
+----------------------------------------------------------------------------------+
```

## 3.3 Solution Detail Page

```text
+----------------------------------------------------------------------------------+
| Solution Title | Status | Owner Org                                               |
+----------------------------------------------------------------------------------+
| Summary                                                                        |
| Taxonomy tags: [Tag] [Tag] [Tag]                                               |
| Link to provider/demo                                                           |
| Related solutions                                                               |
+----------------------------------------------------------------------------------+
| Side panel: Contact, documents, metadata                                        |
+----------------------------------------------------------------------------------+
```

## 3.4 Helpdesk Interaction Panel

```text
+-----------------------------------+
| Helpdesk (LISA)                   |
+-----------------------------------+
| User: "Need water quality tool"  |
| Bot: Clarification or suggestions |
| 1. Solution A (link)              |
| 2. Solution B (link)              |
| Note: sourced from database       |
+-----------------------------------+
| [Type message...] [Send]          |
+-----------------------------------+
```

## 3.5 Admin Dashboard (Role-Based)

```text
+----------------------------------------------------------------------------------+
| Admin Nav: Users | Solutions | Organizations | Taxonomy | Videos | Policies      |
+----------------------------------------------------------------------------------+
| KPI cards: Pending approvals / Active solutions / New users                      |
| Table area: filters + bulk actions                                                |
| Side drawer: create/edit form                                                     |
+----------------------------------------------------------------------------------+
```

## 4. Prototype Specification

## 4.1 Click Path Prototype (Low Fidelity)

Key click flows to implement in interactive prototype:
1. Home -> Catalog -> Solution Detail.
2. Catalog -> Helpdesk prompt -> Suggested solutions.
3. Login -> User Dashboard -> My Solutions.
4. Admin Login -> User Management -> Edit User Role.

## 4.2 Interaction States

- Loading states for list, detail, and chatbot requests.
- Empty states for no search results.
- Error states for API failure and permission denied.
- Confirmation modals for delete/archive actions.

## 4.3 Responsive Breakpoints

- Desktop: >= 1200 px (full filter panel + content grid).
- Tablet: 768-1199 px (collapsible filters).
- Mobile: <= 767 px (single-column, bottom-sheet filters, floating chatbot).

## 5. Accessibility Requirements For UI

- WCAG-aligned color contrast for text and controls.
- Keyboard navigability for forms, dialogs, and menus.
- Semantic labels and landmarks for screen readers.
- Focus-visible styles on actionable elements.

## 6. UX Validation Plan

1. Conduct moderated walkthrough with at least one user per major role.
2. Measure task completion time for catalog discovery journey.
3. Capture confusion points in filter taxonomy language.
4. Iterate wireframes before high-fidelity visual polish.
