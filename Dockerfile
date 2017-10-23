# Setup base image, using latest Node on Alpine Linux
FROM node:alpine as base
WORKDIR /weather-10kb

# Inclue build dependencies as a seperate stage, so they are excluded from the
# final image
FROM base as build
RUN apk --no-cache add build-base python-dev
COPY package.json .
COPY package-lock.json .
RUN yarn install --frozen-lockfile
COPY public public
RUN npm run build-css

# Release
FROM base as release
COPY . .
COPY --from=build /weather-10kb/public .
RUN yarn install --production --frozen-lockfile

EXPOSE 5000
CMD ["node", "index.js"]
