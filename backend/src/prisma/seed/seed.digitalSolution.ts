import { prisma } from "../prisma";
import {
  MaturityDegree,
  OfferingCategory,
  DigitalSolutionState,
} from "@prisma/client";

type SeedItem = {
  name: string;
  link: string;
  maturityDegree: MaturityDegree;
  offeringCategory: OfferingCategory;
  shortDescription: string | null;
  longDescription: string | null;
  goalDescription?: string | null;
  technicalDescription?: string | null;
  efficiencyDescription?: string | null;
  processDescription?: string | null;
  socialRelevanceDescription?: string | null;
  hasAcceptedTerms?: boolean;
  hasAcceptedPrivacyPolicy?: boolean;
  solutionPresentedByUser?: boolean;
  state?: DigitalSolutionState;
  readyForOperation?: Date | null;
};

export async function seedDigitalSolutions() {
  const items: SeedItem[] = [
    // 1) твоя текущая запись InSchuKa4.0 (оставил без изменений)
    {
      name: "InSchuKa4.0",
      link: "https://www.bmbf-wax.de/verbundvorhaben/inschuka4-0/",
      maturityDegree: MaturityDegree.MARKET_READY_CONTINUOUS_OPERATION,
      offeringCategory: OfferingCategory.PRODUCT,
      shortDescription:
        "Entwicklung eines intelligenten Kanalnetzmanagementsystems mit Datenerfassung, -auswertung und -steuerung für die Kanalnetzbetreiber durch Messung von Echtzeit-Qualitätsparametern im Jenaer Stadtkanalnetz.",
      longDescription:
        "Entwicklung eines intelligenten Kanalnetzmanagementsystems mit Datenerfassung, -auswertung und -steuerung für die Kanalnetzbetreiber durch Messung von Echtzeit-Qualitätsparametern im Jenaer Stadtkanalnetz auf Basis von KI unter Verwendung innovativer Kanalnetzsensoren und unter Einbeziehung historischer/prädiktiver Wetterdaten. Dieses Management soll einen flexiblen, fehlertoleranten und effizienten Betrieb des Kanalnetzes bei extremen Wetterbedingungen gewährleisten.",
      goalDescription:
        "Das Projekt fokussiert auf ein integriertes und transdisziplinäres Management (in Bezug auf Risiken) von gegensätzlichen hydrologischen und urbanen wasserbezogenen Ereignissen in städtischen Wasserversorgungsinfrastrukturen unter Verwendung digitaler Tools für Monitoring, Analyse, Prognose und Kommunikation.",
      technicalDescription:
        "Im Vordergrund steht die bessere Ausnutzung vorhandener Rückhalte- und Speicherräume bei Starkregenereignissen. Ziel ist die Minimierung von Abwasserentlastungen in Gewässern durch Simulationen im Pilotabschnitt Jena. Cyberphysische Schieber und Wehre erlauben Abflussdrosselung, Rückhaltevergrößerung und innovative Kaskadenspülung.",
      efficiencyDescription: null,
      processDescription:
        "Das Projekt ist in 8 Arbeitspakete gegliedert: 1) Bestandsaufnahme Jena, 2) Simulationen, 3) Ablagerungsverhalten, 4) Verfahren zur Stauraumaktivierung und Spülung, 5) Dynamische Bewirtschaftung, 6) Pilotphase, 7) Akzeptanz- und Transferanalyse, 8) Kommunikation & Projektkoordination.",
      socialRelevanceDescription:
        "Mit dem neu entwickelten System soll dem Bedürfnis von Kommunen und Städten Rechnung getragen werden, automatisch vorbeugende Spülungen von Kanalabschnitten zu ermöglichen und eine unkontrollierte Ausschwemmung von Schadstoffen bei kurzen, starken Regenschauern durch einen besseren Rückhalt im Kanalsystem zu verhindern.",
      hasAcceptedTerms: true,
      hasAcceptedPrivacyPolicy: true,
      solutionPresentedByUser: false,
      state: DigitalSolutionState.ACTIVATED,
      readyForOperation: new Date(),
    },

    {
      name: "hetida 4 water (h4w)",
      link: "https://neusta-sd-west.de/wasserwirtschaft/hetida4water/",
      maturityDegree: MaturityDegree.MARKET_READY_CONTINUOUS_OPERATION,
      offeringCategory: OfferingCategory.PRODUCT,
      shortDescription:
        "Open-Source Daten- und Analyse-Software für die Wasserwirtschaft.",
      longDescription:
        "hetida 4 Water (h4w) ist eine Open-Source-Daten- und Analyse-Software für die Wasserwirtschaft. Sie bietet eine zentrale Plattform zur Erfassung und Archivierung von dynamischen Betriebsdaten, einschließlich Prozess- und Produktdaten, Umweltmesstechnik und Energieverbrauchsdaten. Die Software ermöglicht die Zusammenführung und Bewertung dieser Daten, um interne Prozesse und Produkte zu optimieren. h4w bietet Konnektivität und Verteilung von Daten durch modulare Komponenten und unterstützt die Anbindung beliebiger Sensorik. Die offene Architektur ermöglicht Anpassungen und Erweiterungen, während das zentrale Berichtswesen die Erstellung von behördlichen Berichten und individuellen Auswertungen erleichtert. Zusätzlich bietet h4w Funktionen für die intelligente Instandhaltung, die auf Künstlicher Intelligenz basieren und die Wartung, Inspektion und Instandsetzung von Anlagen unterstützen. Das System ermöglicht eine effiziente Planung basierend auf zustands- und störungsabhängiger Instandhaltung sowie intervallabhängigen Wartungskonzepten. Mit h4w können Unternehmen die Qualität ihrer Produkte und Dienstleistungen kontinuierlich verbessern und von den Vorteilen der Digitalisierung in der Wasserwirtschaft profitieren.",
      goalDescription:
        "hetida 4 Water dient dem Zweck, dynamische Betriebsdaten zu erfassen, zu analysieren und zu optimieren, um interne Prozesse und Produkte in der Wasserwirtschaft zu verbessern. Mit h4w können Unternehmen Daten zentral erfassen, verwalten und auswerten, um Effizienzsteigerungen, Qualitätsverbesserungen und intelligente Instandhaltung in der Wasserbranche zu ermöglichen.",
      technicalDescription:
        "hetida 4 Water (h4w) basiert auf moderner IT-Infrastruktur und nutzt Cloud-Technologien für eine skalierbare und flexible Implementierung. Es verwendet spezialisierte Zeitreihendatenbanken zur Speicherung erfasster Daten und analysiert mithilfe von KI- und maschinellen Lernalgorithmen. Die Software integriert sich nahtlos in bestehende Systeme und unterstützt verschiedene Schnittstellen zur Datenübertragung. Die Implementierung erfolgt unter Berücksichtigung aktueller Datenschutz- und Sicherheitsregularien, um die Vertraulichkeit und Integrität der Daten jederzeit zu gewährleisten.",
      efficiencyDescription:
        "hetida 4 Water ermöglicht die automatisierte Erfassung, Analyse und Überwachung von Wasserverbrauchsdaten. Dadurch können Wasserressourcen besser verwaltet, Leckagen frühzeitig erkannt und der Wasserverbrauch optimiert werden. Die präzise Analyse und Vorhersage von Verbrauchsmustern unterstützt effizientes Ressourcenmanagement und ermöglicht Kosteneinsparungen.",
      processDescription: null, // в PDF поле процесса пустое
      socialRelevanceDescription:
        "h4w kann in industriellen Anlagen, gewerblichen Gebäuden, öffentlichen Einrichtungen und auch in privaten Haushalten eingesetzt werden. h4w unterstützt Wasserversorger und Unternehmen dabei, ihren Wasserverbrauch zu überwachen, zu analysieren und zu optimieren, um Ressourceneffizienz zu verbessern, Kosten zu senken und nachhaltiges Wassermanagement zu fördern.",
      hasAcceptedTerms: true,
      hasAcceptedPrivacyPolicy: true,
      solutionPresentedByUser: false,
      state: DigitalSolutionState.ACTIVATED,
      readyForOperation: new Date("2023-07-06"),
    },
  ];

  for (const data of items) {
    const existing = await prisma.digitalSolution.findFirst({
      where: { name: data.name },
      select: { id: true },
    });

    if (existing) {
      console.log(`ℹ️ DigitalSolution "${data.name}" уже существует (ID=${existing.id}).`);
      continue;
    }

    await prisma.digitalSolution.create({ data });
    console.log(`✅ DigitalSolution "${data.name}" создана.`);
  }
}

// ESM-safe run (если запускаешь файл напрямую)
(async () => {
  await seedDigitalSolutions();
})()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
