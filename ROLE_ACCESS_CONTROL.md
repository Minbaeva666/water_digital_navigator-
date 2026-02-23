# Role Access Control Matrix

This document describes which roles can see which pages and which actions are authorized.

## Source of Truth

- Backend permissions: `backend/src/config/permissions/rolePermissions.ts`
- Backend navigation by role: `backend/src/config/permissions/roleNavigation.ts`
- Permission middleware: `backend/src/middlewares/requirePermission.ts`
- Scoped permission check (`own` vs `others`): `backend/src/config/permissions/checkScopedPermission.ts`

## Roles

- `ADMIN`
- `MODERATOR`
- `USER`

---

## Authorized Pages by Role

Based on `ROLE_NAVIGATION`.

### ADMIN

- `/admin/user-management`
- `/admin/digital-solution-management`
- `/admin/organization-management`
- `/admin/taxonomie-management`
- `/admin/expert-video-management`
- `/admin/app-management`
- `login` (logout target)

### MODERATOR

- `/moderator/solutions`

### USER

- `/profil`
- `/my-digital-solutions`
- `login` (logout target)

---

## Permission Matrix (Resources × Actions)

Legend:

- `✅` = allowed
- `❌` = not allowed
- `own/others` = scoped access

### ADMIN

Admin is treated as superuser in middleware (`requirePermission`): checks are bypassed and request is allowed.

| Resource | Create | Read | Edit | Delete |
|---|---|---|---|---|
| `user` | ✅ | ✅ | own+others | own+others |
| `organization` | ✅ | ✅ | own+others | own+others |
| `digital_solution` | ✅ | ✅ | own+others | own+others |
| `expert_video` | ✅ | ✅ | own+others | own+others |
| `faq` | ✅ | ✅ | ✅ | ✅ |
| `termsOfUse` | ✅ | ✅ | ✅ | ✅ |
| `privacyPolicy` | ✅ | ✅ | ✅ | ✅ |
| `accessibilityStatement` | ✅ | ✅ | ✅ | ✅ |
| `imprintStatement` | ✅ | ✅ | ✅ | ✅ |
| `publicPdf` | ✅ | ✅ | ✅ | ✅ |

### MODERATOR

| Resource | Create | Read | Edit | Delete |
|---|---|---|---|---|
| `user` | ❌ | ✅ | own | ❌ |
| `organization` | ❌ | ✅ | ❌ | ❌ |
| `digital_solution` | ❌ | ✅ | ❌ | ❌ |
| `expert_video` | ✅ | ✅ | own+others | own+others |
| `faq` | ✅ | ✅ | ✅ | ✅ |
| `termsOfUse` | ✅ | ✅ | ✅ | ✅ |
| `privacyPolicy` | ✅ | ✅ | ✅ | ✅ |
| `accessibilityStatement` | ✅ | ✅ | ✅ | ✅ |
| `imprintStatement` | ✅ | ✅ | ✅ | ✅ |
| `publicPdf` | ✅ | ✅ | ✅ | ✅ |

### USER

| Resource | Create | Read | Edit | Delete |
|---|---|---|---|---|
| `user` | ❌ | ✅ | own | ❌ |
| `organization` | ❌ | ✅ | ❌ | ❌ |
| `digital_solution` | ✅ | ✅ | own | own |
| `expert_video` | ❌ | ✅ | ❌ | ❌ |
| `solution_category` | ❌ | ✅ | ❌ | ❌ |
| `faq` | ❌ | ✅ | ❌ | ❌ |
| `termsOfUse` | ❌ | ✅ | ❌ | ❌ |
| `privacyPolicy` | ❌ | ✅ | ❌ | ❌ |
| `accessibilityStatement` | ❌ | ✅ | ❌ | ❌ |
| `imprintStatement` | ❌ | ✅ | ❌ | ❌ |
| `publicPdf` | ❌ | ✅ | ❌ | ❌ |

---

## Important Behavior Notes

1. **Admin override**
   - In `requirePermission`, if role is `ADMIN`, permission checks are skipped and request continues.

2. **Scoped checks (`own` vs `others`)**
   - For non-admin users, when a permission is scoped (`{ own, others }`), ownership is checked via `RESOURCE_CONFIG`.

3. **Delete restrictions when data is referenced**
   - Deletes are blocked when entities are used/referenced (HTTP `409 Conflict`).
   - Implemented for key admin delete flows (users, organizations, taxonomy-in-use, expert video references), plus global Prisma relation conflict mapping (`P2003`/`P2014` => `409`).

4. **Navigation vs authorization**
   - `ROLE_NAVIGATION` controls what menu entries are shown.
   - Backend permission middleware is the enforcement layer for actual access.

---

## API Endpoints with Delete Protection (Current)

- Users: `DELETE /api/users/:id`
- Organizations: `DELETE /api/organizations/:id`
- Digital solutions: `DELETE /api/digital-solutions/digital-solution/:id`
- Expert videos: `DELETE /api/expert-videos/:id`
- Taxonomy nodes: tree updates via `POST /api/taxonomyNodes` block removal of categories used in atlases

---

## Maintenance Guidance

When changing role capabilities:

1. Update `rolePermissions.ts`.
2. Update `roleNavigation.ts` if UI menu should change.
3. Ensure corresponding route middleware (`requirePermission`) is present on endpoints.
4. Keep this document in sync.
