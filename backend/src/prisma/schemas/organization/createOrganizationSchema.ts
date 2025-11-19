import { z } from 'zod';
import { OrganizationType } from '@prisma/client';

export const createOrganizationSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    street: z.string().min(1),
    zip: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    organizationType: z.nativeEnum(OrganizationType),
    website: z.string().url().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;