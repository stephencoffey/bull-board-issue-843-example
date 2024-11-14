// import everything from deps.ts
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { HonoAdapter } from '@bull-board/hono';
import { Queue as QueueMQ, Worker as WorkerMQ, Job } from 'bullmq';
import { Hono } from 'hono';
import type { Context } from 'hono';
import type { Queue as QueueType, Job as JobType } from 'bullmq';
import { logger } from 'hono/logger';
import { showRoutes } from 'hono/dev';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import dotenv from 'dotenv';
import { exampleProcessor } from './lib/workers.js';
import { createClient } from 'redis';

dotenv.config();

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});
const createQueueMQ = (name: string): QueueType => new QueueMQ(name, { connection: { url: redisUrl}});

async function setupExampleBullMQProcessor(queueName: string) {
  new WorkerMQ(
    queueName,
    async (job: JobType) => {  // You might want to create a proper Job interface
      return await exampleProcessor(
        job.id,
        job.data,
        async (msg: string) => { await job.log(msg); },
        (progress: number) => job.updateProgress(progress)
      );
    },
    { 
      connection: {
        url: redisUrl,
      },
      autorun: true
    }
  );
}


const run = async () => {
  const testBullMq = createQueueMQ('test-queue');
  
  await setupExampleBullMQProcessor(testBullMq.name);

  const app = new Hono();

  app.use(logger());

  const bullBoardHonoAdapter = new HonoAdapter(serveStatic);
 
  const myQueues = [
    new BullMQAdapter(testBullMq),
  ]; 
  
   createBullBoard({
    queues: myQueues,
    serverAdapter: bullBoardHonoAdapter,
    options: {
      uiConfig: {
        boardTitle: 'Example Jobs'
      },
    },
  });

  const basePath = '/ui';
  bullBoardHonoAdapter.setBasePath(basePath);

  const bullBoardRouter = bullBoardHonoAdapter.registerPlugin();

  app.get('/add', async (c: Context) => {
    await testBullMq.add('Add', { title: c.req.query('title') });
    return c.json({ ok: true })
  });
  
  showRoutes(app);

  serve({ fetch: app.fetch, port: 3000 }, ({ address, port }: { address: string, port: number }) => {
    /* eslint-disable no-console */
    console.log(`Running on ${address}:${port}...`);
    console.log(`For the UI of instance1, open http://localhost:${port}/ui`);
    console.log('Make sure Redis is running on port 6379 by default');
    console.log('To populate the queue, run:');
    console.log(`  curl http://localhost:${port}/add?title=Example`);
    /* eslint-enable */
  })
  
  console.log("Server running at http://localhost:3000");
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
