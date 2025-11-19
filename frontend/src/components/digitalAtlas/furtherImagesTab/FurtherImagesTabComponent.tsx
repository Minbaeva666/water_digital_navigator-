import { Col, Row, UploadFile, Image, Empty } from "antd";
import {useEffect, useMemo} from "react";
import "./FurtherImagesTabComponent.less"

export interface DigitalSolutionCardProps {
    images: UploadFile[];
    /** optional: erstes Bild (Titelbild) überspringen */
    skipFirst?: boolean;
}

type Item = { key: string; thumb: string; full: string; alt: string; isBlob: boolean };

export function FurtherImagesTabComponent({ images, skipFirst = false }: DigitalSolutionCardProps) {

    const items = useMemo<Item[]>(() => {
        const list = skipFirst ? images.slice(1) : images;
        return list
            .map((f) => {
                // volle Quelle aus der lokalen Datei (kein API-Call!)
                const fullFromFile =
                    f.originFileObj ? URL.createObjectURL(f.originFileObj as File) : undefined;

                const full = fullFromFile || (typeof f.thumbUrl === "string" ? f.thumbUrl : undefined);
                const thumb = (typeof f.thumbUrl === "string" && f.thumbUrl) || full;

                if (!full) return null;
                return {
                    key: f.uid ?? full,
                    thumb: thumb!,
                    full,
                    alt: f.name ?? "Bild",
                    isBlob: !!fullFromFile,
                };
            })
            .filter(Boolean) as Item[];
    }, [images, skipFirst]);

    // Blob-URLs wieder freigeben
    useEffect(() => {
        return () => {
            items.forEach((it) => {
                if (it.isBlob && it.full.startsWith("blob:")) URL.revokeObjectURL(it.full);
            });
        };
    }, [items]);

    if (!items.length) {
        return (
            <Col style={{ paddingTop: 24 }}>
                <Empty description="Keine weiteren Bilder" />
            </Col>
        );
    }

    return (
        <Col style={{ paddingTop: 80 }}>
            <Image.PreviewGroup
                preview={{
                    rootClassName: "previewHalf",
                    movable: true,
                    toolbarRender: () => null,
                    imageRender: (originNode) => (
                        <div className="previewHalf__box">{originNode}</div>
                    ),
                    // optional: kein User-Zoom
                    // minScale: 1, maxScale: 1,
                }}
            >
                <Row gutter={[16, 16]}>
                    {items.map(({ key, thumb, full, alt }) => (
                        <Col key={key} xs={12} sm={6} md={6} lg={6} xl={4}>
                            <Image
                                src={thumb}                 // kleines Vorschaubild im Grid
                                alt={alt}
                                width="100%"
                                height={200}
                                style={{ objectFit: "cover", borderRadius: 8 }}
                                preview={{ src: full }}
                            />
                        </Col>
                    ))}
                </Row>
            </Image.PreviewGroup>
        </Col>
    );
}
