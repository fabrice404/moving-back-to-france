FROM node:lts-alpine
ENV NODE_ENV=production
ENV PORT=5001
WORKDIR /usr/src/app
COPY ./public ./public
COPY ./.next/standalone .
COPY ./.next/static ./.next/static
EXPOSE 5001
RUN chown -R node /usr/src/app
USER node
CMD ["node", "server.js"]
