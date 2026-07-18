# 🏢 AmbatuGrow ERP - System Architecture & Security Blueprints

[![Vercel Deployment](https://img.shields.io/badge/deploy-vercel-blueviolet?style=flat-square&logo=vercel)](https://vercel.com)
[![GitHub License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

Welcome to the central system architecture repository for **AmbatuGrow ERP**, a cross-functional Enterprise Resource Planning (ERP) platform developed for Cavite State University (ITEC 75 - System Integration and Architecture II).

This repository serves as the single source of truth for the system's operational workflows, database schema design, and Role-Based Access Control (RBAC) security governance. 

---

## 🌐 Interactive HTML Web Dashboard

We have built a premium, responsive **Interactive HTML Dashboard** directly inside this repository. This single-page application (SPA) allows you to:
* 🔄 **Explore Flowcharts Interactively**: Switch tabs to render the E2E Orchestration map and sub-process lifecycles dynamically using Mermaid.js.
* 📖 **Read Embedded Documentation**: Access guides explaining ERP concepts, process logic gates, and structural databases.
* 🔐 **Simulate RBAC Clearance**: Select a role (e.g. Accountant, WMS Operator) to see their operational duties and CRUD permission grid across all 11 ERP modules instantly.
* 🔍 **Search Self-Service FAQs**: Search FAQs with instant filtering and category tags to answer system questions.

To run it locally:
1. Open the [index.html](index.html) file directly in any modern browser.

---

## ⚡ Vercel Deployment

This project is configured as a static site and is ready to deploy globally on **Vercel** with one click.

### Steps to Deploy:
1. Go to [Vercel](https://vercel.com) and log in with your GitHub account.
2. Click **Add New** ➡️ **Project**.
3. Import the `AmbatuGrow-RBAC` repository.
4. Leave the build and output settings at their default values (Vercel automatically detects the static HTML project).
5. Click **Deploy**. Vercel will host the web application on a public `.vercel.app` URL and update it on every commit you push to GitHub!

---

## 📂 Repository File Tree

```text
AmbatuGrow-RBAC/
├── docs/
│   ├── blueprints/
│   │   ├── system_orchestration.md   # End-to-End Cross-Functional System Orchestration
│   │   └── functional_workflows.md   # Deep-Dive sub-processes (WMS, CRM, Purchasing, SLA)
│   ├── database/
│   │   └── erd.md                    # Database Entity Relationship Diagram (ERD)
│   └── rbac/
│       └── rbac_model.md             # Role-Based Access Control (RBAC) security model
├── index.html                        # Interactive Dashboard Frontend Shell
├── style.css                         # Custom Premium Dark-Mode Stylesheet
├── app.js                            # Interactive Controller (Mermaid renders, FAQs, RBAC matrix)
└── README.md                         # Project Landing Page (this file)
```

---

## ⚙️ Core ERP Modules

AmbatuGrow is composed of **10 functional modules** designed to run cohesively across business boundaries:

1. **Inventory & Warehouse Management (WMS)**: Organizes SKUs across warehouse locations, tracking stock-in, stock-out, and transfers with real-time safety thresholds.
2. **Procurement & Purchasing**: Governs internal purchase requisitions, supplier catalogs, PO tracking, and 3-way invoice matching.
3. **Sales & Customer Support Management**: Handles customer profiles, quotations, sales orders, payment terms, and invoicing.
4. **Supply Chain Management (SCM)**: Manages logistics, demand planning, route optimization, and shipment tracing (inbound/outbound).
5. **Finance & Accounting**: Centralizes general ledger accounts, accounts payable, accounts receivable, and compliance/tax statements.
6. **Customer Service & Helpdesk**: Converts customer inquiries into support tickets, tracking priority levels and enforcing SLA windows.
7. **E-Commerce Integration**: Synchronizes online storefront catalog, stock quantities, and customer orders directly with the core ERP.
8. **Project Management**: Enables project scope planning, scheduling, resource allocation, and budget tracking.
9. **Human Resources (HR)**: Maintains employee databases, payroll processing, recruitment/onboarding, and leave management.
10. **Business Intelligence & Reporting**: Generates standard and custom compliance reports with role-based access filters.

---

## 🗺️ Navigation Guide

Use the following links to navigate through the raw markdown system blueprints:

* 🌐 **[End-to-End Orchestration Blueprint](docs/blueprints/system_orchestration.md)**: View the horizontal data transitions across the core modules.
* 🔄 **[Deep-Dive Workflows](docs/blueprints/functional_workflows.md)**: Explore procurement lifecycles, warehouse movements, CRM processing, and support ticket SLAs.
* 🗄️ **[Database Architecture (ERD)](docs/database/erd.md)**: Inspect the physical database layout, table properties, and foreign-key references.
* 🔐 **[Role-Based Access Control (RBAC)](docs/rbac/rbac_model.md)**: Read the access control policies, role-permission matrices, and security diagrams.
