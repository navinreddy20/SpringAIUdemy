# 🛒 E-Commerce Product Management System

## 📘 Executive Summary
The **E-Commerce Product Management System** is a robust full-stack backend solution developed to support modern online retail operations. It provides a comprehensive REST API for managing product data using a **Spring Boot** backend, designed to integrate seamlessly with a **React.js** frontend. The system emphasizes reliability, maintainability, and performance, making it suitable for scalable e-commerce applications.

---

## 📑 Table of Contents
- [Project Objective](#project-objective)
- [Features](#features)
  - [User Module](#user-module)
  - [Functional Features](#functional-features)
- [Technologies Used](#technologies-used)
- [Dependencies Used](#dependencies-used)
- [System Architecture](#system-architecture)
- [API Specification](#api-specification)
- [Installation](#installation)
  - [Backend Installation with IntelliJ IDEA](#backend-installation-with-intellij-idea)
  - [Frontend Installation With VS Code](#frontend-installation-with-vs-code)
- [Folder Structure (Backend)](#folder-structure-backend)

---

## 🎯 Project Objective
To develop and implement a high-performance **Product Management System** that serves as a foundational backend for e-commerce platforms. The system offers efficient handling of product information and digital assets through standardized, secure REST APIs.

---

## 🔧 Features
### User Module
- Manage product creation, update, deletion.
- Retrieve and display product details.

### Functional Features
- Full product lifecycle management
- Keyword-based search
- Image upload and retrieval
- Cross-origin frontend integration

---

## 💡 Technologies Used
| Component           | Technology                     |
| -------------------| ------------------------------ |
| Backend            | Spring Boot 3.3.3              |
| ORM                | Spring Data JPA, Hibernate ORM |
| Database           | PostgreSQL                     |
| Frontend (optional)| React.js                       |
| Build Tool         | Apache Maven                   |
| Runtime            | Java 21                        |
| Tools              | Project Lombok, Postman        |

---

## 📦 Dependencies Used
The following dependencies are included in the project as per the `pom.xml`:

| Dependency Group             | Artifact                          | Scope     |
|-----------------------------|-----------------------------------|-----------|
| org.springframework.boot    | spring-boot-starter-web           | compile   |
| org.springframework.boot    | spring-boot-starter-data-jpa      | compile   |
| org.springframework.boot    | spring-boot-starter-test          | test      |
| org.postgresql              | postgresql                        | runtime   |
| org.projectlombok           | lombok                             | optional  |

---

## 🧱 System Architecture
The system follows a multi-layered monolithic architecture adhering to enterprise Java best practices:

1. **Presentation Layer** – REST controllers managing HTTP requests/responses.
2. **Service Layer** – Business logic components encapsulating core operations.
3. **Data Access Layer** – Spring Data JPA repositories for database interactions.
4. **Entity Layer** – Java classes representing domain entities.

---

## 🔗 API Specification
| Endpoint                          | Method | Description               | Status Codes |
| --------------------------------- | ------ | ------------------------- | ------------ |
| `/api/products`                   | GET    | Retrieve all products     | 200          |
| `/api/product/{id}`               | GET    | Get product by ID         | 200, 404     |
| `/api/product/{productId}/image`  | GET    | Retrieve product image    | 200, 404     |
| `/api/product`                    | POST   | Add a new product         | 201, 500     |
| `/api/product/{id}`               | PUT    | Update existing product   | 200, 500     |
| `/api/product/{id}`               | DELETE | Delete product            | 200, 404     |
| `/api/product/search?keyword=xyz` | GET    | Search product by keyword | 200          |

---

## 🛠 Installation
### Backend Installation with IntelliJ IDEA
1. Open IntelliJ IDEA and select "Open" project.
2. Navigate to the `SpringEcom` directory.
3. Ensure Java 21 is installed and configured.
4. Click **Run > Run 'SpringEcomApplication'**.

### Frontend Installation With VS Code
1. Navigate to the frontend folder (React.js project).
2. Run `npm install` to install dependencies.
3. Run `npm start` to start the development server.

---

## 📂 Folder Structure (Backend)
```plaintext
com.telusko.springecom
├── controller                # REST controllers (ProductController)
├── service                   # Service layer interfaces and implementations
├── repository                # Spring Data JPA repositories
├── model                     # Entity classes (Product)
└── SpringEcomApplication     # Main application class
```
---
