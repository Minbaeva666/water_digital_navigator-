import { z } from 'zod';
import { SalutationType, OrganizationType } from '@prisma/client';

export const organizationInputSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    street: z.string().min(1),
    zip: z.string().min(1),
    city: z.string().min(1),
    country: z.string().min(1),
    organizationType: z.nativeEnum(OrganizationType),
    website: z.string().min(1),
});

export const registerAsRepresentativeSchema = z.object({
    salutationType: z.nativeEnum(SalutationType),
    title: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(1, 'Password must be at least 1 character long'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phonenumber: z.string().optional(),
    hasAcceptedPrivacyPolicy: z
        .preprocess((val) => val === "true" || val === true, z.literal(true)),
    hasAcceptedTerms: z
        .preprocess((val) => val === "true" || val === true, z.literal(true)),
    organization: organizationInputSchema.optional(),
});

export const registerAsPrivateSchema = z.object({
    salutationType: z.nativeEnum(SalutationType),
    title: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(1, 'Password must be at least 1 character long'),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phonenumber: z.string().optional(),
    hasAcceptedPrivacyPolicy: z
        .preprocess((val) => val === "true" || val === true, z.literal(true)),
    hasAcceptedTerms: z
        .preprocess((val) => val === "true" || val === true, z.literal(true)),
});

export type RegisterAsRepresentativeInput = z.infer<typeof registerAsRepresentativeSchema>;
export type RegisterAsPrivateInput = z.infer<typeof registerAsPrivateSchema>;