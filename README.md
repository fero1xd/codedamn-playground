# Code Editor

![image](https://codedamn-web.s3.ap-south-1.amazonaws.com/full.png)

## Installation

Three main parts to setup

- Frontend
- Backend API
- Playground and proxy docker container

### Frontend

```bash
bun install
bun run build
bun preview
```

### Backend API

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
