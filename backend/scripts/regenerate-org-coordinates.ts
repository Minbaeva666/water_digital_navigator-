import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Geocoding helper (same as in organization.controller.ts)
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
                }
            }
            if (!geoRes.ok && geoRes.status !== 429) {
                throw new Error(`HTTP ${geoRes.status}`);
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            if (attempt === maxRetries) {
                throw err;
            }
            // Otherwise, continue to next retry
            continue;
        }
    }
    
    return null;
};

async function regenerateCoordinates() {
    console.log("🔄 Starting coordinate regeneration for organizations...\n");

    try {
        // Find organizations without coordinates
        const orgsWithoutCoords = await prisma.organization.findMany({
            where: {
                OR: [
                    { lat: null },
                    { lon: null },
                ]
            },
            select: {
                id: true,
                name: true,
                zip: true,
                city: true,
                countryId: true,
                lat: true,
                lon: true,
                manualCoords: true,
            },
            orderBy: { name: 'asc' }
        });

        console.log(`📊 Found ${orgsWithoutCoords.length} organizations without coordinates\n`);

        if (orgsWithoutCoords.length === 0) {
            console.log("✅ All organizations have coordinates!");
            return;
        }

        let successCount = 0;
        let failureCount = 0;
        const failures: Array<{name: string; zip: string; country: string; error: string}> = [];

        for (let i = 0; i < orgsWithoutCoords.length; i++) {
            const org = orgsWithoutCoords[i];
            const progress = `[${i + 1}/${orgsWithoutCoords.length}]`;
            
            try {
                console.log(`${progress} Processing "${org.name}" (${org.zip}, ${org.countryId})...`);
                
                if (!org.zip || !org.countryId) {
                    console.log(`   ⚠️  SKIPPED - missing zip (${org.zip}) or country (${org.countryId})`);
                    failureCount++;
                    failures.push({
                        name: org.name,
                        zip: org.zip ?? "N/A",
                        country: org.countryId ?? "N/A",
                        error: "Missing zip or country"
                    });
                    continue;
                }

                const result = await geocodeWithRetry(org.zip, org.countryId);
                
                if (result) {
                    await prisma.organization.update({
                        where: { id: org.id },
                        data: {
                            lat: result.lat,
                            lon: result.lon,
                        }
                    });
                    console.log(`   ✅ SUCCESS - Coordinates: ${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}`);
                    successCount++;
                } else {
                    console.log(`   ❌ FAILED - No coordinates found for this location`);
                    failureCount++;
                    failures.push({
                        name: org.name,
                        zip: org.zip,
                        country: org.countryId,
                        error: "Geocoding returned no results"
                    });
                }

                // Rate limiting: Wait 1.5 seconds between requests to be gentle with Nominatim API
                if (i < orgsWithoutCoords.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.log(`   ❌ ERROR - ${errorMsg}`);
                failureCount++;
                failures.push({
                    name: org.name,
                    zip: org.zip ?? "N/A",
                    country: org.countryId ?? "N/A",
                    error: errorMsg
                });
            }
        }

        // Summary
        console.log("\n" + "=".repeat(60));
        console.log("📊 SUMMARY");
        console.log("=".repeat(60));
        console.log(`✅ Successfully updated: ${successCount}`);
        console.log(`❌ Failed: ${failureCount}`);
        console.log(`📍 Total organizations now with coordinates: ${orgsWithoutCoords.length - failureCount + successCount}`);

        if (failures.length > 0) {
            console.log("\n⚠️  Failed organizations:");
            failures.forEach(f => {
                console.log(`   - ${f.name} (${f.zip}, ${f.country}): ${f.error}`);
            });
        }

        console.log("\n✅ Coordinate regeneration complete!");
    } catch (error) {
        console.error("❌ Fatal error:", error instanceof Error ? error.message : error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

regenerateCoordinates();
