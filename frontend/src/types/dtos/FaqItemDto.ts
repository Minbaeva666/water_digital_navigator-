export type FaqItemDto = {
    id: string;
    faqId: string;
    sort: number;
    header: string;
    content: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
};