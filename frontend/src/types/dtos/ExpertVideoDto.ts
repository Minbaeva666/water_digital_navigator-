export interface ExpertAuthorDto {
  name: string;
  url?: string;
}

export interface ExpertVideoDto {
  id: string;
  title: string;
  description?: string;
  publishedAt?: string;

  authors?: ExpertAuthorDto[];

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
  publishedAt?: string;

  authors?: ExpertAuthorDto[];

  authorName?: string;
  authorUrl?: string;

  videoUrl: string;
  isActive: boolean;
}
