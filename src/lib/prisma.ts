import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "error", "warn"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection pooling configuration
    connection: {
      pool: {
        min: 1,
        max: 5,
      },
    },
  }).$extends({
    result: {
      task: {
        updatedAt: {
          needs: { updatedAt: true },
          compute(task) {
            return new Date(task.updatedAt);
          },
        },
        createdAt: {
          needs: { createdAt: true },
          compute(task) {
            return new Date(task.createdAt);
          },
        },
      },
      project: {
        updatedAt: {
          needs: { updatedAt: true },
          compute(project) {
            return new Date(project.updatedAt);
          },
        },
        createdAt: {
          needs: { createdAt: true },
          compute(project) {
            return new Date(project.createdAt);
          },
        },
      },
    },
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
