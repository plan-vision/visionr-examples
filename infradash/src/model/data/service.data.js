vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID01',
  values: {
    name: {
      "en-US": "Video Ingest Service",
      "fr-FR": "Service d'Ingestion Vidéo",
      "bg-BG": "Услуга за Приемане на Видео",
      "de-DE": "Video-Aufnahmedienst"
    },
    description: {
      "en-US": "Handles incoming video streams from various sources",
      "fr-FR": "Gère les flux vidéo entrants de diverses sources",
      "bg-BG": "Обработва входящи видео потоци от различни източници",
      "de-DE": "Verarbeitet eingehende Videostreams aus verschiedenen Quellen"
    },
    type: "application",
    status: "active",
    version: "2.3.1",
    last_updated: "2023-07-28T09:00:00Z",
    port: 8081,
    url: "https://ingest.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR01'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP101'
    },
    dependencies: []
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID02',
  values: {
    name: {
      "en-US": "Video Encoding Service",
      "fr-FR": "Service d'Encodage Vidéo",
      "bg-BG": "Услуга за Кодиране на Видео",
      "de-DE": "Video-Codierungsdienst"
    },
    description: {
      "en-US": "Encodes video streams into multiple formats and qualities",
      "fr-FR": "Encode les flux vidéo en plusieurs formats et qualités",
      "bg-BG": "Кодира видео потоци в множество формати и качества",
      "de-DE": "Codiert Videostreams in mehrere Formate und Qualitäten"
    },
    type: "application",
    status: "active",
    version: "3.1.0",
    last_updated: "2023-07-27T14:30:00Z",
    port: 8082,
    url: "https://encode.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR03'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP102'
    },
    dependencies: [{ SCHEMA: 'infra.service', code: 'VID01' }]
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID03',
  values: {
    name: {
      "en-US": "Global CDN",
      "fr-FR": "CDN Global",
      "bg-BG": "Глобална CDN",
      "de-DE": "Globales CDN"
    },
    description: {
      "en-US": "Distributes video content globally",
      "fr-FR": "Distribue le contenu vidéo globalement",
      "bg-BG": "Разпространява видео съдържание в световен мащаб",
      "de-DE": "Verteilt Videoinhalte global"
    },
    type: "cache",
    status: "active",
    version: "4.2.1",
    last_updated: "2023-07-26T11:15:00Z",
    port: 443,
    url: "https://cdn.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR05'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP103'
    },
    dependencies: [{ SCHEMA: 'infra.service', code: 'VID02' }]
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID04',
  values: {
    name: {
      "en-US": "Video Analytics Engine",
      "fr-FR": "Moteur d'Analyse Vidéo",
      "bg-BG": "Двигател за Видео Анализ",
      "de-DE": "Video-Analyseengine"
    },
    description: {
      "en-US": "Analyzes video content for insights",
      "fr-FR": "Analyse le contenu vidéo pour obtenir des informations",
      "bg-BG": "Анализира видео съдържанието за извличане на прозрения",
      "de-DE": "Analysiert Videoinhalte für Erkenntnisse"
    },
    type: "application",
    status: "active",
    version: "2.0.3",
    last_updated: "2023-07-25T16:45:00Z",
    port: 8083,
    url: "https://analytics.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR07'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP104'
    },
    dependencies: [{ SCHEMA: 'infra.service', code: 'VID01' }]
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID05',
  values: {
    name: {
      "en-US": "User Authentication Service",
      "fr-FR": "Service d'Authentification des Utilisateurs",
      "bg-BG": "Услуга за Удостоверяване на Потребители",
      "de-DE": "Benutzerauthentifizierungsdienst"
    },
    description: {
      "en-US": "Manages user authentication and authorization",
      "fr-FR": "Gère l'authentification et l'autorisation des utilisateurs",
      "bg-BG": "Управлява удостоверяването и оторизацията на потребителите",
      "de-DE": "Verwaltet Benutzerauthentifizierung und -autorisierung"
    },
    type: "application",
    status: "active",
    version: "1.5.2",
    last_updated: "2023-07-24T10:30:00Z",
    port: 8084,
    url: "https://auth.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR09'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP105'
    },
    dependencies: []
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID06',
  values: {
    name: {
      "en-US": "Video Metadata Database",
      "fr-FR": "Base de Données des Métadonnées Vidéo",
      "bg-BG": "База Данни за Видео Метаданни",
      "de-DE": "Video-Metadaten-Datenbank"
    },
    description: {
      "en-US": "Stores metadata for all video content",
      "fr-FR": "Stocke les métadonnées de tout le contenu vidéo",
      "bg-BG": "Съхранява метаданни за цялото видео съдържание",
      "de-DE": "Speichert Metadaten für alle Videoinhalte"
    },
    type: "database",
    status: "active",
    version: "5.1.0",
    last_updated: "2023-07-23T13:20:00Z",
    port: 5432,
    url: "postgresql://metadata.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR11'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP106'
    },
    dependencies: []
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID07',
  values: {
    name: {
      "en-US": "Video Search Engine",
      "fr-FR": "Moteur de Recherche Vidéo",
      "bg-BG": "Търсачка за Видео",
      "de-DE": "Video-Suchmaschine"
    },
    description: {
      "en-US": "Provides fast and accurate video content search",
      "fr-FR": "Fournit une recherche rapide et précise du contenu vidéo",
      "bg-BG": "Предоставя бързо и точно търсене на видео съдържание",
      "de-DE": "Bietet schnelle und genaue Suche nach Videoinhalten"
    },
    type: "application",
    status: "active",
    version: "2.2.1",
    last_updated: "2023-07-22T09:45:00Z",
    port: 8085,
    url: "https://search.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR13'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP107'
    },
    dependencies: [{ SCHEMA: 'infra.service', code: 'VID06' }]
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID08',
  values: {
    name: {
      "en-US": "Video Recommendation Engine",
      "fr-FR": "Moteur de Recommandation Vidéo",
      "bg-BG": "Двигател за Препоръчване на Видео",
      "de-DE": "Video-Empfehlungsengine"
    },
    description: {
      "en-US": "Generates personalized video recommendations",
      "fr-FR": "Génère des recommandations vidéo personnalisées",
      "bg-BG": "Генерира персонализирани препоръки за видео",
      "de-DE": "Generiert personalisierte Videoempfehlungen"
    },
    type: "application",
    status: "active",
    version: "1.3.4",
    last_updated: "2023-07-21T15:10:00Z",
    port: 8086,
    url: "https://recommend.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR15'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP108'
    },
    dependencies: [
      { SCHEMA: 'infra.service', code: 'VID06' },
      { SCHEMA: 'infra.service', code: 'VID04' }
    ]
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID09',
  values: {
    name: {
      "en-US": "System Monitoring Service",
      "fr-FR": "Service de Surveillance du Système",
      "bg-BG": "Услуга за Наблюдение на Системата",
      "de-DE": "System-Überwachungsdienst"
    },
    description: {
      "en-US": "Monitors all services and infrastructure",
      "fr-FR": "Surveille tous les services et l'infrastructure",
      "bg-BG": "Наблюдава всички услуги и инфраструктура",
      "de-DE": "Überwacht alle Dienste und Infrastruktur"
    },
    type: "monitoring",
    status: "active",
    version: "3.0.1",
    last_updated: "2023-07-20T11:55:00Z",
    port: 9090,
    url: "https://monitor.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR17'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP109'
    },
    dependencies: []
  }
});


// ... [Previous 9 services remain unchanged] ...

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID10',
  values: {
    name: {
      "en-US": "User Interaction Analytics",
      "fr-FR": "Analyse des Interactions Utilisateurs",
      "bg-BG": "Анализ на Потребителските Взаимодействия",
      "de-DE": "Benutzerinteraktionsanalyse"
    },
    description: {
      "en-US": "Tracks and analyzes user engagement and behavior",
      "fr-FR": "Suit et analyse l'engagement et le comportement des utilisateurs",
      "bg-BG": "Проследява и анализира ангажираността и поведението на потребителите",
      "de-DE": "Verfolgt und analysiert Benutzerengagement und -verhalten"
    },
    type: "application",
    status: "active",
    version: "1.2.0",
    last_updated: "2023-07-19T14:20:00Z",
    port: 8087,
    url: "https://interaction-analytics.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR19'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP110'
    },
    dependencies: [
      { SCHEMA: 'infra.service', code: 'VID04' },
      { SCHEMA: 'infra.service', code: 'VID05' }
    ]
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID11',
  values: {
    name: {
      "en-US": "Content Moderation System",
      "fr-FR": "Système de Modération de Contenu",
      "bg-BG": "Система за Модерация на Съдържанието",
      "de-DE": "Inhaltsmoderierungssystem"
    },
    description: {
      "en-US": "Automatically screens and moderates user-generated content",
      "fr-FR": "Filtre et modère automatiquement le contenu généré par les utilisateurs",
      "bg-BG": "Автоматично проверява и модерира съдържание, генерирано от потребители",
      "de-DE": "Überprüft und moderiert automatisch benutzergenerierte Inhalte"
    },
    type: "application",
    status: "active",
    version: "2.1.3",
    last_updated: "2023-07-18T10:15:00Z",
    port: 8088,
    url: "https://content-moderation.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR20'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP111'
    },
    dependencies: [
      { SCHEMA: 'infra.service', code: 'VID01' },
      { SCHEMA: 'infra.service', code: 'VID04' }
    ]
  }
});

vr.defineObject({
  SCHEMA: 'infra.service',
  code: 'VID12',
  values: {
    name: {
      "en-US": "DRM and Content Protection",
      "fr-FR": "DRM et Protection du Contenu",
      "bg-BG": "DRM и Защита на Съдържанието",
      "de-DE": "DRM und Inhaltsschutz"
    },
    description: {
      "en-US": "Manages digital rights and protects content from unauthorized access",
      "fr-FR": "Gère les droits numériques et protège le contenu contre l'accès non autorisé",
      "bg-BG": "Управлява цифровите права и защитава съдържанието от неоторизиран достъп",
      "de-DE": "Verwaltet digitale Rechte und schützt Inhalte vor unbefugtem Zugriff"
    },
    type: "application",
    status: "active",
    version: "3.0.2",
    last_updated: "2023-07-17T09:30:00Z",
    port: 8089,
    url: "https://drm.videonetwork.com",
    server: {
      SCHEMA: 'infra.server',
      code: 'SR21'
    },
    owner: {
      SCHEMA: 'contacts.employee',
      code: 'EMP112'
    },
    dependencies: [
      { SCHEMA: 'infra.service', code: 'VID02' },
      { SCHEMA: 'infra.service', code: 'VID03' },
      { SCHEMA: 'infra.service', code: 'VID05' }
    ]
  }
});