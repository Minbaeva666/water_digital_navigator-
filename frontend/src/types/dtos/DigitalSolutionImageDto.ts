export type ImageType = 'TITLE' | 'DETAIL';

export interface DigitalSolutionImageDto {
    id: string;
    digitalSolutionId?: string;
    filename: string;          // NICHT mehr string | null, sondern zwingend string
    path: string | null;       // Nullable, wenn du es brauchst
    mimeType: string;          // zwingend string
    size: number;              // zwingend number
    uploadedAt: string | null; // string | null
    type: ImageType;
    dataUri?: string;
}