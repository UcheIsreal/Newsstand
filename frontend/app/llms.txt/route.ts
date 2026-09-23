import { SITE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export function GET() {
  const body = `# Newsstand

Newsstand is a source-attributed RSS news briefing website that summarizes major global stories into concise 100-word briefs.

Core pages:
- ${SITE_URL}
- ${SITE_URL}/world
- ${SITE_URL}/business
- ${SITE_URL}/finance
- ${SITE_URL}/technology
- ${SITE_URL}/politics
- ${SITE_URL}/sports
- ${SITE_URL}/health
- ${SITE_URL}/entertainment
- ${SITE_URL}/topics
- ${SITE_URL}/sources

Discovery:
- Sitemap: ${SITE_URL}/sitemap.xml
- Robots: ${SITE_URL}/robots.txt

Content policy:
Newsstand provides short summaries, topic trails, source attribution, and links to original publishers. Original publishers own the full reporting, quotes, images, and updates.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8"
    }
  });
}
