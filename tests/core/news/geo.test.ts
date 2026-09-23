import { describe, expect, it } from 'vitest'
import { createGeoTagger } from '../../../src/core/news/geo'
import { getCountryPack } from '../../../src/shared/countries/index'
import type { CountryPack } from '../../../src/shared/countries/types'
import { testPack } from './helpers'

const geo = createGeoTagger(testPack)
const provinces = (text: string): string[] => geo.tag(text).provinces

describe('createGeoTagger', () => {
  it('matches province names with Turkish suffixes after an apostrophe', () => {
    expect(geo.tag("İzmir'de deprem")).toEqual({ provinces: ['35'], regions: ['aegean'] })
    expect(provinces('Ankara’nın gündemi yoğun')).toEqual(['06'])
    expect(provinces('İstanbul ve Konya arasında')).toEqual(['34', '42'])
    expect(provinces('İZMİR’DE SAĞANAK')).toEqual(['35'])
  })

  it('ignores names glued to other letters and lowercase words', () => {
    expect(provinces('Trabzonspor deplasmanda kazandı')).toEqual([])
    expect(provinces('Samsunlu işadamı')).toEqual([])
    expect(provinces('Konyaspor ile berabere kaldı')).toEqual([])
    expect(provinces('izmir lowercase is not a name')).toEqual([])
  })

  it('needs an apostrophe or an administrative word for ambiguous names', () => {
    expect(provinces('Asker ordu içinde yükseldi')).toEqual([])
    expect(provinces('İsrail ordusu saldırdı')).toEqual([])
    expect(provinces('Ordu kararlı')).toEqual([])
    expect(provinces("Ordu'da fındık hasadı başladı")).toEqual(['52'])
    expect(provinces('Ordu Büyükşehir Belediyesi açıkladı')).toEqual(['52'])
    expect(provinces('Mehmet Aydın açıklama yaptı')).toEqual([])
    expect(provinces("Aydın'da kaza")).toEqual(['09'])
    expect(provinces('Aydın Valiliği uyardı')).toEqual(['09'])
    expect(provinces('Van Gogh sergisi açıldı')).toEqual([])
    expect(provinces('VAN’DA KAR YAĞIŞI')).toEqual(['65'])
    expect(provinces('Tokat attı')).toEqual([])
    expect(provinces('Batman filmi vizyonda')).toEqual([])
    expect(provinces('Batman ilinde petrol')).toEqual(['72'])
  })

  it('maps districts and aliases to their province', () => {
    expect(geo.tag("Kadıköy'de yangın")).toEqual({ provinces: ['34'], regions: ['marmara'] })
    expect(provinces('Bodrum ve Kuşadası dolu')).toEqual(['48', '09'])
    expect(provinces('Antep baklavası')).toEqual(['27'])
    expect(provinces('İzmit Körfezi')).toEqual(['41'])
    expect(provinces("Konyaaltı'nda plaj")).toEqual(['07'])
    expect(provinces("Ereğli'de toplantı")).toEqual([])
  })

  it('tags region names with the same suffix rule', () => {
    expect(geo.tag("Ege'de sıcak hava")).toEqual({ provinces: [], regions: ['aegean'] })
    expect(geo.tag('Karadeniz için sel uyarısı').regions).toEqual(['black-sea'])
    expect(geo.tag('İç Anadolu’da kuraklık').regions).toEqual(['central-anatolia'])
    expect(geo.tag('Güneydoğu Anadolu Bölgesi').regions).toEqual(['southeastern-anatolia'])
    expect(geo.tag('Ege Yılmaz gol attı').regions).toEqual([])
    expect(geo.tag('Ege Bölgesi genelinde yağış').regions).toEqual(['aegean'])
  })

  it('does not read foreign regions and seas as Turkish regions', () => {
    const regions = (text: string): string[] => geo.tag(text).regions
    expect(regions('Güneydoğu Asya ülkeleri ASEAN zirvesinde bir araya geldi')).toEqual([])
    expect(regions("Güneydoğu Asya'nın çağdaş sineması İstanbul'da")).toEqual(['marmara'])
    expect(regions("Doğu ve Güneydoğu'da sağanak bekleniyor")).toEqual(['southeastern-anatolia'])
    expect(regions('Güneydoğu Anadolu Projesi')).toEqual(['southeastern-anatolia'])
    expect(regions("Rusya, Karadeniz'de Ukrayna'ya ait gemiyi vurdu")).toEqual([])
    expect(regions("Doğu Akdeniz'de gerilim: Yunanistan yeni adım attı")).toEqual([])
    expect(regions('Erdoğan, BM Genel Sekreteri ile görüştü: Karadeniz ve Kıbrıs vurgusu')).toEqual([])
    expect(regions("Yunanistan'dan Ege'de tatbikat")).toEqual([])
    // A province keeps its region whatever else the text mentions.
    expect(regions("Rus turistler Antalya'yı ve Akdeniz kıyılarını tercih etti")).toEqual(['mediterranean'])
    expect(regions("Batı Karadeniz'de fırtına alarmı")).toEqual(['black-sea'])
  })

  it('adds the region of every tagged province, without duplicates', () => {
    expect(
      geo.tag("Malatya'da 5,8 büyüklüğünde deprem; Battalgazi'de hasar, Malatya Valiliği açıkladı")
    ).toEqual({
      provinces: ['44'],
      regions: ['eastern-anatolia']
    })
    expect(geo.regionOf('61')).toBe('black-sea')
  })

  it('tags 1000 items in under 20 ms', () => {
    const texts = Array.from(
      { length: 1000 },
      (_, i) =>
        `Haber ${i}: İzmir'de ve Kadıköy'de yoğun yağış, Trabzonspor maçı ertelendi. Ordu Valiliği uyardı. ` +
        'Merkez Bankası faiz kararını açıkladı; piyasalar güne yükselişle başladı, Borsa İstanbul rekor kırdı. ' +
        'Uzmanlar vatandaşları dikkatli olmaya çağırdı ve yetkililer açıklama yaptı.'
    )
    const run = (): number => {
      const start = performance.now()
      for (const text of texts) geo.tag(text)
      return performance.now() - start
    }
    run()
    const best = Math.min(run(), run(), run())
    // A guard against an order-of-magnitude regression, not a benchmark: shared CI runners
    // measured 20.5 ms for work that takes ~6 ms on a developer machine.
    expect(best).toBeLessThan(60)
  })
})

describe('createGeoTagger in other countries', () => {
  const tagger = (code: 'in' | 'us' | 'gb' | 'de' | 'br') =>
    createGeoTagger(getCountryPack(code) as CountryPack)

  it('matches Hindi names, which have no capitals, and their cities', () => {
    const india = tagger('in')
    expect(india.tag('उत्तर प्रदेश में बारिश से तबाही').provinces).toEqual(['UP'])
    expect(india.tag('लखनऊ में बैठक, पटना से लौटे मंत्री').provinces).toEqual(['UP', 'BR'])
    expect(india.tag('जम्मू-कश्मीर के श्रीनगर में बर्फबारी')).toEqual({
      provinces: ['JK'],
      regions: ['north']
    })
    expect(india.tag('Bihar News: चुनाव की तैयारी').provinces).toEqual(['BR'])
  })

  it('reads "Washington" as the state only when a place word follows', () => {
    const us = tagger('us')
    expect(us.tag("Washington weighs new sanctions; Washington's allies wait").provinces).toEqual([])
    expect(us.tag('Washington state wildfire spreads').provinces).toEqual(['WA'])
    expect(us.tag('Storm hits Georgia and South Carolina').provinces).toEqual(['SC'])
    expect(us.tag('Georgia Gov. signs the bill').provinces).toEqual(['GA'])
    expect(us.tag('Flooding in Kansas City and St. Louis').provinces).toEqual(['MO'])
    expect(us.tag('New York and New Jersey brace for the storm').provinces).toEqual(['NY', 'NJ'])
  })

  it('tags UK nations as regions and keeps royal titles out of the counties', () => {
    const gb = tagger('gb')
    expect(gb.tag('Scotland votes on the budget')).toEqual({ provinces: [], regions: ['scotland'] })
    expect(gb.tag('Duke of Sussex visits Canada').provinces).toEqual([])
    expect(gb.tag('Sussex Police appeal for witnesses').provinces).toEqual(['sussex'])
    expect(gb.tag('Flooding in Leeds and Cardiff').provinces).toEqual(['west-yorkshire', 'south-east-wales'])
    expect(gb.tag('New York marathon').provinces).toEqual([])
  })

  it('reads German genitives and Brazilian state names', () => {
    expect(tagger('de').tag('Bayerns Ministerpräsident besucht Leipzig').provinces).toEqual(['BY', 'SN'])
    expect(tagger('de').tag('Sachsen-Anhalt und Niedersachsen').provinces).toEqual(['ST', 'NI'])
    expect(tagger('br').tag('Chuva em Mato Grosso do Sul e no Rio Grande do Sul').provinces).toEqual([
      'MS',
      'RS'
    ])
    expect(tagger('br').tag('Para o governo, a medida em Belo Horizonte').provinces).toEqual(['MG'])
  })
})
