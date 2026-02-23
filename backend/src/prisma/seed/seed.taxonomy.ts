// Auto-generated from Excel snapshot. Static seed (no runtime file I/O).
import { PrismaClient } from "@prisma/client";
import logger from "../../config/loggerConfig";
const prisma = new PrismaClient();

type Node = { name: string; children?: Node[] };
type ParentRef = { id: string; path: string; depth: number; color?: string | null };

const ROOT_COLORS: Record<string, string> = {
    "Anwendungsbereich": "#FF6B6B",          // Rot
    "Aufgabenbereich": "#4ECDC4",            // Türkis
    "Organisationstyp": "#FFD93D",           // Gelb
    "Technische Aufgabenbereiche": "#1A535C",// Dunkelblau
    "Nachhaltigkeitsziele": "#FF9F1C",       // Orange
    "Digitalisierungsthemen": "#6A4C93",     // Violett
    "Zielgruppe / Nutzerkreis": "#FFBF69",   // Hellorange
};


const TAXONOMY: Node[] = [
    {
        "name": "Anwendungsbereich",
        "children": [
            {
                "name": "Abwasserbereich",
                "children": [
                    {
                        "name": "Abwasser"
                    },
                    {
                        "name": "Entwässerung"
                    },
                    {
                        "name": "Kanalinspektion"
                    },
                    {
                        "name": "Kanalnetz"
                    },
                    {
                        "name": "Kläranlage"
                    },
                    {
                        "name": "Klärschlamm"
                    },
                    {
                        "name": "Kleinekläranlage"
                    },
                    {
                        "name": "Regenbecken"
                    }
                ]
            },
                        {
                "name": "Grüne Infrastruktur",
                "children": [
                    {
                        "name": "Versickerungssysteme"
                    }
                ]
            },
            {
                "name": "Oberflächen- und Grundwasser",
                "children": [
                    {
                        "name": "Fließgewässer"
                    },
                    {
                        "name": "Gewässer"
                    },
                    {
                        "name": "Niederschlag"
                    }
                ]
            },
                        {
                "name": "Trinkwasser",
                "children": [
                    {
                        "name": "Trinkwasser 2"
                    }
                ]
            },
        ]
    },
    {
        "name": "Aufgabenbereich",
        "children": [
            {
                "name": "Betrieb & Effizienz",
                "children": [
                    {
                        "name": "Energieeinsparung"
                    }
                ]
            },
            {
                "name": "Management & Verwaltung",
                "children": [
                    {
                        "name": "Assetmanagement"
                    }
                ]
            },
            {
                "name": "Personal & Organisation",
                "children": [
                    {
                        "name": "Fachkräftemangelkompensierung"
                    }
                ]
            },
            {
                "name": "Überwachung & Sicherheit",
                "children": [
                    {
                        "name": "Anomaliedetektion"
                    }
                ]
            },
            {
                "name": "Strategische Themen",
                "children": [
                    {
                        "name": "Smart City"
                    }
                ]
            }
        ]
    },
    {
        "name": "Organisationstyp",
        "children": [
            {
                "name": "Öffentlicher Bereich",
                "children": [
                    {
                        "name": "Kommune"
                    }
                ]
            },
            {
                "name": "Wissenschaft & Forschung",
                "children": [
                    {
                        "name": "Universität"
                    }
                ]
            },
            {
                "name": "Wirtschaft",
                "children": [
                    {
                        "name": "Industrie"
                    }
                ]
            }
        ]
    },
    {
        "name": "Technische Aufgabenbereiche",
        "children": [
            {
                "name": "Abwasser & Regenwasser",
                "children": [
                    {
                        "name": "Abwasserreinigung"
                    }
                ]
            },
            {
                "name": "Trinkwasser 3",
                "children": [
                    {
                        "name": "Trinkwassergewinnung"
                    }
                ]
            },
            {
                "name": "Überwachung & Betrieb",
                "children": [
                    {
                        "name": "Bauwerküberwachung"
                    }
                ]
            },
            {
                "name": "Systeme & Technik",
                "children": [
                    {
                        "name": "Steuerungstechnik"
                    }
                ]
            },
            {
                "name": "Blau-grüne Maßnahmen",
                "children": [
                    {
                        "name": "Retentionsmanagement"
                    }
                ]
            }
        ]
    },
    {
        "name": "Nachhaltigkeitsziele",
        "children": [
            {
                "name": "Gesundheit"
            },
            {
                "name": "Bildung"
            },
            {
                "name": "Sauberes Wasser"
            },
            {
                "name": "Bezahlbare Energie"
            },
            {
                "name": "Menschenwürdige Arbeit"
            },
            {
                "name": "Industrie-Innovation"
            },
            {
                "name": "Nachhaltige Städte & Gemeinden"
            },
            {
                "name": "Nachhaltiger Konsum"
            },
            {
                "name": "Maßnahmen zum Klimaschutz"
            },
            {
                "name": "Partnerschaften zur Erleichterung der Ziele"
            },
            {
                "name": "Resilienz gegenüber Klimawandel"
            },
            {
                "name": "Ressourcenschonung / -effizienz"
            },
            {
                "name": "Biodiversität & Ökosystemleistungen"
            }
        ]
    },
    {
        "name": "Digitalisierungsthemen",
        "children": [
            {
                "name": "Datenerfassung & Sensorik",
                "children": [
                    {
                        "name": "Sensorik"
                    }
                ]
            },
            {
                "name": "Datenanalyse & KI",
                "children": [
                    {
                        "name": "Data Analytics"
                    }
                ]
            },
            {
                "name": "Visualisierung & Interaktion",
                "children": [
                    {
                        "name": "Visualisierungsdashboard"
                    }
                ]
            },
            {
                "name": "Infrastruktur & Systeme",
                "children": [
                    {
                        "name": "Cloudservice"
                    }
                ]
            },
            {
                "name": "Automation & Robotik",
                "children": [
                    {
                        "name": "Automatisierung"
                    }
                ]
            },
            {
                "name": "Low-Cost & Open Source",
                "children": [
                    {
                        "name": "Mikrocontroller-Plattformen (z.B. Arduino, Raspberry Pi)"
                    }
                ]
            }
        ]
    },
    {
        "name": "Zielgruppe / Nutzerkreis",
        "children": [
            {
                "name": "Kommune / Stadtwerke"
            },
            {
                "name": "Betreiber technischer Anlagen"
            },
            {
                "name": "Bürger:innen / Endnutzer"
            },
            {
                "name": "Forschung / Lehre"
            },
            {
                "name": "Planungsbüros"
            },
            {
                "name": "Krisenmanagement / Katastrophenschutz"
            }
        ]
    },
];

function slugify(input: string) {
    return input
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
        .replace(/&/g, "und")
        .replace(/\//g, "-")
        .replace(/[^a-zA-Z0-9\- ]+/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase();
}

async function upsertNode(
    type: string,
    name: string,
    parent: ParentRef | null,
    sort: number,
    color?: string
) {
    const slug = slugify(name);
    const nodePath = parent ? `${parent.path}/${slug}` : `/${slugify(type)}/${slug}`;
    const depth = parent ? parent.depth + 1 : 1;

    // null → undefined normalisieren
    const effectiveColor: string | undefined = color ?? (parent?.color ?? undefined);

    return prisma.taxonomyNode.upsert({
        where: { path: nodePath },
        update: {
            nameDe: name,
            depth,
            sort,
            parentId: parent?.id ?? null,
            ...(effectiveColor ? { color: effectiveColor } : {}),
        },
        create: {
            nameDe: name,
            type,
            slug,
            path: nodePath,
            depth,
            sort,
            parentId: parent?.id ?? null,
            ...(effectiveColor ? { color: effectiveColor } : {}),
            minSelectableNodes: 1,
            maxSelectableNodes: 3,
        },
    });
}

export async function createTaxonomyNodes() {
    for (const facet of TAXONOMY) {
        const TYPE = slugify(facet.name);
        const rootColor = ROOT_COLORS[facet.name] || "#CCCCCC";

        const rootPath = `/${TYPE}`;

        // 2) Root upserten (enthält color), danach Root-Objekt an Kinder weitergeben
        const root = await prisma.taxonomyNode.upsert({
            where: { path: rootPath },
            update: { color: rootColor, nameDe: facet.name },
            create: {
                type: TYPE,
                slug: TYPE,
                nameDe: facet.name,
                path: rootPath,
                depth: 0,
                sort: 0,
                parentId: null,
                color: rootColor,
                minSelectableNodes: 1,
                maxSelectableNodes: 3,
            },
        });

        let level1Sort = 1;
        for (const l1 of (facet.children || [])) {
            // Farbe wird in upsertNode automatisch vom Parent (root.color) geerbt
            const n1 = await upsertNode(TYPE, l1.name, root, level1Sort++);

            let level2Sort = 1;
            for (const l2 of (l1.children || [])) {
                // Erbt automatisch n1.color (also wiederum Root-Farbe, falls n1 keine eigene hat)
                await upsertNode(TYPE, l2.name, n1, level2Sort++);
            }
        }
    }
}

if (require.main === module) {
    createTaxonomyNodes()
    .then(async () => { logger.info("✅ Static taxonomy seeded"); await prisma.$disconnect(); })
    .catch(async (err) => { logger.error("❌ Fehler beim Taxonomy-Seed:", err); await prisma.$disconnect(); process.exit(1); });
}
