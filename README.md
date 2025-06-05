# Swagger Lite 🚀

**Swagger Lite** is a simple and lightweight API testing tool built for Spring Boot applications.  
It automatically fetches API documentation from the `/v3/api-docs` endpoint and offers a modern UI to explore and test your APIs with ease.

## 🔧 Features

- ✅ Auto-fetch endpoints using OpenAPI v3
- 📡 Send HTTP requests: GET, POST, PUT, DELETE, PATCH
- 🧾 Set custom headers and request body
- 📊 View response status, body, and execution time
- ⭐ Save request history and mark favorites
- 🌙 Dark mode support for better readability

## ▶️ Getting Started

### 1. Add OpenAPI Dependency

To enable API documentation in your Spring Boot project, add the following Maven dependency:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.7.0</version>
</dependency>
