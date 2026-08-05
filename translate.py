import json
import os
from pathlib import Path

dashboard_translations = {
    "fr": {
        "greeting": "Bonjour",
        "requiresAttention": "Nécessite une attention",
        "uploadNewData": "Importer de nouvelles données",
        "viewForecast": "Voir les prévisions",
        "productsTracked": "Produits suivis",
        "highRiskItems": "Articles à haut risque",
        "foodSaved": "Nourriture sauvée",
        "recommendedActions": "Actions recommandées",
        "leaderboard": {
            "title": "🏆 Classement d'Amsterdam",
            "rank": "Vous êtes classé #{rank} sur {total} entreprises",
            "viewFull": "Voir le classement complet →"
        },
        "nav": {
            "dashboard": "Tableau de bord",
            "upload": "Importer",
            "forecast": "Prévisions",
            "surplus": "Surplus",
            "offers": "Offres",
            "impact": "Impact",
            "settings": "Paramètres"
        },
        "header": {
            "searchPlaceholder": "Rechercher dans l'inventaire...",
            "notifications": "Notifications",
            "profile": "Profil",
            "signOut": "Se déconnecter",
            "loading": "Chargement…"
        },
        "page": {
            "greeting": {
                "morning": "Bonjour",
                "afternoon": "Bon après-midi",
                "evening": "Bonsoir",
                "welcome": "Bienvenue"
            },
            "empty": {
                "subtitle": "Configurons vos données d'inventaire.",
                "getStarted": "Commencer",
                "title": "Importez votre premier fichier de données pour débloquer les prévisions",
                "desc": "Cela prend moins de 5 minutes. Importez un fichier CSV ou Excel avec vos données de ventes et de stocks pour voir les prévisions de demande, l'analyse des risques et les mesures d'impact.",
                "btn": "Importer maintenant →"
            },
            "banner": {
                "subtitle": "Voici l'état de votre inventaire — dernière mise à jour {time}.",
                "uploadBtn": "Importer de nouvelles données",
                "forecastBtn": "Voir les prévisions →"
            },
            "urgent": {
                "title": "Nécessite une attention",
                "subtitle": "({count} articles urgents)",
                "riskScore": "Score de risque : {score}/100",
                "atRisk": "{value} à risque",
                "btn": "Créer une offre →"
            },
            "stats": {
                "products": "Produits suivis",
                "productsSub": "{count} prévisions générées",
                "highRisk": "Articles à haut risque",
                "highRiskSubSafe": "Tous les articles sont en sécurité",
                "highRiskSub": "{value} à risque",
                "foodSaved": "Nourriture sauvée (Total)",
                "foodSavedSub": "{value} t de CO₂ évitées"
            },
            "actions": {
                "title": "Actions recommandées",
                "urgentTitle": "{count} articles à haut risque nécessitent une attention",
                "urgentDesc": "{value} de perte potentielle",
                "urgentBtn": "Créer des offres",
                "forecastTitle": "Dernières prévisions prêtes",
                "forecastDesc": "Basé sur {file}",
                "forecastBtn": "Voir les prévisions",
                "impactTitle": "Vous avez évité {value} de gaspillage alimentaire",
                "impactDesc": "{value} de revenus sauvés",
                "impactBtn": "Voir le rapport d'impact",
                "uploadTitle": "Gardez les prévisions précises",
                "uploadDesc": "Importez de nouvelles données chaque semaine pour de meilleurs résultats",
                "uploadBtn": "Importer des données"
            },
            "recent": {
                "title": "Activité récente",
                "upload": "Données importées — <strong>{file}</strong>",
                "highRisk": "<strong>{count} articles à haut risque</strong> détectés dans les prévisions",
                "impact": "Impact mis à jour — <strong>{value}</strong> de gaspillage évité au total",
                "today": "Aujourd'hui",
                "viewAll": "Voir toutes les prévisions →"
            },
            "quick": {
                "title": "Actions rapides",
                "manageSurplus": "Gérer les surplus"
            },
            "lastUpload": {
                "title": "Dernier import",
                "validRows": "{count} lignes valides",
                "products": "{count} produits",
                "processed": "Traité",
                "btn": "Nouvel import →"
            }
        }
    },
    "de": {
        "greeting": "Guten Morgen",
        "requiresAttention": "Erfordert Aufmerksamkeit",
        "uploadNewData": "Neue Daten hochladen",
        "viewForecast": "Prognose anzeigen",
        "productsTracked": "Erfasste Produkte",
        "highRiskItems": "Hochrisiko-Artikel",
        "foodSaved": "Gerettete Lebensmittel",
        "recommendedActions": "Empfohlene Aktionen",
        "leaderboard": {
            "title": "🏆 Amsterdam-Rangliste",
            "rank": "Sie belegen Platz #{rank} von {total} Unternehmen",
            "viewFull": "Gesamte Rangliste anzeigen →"
        },
        "nav": {
            "dashboard": "Dashboard",
            "upload": "Hochladen",
            "forecast": "Prognose",
            "surplus": "Überschuss",
            "offers": "Angebote",
            "impact": "Wirkung",
            "settings": "Einstellungen"
        },
        "header": {
            "searchPlaceholder": "Inventar durchsuchen...",
            "notifications": "Benachrichtigungen",
            "profile": "Profil",
            "signOut": "Abmelden",
            "loading": "Wird geladen…"
        },
        "page": {
            "greeting": {
                "morning": "Guten Morgen",
                "afternoon": "Guten Tag",
                "evening": "Guten Abend",
                "welcome": "Willkommen"
            },
            "empty": {
                "subtitle": "Lassen Sie uns Ihre Inventardaten einrichten.",
                "getStarted": "Loslegen",
                "title": "Laden Sie Ihre erste Datendatei hoch, um Prognosen freizuschalten",
                "desc": "Es dauert weniger als 5 Minuten. Laden Sie eine CSV- oder Excel-Datei mit Ihren Verkaufs- und Bestandsdaten hoch, um Nachfrageprognosen, Risikoanalysen und Wirkungsmetriken zu sehen.",
                "btn": "Jetzt hochladen →"
            },
            "banner": {
                "subtitle": "Hier ist Ihr Inventarstatus — zuletzt aktualisiert um {time}.",
                "uploadBtn": "Neue Daten hochladen",
                "forecastBtn": "Prognose anzeigen →"
            },
            "urgent": {
                "title": "Erfordert Aufmerksamkeit",
                "subtitle": "({count} dringende Artikel)",
                "riskScore": "Risikobewertung: {score}/100",
                "atRisk": "{value} gefährdet",
                "btn": "Angebot erstellen →"
            },
            "stats": {
                "products": "Erfasste Produkte",
                "productsSub": "{count} Prognosen erstellt",
                "highRisk": "Hochrisiko-Artikel",
                "highRiskSubSafe": "Alle Artikel sicher",
                "highRiskSub": "{value} gefährdet",
                "foodSaved": "Gerettete Lebensmittel (Gesamt)",
                "foodSavedSub": "{value} t CO₂ vermieden"
            },
            "actions": {
                "title": "Empfohlene Aktionen",
                "urgentTitle": "{count} Hochrisiko-Artikel erfordern Aufmerksamkeit",
                "urgentDesc": "{value} potenzieller Verlust",
                "urgentBtn": "Angebote erstellen",
                "forecastTitle": "Neueste Prognose bereit",
                "forecastDesc": "Basierend auf {file}",
                "forecastBtn": "Prognose anzeigen",
                "impactTitle": "Sie haben {value} Lebensmittelverschwendung verhindert",
                "impactDesc": "{value} Einnahmen gerettet",
                "impactBtn": "Wirkungsbericht anzeigen",
                "uploadTitle": "Halten Sie Prognosen genau",
                "uploadDesc": "Laden Sie wöchentlich neue Daten für beste Ergebnisse hoch",
                "uploadBtn": "Daten hochladen"
            },
            "recent": {
                "title": "Letzte Aktivität",
                "upload": "Daten hochgeladen — <strong>{file}</strong>",
                "highRisk": "<strong>{count} Hochrisiko-Artikel</strong> in der Prognose erkannt",
                "impact": "Wirkung aktualisiert — <strong>{value}</strong> Verschwendung insgesamt verhindert",
                "today": "Heute",
                "viewAll": "Alle Prognosen anzeigen →"
            },
            "quick": {
                "title": "Schnellaktionen",
                "manageSurplus": "Überschuss verwalten"
            },
            "lastUpload": {
                "title": "Letzter Upload",
                "validRows": "{count} gültige Zeilen",
                "products": "{count} Produkte",
                "processed": "Verarbeitet",
                "btn": "Neu hochladen →"
            }
        }
    },
    "es": {
        "greeting": "Buenos días",
        "requiresAttention": "Requiere atención",
        "uploadNewData": "Subir nuevos datos",
        "viewForecast": "Ver pronóstico",
        "productsTracked": "Productos rastreados",
        "highRiskItems": "Artículos de alto riesgo",
        "foodSaved": "Alimentos salvados",
        "recommendedActions": "Acciones recomendadas",
        "leaderboard": {
            "title": "🏆 Clasificación de Ámsterdam",
            "rank": "Estás en el puesto #{rank} de {total} empresas",
            "viewFull": "Ver clasificación completa →"
        },
        "nav": {
            "dashboard": "Panel",
            "upload": "Subir",
            "forecast": "Pronóstico",
            "surplus": "Excedente",
            "offers": "Ofertas",
            "impact": "Impacto",
            "settings": "Ajustes"
        },
        "header": {
            "searchPlaceholder": "Buscar inventario...",
            "notifications": "Notificaciones",
            "profile": "Perfil",
            "signOut": "Cerrar sesión",
            "loading": "Cargando…"
        },
        "page": {
            "greeting": {
                "morning": "Buenos días",
                "afternoon": "Buenas tardes",
                "evening": "Buenas noches",
                "welcome": "Bienvenido"
            },
            "empty": {
                "subtitle": "Configuremos los datos de tu inventario.",
                "getStarted": "Empezar",
                "title": "Sube tu primer archivo de datos para desbloquear pronósticos",
                "desc": "Toma menos de 5 minutos. Sube un archivo CSV o Excel con tus datos de ventas y stock para ver pronósticos de demanda, análisis de riesgos y métricas de impacto.",
                "btn": "Subir ahora →"
            },
            "banner": {
                "subtitle": "Aquí está el estado de tu inventario — última actualización {time}.",
                "uploadBtn": "Subir nuevos datos",
                "forecastBtn": "Ver pronóstico →"
            },
            "urgent": {
                "title": "Requiere atención",
                "subtitle": "({count} artículos urgentes)",
                "riskScore": "Puntuación de riesgo: {score}/100",
                "atRisk": "{value} en riesgo",
                "btn": "Crear oferta →"
            },
            "stats": {
                "products": "Productos rastreados",
                "productsSub": "{count} pronósticos generados",
                "highRisk": "Artículos de alto riesgo",
                "highRiskSubSafe": "Todos los artículos están seguros",
                "highRiskSub": "{value} en riesgo",
                "foodSaved": "Alimentos salvados (Total)",
                "foodSavedSub": "{value} t CO₂ evitadas"
            },
            "actions": {
                "title": "Acciones recomendadas",
                "urgentTitle": "{count} artículos de alto riesgo requieren atención",
                "urgentDesc": "{value} de pérdida potencial",
                "urgentBtn": "Crear ofertas",
                "forecastTitle": "Último pronóstico listo",
                "forecastDesc": "Basado en {file}",
                "forecastBtn": "Ver pronóstico",
                "impactTitle": "Has evitado {value} de desperdicio de alimentos",
                "impactDesc": "{value} ingresos salvados",
                "impactBtn": "Ver informe de impacto",
                "uploadTitle": "Mantén los pronósticos precisos",
                "uploadDesc": "Sube nuevos datos semanalmente para mejores resultados",
                "uploadBtn": "Subir datos"
            },
            "recent": {
                "title": "Actividad reciente",
                "upload": "Datos subidos — <strong>{file}</strong>",
                "highRisk": "<strong>{count} artículos de alto riesgo</strong> detectados en el pronóstico",
                "impact": "Impacto actualizado — <strong>{value}</strong> de desperdicio evitado en total",
                "today": "Hoy",
                "viewAll": "Ver todos los pronósticos →"
            },
            "quick": {
                "title": "Acciones rápidas",
                "manageSurplus": "Gestionar excedente"
            },
            "lastUpload": {
                "title": "Última subida",
                "validRows": "{count} filas válidas",
                "products": "{count} productos",
                "processed": "Procesado",
                "btn": "Subir nuevo →"
            }
        }
    },
    "it": {
        "greeting": "Buongiorno",
        "requiresAttention": "Richiede attenzione",
        "uploadNewData": "Carica nuovi dati",
        "viewForecast": "Visualizza previsioni",
        "productsTracked": "Prodotti tracciati",
        "highRiskItems": "Articoli ad alto rischio",
        "foodSaved": "Cibo salvato",
        "recommendedActions": "Azioni consigliate",
        "leaderboard": {
            "title": "🏆 Classifica di Amsterdam",
            "rank": "Sei al posto #{rank} su {total} aziende",
            "viewFull": "Visualizza classifica completa →"
        },
        "nav": {
            "dashboard": "Dashboard",
            "upload": "Carica",
            "forecast": "Previsioni",
            "surplus": "Eccedenze",
            "offers": "Offerte",
            "impact": "Impatto",
            "settings": "Impostazioni"
        },
        "header": {
            "searchPlaceholder": "Cerca inventario...",
            "notifications": "Notifiche",
            "profile": "Profilo",
            "signOut": "Esci",
            "loading": "Caricamento…"
        },
        "page": {
            "greeting": {
                "morning": "Buongiorno",
                "afternoon": "Buon pomeriggio",
                "evening": "Buonasera",
                "welcome": "Benvenuto"
            },
            "empty": {
                "subtitle": "Impostiamo i dati del tuo inventario.",
                "getStarted": "Inizia",
                "title": "Carica il tuo primo file di dati per sbloccare le previsioni",
                "desc": "Ci vogliono meno di 5 minuti. Carica un file CSV o Excel con i tuoi dati di vendita e di magazzino per vedere le previsioni della domanda, l'analisi dei rischi e le metriche di impatto.",
                "btn": "Carica ora →"
            },
            "banner": {
                "subtitle": "Ecco lo stato del tuo inventario — ultimo aggiornamento {time}.",
                "uploadBtn": "Carica nuovi dati",
                "forecastBtn": "Visualizza previsioni →"
            },
            "urgent": {
                "title": "Richiede attenzione",
                "subtitle": "({count} articoli urgenti)",
                "riskScore": "Punteggio di rischio: {score}/100",
                "atRisk": "{value} a rischio",
                "btn": "Crea offerta →"
            },
            "stats": {
                "products": "Prodotti tracciati",
                "productsSub": "{count} previsioni generate",
                "highRisk": "Articoli ad alto rischio",
                "highRiskSubSafe": "Tutti gli articoli al sicuro",
                "highRiskSub": "{value} a rischio",
                "foodSaved": "Cibo salvato (Totale)",
                "foodSavedSub": "{value} t di CO₂ evitate"
            },
            "actions": {
                "title": "Azioni consigliate",
                "urgentTitle": "{count} articoli ad alto rischio richiedono attenzione",
                "urgentDesc": "{value} di potenziale perdita",
                "urgentBtn": "Crea offerte",
                "forecastTitle": "Ultime previsioni pronte",
                "forecastDesc": "Basato su {file}",
                "forecastBtn": "Visualizza previsioni",
                "impactTitle": "Hai evitato {value} di spreco alimentare",
                "impactDesc": "{value} entrate salvate",
                "impactBtn": "Vedi rapporto di impatto",
                "uploadTitle": "Mantieni le previsioni accurate",
                "uploadDesc": "Carica nuovi dati settimanalmente per risultati ottimali",
                "uploadBtn": "Carica dati"
            },
            "recent": {
                "title": "Attività recente",
                "upload": "Dati caricati — <strong>{file}</strong>",
                "highRisk": "<strong>{count} articoli ad alto rischio</strong> rilevati nelle previsioni",
                "impact": "Impatto aggiornato — <strong>{value}</strong> di sprechi evitati in totale",
                "today": "Oggi",
                "viewAll": "Visualizza tutte le previsioni →"
            },
            "quick": {
                "title": "Azioni rapide",
                "manageSurplus": "Gestisci eccedenze"
            },
            "lastUpload": {
                "title": "Ultimo caricamento",
                "validRows": "{count} righe valide",
                "products": "{count} prodotti",
                "processed": "Elaborato",
                "btn": "Carica nuovo →"
            }
        }
    },
    "nl": {
        "greeting": "Goedemorgen",
        "requiresAttention": "Vereist aandacht",
        "uploadNewData": "Nieuwe data uploaden",
        "viewForecast": "Bekijk voorspelling",
        "productsTracked": "Gevolgde producten",
        "highRiskItems": "Risicovolle items",
        "foodSaved": "Gered voedsel",
        "recommendedActions": "Aanbevolen acties",
        "leaderboard": {
            "title": "🏆 Amsterdam Ranglijst",
            "rank": "Je staat op plaats #{rank} van {total} bedrijven",
            "viewFull": "Bekijk volledige ranglijst →"
        },
        "nav": {
            "dashboard": "Dashboard",
            "upload": "Uploaden",
            "forecast": "Voorspelling",
            "surplus": "Overschot",
            "offers": "Aanbiedingen",
            "impact": "Impact",
            "settings": "Instellingen"
        },
        "header": {
            "searchPlaceholder": "Zoek voorraad...",
            "notifications": "Meldingen",
            "profile": "Profiel",
            "signOut": "Uitloggen",
            "loading": "Laden…"
        },
        "page": {
            "greeting": {
                "morning": "Goedemorgen",
                "afternoon": "Goedemiddag",
                "evening": "Goedenavond",
                "welcome": "Welkom"
            },
            "empty": {
                "subtitle": "Laten we je voorraaddata instellen.",
                "getStarted": "Aan de slag",
                "title": "Upload je eerste databestand om voorspellingen te ontgrendelen",
                "desc": "Het duurt minder dan 5 minuten. Upload een CSV- of Excel-bestand met je verkoop- en voorraaddata om vraagvoorspellingen, risicoanalyses en impactstatistieken te zien.",
                "btn": "Nu uploaden →"
            },
            "banner": {
                "subtitle": "Hier is je voorraadstatus — laatst bijgewerkt {time}.",
                "uploadBtn": "Nieuwe data uploaden",
                "forecastBtn": "Bekijk voorspelling →"
            },
            "urgent": {
                "title": "Vereist aandacht",
                "subtitle": "({count} urgente items)",
                "riskScore": "Risicoscore: {score}/100",
                "atRisk": "{value} in gevaar",
                "btn": "Aanbieding maken →"
            },
            "stats": {
                "products": "Gevolgde producten",
                "productsSub": "{count} voorspellingen gegenereerd",
                "highRisk": "Risicovolle items",
                "highRiskSubSafe": "Alle items veilig",
                "highRiskSub": "{value} in gevaar",
                "foodSaved": "Gered voedsel (Totaal)",
                "foodSavedSub": "{value} t CO₂ vermeden"
            },
            "actions": {
                "title": "Aanbevolen acties",
                "urgentTitle": "{count} risicovolle items vereisen aandacht",
                "urgentDesc": "{value} potentieel verlies",
                "urgentBtn": "Aanbiedingen maken",
                "forecastTitle": "Nieuwste voorspelling klaar",
                "forecastDesc": "Gebaseerd op {file}",
                "forecastBtn": "Bekijk voorspelling",
                "impactTitle": "Je hebt {value} voedselverspilling voorkomen",
                "impactDesc": "{value} omzet gered",
                "impactBtn": "Bekijk impactrapport",
                "uploadTitle": "Houd voorspellingen accuraat",
                "uploadDesc": "Upload wekelijks nieuwe data voor de beste resultaten",
                "uploadBtn": "Data uploaden"
            },
            "recent": {
                "title": "Recente activiteit",
                "upload": "Data geüpload — <strong>{file}</strong>",
                "highRisk": "<strong>{count} risicovolle items</strong> gedetecteerd in voorspelling",
                "impact": "Impact bijgewerkt — <strong>{value}</strong> verspilling voorkomen in totaal",
                "today": "Vandaag",
                "viewAll": "Bekijk alle voorspellingen →"
            },
            "quick": {
                "title": "Snelle acties",
                "manageSurplus": "Beheer overschot"
            },
            "lastUpload": {
                "title": "Laatste upload",
                "validRows": "{count} geldige rijen",
                "products": "{count} producten",
                "processed": "Verwerkt",
                "btn": "Nieuw uploaden →"
            }
        }
    },
    "pl": {
        "greeting": "Dzień dobry",
        "requiresAttention": "Wymaga uwagi",
        "uploadNewData": "Prześlij nowe dane",
        "viewForecast": "Zobacz prognozę",
        "productsTracked": "Śledzone produkty",
        "highRiskItems": "Przedmioty wysokiego ryzyka",
        "foodSaved": "Uratowana żywność",
        "recommendedActions": "Zalecane działania",
        "leaderboard": {
            "title": "🏆 Ranking Amsterdam",
            "rank": "Zajmujesz #{rank} miejsce na {total} firm",
            "viewFull": "Zobacz pełny ranking →"
        },
        "nav": {
            "dashboard": "Pulpit",
            "upload": "Prześlij",
            "forecast": "Prognoza",
            "surplus": "Nadwyżka",
            "offers": "Oferty",
            "impact": "Wpływ",
            "settings": "Ustawienia"
        },
        "header": {
            "searchPlaceholder": "Szukaj w ekwipunku...",
            "notifications": "Powiadomienia",
            "profile": "Profil",
            "signOut": "Wyloguj się",
            "loading": "Ładowanie…"
        },
        "page": {
            "greeting": {
                "morning": "Dzień dobry",
                "afternoon": "Dzień dobry",
                "evening": "Dobry wieczór",
                "welcome": "Witamy"
            },
            "empty": {
                "subtitle": "Skonfigurujmy dane Twojego ekwipunku.",
                "getStarted": "Rozpocznij",
                "title": "Prześlij swój pierwszy plik danych, aby odblokować prognozy",
                "desc": "Zajmie to mniej niż 5 minut. Prześlij plik CSV lub Excel z danymi sprzedaży i zapasów, aby zobaczyć prognozy popytu, analizę ryzyka i wskaźniki wpływu.",
                "btn": "Prześlij teraz →"
            },
            "banner": {
                "subtitle": "Oto stan Twojego ekwipunku — ostatnia aktualizacja {time}.",
                "uploadBtn": "Prześlij nowe dane",
                "forecastBtn": "Zobacz prognozę →"
            },
            "urgent": {
                "title": "Wymaga uwagi",
                "subtitle": "({count} pilnych przedmiotów)",
                "riskScore": "Ocena ryzyka: {score}/100",
                "atRisk": "{value} zagrożonych",
                "btn": "Utwórz ofertę →"
            },
            "stats": {
                "products": "Śledzone produkty",
                "productsSub": "{count} wygenerowanych prognoz",
                "highRisk": "Przedmioty wysokiego ryzyka",
                "highRiskSubSafe": "Wszystkie przedmioty są bezpieczne",
                "highRiskSub": "{value} zagrożonych",
                "foodSaved": "Uratowana żywność (Suma)",
                "foodSavedSub": "uniknięto {value} t CO₂"
            },
            "actions": {
                "title": "Zalecane działania",
                "urgentTitle": "{count} przedmiotów wysokiego ryzyka wymaga uwagi",
                "urgentDesc": "{value} potencjalnej straty",
                "urgentBtn": "Utwórz oferty",
                "forecastTitle": "Najnowsza prognoza gotowa",
                "forecastDesc": "Na podstawie {file}",
                "forecastBtn": "Zobacz prognozę",
                "impactTitle": "Zapobiegłeś {value} marnowania żywności",
                "impactDesc": "{value} uratowanych przychodów",
                "impactBtn": "Zobacz raport wpływu",
                "uploadTitle": "Utrzymuj dokładność prognoz",
                "uploadDesc": "Przesyłaj nowe dane co tydzień, aby uzyskać najlepsze wyniki",
                "uploadBtn": "Prześlij dane"
            },
            "recent": {
                "title": "Ostatnia aktywność",
                "upload": "Dane przesłane — <strong>{file}</strong>",
                "highRisk": "Wykryto <strong>{count} przedmiotów wysokiego ryzyka</strong> w prognozie",
                "impact": "Wpływ zaktualizowany — w sumie zapobiegnięto <strong>{value}</strong> odpadom",
                "today": "Dzisiaj",
                "viewAll": "Zobacz wszystkie prognozy →"
            },
            "quick": {
                "title": "Szybkie akcje",
                "manageSurplus": "Zarządzaj nadwyżką"
            },
            "lastUpload": {
                "title": "Ostatnie przesłanie",
                "validRows": "{count} prawidłowych wierszy",
                "products": "{count} produktów",
                "processed": "Przetworzono",
                "btn": "Prześlij nowe →"
            }
        }
    },
    "pt": {
        "greeting": "Bom dia",
        "requiresAttention": "Requer Atenção",
        "uploadNewData": "Enviar Novos Dados",
        "viewForecast": "Ver Previsão",
        "productsTracked": "Produtos Rastreados",
        "highRiskItems": "Itens de Alto Risco",
        "foodSaved": "Alimentos Salvos",
        "recommendedActions": "Ações Recomendadas",
        "leaderboard": {
            "title": "🏆 Classificação de Amsterdã",
            "rank": "Você está na posição #{rank} de {total} empresas",
            "viewFull": "Ver classificação completa →"
        },
        "nav": {
            "dashboard": "Painel",
            "upload": "Enviar",
            "forecast": "Previsão",
            "surplus": "Excedente",
            "offers": "Ofertas",
            "impact": "Impacto",
            "settings": "Configurações"
        },
        "header": {
            "searchPlaceholder": "Pesquisar inventário...",
            "notifications": "Notificações",
            "profile": "Perfil",
            "signOut": "Sair",
            "loading": "Carregando…"
        },
        "page": {
            "greeting": {
                "morning": "Bom dia",
                "afternoon": "Boa tarde",
                "evening": "Boa noite",
                "welcome": "Bem-vindo"
            },
            "empty": {
                "subtitle": "Vamos configurar os dados do seu inventário.",
                "getStarted": "Começar",
                "title": "Envie seu primeiro arquivo de dados para desbloquear previsões",
                "desc": "Leva menos de 5 minutos. Envie um arquivo CSV ou Excel com seus dados de vendas e estoque para ver previsões de demanda, análise de risco e métricas de impacto.",
                "btn": "Enviar Agora →"
            },
            "banner": {
                "subtitle": "Aqui está o status do seu inventário — última atualização {time}.",
                "uploadBtn": "Enviar Novos Dados",
                "forecastBtn": "Ver Previsão →"
            },
            "urgent": {
                "title": "Requer Atenção",
                "subtitle": "({count} itens urgentes)",
                "riskScore": "Pontuação de risco: {score}/100",
                "atRisk": "{value} em risco",
                "btn": "Criar Oferta →"
            },
            "stats": {
                "products": "Produtos Rastreados",
                "productsSub": "{count} previsões geradas",
                "highRisk": "Itens de Alto Risco",
                "highRiskSubSafe": "Todos os itens seguros",
                "highRiskSub": "{value} em risco",
                "foodSaved": "Alimentos Salvos (Total)",
                "foodSavedSub": "{value} t de CO₂ evitadas"
            },
            "actions": {
                "title": "Ações Recomendadas",
                "urgentTitle": "{count} itens de alto risco requerem atenção",
                "urgentDesc": "{value} de perda potencial",
                "urgentBtn": "Criar Ofertas",
                "forecastTitle": "Última previsão pronta",
                "forecastDesc": "Com base em {file}",
                "forecastBtn": "Ver Previsão",
                "impactTitle": "Você evitou {value} de desperdício de alimentos",
                "impactDesc": "{value} de receita salva",
                "impactBtn": "Ver Relatório de Impacto",
                "uploadTitle": "Mantenha as previsões precisas",
                "uploadDesc": "Envie novos dados semanalmente para obter os melhores resultados",
                "uploadBtn": "Enviar Dados"
            },
            "recent": {
                "title": "Atividade Recente",
                "upload": "Dados enviados — <strong>{file}</strong>",
                "highRisk": "<strong>{count} itens de alto risco</strong> detectados na previsão",
                "impact": "Impacto atualizado — <strong>{value}</strong> de desperdício evitado no total",
                "today": "Hoje",
                "viewAll": "Ver todas as previsões →"
            },
            "quick": {
                "title": "Ações Rápidas",
                "manageSurplus": "Gerenciar Excedente"
            },
            "lastUpload": {
                "title": "Último Envio",
                "validRows": "{count} linhas válidas",
                "products": "{count} produtos",
                "processed": "Processado",
                "btn": "Enviar Novo →"
            }
        }
    }
}

landing_translations = {
    "fr": {
        "navbar": {
            "product": "Produit",
            "pricing": "Tarification",
            "login": "Connexion",
            "getStarted": "Commencer"
        },
        "hero": {
            "badge": "NOUVEAU : Gestion des surplus par l'IA",
            "title1": "Arrêtez le gaspillage alimentaire frais",
            "title2": "Avant qu'il ne se produise",
            "subtitle": "Rejoignez des centaines d'entreprises alimentaires indépendantes utilisant l'IA pour prévoir avec précision la demande, éviter les surcommandes et transformer les stocks excédentaires en revenus récupérés.",
            "cta": "Commencez votre essai gratuit",
            "demo": "Réserver une démo"
        },
        "features": {
            "title": "Tout ce dont vous avez besoin pour gérer une opération zéro déchet",
            "subtitle": "Conçu pour les grossistes indépendants, les détaillants et les restaurants.",
            "f1Title": "Prévision de la demande",
            "f1Desc": "Importez votre historique de ventes et laissez notre IA prédire exactement la quantité d'aliments frais dont vous avez besoin pour les 7 prochains jours.",
            "f2Title": "Alertes de surplus",
            "f2Desc": "Soyez averti avant que les articles n'expirent. Nous identifions les stocks à haut risque afin que vous puissiez agir tôt.",
            "f3Title": "Offres automatisées",
            "f3Desc": "Transformez les surplus en revenus en créant instantanément des offres à prix réduit pour vos acheteurs B2B ou des associations caritatives locales."
        },
        "footer": {
            "copyright": "© 2026 FreshFlow. Tous droits réservés.",
            "terms": "Conditions de service",
            "privacy": "Politique de confidentialité"
        }
    },
    "de": {
        "navbar": {
            "product": "Produkt",
            "pricing": "Preise",
            "login": "Anmelden",
            "getStarted": "Loslegen"
        },
        "hero": {
            "badge": "NEU: KI-gestütztes Überschussmanagement",
            "title1": "Stoppen Sie frische Lebensmittelverschwendung",
            "title2": "Bevor sie passiert",
            "subtitle": "Schließen Sie sich Hunderten unabhängiger Lebensmittelunternehmen an, die KI nutzen, um die Nachfrage genau zu prognostizieren, Überbestellungen zu vermeiden und überschüssigen Bestand in Einnahmen umzuwandeln.",
            "cta": "Starten Sie Ihre kostenlose Testversion",
            "demo": "Demo buchen"
        },
        "features": {
            "title": "Alles, was Sie für einen Zero-Waste-Betrieb benötigen",
            "subtitle": "Speziell für unabhängige Großhändler, Einzelhändler und Restaurants entwickelt.",
            "f1Title": "Nachfrageprognose",
            "f1Desc": "Laden Sie Ihre Verkaufshistorie hoch und lassen Sie unsere KI genau vorhersagen, wie viel frische Lebensmittel Sie für die nächsten 7 Tage benötigen.",
            "f2Title": "Überschusswarnungen",
            "f2Desc": "Lassen Sie sich benachrichtigen, bevor Artikel ablaufen. Wir identifizieren Hochrisikobestände, damit Sie frühzeitig handeln können.",
            "f3Title": "Automatisierte Angebote",
            "f3Desc": "Verwandeln Sie Überschuss in Einnahmen, indem Sie sofort ermäßigte Angebote für Ihre B2B-Käufer oder lokale Wohltätigkeitsorganisationen erstellen."
        },
        "footer": {
            "copyright": "© 2026 FreshFlow. Alle Rechte vorbehalten.",
            "terms": "Nutzungsbedingungen",
            "privacy": "Datenschutzrichtlinie"
        }
    },
    "es": {
        "navbar": {
            "product": "Producto",
            "pricing": "Precios",
            "login": "Iniciar sesión",
            "getStarted": "Empezar"
        },
        "hero": {
            "badge": "NUEVO: Gestión de excedentes impulsada por IA",
            "title1": "Detén el desperdicio de alimentos frescos",
            "title2": "Antes de que ocurra",
            "subtitle": "Únete a cientos de empresas de alimentos independientes que utilizan IA para pronosticar con precisión la demanda, evitar sobrepedidos y convertir el inventario excedente en ingresos recuperados.",
            "cta": "Comienza tu prueba gratuita",
            "demo": "Reservar una demostración"
        },
        "features": {
            "title": "Todo lo que necesitas para una operación sin desperdicios",
            "subtitle": "Diseñado para mayoristas independientes, minoristas y restaurantes.",
            "f1Title": "Pronóstico de demanda",
            "f1Desc": "Sube tu historial de ventas y deja que nuestra IA prediga exactamente cuántos alimentos frescos necesitas para los próximos 7 días.",
            "f2Title": "Alertas de excedentes",
            "f2Desc": "Recibe notificaciones antes de que los artículos caduquen. Identificamos inventario de alto riesgo para que puedas actuar a tiempo.",
            "f3Title": "Ofertas automatizadas",
            "f3Desc": "Convierte los excedentes en ingresos creando instantáneamente ofertas con descuento para tus compradores B2B o organizaciones benéficas locales."
        },
        "footer": {
            "copyright": "© 2026 FreshFlow. Todos los derechos reservados.",
            "terms": "Términos de servicio",
            "privacy": "Política de privacidad"
        }
    },
    "it": {
        "navbar": {
            "product": "Prodotto",
            "pricing": "Prezzi",
            "login": "Accedi",
            "getStarted": "Inizia"
        },
        "hero": {
            "badge": "NUOVO: Gestione delle eccedenze basata su IA",
            "title1": "Ferma lo spreco di cibo fresco",
            "title2": "Prima che avvenga",
            "subtitle": "Unisciti a centinaia di aziende alimentari indipendenti che utilizzano l'IA per prevedere con precisione la domanda, prevenire ordini eccessivi e trasformare l'inventario in eccesso in entrate recuperate.",
            "cta": "Inizia la tua prova gratuita",
            "demo": "Prenota una demo"
        },
        "features": {
            "title": "Tutto ciò di cui hai bisogno per un'operazione a zero sprechi",
            "subtitle": "Progettato per grossisti indipendenti, rivenditori e ristoranti.",
            "f1Title": "Previsione della domanda",
            "f1Desc": "Carica la cronologia delle tue vendite e lascia che la nostra IA preveda esattamente quanto cibo fresco ti serve per i prossimi 7 giorni.",
            "f2Title": "Avvisi di eccedenza",
            "f2Desc": "Ricevi notifiche prima che gli articoli scadano. Identifichiamo l'inventario ad alto rischio in modo che tu possa agire in anticipo.",
            "f3Title": "Offerte automatizzate",
            "f3Desc": "Trasforma le eccedenze in entrate creando istantaneamente offerte scontate per i tuoi acquirenti B2B o associazioni di beneficenza locali."
        },
        "footer": {
            "copyright": "© 2026 FreshFlow. Tutti i diritti riservati.",
            "terms": "Termini di servizio",
            "privacy": "Informativa sulla privacy"
        }
    },
    "nl": {
        "navbar": {
            "product": "Product",
            "pricing": "Prijzen",
            "login": "Inloggen",
            "getStarted": "Aan de slag"
        },
        "hero": {
            "badge": "NIEUW: AI-gestuurd overschotbeheer",
            "title1": "Stop voedselverspilling",
            "title2": "Voordat het gebeurt",
            "subtitle": "Sluit je aan bij honderden onafhankelijke voedingsbedrijven die AI gebruiken om de vraag nauwkeurig te voorspellen, overbestelling te voorkomen en overtollige voorraad om te zetten in herwonnen omzet.",
            "cta": "Start je gratis proefperiode",
            "demo": "Boek een demo"
        },
        "features": {
            "title": "Alles wat je nodig hebt voor een zero-waste operatie",
            "subtitle": "Speciaal gebouwd voor onafhankelijke groothandels, retailers en restaurants.",
            "f1Title": "Vraagvoorspelling",
            "f1Desc": "Upload je verkoopgeschiedenis en laat onze AI precies voorspellen hoeveel vers voedsel je de komende 7 dagen nodig hebt.",
            "f2Title": "Overschotmeldingen",
            "f2Desc": "Ontvang een melding voordat items vervallen. We identificeren risicovolle voorraad zodat je vroegtijdig actie kunt ondernemen.",
            "f3Title": "Geautomatiseerde aanbiedingen",
            "f3Desc": "Zet overschot om in inkomsten door direct aanbiedingen met korting te maken voor je B2B-kopers of lokale goede doelen."
        },
        "footer": {
            "copyright": "© 2026 FreshFlow. Alle rechten voorbehouden.",
            "terms": "Servicevoorwaarden",
            "privacy": "Privacybeleid"
        }
    },
    "pl": {
        "navbar": {
            "product": "Produkt",
            "pricing": "Cennik",
            "login": "Zaloguj się",
            "getStarted": "Rozpocznij"
        },
        "hero": {
            "badge": "NOWOŚĆ: Zarządzanie nadwyżkami za pomocą AI",
            "title1": "Zatrzymaj marnowanie świeżej żywności",
            "title2": "Zanim to się stanie",
            "subtitle": "Dołącz do setek niezależnych firm spożywczych, które używają AI do dokładnego prognozowania popytu, zapobiegania zawyżonym zamówieniom i zamieniania nadwyżek zapasów w odzyskane przychody.",
            "cta": "Rozpocznij bezpłatny okres próbny",
            "demo": "Zarezerwuj demo"
        },
        "features": {
            "title": "Wszystko, czego potrzebujesz, aby prowadzić operację bez odpadów",
            "subtitle": "Stworzone dla niezależnych hurtowników, detalistów i restauracji.",
            "f1Title": "Prognozowanie popytu",
            "f1Desc": "Prześlij historię sprzedaży i pozwól naszej sztucznej inteligencji dokładnie przewidzieć, ile świeżej żywności potrzebujesz na kolejne 7 dni.",
            "f2Title": "Alerty o nadwyżkach",
            "f2Desc": "Otrzymuj powiadomienia, zanim produkty stracą ważność. Identyfikujemy zapasy o wysokim ryzyku, dzięki czemu możesz wcześnie podjąć działania.",
            "f3Title": "Zautomatyzowane oferty",
            "f3Desc": "Zamień nadwyżki na przychody, natychmiast tworząc oferty ze zniżką dla kupujących B2B lub lokalnych organizacji charytatywnych."
        },
        "footer": {
            "copyright": "© 2026 FreshFlow. Wszelkie prawa zastrzeżone.",
            "terms": "Warunki świadczenia usług",
            "privacy": "Polityka prywatności"
        }
    },
    "pt": {
        "navbar": {
            "product": "Produto",
            "pricing": "Preços",
            "login": "Entrar",
            "getStarted": "Começar"
        },
        "hero": {
            "badge": "NOVO: Gestão de excedentes com IA",
            "title1": "Pare o desperdício de alimentos frescos",
            "title2": "Antes que aconteça",
            "subtitle": "Junte-se a centenas de empresas independentes de alimentos que usam IA para prever a demanda com precisão, evitar pedidos excessivos e transformar o estoque excedente em receita recuperada.",
            "cta": "Inicie seu teste gratuito",
            "demo": "Agendar uma demonstração"
        },
        "features": {
            "title": "Tudo o que você precisa para uma operação sem desperdício",
            "subtitle": "Desenvolvido para atacadistas independentes, varejistas e restaurantes.",
            "f1Title": "Previsão de Demanda",
            "f1Desc": "Envie seu histórico de vendas e deixe nossa IA prever exatamente quantos alimentos frescos você precisa para os próximos 7 dias.",
            "f2Title": "Alertas de Excedentes",
            "f2Desc": "Receba notificações antes que os itens expirem. Identificamos estoque de alto risco para que você possa agir com antecedência.",
            "f3Title": "Ofertas Automatizadas",
            "f3Desc": "Transforme o excedente em receita criando instantaneamente ofertas com desconto para seus compradores B2B ou instituições de caridade locais."
        },
        "footer": {
            "copyright": "© 2026 FreshFlow. Todos os direitos reservados.",
            "terms": "Termos de Serviço",
            "privacy": "Política de Privacidade"
        }
    }
}

base_dir = Path(r"e:\FreshFlow\freshflow\messages")

for lang, content in dashboard_translations.items():
    lang_dir = base_dir / lang
    lang_dir.mkdir(parents=True, exist_ok=True)
    with open(lang_dir / "dashboard.json", "w", encoding="utf-8") as f:
        json.dump(content, f, ensure_ascii=False, indent=2)

for lang, content in landing_translations.items():
    lang_dir = base_dir / lang
    lang_dir.mkdir(parents=True, exist_ok=True)
    with open(lang_dir / "landing.json", "w", encoding="utf-8") as f:
        json.dump(content, f, ensure_ascii=False, indent=2)

print("Translations generated successfully.")
