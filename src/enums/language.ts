export const Language = {
  Abkhazian: 'abk',
  Afar: 'aar',
  Afrikaans: 'afr',
  Akan: 'aka',
  Albanian: 'sqi',
  Amharic: 'amh',
  Arabic: 'ara',
  Aragonese: 'arg',
  Armenian: 'hye',
  Assamese: 'asm',
  Avaric: 'ava',
  Avestan: 'ave',
  Aymara: 'aym',
  Azerbaijani: 'aze',
  Bambara: 'bam',
  Bashkir: 'bak',
  Basque: 'eus',
  Belarusian: 'bel',
  Bengali: 'ben',
  Bislama: 'bis',
  Bosnian: 'bos',
  Breton: 'bre',
  Bulgarian: 'bul',
  Burmese: 'mya',
  Catalan: 'cat',
  Chamorro: 'cha',
  Chechen: 'che',
  Chichewa: 'nya',
  Chinese: 'zho',
  ChurchSlavonic: 'chu',
  Chuvash: 'chv',
  Cornish: 'cor',
  Corsican: 'cos',
  Cree: 'cre',
  Croatian: 'hrv',
  Czech: 'ces',
  Danish: 'dan',
  Divehi: 'div',
  Dutch: 'nld',
  Dzongkha: 'dzo',
  English: 'eng',
  Esperanto: 'epo',
  Estonian: 'est',
  Ewe: 'ewe',
  Faroese: 'fao',
  Fijian: 'fij',
  Finnish: 'fin',
  French: 'fra',
  WesternFrisian: 'fry',
  Fulah: 'ful',
  Gaelic: 'gla',
  Galician: 'glg',
  Ganda: 'lug',
  Georgian: 'kat',
  German: 'deu',
  Greek: 'ell',
  Kalaallisut: 'kal',
  Guarani: 'grn',
  Gujarati: 'guj',
  Haitian: 'hat',
  Hausa: 'hau',
  Hebrew: 'heb',
  Herero: 'her',
  Hindi: 'hin',
  HiriMotu: 'hmo',
  Hungarian: 'hun',
  Icelandic: 'isl',
  Ido: 'ido',
  Igbo: 'ibo',
  Indonesian: 'ind',
  Interlingua: 'ina',
  Interlingue: 'ile',
  Inuktitut: 'iku',
  Inupiaq: 'ipk',
  Irish: 'gle',
  Italian: 'ita',
  Japanese: 'jpn',
  Javanese: 'jav',
  Kannada: 'kan',
  Kanuri: 'kau',
  Kashmiri: 'kas',
  Kazakh: 'kaz',
  CentralKhmer: 'khm',
  Kikuyu: 'kik',
  Kinyarwanda: 'kin',
  Kirghiz: 'kir',
  Komi: 'kom',
  Kongo: 'kon',
  Korean: 'kor',
  Kuanyama: 'kua',
  Kurdish: 'kur',
  Lao: 'lao',
  Latin: 'lat',
  Latvian: 'lav',
  Limburgan: 'lim',
  Lingala: 'lin',
  Lithuanian: 'lit',
  LubaKatanga: 'lub',
  Luxembourgish: 'ltz',
  Macedonian: 'mkd',
  Malagasy: 'mlg',
  Malay: 'msa',
  Malayalam: 'mal',
  Maltese: 'mlt',
  Manx: 'glv',
  Maori: 'mri',
  Marathi: 'mar',
  Marshallese: 'mah',
  Mongolian: 'mon',
  Nauru: 'nau',
  Navajo: 'nav',
  NorthNdebele: 'nde',
  SouthNdebele: 'nbl',
  Ndonga: 'ndo',
  Nepali: 'nep',
  Norwegian: 'nor',
  NorwegianBokmål: 'nob',
  NorwegianNynorsk: 'nno',
  Occitan: 'oci',
  Ojibwa: 'oji',
  Oriya: 'ori',
  Oromo: 'orm',
  Ossetian: 'oss',
  Pali: 'pli',
  Pashto: 'pus',
  Persian: 'fas',
  Polish: 'pol',
  Portuguese: 'por',
  Punjabi: 'pan',
  Quechua: 'que',
  Romanian: 'ron',
  Romansh: 'roh',
  Rundi: 'run',
  Russian: 'rus',
  NorthernSami: 'sme',
  Samoan: 'smo',
  Sango: 'sag',
  Sanskrit: 'san',
  Sardinian: 'srd',
  Serbian: 'srp',
  Shona: 'sna',
  Sindhi: 'snd',
  Sinhala: 'sin',
  Slovak: 'slk',
  Slovenian: 'slv',
  Somali: 'som',
  SouthernSotho: 'sot',
  Spanish: 'spa',
  Sundanese: 'sun',
  Swahili: 'swa',
  Swati: 'ssw',
  Swedish: 'swe',
  Tagalog: 'tgl',
  Tahitian: 'tah',
  Tajik: 'tgk',
  Tamil: 'tam',
  Tatar: 'tat',
  Telugu: 'tel',
  Thai: 'tha',
  Tibetan: 'bod',
  Tigrinya: 'tir',
  Tonga: 'ton',
  Tsonga: 'tso',
  Tswana: 'tsn',
  Turkish: 'tur',
  Turkmen: 'tuk',
  Twi: 'twi',
  Uighur: 'uig',
  Ukrainian: 'ukr',
  Urdu: 'urd',
  Uzbek: 'uzb',
  Venda: 'ven',
  Vietnamese: 'vie',
  Volapük: 'vol',
  Walloon: 'wln',
  Welsh: 'cym',
  Wolof: 'wol',
  Xhosa: 'xho',
  SichuanYi: 'iii',
  Yiddish: 'yid',
  Yoruba: 'yor',
  Zhuang: 'zha',
  Zulu: 'zul',
} as const;

export type Language = (typeof Language)[keyof typeof Language];
