FROM php:8.2-apache

# Cài đặt các thư viện lõi cần thiết
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo_mysql zip

# Cài đặt Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Thiết lập thư mục làm việc
WORKDIR /var/www/html

# Copy toàn bộ code vào Docker
COPY . /var/www/html

# Trỏ đường dẫn gốc của Apache vào thư mục public của Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Bật rewrite module để Laravel chạy được các route
RUN a2enmod rewrite

# Chạy lệnh cài đặt thư viện Laravel
RUN composer install --optimize-autoloader --no-dev

# Phân quyền cho thư mục storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache