import { describe, expect, it } from 'vitest'
import { isJunkImage, pickImage, repairImageUrl, upgradeImageUrl } from '../../../src/core/news/images'

describe('repairImageUrl', () => {
  it('keeps the real photo when a feed glues two filenames together', () => {
    expect(
      repairImageUrl(
        'https://image.posta.com.tr/i/posta/90/0x0/627e113be4bfdc26aca117f5.jpg6ab2f141dd493a0f521b9f49.jpg'
      )
    ).toBe('https://image.posta.com.tr/i/posta/90/0x0/6ab2f141dd493a0f521b9f49.jpg')
  })

  it('leaves normal URLs alone', () => {
    const url = 'https://image.hurimg.com/i/hurriyet/90/620x350/6ab257a5b00cc157ee7c2386.jpg?v=2'
    expect(repairImageUrl(url)).toBe(url)
    // Drupal serves a webp rendition of a png under a double extension: a real file.
    const drupal =
      'https://haber.sol.org.tr/sites/default/files/styles/480x270/public/images/content/article/2026/09/23/inci.png.webp?itok=1LCVtv87'
    expect(repairImageUrl(drupal)).toBe(drupal)
  })

  it('is applied when picking a feed image', () => {
    const picked = pickImage(
      [{ url: 'https://image.posta.com.tr/i/posta/90/0x0/aaa.jpgbbb.jpg', source: 'enclosure' }],
      'https://www.posta.com.tr/'
    )
    expect(picked).toBe('https://image.posta.com.tr/i/posta/90/0x0/bbb.jpg')
  })
})

describe('isJunkImage', () => {
  it('rejects truncated file names and site placeholders', () => {
    expect(isJunkImage('https://im.haberturk.com/assets/laravel/images/common/local-news/sakarya-')).toBe(
      true
    )
    expect(isJunkImage('https://i.yenicaggazetesi.com/2/150/84/assets/web/images/default.png')).toBe(true)
    expect(
      isJunkImage('https://image.dunya.com/rcman/Cw150h84q95gc/assets/web/images/default-45-yil.png')
    ).toBe(true)
  })

  it('accepts real photos, including ones whose slug mentions "default"', () => {
    expect(isJunkImage('https://im.haberturk.com/l/2026/09/22/ver1790113417/3914360/jpg/1920x1080')).toBe(
      false
    )
    expect(isJunkImage('https://cdn.example.com/2026/09/arjantin-default-riski.jpg')).toBe(false)
    expect(
      isJunkImage(
        'https://i20.haber7.net/resize/1280x720//haber/haber7/photos/2026/39/foto_1790113201_8586.jpg'
      )
    ).toBe(false)
  })

  it('makes pickImage skip a placeholder for the real photo', () => {
    expect(
      pickImage(
        [
          {
            url: 'https://im.haberturk.com/assets/laravel/images/common/local-news/sakarya-',
            source: 'media:content'
          },
          { url: 'https://im.haberturk.com/yerel_haber/2026/09/22/42534089_640x360.jpg', source: 'html' }
        ],
        'https://www.haberturk.com/'
      )
    ).toBe('https://im.haberturk.com/yerel_haber/2026/09/22/42534089_640x360.jpg')
  })
})

describe('upgradeImageUrl', () => {
  it('swaps the CMS thumbnails many Turkish sites share for an 800 or 1280 wide rendition', () => {
    const path = 'storage/files/images/2026/09/23/merkez-bankasi-baskani-karahan-ixey.jpg'
    for (const host of ['i.gazeteoksijen.com', 'i.nefes.com.tr', 'i.elele.com.tr', 'img.halktv.com.tr']) {
      expect(upgradeImageUrl(`https://${host}/2/150/84/${path}`)).toBe(`https://${host}/2/800/450/${path}`)
    }
    for (const host of ['image.dunya.com', 'img.aydinlik.com.tr', 'img.ekonomim.com']) {
      expect(upgradeImageUrl(`https://${host}/rcman/Cw150h84q95gc/${path}`)).toBe(
        `https://${host}/rcman/Cw1280h720q95gc/${path}`
      )
    }
    expect(upgradeImageUrl(`https://img.internethaber.com/rcman/Cw160h90q95gc/${path}`)).toBe(
      `https://img.internethaber.com/rcman/Cw1280h720q95gc/${path}`
    )
  })

  it('leaves other paths and larger renditions alone', () => {
    const large =
      'https://image.dunya.com/rcman/Cw1280h720q95gc/storage/files/images/2026/09/23/erdogan-9avy_cover.jpg'
    expect(upgradeImageUrl(large)).toBe(large)
    const other = 'https://cdn.example.com/2/150/84/photo.jpg'
    expect(upgradeImageUrl(other)).toBe(other)
  })
})
