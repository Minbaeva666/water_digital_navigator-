// prisma/seeds/seedModerator.ts
import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import { Role, SalutationType } from "@prisma/client";

async function seedModeratorUser() {
    const email = "paola.acosta.carrascal@hof-university.de";
    const passwordPlain =
        process.env.SEED_MODERATOR_PASSWORD || "dilowadilowadilowa";
    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    // Optional: vorhandene Organisation verbinden (wenn sie existiert)
    const ORG_NAME = "Institut für nachhaltige Wassersysteme";
    const org = await prisma.organization.findUnique({
        where: { name: ORG_NAME },
        select: { id: true },
    });

    await prisma.user
        .upsert({
            where: { email },
            update: {}, // idempotent, nichts ändern wenn schon vorhanden
            create: {
                salutationType: SalutationType.MS,
                email,
                password: passwordHash,
                firstName: "Paola",
                lastName: "Acosta Carrascal",
                role: Role.MODERATOR, // <-- Moderator statt Admin
                accountState: "REGISTERED",
                hasAcceptedTerms: true,
                hasAcceptedPrivacyPolicy: true,
                ...(org && { organization: { connect: { id: org.id } } }),
            },
        })
        .then(() =>
            console.log(
                `✅ Moderator ${email} ist vorhanden (Passwort: "${passwordPlain}")${
                    org ? `, Organisation: ${ORG_NAME}` : ""
                }.`
            )
        );

    await prisma.$disconnect();
}

seedModeratorUser().catch(async (err) => {
    console.error("❌ Seeding Moderator fehlgeschlagen:", err);
    await prisma.$disconnect();
    process.exit(1);
});
