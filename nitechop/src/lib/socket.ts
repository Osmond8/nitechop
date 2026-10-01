import { Server } from "socket.io";
declare global { var __io: Server | undefined; }
export function getIO() {
  if (!global.__io) {
    global.__io = new Server(4000, { cors: { origin: "*" } });
    global.__io.on("connection", (s) => {
      s.on("join_riders", () => s.join("riders"));
      s.on("join_customer", (id: string) => s.join(`customer:${id}`));
      s.on("join_customers", () => s.join("customers"));
    });
  }
  return global.__io;
}
