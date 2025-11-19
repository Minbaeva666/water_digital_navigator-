import {FaqItemDto} from "./FaqItemDto.ts";

export type FaqDto = {
    id: string;
    createdAt: string; // ISO
    updatedAt: string; // ISO
    items: FaqItemDto[];
};