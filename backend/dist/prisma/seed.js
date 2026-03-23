"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const seedCampaigns = [
    {
        title: 'Anna: Cesta na turnaj',
        shortDesc: 'Podpora cestovních nákladů a tréninků před evropským turnajem.',
        story: 'Anna je talentovaná tenistka, která se probojovala na mezinárodní turnaj. Potřebuje podpořit dopravu, ubytování a kvalitní přípravu.',
        category: client_1.Category.SPORT,
        goalAmount: 100000,
        currentAmount: 42000,
        imageUrls: ['/placeholders/project-1.svg', '/placeholders/talent-1.svg'],
        status: client_1.CampaignStatus.APPROVED,
    },
    {
        title: 'Marek: Nákup vybavení',
        shortDesc: 'Nové housle a vybavení pro další studium na konzervatoři.',
        story: 'Marek studuje hru na housle a byl přijat do pokročilého programu. Finanční podpora pomůže s nákupem nástroje a přípravou na soutěže.',
        category: client_1.Category.OTHER,
        goalAmount: 120000,
        currentAmount: 50000,
        imageUrls: ['/placeholders/project-2.svg', '/placeholders/talent-2.svg'],
        status: client_1.CampaignStatus.PENDING_REVIEW,
    },
    {
        title: 'Eliška: Startup camp',
        shortDesc: 'Podpora účasti na mezinárodním technologickém kempu.',
        story: 'Eliška rozvíjí robotický projekt a chce ho představit na startup campu. Prostředky využije na účastnický poplatek a prototypování.',
        category: client_1.Category.SCIENCE,
        goalAmount: 135000,
        currentAmount: 58000,
        imageUrls: ['/placeholders/project-3.svg', '/placeholders/talent-3.svg'],
        status: client_1.CampaignStatus.DRAFT,
    },
];
async function main() {
    await prisma.userSession.deleteMany();
    await prisma.campaignImage.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.user.deleteMany();
    const admin = await prisma.user.create({
        data: {
            firstName: 'Admin',
            lastName: 'Account',
            birthDate: new Date('1990-01-01'),
            username: 'admin',
            password: 'admin',
            role: client_1.UserRole.ADMIN,
        },
    });
    const user = await prisma.user.create({
        data: {
            firstName: 'User',
            lastName: 'Account',
            birthDate: new Date('1995-01-01'),
            username: 'user',
            password: 'user',
            role: client_1.UserRole.USER,
        },
    });
    for (const [index, campaign] of seedCampaigns.entries()) {
        await prisma.campaign.create({
            data: {
                title: campaign.title,
                shortDesc: campaign.shortDesc,
                story: campaign.story,
                category: campaign.category,
                goalAmount: campaign.goalAmount,
                currentAmount: campaign.currentAmount,
                ownerKey: index % 2 === 0 ? user.username : admin.username,
                ownerId: index % 2 === 0 ? user.id : admin.id,
                status: campaign.status,
                coverImageUrl: campaign.imageUrls[0],
                images: { create: campaign.imageUrls.map((url, sortOrder) => ({ url, sortOrder })) },
            },
        });
    }
}
main().then(async () => prisma.$disconnect()).catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
});
//# sourceMappingURL=seed.js.map