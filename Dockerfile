FROM node:10
ENV PORT 8080
EXPOSE 8080
WORKDIR /app
COPY . .

RUN npm i -g yarn
RUN yarn --network-timeout 100000
#RUN lerna run build
WORKDIR /app/packages/orderbook
CMD ["yarn", "run", "start", "--config", "./env_settings/config.yaml"]
