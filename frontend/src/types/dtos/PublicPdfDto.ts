export interface PublicPdfDto {
    exists: boolean;
    filename: string;
    publicUrl: string;
    size?: number;
    updatedAt?: string;
}
