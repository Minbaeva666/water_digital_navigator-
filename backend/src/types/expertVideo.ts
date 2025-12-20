export interface ExpertVideoCreateDto {
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  isActive?: boolean;
}

export interface ExpertVideoUpdateDto {
  title?: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
}
