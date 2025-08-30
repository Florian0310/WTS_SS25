# Terminbuchung Mostviertler Modellbahnhof

Dieses Projekt ist eine Terminbuchungsanwendung für den Mostviertler Modellbahnhof. Kunden können damit online Termine zur Abholung von Bestellungen oder für eine persönliche Beratung vereinbaren. Die Anwendung wurde im Rahmen eines FH-Projekts entwickelt und als Single-Page-App mit Node.js umgesetzt.

## Installation

1. Node.js (Version 18 oder höher) installieren.
2. Repository klonen und in das Verzeichnis wechseln.
3. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
4. Server starten:
   ```bash
   node server.js
   ```

Beim ersten Start wird eine SQLite-Datenbank `database.db` angelegt. Die verfügbaren Zeitfenster werden automatisch aus der Datei `slots.json` eingelesen und in die Datenbank übernommen.


# Funktionen

Das System bietet folgende Funktionen:

- Registrierung und Login mit Kundennummer, Name und Postleitzahl

- Buchung freier Zeitslots über einen Kalender (grün = verfügbar, rot = belegt)

- Auswahl zwischen Abholung oder Beratung

- Möglichkeit zur Stornierung nach Login

- Speicherung aller Daten in einer SQLite-Datenbank

# Technischer Überblick

Das Backend basiert auf Node.js mit Express und stellt GET- und POST-Endpunkte bereit. Die Datenhaltung erfolgt in SQLite, wobei die Datei slots.json zur Initialbefüllung dient. Das Frontend ist als responsive Single-Page-Anwendung umgesetzt. Während der Entwicklung kam Git zur Versionsverwaltung zum Einsatz.

# Hinweise

Das Projekt wurde zu Lernzwecken erstellt und ist noch nicht für den produktiven Einsatz optimiert. Es fehlen Sicherheitsfunktionen wie Passwort-Hashing oder Rate-Limiting. Für den Versand von E-Mails muss in der Datei server.js ein SMTP-Server konfiguriert werden.

# Rechtliches

Impressum: https://www.mostviertler-modellbahnhof.at/kontaktimpressum/

Datenschutzerklärung: https://www.mostviertler-modellbahnhof.at/datenschutzerklaerung/

# Webserver

Link: https://wts-ss25.onrender.com/

