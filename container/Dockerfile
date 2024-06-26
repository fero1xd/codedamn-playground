FROM oven/bun:1.1.4 as base

WORKDIR /root/driver

# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install esential packages
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install -y git && \
    apt-get install -y curl && \
    apt-get -y install python3 && \
    apt-get -y install make build-essential && \
    apt-get -y autoclean

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lockb /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lockb /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /root/driver/src ./src
COPY --from=prerelease /root/driver/dist ./dist
COPY --from=prerelease /root/driver/package.json .



CMD ["bun", "dist/index.js"] 

# CMD [ "bun", "dist/index.js" ]

# run the app
# WORKDIR /home/bun
# USER bun
# EXPOSE 3000

