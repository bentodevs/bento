const currencySymbols = [
    {
        "name": "United Arab Emirates Dirham",
        "value": "AED"
    },
    {
        "name": "Afghan Afghani",
        "value": "AFN"
    },
    {
        "name": "Albanian Lek",
        "value": "ALL"
    },
    {
        "name": "Armenian Dram",
        "value": "AMD"
    },
    {
        "name": "Netherlands Antillean Guilder",
        "value": "ANG"
    },
    {
        "name": "Angolan Kwanza",
        "value": "AOA"
    },
    {
        "name": "Argentine Peso",
        "value": "ARS"
    },
    {
        "name": "Australian Dollar",
        "value": "AUD"
    },
    {
        "name": "Aruban Florin",
        "value": "AWG"
    },
    {
        "name": "Azerbaijani Manat",
        "value": "AZN"
    },
    {
        "name": "Bosnia-Herzegovina Convertible Mark",
        "value": "BAM"
    },
    {
        "name": "Barbadian Dollar",
        "value": "BBD"
    },
    {
        "name": "Bangladeshi Taka",
        "value": "BDT"
    },
    {
        "name": "Bulgarian Lev",
        "value": "BGN"
    },
    {
        "name": "Bahraini Dinar",
        "value": "BHD"
    },
    {
        "name": "Burundian Franc",
        "value": "BIF"
    },
    {
        "name": "Bermudan Dollar",
        "value": "BMD"
    },
    {
        "name": "Brunei Dollar",
        "value": "BND"
    },
    {
        "name": "Bolivian Boliviano",
        "value": "BOB"
    },
    {
        "name": "Brazilian Real",
        "value": "BRL"
    },
    {
        "name": "Bahamian Dollar",
        "value": "BSD"
    },
    {
        "name": "Bitcoin",
        "value": "BTC"
    },
    {
        "name": "Bhutanese Ngultrum",
        "value": "BTN"
    },
    {
        "name": "Botswanan Pula",
        "value": "BWP"
    },
    {
        "name": "Belarusian Ruble",
        "value": "BYN"
    },
    {
        "name": "Belize Dollar",
        "value": "BZD"
    },
    {
        "name": "Canadian Dollar",
        "value": "CAD"
    },
    {
        "name": "Congolese Franc",
        "value": "CDF"
    },
    {
        "name": "Swiss Franc",
        "value": "CHF"
    },
    {
        "name": "Chilean Unit of Account (UF)",
        "value": "CLF"
    },
    {
        "name": "Chilean Peso",
        "value": "CLP"
    },
    {
        "name": "Chinese Yuan (Offshore)",
        "value": "CNH"
    },
    {
        "name": "Chinese Yuan",
        "value": "CNY"
    },
    {
        "name": "Colombian Peso",
        "value": "COP"
    },
    {
        "name": "Costa Rican Colón",
        "value": "CRC"
    },
    {
        "name": "Cuban Convertible Peso",
        "value": "CUC"
    },
    {
        "name": "Cuban Peso",
        "value": "CUP"
    },
    {
        "name": "Cape Verdean Escudo",
        "value": "CVE"
    },
    {
        "name": "Czech Republic Koruna",
        "value": "CZK"
    },
    {
        "name": "Djiboutian Franc",
        "value": "DJF"
    },
    {
        "name": "Danish Krone",
        "value": "DKK"
    },
    {
        "name": "Dominican Peso",
        "value": "DOP"
    },
    {
        "name": "Algerian Dinar",
        "value": "DZD"
    },
    {
        "name": "Egyptian Pound",
        "value": "EGP"
    },
    {
        "name": "Eritrean Nakfa",
        "value": "ERN"
    },
    {
        "name": "Ethiopian Birr",
        "value": "ETB"
    },
    {
        "name": "Euro",
        "value": "EUR"
    },
    {
        "name": "Fijian Dollar",
        "value": "FJD"
    },
    {
        "name": "Falkland Islands Pound",
        "value": "FKP"
    },
    {
        "name": "British Pound Sterling",
        "value": "GBP"
    },
    {
        "name": "Georgian Lari",
        "value": "GEL"
    },
    {
        "name": "Guernsey Pound",
        "value": "GGP"
    },
    {
        "name": "Ghanaian Cedi",
        "value": "GHS"
    },
    {
        "name": "Gibraltar Pound",
        "value": "GIP"
    },
    {
        "name": "Gambian Dalasi",
        "value": "GMD"
    },
    {
        "name": "Guinean Franc",
        "value": "GNF"
    },
    {
        "name": "Guatemalan Quetzal",
        "value": "GTQ"
    },
    {
        "name": "Guyanaese Dollar",
        "value": "GYD"
    },
    {
        "name": "Hong Kong Dollar",
        "value": "HKD"
    },
    {
        "name": "Honduran Lempira",
        "value": "HNL"
    },
    {
        "name": "Croatian Kuna",
        "value": "HRK"
    },
    {
        "name": "Haitian Gourde",
        "value": "HTG"
    },
    {
        "name": "Hungarian Forint",
        "value": "HUF"
    },
    {
        "name": "Indonesian Rupiah",
        "value": "IDR"
    },
    {
        "name": "Israeli New Sheqel",
        "value": "ILS"
    },
    {
        "name": "Manx pound",
        "value": "IMP"
    },
    {
        "name": "Indian Rupee",
        "value": "INR"
    },
    {
        "name": "Iraqi Dinar",
        "value": "IQD"
    },
    {
        "name": "Iranian Rial",
        "value": "IRR"
    },
    {
        "name": "Icelandic Króna",
        "value": "ISK"
    },
    {
        "name": "Jersey Pound",
        "value": "JEP"
    },
    {
        "name": "Jamaican Dollar",
        "value": "JMD"
    },
    {
        "name": "Jordanian Dinar",
        "value": "JOD"
    },
    {
        "name": "Japanese Yen",
        "value": "JPY"
    },
    {
        "name": "Kenyan Shilling",
        "value": "KES"
    },
    {
        "name": "Kyrgystani Som",
        "value": "KGS"
    },
    {
        "name": "Cambodian Riel",
        "value": "KHR"
    },
    {
        "name": "Comorian Franc",
        "value": "KMF"
    },
    {
        "name": "North Korean Won",
        "value": "KPW"
    },
    {
        "name": "South Korean Won",
        "value": "KRW"
    },
    {
        "name": "Kuwaiti Dinar",
        "value": "KWD"
    },
    {
        "name": "Cayman Islands Dollar",
        "value": "KYD"
    },
    {
        "name": "Kazakhstani Tenge",
        "value": "KZT"
    },
    {
        "name": "Laotian Kip",
        "value": "LAK"
    },
    {
        "name": "Lebanese Pound",
        "value": "LBP"
    },
    {
        "name": "Sri Lankan Rupee",
        "value": "LKR"
    },
    {
        "name": "Liberian Dollar",
        "value": "LRD"
    },
    {
        "name": "Lesotho Loti",
        "value": "LSL"
    },
    {
        "name": "Libyan Dinar",
        "value": "LYD"
    },
    {
        "name": "Moroccan Dirham",
        "value": "MAD"
    },
    {
        "name": "Moldovan Leu",
        "value": "MDL"
    },
    {
        "name": "Malagasy Ariary",
        "value": "MGA"
    },
    {
        "name": "Macedonian Denar",
        "value": "MKD"
    },
    {
        "name": "Myanma Kyat",
        "value": "MMK"
    },
    {
        "name": "Mongolian Tugrik",
        "value": "MNT"
    },
    {
        "name": "Macanese Pataca",
        "value": "MOP"
    },
    {
        "name": "Mauritanian Ouguiya (pre-2018)",
        "value": "MRO"
    },
    {
        "name": "Mauritanian Ouguiya",
        "value": "MRU"
    },
    {
        "name": "Mauritian Rupee",
        "value": "MUR"
    },
    {
        "name": "Maldivian Rufiyaa",
        "value": "MVR"
    },
    {
        "name": "Malawian Kwacha",
        "value": "MWK"
    },
    {
        "name": "Mexican Peso",
        "value": "MXN"
    },
    {
        "name": "Malaysian Ringgit",
        "value": "MYR"
    },
    {
        "name": "Mozambican Metical",
        "value": "MZN"
    },
    {
        "name": "Namibian Dollar",
        "value": "NAD"
    },
    {
        "name": "Nigerian Naira",
        "value": "NGN"
    },
    {
        "name": "Nicaraguan Córdoba",
        "value": "NIO"
    },
    {
        "name": "Norwegian Krone",
        "value": "NOK"
    },
    {
        "name": "Nepalese Rupee",
        "value": "NPR"
    },
    {
        "name": "New Zealand Dollar",
        "value": "NZD"
    },
    {
        "name": "Omani Rial",
        "value": "OMR"
    },
    {
        "name": "Panamanian Balboa",
        "value": "PAB"
    },
    {
        "name": "Peruvian Nuevo Sol",
        "value": "PEN"
    },
    {
        "name": "Papua New Guinean Kina",
        "value": "PGK"
    },
    {
        "name": "Philippine Peso",
        "value": "PHP"
    },
    {
        "name": "Pakistani Rupee",
        "value": "PKR"
    },
    {
        "name": "Polish Zloty",
        "value": "PLN"
    },
    {
        "name": "Paraguayan Guarani",
        "value": "PYG"
    },
    {
        "name": "Qatari Rial",
        "value": "QAR"
    },
    {
        "name": "Romanian Leu",
        "value": "RON"
    },
    {
        "name": "Serbian Dinar",
        "value": "RSD"
    },
    {
        "name": "Russian Ruble",
        "value": "RUB"
    },
    {
        "name": "Rwandan Franc",
        "value": "RWF"
    },
    {
        "name": "Saudi Riyal",
        "value": "SAR"
    },
    {
        "name": "Solomon Islands Dollar",
        "value": "SBD"
    },
    {
        "name": "Seychellois Rupee",
        "value": "SCR"
    },
    {
        "name": "Sudanese Pound",
        "value": "SDG"
    },
    {
        "name": "Swedish Krona",
        "value": "SEK"
    },
    {
        "name": "Singapore Dollar",
        "value": "SGD"
    },
    {
        "name": "Saint Helena Pound",
        "value": "SHP"
    },
    {
        "name": "Sierra Leonean Leone",
        "value": "SLL"
    },
    {
        "name": "Somali Shilling",
        "value": "SOS"
    },
    {
        "name": "Surinamese Dollar",
        "value": "SRD"
    },
    {
        "name": "South Sudanese Pound",
        "value": "SSP"
    },
    {
        "name": "São Tomé and Príncipe Dobra (pre-2018)",
        "value": "STD"
    },
    {
        "name": "São Tomé and Príncipe Dobra",
        "value": "STN"
    },
    {
        "name": "Salvadoran Colón",
        "value": "SVC"
    },
    {
        "name": "Syrian Pound",
        "value": "SYP"
    },
    {
        "name": "Swazi Lilangeni",
        "value": "SZL"
    },
    {
        "name": "Thai Baht",
        "value": "THB"
    },
    {
        "name": "Tajikistani Somoni",
        "value": "TJS"
    },
    {
        "name": "Turkmenistani Manat",
        "value": "TMT"
    },
    {
        "name": "Tunisian Dinar",
        "value": "TND"
    },
    {
        "name": "Tongan Pa'anga",
        "value": "TOP"
    },
    {
        "name": "Turkish Lira",
        "value": "TRY"
    },
    {
        "name": "Trinidad and Tobago Dollar",
        "value": "TTD"
    },
    {
        "name": "New Taiwan Dollar",
        "value": "TWD"
    },
    {
        "name": "Tanzanian Shilling",
        "value": "TZS"
    },
    {
        "name": "Ukrainian Hryvnia",
        "value": "UAH"
    },
    {
        "name": "Ugandan Shilling",
        "value": "UGX"
    },
    {
        "name": "United States Dollar",
        "value": "USD"
    },
    {
        "name": "Uruguayan Peso",
        "value": "UYU"
    },
    {
        "name": "Uzbekistan Som",
        "value": "UZS"
    },
    {
        "name": "Venezuelan Bolívar Fuerte (Old)",
        "value": "VEF"
    },
    {
        "name": "Venezuelan Bolívar Soberano",
        "value": "VES"
    },
    {
        "name": "Vietnamese Dong",
        "value": "VND"
    },
    {
        "name": "Vanuatu Vatu",
        "value": "VUV"
    },
    {
        "name": "Samoan Tala",
        "value": "WST"
    },
    {
        "name": "CFA Franc BEAC",
        "value": "XAF"
    },
    {
        "name": "Silver Ounce",
        "value": "XAG"
    },
    {
        "name": "Gold Ounce",
        "value": "XAU"
    },
    {
        "name": "East Caribbean Dollar",
        "value": "XCD"
    },
    {
        "name": "Special Drawing Rights",
        "value": "XDR"
    },
    {
        "name": "CFA Franc BCEAO",
        "value": "XOF"
    },
    {
        "name": "Palladium Ounce",
        "value": "XPD"
    },
    {
        "name": "CFP Franc",
        "value": "XPF"
    },
    {
        "name": "Platinum Ounce",
        "value": "XPT"
    },
    {
        "name": "Yemeni Rial",
        "value": "YER"
    },
    {
        "name": "South African Rand",
        "value": "ZAR"
    },
    {
        "name": "Zambian Kwacha",
        "value": "ZMW"
    },
    {
        "name": "Zimbabwean Dollar",
        "value": "ZWL"
    }
];

export default currencySymbols;
