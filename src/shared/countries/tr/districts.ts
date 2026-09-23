import type { District } from '../../types'

/**
 * Districts (ilçe) that national outlets often name without their province
 * ("Bodrum'da…", "Çorlu'da…"), mapped to the province's plate code.
 *
 * Deliberately left out: names that are common words, first names or football
 * clubs (Beşiktaş, Fatih, Kartal, Kemer, Kaş, Of, Pazar, Çarşamba), names shared
 * by several provinces (Ereğli, Edremit, Gölbaşı, Yenişehir, Kemalpaşa) and
 * central districts that practically always appear next to their province name.
 * Province aliases (İzmit, Adapazarı, Antakya) live on the province itself.
 */
export const districts: District[] = [
  // İstanbul
  { name: 'Kadıköy', provinceCode: '34' },
  { name: 'Üsküdar', provinceCode: '34' },
  { name: 'Beyoğlu', provinceCode: '34' },
  { name: 'Şişli', provinceCode: '34' },
  { name: 'Bakırköy', provinceCode: '34' },
  { name: 'Esenyurt', provinceCode: '34' },
  { name: 'Ataşehir', provinceCode: '34' },
  { name: 'Sarıyer', provinceCode: '34' },
  { name: 'Pendik', provinceCode: '34' },
  { name: 'Bağcılar', provinceCode: '34' },
  { name: 'Küçükçekmece', provinceCode: '34' },
  { name: 'Avcılar', provinceCode: '34' },
  { name: 'Ümraniye', provinceCode: '34' },
  { name: 'Beylikdüzü', provinceCode: '34' },
  { name: 'Zeytinburnu', provinceCode: '34' },
  { name: 'Eyüpsultan', provinceCode: '34' },
  { name: 'Beykoz', provinceCode: '34' },
  { name: 'Kağıthane', provinceCode: '34' },
  // Ankara
  { name: 'Keçiören', provinceCode: '06' },
  { name: 'Etimesgut', provinceCode: '06' },
  { name: 'Sincan', provinceCode: '06' },
  { name: 'Polatlı', provinceCode: '06' },
  // İzmir
  { name: 'Bornova', provinceCode: '35' },
  { name: 'Buca', provinceCode: '35' },
  { name: 'Bayraklı', provinceCode: '35' },
  { name: 'Çiğli', provinceCode: '35' },
  { name: 'Torbalı', provinceCode: '35' },
  { name: 'Urla', provinceCode: '35' },
  { name: 'Bergama', provinceCode: '35' },
  { name: 'Çeşme', provinceCode: '35' },
  // Muğla
  { name: 'Bodrum', provinceCode: '48' },
  { name: 'Marmaris', provinceCode: '48' },
  { name: 'Fethiye', provinceCode: '48' },
  { name: 'Dalaman', provinceCode: '48' },
  { name: 'Datça', provinceCode: '48' },
  { name: 'Milas', provinceCode: '48' },
  // Antalya
  { name: 'Alanya', provinceCode: '07' },
  { name: 'Manavgat', provinceCode: '07' },
  { name: 'Serik', provinceCode: '07' },
  { name: 'Konyaaltı', provinceCode: '07' },
  // Aydın
  { name: 'Kuşadası', provinceCode: '09' },
  { name: 'Didim', provinceCode: '09' },
  { name: 'Söke', provinceCode: '09' },
  // Denizli
  { name: 'Pamukkale', provinceCode: '20' },
  // Manisa
  { name: 'Akhisar', provinceCode: '45' },
  { name: 'Soma', provinceCode: '45' },
  { name: 'Turgutlu', provinceCode: '45' },
  // Balıkesir
  { name: 'Ayvalık', provinceCode: '10' },
  { name: 'Bandırma', provinceCode: '10' },
  // Çanakkale
  { name: 'Gelibolu', provinceCode: '17' },
  { name: 'Bozcaada', provinceCode: '17' },
  { name: 'Gökçeada', provinceCode: '17' },
  // Tekirdağ
  { name: 'Çorlu', provinceCode: '59' },
  { name: 'Çerkezköy', provinceCode: '59' },
  // Edirne, Kırklareli
  { name: 'Keşan', provinceCode: '22' },
  { name: 'Lüleburgaz', provinceCode: '39' },
  // Bursa
  { name: 'İnegöl', provinceCode: '16' },
  { name: 'Gemlik', provinceCode: '16' },
  { name: 'Mudanya', provinceCode: '16' },
  // Kocaeli
  { name: 'Gebze', provinceCode: '41' },
  { name: 'Gölcük', provinceCode: '41' },
  { name: 'Darıca', provinceCode: '41' },
  // Sakarya
  { name: 'Sapanca', provinceCode: '54' },
  // Western Black Sea
  { name: 'Karadeniz Ereğli', provinceCode: '67' },
  { name: 'Kdz. Ereğli', provinceCode: '67' },
  { name: 'Amasra', provinceCode: '74' },
  { name: 'Safranbolu', provinceCode: '78' },
  // Samsun, Ordu
  { name: 'Bafra', provinceCode: '55' },
  { name: 'Fatsa', provinceCode: '52' },
  { name: 'Ünye', provinceCode: '52' },
  // Trabzon, Rize, Artvin, Amasya
  { name: 'Akçaabat', provinceCode: '61' },
  { name: 'Araklı', provinceCode: '61' },
  { name: 'Sürmene', provinceCode: '61' },
  { name: 'Çaykara', provinceCode: '61' },
  { name: 'Çayeli', provinceCode: '53' },
  { name: 'Hopa', provinceCode: '08' },
  { name: 'Yusufeli', provinceCode: '08' },
  { name: 'Merzifon', provinceCode: '05' },
  // Hatay
  { name: 'İskenderun', provinceCode: '31' },
  { name: 'Reyhanlı', provinceCode: '31' },
  { name: 'Dörtyol', provinceCode: '31' },
  { name: 'Samandağ', provinceCode: '31' },
  // Mersin, Osmaniye
  { name: 'Tarsus', provinceCode: '33' },
  { name: 'Silifke', provinceCode: '33' },
  { name: 'Erdemli', provinceCode: '33' },
  { name: 'Kadirli', provinceCode: '80' },
  // Kahramanmaraş
  { name: 'Elbistan', provinceCode: '46' },
  { name: 'Pazarcık', provinceCode: '46' },
  // Gaziantep
  { name: 'Nizip', provinceCode: '27' },
  { name: 'İslahiye', provinceCode: '27' },
  // Şanlıurfa, Adıyaman
  { name: 'Siverek', provinceCode: '63' },
  { name: 'Viranşehir', provinceCode: '63' },
  { name: 'Suruç', provinceCode: '63' },
  { name: 'Birecik', provinceCode: '63' },
  { name: 'Ceylanpınar', provinceCode: '63' },
  { name: 'Kahta', provinceCode: '02' },
  // Diyarbakır, Mardin, Batman
  { name: 'Bismil', provinceCode: '21' },
  { name: 'Ergani', provinceCode: '21' },
  { name: 'Silvan', provinceCode: '21' },
  { name: 'Nusaybin', provinceCode: '47' },
  { name: 'Kızıltepe', provinceCode: '47' },
  { name: 'Midyat', provinceCode: '47' },
  { name: 'Hasankeyf', provinceCode: '72' },
  // Şırnak, Hakkari
  { name: 'Cizre', provinceCode: '73' },
  { name: 'Silopi', provinceCode: '73' },
  { name: 'Yüksekova', provinceCode: '30' },
  { name: 'Şemdinli', provinceCode: '30' },
  // Eastern Anatolia
  { name: 'Erciş', provinceCode: '65' },
  { name: 'Tatvan', provinceCode: '13' },
  { name: 'Doğubayazıt', provinceCode: '04' },
  { name: 'Sarıkamış', provinceCode: '36' },
  { name: 'Palandöken', provinceCode: '25' },
  { name: 'İliç', provinceCode: '24' },
  { name: 'Doğanşehir', provinceCode: '44' },
  // Central Anatolia
  { name: 'Talas', provinceCode: '38' },
  { name: 'Ürgüp', provinceCode: '50' },
  { name: 'Avanos', provinceCode: '50' },
  { name: 'Göreme', provinceCode: '50' },
  { name: 'Akşehir', provinceCode: '42' },
  { name: 'Beyşehir', provinceCode: '42' },
  // Aegean interior
  { name: 'Tavşanlı', provinceCode: '43' },
  { name: 'Simav', provinceCode: '43' }
]
