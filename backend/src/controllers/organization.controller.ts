import {NextFunction, Request, RequestHandler, Response} from "express";
import {OrganizationState, OrganizationType, Prisma, PrismaClient} from "@prisma/client";
import { BadRequestError } from "../errors/BadRequestError";
import { resizeImageBuffer } from "../utils/image";
import path from "path";
import fs from "fs";
import { checkOrganizationReferences } from "../utils/referenceIntegrityChecker";

const prisma = new PrismaClient();

// ---- Module-level geocoding helper ----
const geocodeWithRetry = async (zipStr: string, countryCode: string, maxRetries: number = 3): Promise<{lat: number, lon: number} | null> => {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("postalcode", zipStr);
    url.searchParams.set("countrycodes", countryCode.toLowerCase());
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "0");

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Add initial delay to avoid aggressive rate limiting
            if (attempt > 0) {
                const delayMs = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s, 16s...
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }

            const controller = new AbortController();
            const timeoutMs = 20000; // 20s timeout
            const timeout = setTimeout(() => {
                controller.abort();
            }, timeoutMs);
            
            const geoRes = await fetch(url.toString(), {
                signal: controller.signal,
                headers: { 
                    "User-Agent": "Mozilla/5.0 (compatible; geocode-service/1.0)",
                    "Accept": "application/json",
                    "Accept-Language": "en-US,en;q=0.9",
                },
            });
            
            clearTimeout(timeout);
            
            if (geoRes.ok) {
                const geoJson: Array<{ lat: string; lon: string }> = await geoRes.json();
                if (geoJson && geoJson.length > 0) {
                    const parsedLat = parseFloat(geoJson[0].lat);
                    const parsedLon = parseFloat(geoJson[0].lon);
                    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLon)) {
                        return { lat: parsedLat, lon: parsedLon };
                    }
                } else {
                    return null;
                }
            } else if (geoRes.status === 403 || geoRes.status === 429) {
                // Continue retrying - backoff already applied
                continue;
            } else {
                return null;
            }
        } catch (fetchErr) {
            if (attempt < maxRetries) {
                continue;
            }
        }
    }
    return null;
};

export const createOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        console.log("createOrganization body:", req.body);
        // ---- Helpers ----
        const NULL_MARKERS = new Set(["", "null", "undefined"]);

        const isEmpty = (v: unknown) =>
            v == null ||
            (typeof v === "string" &&
                (v.trim() === "" || NULL_MARKERS.has(v.trim().toLowerCase())));

        const toDbNullable = (v: unknown): string | null => {
            if (v === undefined || v === null) return null;
            const s = String(v).trim();
            return NULL_MARKERS.has(s.toLowerCase()) ? null : s;
        };

        const toInt = (v: unknown) => {
            const n = Number(v);
            return Number.isFinite(n) ? Math.trunc(n) : NaN;
        };

        const toBool = (v: unknown) => {
            if (typeof v === "boolean") return v;
            const s = String(v ?? "").trim().toLowerCase();
            return s === "true" || s === "1" || s === "yes";
        };

        const toFloat = (v: unknown) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : NaN;
        };

        const REQUIRED_BY_STATE: Record<OrganizationState, ReadonlyArray<string>> = {
            LITE: ["organizationState", "name", "organizationType", "zip", "city", "countryCode"],
            FULL: [
                "organizationState",
                "name",
                "email",
                "street",
                "zip",
                "city",
                "countryCode",
                "organizationType",
                "website",
            ],
        };

        // ---- Body auspacken ----
        let {
            name,
            email,
            street,
            zip,
            city,
            countryCode,
            regionId,
            organizationType,
            organizationState,
            website,
            population,          // string/number
            manualCoords,        // string/boolean
            lat,                 // string/number
            lon,                 // string/number
        } = req.body as {
            name?: string;
            email?: string;
            street?: string;
            zip?: string;
            city?: string;
            countryCode?: string;
            regionId?: string | null;
            organizationType?: string;
            organizationState?: string;
            website?: string;
            population?: number | string;
            manualCoords?: boolean | string;
            lat?: number | string;
            lon?: number | string;
        };

        // DEBUG: Log coordinate inputs
        console.log("🔍 Coordinate Debug - manualCoords:", manualCoords, "type:", typeof manualCoords);
        console.log("🔍 Coordinate Debug - lat:", lat, "type:", typeof lat);
        console.log("🔍 Coordinate Debug - lon:", lon, "type:", typeof lon);
        console.log("🔍 Coordinate Debug - zip:", zip);
        console.log("🔍 Coordinate Debug - countryCode:", countryCode);

        // ---- Enums validieren ----
        const orgTypeStr = String(organizationType ?? "").toUpperCase();
        const isValidOrgType = (Object.values(OrganizationType) as string[]).includes(orgTypeStr);
        if (!isValidOrgType) {
            res.status(400).json({ message: `Ungültiger OrganizationType: ${organizationType}` });
            return;
        }
        const orgType = orgTypeStr as OrganizationType;

        const stateStr = String(organizationState ?? "").toUpperCase();
        const isValidState = (Object.values(OrganizationState) as string[]).includes(stateStr);
        if (!isValidState) {
            res.status(400).json({ message: `Ungültiger OrganizationState: ${organizationState}` });
            return;
        }
        const state = stateStr as OrganizationState;

        // ---- Pflichtfelder je nach State prüfen ----
        const required = REQUIRED_BY_STATE[state];
        const missing = required.filter((k) => isEmpty((req.body as any)[k]));
        if (missing.length) {
            res.status(400).json({ message: `Pflichtfelder fehlen: ${missing.join(", ")}` });
            return;
        }

        // ---- Municipality: population validieren ----
        let populationInt: number | undefined;
        if (orgType === OrganizationType.MUNICIPALITY) {
            populationInt = toInt(population);
            if (!Number.isFinite(populationInt) || populationInt! < 0) {
                res.status(400).json({
                    message: "Einwohnerzahl (population) ist erforderlich und muss ≥ 0 sein.",
                });
                return;
            }
        }

        // ---- Country existiert? ----
        const countryCodeNorm = String(countryCode).toUpperCase();
        const country = await prisma.country.findUnique({
            where: { code: countryCodeNorm },
            select: { code: true },
        });
        if (!country) {
            res.status(400).json({ message: `Unbekannter Ländercode: ${countryCode}` });
            return;
        }

        // ---- Region gehört zum Land? ----
        if (typeof regionId === "string" && NULL_MARKERS.has(regionId.toLowerCase())) {
            regionId = null;
        }
        if (regionId) {
            const region = await prisma.region.findUnique({
                where: { id: String(regionId) },
                select: { id: true, countryId: true },
            });
            if (!region || region.countryId !== country.code) {
                res.status(400).json({ message: "Region passt nicht zum ausgewählten Land." });
                return;
            }
        }

        // ---- Logo-Pflicht bei FULL ----
        const file = req.file; // z. B. multer.single("logoBase64")
        if (state === OrganizationState.FULL && !file) {
            res.status(400).json({ message: "Logo file ist erforderlich (bei FULL)" });
            return;
        }

        // ---- Helper function for geocoding with retry ----
        // This is now defined at module level for use in both create and update endpoints

        // ---- Koordinaten-Strategie ----
        const manual = toBool(manualCoords);
        let latitude: number | undefined;
        let longitude: number | undefined;

        console.log("🔍 Coordinates Strategy - manual:", manual);

        if (manual) {
            // Manuelle Koordinaten sind Pflicht & werden validiert
            const latNum = toFloat(lat);
            const lonNum = toFloat(lon);
            const latOk = Number.isFinite(latNum) && latNum >= -90 && latNum <= 90;
            const lonOk = Number.isFinite(lonNum) && lonNum >= -180 && lonNum <= 180;
            if (!latOk || !lonOk) {
                res.status(400).json({ message: "Ungültige Koordinaten: lat ∈ [-90,90], lon ∈ [-180,180]" });
                return;
            }
            latitude = latNum;
            longitude = lonNum;
        } else {
            // Geokodierung (best effort)
            console.log("🔍 Geocoding: Starting auto-geocoding...");
            try {
                const zipStr = String(zip ?? "").trim();
                console.log("🔍 Geocoding: zipStr=", zipStr, "country?.code=", country?.code);
                if (zipStr && country?.code) {
                    const result = await geocodeWithRetry(zipStr, country.code);
                    if (result) {
                        latitude = result.lat;
                        longitude = result.lon;
                    }
                } else {
                    console.log("❌ Geocoding: SKIPPED - no zip or country code");
                }
            } catch (err) {
                console.error("❌ Geocoding error:", err instanceof Error ? err.message : err);
            }
        }

        // ---- Logo verarbeiten (wenn vorhanden) ----
        let base64: string | undefined;
        let logoMime: string | undefined;
        let logoName: string | undefined;
        if (file) {
            let resized: Buffer;
            try {
                resized = await resizeImageBuffer(file.buffer, 500, 500, file.mimetype);
            } catch {
                throw new BadRequestError("Bild konnte nicht verarbeitet werden");
            }
            base64 = resized.toString("base64");
            logoMime = file.mimetype;
            logoName = file.originalname;
        }

        // ---- Normalisierte Strings/Nulls ----
        const nameNorm = String(name).trim(); // required
        const emailNorm = toDbNullable(email);
        const streetNorm = toDbNullable(street);
        const websiteNorm = toDbNullable(website);
        const zipNorm = String(zip).trim();   // required
        const cityNorm = String(city).trim(); // required

        // ---- Create-Input ----
        const data: Prisma.OrganizationCreateInput = {
            name: nameNorm,
            organizationState: state,
            organizationType: orgType,

            email: emailNorm,     // null => DB NULL
            street: streetNorm,   // null => DB NULL
            website: websiteNorm, // null => DB NULL

            zip: zipNorm,
            city: cityNorm,

            manualCoords: manual,

            ...(base64
                ? { logoBase64: base64, logoMimeType: logoMime!, logoFilename: logoName! }
                : {}),

            // Relationen
            country: { connect: { code: country.code } },
            ...(regionId ? { region: { connect: { id: String(regionId) } } } : {}),

            // MunicipalityProfile nur für MUNICIPALITY
            ...(orgType === OrganizationType.MUNICIPALITY && typeof populationInt === "number"
                ? { municipalityProfile: { create: { population: populationInt } } }
                : {}),

            // Geoposition (nur wenn vorhanden)
            ...(typeof latitude === "number" && typeof longitude === "number"
                ? { lat: latitude, lon: longitude }
                : {}),
        };

        console.log("🔍 Creating organization with data:", {
            name: data.name,
            zip: data.zip,
            city: data.city,
            manualCoords: data.manualCoords,
            lat: data.lat,
            lon: data.lon,
        });

        const organization = await prisma.organization.create({ data });
        console.log("✅ Organization created:", {
            id: organization.id,
            lat: organization.lat,
            lon: organization.lon,
            manualCoords: organization.manualCoords,
        });
        res.status(201).json(organization);
    } catch (error: any) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const rawTarget = (error.meta as any)?.target;
            const field =
                Array.isArray(rawTarget)
                    ? rawTarget[0]
                    : typeof rawTarget === "string"
                        ? rawTarget
                        : null;

            if (field === "Organization_name_key") {
                res.status(400).json({ message: "Fehler: Organisationsname bereits vergeben" });
                return;
            }
            if (field === "Organization_email_key") {
                res.status(400).json({ message: "Fehler: E-Mail-Adresse bereits vergeben" });
                return;
            }
            const pretty = field
                ? field
                    .replace(/_key$/, "")
                    .split("_")
                    .map((s: string) => s[0].toUpperCase() + s.slice(1))
                    .join(" ")
                : "Feld";
            res.status(400).json({ message: `Fehler: ${pretty} bereits vergeben` });
            return;
        }

        console.error("Fehler beim Erstellen der Organisation:", error);
        next(error);
    }
};

export const updateOrganization = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        // ---- Helpers ----
        const NULL_MARKERS = new Set(["", "null", "undefined"]);

        const isEmpty = (v: unknown) =>
            v == null ||
            (typeof v === "string" &&
                (v.trim() === "" || NULL_MARKERS.has(v.trim().toLowerCase())));

        // Für String-Felder: undefined/null/""/"null"/"undefined" => null, sonst getrimmt
        const toNullable = (v: unknown): string | null => {
            if (v === undefined || v === null) return null;
            const s = String(v).trim();
            return NULL_MARKERS.has(s.toLowerCase()) ? null : s;
        };

        const toInt = (v: unknown) => {
            const n = Number(v);
            return Number.isFinite(n) ? Math.trunc(n) : NaN;
        };

        const toBool = (v: unknown) => {
            if (typeof v === "boolean") return v;
            const s = String(v ?? "").trim().toLowerCase();
            return s === "true" || s === "1" || s === "yes";
        };

        const toFloat = (v: unknown) => {
            const n = Number(v);
            return Number.isFinite(n) ? n : NaN;
        };

        const REQUIRED_BY_STATE: Record<OrganizationState, ReadonlyArray<string>> = {
            LITE: ["organizationState", "name", "organizationType", "zip", "city", "countryCode"],
            FULL: ["organizationState", "name", "email", "street", "zip", "city", "countryCode", "organizationType", "website"],
        };

        // ---- Bestehende Orga laden ----
        const existing = await prisma.organization.findUnique({
            where: { id },
            select: {
                id: true,
                organizationType: true,
                organizationState: true,
                logoBase64: true,
                logoMimeType: true,
                logoFilename: true,
                countryId: true,
                regionId: true,
                manualCoords: true,
                lat: true,
                lon: true,
                municipalityProfile: { select: { population: true } },
            },
        });
        if (!existing) {
            res.status(404).json({ message: "Organisation nicht gefunden" });
            return;
        }

        // ---- Body normalisieren ----
        let {
            name,
            email,
            street,
            zip,
            city,
            countryCode,
            regionId,
            organizationType,
            organizationState,
            website,
            population,                 // optional; string/number
            municipalityProfileAction,  // optional 'UPSERT' | 'DELETE'
            removeLogo,                 // optional 'true'
            manualCoords,               // optional boolean|string
            lat,                        // optional number|string
            lon,                        // optional number|string
        } = req.body as {
            name?: string;
            email?: string;
            street?: string;
            zip?: string;
            city?: string;
            countryCode?: string;
            regionId?: string | null;
            organizationType?: string;
            organizationState?: string;
            website?: string;
            population?: number | string;
            municipalityProfileAction?: "UPSERT" | "DELETE";
            removeLogo?: "true" | "false";
            manualCoords?: boolean | string;
            lat?: number | string;
            lon?: number | string;
        };

        // Marker "null"/""/undefined bei regionId -> echtes null (Disconnect)
        if (typeof regionId === "string" && NULL_MARKERS.has(regionId.toLowerCase())) {
            regionId = null;
        }

        // ---- Enums bestimmen (Fallback auf bestehenden Zustand) ----
        const typeStr = String(organizationType ?? existing.organizationType ?? "").toUpperCase();
        const stateStr = String(organizationState ?? existing.organizationState ?? "").toUpperCase();

        const isValidType = (Object.values(OrganizationType) as string[]).includes(typeStr);
        const isValidState = (Object.values(OrganizationState) as string[]).includes(stateStr);
        if (!isValidType) {
            res.status(400).json({ message: `Ungültiger OrganizationType: ${organizationType}` });
            return;
        }
        if (!isValidState) {
            res.status(400).json({ message: `Ungültiger OrganizationState: ${organizationState}` });
            return;
        }
        const orgType = typeStr as OrganizationType;
        const state   = stateStr as OrganizationState;

        // ---- Pflichtfelder je nach (finalem) State prüfen ----
        const required = REQUIRED_BY_STATE[state];
        const missing = required.filter((k) => isEmpty((req.body as any)[k]));
        if (missing.length) {
            res.status(400).json({ message: `Pflichtfelder fehlen: ${missing.join(", ")}` });
            return;
        }

        // ---- Country prüfen (verwende übergebenen Code, sonst bestehenden) ----
        const effectiveCountry = String(countryCode ?? existing.countryId).toUpperCase();
        const country = await prisma.country.findUnique({
            where: { code: effectiveCountry },
            select: { code: true },
        });
        if (!country) {
            res.status(400).json({ message: `Unbekannter Ländercode: ${countryCode ?? existing.countryId}` });
            return;
        }

        // ---- Region prüfen/zuordnen ----
        if (regionId) {
            const region = await prisma.region.findUnique({
                where: { id: String(regionId) },
                select: { id: true, countryId: true },
            });
            if (!region || region.countryId !== country.code) {
                res.status(400).json({ message: "Region passt nicht zum ausgewählten Land." });
                return;
            }
        }

        // ---- Logo (Update-Logik) ----
        const file = req.file as Express.Multer.File | undefined; // z.B. multer.single("logoBase64")
        let logoPatch: Partial<Prisma.OrganizationUpdateInput> = {};
        if (file) {
            try {
                const resized = await resizeImageBuffer(file.buffer, 500, 500, file.mimetype);
                const base64 = resized.toString("base64");
                logoPatch = {
                    logoBase64: base64,
                    logoMimeType: file.mimetype,
                    logoFilename: file.originalname,
                };
            } catch {
                res.status(400).json({ message: "Bild konnte nicht verarbeitet werden" });
                return;
            }
        } else if (removeLogo === "true") {
            logoPatch = {
                logoBase64: null,
                logoMimeType: null,
                logoFilename: null,
            };
        }

        // Bei FULL ohne existierendes/neues Logo und nicht explizit entfernen -> Logo erforderlich
        if (
            state === OrganizationState.FULL &&
            !file &&
            removeLogo !== "true" &&
            !existing.logoBase64
        ) {
            res.status(400).json({ message: "Logo file ist erforderlich (bei FULL)" });
            return;
        }

        // ---- MunicipalityProfile-Logik (FIX: delete nur wenn vorhanden) ----
        const wantsDeleteMp =
            municipalityProfileAction === "DELETE" || orgType !== OrganizationType.MUNICIPALITY;
        const wantsUpsertMp =
            municipalityProfileAction === "UPSERT" || orgType === OrganizationType.MUNICIPALITY;

        let mpPatch:
            | Prisma.MunicipalityProfileUpdateOneWithoutOrganizationNestedInput
            | undefined;

        const hasMp = !!existing.municipalityProfile;

        if (wantsDeleteMp) {
            // Nur löschen, wenn es auch eins gibt – sonst No-Op, um P2025 zu vermeiden
            mpPatch = hasMp ? { delete: true } : undefined;
        } else if (wantsUpsertMp) {
            const popInt = toInt(population ?? existing.municipalityProfile?.population);
            if (!Number.isFinite(popInt) || (popInt as number) < 0) {
                res.status(400).json({ message: "Einwohnerzahl (population) ist erforderlich und muss ≥ 0 sein." });
                return;
            }
            mpPatch = {
                upsert: {
                    create: { population: popInt as number },
                    update: { population: popInt as number },
                },
            };
        }

        // ---- Koordinaten-Strategie (manuell vs. auto) ----
        const manual = manualCoords !== undefined
            ? toBool(manualCoords)
            : !!existing.manualCoords;

        let latLonPatch: Partial<Prisma.OrganizationUpdateInput> = { manualCoords: manual };

        if (manual) {
            // Manuelle Koordinaten sind Pflicht & werden validiert
            const latNum = toFloat(lat);
            const lonNum = toFloat(lon);
            const latOk = Number.isFinite(latNum) && latNum >= -90 && latNum <= 90;
            const lonOk = Number.isFinite(lonNum) && lonNum >= -180 && lonNum <= 180;
            if (!latOk || !lonOk) {
                res.status(400).json({ message: "Ungültige Koordinaten: lat ∈ [-90,90], lon ∈ [-180,180]" });
                return;
            }
            latLonPatch = {
                ...latLonPatch,
                lat: latNum,
                lon: lonNum,
            };
        } else {
            // Auto: optionales Geocoding – nur wenn PLZ/Land im Request
            const zipForGeo = String(zip ?? "").trim();
            try {
                if (zipForGeo && effectiveCountry) {
                    const result = await geocodeWithRetry(zipForGeo, effectiveCountry);
                    if (result) {
                        latLonPatch = {
                            ...latLonPatch,
                            lat: result.lat,
                            lon: result.lon,
                        };
                    }
                }
            } catch (err) {
                console.error("❌ Geocoding error:", err instanceof Error ? err.message : err);
            }
            // Optional: Beim Umschalten auf "auto" lat/lon löschen, wenn kein Treffer:
            // latLonPatch = { ...latLonPatch, lat: null, lon: null };
        }

        // ---- Normalisierte String/Null-Felder ----
        const nameNorm    = name?.trim();      // required
        const emailNorm   = toNullable(email); // null => DB NULL setzen
        const streetNorm  = toNullable(street);
        const websiteNorm = toNullable(website);
        const zipNorm     = zip?.trim();       // required
        const cityNorm    = city?.trim();      // required

        // ---- Update-Objekt bauen ----
        const dataToUpdate: Prisma.OrganizationUpdateInput = {
            name: nameNorm,
            email: emailNorm,
            street: streetNorm,
            website: websiteNorm,
            zip: zipNorm,
            city: cityNorm,

            organizationType: orgType,
            organizationState: state,

            // Relationen:
            country: { connect: { code: country.code } },
            ...(regionId === null
                ? { region: { disconnect: true } }
                : regionId !== undefined
                    ? { region: { connect: { id: String(regionId) } } }
                    : {}),

            // MunicipalityProfile Patch (nur setzen, wenn definiert)
            ...(mpPatch ? { municipalityProfile: mpPatch } : {}),

            // Koordinaten/Manual-Flag
            ...latLonPatch,

            // Logo Patch
            ...logoPatch,
        };

        const updated = await prisma.organization.update({
            where: { id },
            data: dataToUpdate,
            include: {
                municipalityProfile: true,
            },
        });

        res.json(updated);
    } catch (error: any) {
        console.error("Fehler beim Aktualisieren der Organisation:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            const rawTarget = (error.meta as any)?.target;
            const field = Array.isArray(rawTarget)
                ? rawTarget[0]
                : typeof rawTarget === "string"
                    ? rawTarget
                    : null;

            if (field === "Organization_name_key") {
                res.status(400).json({ message: "Fehler: Organisationsname bereits vergeben" });
                return;
            }
            if (field === "Organization_email_key") {
                res.status(400).json({ message: "Fehler: E-Mail-Adresse bereits vergeben" });
                return;
            }
            const pretty = field
                ? field.replace(/_key$/, "")
                    .split("_")
                    .map((s: string) => s[0].toUpperCase() + s.slice(1))
                    .join(" ")
                : "Feld";
            res.status(400).json({ message: `Fehler: ${pretty} bereits vergeben` });
            return;
        }

        next(error);
    }
};

export const getOrganization = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const organization = await prisma.organization.findUnique({
            where: { id },
            include: {
                createdBy: true,
                users: true,
                digitalSolutions: true,
                projectPartners: true,
                solutionUsers: true,
                municipalityProfile: { select: { population: true } },
            },
        });

        if (!organization) {
            res.status(404).json({ error: "Organisation nicht gefunden" });
            return
        }
        res.json(organization);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Fehler beim Abrufen der Organisation" });
    }
};



export const deleteOrganization: RequestHandler = async (req, res, next) => {
    const { id } = req.params as { id?: string };

    if (!id) {
        res.status(400).json({ error: "orgId fehlt." });
        return;
    }

    try {
        // 1) Check if organization exists
        const org = await prisma.organization.findUnique({
            where: { id },
            select: { id: true, name: true },
        });

        if (!org) {
            res.status(404).json({ error: "Organisation nicht gefunden." });
            return;
        }

        // 2) CHECK REFERENCES BEFORE DELETION
        const refCheck = await checkOrganizationReferences(id);
        
        if (refCheck.hasReferences) {
            res.status(409).json({
                error: "Löschen nicht möglich, diese Organisation ist bereits in Gebrauch.",
                details: {
                    organizationId: id,
                    organizationName: org.name,
                    references: refCheck.references,
                    message: refCheck.message,
                },
                suggestion: 
                    refCheck.references.users > 0
                        ? `Bitte entfernen Sie zuerst alle ${refCheck.references.users} Benutzer aus dieser Organisation.`
                        : `Bitte ordnen Sie alle ${refCheck.references.solutions} digitalen Lösungen neu an oder löschen Sie diese zuerst.`,
            });
            return;
        }

        // 3) SAFE TO DELETE - No references found
        // Clean up files and delete
        await prisma.$transaction(async (tx) => {
            // Find any orphaned solutions (shouldn't exist if references were checked)
            const solutions = await tx.digitalSolution.findMany({
                where: { organizationId: id },
                select: { id: true },
            });

            // Clean up upload directories
            for (const { id: solutionId } of solutions) {
                const uploadDir = path.join(
                    process.cwd(),
                    "public",
                    "uploads",
                    "digitalSolutions",
                    solutionId
                );
                if (fs.existsSync(uploadDir)) {
                    try {
                        fs.rmSync(uploadDir, { recursive: true, force: true });
                    } catch (err) {
                        console.warn(`Konnte Ordner ${uploadDir} nicht löschen:`, err);
                    }
                }
                
                await tx.image.deleteMany({ where: { digitalSolutionId: solutionId } });
                await tx.digitalSolution.delete({ where: { id: solutionId } });
            }

            // Delete municipality profile if exists
            await tx.municipalityProfile.deleteMany({ where: { organizationId: id } });

            // Delete the organization
            await tx.organization.delete({ where: { id } });
        });

        res.status(200).json({
            success: true,
            message: `Organisation "${org.name}" erfolgreich gelöscht.`,
            deletedOrganization: {
                id,
                name: org.name,
            }
        });
    } catch (error) {
        console.error(`Fehler beim Löschen der Organisation ${id}:`, error);
        next(error);
    }
};


export const getOrganizations = async (req: Request, res: Response) => {
    try {
        const organizations = await prisma.organization.findMany({
            include: {
                users: { select: { id: true } },
                digitalSolutions: { select: { id: true } },
                projectPartners:  { select: { id: true } },
                solutionUsers:    { select: { id: true } },
            },
        });

        if (!organizations) {
            res.status(404).json({ error: "Organisationen nicht gefunden" });
            return
        }

        res.json(organizations);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Organisationen" });
    }
};

export const getOrganizationsMinimalWithoutPresenter = async (req: Request, res: Response) => {
    try {
        const qPresenterId = typeof req.query.presentedByUserId === "string" ? req.query.presentedByUserId : undefined;

        let excludeOrgId: string | null = null;

        if (qPresenterId) {
            const presenter = await prisma.user.findUnique({
                where: {id: qPresenterId},
                select: {organizationId: true},
            });
            excludeOrgId = presenter?.organizationId ?? null;
        }

        const organizations = await prisma.organization.findMany({
            where: excludeOrgId ? { id: { not: excludeOrgId } } : undefined,
            select: {
                id: true, name: true, city: true, street: true, country: true,
            },
            orderBy: { name: "asc" },
        });

        res.status(200).json(organizations);
    } catch (error) {
        console.error("Fehler beim Abrufen der Organisationen (minimal):", error);
        res.status(500).json({ error: "Fehler beim Abrufen der Organisationen" });
    }
};

export const getOrganizationsBase = async (req: Request, res: Response) => {
    try {
        const organizations = await prisma.organization.findMany();

        if (!organizations) {
            res.status(404).json({ error: "Organisationen nicht gefunden" });
            return
        }

        res.json(organizations);
    } catch (error) {
        res.status(500).json({ error: "Fehler beim Abrufen der Organisationen" });
    }
}

export const getOrganizationsForRegistration = async (req: Request, res: Response) => {
  try {
    const organizations = await prisma.organization.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        website: true,
        street: true,
        zip: true,
        city: true,
        country: true,         
        regionId: true,      
        organizationType: true,
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json(organizations);
  } catch (error) {
    console.error("Fehler beim Abrufen der Organisationen (for registration):", error);
    res.status(500).json({ error: "Fehler beim Abrufen der Organisationen" });
  }
};
;