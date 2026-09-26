import { Header } from "../../components/header";
import { Footer } from "../../components/sections";
import { AnnouncementList } from "../../components/announcement-list";
export const metadata = { title: "Duyurular | Yazılım Atölyesi" };
export default function AnnouncementsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="announcement-page page-width">
        <a href="/" className="back-link">
          ← Ana sayfaya dön
        </a>
        <h1>Duyurular</h1>
        <AnnouncementList />
      </main>
      <Footer />
    </>
  );
}
