import React from "react";
import {Modal, Typography, Row, Col} from "antd";

const {Title, Text} = Typography;

interface ModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const PrivatPolicyModal: React.FC<ModalProps> = ({isModalOpen, setIsModalOpen}) => {
    return (
        <Modal
            open={isModalOpen}
            closable={true}
            onCancel={() => setIsModalOpen(false)}
            footer={false}
            centered
            width={{
                xs: '70%',
                sm: '70%',
                md: '70%',
                lg: '70%',
                xl: '80%',
                xxl: '80%',
            }}
        >
            <div style={{textAlign: "center"}}>
                <Row justify="center">
                    <Col>
                        <Title level={2}> Datenschutz
                        </Title>
                        <Text>
                            Datenschutzerklärung
                            1. Datenschutz auf einen Blick
                            Allgemeine Hinweise
                            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
                            personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten
                            sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche
                            Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten
                            Datenschutzerklärung sowie unserem Consent-Management-Tool. Wir informieren Sie über Ihre
                            mittels Cookies gegebenenfalls verarbeiteten personenbezogenen Daten in unserem
                            Consent-Management-Tool. Entsprechendes gilt für ähnliche Technologien.

                            Datenerfassung auf dieser Website
                            Wer ist verantwortlich für die Datenerfassung auf dieser Website?
                            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
                            Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle“ in dieser
                            Datenschutzerklärung entnehmen.

                            Wie erfassen wir Ihre Daten?
                            Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es
                            sich z. B. um Daten handeln, die Sie in ein Kontaktformular eingeben.

                            Andere Daten werden automatisch oder nach Ihrer Einwilligung beim Besuch der Website durch
                            unsere IT-Systeme erfasst. Das sind vor allem technische Daten (z. B. Internetbrowser,
                            Betriebssystem oder Uhrzeit des Seitenaufrufs). Die Erfassung dieser Daten erfolgt
                            automatisch, sobald Sie diese Website betreten.

                            Wofür nutzen wir Ihre Daten?
                            Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu
                            gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.

                            Welche Rechte haben Sie bezüglich Ihrer Daten?
                            Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck
                            Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die
                            Berichtigung oder Löschung dieser Daten zu verlangen. Wenn Sie eine Einwilligung zur
                            Datenverarbeitung erteilt haben, können Sie diese Einwilligung jederzeit für die Zukunft
                            widerrufen. Außerdem haben Sie das Recht, unter bestimmten Umständen die Einschränkung der
                            Verarbeitung Ihrer personenbezogenen Daten zu verlangen. Des Weiteren steht Ihnen ein
                            Beschwerderecht bei einer Aufsichtsbehörde zu.

                            Hierzu sowie zu weiteren Fragen zum Thema Datenschutz können Sie sich jederzeit an uns
                            wenden.

                            Analyse-Tools und Tools von Dritt­anbietern
                            Beim Besuch dieser Website kann Ihr Surf-Verhalten statistisch ausgewertet werden. Das
                            geschieht vor allem mit sogenannten Analyseprogrammen.

                            Detaillierte Informationen zu diesen Analyseprogrammen finden Sie in der folgenden
                            Datenschutzerklärung bzw. in unserem Consent-Management-Tool.

                            2. Hosting
                            Wir hosten die Inhalte unserer Website bei folgendem Anbieter:

                            Externes Hosting
                            Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website
                            erfasst werden, werden auf den Servern des Hosters / der Hoster gespeichert. Hierbei kann es
                            sich v. a. um IP-Adressen, Kontaktanfragen, Meta- und Kommunikationsdaten, Vertragsdaten,
                            Kontaktdaten, Namen, Websitezugriffe und sonstige Daten, die über eine Website generiert
                            werden, handeln.

                            Das externe Hosting erfolgt zum Zwecke der Vertragserfüllung gegenüber unseren potenziellen
                            und bestehenden Kunden (Art. 6 Abs. 1 lit. b DSGVO) und im Interesse einer sicheren,
                            schnellen und effizienten Bereitstellung unseres Online-Angebots durch einen professionellen
                            Anbieter zur Erfüllung unserer Aufgaben als öffentliche Stelle aufgrund des Art. 4 Abs. 1
                            BayDSG i.V.m. Art. 6 Abs. 1 UnterAbs. 1 lit. e DSGVO (Erfüllung originärer Hochschulaufgaben
                            gemäß Art. 2 BayHSchG). Zweck der Verarbeitung ist die Erfüllung der uns vom Gesetzgeber
                            zugewiesenen öffentlichen Aufgaben, insbesondere der Information der Öffentlichkeit über
                            unsere Tätigkeiten, auch indem wir online Leistungen anbieten.

                            Sofern eine entsprechende Einwilligung abgefragt wurde, erfolgt die Verarbeitung
                            ausschließlich auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG, soweit
                            die Einwilligung die Speicherung von Cookies oder den Zugriff auf Informationen im Endgerät
                            des Nutzers (z. B. Device-Fingerprinting) im Sinne des TTDSG umfasst. Die Einwilligung ist
                            jederzeit widerrufbar.

                            Unser(e) Hoster wird bzw. werden Ihre Daten nur insoweit verarbeiten, wie dies zur Erfüllung
                            seiner Leistungspflichten erforderlich ist und unsere Weisungen in Bezug auf diese Daten
                            befolgen.

                            Wir setzen folgende(n) Hoster ein:

                            bitzinger GmbH
                            Ossecker Straße 174
                            95030 Hof

                            Auftragsverarbeitung
                            Wir haben einen Vertrag über Auftragsverarbeitung (AVV) mit dem oben genannten Anbieter
                            geschlossen. Hierbei handelt es sich um einen datenschutzrechtlich vorgeschriebenen Vertrag,
                            der gewährleistet, dass dieser die personenbezogenen Daten unserer Websitebesucher nur nach
                            unseren Weisungen und unter Einhaltung der DSGVO verarbeitet.

                            3. Allgemeine Hinweise und Pflicht­informationen
                            Datenschutz
                            Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir
                            behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen
                            Datenschutzvorschriften sowie dieser Datenschutzerklärung.

                            Wenn Sie diese Website benutzen, werden verschiedene personenbezogene Daten erhoben.
                            Personenbezogene Daten sind Daten, mit denen Sie persönlich identifiziert werden können. Die
                            vorliegende Datenschutzerklärung erläutert, welche Daten wir erheben und wofür wir sie
                            nutzen. Sie erläutert auch, wie und zu welchem Zweck das geschieht.

                            Wir weisen darauf hin, dass die Datenübertragung im Internet (z. B. bei der Kommunikation
                            per E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem
                            Zugriff durch Dritte ist nicht möglich.

                            Hinweis zur verantwortlichen Stelle
                            Verantwortlicher für die o.g. Webseite ist die Hochschule für Angewandte Wissenschaften Hof
                            (nachfolgend kurz „Hochschule Hof“). Die Hochschule Hof ist eine Körperschaft des
                            öffentlichen Rechts und zugleich eine staatliche Einrichtung des Freistaates Bayern.

                            Die Hochschule Hof wird gesetzlich vertreten durch ihren Präsidenten, Prof. Dr. Dr. h. c.
                            Jürgen Lehmann.

                            Sie erreichen die Hochschule Hof und den Präsidenten der Hochschule wie folgt:

                            Hochschule für Angewandte Wissenschaften Hof
                            Alfons-Goppel-Platz 1
                            95028 Hof

                            Telefon: +49 (0) 9281 / 409 3000

                            Fax: + 49 (0) 9281 / 409 3000
                            E-Mail: mail@hof-university.de

                            Datenschutzbeauftragter
                            Den Datenschutzbeauftragten der Hochschule Hof erreichen Sie wie folgt:

                            Alfons-Goppel-Platz 1

                            95028 Hof

                            Fon: +49 (0) 9281 / 409 3105

                            Fax: +49 (0) 9281 / 409 55 3105

                            E-Mail: datenschutzbeauftragter@hof-university.de

                            Speicherdauer
                            Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde,
                            verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung
                            entfällt. Wenn Sie ein berechtigtes Löschersuchen geltend machen oder eine Einwilligung zur
                            Datenverarbeitung widerrufen, werden Ihre Daten gelöscht, sofern wir keine anderen rechtlich
                            zulässigen Gründe für die Speicherung Ihrer personenbezogenen Daten haben (z. B. steuer-
                            oder handelsrechtliche Aufbewahrungsfristen); im letztgenannten Fall erfolgt die Löschung
                            nach Fortfall dieser Gründe.

                            Allgemeine Hinweise zu den Rechtsgrundlagen der Datenverarbeitung auf dieser Website
                            Sofern Sie in die Datenverarbeitung eingewilligt haben, verarbeiten wir Ihre
                            personenbezogenen Daten auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO bzw. Art. 9 Abs. 2 lit.
                            a DSGVO, sofern besondere Datenkategorien nach Art. 9 Abs. 1 DSGVO verarbeitet werden. Im
                            Falle einer ausdrücklichen Einwilligung in die Übertragung personenbezogener Daten in
                            Drittstaaten erfolgt die Datenverarbeitung außerdem auf Grundlage von Art. 49 Abs. 1 lit. a
                            DSGVO. Sofern Sie in die Speicherung von Cookies oder in den Zugriff auf Informationen in
                            Ihr Endgerät (z. B. via Device-Fingerprinting) eingewilligt haben, erfolgt die
                            Datenverarbeitung zusätzlich auf Grundlage von § 25 Abs. 1 TTDSG. Die Einwilligung ist
                            jederzeit widerrufbar. Sind Ihre Daten zur Vertragserfüllung oder zur Durchführung
                            vorvertraglicher Maßnahmen erforderlich, verarbeiten wir Ihre Daten auf Grundlage des Art. 6
                            Abs. 1 lit. b DSGVO. Des Weiteren verarbeiten wir Ihre Daten, sofern diese zur Erfüllung
                            einer rechtlichen Verpflichtung erforderlich sind auf Grundlage von Art. 6 Abs. 1 lit. c
                            DSGVO. Die Datenverarbeitung kann ferner zur Erfüllung unserer Aufgaben als öffentliche
                            Stelle aufgrund des Art. 4 BayDSG i.V.m. Art. 6 Abs. 1 UAbs. 1 lit. e DSGVO (Erfüllung
                            originärer Hochschulaufgaben gem. Art. 2 BayHSchG) erfolgen. Zweck der Verarbeitung ist die
                            Erfüllung der uns vom Gesetzgeber zugewiesenen öffentlichen Aufgaben, insbesondere der
                            Information der Öffentlichkeit über unsere Tätigkeiten, auch indem wir online Leistungen
                            anbieten.. Über die jeweils im Einzelfall einschlägigen Rechtsgrundlagen wird in den
                            folgenden Absätzen dieser Datenschutzerklärung informiert.

                            Hinweis zur Datenweitergabe in die USA und sonstige Drittstaaten
                            Wir verwenden unter anderem Tools von Unternehmen mit Sitz in den USA oder sonstigen
                            datenschutzrechtlich nicht sicheren Drittstaaten. Wenn diese Tools aktiv sind, können Ihre
                            personenbezogene Daten in diese Drittstaaten übertragen und dort verarbeitet werden. Wir
                            weisen darauf hin, dass in diesen Ländern kein mit der EU vergleichbares Datenschutzniveau
                            garantiert werden kann. Beispielsweise sind US-Unternehmen dazu verpflichtet,
                            personenbezogene Daten an Sicherheitsbehörden herauszugeben, ohne dass Sie als Betroffener
                            hiergegen gerichtlich vorgehen könnten. Es kann daher nicht ausgeschlossen werden, dass
                            US-Behörden (z. B. Geheimdienste) Ihre auf US-Servern befindlichen Daten zu
                            Überwachungszwecken verarbeiten, auswerten und dauerhaft speichern. Wir haben auf diese
                            Verarbeitungstätigkeiten keinen Einfluss.

                            Widerruf Ihrer Einwilligung zur Datenverarbeitung
                            Viele Datenverarbeitungsvorgänge sind nur mit Ihrer ausdrücklichen Einwilligung möglich. Sie
                            können eine bereits erteilte Einwilligung jederzeit widerrufen. Die Rechtmäßigkeit der bis
                            zum Widerruf erfolgten Datenverarbeitung bleibt vom Widerruf unberührt.

                            Widerspruchsrecht gegen die Datenerhebung in besonderen Fällen sowie gegen Direktwerbung
                            (Art. 21 DSGVO)
                            WENN DIE DATENVERARBEITUNG AUF GRUNDLAGE VON ART. 6 ABS. 1 LIT. E ODER F DSGVO ERFOLGT,
                            HABEN SIE JEDERZEIT DAS RECHT, AUS GRÜNDEN, DIE SICH AUS IHRER BESONDEREN SITUATION ERGEBEN,
                            GEGEN DIE VERARBEITUNG IHRER PERSONENBEZOGENEN DATEN WIDERSPRUCH EINZULEGEN; DIES GILT AUCH
                            FÜR EIN AUF DIESE BESTIMMUNGEN GESTÜTZTES PROFILING. DIE JEWEILIGE RECHTSGRUNDLAGE, AUF
                            DENEN EINE VERARBEITUNG BERUHT, ENTNEHMEN SIE DIESER DATENSCHUTZERKLÄRUNG. WENN SIE
                            WIDERSPRUCH EINLEGEN, WERDEN WIR IHRE BETROFFENEN PERSONENBEZOGENEN DATEN NICHT MEHR
                            VERARBEITEN, ES SEI DENN, WIR KÖNNEN ZWINGENDE SCHUTZWÜRDIGE GRÜNDE FÜR DIE VERARBEITUNG
                            NACHWEISEN, DIE IHRE INTERESSEN, RECHTE UND FREIHEITEN ÜBERWIEGEN ODER DIE VERARBEITUNG
                            DIENT DER GELTENDMACHUNG, AUSÜBUNG ODER VERTEIDIGUNG VON RECHTSANSPRÜCHEN (WIDERSPRUCH NACH
                            ART. 21 ABS. 1 DSGVO).

                            WERDEN IHRE PERSONENBEZOGENEN DATEN VERARBEITET, UM DIREKTWERBUNG ZU BETREIBEN, SO HABEN SIE
                            DAS RECHT, JEDERZEIT WIDERSPRUCH GEGEN DIE VERARBEITUNG SIE BETREFFENDER PERSONENBEZOGENER
                            DATEN ZUM ZWECKE DERARTIGER WERBUNG EINZULEGEN; DIES GILT AUCH FÜR DAS PROFILING, SOWEIT ES
                            MIT SOLCHER DIREKTWERBUNG IN VERBINDUNG STEHT. WENN SIE WIDERSPRECHEN, WERDEN IHRE
                            PERSONENBEZOGENEN DATEN ANSCHLIESSEND NICHT MEHR ZUM ZWECKE DER DIREKTWERBUNG VERWENDET
                            (WIDERSPRUCH NACH ART. 21 ABS. 2 DSGVO).

                            Beschwerde­recht bei der zuständigen Aufsichts­behörde

                            Im Falle von Verstößen gegen die DSGVO steht den Betroffenen ein Beschwerderecht bei einer
                            Aufsichtsbehörde, insbesondere in dem Mitgliedstaat ihres gewöhnlichen Aufenthalts, ihres
                            Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes zu. Das Beschwerderecht besteht
                            unbeschadet anderweitiger verwaltungsrechtlicher oder gerichtlicher Rechtsbehelfe.

                            Gemäß Art. 51 Absatz 1 DS-GVO in Verbindung mit Art. 15 Absatz 1 Satz 1 BayDSG stellt
                            insbesondere der Bayerische Landesbeauftragte für den Datenschutz eine zuständige
                            Aufsichtsbehörde dar.

                            Diese Aufsichtsbehörde erreichen Sie wie folgt:

                            Postanschrift: Postfach 22 12 19, 80502 München
                            Dienstgebäude: Wagmüllerstraße 18, 80538 München
                            Fon: +49 (0) 89 / 21 26 72 0
                            Fax: +49 (0) 89 / 21 26 72 50
                            E-Mail: poststelle@datenschutz-bayern.de

                            Recht auf Daten­übertrag­barkeit
                            Sie haben das Recht, Daten, die wir auf Grundlage Ihrer Einwilligung oder in Erfüllung eines
                            Vertrags automatisiert verarbeiten, an sich oder an einen Dritten in einem gängigen,
                            maschinenlesbaren Format aushändigen zu lassen. Sofern Sie die direkte Übertragung der Daten
                            an einen anderen Verantwortlichen verlangen, erfolgt dies nur, soweit es technisch machbar
                            ist.

                            Auskunft, Löschung und Berichtigung
                            Sie haben im Rahmen der geltenden gesetzlichen Bestimmungen jederzeit das Recht auf
                            unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und
                            Empfänger und den Zweck der Datenverarbeitung und ggf. ein Recht auf Berichtigung oder
                            Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten
                            können Sie sich jederzeit an uns wenden.

                            Recht auf Einschränkung der Verarbeitung
                            Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu
                            verlangen. Hierzu können Sie sich jederzeit an uns wenden. Das Recht auf Einschränkung der
                            Verarbeitung besteht in folgenden Fällen:

                            Wenn Sie die Richtigkeit Ihrer bei uns gespeicherten personenbezogenen Daten bestreiten,
                            benötigen wir in der Regel Zeit, um dies zu überprüfen. Für die Dauer der Prüfung haben Sie
                            das Recht, die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
                            Wenn die Verarbeitung Ihrer personenbezogenen Daten unrechtmäßig geschah/geschieht, können
                            Sie statt der Löschung die Einschränkung der Datenverarbeitung verlangen.
                            Wenn wir Ihre personenbezogenen Daten nicht mehr benötigen, Sie sie jedoch zur Ausübung,
                            Verteidigung oder Geltendmachung von Rechtsansprüchen benötigen, haben Sie das Recht, statt
                            der Löschung die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen.
                            Wenn Sie einen Widerspruch nach Art. 21 Abs. 1 DSGVO eingelegt haben, muss eine Abwägung
                            zwischen Ihren und unseren Interessen vorgenommen werden. Solange noch nicht feststeht,
                            wessen Interessen überwiegen, haben Sie das Recht, die Einschränkung der Verarbeitung Ihrer
                            personenbezogenen Daten zu verlangen.
                            Wenn Sie die Verarbeitung Ihrer personenbezogenen Daten eingeschränkt haben, dürfen diese
                            Daten – von ihrer Speicherung abgesehen – nur mit Ihrer Einwilligung oder zur
                            Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen oder zum Schutz der Rechte
                            einer anderen natürlichen oder juristischen Person oder aus Gründen eines wichtigen
                            öffentlichen Interesses der Europäischen Union oder eines Mitgliedstaats verarbeitet werden.

                            SSL- bzw. TLS-Verschlüsselung
                            Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher
                            Inhalte, wie zum Beispiel Bestellungen oder Anfragen, die Sie an uns als Seitenbetreiber
                            senden, eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
                            daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und an dem
                            Schloss-Symbol in Ihrer Browserzeile.

                            Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns
                            übermitteln, nicht von Dritten mitgelesen werden.

                            4. Datenerfassung auf dieser Website
                            I. Cookies
                            Unsere Internetseiten verwenden so genannte „Cookies“. Cookies sind kleine Datenpakete und
                            richten auf Ihrem Endgerät keinen Schaden an. Sie können personenbezogene Daten enthalten.
                            Sie werden entweder vorübergehend für die Dauer einer Sitzung (Session-Cookies) oder
                            dauerhaft (permanente Cookies) auf Ihrem Endgerät gespeichert. Session-Cookies werden nach
                            Ende Ihres Besuchs automatisch gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät
                            gespeichert, bis Sie diese selbst löschen oder eine automatische Löschung durch Ihren
                            Webbrowser erfolgt.

                            Teilweise können auch Cookies von Drittunternehmen auf Ihrem Endgerät gespeichert werden,
                            wenn Sie unsere Seite betreten (Third-Party-Cookies). Diese ermöglichen uns oder Ihnen die
                            Nutzung bestimmter Dienstleistungen des Drittunternehmens (z. B. Cookies zur Abwicklung von
                            Zahlungsdienstleistungen).

                            Cookies haben verschiedene Funktionen. Zahlreiche Cookies sind technisch notwendig, da
                            bestimmte Websitefunktionen ohne diese nicht funktionieren würden (z. B. die
                            Warenkorbfunktion oder die Anzeige von Videos). Andere Cookies dienen dazu, das
                            Nutzerverhalten auszuwerten oder Werbung anzuzeigen.

                            Wir informieren Sie über Ihre mittels Cookies gegebenfalls verarbeiteten personenbezogenen
                            Daten in unserem Consent-Management-Tool. Sie erhalten im Consent-Management- Tool
                            insbesondere Angaben über die Empfänger Ihrer personenbezogenen Daten, die Zwecke einer
                            solchen Verarbeitung, Rechtsgrundlage und Speicherdauer. Entsprechendes gilt für ähnliche
                            Technologien. In Hinblick auf die Cookies der Usercentrics verweisen wir auf die Angaben
                            weiter unten in dieser Datenschutzerklärung („Einwilligung mit Usercentrics“) und der
                            Angaben im Consent-Management-Tool selbst.

                            Cookies, die zur Durchführung des elektronischen Kommunikationsvorgangs, zur Bereitstellung
                            bestimmter, von Ihnen erwünschter Funktionen (z. B. für die Warenkorbfunktion) oder zur
                            Optimierung der Website (z. B. Cookies zur Messung des Webpublikums) erforderlich sind
                            (notwendige Cookies), werden grundsätzlich zur Erfüllung unserer Aufgaben als öffentliche
                            Stelle aufgrund des Art. 4 Abs. 1 BayDSG i.V.m. Art. 6 Abs. 1 UAbs. 1 lit. e DSGVO
                            (Erfüllung originärer Hochschulaufgaben gem. Art. 2 BayHSchG) gespeichert.. Der
                            Websitebetreiber hat ein berechtigtes Interesse an der Speicherung von notwendigen Cookies
                            zur technisch fehlerfreien und optimierten Bereitstellung seiner Dienste. Sofern eine
                            Einwilligung zur Speicherung von Cookies und vergleichbaren Wiedererkennungstechnologien
                            abgefragt wurde, erfolgt die Verarbeitung ausschließlich auf Grundlage dieser Einwilligung
                            (Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TTDSG); die Einwilligung ist jederzeit
                            widerrufbar.

                            Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert
                            werden und Cookies nur im Einzelfall erlauben, die Annahme von Cookies für bestimmte Fälle
                            oder generell ausschließen sowie das automatische Löschen der Cookies beim Schließen des
                            Browsers aktivieren. Bei der Deaktivierung von Cookies kann die Funktionalität dieser
                            Website eingeschränkt sein.

                            Soweit Cookies von Drittunternehmen oder zu Analysezwecken eingesetzt werden, werden wir Sie
                            hierüber im Rahmen dieser Datenschutzerklärung bzw. im Consent-Management-Tool gesondert
                            informieren und ggf. eine Einwilligung abfragen.

                            Einwilligung mit Usercentrics
                            Diese Website nutzt die Consent-Technologie von Usercentrics, um Ihre Einwilligung zur
                            Speicherung bestimmter Cookies auf Ihrem Endgerät oder zum Einsatz bestimmter Technologien
                            einzuholen und diese datenschutzkonform zu dokumentieren. Anbieter dieser Technologie ist
                            die Usercentrics GmbH, Sendlinger Straße 7, 80331 München, Website:
                            https://usercentrics.com/de/ (im Folgenden „Usercentrics“).

                            Wenn Sie unsere Website betreten, werden folgende personenbezogene Daten an Usercentrics
                            übertragen:

                            Ihre Einwilligung(en) bzw. der Widerruf Ihrer Einwilligung(en)
                            Ihre IP-Adresse
                            Informationen über Ihren Browser
                            Informationen über Ihr Endgerät
                            Zeitpunkt Ihres Besuchs auf der Website
                            Des Weiteren speichert Usercentrics ein Cookie in Ihrem Browser, um Ihnen die erteilten
                            Einwilligungen bzw. deren Widerruf zuordnen zu können.

                            Über weitere Empfänger Ihrer personenbezogenen Daten, Rechtsgrundlage, Zwecke und
                            Speicherdauer der Verarbeitungstätigkeit informieren wir Sie über das vorgenannte
                            Consent-Management-Tool.

                            II. Besuch unserer Webseiten der Webplattform und der Webplattformdienste
                            Bereitstellung der Webseiten und Erstellung von Logfiles
                            A. Beschreibung und Umfang der Datenverarbeitung
                            Wenn Sie unsere Webseite aufrufen, übermittelt Ihr Webbrowser folgende Daten an unserer
                            Internetserver:

                            1. IP-Adresse des anfragenden Rechners

                            2. Datum und Uhrzeit des Zugriffs

                            3. Name, URL und übertragene Datenmenge der abgerufenen Datei

                            4. Zugriffsstatus (beispielsweise "angeforderte Datei übertragen" oder "angeforderte Datei
                            nicht gefunden")

                            5. Erkennungsdaten des versendeten Browsers (Browsertyp und Browserversion) - und
                            Betriebssystems (sofern vom anfragenden Webbrowser übermittelt)

                            6. Hostname des zugreifenden Rechners

                            7. Webseite, von der aus der Zugriff erfolgte (sofern vom anfragenden Webbrowser
                            übermittelt)

                            Die IP-Adresse wird hierbei anonym gespeichert. Hierzu werden die letzten ein bis drei
                            Ziffern der IP-Adresse entfernt. Die Daten werden ebenfalls in den Logfiles unseres Systems
                            gespeichert. Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht
                            vorgenommen.

                            B. Zweck
                            Die Speicherung der IP-Adresse durch das System ist notwendig, um eine Auslieferung der
                            Webseite an Ihren Rechner zu ermöglichen.

                            Die Speicherung in Logfiles dient dazu, die Funktionsfähigkeit der Webseite und die
                            Sicherheit unserer informationstechnischen Systeme sicherzustellen sowie unsere Webseite
                            technisch zu optimieren.

                            C. Kategorien von Empfängern
                            Empfänger der oben genannten Daten und Informationen sind an der Hochschule Hof tätige
                            Beamte und Arbeitnehmer des Freistaats Bayern.

                            Außerdem können auch unsere IT-Dienstleister und deren Mitarbeiter im Rahmen der von uns
                            abgeschlossenen Verträge zur Auftragsverarbeitung Empfänger Ihrer Daten und Informationen
                            sein.

                            D. Rechtsgrundlage
                            Rechtsgrundlage für die Datenverarbeitung ist Art. 4 BayDSG i.V.m. Art. 6 Abs. 1 Unterabs. 1
                            lit. e DSGVO (Erfüllung originärer Hochschulaufgaben gem. Art. 2 BayHSchG). Zweck der
                            Verarbeitung ist die Erfüllung der uns vom Gesetzgeber zugewiesenen öffentlichen Aufgaben,
                            indem wir online Leistungen anbieten und die Öffentlichkeit über unsere Tätigkeit
                            informieren und das damit einhergehende Sicherheitsinteresse und die Erforderlichkeit einer
                            störungsfreien Bereitstellung unserer Webseite.

                            E. Speicherdauer
                            Die Daten werden gelöscht, sobald sie für die Erreichung des Zwecks nicht mehr erforderlich
                            sind. Im Falle der Erfassung der Daten zur Bereitstellung der Webseite ist dies der Fall,
                            wenn die jeweilige Sitzung beendet ist.

                            Die anonymisierten IP-Adressen werden 60 Tage gespeichert.
                            Die Logfiles werden zentral gespeichert und nach 7 Tagen gelöscht.

                            F. Widerspruchs- und Beseitigungsmöglichkeit
                            Zur Bereitstellung und den Betrieb der Webseite ist die Erfassung der Daten und die
                            Speicherung der Daten in Logfiles unabdingbar. Es besteht folglich durch Sie keine
                            Widerspruchsmöglichkeit.

                            III. Registrierung als Nutzer auf unserer Webseite
                            A. Beschreibung und Umfang der Datenverarbeitung
                            Auf unserer Webseite www.digital-lotse-wasser.org haben wir ein Registrierungsformular für
                            die elektronische, kostenfreie Registrierung von Nutzern vorgesehen.

                            Somit können Sie sich auf unserer Webseite registrieren lassen, um später Ihre Inhalte zu
                            Ihrer Lösung oder zu Ihrem Projekt zur Digitalisierung in der Wasserwirtschaft bei uns
                            einzureichen (siehe nächster Punkt „Lösungs- bzw. Projekteinreichung“). Pflichtfelder im
                            Registrierungsformular sind als solche dort mittels * (Sternchen) gekennzeichnet.

                            Im Rahmen der Registrierung erheben wir folgende Daten:

                            1. Name (Vor- und Nachname)

                            2. dienstliche E-Mail-Adresse

                            3. dienstliche Adresse (Postleitzahl, Ort, Straße, Hausnummer)

                            4. dienstliche Telefonnummer

                            5. Angabe, ob zugleich Funktion als Kontaktperson

                            6. Zugehörigkeit zum welchem Unternehmen oder Organisation sowie Unternehmens - oder
                            Organisationstyp

                            7. Anschrift des Unternehmens oder der Organisation (Land, Bundesland, Postleitzahl, Ort,
                            Straße)

                            8. allgemeine Funktions-E-Mail-Adresse des Unternehmens oder der Organisation

                            9. Webseite des Unternehmens oder der Organisation

                            10. Kurzbeschreibung des Unternehmens oder Organisation (z.B. Arbeitsbereich bzw. Branche in
                            der Wasserwirtschaft)

                            Für die Registrierungsanmeldung verwenden wir das sog. Double Opt-in-Verfahren.

                            Nach Ihrer Registrierung erhalten Sie per E-Mail eine Registrierungsbenachrichtigung. Diese
                            müssen Sie bestätigen, um die Registrierung erfolgreich abzuschließen. Dies dient dem
                            Nachweis, dass die Registrierung tatsächlich von Ihnen kommt.

                            B. Zweck
                            Die Verarbeitung der Daten nach Ziff. 1-10 erfolgt, um Sie als registrierter Nutzer zu
                            identifizieren. Durch den Zugang zu einem eigenen Nutzerkonto können Sie bestimmte Inhalte
                            unserer Webseite nutzen. Über Ihr Nutzerkonto können Sie nach erfolgreicher Registrierung
                            die Plattform vollständig nutzen und Ihre Projekte zur Digitalisierung in der
                            Wasserwirtschaft in einem späteren Schritt (siehe nächster Punkt unter „Lösungs-
                            bzw.Projekteinreichung“) einreichen.

                            Die Verarbeitung der Daten nach Ziff. 1-10 erfolgt zudem für eine eventuelle, erforderliche
                            Kontaktaufnahme/Kommunikation zwischen Ihnen und uns.

                            Die Verarbeitung der Daten nach Ziff. 1-5 erfolgt ferner, um die Daten auf unserer Webseite
                            zu einer besseren Kontaktaufnahme mit Externen zu veröffentlichen, sofern Sie mittels
                            Setzens eines Häkchens im Registrierungsformular gesondert in eine Veröffentlichung
                            eingewilligt haben und zugleich Kontaktperson für die jeweilige digitale Lösung oder das
                            Projekt in Ihrem Unternehmen oder Organisation sind.

                            Daneben verarbeiten wir die Daten nach Ziff. 6-10 zu dem Zweck, um darüber Kenntnis zu
                            haben, welches Unternehmen oder welche Organisation die Angebote unsere Webseite nutzen
                            will.

                            C. Kategorien von Empfängern
                            Empfänger der oben genannten Daten und Informationen sind an der Hochschule Hof tätige
                            Beamte und Arbeitnehmer des Freistaats Bayern.

                            Außerdem können auch unsere IT-Dienstleister und deren Mitarbeiter im Rahmen der von uns
                            abgeschlossenen Verträge zur Auftragsverarbeitung Empfänger Ihrer Daten und Informationen
                            sein.

                            Sofern Sie in die Veröffentlichung Ihrer Daten nach Ziff. 1-5 mittels Setzens eines Häkchens
                            gesondert im Registrierungsformular eingewilligt haben, ist darüber hinaus jeder Empfänger,
                            der auf unsere Internetseite zugreifen kann. Diese Daten werden ggf. weltweit verbreitet,
                            insbesondere durch Veröffentlichungen in frei zugänglichen Bereichen des Internets.

                            D. Rechtsgrundlage
                            Für die Verarbeitung der Daten wird im Rahmen des Registrierungsvorgangs Ihre Einwilligung
                            eingeholt und auf diese Datenschutzerklärung verwiesen.

                            Rechtsgrundlage für die Verarbeitung der Daten nach Ziff. 1-10 ist bei Vorliegen Ihrer
                            Einwilligung Art. 6 Abs. 1 lit. a) DSGVO.

                            Die Einwilligung zur Registrierung wird durch ein Double Opt-In-Verfahren abgesichert
                            (s.o.). D.h. Sie willigen in einem ersten Schritt in die Registrierung ein. In einem zweiten
                            Schritt bestätigen Sie durch Anklicken des Registrierungslinks die Registrierung und
                            schließen somit die Registrierung erfolgreich ab.

                            Sofern Sie in die Veröffentlichung der Daten nach Ziff. 1-5 gesondert eingewilligt haben,
                            ist die Rechtsgrundlage Art. 6 Abs. 1 lit. a) DSGVO i.V.m. Art 49 Abs. 1 Unterabs. 1 lit. a)
                            DSGVO.

                            E. Speicherdauer
                            Eine Löschung ist derzeit nicht vorgesehen.

                            F. Widerspruchs- und Beseitigungsmöglichkeiten
                            Ihre Einwilligung ist freiwillig. Sie kann ohne Weiteres verweigert als auch widerrufen
                            werden. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der
                            Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.

                            Sie können ohne Weiteres Ihre Registrierung auflösen.

                            Sofern Sie keine Registrierung wünschen, benutzen Sie bitte den Button „Registrierung
                            ablehnen“. Dieser wird Ihnen mit unserer Registrierungsbenachrichtigung zugeschickt.

                            Sofern Sie die Registrierung bereits bestätigt haben, können die von Ihnen eingetragenen
                            Daten gelöscht werden, indem Sie die Löschung unter der E-Mail-Adresse
                            diginax.portal@hof-university.de anzeigen; bitte nehmen Sie hierzu Kontakt mit
                            diginax.portal(at)hof-university.de auf. Auf Ihren Antrag hin können dann Ihre Daten
                            gelöscht werden.

                            Änderungen Ihrer Daten sind ebenfalls durch Ihren Antrag an
                            diginax.portal(at)hof-university.de möglich.

                            In vielen Ländern der Welt besteht kein vergleichbares Datenschutzniveau wie in der
                            Europäischen Union. Dies kann insbesondere dazu führen, dass im Internet veröffentlichte
                            Informationen, sogar nachdem sie auf der Ursprungsseite gelöscht wurden, noch anderenorts
                            aufzufinden sind und die betroffene Person dagegen keine wirksamen Maßnahmen ergreifen kann.
                            Diese Defizite werden vorliegend nicht durch Garantien im Sinne des Artikels 46 DSGVO
                            kompensiert.

                            IV. „Lösungs- bzw. Projekteinreichung“
                            A. Beschreibung und Umfang der Datenverarbeitung
                            Nach der erfolgreichen Registrierung steht es Ihnen als registrierter Nutzer frei, Ihre
                            Lösung oder Ihr Projekt zur Digitalisierung in der Wasserwirtschaft bei uns einzureichen.
                            Pflichtfelder im Lösungs- bzw. Projektformular sind als solche dort mittels * (Sternchen)
                            gekennzeichnet.

                            Im Rahmen der Projekteinreichung erheben wir in diesem Lösungs- und Projektformular folgende
                            Daten:

                            1. Name der Kontaktperson, der als Ansprechpartner für die digitalen Lösung bzw. dem Projekt
                            im Unternehmen oder in der Organisation zuständig ist

                            2. dienstliche E-Mail-Adresse der Kontaktperson

                            3. dienstliche Telefonnummer der Kontaktperson

                            4. dienstliche Adresse der Kontaktperson

                            5. Webseite der Forschungsgruppe, die der Kontaktperson angehört (soweit einschlägig)

                            6. Projektlogo (soweit einschlägig)

                            7. Zugehörigkeit zum welchem Unternehmen oder Organisation sowie Unternehmens - oder
                            Organisationstyp

                            8. Anschrift des Unternehmens oder der Organisation (Land, Bundesland, Postleitzahl, Ort,
                            Straße)

                            9. Logo des Unternehmens bzw. der Organisation

                            10. Beschreibung der digitalen Lösung bzw. des Projektes

                            11. Koordinaten bzgl. dem Sitz des Unternehmens oder der Organisation, dem Sie angehören

                            B. Zweck
                            Die Verarbeitung der Daten nach Ziff. 1-11 dient dazu, diese auf den Webseiten unserer
                            Plattform zu veröffentlichen, um auf Projekte und Lösungen bei der Digitalisierung der
                            Wasserwirtschaft aufmerksam zu machen. Dies soll dazu beitragen, dass Interessierte
                            Hilfestellungen in der Auswahl- und Umsetzungsphase von Digitalisierungsprojekten im Bereich
                            der Wasserwirtschaft erhalten.

                            Darüber hinaus dient die Verarbeitung der Daten nach Ziff. 1-11 dazu, dass eine Übersicht zu
                            digitalen Lösungen in der Wasserwirtschaft im deutschsprachigen Raum geschaffen wird. Dies
                            soll auch geografisch durch Verwendung Ihrer Koordinaten auf einer Deutschland-Karte
                            abgebildet werden.

                            Die gemäß den Ziff. 1-11 erhobenen Daten werden auch für die statistische Auswertung für den
                            Jahresbericht (jährlicher Statusreport) über den Stand der Digitalisierungschancen in der
                            Wasserwirtschaft verwendet. Dieser jährliche Statusreport wird auf unserer Internetseite
                            sowie in Forschung und Lehre durch uns vorgestellt.

                            Ferner dient die Verarbeitung der Daten nach Ziff. 1-4 dazu, dass wir und Externe direkten
                            Kontakt mit den jeweiligen Ansprechpartnern des jeweiligen Unternehmens oder der
                            Organisation aufnehmen und somit unmittelbar in Austausch mit den Ansprechpartnern treten
                            können.

                            C. Kategorien von Empfängern
                            Empfänger der oben genannten Daten und Informationen sind an der Hochschule Hof tätige
                            Beamte und Arbeitnehmer des Freistaats Bayern.

                            Außerdem können auch unsere IT-Dienstleister und deren Mitarbeiter im Rahmen der von uns
                            abgeschlossenen Verträge zur Auftragsverarbeitung Empfänger Ihrer Daten und Informationen
                            sein.

                            Empfänger der Daten ist darüber hinaus jeder, der auf die Webseiten der Plattform und der
                            Plattformdienste zugreift. Die Daten werden ggf. weltweit verbreitet, insbesondere durch
                            Veröffentlichung in frei zugänglichen Bereichen des Internets.

                            D. Rechtsgrundlage
                            Für die Verarbeitung der Daten wird im Rahmen der Eingabe in das Lösungs- und
                            Projektformulars Ihre Einwilligung eingeholt und auf diese Datenschutzerklärung verwiesen.

                            Rechtsgrundlage für die Verarbeitung der Daten ist bei Vorliegen Ihrer Einwilligung Art. 6
                            Abs. 1 lit. a DSGVO i.V.m. Art. 49 Abs. 1 Unterabs. 1 lit. a DSGVO.

                            E. Speicherdauer
                            Eine Löschung ist derzeit nicht vorgesehen.

                            F. Widerspruchs- und Beseitigungsmöglichkeiten
                            Ihre Einwilligung ist freiwillig. Sie kann ohne Weiteres verweigert als auch widerrufen
                            werden. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit der aufgrund der
                            Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.

                            Nach bereits erfolgreich abgeschlossener Eingabe der Daten in das Lösungs- bzw.
                            Projektformular können diese gelöscht werden, indem Sie die Löschung unter der
                            E-Mail-Adresse diginax.portal@hof-university.de beantragen. Auf Ihren Antrag hin können die
                            Daten dann gelöscht werden.

                            Die Daten, die bereits in den jährlichen Statusreport aufgenommen wurden, können nicht
                            gelöscht werden. Sie werden allerdings bei dem darauffolgendem Statusreport nicht mehr
                            verwendet.

                            Änderungen Ihrer Daten sind ebenfalls durch Ihren Antrag an diginax.portal@hof-university.de
                            möglich.

                            In vielen Ländern der Welt besteht kein vergleichbares Datenschutzniveau wie in der
                            Europäischen Union. Dies kann insbesondere dazu führen, dass im Internet veröffentlichte
                            Informationen, sogar nachdem sie auf der Ursprungsseite gelöscht wurden, noch anderenorts
                            aufzufinden sind und die betroffene Person dagegen keine wirksamen Maßnahmen ergreifen kann.
                            Diese Defizite werden vorliegend nicht durch Garantien im Sinne des Artikels 46 DSGVO
                            kompensiert.

                            V. Online-Umfrage
                            A. Beschreibung und Umfang der Datenverarbeitung
                            Sehr gerne würden wir eine laufende Online-Umfrage auf unserer Webseite mit Ihnen
                            durchführen. Die Umfrage untersucht praktikable Lösungen bzw. Erfahrungen in Bezug auf die
                            Digitalisierung in der Wasserwirtschaft. Wir möchten das Meinungsbild von Personen erfassen,
                            die im Bereich der Wasserwirtschaft bereits Erfahrungen mit digitalen Lösungen oder
                            Projekten gesammelt haben oder in diesem Bereich erst noch tätig werden wollen.

                            Die Teilnahme an der Umfrage und die Beantwortung der Fragen ist freiwillig. An der
                            Online-Umfrage können alle Internetnutzer teilnehmen. Für diese Online-Umfrage ist keine
                            Registrierung oder Ähnliches notwendig.

                            1. Im Rahmen der Umfrage erfassen wir Ihre Antworten auf die einzelnen Fragen. Wir erfassen
                            von Ihnen keine E-Mail-Adressen und/oder Ihren Namen. Allerdings kann nicht ausgeschlossen
                            werden, dass über die Kombination Ihrer Antworten eine Personenbeziehbarkeit hergestellt
                            werden kann.

                            Die Befragung besteht aus drei Teilen: A. Allgemeine Daten; B. Fragen zur Analyse des
                            aktuellen Stands der Digitalisierung im Wassersektor, wichtige Erfolgsfaktoren und
                            Hindernisse; C. Fragen zu Weiterbildungen mit dem Schwerpunkt Digitalisierung.

                            Ihre Daten werden anschließend in Kategorien zusammengefasst. Die Auswertung der Daten
                            bezieht sich daher nur auf kumulierte Werte (z.B. 27 % der Teilnehmer haben bei Frage X
                            Antwort a. gewählt).

                            Aufgrund der von Ihnen zur Verfügung gestellten Daten erstellen wir eine Auswertung. Diese
                            Auswertung ist anonym und enthält keinen Bezug zu Ihrer Person.

                            Soweit im Rahmen der Befragung in durch uns nicht beabsichtigten Fällen von den
                            Umfrage-Teilnehmern in Freitextfeldern personenbezogene Daten eingegeben werden, werden
                            diese durch uns anonymisiert und datenschutzkonform gelöscht.

                            2. Im Rahmen der technischen Abwicklung der Online-Umfrage werden technisch bedingt
                            bestimmte Daten erfasst.

                            Hierbei werden Ihre Geräte- und Browserdaten (Version des Betriebssystems, Internetprovider,
                            Gerätetyp, Informationen zu dem System und der Leistung sowie der Browsertyp, auf der
                            Webseite angezeigten Dateien, wie HTML-Seiten, Grafiken usw.), sowie Datum und Uhrzeit des
                            Abrufs erfasst. Ferner können vorgenommene Spracheinstellungen sowie die Webseite, vom dem
                            aus der Zugriff auf die Online-Umfrage erfolgte, erfasst werden.

                            Diese Informationen werden standardmäßig in einer Log-Datei (Logfiles) erfasst.
                            Ferner können diesbezüglich Cookies gespeichert werden.
                            Wir haben eine Einstellung vorgenommen, dass Ihre IP-Adresse bei der Durchführung der
                            Online-Umfrage nicht gespeichert wird.

                            B. Zweck
                            Mit den Daten aus dem Online-Fragebogen (Frage + zugehörige Antwort) möchten wir den
                            aktuellen Stand der Digitalisierung im Wassersektor analysieren und die wichtigsten
                            Erfolgsfaktoren und Hindernisse sowie ein Konzept „Kosten-Nutzen-Analyse“ identifizieren.

                            Darüber hinaus wollen wir auf Basis dieser Daten im Online-Fragebogen ein
                            Weiterbildungskonzept mit dem Schwerpunkt Digitalisierung im Wassersektor perspektivisch
                            entwickeln.

                            Es ist beabsichtigt, die anonyme Auswertung der Daten aus dem Online-Fragebogen zu
                            veröffentlichen, sowohl im Internet als auch in Papierform und in der Lehre und Wissenschaft
                            einzusetzen.

                            Die Veröffentlichung hat den Zweck, die Forschungstätigkeiten der Hochschule Hof einem
                            breiten Publikum vorzustellen. Insbesondere durch einen jährlichen Bericht über die
                            Digitalisierung der Wasserwirtschaft sollen die Forschungstätigkeiten der Hochschule Hof der
                            breiteren Öffentlichkeit vorgestellt werden.

                            Sollten in den Freigabetexten des Online-Fragebogens von Ihnen personenbezogenen Daten
                            eingegeben werden, werden wir diese löschen, damit Ihre Antworten keinen direkten
                            Personenbezug aufweisen.

                            Die Speicherung Ihrer Geräte und Browser- sowie Datum und Uhrzeit des Abrufs dient dazu,
                            eine Auslieferung der Webseite an Ihren Rechner zu ermöglichen sowie die Funktionsfähigkeit
                            und Sicherheit der Webseite sicherzustellen. Die vorgenommene Spracheinstellungen sowie die
                            Webseite, vom dem aus der Zugriff auf die Online-Umfrage erfolgte, werden erfasst, um die
                            Webseite zu verbessern.

                            Die Speicherung in Logfiles erfolgt, um die Funktionsfähigkeit der Webseite sicherzustellen.
                            Zudem dient die Speicherung in Logfiles der Optimierung unserer Webseite und der
                            Sicherstellung der Sicherheit unserer informationstechnischen Systeme.

                            Die Speicherung von Cookies erfolgt, um den Umfrageservice uneingeschränkt bedienbar zu
                            machen.

                            C. Kategorien von Empfängern
                            Empfänger der oben genannten Daten und Informationen sind an der Hochschule Hof tätige
                            Beamte und Arbeitnehmer des Freistaats Bayern.

                            Außerdem können auch unsere IT-Dienstleister und deren Mitarbeiter im Rahmen der von uns
                            abgeschlossenen Verträge zur Auftragsverarbeitung Empfänger Ihrer Daten und Informationen
                            sein.

                            Für die Online-Umfrage nutzen wir das Tool von „UmfrageOnline“, die durch den Anbieter der
                            enuvo GmbH betrieben wird. Dies ist ein in der Schweiz ansässiges Unternehmen.

                            Mit der enuvo GmbH wurde ein Vertrag zur Auftragsverarbeitung abgeschlossen. Die enuvo GmbH
                            stellt sicher, dass die Umfrage im Internet erreichbar ist und sorgt dafür, dass die Daten
                            sicher gespeichert werden. Durch den Anbieter wird es uns ermöglicht, die Daten einzusehen
                            und zu analysieren, d.h. die Daten werden durch uns verwaltet. Der Anbieter ist nicht dazu
                            berechtigt, die Daten an Dritte zu verkaufen oder zweckentfremdet zu verwenden.

                            Derzeit existiert ein Angemessenheitsbeschluss der Europäischen Kommission nach Art. 45 Abs.
                            3 DSGVO für die Schweiz. Durch diesen Angemessenheitsbeschluss wird festgestellt, dass
                            personenbezogene Daten in einem bestimmten Drittland (oder in einem bestimmten Gebiet oder
                            Sektor) einen mit dem Europäischen Datenschutzrecht vergleichbaren adäquaten Schutz
                            genießen. Datentransfers auf der Grundlage eines Angemessenheitsbeschlusses sind folglich
                            privilegiert: Sie werden solchen innerhalb der EU gleichgestellt.

                            Empfänger der anonymen Auswertung Ihrer Daten im Rahmen einer Veröffentlichung im Internet
                            ist darüber hinaus jeder, der auf die Webseiten der Plattform und der Plattformdienste
                            zugreift. Die Daten werden ggf. weltweit verbreitet, insbesondere durch Veröffentlichung in
                            frei zugänglichen Bereichen des Internets. Sofern die Auswertung in Papierform einem
                            Publikum zur Verfügung gestellt wird, ist darüber hinaus jeder Empfänger, der zum jeweiligen
                            Publikumskreis gehört.

                            D. Rechtsgrundlage
                            Für die Verarbeitung der Daten wird vor Beginn der Online-Umfrage Ihre Einwilligung
                            eingeholt und auf diese Datenschutzerklärung verwiesen.

                            Rechtsgrundlage für die Verarbeitung der Daten nach A. Ziff. 1 ist bei Vorliegen Ihrer
                            Einwilligung Art. 6 Abs. 1 lit. a DSGVO.

                            Rechtsgrundlage für die Verarbeitung der Daten nach A. Ziff. 2 sowie der Logfiles ist Art. 4
                            Abs. 1 BayDSG i.V.m. Art. 6 Abs. 1 UA 1 lit. e DSGVO (Erfüllung originärer Hochschulaufgaben
                            gemäß Art. 2 BayHSchG).

                            E. Speicherdauer
                            Personenbezogene Daten werden gelöscht, sobald sie für den Zweck nicht mehr erforderlich
                            sind.

                            Bezüglich der Daten aus der Online-Umfrage erfolgt eine Löschung, nachdem die Daten von uns
                            ausgewertet wurden und in unsere anonyme Auswertung eingeflossen sind.

                            Für den Fall, dass im Rahmen der Befragung in durch von uns nicht beabsichtigten Fällen von
                            Ihnen in Freitextfeldern personenbezogene Daten eingegeben werden, werden diese durch uns
                            anonymisiert und datenschutzkonform gelöscht.

                            F. Widerspruchs- und Beseitigungsmöglichkeiten
                            Sie können Ihre Einwilligung in die Verarbeitung jederzeit widerrufen. Durch den Widerruf
                            wird die Rechtmäßigkeit der aufgrund der Einwilligung bis zum Widerruf erfolgten
                            Verarbeitung nicht berührt.

                            Die Datenschutzerklärung von UmfrageOnline finden Sie unter
                            www.umfrageonline.com/datenschutz.

                            VI. Newsletter
                            A. Beschreibung und Umfang der Datenverarbeitung
                            Auf unserer Webseite besteht die Möglichkeit, einen kostenfreien Newsletter zu aktuellen und
                            interessanten Themen im Bereich digitale Wasserwirtschaft zu erhalten.

                            Hierbei werden bei der Anmeldung zum Newsletter Ihre Daten aus der Eingabemaske an uns
                            übermittelt.

                            Falls Sie sich für unseren kostenlosen Newsletter anmelden, werden die von Ihnen hierzu
                            abgefragten Daten, also Ihre E-Mail-Adresse sowie – optional – Ihr Name an uns übermittelt.
                            Pflichtangabe für die Übersendung des Newsletters ist allein Ihre E-Mail-Adresse.

                            Die dabei erhobenen Daten verwenden wir ausschließlich für den Newsletter-Versand – sie
                            werden deshalb insbesondere auch nicht an Dritte weitergegeben.

                            Für die Anmeldung zum Newsletter verwenden wir das sog. Double-opt-in-Verfahren.

                            Nach Ihrer Anmeldung zum Newsletter zur Newsletter-Anmeldung erhalten Sie per E-Mail eine
                            Newsletterbenachrichtigung. Diese müssen Sie bestätigen, um den Newsletter zu empfangen.
                            Dies dient dem Nachweis, dass die Anmeldung tatsächlich von Ihnen kommt.

                            B. Zweck
                            Die Erhebung der Daten dient dazu, den Newsletter zuzustellen, um Ihnen interessante
                            Informationen zu den Themen unserer Webseite zur Verfügung zu stellen.

                            C. Rechtsgrundlage
                            Für die Verarbeitung der Daten wird beim Anmeldevorgang zum Newsletter Ihre Einwilligung
                            eingeholt und auf diese Datenschutzerklärung verwiesen.

                            Rechtsgrundlage für die Verarbeitung Ihrer E-Mailadresse ist bei Vorliegen Ihrer
                            Einwilligung Art. 6 Abs. 1 lit. a DSGVO.

                            Die Einwilligung zum Bezug des Newsletters wird durch ein Double Opt-In-Verfahren
                            abgesichert (s.o.). D.h. Sie willigen in einem ersten Schritt in die Anmeldung zum
                            Newsletter ein. In einem zweiten Schritt bestätigen Sie die den Aktivierungslink, welche Sie
                            in einer automatisch generierten E-Mail finden, die Sie separat von uns erhalten.

                            Speicherung
                            Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes nicht mehr erforderlich
                            sind. Die Daten werden daher so lange gespeichert, wie das Abonnement des Newsetters aktiv
                            ist, d.h. solange wie Sie den Newsletter erhalten wollen.

                            Widerspruchs- und Beseitigungsmöglichkeiten
                            Das Abonnement des Newsletters kann durch den betroffenen Nutzer jederzeit durch Verwendung
                            eines Abmeldelinks gekündigt werden. Diesen Abmeldelink finden Sie in jedem Newsletter von
                            uns.

                            VII. Kontaktformular
                            A. Beschreibung und Umfang der Datenschutzerklärung
                            Auf unserer Internetseite ist ein Kontaktformular, welches zur elektronischen
                            Kontaktaufnahme mit uns dient. Wenn Sie uns per Kontaktformular Anfragen zukommen lassen,
                            werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen
                            Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns
                            gespeichert. Pflichtfelder im Kontaktformular sind als solche dort mittels * (Sternchen)
                            gekennzeichnet.

                            1. Vor- und Nachname

                            2. E-Mail-Adresse

                            3. Betreff

                            4. Nachricht

                            5. Zugehörigkeit zu welchem Unternehmen

                            Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.

                            B. Zweck der Datenverarbeitung
                            Die Verarbeitung Ihrer Daten dient allein dazu, Kontakt mit Ihnen aufzunehmen.

                            Zweck der Datenverarbeitung ist es, die Kontaktanfrage zu bearbeiten und aufgrund Ihrer
                            Anfrage mit Ihnen in Kontakt zu treten.

                            C. Rechtsgrundlage
                            Für die Verarbeitung der Daten wird im Rahmen des Absendevorgangs Ihre Einwilligung
                            eingeholt und auf diese Datenschutzerklärung verwiesen.

                            Die Rechtsgrundlage für die Erhebung Ihrer Daten ist bei Vorliegen Ihrer Einwilligung Art. 6
                            Abs. 1 lit. a DSGVO.

                            D. Speicherdauer
                            Die von Ihnen im Kontaktformular eingegebenen Daten werden gelöscht, wenn die Konversation
                            mit Ihnen beendet ist, d.h. Ihr Anliegen abschließend geklärt ist. Zwingende gesetzliche
                            Bestimmungen- insbesondere gesetzliche Aufbewahrungsfristen – bleiben unberührt.

                            E. Widerspruchs- und Beseitigungsmöglichkeiten
                            Sie können jederzeit für die Zukunft Ihre Einwilligung widerrufen. Die Rechtmäßigkeit der
                            aufgrund der Einwilligung bis zum Widerruf erfolgten Datenverarbeitung wird durch diesen
                            nicht berührt. In einem solchen Fall kann die Kommunikation mit Ihnen nicht weiter
                            fortgeführt werden.

                            VIII. Anfrage per E-Mail, Telefon oder Telefax
                            A. Beschreibung und Umfang der Datenverarbeitung
                            Wenn Sie uns per E-Mail, Telefon oder Telefax kontaktieren, wird Ihre Anfrage inklusive
                            aller daraus hervorgehenden personenbezogenen Daten (Name, Anfrage, ggf. E-Mail-Adresse oder
                            Telefonnummer oder Telefaxnummer) zum Zwecke der Bearbeitung Ihres Anliegens bei uns
                            gespeichert und verarbeitet. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.

                            B. Zweck der Datenverarbeitung
                            Die Verarbeitung Ihrer Daten dient allein dazu, Kontakt mit Ihnen aufzunehmen.

                            Zweck der Datenverarbeitung ist es, die Kontaktanfrage zu bearbeiten und aufgrund Ihrer
                            Anfrage mit Ihnen in Kontakt zu treten.

                            C. Rechtsgrundlage
                            Die Rechtsgrundlage für die Erhebung Ihrer Daten ist Art. 4 Abs. 1 BayDSG i.V.m. Art. 6 Abs.
                            1 Unterabs. 1 lit. e DSGVO (Erfüllung originärer Hochschulaufgaben gemäß Art. 2 BayHSchG).

                            D. Speicherdauer
                            Die von Ihnen im Kontaktformular eingegebenen Daten werden gelöscht, wenn die Konversation
                            mit Ihnen beendet ist, d.h. Ihr Anliegen abschließend geklärt ist. Zwingende gesetzliche
                            Bestimmungen- insbesondere gesetzliche Aufbewahrungsfristen – bleiben unberührt.

                            5. Analyse-Tools und Werbung
                            Google Tag Manager
                            Wir setzen den Google Tag Manager ein. Anbieter ist die Google Ireland Limited, Gordon
                            House, Barrow Street, Dublin 4, Irland.

                            Der Google Tag Manager ist ein Tool, mit dessen Hilfe wir Tracking- oder Statistik-Tools und
                            andere Technologien auf unserer Website einbinden können. Der Google Tag Manager selbst
                            erstellt keine Nutzerprofile, speichert keine Cookies und nimmt keine eigenständigen
                            Analysen vor. Er dient lediglich der Verwaltung und Ausspielung der über ihn eingebundenen
                            Tools. Der Google Tag Manager erfasst jedoch Ihre IP-Adresse, die auch an das
                            Mutterunternehmen von Google in die Vereinigten Staaten übertragen werden kann.

                            Nähere Angaben zu der eingesetzten Technologie erhalten Sie im Content-Management-System.

                            Google Analytics
                            Diese Website nutzt Funktionen des Webanalysedienstes Google Analytics. Anbieter ist die
                            Google Ireland Limited („Google“), Gordon House, Barrow Street, Dublin 4, Irland.

                            Nähere Angaben zu dieser Technologie erhalten Sie in unserem Consent-Management-System.

                            6. Plugins und Tools
                            Google Fonts (lokales Hosting)
                            Diese Seite nutzt zur einheitlichen Darstellung von Schriftarten so genannte Google Fonts,
                            die von Google bereitgestellt werden. Die Google Fonts sind lokal installiert. Eine
                            Verbindung zu Servern von Google findet dabei nicht statt.

                            Weitere Informationen zu Google Fonts finden Sie unter
                            https://developers.google.com/fonts/faq und in der Datenschutzerklärung von Google:
                            https://policies.google.com/privacy?hl=de.

                            Weiterhin verweisen wir auf unser Consent-Management-Tool.

                            Google Maps
                            Diese Seite nutzt den Kartendienst Google Maps. Anbieter ist die Google Ireland Limited
                            („Google“), Gordon House, Barrow Street, Dublin 4, Irland.

                            Für nähere Angaben verweisen wir auf unser Consent-Management-Tool.

                            7. Änderung der Datenschutzerklärung
                            Diese Datenschutzerklärung hat den Stand von Oktober 2022. Wir behalten es uns vor, durch
                            die Weiterentwicklung unserer Webseite Änderungen an der Datenschutzerklärung vorzunehmen.
                        </Text>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default PrivatPolicyModal;
