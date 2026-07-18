# 🏢 AmbatuGrow ERP - System Architecture & Security Blueprints

Welcome to the central system architecture repository for **AmbatuGrow ERP**, a cross-functional Enterprise Resource Planning (ERP) platform developed for Cavite State University (ITEC 75 - System Integration and Architecture II).

This repository serves as the single source of truth for the system's operational workflows, database schema design, and Role-Based Access Control (RBAC) security governance. 

---

## 📂 Project Structure

To maintain clean and readable documentation without cluttering the main page, our architecture blueprints are modularized as follows:

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

Use the following links to navigate through the system blueprints:

* 🌐 **[End-to-End Orchestration Blueprint](docs/blueprints/system_orchestration.md)**: View the horizontal data transitions across the core modules.
* 🔄 **[Deep-Dive Workflows](docs/blueprints/functional_workflows.md)**: Explore procurement lifecycles, warehouse movements, CRM processing, and support ticket SLAs.
* 🗄️ **[Database Architecture (ERD)](docs/database/erd.md)**: Inspect the physical database layout, table properties, and foreign-key references.
* 🔐 **[Role-Based Access Control (RBAC)](docs/rbac/rbac_model.md)**: Read the access control policies, role-permission matrices, and security diagrams.

---

## 📈 Rendering Diagrams on GitHub

All diagrams in this repository are written in native **Mermaid.js** syntax. GitHub compiles these blocks dynamically on page load, rendering them as clean, responsive vector graphics. 

If you are viewing files locally or on a platform without native Mermaid support, we recommend using a Markdown reader with Mermaid integrations (e.g., VS Code with *Markdown Preview Mermaid Support*).
