import Transport from "winston-transport";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class PrismaTransport extends Transport {
  async log(info, callback) {
    setImmediate(() => this.emit("logged", info));

    try {
      await prisma.loogs.create({
        data: {
          status: info.message,
          addIP: info.ip || "N/A",
        },
      });
    } catch (err) {
      console.error("❌ Error saving log to DB:", err);
    }

    callback();
  }
}

export default PrismaTransport;
