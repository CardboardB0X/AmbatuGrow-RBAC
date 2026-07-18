# 🏢 AmbatuGrow ERP - System Architecture & Security Blueprints

[![GitHub License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

Welcome to the central system architecture repository for **AmbatuGrow ERP**, a cross-functional Enterprise Resource Planning (ERP) platform developed for Cavite State University (ITEC 75 - System Integration and Architecture II).

This repository serves as the single source of truth for the system's operational workflows, database schema design, and Role-Based Access Control (RBAC) security governance, focused strictly on five core modules: **Inventory & WMS**, **Customer Service & Helpdesk**, **Supply Chain Management**, **E-Commerce Integration**, and **Procurement (Purchasing)**.

---

## 🌐 Interactive HTML Web Dashboard

We have built a premium, responsive **Interactive HTML Dashboard** directly inside this repository. This single-page application (SPA) allows you to:
* 🔄 **Explore Flowcharts with Pan & Zoom**: Renders the E2E Orchestration map and sub-process lifecycles dynamically using Mermaid.js. Supports click-and-drag panning, scroll-wheel zooming, and button scaling overlay.
* 📖 **Searchable Documentation Center**: Contains structured guides explaining ERP concepts, process logic gates, data dictionaries, and an integrated **Helpdesk & FAQs** search portal.
* 🔐 **Simulate RBAC Clearance**: Select a role (e.g., WMS Manager, Procurement Specialist) to see their operational duties and explicit permission grid (e.g. *Full Access*, *Read & Write*, *Read-Only*, *No Access*) across the ERP modules.

### How to Run Locally:
1. Open the [index.html](index.html) file directly in any modern web browser.

---

## 📂 Repository File Tree

```text
AmbatuGrow-RBAC/
├── docs/
│   ├── blueprints/
│   │   ├── system_orchestration.md   # End-to-End Cross-Functional System Orchestration
│   │   └── functional_workflows.md   # Deep-Dive sub-processes (WMS, Purchasing, SLA)
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

## ⚙️ Core ERP Modules (Focused Scope)

AmbatuGrow is composed of **5 core modules** designed to run cohesively across system boundaries:

1. **Inventory & Warehouse Management (WMS)**: Organizes SKUs across warehouse locations, tracking stock-in, stock-out, and transfers with real-time safety thresholds.
2. **Procurement & Purchasing**: Governs internal purchase requisitions, supplier catalogs, PO tracking, and inbound receipts.
3. **Supply Chain Management (SCM)**: Manages logistics, demand planning, route optimization, and shipment tracing (inbound/outbound).
4. **Customer Service & Helpdesk**: Converts customer inquiries into support tickets, tracking priority levels and enforcing SLA windows.
5. **E-Commerce Integration**: Synchronizes online storefront catalog, stock quantities, and customer orders directly with the WMS.

---

## 🗺️ Navigation Guide

Use the following links to navigate through the raw markdown system blueprints:

* 🌐 **[End-to-End Orchestration Blueprint](docs/blueprints/system_orchestration.md)**: View the horizontal data transitions across the core modules.
* 🔄 **[Deep-Dive Workflows](docs/blueprints/functional_workflows.md)**: Explore procurement lifecycles, warehouse movements, and support ticket SLAs.
* 🗄️ **[Database Architecture (ERD)](docs/database/erd.md)**: Inspect the physical database layout, table properties, and foreign-key references based on the official schema.
* 🔐 **[Role-Based Access Control (RBAC)](docs/rbac/rbac_model.md)**: Read the access control policies, role-permission matrices, and security diagrams.
