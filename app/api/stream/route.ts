import { NextResponse } from "next/server"
import { getCollection } from "@/lib/mongodb"

export const runtime = "nodejs"

export async function GET() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const interval = setInterval(async () => {
        try {
          const col = await getCollection("vehicles")
          const vehicles = await col
            .find({}, { projection: { id: 1, name: 1, lat: 1, lng: 1, speed: 1, heading: 1, lastUpdate: 1, driver: 1, status: 1, fuel: 1 } })
            .toArray()
          const payload = `data: ${JSON.stringify({ timestamp: Date.now(), vehicles })}\n\n`
          controller.enqueue(encoder.encode(payload))
        } catch {
          // ignore
        }
      }, 5000)
      ;(global as any).__sse_interval = interval
    },
    cancel() {
      const i = (global as any).__sse_interval
      if (i) clearInterval(i)
    },
  })

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  })
}


