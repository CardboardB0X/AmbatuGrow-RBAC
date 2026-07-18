# 🌐 End-to-End Cross-Functional System Orchestration

This architecture map displays how data transitions horizontally across system boundaries, tracking the operational flow from a purchase or sales trigger down to ledger adjustment.

---

## Orchestration Flowchart

```mermaid
flowchart TB
    %% Styling Definitions
    classDef core fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef proc fill:#2b6cb0,stroke:#3182ce,stroke-width:2px,color:#fff;
    classDef inv fill:#2f855a,stroke:#38a169,stroke-width:2px,color:#fff;
    classDef sales fill:#c05621,stroke:#dd6b20,stroke-width:2px,color:#fff;
    classDef fin fill:#9b2c2c,stroke:#e53e3e,stroke-width:2px,color:#fff;
    classDef help fill:#6b46c1,stroke:#805ad5,stroke-width:2px,color:#fff;

    %% Modules as Subgraphs
    subgraph Core_Master ["1. Core & Master Data"]
        U[Users & Roles Table]:::core
    end

    subgraph Procurement_SCM ["2. Procurement & Supply Chain"]
        PR[Purchase Requisition]:::proc -->|Mgr Approval| PO[Purchase Orders]:::proc
        SUP[Suppliers & Product_Suppliers]:::proc --> PO
    end

    subgraph Inventory_WMS ["3. Product & Inventory (WMS)"]
        INV[Inventory_Locations]:::inv
        ST[Stock_Transactions]:::inv
        PROD[Products & Categories]:::inv
    end

    subgraph Sales_CRM ["4. Sales & Customer Management"]
        CUST[Customers Master]:::sales --> SO[Sales_Orders]:::sales
        SO --> BIL[Billing_Details]:::sales
    end

    subgraph Helpdesk_Logistics ["5. Helpdesk & Logistics"]
        SHIP[Shipments Table]:::help
        TICK[Tickets System]:::help
    end

    subgraph Finance_Acct ["6. Finance & Accounting"]
        GL[General Ledger Entries]:::fin
        AP[Accounts Payable / Supplier Invoices]:::fin
        AR[Accounts Receivable / Invoicing]:::fin
    end

    %% Data Orchestration Connections
    INV -->|Below min_quantity_threshold| PR
    PO -->|Triggers Inbound Logistics| SHIP
    SHIP -->|Executes Delivery Receipt| ST
    ST -->|Updates Quantities| INV
    PO -->|Sent for Validation| AP
    AP -->|Executes 3-Way Match| ST
    AP -->|Adjusts Balances| GL

    SO -->|Checks Stock Availability| INV
    SO -->|Triggers Outbound Logistics| SHIP
    BIL -->|Generates Customer Debts| AR
    AR -->|Adjusts Balances| GL
    SO -->|Post-Sale Issue| TICK
```

---

## 🔄 Core Data Transition Paths

### 1. Inbound Materials Pipeline (Procurement ➡️ Inventory ➡️ Accounting)
* **Reorder Trigger**: When stock in `Inventory_Locations` falls below the `min_quantity_threshold` defined on a product, the system automatically flags a `Purchase Requisition` request.
* **Order Generation**: Once authorized, a `Purchase Order` (PO) is generated and dispatched to the supplier.
* **Logistics Receipt**: When goods arrive at the loading dock, a `Shipment` record is created, which generates a `Stock_Transaction` (Type = 'Stock-in') and updates the physical balance inside `Inventory_Locations`.
* **3-Way Match Validation**: Accounts Payable receives the supplier's invoice and validates it by executing a 3-way match comparing the original **Purchase Order**, the **Goods Receipt (Stock Transaction)**, and the **Invoice**. Once validated, the invoice is approved and balances are adjusted in the **General Ledger**.

### 2. Outbound Fulfillment Pipeline (CRM ➡️ Inventory ➡️ Logistics ➡️ Finance)
* **Order Creation**: A client places an order, which queries the `Inventory_Locations` table to check current stock availability.
* **Stock Allocation & Shipment**: If available, the `Sales_Order` status updates, triggering a new outbound `Shipment` log.
* **Stock Decrement**: The WMS deducts the items from the corresponding location node and writes a `Stock_Transaction` (Type = 'Stock-out').
* **Receivables & General Ledger**: A customer invoice is compiled based on `Billing_Details` which generates an `Accounts_Receivable` record. Once payment is recorded, the **General Ledger** is automatically updated.
* **Post-Sale SLA**: If the customer runs into issues post-delivery, the order references can trigger a support request inside the `Tickets` system, matching the client back to their communication history.
