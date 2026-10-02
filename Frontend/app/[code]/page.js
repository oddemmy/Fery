import { redirect } from "next/navigation";
import { API_BASE } from "@/lib/api";

// This route is what makes the short link actually behave like a short
// link: visiting /abc123 looks up the original URL from the API, then
// redirects the browser there. The API itself only ever returns JSON —
// per the project spec, this redirect step is the frontend's job.
export default async function ShortCodeRedirect({ params }) {
  const { code } = params;

  let res;
  try {
    res = await fetch(`${API_BASE}/shorten/${code}`, { cache: "no-store" });
  } catch {
    return <NotFound reason="Couldn't reach the server." />;
  }

  if (!res.ok) {
    return <NotFound reason="This short link doesn't exist." />;
  }

  const data = await res.json();
  redirect(data.url);
}

function NotFound({ reason }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-bg">
      <div className="max-w-[420px] text-center">
        <h1 className="font-serif italic text-3xl mb-3 text-fg">
          Link not found
        </h1>
        <p className="text-muted mb-8">{reason}</p>
        <a href="/" className="text-accent underline underline-offset-4">
          Shorten a new link
        </a>
      </div>
    </main>
  );
}
