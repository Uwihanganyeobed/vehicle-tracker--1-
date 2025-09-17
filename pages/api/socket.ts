import type { NextApiRequest } from "next"
import { Server as IOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import type { Socket } from "net"
import { getCollection } from "@/lib/mongodb"

type NextApiResponseServerIO = {
  socket: Socket & {
    server: HTTPServer & {
      io?: IOServer
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new IOServer(res.socket.server, {
      path: "/api/socket",
      cors: { origin: true, methods: ["GET", "POST"] },
    })
    res.socket.server.io = io

    // Broadcast vehicle coordinates every 5 seconds
    setInterval(async () => {
      try {
        const col = await getCollection("vehicles")
        const vehicles = await col
          .find({}, { projection: { id: 1, name: 1, lat: 1, lng: 1, speed: 1, heading: 1, lastUpdate: 1 } })
          .toArray()
        io.emit("vehicle:coords", { timestamp: Date.now(), vehicles })
      } catch (err) {
        // no-op
      }
    }, 5000)
  }
  res.end()
}


