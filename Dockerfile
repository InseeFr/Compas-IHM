FROM gitlab-registry.insee.fr/kubernetes/images/run/nginx:1.31.2-trixie

COPY --chown=$NGINX_USER:$NGINX_USER nginx.conf /etc/nginx/conf.d/default.conf
COPY --chown=$NGINX_USER:$NGINX_USER dist /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
ENTRYPOINT ["sh", "-c", "./vite-envs.sh && nginx -g 'daemon off;'"]
