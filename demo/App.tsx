export default function App() {
  return (
    <div className="demo-page">
      <header className="demo-header">
        <div className="demo-container demo-header-inner">
          <div className="demo-logo">
            <span className="demo-logo-mark">YİÜ</span>
            <div>
              <strong>YÜKSEK İHTİSAS</strong>
              <small>ÜNİVERSİTESİ</small>
            </div>
          </div>
          <nav className="demo-nav" aria-label="Ana menü">
            <a href="#universitemiz">ÜNİVERSİTEMİZ</a>
            <a href="#akademik">AKADEMİK</a>
            <a href="#arastirma">ARAŞTIRMA</a>
            <a href="#kampus">KAMPÜS YAŞAMI</a>
          </nav>
        </div>
      </header>

      <main className="demo-main">
        <section className="demo-hero">
          <div className="demo-container">
            <h1>Yüksek İhtisas Üniversitesi</h1>
            <p>
              1863&apos;ten bu yana bilim, eğitim ve araştırmada öncü bir kurum.
              Bu sayfa, erişilebilirlik widget&apos;ının etkilerini test etmek için
              hazırlanmış bir <a href="#demo-link">örnek içerik</a> sayfasıdır.
            </p>
            <p>
              Sağ alttaki butona tıklayarak yazı boyutunu büyütebilir, kontrast
              modlarını deneyebilir, karanlık modu açabilir ve daha fazlasını
              yapabilirsiniz. Tercihleriniz tarayıcıda kaydedilir.
            </p>
          </div>
        </section>

        <section className="demo-content" id="universitemiz">
          <div className="demo-container">
            <h2>Üniversitemiz Hakkında</h2>
            <div className="demo-grid">
              <article className="demo-card">
                <h3>Tarihçe</h3>
                <p>
                  Yüksek İhtisas Üniversitesi, köklü geçmişiyle Türkiye&apos;nin önde
                  gelen yükseköğretim kurumlarından biridir. Kampüsleri İstanbul&apos;un
                  Avrupa yakasında yer alır. Daha fazla bilgi için{" "}
                  <a href="#tarihce">tarihçe sayfamızı</a> ziyaret edin.
                </p>
              </article>
              <article className="demo-card">
                <h3>Kampüsler</h3>
                <p>
                  Güney Kampüs, Kuzey Kampüs, Kandilli ve Sarıtepe gibi birden
                  çok kampüsüyle öğrencilerine geniş bir yaşam alanı sunar.
                  Kampüs haritalarına <a href="#harita">buradan</a> ulaşabilirsiniz.
                </p>
              </article>
              <article className="demo-card">
                <h3>Akademik Birimler</h3>
                <p>
                  Mühendislikten sosyal bilimlere, fen bilimlerinden eğitim
                  fakültelerine uzanan geniş bir akademik yelpaze.{" "}
                  <a href="#fakulteler">Fakülteleri inceleyin</a>.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="demo-content demo-alt" id="akademik">
          <div className="demo-container">
            <h2>Akademik Takvim</h2>
            <ul className="demo-list">
              <li>Güz Dönemi kayıtları: <strong>15 Eylül</strong></li>
              <li>Derslerin başlaması: <strong>28 Eylül</strong></li>
              <li>Ara sınavlar: <strong>9 - 20 Kasım</strong></li>
              <li>Final sınavları: <strong>4 - 22 Ocak</strong></li>
            </ul>
            <p>
              Ayrıntılı takvim için <a href="#takvim">akademik takvim sayfasına</a>{" "}
              göz atın.
            </p>
          </div>
        </section>

        <section className="demo-content" id="arastirma">
          <div className="demo-container">
            <h2>Araştırma</h2>
            <p>
              Üniversitemiz bünyesinde <a href="#merkezler">uygulama ve araştırma
              merkezleri</a>, teknoloji transfer ofisi ve öğrenci projeleri
              desteklenmektedir.
            </p>
            <blockquote>
              &quot;Bilimsel bilgi, herkes için erişilebilir olduğunda anlam kazanır.&quot;
            </blockquote>
          </div>
        </section>

        <section className="demo-content demo-alt" id="kampus">
          <div className="demo-container">
            <h2>Kampüs Yaşamı</h2>
            <p>
              Öğrenci kulüpleri, spor etkinlikleri ve sosyal sorumluluk
              projeleriyle dolu bir kampüs hayatı sizleri bekliyor.{" "}
              <a href="#etkinlikler">Bu haftanın etkinlikleri</a> ile
              başlayabilirsiniz.
            </p>
          </div>
        </section>
      </main>

      <footer className="demo-footer">
        <div className="demo-container">
          <p>
            Demo sayfası —{" "}
            <a href="https://yiu.edu.tr" target="_blank" rel="noreferrer">
              yiu.edu.tr
            </a>{" "}
            referans alınarak oluşturuldu. Widget: @company/accessibility-widget
          </p>
        </div>
      </footer>
    </div>
  );
}
