import bcrypt from "bcrypt";
import { prisma } from "../prisma";
import {
    Role,
    SalutationType,
} from "@prisma/client";

async function seedTestUser() {
    const email = "testuser@dilowa.de";
    const passwordPlain = "testuser2025";
    const passwordHash = await bcrypt.hash(passwordPlain, 10);

    await prisma.user
        .upsert({
            where: { email },
            update: {},
            create: {
                salutationType: SalutationType.MR,
                email,
                password: passwordHash,
                firstName: "Test",
                lastName: "User",
                role: Role.USER,
                accountState: "REGISTERED",
                hasAcceptedTerms: true,
                hasAcceptedPrivacyPolicy: true,
            },
        })
        .then(() =>
            console.log(
                `✅ Test User ${email} ist vorhanden (Passwort: "${passwordPlain}").`
            )
        );

    // (D) Aufräumen
    await prisma.$disconnect();
}

seedTestUser().catch(async (err) => {
    console.error("❌ Seeding Test user fehlgeschlagen:", err);
    await prisma.$disconnect();
    process.exit(1);
});