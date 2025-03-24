vr.defineObject({
    SCHEMA: 'infra.rack',
    code: 'RA01',
    values: {
      name: {
        "en-US": "Rack 01",
        "fr-FR": "Rack 01",
        "bg-BG": "Рак 01",
        "de-DE": "Rack 01"
      },
      model: "APC NetShelter SX 42U",
      serial_number: "APCRK0001",
      height: 42,
      max_power: 10000,
      status: "operational",
      last_maintained: "2023-05-15",
      current_power_usage: 6500,
      temperature: 22.5,
      humidity: 45.0,
      last_reading_time: "2023-07-28T10:15:30Z",
      colocation: {
        SCHEMA: 'infra.colocation',
        code: 'CO01'
      }
    }
  });
  
  vr.defineObject({
    SCHEMA: 'infra.rack',
    code: 'RA02',
    values: {
      name: {
        "en-US": "Rack 02",
        "fr-FR": "Rack 02",
        "bg-BG": "Рак 02",
        "de-DE": "Rack 02"
      },
      model: "Dell PowerEdge 4220",
      serial_number: "DLRK0002",
      height: 42,
      max_power: 8000,
      status: "maintenance",
      last_maintained: "2023-07-20",
      current_power_usage: 2000,
      temperature: 24.0,
      humidity: 48.5,
      last_reading_time: "2023-07-28T10:15:30Z",
      colocation: {
        SCHEMA: 'infra.colocation',
        code: 'CO01'
      }
    }
  });
  
  vr.defineObject({
    SCHEMA: 'infra.rack',
    code: 'RA03',
    values: {
      name: {
        "en-US": "Rack 01",
        "fr-FR": "Rack 01",
        "bg-BG": "Рак 01",
        "de-DE": "Rack 01"
      },
      model: "HPE G2 Enterprise Shock Rack",
      serial_number: "HPERK0003",
      height: 48,
      max_power: 12000,
      status: "operational",
      last_maintained: "2023-06-10",
      current_power_usage: 9000,
      temperature: 23.0,
      humidity: 46.5,
      last_reading_time: "2023-07-28T10:15:30Z",
      colocation: {
        SCHEMA: 'infra.colocation',
        code: 'CO02'
      }
    }
  });
  
  vr.defineObject({
    SCHEMA: 'infra.rack',
    code: 'RA04',
    values: {
      name: {
        "en-US": "Rack 02",
        "fr-FR": "Rack 02",
        "bg-BG": "Рак 02",
        "de-DE": "Rack 02"
      },
      model: "Lenovo Dynamic SmartRack",
      serial_number: "LNVRK0004",
      height: 42,
      max_power: 9000,
      status: "operational",
      last_maintained: "2023-07-05",
      current_power_usage: 7500,
      temperature: 22.8,
      humidity: 47.0,
      last_reading_time: "2023-07-28T10:15:30Z",
      colocation: {
        SCHEMA: 'infra.colocation',
        code: 'CO02'
      }
    }
  });
  
  vr.defineObject({
    SCHEMA: 'infra.rack',
    code: 'RA05',
    values: {
      name: {
        "en-US": "Rack 01",
        "fr-FR": "Rack 01",
        "bg-BG": "Рак 01",
        "de-DE": "Rack 01"
      },
      model: "Tripp Lite SR42UBDP",
      serial_number: "TPRK0005",
      height: 42,
      max_power: 7500,
      status: "offline",
      last_maintained: "2023-07-25",
      current_power_usage: 0,
      temperature: 21.5,
      humidity: 44.5,
      last_reading_time: "2023-07-28T10:15:30Z",
      colocation: {
        SCHEMA: 'infra.colocation',
        code: 'CO03'
      }
    }
  });