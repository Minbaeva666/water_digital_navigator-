import { prisma } from "./src/prisma/prisma";

async function testCoordinates() {
    try {
        // Get all activated digital solutions with their organizations
        const solutions = await prisma.digitalSolution.findMany({
            where: { state: "ACTIVATED" },
            include: {
                organization: {
                    select: {
                        id: true,
                        name: true,
                        lat: true,
                        lon: true,
                        zip: true,
                        city: true,
                    },
                },
                presentedByUser: {
                    select: {
                        organization: {
                            select: {
                                id: true,
                                name: true,
                                lat: true,
                                lon: true,
                                zip: true,
                                city: true,
                            },
                        },
                    },
                },
            },
        });

        console.log(`\n📊 Total ACTIVATED digital solutions: ${solutions.length}\n`);

        let withCoords = 0;
        solutions.forEach((s: any, idx: number) => {
            const orgCoords = s.organization?.lat && s.organization?.lon;
            const userOrgCoords = s.presentedByUser?.organization?.lat && s.presentedByUser?.organization?.lon;
            
            if (orgCoords || userOrgCoords) {
                withCoords++;
                console.log(`✅ Solution ${idx + 1}: ${s.name}`);
                if (orgCoords) {
                    console.log(`   Organization: ${s.organization?.name} at (${s.organization?.lat}, ${s.organization?.lon})`);
                }
                if (userOrgCoords) {
                    console.log(`   Presented By Org: ${s.presentedByUser?.organization?.name} at (${s.presentedByUser?.organization?.lat}, ${s.presentedByUser?.organization?.lon})`);
                }
            }
        });

        console.log(`\n📍 Total solutions WITH coordinates: ${withCoords}\n`);

        if (solutions.length === 0) {
            console.log("⚠️  No activated digital solutions found!\n");
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testCoordinates();
