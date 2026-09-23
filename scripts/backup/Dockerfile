FROM alpine:3.22

RUN apk add --no-cache sqlite

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
