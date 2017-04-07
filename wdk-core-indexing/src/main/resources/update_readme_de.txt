Für eine Neuindexierung bitte zuerst die Pfade in der start_update.bat anpassen (rechtsklick-> Bearbeiten oder im Editor öffnen). Ein Update des geaamten Indexes kann mehrere Stunden dauern.

Zur Sicherheit vorher eine Kopie des Index-Ordners erstellen: Dafür den Ordner server\solr\wdk.07.03 (z.B.) unbedingt in einen anderen Ordner ausserhal von server\solr kopieren, nicht dort belassen: Bei zwei Cores mit demselben Namen startet keiner von beiden und die Neuindexierung würde nicht starten.

Vor dem Start der Indexierung muss der lokale Solr-Server gestartet sein, bitte erst unter http://localhost:8983/solr/WdK.dev/browse überprüfen.

  Felder, die upgedatet werden:
  ::"Bildungsstufe_opac", "Schulformen_opac", "Regionen_opac"
  ::"Schlagwort_5550_opac", "Ort_wdk", "Schultyp_wdk", "Geschlecht_wdk",
  ::"Ort_erste_angabe_wdk", "Verlag_wdk", "Konfession_wdk", "Afz_wdk"
  ::"Schultyp_Allg_wdk", "Schulbuchtyp_wdk",
  :: "Inhalt_Raum_Thema_wdk", "Inhalt_Zeit_wdk", "Jahr der Erstauflage_wdk",
  :: "Forschungskorpus_WdK"

Aktuelle Meldungen werden im Kommandozeilen-Fenster ausgegeben und gleichzeitig in einen Ordner \Logs in deinem Benutzerordner gespeichert (Normalerweise da, wo auch die Ordner für Dokumente/Videos/Bilder angelegt sind.


Wenn alles durchgelaufen ist, kommt  die Meldung:

5468 INFO  (main) [   ] d.t.u.e.w.i.w.IndexCsvMetadata Optimizing index...

Ganz am Ende, und erst danach sollte das Fenster geschlossen werden, kommt die Meldung:

733285 INFO  (main) [   ] d.t.u.e.w.i.w.IndexCsvMetadata Optimization successful.

> PAUSE
Drücken Sie eine beliebige Taste . . .

(Schließt das Fenster)
