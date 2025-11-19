import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
    console.log("🔄 Teste die Verbindung zur Datenbank...");

    try {
        await prisma.$connect();
        console.log("✅ Erfolgreich mit der Datenbank verbunden!");
    } catch (error) {
        console.error("❌ Fehler beim Verbinden mit der Datenbank:", error);
        process.exit(1); // Fehlercode zurückgeben
    } finally {
        await prisma.$disconnect();
    }
}

testConnection();