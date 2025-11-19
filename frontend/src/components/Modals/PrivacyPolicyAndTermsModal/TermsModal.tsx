import React from "react";
import {Modal, Typography, Row, Col} from "antd";

const {Title, Text} = Typography;

interface ModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TermsModal: React.FC<ModalProps> = ({isModalOpen, setIsModalOpen}) => {
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
                        <Title level={2}> Nutzungsbedingungen für die Webplattform www.digital-lotse-wasser.org
                        </Title>
                        <Text>
                            1. Projektbeschreibung

                            Die Hochschule für Angewandte Wissenschaften Hof (nachfolgend „wir“ oder „uns“ genannt) ist
                            auf vielen Bereichen der Forschung tätig. Hierzu zählt insbesondere die Auseinandersetzung
                            mit aktuellen Fragen zum Wassermanagement im Wandel der Gesellschaft und der aktuell
                            fortschreitenden Digitalisierung.

                            Die Webplattform https://www.digital-lotse-wasser.org (nachfolgend „Webplattform“ genannt)
                            ist die Online-Plattform für das bei uns durchgeführte Forschungsprojekt „DigiNaX“ am
                            Institut für nachhaltige Wassersysteme der Hochschule Hof unter der federführenden Leitung
                            von Prof. Günter Müller-Czygan und Frau Prof. Manuela Wimmer.

                            „DigiNaX“ steht für Digitalisierungsreport in der Wasserwirtschaft und NachhaltigkeitsindeX
                            der Hochschule Hof.

                            Die Webplattform dient dazu, das Forschungsprojekt „DigiNaX“ einem breiten Publikum zur
                            Verfügung zu stellen.

                            Durch diese Webplattform soll ein einheitliches Portal geschaffen werden, in dem
                            verschiedene Organisationen und Unternehmen der Wasserwirtschaft ihre digitalen Lösungen und
                            Projekte vorstellen können.

                            Hierbei soll die Möglichkeit geschaffen werden, verschiedene Akteure der Wasserwirtschaft,
                            die digitale Lösungen oder Projekte bei sich bereits erprobt haben oder nach solchen suchen,
                            zusammenzubringen.

                            Im bereits abgeschlossenen geförderten Projekt WaterExe4.0 wurde für den deutschsprachigen
                            Raum erstmals eine umfassende und wertvolle Datenbasis zum Stand der Digitalisierung im
                            Wassersektor geschaffen. Ausgehend von dem Wunsch potenzieller Nutzer der Wasserwirtschaft
                            nach Hilfestellungen in der Auswahl- und Umsetzungsphase von Digitalisierungsprojekten wurde
                            deutlich, dass eine Übersicht zu digitalen Lösungen in deren zukünftigen Projekten dringend
                            nötig ist. Die individuelle Internetsuche über Suchmaschinen nach neuen digitalen
                            Eingabelösungen ist gegenwärtig nicht effizient genug.

                            Als Ausbildungsort von Akademikern und Mittelpunkt zukunftsorientierter Forschung kommt
                            Hochschulen im Zuge der nachhaltigen Entwicklung eine besonders tragende Rolle zu. Wir
                            betreiben als Green Tech University bereits ein ökologisch-nachhaltiges Verhalten im Hause
                            sowie entsprechende Entwicklungen in der Region voran und möchten zudem die Nachhaltigkeit
                            mit all ihren Bereichen an der Hochschule Hof selbst weiter ausbauen und Transferleuchtturm
                            für die Region sein. Gute Beispiele anderer Hochschulen belegen bereits, dass dieser Prozess
                            mithilfe eines Konzepts und einer Strategie zur nachhaltigen Entwicklung gelingen kann.

                            2. Geltungsbereich

                            1. Die folgenden Bedingungen regeln die Rechte und Pflichten zwischen uns und dem jeweiligen
                            Nutze* unserer Webplattform.

                            Unter „Nutzer“ im Sinne dieser Nutzungsbedingungen verstehen wir registrierte Nutzer, die
                            ihre Inhalte nach einer vorherigen Registrierung auf unserer Webplattform einstellen sowie
                            Nutzer, die ohne Registrierung ihre digitalen Lösungen auf unserer Webplattform präsentieren
                            wollen.

                            Digitale Lösungen/Projekte können bei uns auch ohne Registrierung auf unserem Portal
                            aufgenommen werden, indem ein sogenannter „Steckbrief der digitalen Lösung“ beim
                            Portaladministrator unserer Webseite eingereicht wird (vgl. Punkt 5 dieser
                            Nutzungsbedingungen). Der Portaladministrator stellt sodann die Inhalte nach den
                            Bestimmungen dieser Nutzungsbedingungen auf die Webplattform ein. Diese Nutzungsbedingungen
                            gelten daher entsprechendauch für Unternehmen oder Organisationen, die mittels des
                            „Steckbriefs der digitalen Lösung“ ihre digitalen Lösungen auf unserer Webplattform durch
                            unseren Portaladministrator einstellen lassen.

                            Zu den o.g. Rechten und Pflichten der Nutzer in Bezug auf unsere Webplattform zählen
                            insbesondere die Registrierung sowie die damit einhergehende Nutzung weiterer Funktionen auf
                            unserer Webplattform, wie z.B. die Einreichung von digitalen Lösungen und Projekten in der
                            Wasserwirtschaft, sowie die Bereitstellung einer Beschreibung der digitalen Lösung durch
                            einen Steckbrief.

                            2. Auf unserer Webplattform stellen wir einen Zugang zu Informationen anderer Anbieter (z.B.
                            Youtube, LinkedIn) bereit. Durch Öffnen eines neuen Browserfensters gelangt man direkt zu
                            der jeweiligen, externen Internetseite der Anbieter. Für die Inanspruchnahme dieser Dienste
                            gelten die beim jeweiligen Anbieter bestehenden Teilnahme- und Nutzungsbedingungen sowie
                            gegebenenfalls sonstigen Bestimmungen.

                            3. Zugangsvoraussetzungen für registrierte Nutzer

                            Die Nutzung der auf der Webplattform verfügbaren Funktion „Lösung/Projekt einreichen“ setzt
                            eine Registrierung voraus.
                            Für Unternehmen oder Organisationen, die auch ohne Registrierung ihre Lösungen/Projekte auf
                            unserer Webplattform einstellen lassen wollen, siehe bitte unter Punkt 5. „Projekt
                            einreichen“.
                            Ein Anspruch auf Registrierung besteht nicht. Wir sind berechtigt, Anträge auf Registrierung
                            ohne Angabe von Gründen zurückzuweisen.
                            Eine Registrierung setzt voraus, dass der Nutzer volljährig und unbeschränkt geschäftsfähig
                            ist. Die Registrierung wird dem jeweiligen Unternehmen oder der Organisation zugerechnet,
                            dem der Nutzer angehört.
                            Nutzerprofile sind nicht übertragbar; die Abtretung von Rechten aus dem Nutzungsverhältnis
                            ist ausgeschlossen.
                            Die Benutzung unserer Webplattform durch Internet-Besucher ist an keine Voraussetzungen
                            gebunden. Die Besucher können die Inhalte auf unserer Webplattform einsehen, die von den
                            Nutzern bei uns eingereicht werden.
                            4. Registrierung

                            Für die Nutzung der Funktion „Lösung/Projekt einreichen“ auf unserer Webplattform ist es
                            erforderlich, dass sich der Nutzer registriert und somit einen Nutzer-Account auf unserer
                            Webseite erstellt. Mit Registrierung akzeptiert der Nutzer unsere hiesigen
                            Nutzungsbedingungen für unsere Webplattform.
                            Für den Registrierungsvorgang haben wir eine Eingabemaske vorgesehen, in der der Nutzer
                            seine Daten eingeben kann. Die während dieses Vorgangs durch den Nutzer eingegebenen Daten
                            müssen vollständig und richtig sein.
                            Sofern sich die Daten des Nutzers ändern, bitten wir, mit uns Kontakt
                            (diginax.portal(at)hof-university.de) aufzunehmen.
                            Nach Eingabe der Daten erhält der Nutzer von uns eine Bestätigungs-E-Mail. Mit dem dortigen
                            Bestätigungslink kann die Registrierung abgeschlossen werden. Mit erfolgreicher
                            Registrierung kann die weitere Funktion unserer Webplattform wie „Lösung/Projekt einreichen“
                            genutzt werden.
                            Die Registrierung und die Nutzung der damit verbundenen Funktion „Lösung/Projekt einreichen“
                            ist für den Nutzer kostenlos.
                            Es liegt in der Verantwortung des Nutzers, dass dieser seine Zugangsdaten geheim hält und
                            unbefugten Dritten nicht zugänglich macht. Ist zu befürchten, dass unbefugte Dritte Kenntnis
                            von den Zugangsdaten erhalten haben, sind wir unverzüglich zu kontaktieren.
                            5. Projekt einreichen

                            Es gibt zwei Möglichkeiten eine digitale Lösung/Projekt einer Organisation oder eines
                            Unternehmens auf der Webplattform einzureichen.
                            Als registrierter Nutzer kann dieser die digitale Lösung bzw. das Projekt seiner
                            Organisation oder seines Unternehmers auf unserer Webplattform selbst einstellen. Die
                            Projekteinreichung wird dem jeweiligen Unternehmen oder Organisation zugerechnet.
                            Ferner kann man als nicht-registrierter Nutzer eine digitale Lösung/Projekt mit der Hilfe
                            unseres Portaladministrators einstellen lassen. Der Nutzer muss hierzu den „Steckbrief der
                            digitalen Lösung“ vollständig, aktuell und richtig ausfüllen und unterschrieben an den
                            Portaladministrator übersenden. Der Nutzer gibt hierbei zudem eine Erklärung ab, dass er
                            sich mit den hiesigen Nutzungsbedingungen einverstanden erklärt. Der Portaladministrator
                            pflegt sodann gemäß diesen Nutzungsbedingungen diese Inhalte auf der Webplattform ein.
                            Es ist beabsichtigt, dass die eingereichten Inhalte auf der o.g. Webplattform veröffentlicht
                            werden, um auf Projekte und Lösungen bei der Digitalisierung der Wasserwirtschaft aufmerksam
                            zu machen. Dies soll dazu beitragen, dass Interessierte Hilfestellungen in der Auswahl- und
                            Umsetzungsphase von Digitalisierungsprozessen im Bereich Wasserwirtschaft erhalten. Zudem
                            sollen durch die eingereichten Inhalte eine Übersicht zu digitalen Lösungen in der
                            Wasserwirtschaft im deutschsprachigen Raum geschaffen werden. Dies soll auch geografisch
                            durch Verwendung der Koordinaten der teilnehmenden Nutzer abgebildet werden. Die
                            eingereichten Inhalte sollen auch für die statistische Auswertung für den Jahresbericht
                            (jährlicher Statusreport) über den Stand der Digitalisierungschancen in der Wasserwirtschaft
                            verwendet werden. Es ist beabsichtigt, dass dieser jährliche Statusreport auf unserer
                            Internetseite sowie in Forschung und Lehre vorgestellt wird. Ein Anspruch auf
                            Veröffentlichung besteht nicht. Der Portaladministrator ist nicht verantwortlich für den
                            Inhalt der eingereichten Informationen aus dem Steckbrief. Die Projekteinreichung wird dem
                            jeweiligen Unternehmen oder Organisation zugerechnet.
                            Die Einstellung der digitalen Lösung/Projekt mittels Steckbrief erfolgt durch Ausfüllen der
                            entsprechenden Beschreibungsfelder und Übermittlung an den Portaladministrator per Post,
                            E-Mail und/oder Telefon. Nachdem der unterschriebene „Steckbrief der digitalen Lösung“ durch
                            den Nutzer eingereicht wurde, trägt der Portaladministrator die entsprechende Beschreibung
                            des Projektes in das Portal auf unserer Webplattform ein. Hierbei wird die Beschreibung im
                            Portal mit dem Vermerk "Es handelt sich hierbei um einen fremden Inhalt. Die Informationen
                            wurden vom Portaladministrator auf Basis des „Steckbriefs“ eingetragen, der dem
                            Portaladministrator von der jeweiligen Organisation/Unternehmen zur Veröffentlichung zur
                            Verfügung gestellt wurde" versehen.
                            Mit Einreichung des Projektes oder der Lösung bestätigt der Nutzer, dass er berechtigt ist,
                            das jeweilige Projekt oder die Lösung seiner Organisation oder seines Unternehmens
                            öffentlich zu präsentieren und uns zur Verfügung zu stellen.
                            Die Einstellung des Projektes oder der Lösung auf unserer Webplattform kann durch uns
                            abgelehnt werden, sofern es sich nicht um eine digitale Lösung oder um ein Projekt in der
                            Wasserwirtschaft im deutschsprachigen Raum handelt und/oder die jeweiligen Pflichtfelder
                            hierzu durch den Nutzer nicht ausgefüllt wurden.
                            Die vom Nutzer bereitgestellten Inhalte sind aktuell zu halten. Änderungen sind unverzüglich
                            mitzuteilen.
                            6. Verhaltenskodex

                            Ein angemessener Umgang auf unserer Webplattform, die Einhaltung geltenden Rechts,
                            insbesondere die Beachtung Rechter Dritter, ist uns sehr wichtig.
                            Daher sind die Nutzer nicht berechtigt, Handlungen vorzunehmen, die in die Rechte Dritter
                            eingreifen (z.B. Verletzung von Namens-, Persönlichkeits-, Urheber-, Marken oder
                            Patentrechten). Diese unberechtigten Handlungen sind insbesondere:

                            Handlungen mit persönlichkeitsverletzendem oder geschäftsschädigendem Charakter;
                            das Behaupten oder Widergeben von falschen Tatsachen;
                            die Verbreitung von Bildmaterial oder urheberrechtlich geschützten Texten ohne Zustimmung
                            des jeweiligen Rechteinhabers;
                            die Verbreitung von Inhalten, die markenrechtlich geschützt sind (z.B. Firmenlogos) ohne
                            Zustimmung des Rechteinhabers;
                            die Verbreitung von Inhalten, die aufgrund einer Vertraulichkeitsvereinbarung geheim oder im
                            Rahmen zur Erlangung eines Patentschutzes geheim zu halten sind.


                            3. Darüber hinaus ist es den Nutzern untersagt, Inhalte mit werbenden Inhalten zu
                            veröffentlichen (z.B. Angebote mit entgeltlichem Inhalt).

                            4. Ferner ist es den den Nutzern untersagt, Handlungen vorzunehmen, die unser
                            informationstechnisches System gefährden (z.B. durch Verbreitung von Viren, Trojaners,
                            Dateien mit schädlichen Anhängen). Handlungen mit persönlichkeitsverletzendem oder
                            geschäftsschädigendem Charakter; das Behaupten oder Widergeben von falschen Tatsachen; die
                            Verbreitung von Bildmaterial oder urheberrechtlich geschützten Texten ohne Zustimmung des
                            jeweiligen Rechteinhabers; die Verbreitung von Inhalten, die markenrechtlich geschützt sind
                            (z.B. Firmenlogos) ohne Zustimmung des Rechteinhabers; die Verbreitung von Inhalten, die
                            aufgrund einer Vertraulichkeitsvereinbarung geheim oder im Rahmen zur Erlangung eines
                            Patentschutzes geheim zu halten sind.


                            7. Bereitstellung unserer Webplattform

                            Wir sind bemüht, einen störungsfreien Betrieb unserer Webplattform anzubieten. Allerdings
                            besteht kein Anspruch auf eine bestimmte Verfügbarkeit oder Aufrechterhaltung unserer
                            Webplattform. Durch technische Störungen (z.B. Unterbrechung der Stromversorgung) oder
                            Wartungsarbeiten können kurzzeitige Beschränkungen oder Unterbrechungen unserer Webplattform
                            auftreten.
                            Wir sind berechtigt, die Funktionen unserer Webplattform zu erweitern, zu aktualisieren oder
                            zu ändern. Wir werden unsere Nutzer hierüber rechtzeitig informieren. Ein Anspruch auf
                            Beibehaltung unserer Webplattform besteht nicht.
                            8. Inhalte auf unserer Webplattform

                            8.1. Überblick

                            Auf unserer Webplattform stellen wir unsere eigenen Inhalte und die Inhalte von Nutzern, die
                            selbst die Inhalte auf unserer Webplattform eingestellt haben oder den „Steckbrief der
                            digitalen Lösung“ ausgefüllt haben, zur Verfügung. Daneben stellen wir auch einen Zugang zu
                            Informationen fremder Anbieter (z.B. Youtube) bereit. Durch Öffnen eines neuen
                            Browserfensters gelangt man direkt zu der jeweiligen, externen Webseite des fremden
                            Anbieters. Für die Inanspruchnahme dieser Dienste gelten die beim Anbieter jeweils geltenden
                            Teilnahme- und Nutzungsbedingungen sowie gegebenenfalls sonstigen Bestimmungen.
                            Für unsere eigene Inhalte sind wir nach den in Deutschland geltenden und anwendbaren
                            Gesetzen verantwortlich.
                            In Hinblick auf fremde Inhalte haben wir keinen Einfluss, insbesondere auf deren
                            Vollständigkeit, Richtigkeit, Aktualität und Rechtmäßigkeit. Fremde Inhalte liegen
                            insbesondere dann vor, wenn Nutzer selbst Inhalte bereitgestellt haben, sei es indem sie
                            diese selbst auf unserer Webplattform eingestellt haben oder uns mittels des „Steckbriefs
                            der digitalen Lösung“ zur Verfügung gestellt haben. Wir werden konkreten Hinweisen auf
                            problematische Inhalte unverzüglich nachgehen und diese ggf. löschen.
                            Die Nutzer sind für die von ihnen bereitgestellten Inhalten selbst voll verantwortlich.
                            8.2. von registrierten Nutzern selbst bereitgestellte Inhalte auf unserer Webplattform

                            8.2.1. Einräumung von Nutzungsrechten an den von registrierten Nutzern bereitgestellten
                            Inhalten

                            Nachdem sich der Nutzer auf unserer Webplattform registriert und seine digitale Lösung oder
                            sein Projekt eingereicht oder den „Steckbrief der digitalen Lösung“ an den
                            Portaladministrator übermittelt hat , können die durch den Nutzer bereitgestellten Inhalten
                            auf unsere Webplattform gemäß den Nutzungsbedingungen eingestellt werden.
                            An den von den Nutzern bei uns eingestellten oder mittels Steckbrief einzustellenden
                            Inhalten (dies sind insbesondere Texte; Projektlogo; Firmenlogo; etc.) räumt der Nutzer uns
                            ein einfaches, unentgeltliches, unwiderrufliches, übertragbares, unterlizenzierbares,
                            zeitlich, inhaltlich und örtlich unbeschränktes Nutzungsrecht an den jeweiligen Inhalten in
                            vollständiger und bearbeiteter Form ein, insbesondere
                            zur Speicherung der Inhalte auf dem von uns verwendeten Server sowie deren (digitale und
                            nicht-digitalen) Veröffentlichung, insbesondere deren öffentlichen Zugänglichmachung (z.B.
                            durch Anzeige Ihrer Inhalte auf unserer Webseite oder auf unseren sozialen Medien;
                            Veröffentlichung auf Konferenzen etc.);
                            zur Bearbeitung und zur Nutzung der bearbeiteten Form (insbesondere Vervielfältigung und
                            öffentliche Zugänglichmachung der bearbeiteten Form auf unserer Webseite);
                            zur angemessenen Präsentation unseres Projektes „DigiNaX“ gegenüber am Projekt
                            interessierten Partnern bzw. Mittelgebern; hierzu die von den Nutzern, eingestellten bzw.
                            mittels Steckbrief einzustellenden Inhalte zu nutzen, zu vervielfältigen, vorzuführen und
                            öffentlich wiederzugeben.
                            3. Sofern es für die Verwendung der von den Nutzern bereitgestellten Logos Vorgaben zur
                            Logoverwendung bestehen, sind diese uns unverzüglich mitzuteilen.

                            8.2.2. Berechtigung zur Einräumung von Nutzungsrechten

                            Durch das Zurverfügungstellen der Inhalte auf unserer Webplattform erklärt der Nutzer, dass
                            er verfügungsbefugt ist, uns die oben beschriebenen Nutzungsrechte an den uns von ihm
                            bereitgestellten Inhalten einzuräumen.

                            Eine Verfügungsbefugnis liegt vor, wenn der Nutzer selbst der alleinige Inhaber sämtlicher
                            Rechte an den von ihm uns zur Verfügung gestellten Inhalten ist oder anderweitig dazu
                            berechtigt ist (z.B. durch eine wirksame Erlaubnis des Rechteinhabers), uns die oben
                            genannten Nutzungsrechte einzuräumen.

                            Die Nutzer werden Daten, insbesondere personenbezogene Daten Dritter nur dann für die
                            Webplattform bereitstellen, wenn die Erhebung rechtmäßig ist und die Weitergabe sowie
                            sonstige Nutzung von der Erhebungs- bzw. Nutzungsgrundlage gedeckt ist (z.B.
                            Veröffentlichung der Kontaktdaten des Ansprechpartners für die digitale Lösung auf der
                            Webplattform).

                            8.2.3. Haftungsfreistellung

                            Es ist den Nutzern untersagt, Handlungen auf unserer Webplattform durchzuführen, die gegen
                            geltendes Recht verstößt, insbesondere Rechte Dritter verletzt.
                            Für den Fall, dass wir aufgrund oder im Zusammenhang mit dem vom Nutzer uns zur Verfügung
                            gestellten Inhalten und/oder wegen seiner Handlungen auf unserer Webplattform wegen
                            vermeintlicher oder tatsächlicher Rechtsverletzung und/oder Verletzung von Rechten Dritter
                            in Anspruch genommen werden, stellt der Nutzer uns von sämtlichen sich daraus ergebenen
                            Ansprüchen Dritter frei. Die Freistellung beinhaltet auch den Ersatz der Kosten, die uns
                            durch eine Rechtsverfolgung/-verteidigung entstehen.
                            8.3. bereitgestellte Inhalte von Dritten

                            8.3.1 Nutzungsrechten an von Dritten bereitgestellten Inhalten

                            Inhalte, die nicht durch den Nutzer selbst zur Verfügung gestellt werden, werden als Inhalte
                            Dritter bezeichnet. Inhalte Dritter können unsere eigenen Inhalte oder die Inhalte von
                            anderen, Nutzern sein. An den Inhalten Dritter können Rechte (z.B. Markenrechte,
                            Urheberrechte oder sonstige Schutzrechte) bestehen, sodass diese Inhalte nicht ohne
                            Zustimmung der jeweiligen Rechteinhaber verwendet werden dürfen. In Hinblick auf Inhalte,
                            die von anderen Anbietern (z.B. Youtube) bereitgestellt werden, sind die beim jeweiligen
                            Anbieter geltenden Bestimmungen zu beachten.
                            Unsere Inhalte und die Inhalte anderer, Nutzer dürfen nicht ohne deren Zustimmung verwendet
                            werden.
                            Es ist Nutzern untersagt, die verfügbaren Inhalte, die wir selbst einstellen oder von
                            anderen, Nutzern eingestellt bzw. bereitgestellt werden, zu bearbeiten, zu verändern, zu
                            veröffentlichen, vorzuführen, auszustellen, zu vervielfältigen, öffentlich zugänglich zu
                            machen oder zu verbreiten.
                            Sämtliche Rechte an den Inhalten bleiben bei dem ursprünglichen Rechteinhaber. Die
                            Einräumung von Nutzungsrechten nach diesen Nutzungsbedingungen bleibt davon unberührt.
                            9. Löschung von Inhalten und (kurzzeitige) Sperrung des Nutzerkontos

                            Sobald konkrete Anhaltspunkte dafür bestehen, dass uns Nutzer Inhalte bereitgestellt haben,
                            die gegen Rechte Dritter oder gegen den Verhaltenskodex (Ziff. 6 dieser Nutzungsbedingungen)
                            auf unserer Webseite verstoßen, sind wir berechtigt, den Inhalt zu löschen und das
                            Nutzerkonto des jeweiligen registrierten Nutzers vorübergehend zu sperren. Im Falle der
                            Sperrung wird der Nutzer darüber informiert, ebenso über eine Aufhebung der Sperrung.

                            Ferner behalten wir es uns vor, Inhalte zu löschen, wenn die in der Beschreibung von Nutzern
                            angegebene Link (Link zur digitalen Lösung bzw. Projekt und/oder Link zur Seite des
                            Unternehmens oder der Organisation) nicht korrekt oder nicht aktiv ist.

                            10. Änderung unserer Nutzungsbedingungen

                            Wir behalten es uns vor, unsere Nutzungsbedingungen jederzeit und nach eigenem Ermessen zu
                            ändern. Über bevorstehende Änderungen werden wir Nutzer rechtzeitig mittels gesonderter
                            Mitteilung unterrichten.
                            Sollte der Nutzer innerhalb des in dieser Mitteilung genannten, angemessenen Zeitraums nicht
                            widersprechen, gilt dies als seine Zustimmung zur geänderten Fassung.
                            Sofern den bevorstehenden Änderungen widersprochen wird, wird die Nutzung zu den bisherigen
                            Bedingungen fortgeführt.
                            11. Datenschutz

                            Hinsichtlich des Schutzes personenbezogenen Daten der Nutzer zu einzelnen datenbezogenen
                            Verarbeitungsvorgängen verweisen wir auf die diesbezüglich eingeholten
                            Einwilligungserklärungen und unsere Datenschutzerklärung.

                            12. Sonstiges

                            Es gilt ausschließlich deutsches Recht unter Ausschluss der Kollisionsregelungen.
                            Ausschließlicher Gerichtsstand ist Hof / Saale.
                            Sollte einer dieser Bestimmungen dieser Nutzungsvereinbarung unwirksam oder nichtig sein,
                            berührt dies den Bestand der übrigen Bedingungen nicht. Anstelle der unwirksamen Bestimmung
                            wird eine Regelung vereinbart, die rechtlich zulässig ist und der Zielsetzung der
                            unwirksamen Bestimmung am besten entspricht.
                            [*] Sämtliche Personenbezeichnungen gelten gleichermaßen für alle Geschlechter.

                            01.05.2023
                        </Text>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default TermsModal;
