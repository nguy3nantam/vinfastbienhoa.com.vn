FROM python:3.12-alpine

RUN apk add --no-cache chromium

WORKDIR /app
COPY sync.py entrypoint.sh ./
RUN chmod +x entrypoint.sh

CMD ["./entrypoint.sh"]
