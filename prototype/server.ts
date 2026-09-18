import { serve } from "bun";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const PORT = 3005;

serve({
  port: PORT,
  fetch(req) {
    const url = new URL(req.url);
    let filePath = join(__dirname, url.pathname === "/" ? "index.html" : url.pathname);

    if (existsSync(filePath)) {
      const content = readFileSync(filePath);
      let contentType = "text/html";
      if (filePath.endsWith(".js")) contentType = "text/javascript";
      if (filePath.endsWith(".css")) contentType = "text/css";
      if (filePath.endsWith(".json")) contentType = "application/json";
      if (filePath.endsWith(".svg")) contentType = "image/svg+xml";

      return new Response(content, {
        headers: { "Content-Type": contentType },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀 ReworkFlow Demo running at http://localhost:${PORT}`);
console.log(`📱 Optimized for tablet/mobile dock use and desktop office board.`);
