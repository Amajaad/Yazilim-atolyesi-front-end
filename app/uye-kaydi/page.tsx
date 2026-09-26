import { AuthForm } from "../../components/auth-form";
import { Header } from "../../components/header";
import { Footer } from "../../components/sections";
export const metadata = { title: "Üye Kaydı | Yazılım Atölyesi" };
export default function RegisterPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="auth-page auth-register">
        <a href="/" className="back-link">
          ← Ana sayfaya dön
        </a>
        <div className="auth-heading">
          <p>Topluluğa katıl</p>
          <h1>Yerini ayır.</h1>
          <p>Üretmeye, öğrenmeye ve birlikte geliştirmeye başla.</p>
        </div>
        <AuthForm mode="register" />
        <p className="auth-switch">
          Zaten üye misin? <a href="/giris-yap">Giriş yap</a>
        </p>
      </main>
      <Footer />
    </>
  );
}
