// AmbatuGrow ERP - Interactive Dashboard Controller

// 1. Mermaid Flowchart Definitions (Template Strings)
const flowcharts = {
  orchestration: `flowchart TB
    classDef core fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef proc fill:#2b6cb0,stroke:#3182ce,stroke-width:2px,color:#fff;
    classDef inv fill:#2f855a,stroke:#38a169,stroke-width:2px,color:#fff;
    classDef help fill:#6b46c1,stroke:#805ad5,stroke-width:2px,color:#fff;
    classDef ecom fill:#06b6d4,stroke:#0891b2,stroke-width:2px,color:#fff;

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

    INV -->|Below min_quantity_threshold| PR
    PO -->|Triggers Inbound Logistics| SHIP
    SHIP -->|Executes Delivery Receipt| ST
    ST -->|Updates Quantities| INV

    EC -->|Syncs Order details| INV
    EC -->|Triggers Outbound Logistics| SHIP
    EC -->|Post-Sale Issue| TICK`,
  procurement: `flowchart TD
    classDef proc fill:#1b8a4f,stroke:#146c3c,stroke-width:2px,color:#fff;
    classDef ext fill:#ebf8f1,stroke:#1b8a4f,stroke-dasharray: 5 5,stroke-width:2px,color:#1f2722;
    classDef decision fill:#f5ecd8,stroke:#d68910,stroke-width:2px,color:#1f2722;

    WMS_Reorder([WMS MODULE: Low-Stock Reorder Alert]):::ext --> F1_PR
    
    subgraph F1 ["1. Request & Manager Approval Gate"]
      F1_PR[Employee submits supplies requisition PR]:::proc --> F1_Approval{Manager reviews budget?}:::decision
      F1_Approval -->|Rejected| F1_PR
      F1_Approval -->|Approved| F1_Status[Mark request as Approved]:::proc
    end

    subgraph F2 ["2. Supplier Catalog Selection"]
      F2_Supplier[Match items with preferred supplier & costs]:::proc
    end

    F1_Status --> F3_PO
    F2_Supplier --> F3_PO

    subgraph F3 ["3. Purchase Order PO Contract"]
      F3_PO[Generate formal Purchase Order PO contract]:::proc --> F3_Send[Send PO contract to supplier]:::proc
      F3_Send --> F3_Track{Did supplier confirm PO?}:::decision
      F3_Track -->|Yes: Shipped| F4_Rec[Goods arrive at warehouse dock]:::proc
      F3_Track -->|No: Cancelled| F3_PO
    end

    subgraph F4 ["4. Goods Receipt & 3-Way Matching"]
      F4_Rec --> F4_Match{Match PO + Delivery Slip + Vendor Invoice?}:::decision
      F4_Match -->|Mismatch| F4_Flag[Flag invoice issues & halt payment]:::proc
      F4_Match -->|All match| F4_Approve[Approve payment & close purchasing file]:::proc
    end

    F4_Approve -->|Inbound stock-in receipt| WMS_StockIn([WMS MODULE: Add items to warehouse stock]):::ext
    F3_Send -->|Logistics tracking| SCM_Inbound([SCM MODULE: Track inbound cargo shipping]):::ext`,

  inventory: `flowchart TD
    classDef inv fill:#2f855a,stroke:#276749,stroke-width:2px,color:#fff;
    classDef ext fill:#f0fff4,stroke:#2f855a,stroke-dasharray: 5 5,stroke-width:2px,color:#1a202c;
    classDef decision fill:#f5ecd8,stroke:#d68910,stroke-width:2px,color:#1f2722;

    Ecom_Sync([E-COMMERCE MODULE: Customer Checkout Webhook]):::ext --> F2_StockOut
    Proc_Rec([PROCUREMENT MODULE: Goods Inbound Receipt]):::ext --> F2_StockIn

    subgraph F1_WMS ["1. Inventory Tracking"]
      F1_Item[Identify barcode SKU details & thresholds]:::inv
    end

    subgraph F2_WMS ["2. Stock Transactions"]
      F2_StockIn[Record supplier deliveries Stock-In]:::inv --> F2_Log[Maintain movement logs & transactions history]:::inv
      F2_StockOut[Log sales order pickings Stock-Out]:::inv --> F2_Log
      F2_Log --> F2_Expire[Verify item batch dates & expiration tags]:::inv
    end

    F1_Item --> F3_Loc

    subgraph F3_WMS ["3. Location & Storage Tracking"]
      F3_Loc[Assign items to specific warehouse zones & bins]:::inv --> F3_Quant[Audit stock counts in each location]:::inv
      F3_Transfer{Is inter-warehouse transfer needed?}:::decision
      F3_Transfer -->|Yes| F3_Exec[Move items & log source/destination zones]:::inv
    end

    F3_Quant --> F4_Alert

    subgraph F4_WMS ["4. Reporting & Alerts"]
      F4_Alert[Evaluate Min/Max Quantity Thresholds]:::inv --> F4_Check{Is Stock <= Min Threshold?}:::decision
      F4_Check -->|Yes| F4_Notify[Generate Out-of-Stock Alert]:::inv
    end

    F4_Notify -->|Automate reorder trigger| Proc_PR([Procurement PR Entry]):::ext
    F2_Log -->|Sync web availability| Ecom_Inventory([E-Commerce Inventory Sync]):::ext
    F3_Exec -->|Log logistics tracking| SCM_Transfer([SCM Inter-Warehouse Transit]):::ext`,

  helpdesk: `flowchart TD
    classDef help fill:#6b46c1,stroke:#805ad5,stroke-width:2px,color:#fff;
    classDef ext fill:#718096,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef decision fill:#d69e2e,stroke:#ecc94b,stroke-width:2px,color:#1a202c;

    Ecom_History([E-Commerce Cust History]):::ext --> F3_Comm
    SCM_Track([SCM Shipment Transit]):::ext --> F1_Ticket

    subgraph F1_HELP ["1. Ticket Management"]
      F1_Ticket[Create Ticket - Customer or Manual]:::help --> F1_Assign[Assign to Support Agent]:::help
      F1_Assign --> F1_Status[Track Status: Open, In Progress, Resolved, Closed]:::help
    end

    subgraph F2_HELP ["2. Self-Service Portal"]
      F2_Portal[Search Database of Solutions & Articles]:::help --> F2_Rating{User Feedback}:::decision
      F2_Rating -->|Helpful| F2_Resolve[Reduce Ticket Volume / Self-Resolution]:::help
      F2_Rating -->|Not Helpful| F1_Ticket
    end

    subgraph F3_HELP ["3. Communication History"]
      F3_Comm[Maintain Interactions: Email, Chat, Phone]:::help --> F3_FollowUp[Send Follow-Up Responses]:::help
    end

    F1_Status --> F4_SLA

    subgraph F4_HELP ["4. SLA Tracking"]
      F4_SLA[Set SLA Rules for Response & Resolution]:::help --> F4_Monitor[Monitor SLA compliance]:::help
      F4_Monitor --> F4_Check{Is Ticket Overdue?}:::decision
      F4_Check -->|Yes| F4_Escalate[Escalate Overdue Tickets Automatically]:::help
      F4_Check -->|No| F4_Close[Resolve Ticket & Generate Report]:::help
    end

    F1_Ticket -->|Trace client purchase history| Ecom_Orders([E-Commerce Sales Orders]):::ext
    F4_Escalate -->|Notify Operations Manager| Core_User([Core User Notifications]):::ext`,

  scm: `flowchart TD
    classDef scm fill:#0891b2,stroke:#0e7490,stroke-width:2px,color:#fff;
    classDef ext fill:#718096,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef decision fill:#d69e2e,stroke:#ecc94b,stroke-width:2px,color:#1a202c;

    Ecom_Sales([E-Commerce Orders]):::ext --> F1_Forecast
    WMS_Levels([WMS Stock Quantities]):::ext --> F1_Forecast

    subgraph F1_SCM ["1. Demand Forecasting"]
      F1_Forecast[Analyze Past Sales & Usage]:::scm --> F1_Plan[Forecast Demand & Adjust Plans]:::scm
    end

    F1_Plan --> F2_Supplier

    subgraph F2_SCM ["2. Procurement & Supplier Coord"]
      F2_Supplier[Collaborate with Suppliers on Timelines]:::scm --> F2_Threshold{Is Stock below safety levels?}:::decision
      F2_Threshold -->|Yes| F2_Auto[Automate order placement with Procurement]:::scm
    end

    subgraph F3_SCM ["3. Logistics & Transportation"]
      F3_Logistics[Logistics Dispatch]:::scm --> F3_Route[Plan & Optimize Shipping Routes]:::scm
      F3_Route --> F3_Transit{Shipment Type?}:::decision
      F3_Transit -->|Inbound supplier deliveries| F3_Inbound[Track Inbound Shipments in Real Time]:::scm
      F3_Transit -->|Outbound customer orders| F3_Outbound[Track Outbound Shipments in Real Time]:::scm
    end

    subgraph F4_SCM ["4. Distribution & Warehouse Coord"]
      F4_Dist[Monitor Stock Levels across locations]:::scm --> F4_Allocate[Allocate Inventory to High-Demand Areas]:::scm
      F4_Allocate --> F4_Transfer[Manage Inter-Warehouse Transfers]:::scm
    end

    F2_Auto -->|Send Purchase Order request| Proc_PO([Procurement PO Generation]):::ext
    F3_Inbound -->|Update dock arrival| WMS_Dock([WMS Inbound Dock]):::ext
    F3_Outbound -->|Sync package status| Help_Ticket([Helpdesk Support Ticket]):::ext
    F4_Transfer -->|Execute physical stock movement| WMS_Move([WMS Location Transfer]):::ext`,

  ecommerce: `flowchart TD
    classDef ecom fill:#059669,stroke:#047857,stroke-width:2px,color:#fff;
    classDef ext fill:#718096,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef decision fill:#d69e2e,stroke:#ecc94b,stroke-width:2px,color:#1a202c;

    WMS_PIM([WMS Product Catalog]):::ext --> F3_PIM
    WMS_Stock([WMS Location Stock levels]):::ext --> F2_StockUpdate

    subgraph F3_ECOM ["3. Product Catalog (PIM)"]
      F3_PIM[Manage Product Catalog in ERP]:::ecom --> F3_Sync[Sync Products & Prices to Webstore]:::ecom
    end

    subgraph F1_ECOM ["1. Real-Time Order Sync"]
      Ecom_Checkout[Customer Places Order Online]:::ecom --> F1_Sync[Transfer Order Details to ERP]:::ecom
      F1_Sync --> F1_Assign[Assign Unique Order ID & Set Status]:::ecom
    end

    F1_Assign --> F2_StockUpdate

    subgraph F2_ECOM ["2. Inventory Updates"]
      F2_StockUpdate[Automatically update stock quantities]:::ecom --> F2_Verify{Is Stock available?}:::decision
      F2_Verify -->|No| F2_Hold[Set Order Status = On Hold]:::ecom
      F2_Verify -->|Yes| F2_Fulfill[Proceed to Fulfillment & Set Low Stock Alerts]:::ecom
    end

    F1_Assign --> F4_Data

    subgraph F4_ECOM ["4. Customer & Payment Sync"]
      F4_Data[Record Customer info from E-Commerce to ERP]:::ecom --> F4_Gateway[Integrate Payment Gateways Reconciliation]:::ecom
      F4_Gateway --> F4_History[Enable Customer history tracking]:::ecom
    end

    F2_Hold -->|Trigger supplier ordering| Proc_PR([Procurement PR Alert]):::ext
    F2_Fulfill -->|Log outbound logistics| SCM_Ship([SCM Outbound Shipping]):::ext
    F2_Fulfill -->|Deduct inventory counts| WMS_StockOut([WMS Stock-Out Logs]):::ext
    F4_History -->|Link order context to tickets| Help_Context([Helpdesk Customer History]):::ext`
};

// 2. FAQ Portal Database (Integrated into Documentation view)
const faqData = [
  {
    id: 1,
    category: "procurement",
    question: "How is a Purchase Requisition created and approved?",
    answer: "A Purchase Requisition (PR) is initiated by any department employee needing materials. Once created, the PR is automatically routed to their department manager. If approved, the status changes to 'Approved' and it triggers the generation of a Purchase Order (PO). If rejected, the status resets to 'Rejected' for revision.",
    tags: ["requisition", "approval", "procurement", "manager"]
  },
  {
    id: 2,
    category: "inventory",
    question: "What triggers an automated Stock Reorder notification?",
    answer: "Whenever WMS stock levels are updated (via sales fulfillment, supplier delivery, or transfer), the system automatically checks if the remaining quantity is less than or equal to the defined 'min_quantity_threshold' for that SKU. If yes, it fires an alert through the Business Intelligence (BI) module to notify the Procurement team to initialize a PR.",
    tags: ["reorder", "threshold", "minimum quantity", "safety stock", "WMS"]
  },
  {
    id: 3,
    category: "inventory",
    question: "How are stock transactions structured (Stock-In, Stock-Out, Transfer)?",
    answer: "Every physical change in stock is recorded in the Stock_Transactions table. Stock-In occurs during supplier delivery receipts; Stock-Out represents sales order fulfillment; and Transfer records shifts between warehouse zones. Transfers use double-entry logic, deducting quantities from the source node and adding them to the destination node simultaneously.",
    tags: ["stock transactions", "warehouse zones", "transfers", "stock-in", "stock-out"]
  },
  {
    id: 4,
    category: "ecommerce",
    question: "What happens if an E-Commerce order contains out-of-stock items?",
    answer: "When a webstore checkout syncs, the system queries WMS Inventory_Locations. If stock is unavailable, the order is flagged 'On Hold' and triggers a backorder replenishment request in the Procurement module.",
    tags: ["stockout", "backorder", "ecommerce", "hold"]
  },
  {
    id: 5,
    category: "helpdesk",
    question: "How do support tickets verify SLA compliance?",
    answer: "Upon ticket creation, the system assigns a priority (Low, Medium, High, Critical) based on incident severity. It then references the SLA Rules Matrix to stamp a target resolution timestamp. A background daemon monitors tickets; if a ticket is unresolved as it approaches this deadline, it triggers an auto-escalation warning to the Operations Manager.",
    tags: ["SLA", "helpdesk", "ticket", "priority", "escalation"]
  },
  {
    id: 6,
    category: "ecommerce",
    question: "How does the E-Commerce Integration sync data in real time?",
    answer: "The E-Commerce Integration module handles real-time webhooks. When a customer pays online, the web API transfers items, customer details, and payment tokens into the ERP's Sales_Orders table, while WMS automatically updates stock counts on the online shop to prevent overselling.",
    tags: ["ecommerce", "synchronization", "webhooks", "api", "orders"]
  },
  {
    id: 7,
    category: "helpdesk",
    question: "Liah, gets mo na?",
    answer: "<div style='text-align: center;'><img src='https://media.giphy.com/media/Vuw9m5wXviFIQ/giphy.gif' alt='Rickroll' style='max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-height: 250px;'></div>",
    tags: []
  },
  {
    id: 8,
    category: "helpdesk",
    question: "Emman, kaya pa ba?",
    answer: "<div style='text-align: center;'><img src='https://media.giphy.com/media/10UUe8ZsLnaqwo/giphy.gif' alt='Billy Herrington' style='max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-height: 250px;'></div>",
    tags: []
  }
];

// 3. RBAC Simulator Database (Fully Spelled Out Permission Names)
const rbacRoles = {
  superadmin: {
    title: "Super Admin",
    desc: "Global system administrator with unrestricted administrative clearance. Controls role definitions, integrations, database configurations, audit logs, and compliance overrides.",
    duties: [
      "Manage user accounts and role assignments globally.",
      "Reconfigure module integrations, database schemas, and webhooks.",
      "Access and export all reports and operational audit trails.",
      "Override system locks, blockages, or invalid transactions."
    ],
    perms: { core: "Full Access", proc: "Full Access", wms: "Full Access", scm: "Full Access", help: "Full Access", ecom: "Full Access", bi: "Full Access" }
  },
  employee: {
    title: "General Employee",
    desc: "Standard departmental user with basic transactional access for daily operational tasks and personal records management.",
    duties: [
      "Create and submit internal Purchase Requisitions.",
      "Log personal working hours, timesheets, and leave requests.",
      "Submit helpdesk support tickets for equipment or account issues."
    ],
    perms: { core: "Read-Only (Self)", proc: "Read & Write (Requisitions)", wms: "No Access", scm: "No Access", help: "Read & Write (Tickets)", ecom: "No Access", bi: "No Access" }
  },
  supportrep: {
    title: "Customer Support Rep",
    desc: "Resolves customer post-sale incidents, manages tickets, and documents solutions in the knowledge base.",
    duties: [
      "Acknowledge, log, and resolve incoming Customer Tickets.",
      "Verify ticket context details against order databases.",
      "Publish self-service troubleshooting articles and FAQ guides.",
      "Escalate unresolved issues violating SLA windows to managers."
    ],
    perms: { core: "No Access", proc: "No Access", wms: "No Access", scm: "No Access", help: "Read & Write", ecom: "No Access", bi: "Read-Only" }
  },
  wmsmgr: {
    title: "WMS Manager",
    desc: "Warehouse operations coordinator managing structural space configurations, inventory catalogs, and logistics.",
    duties: [
      "Manage product catalog profiles, categories, and safety stock settings.",
      "Define physical warehouse layout configurations, zones, and bins.",
      "Oversee large-scale inter-warehouse transfers and shipments.",
      "Review stock balance metrics and dispatch inventory reports."
    ],
    perms: { core: "No Access", proc: "Read-Only (Supplier POs)", wms: "Full Access", scm: "Read & Write", help: "No Access", ecom: "Read-Only", bi: "Read-Only" }
  },
  wmsoperator: {
    title: "Warehouse Operator",
    desc: "Executes stock movements, receipts, and order fulfillment processes on the warehouse floor.",
    duties: [
      "Unload suppliers inbound shipments and verify quantities against POs.",
      "Log 'Stock-In' transactions and allocate goods to specific bin locations.",
      "Fulfill outgoing sales order lists, logging 'Stock-Out' transactions.",
      "Execute physical stock transfers between storage zones."
    ],
    perms: { core: "No Access", proc: "No Access", wms: "Read & Write", scm: "Read & Write", help: "No Access", ecom: "No Access", bi: "No Access" }
  },
  procspecialist: {
    title: "Procurement Specialist",
    desc: "Manages vendor partnerships, purchase contracts, and replenishment operations.",
    duties: [
      "Evaluate purchase requisitions and convert them to Purchase Orders.",
      "Manage supplier contact lists, catalog pricing, and contracts.",
      "Review vendor delivery performance, ratings, and compliance metrics.",
      "Coordinate with SCM to expedite urgent supply shipments."
    ],
    perms: { core: "No Access", proc: "Read & Write", wms: "Read-Only", scm: "Read & Write", help: "No Access", ecom: "No Access", bi: "Read-Only" }
  },
  ecomadmin: {
    title: "E-Commerce Administrator",
    desc: "Oversees digital sales channels, webstore sync rates, and online checkout integrations.",
    duties: [
      "Verify webstore order synchronization scripts with the core ERP.",
      "Monitor stock balances on digital portals to prevent overselling.",
      "Manage online catalog product detail uploads and price points.",
      "Coordinate web customer profiles and payment gateways."
    ],
    perms: { core: "No Access", proc: "No Access", wms: "Read-Only", scm: "No Access", help: "No Access", ecom: "Read & Write", bi: "Read-Only" }
  }
};

// 4. Systems Integration SQL Playground queries
const sqlPlaygroundQueries = {
  reorder: `-- FETCH SKUS REQUIRING REORDER
SELECT 
  p.product_id, 
  p.sku, 
  p.name AS product_name, 
  il.quantity AS current_stock, 
  p.min_quantity_threshold AS safety_limit
FROM Products p
JOIN Inventory_Locations il ON p.product_id = il.product_id
WHERE il.quantity <= p.min_quantity_threshold;`,

  shipment: `-- TRACK OUTBOUND LOGISTICS & DELIVERY STATUS
SELECT 
  s.shipment_id, 
  so.order_id, 
  c.first_name, 
  c.last_name, 
  a.street, 
  a.city, 
  s.reference_type, 
  so.status AS delivery_status
FROM Shipments s
JOIN Sales_Orders so ON s.reference_id = so.order_id
JOIN Customers c ON so.customer_id = c.customer_id
JOIN Addresses a ON s.destination_address_id = a.address_id
WHERE s.reference_type = 'Outbound';`,

  tickets: `-- LIST UNRESOLVED CRITICAL & HIGH SUPPORT TICKETS
SELECT 
  t.ticket_id, 
  c.first_name, 
  c.last_name, 
  t.subject, 
  t.priority, 
  t.order_id,
  t.status
FROM Tickets t
JOIN Customers c ON t.customer_id = c.customer_id
WHERE t.priority IN ('Critical', 'High') 
  AND t.status != 'Resolved';`,

  supplier: `-- SHOW PREFERRED SUPPLIER CATALOG RATES
SELECT 
  p.sku, 
  p.name AS product_name, 
  s.supplier_name, 
  ps.supplier_sku, 
  ps.unit_price AS catalog_cost, 
  ps.lead_time_days
FROM Product_Suppliers ps
JOIN Products p ON ps.product_id = p.product_id
JOIN Suppliers s ON ps.supplier_id = s.supplier_id
WHERE ps.is_preferred = 1;`
};

// 5. Interactive Flowchart Walkthrough Steps
const walkthroughSteps = {
  procurement: [
    {
      title: "1. Requesting Supplies (PR)",
      desc: "An employee needs supplies (like catalog items) and submits a Requisition. Think of this as putting items in a corporate shopping cart that starts as 'Pending' and requires manager sign-off.",
      db: "INSERT INTO Purchase_Requisitions (req_number, employee_id, status)\nVALUES ('PR-2026-001', 12, 'Pending');"
    },
    {
      title: "2. Manager Sign-Off (Approval)",
      desc: "The department manager receives an alert. They check active budgets and approve the request. This officially authorizes the purchase, changing the status to 'Approved'.",
      db: "UPDATE Purchase_Requisitions \nSET status = 'Approved', approved_by = 4 \nWHERE req_id = 45;"
    },
    {
      title: "3. Dispatched Purchase Order (PO)",
      desc: "A purchasing specialist takes the approved request, selects the preferred supplier (pulling defaults from Product_Suppliers), and dispatches a formal PO. This is a legally binding contract sent to the supplier.",
      db: "INSERT INTO Purchase_Orders (po_number, supplier_id, status)\nVALUES ('PO-2026-987', 5, 'Sent');\n\nINSERT INTO PO_Items (po_id, product_id, quantity)\nVALUES (112, 18, 50.00);"
    },
    {
      title: "4. Dock Receiving & Stock-In",
      desc: "Supplier delivers the boxes to the loading dock. Warehouse operators verify SKU counts, record an inbound Shipment, and update physical stock levels in the WMS, logging a 'Stock-In' audit trail.",
      db: "INSERT INTO Shipments (reference_type, reference_id, status)\nVALUES ('Inbound', 112, 'Received');\n\nUPDATE Inventory_Locations \nSET quantity = quantity + 50.00 \nWHERE warehouse_id = 2 AND product_id = 18;\n\nINSERT INTO Stock_Transactions (product_id, transaction_type, quantity)\nVALUES (18, 'Stock-in', 50.00);"
    }
  ],
  inventory: [
    {
      title: "1. Scanning the SKU barcode",
      desc: "A warehouse clerk scans a product barcode. The WMS queries the Products catalog to verify the item is registered and grabs its safety stock settings.",
      db: "SELECT product_id, sku, min_quantity_threshold \nFROM Products \nWHERE sku = 'SKU-MINT-88';"
    },
    {
      title: "2. Locating the Storage Zone",
      desc: "The system matches the product's storage requirements with active warehouse layouts to identify the correct zone coordinates (e.g. Cold storage, Bulk racks).",
      db: "SELECT zone_id, zone_name \nFROM Warehouse_Zones \nWHERE warehouse_id = 1 AND category = 'Standard';"
    },
    {
      title: "3. Updating Stock & Logging History",
      desc: "The clerk places the items in the bin. The database increments the inventory level for that specific zone and writes a 'Stock-in' log to record who did it and when.",
      db: "UPDATE Inventory_Locations \nSET quantity = quantity + 15.00 \nWHERE inventory_id = 82;\n\nINSERT INTO Stock_Transactions (product_id, transaction_type, quantity)\nVALUES (12, 'Stock-in', 15.00);"
    },
    {
      title: "4. Safety Threshold Evaluation",
      desc: "The system automatically reviews the remaining quantity. If it drops below the safety threshold, it fires an alert notifying procurement to reorder, preventing out-of-stock issues.",
      db: "SELECT quantity, min_quantity_threshold \nFROM Inventory_Locations \nJOIN Products USING (product_id) \nWHERE product_id = 12;\n\n-- [Alert Triggered: Current Stock 4.00 <= Threshold 5.00]"
    }
  ],
  helpdesk: [
    {
      title: "1. Submitting a Support Ticket",
      desc: "A customer reports a post-sale shipment issue (like a damaged parcel), creating a new Ticket. The system automatically links their profile and original Order ID for full context.",
      db: "INSERT INTO Tickets (customer_id, order_id, subject, priority, status)\nVALUES (8, 204, 'Damaged product received', 'High', 'Pending');"
    },
    {
      title: "2. Stamping the SLA Deadline",
      desc: "The system checks the ticket priority (e.g. High) and stamps the target resolution deadline (6 hours in future) into the database to track compliance.",
      db: "UPDATE Tickets \nSET sla_deadline = DATE_ADD(NOW(), INTERVAL 6 HOUR), \n    status = 'In Progress', \n    assigned_to = 2 \nWHERE ticket_id = 412;"
    },
    {
      title: "3. Systems Integration Trace",
      desc: "The support representative checks the delivery shipment record and WMS transaction logs to see what happened on the loading dock.",
      db: "SELECT * \nFROM Sales_Orders \nJOIN Shipments ON Sales_Orders.order_id = Shipments.reference_id \nWHERE order_id = 204;"
    },
    {
      title: "4. Resolving the Incident",
      desc: "The representative dispatches a replacement product, updates the Ticket status to 'Resolved', and closes the SLA countdown timer.",
      db: "UPDATE Tickets \nSET status = 'Resolved', closed_at = NOW() \nWHERE ticket_id = 412;"
    }
  ],
  scm: [
    {
      title: "1. Logistics Routing Trigger",
      desc: "The system determines whether a shipment is Inbound (receiving items from a supplier) or Outbound (sending ordered items to a customer).",
      db: "SELECT po_id FROM Purchase_Orders WHERE status = 'Approved';\n-- OR\nSELECT order_id FROM Sales_Orders WHERE status = 'Processing';"
    },
    {
      title: "2. Instantiate Shipment Record",
      desc: "The logistics planner creates a Shipment record to track carrier names, shipping methods, and estimated delivery dates.",
      db: "INSERT INTO Shipments (reference_type, reference_id, status, destination_address_id)\nVALUES ('Outbound', 84, 'Pending', 104);"
    },
    {
      title: "3. Assign Tracking Code & Carrier",
      desc: "The shipping carrier (e.g. Lalamove, J&T) picks up the parcel, generating a tracking number stamped into the database, setting status to 'In Transit'.",
      db: "UPDATE Shipments \nSET carrier_name = 'J&T Express', \n    tracking_number = 'TRACK-SCM-4512', \n    status = 'In Transit' \nWHERE shipment_id = 112;"
    },
    {
      title: "4. Confirm Delivery Receipt",
      desc: "The customer receives the package. The carrier reports a success webhook, setting the shipment to 'Delivered' and closing the sales order lifecycle.",
      db: "UPDATE Shipments \nSET status = 'Delivered', \n    delivered_at = NOW() \nWHERE shipment_id = 112;\n\nUPDATE Sales_Orders \nSET status = 'Completed' \nWHERE order_id = 84;"
    }
  ],
  ecommerce: [
    {
      title: "1. Real-Time Order Sync",
      desc: "A customer checks out online. Storefront webhooks trigger our ERP API, importing customer metadata and creating an active Sales Order row.",
      db: "INSERT INTO Sales_Orders (customer_id, status)\nVALUES (8, 'Pending');\n\nINSERT INTO Sales_Order_Items (order_id, product_id, quantity, unit_price)\nVALUES (84, 12, 2.00, 450.00);"
    },
    {
      title: "2. Inventory & Stock Check",
      desc: "The database queries WMS locations to confirm inventory availability. If stock is low, the order is marked 'On Hold' and triggers a Procurement reorder alert.",
      db: "SELECT quantity FROM Inventory_Locations \nWHERE product_id = 12 AND warehouse_id = 1;\n\n-- [Stock Check: 8.00 >= Ordered: 2.00]"
    },
    {
      title: "3. Update Storefront Stock (PIM)",
      desc: "The system deducts the reserved items from physical inventory and dispatches updated stock counts back to the E-Commerce store to prevent overselling.",
      db: "UPDATE Inventory_Locations \nSET quantity = quantity - 2.00 \nWHERE product_id = 12 AND warehouse_id = 1;\n\nINSERT INTO Stock_Transactions (product_id, transaction_type, quantity)\nVALUES (12, 'Stock-out', 2.00);"
    },
    {
      title: "4. Customer Profile & Payment Sync",
      desc: "Payment gateways authorize credit card logs. The ERP matches payment invoices, creates an outbound logistics transit track in SCM, and links customer profiles.",
      db: "INSERT INTO Shipments (reference_type, reference_id, status)\nVALUES ('Outbound', 84, 'Pending');\n\nINSERT INTO Invoices (order_id, amount, status)\nVALUES (84, 900.00, 'Paid');"
    }
  ]
};

// 6. Flowchart Pan & Zoom Controls Module
let scale = 1.2;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

// SQL Syntax Highlighter Helper
function highlightSQL(raw) {
  if (!raw) return '';
  return raw
    .replace(/(-- .*)/g, '<span class="sql-comment">$1</span>')
    .replace(/\b(SELECT|FROM|JOIN|ON|WHERE|AND|OR|IN|JOIN|USING|INSERT|UPDATE|SET|VALUES)\b/g, '<span class="sql-keyword">$1</span>')
    .replace(/('[^']*')/g, '<span class="sql-string">$1</span>');
}

function initPanZoomEngine() {
  const wrapper = document.getElementById('diagram-canvas-wrapper');
  const container = document.getElementById('mermaid-container');
  
  if (!wrapper || !container) return;

  const applyTransform = () => {
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  };

  // Mouse Dragging
  wrapper.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
    wrapper.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    }
  });

  wrapper.addEventListener('mouseleave', () => {
    if (isDragging) {
      isDragging = false;
      wrapper.style.cursor = 'grab';
    }
  });

  // Mouse Wheel Zooming
  wrapper.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.08;
    const factor = e.deltaY < 0 ? (1 + zoomIntensity) : (1 - zoomIntensity);
    
    scale = Math.min(Math.max(scale * factor, 0.25), 4.0);
    applyTransform();
  }, { passive: false });

  // Control Buttons
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    scale = Math.min(scale * 1.15, 4.0);
    applyTransform();
  });

  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    scale = Math.max(scale / 1.15, 0.25);
    applyTransform();
  });

  document.getElementById('btn-zoom-reset').addEventListener('click', () => {
    scale = 1.0;
    panX = 0;
    panY = 0;
    applyTransform();
  });
}

function resetPanZoomState() {
  scale = 1.2;
  panX = 0;
  panY = 0;
  const container = document.getElementById('mermaid-container');
  if (container) {
    container.style.transform = `translate(0px, 0px) scale(1.2)`;
  }
}

// 7. Guided Process Walkthrough Controller
let currentWalkStep = 0;
let currentWalkKey = null;

function initWalkthroughEngine() {
  const prevBtn = document.getElementById('btn-walk-prev');
  const nextBtn = document.getElementById('btn-walk-next');
  
  if (!prevBtn || !nextBtn) return;

  const updateWalkDisplay = () => {
    const titleEl = document.getElementById('walkthrough-step-title');
    const descEl = document.getElementById('walkthrough-step-desc');
    const indicatorEl = document.getElementById('walkthrough-step-indicator');
    const logsEl = document.getElementById('walkthrough-db-logs-panel');

    if (!currentWalkKey || !walkthroughSteps[currentWalkKey]) {
      titleEl.textContent = "Select Flow";
      descEl.textContent = "Select a specific flowchart to begin the step-by-step guided systems walk.";
      indicatorEl.textContent = "Step 0/0";
      logsEl.innerHTML = `[SYSTEM IDLE] Select sub-process to audit SQL transactions.`;
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    const steps = walkthroughSteps[currentWalkKey];
    const total = steps.length;
    indicatorEl.textContent = `Step ${currentWalkStep + 1}/${total}`;

    const step = steps[currentWalkStep];
    titleEl.innerHTML = `<span class="step-badge">Step ${currentWalkStep + 1}</span> ${step.title}`;
    descEl.textContent = step.desc;

    // Output formatted syntax
    logsEl.innerHTML = `<span class="sql-keyword">-- SQL TRANSACTION LOG:</span>\n${highlightSQL(step.db)}`;

    prevBtn.disabled = currentWalkStep === 0;
    nextBtn.disabled = currentWalkStep === total - 1;
  };

  prevBtn.addEventListener('click', () => {
    if (currentWalkStep > 0) {
      currentWalkStep--;
      updateWalkDisplay();
    }
  });

  nextBtn.addEventListener('click', () => {
    if (currentWalkKey && currentWalkStep < walkthroughSteps[currentWalkKey].length - 1) {
      currentWalkStep++;
      updateWalkDisplay();
    }
  });

  // Export helper globally so flowchart tab switches can bind keys
  window.triggerWalkthroughStart = (key) => {
    if (walkthroughSteps[key]) {
      currentWalkKey = key;
      currentWalkStep = 0;
    } else {
      currentWalkKey = null;
      currentWalkStep = 0;
    }
    updateWalkDisplay();
  };
}

// 8. SQL Playground Controller
function initSQLPlayground() {
  const select = document.getElementById('sql-playground-select');
  const codeBox = document.getElementById('sql-playground-code');
  const copyBtn = document.getElementById('btn-sql-copy');

  if (!select || !codeBox || !copyBtn) return;

  const renderSQL = (val) => {
    const raw = sqlPlaygroundQueries[val] || '';
    codeBox.innerHTML = highlightSQL(raw);
  };

  select.addEventListener('change', (e) => {
    renderSQL(e.target.value);
  });

  copyBtn.addEventListener('click', () => {
    const rawCode = sqlPlaygroundQueries[select.value] || '';
    navigator.clipboard.writeText(rawCode).then(() => {
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 1500);
    });
  });

  // Initial load
  renderSQL(select.value);
}

// 9. Live SLA Ticketing Engine Sandbox
let mockTickets = [
  {
    id: 101,
    customer: "Jane Doe (ID: 1)",
    subject: "Package damaged in transit",
    priority: "critical",
    status: "In Progress",
    deadline: Date.now() + 2 * 60 * 60 * 1000 // 2 hours in future
  },
  {
    id: 102,
    customer: "CvSU Library Desk (ID: 3)",
    subject: "Missing parts inside parcel",
    priority: "high",
    status: "In Progress",
    deadline: Date.now() + 6 * 60 * 60 * 1000 // 6 hours in future
  }
];

function initTicketingSandbox() {
  const listContainer = document.getElementById('live-tickets-list');
  const submitBtn = document.getElementById('btn-submit-ticket');
  const customerSelect = document.getElementById('ticket-customer-select');
  const prioritySelect = document.getElementById('ticket-priority-select');
  const subjectInput = document.getElementById('ticket-subject-input');

  if (!listContainer || !submitBtn) return;

  const renderTickets = () => {
    if (mockTickets.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; font-size: 12px; color: var(--text-muted); padding: 12px;">No active support tickets. Submit one to test the live SLA timer.</div>`;
      return;
    }

    listContainer.innerHTML = mockTickets.map(t => {
      const isResolved = t.status === "Resolved";
      let timerHTML = '';
      
      if (isResolved) {
        timerHTML = `<div class="ticket-timer-box timer-resolved"><i class="fa-solid fa-circle-check"></i> RESOLVED</div>`;
      } else {
        const remaining = t.deadline - Date.now();
        if (remaining <= 0) {
          timerHTML = `<div class="ticket-timer-box" style="background: rgba(231,76,60,0.25); color: #ff8b80;"><i class="fa-solid fa-circle-exclamation"></i> SLA BREACHED</div>`;
        } else {
          // Format remaining time
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const secs = Math.floor((remaining % (1000 * 60)) / 1000);
          
          const pad = (num) => String(num).padStart(2, '0');
          timerHTML = `<div class="ticket-timer-box"><i class="fa-solid fa-clock"></i> ${pad(hours)}:${pad(mins)}:${pad(secs)}</div>`;
        }
      }

      return `
        <div class="ticket-card border-${t.priority}">
          <div class="ticket-card-header">
            <span class="ticket-card-title">${t.subject}</span>
            <span class="faq-badge badge-helpdesk">${t.priority.toUpperCase()}</span>
          </div>
          <div class="ticket-meta-row">
            <span>Customer: ${t.customer}</span>
            <span>Ticket ID: #${t.id}</span>
            ${isResolved ? '' : `<button class="ticket-resolve-btn" onclick="resolveMockTicket(${t.id})"><i class="fa-solid fa-check"></i> Resolve</button>`}
            ${timerHTML}
          </div>
        </div>
      `;
    }).join('');
  };

  // Make resolve function available globally
  window.resolveMockTicket = (id) => {
    const ticket = mockTickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = "Resolved";
      renderTickets();
    }
  };

  submitBtn.addEventListener('click', () => {
    const subject = subjectInput.value.trim();
    if (!subject) return;

    const customerText = customerSelect.options[customerSelect.selectedIndex].text;
    const priority = prioritySelect.value;
    
    // Map SLA levels
    let duration = 48 * 60 * 60 * 1000; // Low: 48h
    if (priority === 'critical') duration = 2 * 60 * 60 * 1000; // 2h
    if (priority === 'high') duration = 6 * 60 * 60 * 1000; // 6h
    if (priority === 'medium') duration = 24 * 60 * 60 * 1000; // 24h

    const newTicket = {
      id: Math.floor(100 + Math.random() * 900),
      customer: customerText,
      subject: subject,
      priority: priority,
      status: "In Progress",
      deadline: Date.now() + duration
    };

    mockTickets.unshift(newTicket);
    subjectInput.value = '';
    renderTickets();
  });

  // Run countdown ticker loop
  setInterval(renderTickets, 1000);
  renderTickets();
}

// 10. E-Commerce Webhook Sync Log Simulator Console
function initECommerceSimulator() {
  const triggerBtn = document.getElementById('btn-simulate-checkout');
  const consoleEl = document.getElementById('ecommerce-terminal');

  if (!triggerBtn || !consoleEl) return;

  const logLines = [
    { text: "[15:40:02] Storefront System: Customer Jane Doe has completed checkout for 2 units of SKU-MINT-88.", delay: 100 },
    { text: "✓ Storefront API: Webhook received. Processing order details...", delay: 600 },
    { text: "[15:40:03] WMS System: Checking inventory availability in primary warehouse location...", delay: 1500 },
    { text: "✓ WMS Database: Stock verified. (Quantity: 8 available >= 2 requested).", delay: 2200 },
    { text: "[15:40:04] Payment System: Reconciling customer invoice via payment gateway...", delay: 3200 },
    { text: "✓ Billing API: Payment of 900.00 PHP confirmed. Invoice status marked as PAID.", delay: 3800 },
    { text: "[15:40:05] WMS System: Reserving SKU-MINT-88 and reducing stock level by 2. New stock: 6.", delay: 4800 },
    { text: "[15:40:06] Supply Chain System: Handing package over to J&T Express carrier and creating tracking tag...", delay: 5800 },
    { text: "✓ SCM Logistics: Outbound delivery tracking ID generated: JNT-SCM-88204.", delay: 6500 },
    { text: "[15:40:07] Storefront API: Callback sync complete. Multi-channel stock synchronized. Sync complete!", delay: 7000 }
  ];

  triggerBtn.addEventListener('click', () => {
    triggerBtn.disabled = true;
    consoleEl.innerHTML = '';
    
    const step1 = document.getElementById('sync-step-1');
    const step2 = document.getElementById('sync-step-2');
    const step3 = document.getElementById('sync-step-3');
    const step4 = document.getElementById('sync-step-4');
    const lines = document.querySelectorAll('.sync-step-line');
    
    // Reset steps
    [step1, step2, step3, step4].forEach(s => {
      if (s) {
        s.classList.remove('active');
        s.classList.remove('completed');
      }
    });
    lines.forEach(l => l.classList.remove('completed'));

    // Step 1 Active
    if (step1) step1.classList.add('active');

    // Timer triggers for visual step advances
    setTimeout(() => {
      if (step1) {
        step1.classList.remove('active');
        step1.classList.add('completed');
      }
      if (lines[0]) lines[0].classList.add('completed');
      if (step2) step2.classList.add('active');
    }, 1400);

    setTimeout(() => {
      if (step2) {
        step2.classList.remove('active');
        step2.classList.add('completed');
      }
      if (lines[1]) lines[1].classList.add('completed');
      if (step3) step3.classList.add('active');
    }, 3000);

    setTimeout(() => {
      if (step3) {
        step3.classList.remove('active');
        step3.classList.add('completed');
      }
      if (lines[2]) lines[2].classList.add('completed');
      if (step4) step4.classList.add('active');
    }, 5500);

    setTimeout(() => {
      if (step4) {
        step4.classList.remove('active');
        step4.classList.add('completed');
      }
    }, 7000);

    // Print logs
    logLines.forEach(line => {
      setTimeout(() => {
        const div = document.createElement('div');
        div.className = 'terminal-line';
        
        if (line.text.startsWith('✓')) {
          div.style.color = '#2ecc71'; // Success Green
          div.style.fontWeight = '600';
        } else {
          div.style.color = '#a3ccb4'; // Soft Muted Sage
        }
        
        div.textContent = line.text;
        consoleEl.appendChild(div);
        consoleEl.scrollTop = consoleEl.scrollHeight;

        if (line.delay === 7000) {
          triggerBtn.disabled = false;
        }
      }, line.delay);
    });
  });
}

// 11. RBAC Simulator & Auditor Engine
function initRBACSimulator() {
  const roleSelect = document.getElementById('rbac-role-select');
  const cardTitle = document.getElementById('rbac-card-title');
  const cardDesc = document.getElementById('rbac-card-desc');
  const dutiesList = document.getElementById('rbac-duties-list');
  const gridContainer = document.getElementById('rbac-permissions-grid');

  // Auditor Elements
  const auditRoleSelect = document.getElementById('rbac-auditor-role-select');
  const auditActionSelect = document.getElementById('rbac-auditor-action-select');
  const auditBtn = document.getElementById('btn-run-rbac-audit');
  const auditBadge = document.getElementById('rbac-audit-result-badge');
  const auditTerminal = document.getElementById('rbac-terminal');

  if (!roleSelect) return;

  const modulesMap = {
    core: "Core Master Data",
    proc: "Procurement & Purchase",
    wms: "Inventory & WMS",
    scm: "Supply Chain / Logistics",
    help: "Helpdesk / Support",
    ecom: "E-Commerce Integrations",
    bi: "Business Intelligence"
  };

  const updateRoleDisplay = (roleKey) => {
    const role = rbacRoles[roleKey];
    if (!role) return;

    if (cardTitle) cardTitle.textContent = role.title;
    if (cardDesc) cardDesc.textContent = role.desc;
    
    // Render duties
    if (dutiesList) {
      dutiesList.innerHTML = role.duties.map(d => `
        <li>
          <i class="fa-solid fa-circle-check"></i>
          <span>${d}</span>
        </li>
      `).join('');
    }

    // Render permission badges grid with full spelled out titles
    if (gridContainer) {
      gridContainer.innerHTML = Object.keys(role.perms).map(moduleKey => {
        const permValue = role.perms[moduleKey];
        let badgeClass = 'badge-none';
        
        if (permValue.startsWith('Full Access')) {
          badgeClass = 'badge-full';
        } else if (permValue.startsWith('Read & Write')) {
          badgeClass = 'badge-rw';
        } else if (permValue.startsWith('Read-Only')) {
          badgeClass = 'badge-r';
        }

        return `
          <div class="permission-grid-item">
            <span class="module-name">${modulesMap[moduleKey]}</span>
            <span class="perm-badge ${badgeClass}">${permValue}</span>
          </div>
        `;
      }).join('');
    }
  };

  roleSelect.addEventListener('change', (e) => {
    updateRoleDisplay(e.target.value);
  });

  // RBAC Dynamic Auditor Logic
  if (auditBtn && auditTerminal) {
    // Exact mapping of role authorizations
    const auditMap = {
      superadmin: {
        CREATE_REQUISITION: true, APPROVE_PO: true, LOG_STOCK_IN: true, UPDATE_WMS_ZONES: true, SYNC_ECOM_CATALOG: true, RESOLVE_SLA_TICKET: true, VIEW_SYSTEM_AUDIT_LOGS: true
      },
      employee: {
        CREATE_REQUISITION: true, APPROVE_PO: false, LOG_STOCK_IN: false, UPDATE_WMS_ZONES: false, SYNC_ECOM_CATALOG: false, RESOLVE_SLA_TICKET: true, VIEW_SYSTEM_AUDIT_LOGS: false
      },
      supportrep: {
        CREATE_REQUISITION: false, APPROVE_PO: false, LOG_STOCK_IN: false, UPDATE_WMS_ZONES: false, SYNC_ECOM_CATALOG: false, RESOLVE_SLA_TICKET: true, VIEW_SYSTEM_AUDIT_LOGS: false
      },
      wmsmgr: {
        CREATE_REQUISITION: false, APPROVE_PO: false, LOG_STOCK_IN: true, UPDATE_WMS_ZONES: true, SYNC_ECOM_CATALOG: true, RESOLVE_SLA_TICKET: false, VIEW_SYSTEM_AUDIT_LOGS: false
      },
      wmsoperator: {
        CREATE_REQUISITION: false, APPROVE_PO: false, LOG_STOCK_IN: true, UPDATE_WMS_ZONES: false, SYNC_ECOM_CATALOG: false, RESOLVE_SLA_TICKET: false, VIEW_SYSTEM_AUDIT_LOGS: false
      },
      procspecialist: {
        CREATE_REQUISITION: true, APPROVE_PO: true, LOG_STOCK_IN: true, UPDATE_WMS_ZONES: false, SYNC_ECOM_CATALOG: false, RESOLVE_SLA_TICKET: false, VIEW_SYSTEM_AUDIT_LOGS: false
      },
      ecomadmin: {
        CREATE_REQUISITION: false, APPROVE_PO: false, LOG_STOCK_IN: true, UPDATE_WMS_ZONES: false, SYNC_ECOM_CATALOG: true, RESOLVE_SLA_TICKET: false, VIEW_SYSTEM_AUDIT_LOGS: false
      }
    };

    auditBtn.addEventListener('click', () => {
      const role = auditRoleSelect.value;
      const action = auditActionSelect.value;
      const roleText = auditRoleSelect.options[auditRoleSelect.selectedIndex].text;
      const actionText = auditActionSelect.options[auditActionSelect.selectedIndex].text;

      const isGranted = !!(auditMap[role] && auditMap[role][action]);
      const now = new Date().toLocaleTimeString();

      // Render Badge
      auditBadge.style.display = 'flex';
      if (isGranted) {
        auditBadge.className = 'rbac-result-badge granted';
        auditBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i> Granted`;
      } else {
        auditBadge.className = 'rbac-result-badge denied';
        auditBadge.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> Denied`;
      }

      // Add Terminal Log Line
      const logLine = document.createElement('div');
      logLine.style.marginBottom = '6px';
      
      if (isGranted) {
        logLine.innerHTML = `<span style="color:#8e9a8f;">[${now}]</span> <span style="color:#2ecc71;">[GRANTED]</span> ${roleText} requested "${actionText}" -> Valid junction mapping confirmed. Log trace written.`;
      } else {
        logLine.innerHTML = `<span style="color:#8e9a8f;">[${now}]</span> <span style="color:#e74c3c;">[DENIED]</span> ${roleText} requested "${actionText}" -> Access denied. Missing permission_id maps in Role_Permissions table.`;
      }

      auditTerminal.appendChild(logLine);
      auditTerminal.scrollTop = auditTerminal.scrollHeight;
    });
  }

  // Load first role by default
  updateRoleDisplay(roleSelect.value);
}

// Dashboard Module Navigation Redirects
window.switchToFlowchart = (key) => {
  const flowNav = document.querySelector('.nav-item[data-view="flowcharts"]');
  if (flowNav) flowNav.click();

  const subTab = document.querySelector(`.flow-tab[data-diagram="${key}"]`);
  if (subTab) subTab.click();
};

// 12. Tab Routing & Views Management (Walkthrough trigger support)
function initTabs() {
  const navItems = document.querySelectorAll('.nav-item');
  const viewSections = document.querySelectorAll('.view-section');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      
      // Update sidebar active class
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // Update content section active class
      viewSections.forEach(section => {
        section.classList.remove('active');
        if (section.id === `${targetView}-view`) {
          section.classList.add('active');
        }
      });

      // Specific view controllers
      if (targetView === 'flowcharts') {
        resetPanZoomState();
        const activeFlowTab = document.querySelector('.flow-tab.active');
        const diagramName = activeFlowTab ? activeFlowTab.getAttribute('data-diagram') : 'orchestration';
        renderMermaidDiagram(diagramName);
      }
    });
  });
}

function initFlowchartTabs() {
  const tabs = document.querySelectorAll('.flow-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const diagramKey = tab.getAttribute('data-diagram');
      resetPanZoomState();
      renderMermaidDiagram(diagramKey);
    });
  });
}

// 13. Mermaid Diagram Handler (Safe layout check & Walkthrough bind)
let renderingDiagram = false;
async function renderMermaidDiagram(key) {
  if (renderingDiagram) return;
  renderingDiagram = true;
  
  const container = document.getElementById('mermaid-container');
  const code = flowcharts[key];
  
  container.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin text-success"></i> Rendering Vector Graphics...</div>`;
  
  setTimeout(async () => {
    try {
      if (typeof window.mermaid === 'undefined') {
        container.innerHTML = `<div class="error-box" style="color: var(--color-danger); padding: 20px;"><i class="fa-solid fa-triangle-exclamation"></i> Mermaid library failed to load from CDN. Check your internet connection.</div>`;
        renderingDiagram = false;
        return;
      }
      
      container.removeAttribute('data-processed');
      const id = `mermaid-render-${Date.now()}`;
      const rawHTML = `<div class="mermaid" id="${id}">${code}</div>`;
      container.innerHTML = rawHTML;
      
      await window.mermaid.run({
        nodes: [document.getElementById(id)]
      });

      // Start the walkthrough steps guide for this diagram if configured
      if (window.triggerWalkthroughStart) {
        window.triggerWalkthroughStart(key);
      }
    } catch (err) {
      console.error("Mermaid Render Error:", err);
      container.innerHTML = `<div class="error-box" style="color: var(--color-danger); padding: 20px;"><i class="fa-solid fa-triangle-exclamation"></i> Rendering failed. Mermaid syntax is compiling on GitHub natively.</div>`;
    } finally {
      renderingDiagram = false;
    }
  }, 50);
}

// 14. FAQ Renderer (Integrated)
function renderFAQs(faqs) {
  const container = document.getElementById('faq-accordion-container');
  if (!container) return;

  if (faqs.length === 0) {
    container.innerHTML = `
      <div class="empty-results">
        <i class="fa-regular fa-folder-open"></i>
        <p>No FAQs match your search keywords.</p>
        <span>Try searching terms like \"reorder\", \"hold\", or \"SLA\".</span>
      </div>
    `;
    return;
  }

  container.innerHTML = faqs.map(faq => `
    <div class="faq-card" data-category="${faq.category}">
      <div class="faq-header">
        <span class="faq-badge badge-${faq.category}">${faq.category.toUpperCase()}</span>
        <h3 class="faq-question">${faq.question}</h3>
        <i class="fa-solid fa-chevron-down faq-arrow"></i>
      </div>
      <div class="faq-body">
        <div class="faq-body-content">
          <p>${faq.answer}</p>
          ${faq.tags && faq.tags.length > 0 ? `
          <div class="faq-tags">
            ${faq.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  `).join('');

  // Accordion Expand/Collapse Event
  const cards = container.querySelectorAll('.faq-card');
  cards.forEach(card => {
    const header = card.querySelector('.faq-header');
    header.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      
      // Close all others
      cards.forEach(c => {
        c.classList.remove('open');
        c.querySelector('.faq-body').style.maxHeight = null;
      });

      if (!isOpen) {
        card.classList.add('open');
        const body = card.querySelector('.faq-body');
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
}

// 15. Documentation Center & Unified Search
function initDocsAndSearchEngine() {
  const tabs = document.querySelectorAll('.doc-tab');
  const panels = document.querySelectorAll('.doc-panel');
  const searchInput = document.getElementById('docs-search-input');
  const clearBtn = document.getElementById('docs-clear-btn');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let currentDocTab = 'concepts';
  let searchQuery = '';
  let currentFAQCategory = 'all';

  // Handler to switch subtabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentDocTab = tab.getAttribute('data-doc');
      
      panels.forEach(panel => {
        panel.classList.remove('active');
        if (panel.id === `doc-${currentDocTab}`) {
          panel.classList.add('active');
        }
      });

      // Rerun search logic for the active tab context
      executeSearch();
    });
  });

  // Unified Search execution
  const executeSearch = () => {
    const query = searchQuery.toLowerCase().trim();

    if (currentDocTab === 'faq') {
      // FAQ Search & Filter
      let filtered = faqData;

      // Category Pill filter
      if (currentFAQCategory !== 'all') {
        filtered = filtered.filter(f => f.category === currentFAQCategory);
      }

      // Keyword search
      if (query !== '') {
        filtered = filtered.filter(f => 
          f.question.toLowerCase().includes(query) || 
          f.answer.toLowerCase().includes(query) ||
          f.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      renderFAQs(filtered);
    } else {
      // Normal Document Panels text filtering
      const activePanel = document.getElementById(`doc-${currentDocTab}`);
      if (!activePanel) return;
      const sections = activePanel.querySelectorAll('.filterable-section');

      sections.forEach(sec => {
        if (query === '') {
          sec.classList.remove('hidden-section');
        } else {
          const keywords = sec.getAttribute('data-keywords') || '';
          const textContent = sec.textContent || '';
          
          const match = keywords.toLowerCase().includes(query) || textContent.toLowerCase().includes(query);
          
          if (match) {
            sec.classList.remove('hidden-section');
          } else {
            sec.classList.add('hidden-section');
          }
        }
      });
    }
  };

  // Search Input Bindings
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearBtn) clearBtn.style.display = searchQuery ? 'block' : 'none';
      executeSearch();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      clearBtn.style.display = 'none';
      executeSearch();
    });
  }

  // FAQ Category Filter Pills Bindings
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFAQCategory = btn.getAttribute('data-category');
      executeSearch();
    });
  });

  // Initial Load of FAQs
  renderFAQs(faqData);
}

// 16. Initialization orchestrator (Handles race conditions with ESM script loading)
let mermaidInitialized = false;

function initApp() {
  if (mermaidInitialized) return;
  
  if (typeof window.mermaid === 'undefined') {
    window.addEventListener('mermaid-loaded', () => {
      mermaidInitialized = true;
      runInitialization();
    });
  } else {
    mermaidInitialized = true;
    runInitialization();
  }
}

function runInitialization() {
  initTabs();
  initFlowchartTabs();
  initPanZoomEngine();
  initWalkthroughEngine();
  initSQLPlayground();
  initTicketingSandbox();
  initECommerceSimulator();
  initDocsAndSearchEngine();
  initRBACSimulator();
  
  const activeSection = document.querySelector('.view-section.active');
  if (activeSection && activeSection.id === 'flowcharts-view') {
    const activeFlowTab = document.querySelector('.flow-tab.active');
    const diagramName = activeFlowTab ? activeFlowTab.getAttribute('data-diagram') : 'orchestration';
    renderMermaidDiagram(diagramName);
  }
}

// Bind load hooks
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
