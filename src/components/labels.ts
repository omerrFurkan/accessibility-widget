export type WidgetLanguage = "tr" | "en";

export interface AccessibilityWidgetLabels {
  triggerLabel: string;
  panelTitle: string;
  panelSubtitle: string;
  closePanel: string;
  shortcutHint: string;
  languageToggleLabel: string;
  languageShort: string;
  enlargePanel: string;
  shrinkPanel: string;
  profilesLabel: string;
  profilesNone: string;
  resetAll: string;
  announceProfileApplied: string;
  announceProfileRemoved: string;
  announceSettingsReset: string;
  announceLanguageChanged: string;
  footerCopyright: string;
  toolTextZoom: string;
  toolColorBlind: string;
  toolGrayscale: string;
  toolContrast: string;
  toolDarkMode: string;
  toolHighlightLinks: string;
  toolHighlightHeadings: string;
  toolReadingLine: string;
  toolReadingMask: string;
  toolLargeCursor: string;
  toolBlueLight: string;
  toolStopAnimations: string;
  toolHideImages: string;
  toolDyslexiaFont: string;
  toolLineHeight: string;
  toolTextAlign: string;
  toolLetterSpacing: string;
  toolPageStructure: string;
  profileInfoToggle: string;
  profileAdhd: string;
  profileDescAdhd: string;
  profileDetailsAdhd: string;
  profileLowVision: string;
  profileDescLowVision: string;
  profileDetailsLowVision: string;
  profileColorBlind: string;
  profileDescColorBlind: string;
  profileDetailsColorBlind: string;
  profileDyslexia: string;
  profileDescDyslexia: string;
  profileDetailsDyslexia: string;
  profileEpilepsy: string;
  profileDescEpilepsy: string;
  profileDetailsEpilepsy: string;
  profileElderly: string;
  profileDescElderly: string;
  profileDetailsElderly: string;
  contrastNormal: string;
  contrastHigh: string;
  contrastDark: string;
  contrastLight: string;
  contrastWarm: string;
  contrastCold: string;
  contrastShortDark: string;
  contrastShortLight: string;
  contrastShortHigh: string;
  contrastShortWarm: string;
  contrastShortCold: string;
  alignLeft: string;
  alignCenter: string;
  alignRight: string;
  alignJustify: string;
  colorBlindnessProtanopia: string;
  colorBlindnessDeuteranopia: string;
  colorBlindnessTritanopia: string;
  colorBlindnessAchromatopsia: string;
  colorBlindPairProtanopia: string;
  colorBlindPairDeuteranopia: string;
  colorBlindPairTritanopia: string;
  colorBlindPairAchromatopsia: string;
  pageStructureTitle: string;
  pageStructureEmpty: string;
  pageStructureClose: string;
  pageStructureRefresh: string;
}

export const LABELS_TR: AccessibilityWidgetLabels = {
  triggerLabel: "Erişilebilirlik ayarları",
  panelTitle: "Erişilebilirlik Seçenekleri",
  panelSubtitle: "Site deneyiminizi kişiselleştirin",
  closePanel: "Paneli kapat",
  shortcutHint: "ALT + A",
  languageToggleLabel: "Dil değiştir",
  languageShort: "TR",
  enlargePanel: "Paneli Büyüt",
  shrinkPanel: "Paneli Küçült",
  profilesLabel: "Erişilebilirlik Profilleri",
  profilesNone: "Profil Seçilmedi",
  resetAll: "Ayarları Sıfırla",
  announceProfileApplied: "profili uygulandı",
  announceProfileRemoved: "profili kaldırıldı",
  announceSettingsReset: "Ayarlar sıfırlandı",
  announceLanguageChanged: "Dil değiştirildi",
  footerCopyright: "© 2026",
  toolTextZoom: "Metin Büyütme",
  toolColorBlind: "Renk Körü Modu",
  toolGrayscale: "Gri Tonlama",
  toolContrast: "Kontrast Modu",
  toolDarkMode: "Koyu Mod",
  toolHighlightLinks: "Linkleri Vurgula",
  toolHighlightHeadings: "Başlıkları Vurgula",
  toolReadingLine: "Okuma Çizgisi",
  toolReadingMask: "Okuma Maskesi",
  toolLargeCursor: "Büyük İmleç",
  toolBlueLight: "Mavi Işık Filtresi",
  toolStopAnimations: "Animasyonları Durdur",
  toolHideImages: "Resimleri Gizle",
  toolDyslexiaFont: "Disleksi Dostu Font",
  toolLineHeight: "Satır Yüksekliği",
  toolTextAlign: "Metin Hizalama",
  toolLetterSpacing: "Harf Aralığı",
  toolPageStructure: "Sayfa Yapısı",
  profileInfoToggle: "Profil özelliklerini göster",
  profileAdhd: "DEHB Desteği",
  profileDescAdhd: "Dikkat dağınıklığını azaltır ve odaklanmayı kolaylaştırır",
  profileDetailsAdhd: "Animasyonları durdurur ve okuma çizgisi sunar",
  profileLowVision: "Görme Desteği",
  profileDescLowVision: "Görme zorluğu yaşayanlar için optimize edilmiş ayarlar",
  profileDetailsLowVision: "Büyük yazı, yüksek kontrast, geniş satır aralığı ve büyük imleç",
  profileColorBlind: "Renk Körlüğü Desteği",
  profileDescColorBlind: "Renk körlüğü yaşayanlar için özel filtreler",
  profileDetailsColorBlind: "Deuteranopi (yeşil) renk filtresi uygular",
  profileDyslexia: "Disleksi Desteği",
  profileDescDyslexia: "Okuma zorluğu yaşayanlar için özel fontlar ve düzen",
  profileDetailsDyslexia: "Disleksi dostu font, geniş harf ve satır aralığı ile okuma çizgisi",
  profileEpilepsy: "Epilepsi Desteği",
  profileDescEpilepsy: "Epilepsi hastaları için güvenli görüntüleme ayarları",
  profileDetailsEpilepsy: "Animasyonları durdurur ve görselleri gizler",
  profileElderly: "Yaşlılar İçin",
  profileDescElderly: "Yaşlı kullanıcılar için göz dostu ve rahat okuma ayarları",
  profileDetailsElderly: "Büyük yazı, geniş satır aralığı, büyük imleç ve mavi ışık filtresi",
  contrastNormal: "Normal",
  contrastHigh: "Yüksek Kontrast",
  contrastDark: "Koyu Kontrast",
  contrastLight: "Açık Kontrast",
  contrastWarm: "Sıcak Kontrast",
  contrastCold: "Soğuk Kontrast",
  contrastShortDark: "Koyu",
  contrastShortLight: "Açık",
  contrastShortHigh: "Yüksek",
  contrastShortWarm: "Sıcak",
  contrastShortCold: "Soğuk",
  alignLeft: "Sola Hizala",
  alignCenter: "Ortala",
  alignRight: "Sağa Hizala",
  alignJustify: "İki Yana Yasla",
  colorBlindnessProtanopia: "Protanopi (Kırmızı)",
  colorBlindnessDeuteranopia: "Deuteranopi (Yeşil)",
  colorBlindnessTritanopia: "Tritanopi (Mavi)",
  colorBlindnessAchromatopsia: "Akromatopsi (Tam Renk Körlüğü)",
  colorBlindPairProtanopia: "Kırmızı - Yeşil",
  colorBlindPairDeuteranopia: "Yeşil - Kırmızı",
  colorBlindPairTritanopia: "Mavi - Sarı",
  colorBlindPairAchromatopsia: "Gri",
  pageStructureTitle: "Sayfa Yapısı",
  pageStructureEmpty: "Sayfada başlık bulunamadı.",
  pageStructureClose: "Kapat",
  pageStructureRefresh: "Başlık listesini yenile",
};

export const LABELS_EN: AccessibilityWidgetLabels = {
  triggerLabel: "Accessibility settings",
  panelTitle: "Accessibility Options",
  panelSubtitle: "Personalize your site experience",
  closePanel: "Close panel",
  shortcutHint: "ALT + A",
  languageToggleLabel: "Switch language",
  languageShort: "EN",
  enlargePanel: "Enlarge Panel",
  shrinkPanel: "Shrink Panel",
  profilesLabel: "Accessibility Profiles",
  profilesNone: "No Profile Selected",
  resetAll: "Reset Settings",
  announceProfileApplied: "profile applied",
  announceProfileRemoved: "profile removed",
  announceSettingsReset: "Settings reset",
  announceLanguageChanged: "Language changed",
  footerCopyright: "© 2026",
  toolTextZoom: "Text Zoom",
  toolColorBlind: "Color Blind Mode",
  toolGrayscale: "Grayscale",
  toolContrast: "Contrast Mode",
  toolDarkMode: "Dark Mode",
  toolHighlightLinks: "Highlight Links",
  toolHighlightHeadings: "Highlight Headings",
  toolReadingLine: "Reading Line",
  toolReadingMask: "Reading Mask",
  toolLargeCursor: "Large Cursor",
  toolBlueLight: "Blue Light Filter",
  toolStopAnimations: "Stop Animations",
  toolHideImages: "Hide Images",
  toolDyslexiaFont: "Dyslexia Friendly Font",
  toolLineHeight: "Line Height",
  toolTextAlign: "Text Alignment",
  toolLetterSpacing: "Letter Spacing",
  toolPageStructure: "Page Structure",
  profileInfoToggle: "Show profile features",
  profileAdhd: "ADHD Support",
  profileDescAdhd: "Reduces distractions and helps you focus",
  profileDetailsAdhd: "Pauses animations and shows a reading line",
  profileLowVision: "Visual Support",
  profileDescLowVision: "Optimized settings for people with visual difficulties",
  profileDetailsLowVision: "Larger text, high contrast, generous line height and a big cursor",
  profileColorBlind: "Color Blindness Support",
  profileDescColorBlind: "Special filters for color blindness",
  profileDetailsColorBlind: "Applies a deuteranopia (green) color filter",
  profileDyslexia: "Dyslexia Support",
  profileDescDyslexia: "Special fonts and layout for readers with dyslexia",
  profileDetailsDyslexia: "Dyslexia friendly font, generous letter and line spacing plus a reading line",
  profileEpilepsy: "Epilepsy Support",
  profileDescEpilepsy: "Safe viewing settings for people with epilepsy",
  profileDetailsEpilepsy: "Pauses animations and hides images",
  profileElderly: "For Seniors",
  profileDescElderly: "Eye-friendly and comfortable reading settings for seniors",
  profileDetailsElderly: "Larger text, generous line height, a big cursor and a blue light filter",
  contrastNormal: "Normal",
  contrastHigh: "High Contrast",
  contrastDark: "Dark Contrast",
  contrastLight: "Light Contrast",
  contrastWarm: "Warm Contrast",
  contrastCold: "Cold Contrast",
  contrastShortDark: "Dark",
  contrastShortLight: "Light",
  contrastShortHigh: "High",
  contrastShortWarm: "Warm",
  contrastShortCold: "Cold",
  alignLeft: "Align Left",
  alignCenter: "Align Center",
  alignRight: "Align Right",
  alignJustify: "Justify",
  colorBlindnessProtanopia: "Protanopia (Red)",
  colorBlindnessDeuteranopia: "Deuteranopia (Green)",
  colorBlindnessTritanopia: "Tritanopia (Blue)",
  colorBlindnessAchromatopsia: "Achromatopsia (Full)",
  colorBlindPairProtanopia: "Red - Green",
  colorBlindPairDeuteranopia: "Green - Red",
  colorBlindPairTritanopia: "Blue - Yellow",
  colorBlindPairAchromatopsia: "Gray",
  pageStructureTitle: "Page Structure",
  pageStructureEmpty: "No headings found on this page.",
  pageStructureClose: "Close",
  pageStructureRefresh: "Refresh heading list",
};

export const DEFAULT_LABELS: AccessibilityWidgetLabels = LABELS_TR;

export function labelsForLanguage(language: WidgetLanguage): AccessibilityWidgetLabels {
  return language === "en" ? LABELS_EN : LABELS_TR;
}
