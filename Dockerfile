
FROM node:12-alpine

RUN mkdir /opt/ols-test
ADD test.js package.json /opt/ols-test/

RUN cd /opt/ols-test && npm install

ENTRYPOINT ["node", "/opt/ols-test/test.js"]


