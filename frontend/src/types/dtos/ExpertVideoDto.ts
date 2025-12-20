export interface ExpertVideoDto {
  id: string;
  title: string;
  description?: string;
  publishedAt?: string;
  authorName?: string;
  authorUrl?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpertVideoCreateUpdateDto {
  title: string;
  description?: string;
  publishedAt?: string; // ISO-строка
  authorName?: string;
  authorUrl?: string;
  videoUrl: string;
  isActive: boolean;
}
