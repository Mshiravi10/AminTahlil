# امین‌تحلیل (Amin Tahlil)

امین‌تحلیل یک پلتفرم قدرتمند مانیتورینگ و رصد سرویس‌ها است که به یک نمونه Jaeger متصل می‌شود، داده‌های trace و span را دریافت می‌کند، درخت‌های اجرا را تجسم می‌کند، از فیلتر کردن و صدور پشتیبانی می‌کند و دید کاملی از سیستم‌های توزیع‌شده ارائه می‌دهد.

## ویژگی‌های اصلی

- **داشبورد جامع**: نمایش خلاصه‌ای از وضعیت سیستم، تعداد تریس‌ها، میانگین زمان پاسخ و درصد خطا
- **جستجوی تریس‌ها**: امکان جستجو بر اساس سرویس، عملیات، زمان اجرا، تگ‌ها و موارد دیگر
- **مشاهده جزئیات تریس**: نمایش گرافیکی تریس‌ها به صورت نمودار گانت و درخت اجرا
- **تحلیل سرویس‌ها**: مشاهده عملیات‌های هر سرویس، نمودارهای میانگین زمان پاسخ و درصد خطا
- **نقشه سرویس‌ها**: نمایش گرافیکی ارتباطات بین سرویس‌ها

## استک تکنولوژی

**بک‌اند**:
- ASP.NET Core Web API (.NET 8)
- C#
- REST endpoints (attribute-based routing)
- OpenTelemetry SDK
- HttpClientFactory
- Config binding

**فرانت‌اند**:
- React + TypeScript
- Tailwind CSS + RTL support
- React Router
- Axios + React Query
- Zustand (مدیریت استیت)

**زیرساخت**:
- Docker و Docker Compose
- Swagger/OpenAPI
- Jaeger (برای تریسینگ)

## راه‌اندازی پروژه

### پیش‌نیازها

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### راه‌اندازی با Docker Compose

برای راه‌اندازی کل پروژه، از Docker Compose استفاده کنید:

```bash
# کلون پروژه
git clone <repository-url>
cd amin-tahlil

# ساخت و اجرای کانتینرها
docker-compose up -d
```

بعد از اجرای دستورات فوق، سرویس‌های زیر در دسترس خواهند بود:

- **فرانت‌اند**: http://localhost:3000
- **بک‌اند API**: http://localhost:5000
- **Swagger/OpenAPI**: http://localhost:5000/index.html
- **Jaeger UI**: http://localhost:16686

## تنظیمات

### تنظیمات بک‌اند

تنظیمات بک‌اند در فایل `appsettings.json` قرار دارند:

```json
{
  "Jaeger": {
    "BaseUrl": "http://localhost:16686/api/traces",
    "TimeoutSeconds": 15
  },
  "Features": {
    "EnableServiceMap": true,
    "EnableExport": true
  }
}
```

همچنین می‌توانید با استفاده از متغیرهای محیطی این تنظیمات را شخصی‌سازی کنید. متغیرهای محیطی در فایل `docker-compose.yml` قابل تغییر هستند.

### تنظیمات فرانت‌اند

آدرس API بک‌اند در فرانت‌اند از طریق متغیر محیطی `REACT_APP_API_URL` قابل تنظیم است. پیش‌فرض آن `http://localhost:5000/api` است.

## API Endpoints

### Trace Endpoints

- `GET /api/traces/{traceId}`: دریافت کامل درخت تریس (تمام اسپن‌ها، متادیتا، تگ‌ها، لاگ‌ها)
- `GET /api/traces`: جستجوی تریس‌ها بر اساس فیلترها: سرویس، عملیات، مدت، زمان، تگ‌ها

### Service Endpoints

- `GET /api/services`: تمام سرویس‌های شناخته‌شده
- `GET /api/services/{service}/operations`: تمام عملیات‌های یک سرویس

### Analytics Endpoints

- `GET /api/analytics/errors`: آخرین تریس‌های خطا
- `GET /api/analytics/slow-spans`: کندترین اسپن‌ها با متادیتای زمان‌بندی
- `GET /api/analytics/service-map`: گراف ارتباطی میکروسرویس‌ها

### Health Check

- `GET /api/health`: وضعیت سلامت برنامه

## توسعه آینده

برای توسعه آینده موارد زیر پیشنهاد می‌شود:

- **احراز هویت**: پیاده‌سازی JWT یا احراز هویت پایه
- **ادغام با Prometheus**: برای همبستگی متریک‌ها
- **بهبود فیلتر تگ‌ها**: اضافه کردن منطق AND/OR
- **صفحه‌بندی لیست سرویس‌ها**: برای مدیریت بهتر تعداد زیاد سرویس‌ها

## اسکرین‌شات‌ها

![داشبورد](screenshots/dashboard.png)

![جستجوی تریس‌ها](screenshots/trace-explorer.png)

![جزئیات تریس](screenshots/trace-detail.png)

![نقشه سرویس‌ها](screenshots/service-map.png)

## لایسنس

این پروژه تحت لایسنس Apache منتشر شده است.
