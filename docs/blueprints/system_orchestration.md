# 🌐 End-to-End Cross-Functional System Orchestration

This architecture map displays how data transitions horizontally across system boundaries, tracking the operational flow across Procurement, WMS, Supply Chain (SCM), E-Commerce, and Helpdesk.

---

## Orchestration Flowchart

```mermaid
flowchart TB
    %% Styling Definitions
    classDef core fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef proc fill:#2b6cb0,stroke:#3182ce,stroke-width:2px,color:#fff;
    classDef inv fill:#2f855a,stroke:#38a169,stroke-width:2px,color:#fff;
    classDef help fill:#6b46c1,stroke:#805ad5,stroke-width:2px,color:#fff;
    classDef ecom fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#fff;

    %% Modules as Subgraphs
    subgraph Core_Master ["1. Core & Master Data"]
        U["Users & Roles Table"]:::core
    end

    subgraph Procurement_SCM ["2. Procurement & Purchasing"]
        PR[Purchase Requisition]:::proc -->|Mgr Approval| PO[Purchase Orders]:::proc
        SUP["Suppliers & Product_Suppliers"]:::proc --> PO
    end

    subgraph Inventory_WMS ["3. Product & Inventory (WMS)"]
        INV[Inventory_Locations]:::inv
        ST[Stock_Transactions]:::inv
        PROD["Products & Categories"]:::inv
    end

    subgraph Digital_Sales ["4. E-Commerce & SCM"]
        EC[E-Commerce Orders]:::ecom
        SHIP[Shipments Table]:::ecom
    end

    subgraph Support_Logistics ["5. Helpdesk / Support"]
        TICK[Tickets System]:::help
    end

    %% Data Orchestration Connections
    INV -->|Below min_quantity_threshold| PR
    PO -->|Triggers Inbound Logistics| SHIP
    SHIP -->|Executes Delivery Receipt| ST
    ST -->|Updates Quantities| INV

    EC -->|Syncs Order details| INV
    EC -->|Triggers Outbound Logistics| SHIP
    EC -->|Post-Sale Issue| TICK
```

---

## 🔄 Core Data Transition Paths

### 1. Procurement Replenishment Pipeline (Procurement ➡️ Inventory)
* **Reorder Trigger**: When WMS inventory levels inside `Inventory_Locations` drop below the safety limit (`min_quantity_threshold`), the system flags a `Purchase Requisition`.
* **Purchase Dispatch**: Approved requisitions generate a `Purchase Order` sent to suppliers.
* **Goods Receipt**: Dock deliveries trigger an inbound `Shipment` update, logging a `Stock_Transaction` (Type = 'Stock-in') and incrementing inventory quantities.

### 2. Digital Fulfillment Pipeline (E-Commerce ➡️ WMS ➡️ Logistics)
* **Order Sync**: E-Commerce order checkout details are synced immediately into the WMS, reserving inventory and decrementing available levels via a `Stock_Transaction` (Type = 'Stock-out').
* **Outbound Dispatch**: The system schedules outbound logistics shipments inside the `Shipments` table.
* **Post-Sale SLA Support**: If customer delivery issues arise, the order metadata references feed directly into the Helpdesk `Tickets` system to track support resolutions.
