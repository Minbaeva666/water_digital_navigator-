// prisma/seeds/seedAdminUsers.ts
import bcrypt from 'bcrypt';
import { OrganizationState, OrganizationType, Role, SalutationType } from '@prisma/client';
import { prisma } from "../prisma";
import path from "path";
import fs from "fs";

async function createAdminUsers() {
    const orgName = 'Institut für nachhaltige Wassersysteme';
    const COUNTRY_CODE = "DE";
    const REGION_CODE  = "DE-BY"; // Bayern

    const regionBy = await prisma.region.findFirst({
        where: { countryId: COUNTRY_CODE, code: REGION_CODE },
        select: { id: true },
    });
    if (!regionBy) {
        throw new Error(`Region ${REGION_CODE} nicht gefunden. Bitte Countries/Regions seeden.`);
    }

    // 1) Organisation finden oder neu anlegen
    let org = await prisma.organization.findUnique({
        where: { name: orgName },
    });

    if (!org) {
        org = await prisma.organization.create({
            data: {
                organizationState: OrganizationState.FULL,
                name: orgName,
                email: "inwa@hof-university.de",
                street: "Alfons-Goppel-Platz 1",
                zip: "95028",
                city: "Hof",
                organizationType: OrganizationType.RESEARCH_INSTITUTE,
                website: "https://inwa.hof-university.de",
                // Country-Relation (DE) und Region (Bayern)
                country: { connect: { code: COUNTRY_CODE } },
                region:  { connect: { id: regionBy.id } },
            },
        });
        console.log(`✅ Organisation "${orgName}" angelegt (ID=${org.id}).`);
    } else {
        console.log(`ℹ️ Organisation "${orgName}" existiert bereits (ID=${org.id}).`);
    }

    // 2) Logo aus public/assets laden
    const logoFilePath = path.join(process.cwd(), 'public', 'assets', 'logo', 'inwa-logo.jpg');
    let logoBuffer: Buffer;
    try {
        logoBuffer = fs.readFileSync(logoFilePath);
    } catch (e) {
        console.error(`⚠️ Logo-Datei nicht gefunden unter ${logoFilePath}`, e);
        logoBuffer = Buffer.from([]);
    }

    const base64 = logoBuffer.toString("base64");

    // 3) Organisation updaten, um das Logo zu speichern
    await prisma.organization.update({
        where: { id: org.id },
        data: {
            logoBase64: base64,
            logoMimeType: 'image/jpeg',
            logoFilename: 'inwa-logo.jpg',
        },
    });
    console.log(`✅ Logo für Organisation (ID=${org.id}) gesetzt.`);

    // 4) Admin-User definieren
    const adminUsers = [
        {
            email: 'minu@hof-university.de',
            plainPassword: 'dilowa',
            firstName: 'Minu',
            lastName: 'Joseph',
            salutationType: SalutationType.MS,
        },
        {
            email: 'viktoriya.tarasyuk@hof-university.de',
            plainPassword: 'dilowadilowa',
            firstName: 'Viktoriya',
            lastName: 'Tarasyuk',
            salutationType: SalutationType.MS,
        },
    ];

    // 5) Admin-User anlegen und Organisation zuweisen (idempotent)
    for (const admin of adminUsers) {
        const existingUser = await prisma.user.findUnique({
            where: { email: admin.email },
        });

        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(admin.plainPassword, 10);
            await prisma.user.create({
                data: {
                    salutationType: admin.salutationType,
                    email: admin.email,
                    password: hashedPassword,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    role: Role.ADMIN,
                    accountState: 'REGISTERED',
                    hasAcceptedTerms: true,
                    hasAcceptedPrivacyPolicy: true,
                    organization: { connect: { id: org.id } },
                },
            });
            console.log(`✅ Admin-User ${admin.email} wurde erstellt.`);
        } else {
            console.log(`ℹ️ Admin-User ${admin.email} existiert bereits.`);
        }
    }

    console.log("Seeding Admin-User abgeschlossen.");
}

// Optionaler Export (falls du es woanders importieren willst)
export default createAdminUsers;

// ESM-sicherer Runner: macht die Datei als Seed direkt ausführbar
(async () => {
    await createAdminUsers();
})()
    .catch(async (e) => {
        console.error("❌ Seeding fehlgeschlagen:", e);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
