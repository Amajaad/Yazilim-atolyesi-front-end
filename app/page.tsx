import { Header } from "../components/header";
import { Hero } from "../components/hero";
import {
  About,
  Announcements,
  Footer,
  Join,
  Pillars,
  Team,
  Workflow,
} from "../components/sections";
import { getHomeAnnouncements, getPageContents } from "../lib/server-api";
import { PublicBlocks } from "../components/public-blocks";

export default async function Home() {
  const [{ items, live }, home, about] = await Promise.all([getHomeAnnouncements(), getPageContents("HOME"), getPageContents("ABOUT")]);
  const hero = home?.find(block => block.type === "HERO");
  const other = home?.filter(block => block.id !== hero?.id) || [];
  return (
    <>
      <Header />
      <main id="main-content">
        {(home === null || hero) && <Hero block={hero} />}
        {other.length > 0 && <section className="managed-blocks page-width" aria-label="Kulüpten güncellemeler"><PublicBlocks blocks={other} /></section>}
        <Pillars />
        <div className="overview-grid page-width">
          <Announcements items={items} live={live} />
          <About blocks={about} />
          <Join />
        </div>
        <Team />
        <Workflow />
      </main>
      <Footer />
    </>
  );
}
