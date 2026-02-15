import {Col, Row, Typography} from "antd";
import {DigitalSolutionFormValues} from "../../../forms/digital-solution/DigitalSolutionFormValues.ts";

const {Title} = Typography;

export interface DigitalSolutionCardProps {
    digitalSolution: DigitalSolutionFormValues;
}

// Helper component to render text with line breaks
function TextWithLineBreaks({text}: {text?: string | null}) {
    if (!text) return null;
    
    return (
        <>
            {text.split('\n').map((line, idx) => (
                <div key={idx}>{line}</div>
            ))}
        </>
    );
}

export function DetailsTabComponent({digitalSolution}: DigitalSolutionCardProps) {
    return (
        <div className="page-de" lang="de">
            <Row     gutter={[
                { xs: 55, sm: 55, md: 55, lg: 55, xl: 55, xxl: 55 }, // horizontal
                { xs: 33, sm: 33, md: 33, lg: 22, xl: 22, xxl: 22 }, // vertikal
            ]} justify="start" style={{paddingTop: "80px"}}>
                <Col className="col-shrink" xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
                    <Title level={5}>Beschreibung</Title>
                    <Typography.Paragraph className="text-wrap">
                        <TextWithLineBreaks text={digitalSolution?.longDescription} />
                    </Typography.Paragraph>
                </Col>

                <Col className="col-shrink" xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
                    <Title level={5}>Ziel/Nutzen</Title>
                    <Typography.Paragraph className="text-wrap">
                        <TextWithLineBreaks text={digitalSolution?.goalDescription} />
                    </Typography.Paragraph>
                </Col>

                <Col className="col-shrink" xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
                    <Title level={5}>Technische Daten</Title>
                    <Typography.Paragraph className="text-wrap">
                        <TextWithLineBreaks text={digitalSolution?.technicalDescription} />
                    </Typography.Paragraph>
                </Col>

                {digitalSolution?.efficiencyDescription && (
                <Col className="col-shrink" xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
                    <Title level={5}>Effizienz</Title>
                    <Typography.Paragraph className="text-wrap">
                        <TextWithLineBreaks text={digitalSolution.efficiencyDescription} />
                    </Typography.Paragraph>
                    </Col>
                )}

                {digitalSolution?.processDescription && (
                <Col className="col-shrink" xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
                    <Title level={5}>Prozess/Vorgehensmodell</Title>
                    <Typography.Paragraph className="text-wrap">
                        <TextWithLineBreaks text={digitalSolution.processDescription} />
                    </Typography.Paragraph>
                    </Col>
                )}

                {digitalSolution?.socialRelevanceDescription && (
                <Col className="col-shrink" xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
                    <Title level={5}>Gesellschaftliche Relevanz</Title>
                    <Typography.Paragraph className="text-wrap">
                        <TextWithLineBreaks text={digitalSolution.socialRelevanceDescription} />
                    </Typography.Paragraph>
                    </Col>
                )}
            </Row>
        </div>
    );
}
