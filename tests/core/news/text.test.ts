import { describe, expect, it } from 'vitest'
import {
  collapseWhitespace,
  decodeEntities,
  foldTr,
  htmlToParagraphs,
  isRoutineTitle,
  isShouting,
  isTruncatedTitle,
  stripBoilerplate,
  stripTrailingHashtags,
  trLower
} from '../../../src/core/news/text'

describe('decodeEntities', () => {
  it('decodes named, decimal and hex references', () => {
    expect(decodeEntities('Sermaye piyasas&#305;nda &quot;Tera&quot; operasyonu')).toBe(
      'Sermaye piyasasında "Tera" operasyonu'
    )
    expect(decodeEntities('g&ouml;re &uuml;zerinde &ccedil;ıktı')).toBe('göre üzerinde çıktı')
    expect(decodeEntities('22:03 &#x2B;0300 &#8217;')).toBe('22:03 +0300 ’')
    expect(decodeEntities('&scedil;&Idot;&gbreve;&hellip;&nbsp;')).toBe('şİğ…\u00a0')
  })

  it('maps legacy windows-1252 references and leaves unknown names alone', () => {
    expect(decodeEntities('It&#146;s')).toBe('It’s')
    expect(decodeEntities('&unknownthing; &amp;amp;')).toBe('&unknownthing; &amp;')
  })
})

describe('htmlToParagraphs', () => {
  it('keeps paragraph structure and drops scripts, styles and captions', () => {
    const html =
      '<p>Birinci   paragraf.</p><p>İkinci<br>satır</p><div>Kutu</div><ul><li>madde</li></ul>' +
      '<script>alert(1)</script><style>p{}</style><h2>Ara başlık</h2><figure><img src="x.jpg"><figcaption>Foto: AA</figcaption></figure>'
    expect(htmlToParagraphs(html)).toEqual([
      'Birinci paragraf.',
      'İkinci',
      'satır',
      'Kutu',
      '• madde',
      'Ara başlık'
    ])
  })

  it('unescapes double-escaped markup and ignores comments', () => {
    expect(htmlToParagraphs('&lt;p&gt;Merhaba &amp;amp; hoş geldin&lt;/p&gt;')).toEqual([
      'Merhaba & hoş geldin'
    ])
    expect(htmlToParagraphs('<!-- <img src="a.jpg"> -->Metin')).toEqual(['Metin'])
  })

  it('drops embedded related-story widgets', () => {
    const html = '<p>Gövde.</p><section class="insert insert-contents">Son dakika: başka haber</section>'
    expect(htmlToParagraphs(html)).toEqual(['Gövde.'])
  })
})

describe('Turkish case folding', () => {
  it('lower-cases dotted and dotless I correctly', () => {
    expect(trLower('İSTANBUL IĞDIR Işık')).toBe('istanbul ığdır ışık')
  })

  it('folds Turkish letters for search keys', () => {
    expect(foldTr('Çağlayan ŞİŞLİ Işık Gümüşhane Hakkâri')).toBe('caglayan sisli isik gumushane hakkari')
  })
})

describe('stripBoilerplate', () => {
  it('removes "Devamı için tıklayınız" and keeps the ellipsis', () => {
    expect(
      stripBoilerplate(["Bugün BM Genel Kurulu'na hitap eden Başkan Erdoğan'ın...Devamı için tıklayınız"])
    ).toEqual(["Bugün BM Genel Kurulu'na hitap eden Başkan Erdoğan'ın…"])
  })

  it('removes read-more lines, source lines and WordPress footers', () => {
    expect(
      stripBoilerplate([
        'Asıl metin burada.',
        'Haberin devamı…',
        'Kaynak: AA',
        'Devamını okumak için tıklayın',
        'Read more',
        'Son cümle. The post Başlık appeared first on Diken.'
      ])
    ).toEqual(['Asıl metin burada.', 'Son cümle.'])
  })

  it('strips trailing calls to action, bracketed ellipses and hashtags', () => {
    expect(stripBoilerplate(['Peki dönüş söz konusu mu? Detaylar haberimizde.'])).toEqual([
      'Peki dönüş söz konusu mu?'
    ])
    expect(stripBoilerplate(['Metin devam ediyor […]'])).toEqual(['Metin devam ediyor'])
    expect(stripBoilerplate(['Yolcuya parayı iade etti #izmir'])).toEqual(['Yolcuya parayı iade etti'])
  })

  it('removes a leading "Son dakika haberleri..." but not ordinary uses of the words', () => {
    expect(stripBoilerplate(['Son Dakika Haberleri... Başkan Erdoğan konuştu.'])).toEqual([
      'Başkan Erdoğan konuştu.'
    ])
    expect(stripBoilerplate(['Maçın devamı çok çekişmeli geçti.'])).toEqual([
      'Maçın devamı çok çekişmeli geçti.'
    ])
  })
})

describe('small helpers', () => {
  it('collapses exotic whitespace', () => {
    expect(collapseWhitespace('  a\u00a0\u200b b\n\tc ')).toBe('a b c')
  })

  it("strips Sabah's city hashtags only at the end", () => {
    expect(stripTrailingHashtags('CHP’nin kalesinde işçiler isyanda #izmir')).toBe(
      'CHP’nin kalesinde işçiler isyanda'
    )
    expect(stripTrailingHashtags('#MeToo tartışması büyüyor')).toBe('#MeToo tartışması büyüyor')
  })

  it('tells an all-caps headline from a normal one with acronyms', () => {
    expect(isShouting('ALEYNA ÇAKIR DAVASINDA SON DAKİKA KARARI!')).toBe(true)
    expect(isShouting("GS ŞAMPİYONLAR LİGİ MAÇ TAKVİMİ: Galatasaray'ın rakibi")).toBe(true)
    expect(isShouting("TCMB'den PPK sonrası ilk açıklama")).toBe(false)
    expect(isShouting('Aleyna Çakır davasında karar çıktı')).toBe(false)
    expect(isShouting('2026')).toBe(false)
  })
})

describe('isTruncatedTitle', () => {
  it('spots headlines the outlet cut short', () => {
    expect(
      isTruncatedTitle("Cumhurbaşkanlığı Kupası Fenerbahçe'nin! Kanarya, Beşiktaş'ı mağlup etti...")
    ).toBe(true)
    expect(isTruncatedTitle('Merkez Bankası faizi sabit tuttu…')).toBe(true)
    expect(isTruncatedTitle('Merkez Bankası faizi sabit tuttu')).toBe(false)
  })
})

describe('isRoutineTitle', () => {
  it('flags daily service items that are republished every day', () => {
    expect(isRoutineTitle('Resmi Gazete kararları 23 Eylül 2026 | Bugün Resmi Gazete atamaları neler?')).toBe(
      true
    )
    expect(isRoutineTitle("RESMİ GAZETE'DE BUGÜN: 23 Eylül 2026 Salı")).toBe(true)
    expect(isRoutineTitle('İstanbul namaz vakitleri 23 Eylül 2026')).toBe(true)
    expect(isRoutineTitle('Gram altın fiyatları bugün ne kadar?')).toBe(true)
    expect(isRoutineTitle('Ankara elektrik kesintisi! 23-24 Eylül')).toBe(true)
    expect(isRoutineTitle('İzmir nöbetçi eczaneler')).toBe(true)
  })

  it('keeps real news that merely mentions those words', () => {
    expect(isRoutineTitle('Merkez Bankası faiz kararını açıkladı')).toBe(false)
    expect(isRoutineTitle("Malatya'da 5,8 büyüklüğünde deprem")).toBe(false)
    expect(isRoutineTitle("Yeni yönetmelik Resmi Gazete'de yayımlandı: kira artışına sınır")).toBe(false)
  })
})
