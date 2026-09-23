import { describe, expect, it } from 'vitest'
import {
  capsRatio,
  headlineQuality,
  isBreakingNews,
  isRoutineHeadline,
  tameCaps
} from '../../src/renderer/src/lib/headline'

describe('tameCaps', () => {
  it('calms an SEO all-caps lead-in, keeping names, dates and sentence starts', () => {
    expect(tameCaps('RESMİ GAZETE KARARLARI 23 EYLÜL: Resmi Gazete atamaları neler?')).toBe(
      'Resmi Gazete kararları 23 Eylül: Resmi Gazete atamaları neler?'
    )
    expect(tameCaps('DEPREM SON DAKİKA 22 EYLÜL!')).toBe('Deprem son dakika 22 Eylül!')
    expect(tameCaps('SON DAKİKA DEPREM HABERLERİ')).toBe('Son dakika deprem haberleri')
  })

  it('uses Turkish casing rules for İ/i and I/ı', () => {
    expect(tameCaps('KIRMIZI IŞIK İHLALİ YAPAN SÜRÜCÜYE CEZA')).toBe(
      'Kırmızı ışık ihlali yapan sürücüye ceza'
    )
    expect(tameCaps("ISPARTA'DA KAR YAĞIŞI BAŞLADI")).toBe("Isparta'da kar yağışı başladı")
  })

  it('keeps initialisms and capitalises apostrophe-marked proper nouns', () => {
    expect(tameCaps('AFAD DUYURDU: DEPREM BÖLGESİNDE SON DURUM')).toBe(
      'AFAD duyurdu: Deprem bölgesinde son durum'
    )
    expect(tameCaps('TBMM GENEL KURULU TOPLANDI')).toBe('TBMM genel kurulu toplandı')
    expect(tameCaps("BEŞİKTAŞ'I YENEN FENERBAHÇE KUPAYI KALDIRDI")).toBe(
      "Beşiktaş'ı yenen Fenerbahçe kupayı kaldırdı"
    )
    expect(tameCaps("CHP'DEN AÇIKLAMA GELDİ BUGÜN")).toBe("CHP'den açıklama geldi bugün")
  })

  it('calms a shouting label before the headline', () => {
    expect(tameCaps("SON DAKİKA: İstanbul'da metrobüs arızası")).toBe(
      "Son dakika: İstanbul'da metrobüs arızası"
    )
    expect(tameCaps('FLAŞ | Merkez Bankası faizi sabit tuttu')).toBe(
      'Flaş | Merkez Bankası faizi sabit tuttu'
    )
  })

  it('leaves normal headlines and short capitals alone', () => {
    const plain = "Kanarya, Beşiktaş'ı mağlup etti..."
    expect(tameCaps(plain)).toBe(plain)
    expect(tameCaps('TCMB faizi sabit tuttu')).toBe('TCMB faizi sabit tuttu')
    expect(tameCaps('ABD ve AB arasında yeni anlaşma')).toBe('ABD ve AB arasında yeni anlaşma')
  })
})

describe('headlineQuality', () => {
  it('marks cut-off, shouting and labelled headlines down', () => {
    expect(headlineQuality('Fenerbahçe kupayı kaldırdı')).toBe(0)
    expect(headlineQuality("Kanarya, Beşiktaş'ı mağlup etti...")).toBe(-1)
    expect(headlineQuality('Kanarya kupayı kaldırdı…')).toBe(-1)
    expect(headlineQuality('RESMİ GAZETE KARARLARI 23 EYLÜL')).toBe(-1)
    expect(headlineQuality('SON DAKİKA: Deprem oldu')).toBe(-0.5)
    expect(capsRatio('ABC def')).toBe(0.5)
  })
})

describe('routine headlines', () => {
  it('recognises scheduled daily items', () => {
    expect(
      isRoutineHeadline('Resmi Gazete kararları 23 Eylül 2026 | Bugün Resmi Gazete atamaları neler?')
    ).toBe(true)
    expect(isRoutineHeadline('Borsa salı gününü düşüşle tamamladı')).toBe(true)
    expect(isRoutineHeadline('Borsa güne yükselişle başladı')).toBe(true)
    expect(isRoutineHeadline('Altın fiyatları bugün ne kadar? Gram altın kaç TL?')).toBe(true)
    expect(isRoutineHeadline('İstanbul hava durumu: Yarın yağmur var mı?')).toBe(true)
    expect(isRoutineHeadline('Deprem mi oldu? Kandilli ve AFAD son depremler listesi')).toBe(true)
    expect(isRoutineHeadline('Şans Topu sonuçları açıklandı')).toBe(true)
  })

  it('leaves real news alone', () => {
    expect(isRoutineHeadline('Malatya’da 5,1 büyüklüğünde deprem')).toBe(false)
    expect(isRoutineHeadline('Resmi Gazete’de yayımlandı: 5 ilde yeni düzenleme')).toBe(false)
    expect(isRoutineHeadline('Borsa İstanbul’da işlemler durduruldu')).toBe(false)
  })

  it('never labels a routine item as breaking news', () => {
    expect(isBreakingNews({ isBreaking: true, title: 'Borsa salı gününü düşüşle tamamladı' })).toBe(false)
    expect(isBreakingNews({ isBreaking: true, title: 'Bursa’da iki otomobil çarpıştı' })).toBe(true)
    expect(isBreakingNews({ isBreaking: false, title: 'Bursa’da iki otomobil çarpıştı' })).toBe(false)
  })
})
