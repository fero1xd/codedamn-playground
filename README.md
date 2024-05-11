# Code Editor

Live, Interactive online coding workspace inspired by [Codedamn playgrounds](https://codedamn.com/playgrounds)
![image](https://codedamn-web.s3.ap-south-1.amazonaws.com/full.png)

## TODO

- Figure out way to bundle node_modules type defs

## Installation

Three main parts to setup

- Frontend
- Backend API
- Playground and proxy docker container

### Frontend

Create a `.env.local` file in the root directory

```
VITE_API_URL=
VITE_IS_SECURE=
VITE_PG_SUBDOMAIN=
```

```bash
bun install
bun run build
bun preview
```

### Backend API

Create a `.env` file with the following contents

```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
DATABASE_URL=
BUCKET=
REGION=
ACCESS_KEY=
SECRET_KEY=
DOMAIN=
SECURE=
```

```bash
cd backend
bun install

bun run build
node dist/index.mjs
# OR
bun dev
```

### Nginx Proxy Container

```bash
cd nginx
chmod +x ./proxy.sh
./proxy.sh
```

### Playground Container

```bash
cd container
docker build -t playgrounds:prod . -f Dockerfile.prod
```
