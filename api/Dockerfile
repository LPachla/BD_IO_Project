FROM php:8.4.7RC1-apache-bullseye

RUN a2enmod rewrite

WORKDIR /var/www/html/

EXPOSE 80

CMD ["apache2-foreground"]
