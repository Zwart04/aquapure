export const PRODUCTS = {
  "aquapure": {
    "accent": "#5bbc92",
    "currency": "IDR",
    "tagline": "Know your field. Act on your data.",
    "modules": [
      {
        "key": "sites",
        "label": "Lokasi",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "lat",
            "label": "Latitude",
            "type": "number",
            "min": -90,
            "max": 90
          },
          {
            "key": "lng",
            "label": "Longitude",
            "type": "number",
            "min": -180,
            "max": 180
          },
          {
            "key": "area",
            "label": "Luas ha",
            "type": "number",
            "min": 0
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "sensors",
        "label": "Sensor",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "site_id",
            "label": "Lokasi",
            "type": "ref",
            "ref": "sites",
            "required": true
          },
          {
            "key": "identifier",
            "label": "Identifier",
            "type": "text"
          },
          {
            "key": "type",
            "label": "Jenis sensor",
            "type": "text"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "water_samples",
        "label": "Sampel air",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "site_id",
            "label": "Lokasi",
            "type": "ref",
            "ref": "sites",
            "required": true
          },
          {
            "key": "sensor_id",
            "label": "Sensor",
            "type": "ref",
            "ref": "sensors",
            "required": false
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "ph",
            "label": "pH",
            "type": "number",
            "required": true,
            "min": 0,
            "max": 14
          },
          {
            "key": "turbidity",
            "label": "Kekeruhan NTU",
            "type": "number",
            "min": 0
          },
          {
            "key": "temperature",
            "label": "Suhu °C",
            "type": "number",
            "min": -30,
            "max": 100
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "thresholds",
        "label": "Ambang pengukuran",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "site_id",
            "label": "Lokasi",
            "type": "ref",
            "ref": "sites",
            "required": true
          },
          {
            "key": "metric",
            "label": "Parameter",
            "type": "select",
            "options": [
              "ph",
              "turbidity",
              "temperature"
            ]
          },
          {
            "key": "minimum",
            "label": "Minimum",
            "type": "number"
          },
          {
            "key": "maximum",
            "label": "Maximum",
            "type": "number"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "alerts",
        "label": "Alert",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "site_id",
            "label": "Lokasi",
            "type": "ref",
            "ref": "sites",
            "required": false
          },
          {
            "key": "sample_id",
            "label": "Sampel",
            "type": "ref",
            "ref": "water_samples",
            "required": false
          },
          {
            "key": "description",
            "label": "Keterangan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "open",
          "acknowledged",
          "resolved"
        ]
      },
      {
        "key": "crops",
        "label": "Tanaman",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "site_id",
            "label": "Lokasi",
            "type": "ref",
            "ref": "sites",
            "required": true
          },
          {
            "key": "variety",
            "label": "Varietas",
            "type": "text"
          },
          {
            "key": "planting_date",
            "label": "Tanggal tanam",
            "type": "date"
          },
          {
            "key": "area",
            "label": "Luas ha",
            "type": "number",
            "min": 0
          }
        ],
        "statuses": [
          "growing",
          "harvested",
          "closed"
        ]
      },
      {
        "key": "activities",
        "label": "Aktivitas lapangan",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "site_id",
            "label": "Lokasi",
            "type": "ref",
            "ref": "sites",
            "required": true
          },
          {
            "key": "crop_id",
            "label": "Tanaman",
            "type": "ref",
            "ref": "crops",
            "required": false
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "notes",
            "label": "Catatan",
            "type": "textarea"
          }
        ],
        "statuses": [
          "planned",
          "done"
        ]
      },
      {
        "key": "inputs",
        "label": "Input pertanian",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "crop_id",
            "label": "Tanaman",
            "type": "ref",
            "ref": "crops",
            "required": true
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "quantity",
            "label": "Jumlah",
            "type": "number",
            "min": 0
          },
          {
            "key": "unit",
            "label": "Satuan",
            "type": "text"
          },
          {
            "key": "cost",
            "label": "Biaya",
            "type": "money"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "harvests",
        "label": "Panen",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "crop_id",
            "label": "Tanaman",
            "type": "ref",
            "ref": "crops",
            "required": true
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "weight",
            "label": "Berat kg",
            "type": "number",
            "min": 0
          },
          {
            "key": "revenue",
            "label": "Pendapatan",
            "type": "money"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "emissions",
        "label": "Aktivitas emisi",
        "fields": [
          {
            "key": "name",
            "label": "Nama / judul",
            "type": "text",
            "required": true
          },
          {
            "key": "date",
            "label": "Tanggal",
            "type": "date",
            "required": true
          },
          {
            "key": "quantity",
            "label": "Aktivitas",
            "type": "number",
            "min": 0
          },
          {
            "key": "factor",
            "label": "Faktor kgCO2e per unit",
            "type": "number",
            "min": 0
          },
          {
            "key": "source",
            "label": "Sumber faktor",
            "type": "text",
            "required": true
          },
          {
            "key": "unit",
            "label": "Unit",
            "type": "text"
          }
        ],
        "statuses": [
          "active",
          "archived"
        ]
      },
      {
        "key": "field-map",
        "label": "Peta lokasi",
        "tool": "field-map",
        "fields": []
      },
      {
        "key": "ingestion",
        "label": "Integrasi sensor",
        "tool": "ingestion",
        "fields": []
      },
      {
        "key": "reports",
        "label": "Laporan",
        "tool": "reports",
        "fields": [],
        "statuses": []
      }
    ],
    "id": "aquapure",
    "name": "AquaPure Field Intelligence",
    "purpose": "Workspace lapangan untuk pengukuran air, pertanian, input, hasil panen dan catatan emisi.",
    "sources": [
      "aquapure",
      "farmlog",
      "carbontrack"
    ],
    "workflow": "Lokasi → pengukuran manual atau API sensor → evaluasi ambang milik pengguna → alert → tindakan lapangan; kegiatan dan panen dikaitkan ke lokasi, emisi dihitung dari faktor yang dicatat."
  }
};
