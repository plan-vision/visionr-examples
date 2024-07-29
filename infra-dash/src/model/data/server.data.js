vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR01',
	values: {
	  name: {
		"en-US": "Web Server 01",
		"fr-FR": "Serveur Web 01"
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA01'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR02',
	values: {
	  name: {
		"en-US": "Web Server 02",
		"fr-FR": "Serveur Web 02",
		"bg-BG": "Уеб Сървър 02",
		"de-DE": "Webserver 02"
	  },
	  model: "Dell PowerEdge R730",
	  serial_number: "ABC123456789",
	  cpu_count: 12,
	  cpu_speed: 2400,
	  memory: 64,
	  storage: "2x 1TB SSD, 4x 2TB HDD",
	  status: "online",
	  last_updated: "2023-06-15T12:34:56Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP123'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'DELL'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA01'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR03',
	values: {
	  name: {
		"en-US": "Database Server 01",
		"fr-FR": "Serveur Base de Données 01",
		"bg-BG": "Сървър за База Данни 01", 
		"de-DE": "Datenbankserver 01"
	  },
	  model: "Dell PowerEdge R740",
	  serial_number: "XYZ987654321",
	  cpu_count: 16,
	  cpu_speed: 2800,
	  memory: 128,
	  storage: "4x 2TB SSD",
	  status: "online",
	  last_updated: "2023-05-30T09:12:34Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP456'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'DELL'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA02'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR04',
	values: {
	  name: {
		"en-US": "Database Server 02",
		"fr-FR": "Serveur Base de Données 02",
		"bg-BG": "Сървър за База Данни 02",
		"de-DE": "Datenbankserver 02" 
	  },
	  model: "Dell PowerEdge R740",
	  serial_number: "QRS123456789",
	  cpu_count: 16,
	  cpu_speed: 2800,
	  memory: 128,
	  storage: "4x 2TB SSD",
	  status: "online",
	  last_updated: "2023-07-01T15:23:45Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP789'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'DELL'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA02'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR05',
	values: {
	  name: {
		"en-US": "Application Server 01",
		"fr-FR": "Serveur d'Application 01",
		"bg-BG": "Приложен Сървър 01",
		"de-DE": "Anwendungsserver 01"
	  },
	  model: "HP ProLiant DL380 Gen10",
	  serial_number: "ABC987654321",
	  cpu_count: 24,
	  cpu_speed: 2700,
	  memory: 256,
	  storage: "2x 1TB SSD, 4x 4TB HDD",
	  status: "online",
	  last_updated: "2023-08-10T08:00:00Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP321'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'HP'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA03'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR06',
	values: {
	  name: {
		"en-US": "Application Server 02",
		"fr-FR": "Serveur d'Application 02",
		"bg-BG": "Приложен Сървър 02",
		"de-DE": "Anwendungsserver 02"
	  },
	  model: "HP ProLiant DL380 Gen10",
	  serial_number: "DEF123456789",
	  cpu_count: 24,
	  cpu_speed: 2700,
	  memory: 256,
	  storage: "2x 1TB SSD, 4x 4TB HDD",
	  status: "online",
	  last_updated: "2023-08-10T08:00:00Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP654'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'HP'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA03'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR07',
	values: {
	  name: {
		"en-US": "Cache Server 01",
		"fr-FR": "Serveur Cache 01",
		"bg-BG": "Кеш Сървър 01",
		"de-DE": "Cache-Server 01"
	  },
	  model: "Cisco UCS C220 M5",
	  serial_number: "GHI987654321",
	  cpu_count: 20,
	  cpu_speed: 2900,
	  memory: 384,
	  storage: "4x 800GB SSD",
	  status: "online",
	  last_updated: "2023-09-01T14:30:00Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP987'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'CISCO'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA04'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR08',
	values: {
	  name: {
		"en-US": "Cache Server 02",
		"fr-FR": "Serveur Cache 02",
		"bg-BG": "Кеш Сървър 02",
		"de-DE": "Cache-Server 02"
	  },
	  model: "Cisco UCS C220 M5",
	  serial_number: "JKL456789012",
	  cpu_count: 20,
	  cpu_speed: 2900,
	  memory: 384,
	  storage: "4x 800GB SSD",
	  status: "online",
	  last_updated: "2023-09-01T14:30:00Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP111'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'CISCO'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA04'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR09',
	values: {
	  name: {
		"en-US": "Monitoring Server 01",
		"fr-FR": "Serveur de Surveillance 01",
		"bg-BG": "Сървър за Мониторинг 01",
		"de-DE": "Überwachungsserver 01"
	  },
	  model: "Dell PowerEdge R440",
	  serial_number: "MNO123456789",
	  cpu_count: 8,
	  cpu_speed: 2600,
	  memory: 64,
	  storage: "2x 1TB HDD",
	  status: "online",
	  last_updated: "2023-07-15T11:45:00Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP222'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'DELL'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA05'
	  }
	}
  });
  
  vr.defineObject({
	SCHEMA: 'infra.server',
	code: 'SR10',
	values: {
	  name: {
		"en-US": "Monitoring Server 02",
		"fr-FR": "Serveur de Surveillance 02",
		"bg-BG": "Сървър за Мониторинг 02",
		"de-DE": "Überwachungsserver 02"
	  },
	  model: "Dell PowerEdge R440",
	  serial_number: "PQR987654321",
	  cpu_count: 8,
	  cpu_speed: 2600,
	  memory: 64,
	  storage: "2x 1TB HDD",
	  status: "online",
	  last_updated: "2023-07-15T11:45:00Z",
	  physical_admin: {
		SCHEMA: 'contacts.employee',
		code: 'EMP333'
	  },
	  vendor: {
		SCHEMA: 'contacts.vendor',
		code: 'DELL'
	  },
	  rack: {
		SCHEMA: 'infra.rack',
		code: 'RA05'
	  }
	}
  });