import { Request, Response } from 'express';
import {
    AccountState,
    MaturityDegree,
    OrganizationType, PresentedBy, Role,
    SalutationType,
    OfferingCategory, DigitalSolutionState, PublishedByType,
} from '@prisma/client';
import {prisma} from "../prisma/prisma";
import {normalizeLang, sortByLabel, toLabel} from "../helpers/input.helpers";

export const getOrganizationTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizationTypes = Object.values(OrganizationType);
        res.status(200).json({ organizationTypes });
    } catch (error) {
        console.error('Fehler beim Laden der Organisationstypen:', error);
        res.status(500).json({ error: 'Die Organisationstypen konnten nicht geladen werden.' });
    }
};

export const getPublishedBy = async (req: Request, res: Response): Promise<void> => {
    try {
        const publishedByTypes = Object.values(PublishedByType);
        res.status(200).json({ publishedByTypes });
    } catch (error) {
        console.error('Fehler beim Laden der Quell-Typen:', error);
        res.status(500).json({ error: 'Die Quell-Typen konnten nicht geladen werden.' });
    }
};

export const getDigitalSolutionStateTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const digitalSolutionStateTypes = Object.values(DigitalSolutionState);
        res.status(200).json({ digitalSolutionStateTypes });
    } catch (error) {
        console.error('Fehler beim Laden der digitalSolutionStateTypes:', error);
        res.status(500).json({ error: 'Die digitalSolutionStateTypes konnten nicht geladen werden.' });
    }
};

export const getSalutationTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const salutationTypes = Object.values(SalutationType);
        res.status(200).json({ salutationTypes });
    } catch (error) {
        console.error('Fehler beim Laden der Anredetypen:', error);
        res.status(500).json({ error: 'Die Anredetypen konnten nicht geladen werden.' });
    }
};

export const getAccountStateTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const accountStateTypes = Object.values(AccountState);
        res.status(200).json({ accountStateTypes });
    } catch (error) {
        console.error('Fehler beim Laden der Account-Status Typen:', error);
        res.status(500).json({ error: 'Fehler beim Laden der Account-Status Typen.' });
    }
};

export const getMaturityDegrees = async (req: Request, res: Response): Promise<void> => {
    try {
        const maturityDegrees = Object.values(MaturityDegree);
        res.status(200).json({ maturityDegrees });
    } catch (error) {
        console.error('Fehler beim Laden der Reifegrade:', error);
        res.status(500).json({ error: 'Die Reifegrade konnten nicht geladen werden.' });
    }
};

export const getPresentedByTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const presentedByTypes = Object.values(PresentedBy);
        res.status(200).json({ presentedByTypes });
    } catch (error) {
        console.error('Error loading presentedBy types:', error);
        res.status(500).json({ error: 'Error loading presentedBy types.' });
    }
};


export const getOfferingCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const offeringCategoryTypes = Object.values(OfferingCategory);
        res.status(200).json({ offeringCategoryTypes });
    } catch (error) {
        console.error('Fehler beim Laden der OfferingCategories:', error);
        res.status(500).json({ error: 'Die OfferingCategories konnten nicht geladen werden.' });
    }
};

export const getAllOrganizations = async (req: Request, res: Response): Promise<void> => {
    try {
        const organizations = await prisma.organization.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        if (organizations.length === 0) {
            res.status(404).json({ error: 'Organizations not found.' });
            return;
        }

        res.status(200).json(organizations);
    } catch (error) {
        console.error('Error loading organizations:', error);
        res.status(500).json({ error: 'Error loading organizations.' });
    }
};

export const getRoleTypes = async (req: Request, res: Response): Promise<void> => {
    try {
        const roleTypes = Object.values(Role);
        res.status(200).json({ roleTypes });
    } catch (error) {
        console.error('Fehler beim Laden der Rollentypen:', error);
        res.status(500).json({ error: 'Die Rollentypen konnten nicht geladen werden.' });
    }
};

export const getCountries = async (req: Request, res: Response): Promise<void> => {
    try {
        const lang = normalizeLang(req.query.lang);
        const rows = await prisma.country.findMany({
            select: { code: true, nameDe: true, nameEn: true },
        });

        const options = rows
            .map((c) => ({
                value: c.code,
                label: toLabel(lang, c.nameDe, c.nameEn, c.code),
            }))
            .sort((a, b) => sortByLabel(a, b, lang));

        res.setHeader("Cache-Control", "no-store");
        res.status(200).json({ countries: options });
    } catch (error) {
        console.error("Fehler beim Laden der Länder:", error);
        res.status(500).json({ error: "Die Länder konnten nicht geladen werden." });
    }
};

export const getRegions = async (req: Request, res: Response): Promise<void> => {
    try {
        const country = String(req.query.country || "").toUpperCase();
        const lang = normalizeLang(req.query.lang);

        if (!country) {
            res.status(400).json({ error: 'Parameter "country" (z.B. DE) ist erforderlich.' });
            return;
        }

        const rows = await prisma.region.findMany({
            where: { countryId: country },
            select: { id: true, code: true, nameDe: true, nameEn: true },
        });

        const options = rows
            .map((r) => ({
                value: r.id,
                label: toLabel(lang, r.nameDe, r.nameEn, r.code),
                code: r.code,
            }))
            .sort((a, b) => sortByLabel(a, b, lang));

        res.setHeader("Cache-Control", "no-store");
        res.status(200).json({ regions: options });
    } catch (error) {
        console.error("Fehler beim Laden der Regionen:", error);
        res.status(500).json({ error: "Die Regionen konnten nicht geladen werden." });
    }
};