import {PrismaClient, Prisma, OrganizationType, OrganizationState} from '@prisma/client';
import { ConflictError } from '../errors/ConflictError';
import {BadRequestError} from "../errors/BadRequestError";

const prisma = new PrismaClient();


type OrgCreatePayload = {
    name: string;
    email: string;
    street: string;
    zip: string;
    city: string;
    organizationState: OrganizationState;
    countryCode: string;
    regionId?: string | null;
    organizationType: OrganizationType | string;
    website?: string;
    createdBy?: { connect: { id: string } };
};

export async function prepareOrganizationData(
    payload: OrgCreatePayload,
    logoBuffer: Buffer,
    mimeType: string
): Promise<Prisma.OrganizationCreateInput> {
    // 1) Duplicate per E-Mail (Optional – DB hat unique, hier bekommst du die schönere Fehlermeldung)
    const existingOrg = await prisma.organization.findUnique({
        where: { email: payload.email },
        select: { id: true },
    });
    if (existingOrg) {
        throw new ConflictError("Organization already exists");
    }

    // 2) Country prüfen
    const country = await prisma.country.findUnique({
        where: { code: payload.countryCode },
        select: { code: true },
    });
    if (!country) {
        throw new BadRequestError(`Unknown country code: ${payload.countryCode}`);
    }

    // 3) Region prüfen (falls angegeben)
    if (payload.regionId) {
        const region = await prisma.region.findUnique({
            where: { id: payload.regionId },
            select: { id: true, countryId: true },
        });
        if (!region) {
            throw new BadRequestError(`Unknown regionId: ${payload.regionId}`);
        }
        if (region.countryId !== payload.countryCode) {
            throw new BadRequestError("Region does not belong to selected country");
        }
    }

    // 4) Logo anfügen
    const base64 = logoBuffer.toString("base64");

    // 5) OrganizationCreateInput zusammenbauen
    const data: Prisma.OrganizationCreateInput = {
        name: payload.name,
        email: payload.email,
        street: payload.street,
        zip: payload.zip,
        organizationState: payload.organizationState,
        city: payload.city,
        website: payload.website ?? "",
        organizationType: payload.organizationType as OrganizationType,
        ...(payload.createdBy ? { createdBy: payload.createdBy } : {}),

        // Relationen:
        country: { connect: { code: payload.countryCode } },
        ...(payload.regionId ? { region: { connect: { id: payload.regionId } } } : {}),

        // Logo:
        logoBase64: base64,
        logoMimeType: mimeType,
        // Optional: Dateiname setzen, falls du ihn brauchst
        // logoFilename: ...
    };

    return data;
}