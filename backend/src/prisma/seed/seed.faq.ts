// prisma/seeds/seedFaq.ts
import {prisma} from "../prisma";

type SeedItem = { header: string; content: string };

const ITEMS: SeedItem[] = [
    {
        header: "Wie sind die Besonderheiten des Portals Digital.Lotse.Wasser?",
        content: `- Das Portal ist kostenlos.
- Das Portal ermöglicht es, reale Anwendungsbeispiele aus verschiedenen Kategorien intelligenter Digitallösungen zu finden.
- Es bietet Unternehmen, Betrieben und Kommunen praktische Informationen und Kontakte für die erfolgreiche Umsetzung moderner Projekte im Wassersektor für mehr Nachhaltigkeit durch Digitalisierung.
- Das Portal ist offen, die Informationen sind für alle zugänglich.
- Das Portal gibt nur die Informationen wieder, die vom Eigentümer der Inhalte freigegeben wurden.`,
    },
    {
        header: "Wie ist der Digital.Lotse.Wasser entstanden?",
        content: `Mit der vom BMBF geförderten Metastudie WaterExe4.0 aus dem Jahr 2020/21 ist für den deutschsprachigen Raum erstmals eine umfassende und wertvolle Datenbasis zum Stand der Digitalisierung im Wassersektor entstanden. Neben einem fundierten Überblick über die Anwendungsbereiche, die Anwendungsbreite und -tiefe sowie die eingesetzten Technologien, lieferten die durchgeführten Befragungen und Interviews wertvolle Hinweise auf Erfolgsfaktoren und mögliche Hindernisse bei der Umsetzung von Digitalisierungsprojekten.
Ausgehend von dem Wunsch potenzieller Nutzer nach Hilfestellung und einem Leitfaden für die Auswahl- und Umsetzungsphase digitaler Lösungen, wurde deutlich, dass eine solche Übersicht über bestehende Lösungen und Best-Practice-Beispiele zukünftigen Projekten diese gewünschte Hilfestellung geben kann. Während der Studie wurde festgestellt, dass die Datenlage in nahezu exponentieller Weise wächst. Die individuelle Internetsuche nach neuen digitalen Lösungen über Suchmaschinen ist nicht effizient genug. Das Portal bietet deshalb den aktuellen Stand an Entwicklungen von Digitalisierungslösungen im Wassersektor und erfasst diese systematisch. Des Weiteren fassen regelmäßige Berichte diesen aktuellen Stand für potenzielle Nutzer zusammen und bieten zusammen mit dem thematisch interaktiven Portal die beste Starthilfe für eine Anwendungsrecherche.`,
    },
    {
        header: "Welche Informationen sind im Portal Digital.Lotse.Wasser enthalten?",
        content: `Der Digital.Lotse.Wasser bietet als interaktives Portal eine systematische Zusammenstellung von Digitalisierungslösungen im Wassersektor. Um das Portal immer auf dem aktuellen Stand zu halten, wird stetig nach neuen digitalen Lösungen (Produkt, Projekt, etc.) recherchiert. Gerne möchten wir Sie dazu einladen, Ihre Digitalisierungslösung in das Portal Digital.Lotse.Wasser einzupflegen. Dies bietet Ihnen folgende Vorteile:

- Weitere und kostenfreie Möglichkeit, Ihr Produkt zu bewerben
- Aufbau von Bedarfsgemeinschafts- und Versorgungsbeziehungen
- Wissens- und Kapazitätsaufbau für interessierte Kreise
- Transfer von Wissen und Erfahrung zwischen Wasserversorgungsunternehmen
- Suche nach und Einbeziehung von Partnern in gemeinsame (zukünftige) Projekte`,
    },
    {
        header: "An wen wendet sich der Digital.Lotse.Wasser?",
        content: `Der Digital.Lotse.Wasser wendet sich an alle Unternehmen, Kommunen, Wissenschaftler und Entwickler, die bereits digitale Lösungen bzw. Projekte umgesetzt haben.`,
    },
    {
        header: "Was kann ich tun, wenn ich eine digitale Lösung nicht finde?",
        content: `Falls Sie eine digitale Lösung kennen, diese aber im Portal Digital.Lotse.Wasser vermissen, können Sie uns dies gerne über die Schaltfläche „Kontakt“ mitteilen. Ein Administrator des Portals wird mit Ihnen Kontakt aufnehmen, um das Projekt kennenzulernen und ggf. in das Portal mit aufzunehmen.`,
    },
    {
        header:
            "Wie kann ich mich als Unternehmen, Kommune oder Wissenschaftler für die Weiterentwicklung des Portals einbringen?",
        content: `Wenn Sie aus einer Kommune kommen, die bereits ein digitales Projekt umgesetzt hat, oder wenn Sie an der Entwicklung oder Förderung einer digitalen Lösung beteiligt sind, oder wenn Ihr Forschungsinstitut oder Ihre Universität an einem digitalen Wasserlösungsprojekt beteiligt ist, das in einer Kommune in Deutschland eingesetzt wird, würden wir uns freuen, wenn Sie Ihr Wissen aus diesen Projekten und die verwendete Technologie mit anderen Kommunen teilen. Nach der Registrierung beim Portal können Sie dann eine Beschreibung Ihrer digitalen Lösung eingeben. Sie können uns bei Fragen jederzeit auch über die Schaltfläche „Kontakt“ ansprechen. Da wir als Plattform und Gemeinschaft zusammenwachsen wollen, würden wir uns freuen, wenn Sie sich als Experte (Ansprechpartner) für Fragen zu Ihrem Projekt zur Verfügung stellen und damit andere Kommunen unterstützen würden.`,
    },
    {
        header:
            "Ich habe eine Beschreibung der digitalen Lösung hinzugefügt. Warum sehe ich keinen digitalen Atlas?",
        content: `Ihre Beschreibung wurde in die Datenbank aufgenommen. Nach der Freigabe Ihres Eintrags durch den Administrator wird die Beschreibung im Atlas erscheinen. Bei möglichen Rückfragen wird sich der Administrator über den von Ihnen angegebenen Kontakt mit Ihnen in Verbindung setzen.`,
    },
    {
        header:
            "Wie kann ich eine digitale Lösung in das Portal Digital.Lotse.Wasser einpflegen?",
        content: `Auf der Startseite des Portals Digital.Lotse.Wasser finden Sie eine Schaltfläche für den Eintrag zusätzlicher Projekte. Bitte beachten Sie, dass in das Portal nur digitale Lösungen aufgenommen werden, die in einer Kommune in der deutschsprachigen Region konkret eingesetzt werden oder werden sollen.

Ab 01.05.2023 haben wir zusätzliche Leistungen hinzugefügt. Jetzt können auch nicht registrierte Personen Informationen an das Portal bringen.

Um die Beschreibung Ihrer digitalen Lösung einzustellen, können Sie ein paar einfache Schritte befolgen:

1. Die Datenschutzerklärung und die Nutzungsbedingungen beachten.
2. Den Steckbrief herunterladen (bitte nicht in der Cloud ausfüllen) und die erforderlichen Informationen lokal in die Felder eintragen.
3. Eine unterschriebene Version des Steckbriefs (eine eingescannte Kopie der unterschriebenen Seite ist möglich) per E-Mail oder per Post an uns senden.
4. Das Firmenlogo, Fotos und Bilder, die in der Beschreibung Ihrer digitalen Lösung enthalten sein sollen, beifügen.

Wir bieten auch Beratung und Unterstützung beim Ausfüllen des Steckbriefs an. Wir können eine erste Version vorbereiten, den Steckbrief ausfüllen und ihn Ihnen dann zur Prüfung und Unterzeichnung zusenden. Falls diese Option für Sie am besten geeignet ist, bitten wir Sie ebenfalls, sich mit uns in Verbindung zu setzen.`,
    },
    {
        header: "Wer kann eine digitale Lösung einpflegen?",
        content: `Registrierte Teilnehmer, die mit der digitalen Lösung in Verbindung stehen, können die digitale Lösung in das Portal einstellen. Der registrierte Teilnehmer ist für die Administratoren des Portals auch automatisch Ansprechpartner. Weitere Informationen dazu siehe „Welche Informationen müssen in der Beschreibung der digitalen Lösung enthalten sein?».`,
    },
    {
        header:
            "Wie lange wird die Beschreibung einer digitalen Lösung oder eines Projekts in der Datenbank gespeichert?",
        content: `Die digitale Lösung bleibt im Portal gespeichert, solange die Kontaktperson nicht die Löschung des Datensatzes veranlasst. Die Administratoren behalten sich außerdem das Recht vor, Beschreibungen digitaler Lösungen zu löschen, wenn die in der Beschreibung angegebenen Online-Links nicht korrekt sind. Ihre Aktualität wird alle sechs Monate überprüft.`,
    },
    {
        header:
            "Wie kann ich meine Kontaktinformationen aus der Datenbank entfernen?",
        content: `Die E-Mail, die Sie zur Aktivierung Ihrer Registrierung erhalten haben, enthält auch die Option „Registrierung ablehnen“. Falls diese E-Mail für Sie nicht mehr verfügbar ist, lesen Sie bitte den Punkt „An wen kann ich mich mit weiteren Fragen wenden? Wie kann ich Fehler melden?“.`,
    },
    {
        header:
            "An wen kann ich mich mit weiteren Fragen wenden? Wie kann ich Fehler melden?",
        content: `Falls Sie weitere Fragen haben oder einen Fehler in unserem Portal entdeckt haben, nehmen Sie bitte Kontakt zu den Administratoren des Portals per E-Mail an diginax.portal(at)hof-university.de auf oder verwenden Sie bitte die Schaltfläche „Kontakt“. Bitte schildern Sie Ihr Anliegen bereits in Ihrer E-Mail möglichst genau und geben Sie auch Ihre Kontaktdaten an.`,
    },
];

export async function seedFaq() {
    await prisma.$transaction(async (tx) => {
        // 1) Existiert schon ein (globales) FAQ?
        const existing = await tx.faq.findFirst({select: {id: true}});
        const faqId = existing ? existing.id : (await tx.faq.create({data: {}})).id;

        // 2) Items hard-replace
        await tx.faqItem.deleteMany({where: {faqId}});

        await Promise.all(
            ITEMS.map((it, idx) =>
                tx.faqItem.create({
                    data: {
                        faqId,
                        header: it.header,
                        content: it.content,
                        sort: idx,
                    },
                })
            )
        );
    });

    console.log(`✅ FAQ seeded (${ITEMS.length} Items)`);
}

// ESM-sicherer Runner
(async () => {
    await seedFaq();
})()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
