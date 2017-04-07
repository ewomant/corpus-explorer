::Example on how to start an Update of indexing on windows with de.tudarmstadt.ukp.experiments.wdk.indexing.wdk.IndexCsvMetadata based on the class being packaged as a jar with this class defined as main-class (cf. META-INF included)
::
::Please give full path for csv-file as first variable and the URL of the solr instance (incl. core) as second variable
::Encapsulate path and/or url with quotes if they contain spaces
::Look for logs in your users directory under Logs\wdk-core.log
::You can reduce the CSV-File to only include records for books that have been changed (e.g. when exporting form Refine)
::
::Fields that will be updated:
::"Bildungsstufe_opac", "Schulformen_opac", "Regionen_opac"
::"Schlagwort_5550_opac", "Ort_wdk", "Schultyp_wdk", "Geschlecht_wdk",
::"Ort_erste_angabe_wdk", "Verlag_wdk", "Konfession_wdk", "Afz_wdk"
::"Schultyp_Allg_wdk", "Schulbuchtyp_wdk",
:: "Inhalt_Raum_Thema_wdk", "Inhalt_Zeit_wdk", "Jahr der Erstauflage_wdk",
:: "Forschungskorpus_WdK"
::Starting Update - this may take a while...
java -m 3g -jar wdk-core-indexing.jar  'D:\Dokumente\_wdk\owncloud-gei\Shared\Welt-der-Kinder\Metadaten HIWIS NEU\WDK_v3_31032017_MW-xls.csv' http://localhost:8983/solr/WdK.dev/
PAUSE
