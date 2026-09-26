import { AuthForm } from "../../components/auth-form";
import { Header } from "../../components/header";
import { Footer } from "../../components/sections";
export const metadata = { title: "Giriş Yap | Yazılım Atölyesi" };
export default function LoginPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="auth-page">
        <a href="/" className="back-link">
          ← Ana sayfaya dön
        </a>
        <div className="auth-heading">
          <p>Yazılım Atölyesi</p>
          <h1>Tekrar hoş geldin.</h1>
          <p>Kulüp alanına erişmek için giriş yap.</p>
        </div>
        <AuthForm mode="login" />
        <p className="auth-switch">
          Henüz üye değil misin? <a href="/uye-kaydi">Üye kaydı oluştur</a>
        </p>
      </main>
      <Footer />
    </>
  );
}
