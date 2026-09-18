src/
├── config/
│   ├── db.ts
│   └── redis.ts
│
├── integrations/
│   └── hha/
│       ├── hha.client.ts
│       ├── hha.types.ts
│       └── hha.mapper.ts
│
├── models/
│   ├── patient.model.ts
│   ├── referral.model.ts
│   └── sync-state.model.ts
│
├── queues/
│   ├── sync.queue.ts
│   └── sync.worker.ts
│
├── services/
│   ├── patient-sync.service.ts
│   ├── referral-sync.service.ts
│   └── status.service.ts
│
├── jobs/
│   └── scheduler.ts
│
└── server.ts


npm install mongoose express bullmq ioredis soap dotenv
npm install -D typescript ts-node-dev @types/express @types/node


PORT=5000

MONGO_URI=mongodb://127.0.0.1:27017/hha_db

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

HHA_WSDL_URL=https://app.hhaexchange.com/Integration/ENT/V1.8/ws.asmx?WSDL

HHA_USERNAME=your_username
HHA_PASSWORD=your_password

