import { prisma } from "../prisma";
import logger from "../../config/loggerConfig";

type CountrySeed = { code: string; nameDe: string; nameEn?: string };
type RegionSeed  = { countryId: string; code: string; nameDe: string; nameEn?: string };

// ------------------------------------
// Länder (ISO 3166-1 alpha-2)
// ------------------------------------
const COUNTRIES: CountrySeed[] = [
    { code: "DE", nameDe: "Deutschland",  nameEn: "Germany" },
    { code: "AT", nameDe: "Österreich",   nameEn: "Austria" },
    { code: "CH", nameDe: "Schweiz",      nameEn: "Switzerland" },
    { code: "DK", nameDe: "Dänemark",     nameEn: "Denmark" },
    { code: "PL", nameDe: "Polen",        nameEn: "Poland" },
    { code: "CZ", nameDe: "Tschechien",   nameEn: "Czech Republic" },
    { code: "FR", nameDe: "Frankreich",   nameEn: "France" },
    { code: "LU", nameDe: "Luxemburg",    nameEn: "Luxembourg" },
    { code: "BE", nameDe: "Belgien",      nameEn: "Belgium" },
    { code: "NL", nameDe: "Niederlande",  nameEn: "Netherlands" },
];

// ------------------------------------
// Regionen (ISO 3166-2)
// nameDe = gebräuchlicher deutscher Name (oder Eigenname, wo sinnvoll)
// nameEn = international gebräuchlicher englischer Name
// ------------------------------------
const REGIONS: RegionSeed[] = [
    // ---------- Deutschland (16 Bundesländer)
    { countryId: "DE", code: "DE-BW", nameDe: "Baden-Württemberg",         nameEn: "Baden-Württemberg" },
    { countryId: "DE", code: "DE-BY", nameDe: "Bayern",                    nameEn: "Bavaria" },
    { countryId: "DE", code: "DE-BE", nameDe: "Berlin",                    nameEn: "Berlin" },
    { countryId: "DE", code: "DE-BB", nameDe: "Brandenburg",               nameEn: "Brandenburg" },
    { countryId: "DE", code: "DE-HB", nameDe: "Bremen",                    nameEn: "Bremen" },
    { countryId: "DE", code: "DE-HH", nameDe: "Hamburg",                   nameEn: "Hamburg" },
    { countryId: "DE", code: "DE-HE", nameDe: "Hessen",                    nameEn: "Hesse" },
    { countryId: "DE", code: "DE-MV", nameDe: "Mecklenburg-Vorpommern",    nameEn: "Mecklenburg-Western Pomerania" },
    { countryId: "DE", code: "DE-NI", nameDe: "Niedersachsen",             nameEn: "Lower Saxony" },
    { countryId: "DE", code: "DE-NW", nameDe: "Nordrhein-Westfalen",       nameEn: "North Rhine-Westphalia" },
    { countryId: "DE", code: "DE-RP", nameDe: "Rheinland-Pfalz",           nameEn: "Rhineland-Palatinate" },
    { countryId: "DE", code: "DE-SL", nameDe: "Saarland",                  nameEn: "Saarland" },
    { countryId: "DE", code: "DE-SN", nameDe: "Sachsen",                   nameEn: "Saxony" },
    { countryId: "DE", code: "DE-ST", nameDe: "Sachsen-Anhalt",            nameEn: "Saxony-Anhalt" },
    { countryId: "DE", code: "DE-SH", nameDe: "Schleswig-Holstein",        nameEn: "Schleswig-Holstein" },
    { countryId: "DE", code: "DE-TH", nameDe: "Thüringen",                 nameEn: "Thuringia" },

    // ---------- Österreich (9 Bundesländer)
    { countryId: "AT", code: "AT-1", nameDe: "Burgenland",       nameEn: "Burgenland" },
    { countryId: "AT", code: "AT-2", nameDe: "Kärnten",          nameEn: "Carinthia" },
    { countryId: "AT", code: "AT-3", nameDe: "Niederösterreich", nameEn: "Lower Austria" },
    { countryId: "AT", code: "AT-4", nameDe: "Oberösterreich",   nameEn: "Upper Austria" },
    { countryId: "AT", code: "AT-5", nameDe: "Salzburg",         nameEn: "Salzburg" },
    { countryId: "AT", code: "AT-6", nameDe: "Steiermark",       nameEn: "Styria" },
    { countryId: "AT", code: "AT-7", nameDe: "Tirol",            nameEn: "Tyrol" },
    { countryId: "AT", code: "AT-8", nameDe: "Vorarlberg",       nameEn: "Vorarlberg" },
    { countryId: "AT", code: "AT-9", nameDe: "Wien",             nameEn: "Vienna" },

    // ---------- Schweiz (26 Kantone)
    { countryId: "CH", code: "CH-AG", nameDe: "Aargau",                     nameEn: "Aargau" },
    { countryId: "CH", code: "CH-AI", nameDe: "Appenzell Innerrhoden",      nameEn: "Appenzell Innerrhoden" },
    { countryId: "CH", code: "CH-AR", nameDe: "Appenzell Ausserrhoden",     nameEn: "Appenzell Ausserrhoden" },
    { countryId: "CH", code: "CH-BE", nameDe: "Bern",                       nameEn: "Bern" },
    { countryId: "CH", code: "CH-BL", nameDe: "Basel-Landschaft",           nameEn: "Basel-Landschaft" },
    { countryId: "CH", code: "CH-BS", nameDe: "Basel-Stadt",                nameEn: "Basel-Stadt" },
    { countryId: "CH", code: "CH-FR", nameDe: "Freiburg",                   nameEn: "Fribourg" },
    { countryId: "CH", code: "CH-GE", nameDe: "Genf",                       nameEn: "Geneva" },
    { countryId: "CH", code: "CH-GL", nameDe: "Glarus",                     nameEn: "Glarus" },
    { countryId: "CH", code: "CH-GR", nameDe: "Graubünden",                 nameEn: "Grisons" },
    { countryId: "CH", code: "CH-JU", nameDe: "Jura",                       nameEn: "Jura" },
    { countryId: "CH", code: "CH-LU", nameDe: "Luzern",                     nameEn: "Lucerne" },
    { countryId: "CH", code: "CH-NE", nameDe: "Neuenburg",                  nameEn: "Neuchâtel" },
    { countryId: "CH", code: "CH-NW", nameDe: "Nidwalden",                  nameEn: "Nidwalden" },
    { countryId: "CH", code: "CH-OW", nameDe: "Obwalden",                   nameEn: "Obwalden" },
    { countryId: "CH", code: "CH-SG", nameDe: "St. Gallen",                 nameEn: "St. Gallen" },
    { countryId: "CH", code: "CH-SH", nameDe: "Schaffhausen",               nameEn: "Schaffhausen" },
    { countryId: "CH", code: "CH-SO", nameDe: "Solothurn",                  nameEn: "Solothurn" },
    { countryId: "CH", code: "CH-SZ", nameDe: "Schwyz",                     nameEn: "Schwyz" },
    { countryId: "CH", code: "CH-TG", nameDe: "Thurgau",                    nameEn: "Thurgau" },
    { countryId: "CH", code: "CH-TI", nameDe: "Tessin",                     nameEn: "Ticino" },
    { countryId: "CH", code: "CH-UR", nameDe: "Uri",                        nameEn: "Uri" },
    { countryId: "CH", code: "CH-VD", nameDe: "Waadt",                      nameEn: "Vaud" },
    { countryId: "CH", code: "CH-VS", nameDe: "Wallis",                     nameEn: "Valais" },
    { countryId: "CH", code: "CH-ZG", nameDe: "Zug",                        nameEn: "Zug" },
    { countryId: "CH", code: "CH-ZH", nameDe: "Zürich",                     nameEn: "Zurich" },

    // ---------- Dänemark (5 Regionen)
    { countryId: "DK", code: "DK-81", nameDe: "Nordjütland",                nameEn: "North Denmark" },
    { countryId: "DK", code: "DK-82", nameDe: "Mitteljütland",              nameEn: "Central Denmark" },
    { countryId: "DK", code: "DK-83", nameDe: "Süddänemark",                nameEn: "Southern Denmark" },
    { countryId: "DK", code: "DK-84", nameDe: "Hovedstaden (Hauptstadtregion)", nameEn: "Capital Region" },
    { countryId: "DK", code: "DK-85", nameDe: "Seeland",                    nameEn: "Zealand" },

    // ---------- Polen (16 Wojewodschaften)
    { countryId: "PL", code: "PL-DS", nameDe: "Woiwodschaft Niederschlesien",     nameEn: "Lower Silesian" },
    { countryId: "PL", code: "PL-KP", nameDe: "Woiwodschaft Kujawien-Pommern",    nameEn: "Kuyavian-Pomeranian" },
    { countryId: "PL", code: "PL-LB", nameDe: "Woiwodschaft Lebus",               nameEn: "Lubusz" },
    { countryId: "PL", code: "PL-LD", nameDe: "Woiwodschaft Łódź",                nameEn: "Łódź" },
    { countryId: "PL", code: "PL-LU", nameDe: "Woiwodschaft Lublin",              nameEn: "Lublin" },
    { countryId: "PL", code: "PL-MA", nameDe: "Woiwodschaft Kleinpolen",          nameEn: "Lesser Poland" },
    { countryId: "PL", code: "PL-MZ", nameDe: "Woiwodschaft Masowien",            nameEn: "Masovian" },
    { countryId: "PL", code: "PL-OP", nameDe: "Woiwodschaft Oppeln",              nameEn: "Opole" },
    { countryId: "PL", code: "PL-PD", nameDe: "Woiwodschaft Podlachien",          nameEn: "Podlaskie" },
    { countryId: "PL", code: "PL-PK", nameDe: "Woiwodschaft Karpatenvorland",     nameEn: "Subcarpathian" },
    { countryId: "PL", code: "PL-PM", nameDe: "Woiwodschaft Pommern",             nameEn: "Pomeranian" },
    { countryId: "PL", code: "PL-SK", nameDe: "Woiwodschaft Heiligkreuz",         nameEn: "Świętokrzyskie" },
    { countryId: "PL", code: "PL-SL", nameDe: "Woiwodschaft Schlesien",           nameEn: "Silesian" },
    { countryId: "PL", code: "PL-WN", nameDe: "Woiwodschaft Ermland-Masuren",     nameEn: "Warmian-Masurian" },
    { countryId: "PL", code: "PL-WP", nameDe: "Woiwodschaft Großpolen",           nameEn: "Greater Poland" },
    { countryId: "PL", code: "PL-ZP", nameDe: "Woiwodschaft Westpommern",         nameEn: "West Pomeranian" },

    // ---------- Tschechien (14 Regionen inkl. Prag)
    { countryId: "CZ", code: "CZ-10", nameDe: "Prag",                     nameEn: "Prague" },
    { countryId: "CZ", code: "CZ-20", nameDe: "Mittelböhmische Region",   nameEn: "Central Bohemian" },
    { countryId: "CZ", code: "CZ-31", nameDe: "Südböhmische Region",      nameEn: "South Bohemian" },
    { countryId: "CZ", code: "CZ-32", nameDe: "Pilsen",                   nameEn: "Plzeň" },
    { countryId: "CZ", code: "CZ-41", nameDe: "Karlsbad",                 nameEn: "Karlovy Vary" },
    { countryId: "CZ", code: "CZ-42", nameDe: "Ústí nad Labem",           nameEn: "Ústí nad Labem" },
    { countryId: "CZ", code: "CZ-51", nameDe: "Liberec",                  nameEn: "Liberec" },
    { countryId: "CZ", code: "CZ-52", nameDe: "Hradec Králové",           nameEn: "Hradec Králové" },
    { countryId: "CZ", code: "CZ-53", nameDe: "Pardubice",                nameEn: "Pardubice" },
    { countryId: "CZ", code: "CZ-63", nameDe: "Vysočina (Hochland)",      nameEn: "Vysočina" },
    { countryId: "CZ", code: "CZ-64", nameDe: "Südmährische Region",      nameEn: "South Moravian" },
    { countryId: "CZ", code: "CZ-71", nameDe: "Olomouc",                  nameEn: "Olomouc" },
    { countryId: "CZ", code: "CZ-72", nameDe: "Zlín",                     nameEn: "Zlín" },
    { countryId: "CZ", code: "CZ-80", nameDe: "Mährisch-Schlesien",       nameEn: "Moravian-Silesian" },

    // ---------- Frankreich (13 Metropolregionen + 5 Übersee)
    { countryId: "FR", code: "FR-ARA", nameDe: "Auvergne-Rhône-Alpes",            nameEn: "Auvergne-Rhône-Alpes" },
    { countryId: "FR", code: "FR-BFC", nameDe: "Bourgogne-Franche-Comté",         nameEn: "Burgundy–Franche-Comté" },
    { countryId: "FR", code: "FR-BRE", nameDe: "Bretagne",                        nameEn: "Brittany" },
    { countryId: "FR", code: "FR-CVL", nameDe: "Centre-Val de Loire",             nameEn: "Centre-Val de Loire" },
    { countryId: "FR", code: "FR-COR", nameDe: "Korsika",                         nameEn: "Corsica" },
    { countryId: "FR", code: "FR-GES", nameDe: "Grand Est",                       nameEn: "Grand Est" },
    { countryId: "FR", code: "FR-HDF", nameDe: "Hauts-de-France",                 nameEn: "Hauts-de-France" },
    { countryId: "FR", code: "FR-IDF", nameDe: "Île-de-France",                   nameEn: "Île-de-France" },
    { countryId: "FR", code: "FR-NOR", nameDe: "Normandie",                       nameEn: "Normandy" },
    { countryId: "FR", code: "FR-NAQ", nameDe: "Nouvelle-Aquitaine",              nameEn: "Nouvelle-Aquitaine" },
    { countryId: "FR", code: "FR-OCC", nameDe: "Okzitanien",                      nameEn: "Occitanie" },
    { countryId: "FR", code: "FR-PDL", nameDe: "Pays de la Loire",                nameEn: "Pays de la Loire" },
    { countryId: "FR", code: "FR-PAC", nameDe: "Provence-Alpes-Côte d’Azur",      nameEn: "Provence-Alpes-Côte d’Azur" },
    // Übersee (5)
    { countryId: "FR", code: "FR-GUA", nameDe: "Guadeloupe",                      nameEn: "Guadeloupe" },
    { countryId: "FR", code: "FR-MQ",  nameDe: "Martinique",                      nameEn: "Martinique" },
    { countryId: "FR", code: "FR-GF",  nameDe: "Französisch-Guayana",             nameEn: "French Guiana" },
    { countryId: "FR", code: "FR-RE",  nameDe: "Réunion",                         nameEn: "Réunion" },
    { countryId: "FR", code: "FR-MAY", nameDe: "Mayotte",                         nameEn: "Mayotte" },

    // ---------- Luxemburg (12 Kantone)
    { countryId: "LU", code: "LU-CA", nameDe: "Capellen",             nameEn: "Capellen" },
    { countryId: "LU", code: "LU-CL", nameDe: "Clerf",                nameEn: "Clervaux" },
    { countryId: "LU", code: "LU-DI", nameDe: "Diekirch",             nameEn: "Diekirch" },
    { countryId: "LU", code: "LU-EC", nameDe: "Echternach",           nameEn: "Echternach" },
    { countryId: "LU", code: "LU-ES", nameDe: "Esch an der Alzette",  nameEn: "Esch-sur-Alzette" },
    { countryId: "LU", code: "LU-GR", nameDe: "Grevenmacher",         nameEn: "Grevenmacher" },
    { countryId: "LU", code: "LU-LU", nameDe: "Luxemburg",            nameEn: "Luxembourg" },
    { countryId: "LU", code: "LU-ME", nameDe: "Mersch",               nameEn: "Mersch" },
    { countryId: "LU", code: "LU-RD", nameDe: "Redingen",             nameEn: "Redange" },
    { countryId: "LU", code: "LU-RM", nameDe: "Remich",               nameEn: "Remich" },
    { countryId: "LU", code: "LU-VD", nameDe: "Vianden",              nameEn: "Vianden" },
    { countryId: "LU", code: "LU-WI", nameDe: "Wiltz",                nameEn: "Wiltz" },

    // ---------- Belgien (10 Provinzen + Region Brüssel-Hauptstadt)
    { countryId: "BE", code: "BE-BRU", nameDe: "Brüssel-Hauptstadt",  nameEn: "Brussels-Capital Region" },
    { countryId: "BE", code: "BE-VAN", nameDe: "Antwerpen",           nameEn: "Antwerp" },
    { countryId: "BE", code: "BE-VBR", nameDe: "Flämisch-Brabant",    nameEn: "Flemish Brabant" },
    { countryId: "BE", code: "BE-VOV", nameDe: "Ostflandern",         nameEn: "East Flanders" },
    { countryId: "BE", code: "BE-VLI", nameDe: "Limburg",             nameEn: "Limburg" },
    { countryId: "BE", code: "BE-VWV", nameDe: "Westflandern",        nameEn: "West Flanders" },
    { countryId: "BE", code: "BE-WBR", nameDe: "Wallonisch-Brabant",  nameEn: "Walloon Brabant" },
    { countryId: "BE", code: "BE-WHT", nameDe: "Hennegau",            nameEn: "Hainaut" },
    { countryId: "BE", code: "BE-WLG", nameDe: "Lüttich",             nameEn: "Liège" },
    { countryId: "BE", code: "BE-WLX", nameDe: "Luxemburg",           nameEn: "Luxembourg" },
    { countryId: "BE", code: "BE-WNA", nameDe: "Namur",               nameEn: "Namur" },

    // ---------- Niederlande (12 Provinzen)
    { countryId: "NL", code: "NL-DR", nameDe: "Drenthe",          nameEn: "Drenthe" },
    { countryId: "NL", code: "NL-FL", nameDe: "Flevoland",        nameEn: "Flevoland" },
    { countryId: "NL", code: "NL-FR", nameDe: "Friesland",        nameEn: "Friesland (Fryslân)" },
    { countryId: "NL", code: "NL-GE", nameDe: "Gelderland",       nameEn: "Gelderland" },
    { countryId: "NL", code: "NL-GR", nameDe: "Groningen",        nameEn: "Groningen" },
    { countryId: "NL", code: "NL-LI", nameDe: "Limburg",          nameEn: "Limburg" },
    { countryId: "NL", code: "NL-NB", nameDe: "Nordbrabant",      nameEn: "North Brabant" },
    { countryId: "NL", code: "NL-NH", nameDe: "Nordholland",      nameEn: "North Holland" },
    { countryId: "NL", code: "NL-OV", nameDe: "Overijssel",       nameEn: "Overijssel" },
    { countryId: "NL", code: "NL-UT", nameDe: "Utrecht",          nameEn: "Utrecht" },
    { countryId: "NL", code: "NL-ZE", nameDe: "Zeeland",          nameEn: "Zeeland" },
    { countryId: "NL", code: "NL-ZH", nameDe: "Südholland",       nameEn: "South Holland" },
];

export async function seedCountriesAndRegions() {
    // Länder upserten (idempotent)
    for (const c of COUNTRIES) {
        await prisma.country.upsert({
            where:  { code: c.code },
            update: { nameDe: c.nameDe, nameEn: c.nameEn },
            create: { code: c.code, nameDe: c.nameDe, nameEn: c.nameEn },
        });
    }
    logger.info(`✅ ${COUNTRIES.length} Länder upserted`);

    // Regionen anlegen (idempotent via skipDuplicates)
    if (REGIONS.length > 0) {
        await prisma.region.createMany({
            data: REGIONS.map(r => ({
                countryId: r.countryId,
                code:      r.code,
                nameDe:    r.nameDe,
                nameEn:    r.nameEn,
                // adminLevel: 1 // falls im Schema vorhanden
            })),
            skipDuplicates: true,
        });
        logger.info(`✅ ${REGIONS.length} Regionen angelegt/übersprungen (skipDuplicates)`);
    }
}

// ESM-sicher ausführen (analog zu deinem Beispiel)
(async () => {
    await seedCountriesAndRegions();
})()
    .catch((e) => {
        logger.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
