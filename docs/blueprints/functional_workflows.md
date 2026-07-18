# 🔄 Deep-Dive Functional Sub-Process Flowcharts

This document details the step-by-step logic gates, status transitions, and data writes occurring within each core operational module of the AmbatuGrow ERP system.

---

## 📥 A. Procurement & Purchase Order Lifecycle Process

This process governs the acquisition of vendor inventory, detailing everything from the creation of internal requisitions to physical stock receipt.

```mermaid
flowchart TD
    %% Styling
    classDef proc fill:#2b6cb0,stroke:#3182ce,stroke-width:2px,color:#fff;
    classDef decision fill:#d69e2e,stroke:#ecc94b,stroke-width:2px,color:#1a202c;

    Step1([Start: Dept Needs Materials]):::proc --> Step2[Employee Creates Purchase Requisition]:::proc
    Step2 --> Step3{Manager Review}:::decision
    
    Step3 -->|Rejected| Step3R[Status = 'Rejected']:::proc --> Step2
    Step3 -->|Approved| Step4[Status = 'Approved']:::proc
    
    Step4 --> Step5{Generation Type}:::decision
    Step5 -->|Manual Execution| Step5M[Procurement Specialist Selects Supplier]:::proc
    Step5 -->|Automated Trigger| Step5A[System Pulls Preferred Supplier from Product_Suppliers]:::proc
    
    Step5M --> Step6[Generate Purchase Order & Insert PO_Items]:::proc
    Step5A --> Step6
    
    Step6 --> Step7[Set PO Status = 'Sent' & Dispatch to Vendor Portal]:::proc
    Step7 --> Step8[Supplier Confirms PO Status = 'Confirmed']:::proc
    Step8 --> Step9[Materials Arrive at Dock: Create Inbound Shipment]:::proc
    
    Step9 --> Step10[Record Goods Receipt & Execute Stock-in Log]:::proc
    Step10 --> Step14([End Process: Inbound Items Transferred to WMS]):::proc
```

### Key Stages
1. **Requisition Stage**: Requisitions originate from departments. An approval gate prevents un-budgeted purchasing.
2. **PO Dispatch**: Purchases are routed dynamically based on Preferred Supplier configurations or manually processed.
3. **Goods Inbound**: Warehouse receipt of products logs inventory and closes out the active Purchase Order.

---

## 📦 B. Product Inventory & Warehouse Management (WMS) Process

This process details warehouse transactions, localization tracking, and automated inventory safety thresholds.

```mermaid
flowchart TD
    %% Styling
    classDef inv fill:#2f855a,stroke:#38a169,stroke-width:2px,color:#fff;
    classDef decision fill:#d69e2e,stroke:#ecc94b,stroke-width:2px,color:#1a202c;

    I1([Start: Material Flow Event]):::inv --> I2{Transaction Type}:::decision
    
    I2 -->|Supplier Delivery / Stock-In| I3[Verify SKU against active Product Catalog]:::inv
    I3 --> I4[Identify Target Warehouse & Warehouse_Zones by Category]:::inv
    I4 --> I5[Increment Quantity in Inventory_Locations Table]:::inv
    I5 --> I6[Write Log Row to Stock_Transactions with Type 'Stock-in']:::inv
    
    I2 -->|Sales Fulfillment / Stock-Out| I7[Identify Item Batches / Check Expiration_Date]:::inv
    I7 --> I8[Decrement Quantity in Inventory_Locations Table]:::inv
    I8 --> I9[Write Log Row to Stock_Transactions with Type 'Stock-out']:::inv
    
    I2 -->|Warehouse Relocation / Transfer| I10[Deduct Balance from Source Location Node]:::inv
    I10 --> I11[Add Balance to Destination Location Node]:::inv
    I11 --> I12[Write Log Row to Stock_Transactions with Type 'Transfer']:::inv
    
    I6 --> I13[Evaluate Remaining Structural Inventory Balances]:::inv
    I9 --> I13
    I12 --> I13
    
    I13 --> I14{Is Balance Current Level <= min_quantity_threshold?}:::decision
    I14 -->|No| I15([End: Inventory Maintained]):::inv
    I14 -->|Yes| I16[Trigger Re-order Request Alert via System BI Module]:::inv
    I16 --> I17([End: Automated Procurement Notification Dispatched]):::inv
```

### Key Stages
1. **Flow Verification**: Ensures only registered SKUs enter warehouse stock.
2. **Zone Allocation**: Organizes warehouse layout by assigning incoming products to zones (e.g., cold storage, hazardous, standard racks).
3. **Double-Entry Stock Transactions**: Every transfer deducts from source and adds to destination, ensuring zero missing quantities.
4. **Safety Threshold Check**: Automated scanning of stock levels triggers BI notifications to avoid stockouts.

---

## 🏷️ C. Sales & Customer Management (CRM) Process

This workflow charts the processing of customer demands, transforming a raw quote into an active shipment.

```mermaid
flowchart TD
    %% Styling
    classDef sales fill:#c05621,stroke:#dd6b20,stroke-width:2px,color:#fff;
    classDef decision fill:#d69e2e,stroke:#ecc94b,stroke-width:2px,color:#1a202c;

    S1([Start: Client Intent]):::sales --> S2[Sales Rep Instantiates or Queries Customers Record]:::sales
    S2 --> S3[Generate Official Quotation with Pricing / Discount Rules]:::sales
    S3 --> S4{Customer Confirms Order?}:::decision
    
    S4 -->|No / Expired| S4Drop[Status = 'Cancelled']:::sales --> S15([End Process]):::sales
    S4 -->|Yes| S5[Instantiate Row in Sales_Orders with Status = 'Pending']:::sales
    
    S5 --> S6[Bind Context Data: payment_term_id, currency_id, Billing_Details]:::sales
    S6 --> S7[Query Inventory_Locations to Validate Item Stock]:::sales
    
    S7 --> S8{Stock Available?}:::decision
    S8 -->|No| S8Hold[Status = 'On Hold' -> Create Backorder Requisition]:::sales --> S7
    S8 -->|Yes| S9[Update Sales_Orders Status = 'Processed']:::sales
    
    S9 --> S10[Dispatch Notification to Logistics Layer for Outbound Shipment]:::sales
    S10 --> S11[Warehouse Executes Stock-out & Lowers Available Balances]:::sales
    S11 --> S14[Order Status Set to 'Delivered']:::sales
    S14 --> S15([End Process]):::sales
```

### Key Stages
1. **Quotation Stage**: Sales Representatives query Customer Master records and apply regional price books or discount matrices.
2. **Commit Gate**: Confirmed quotes update to Sales Orders, locking in transaction details (currencies, payment terms).
3. **Availability Hold**: If stock is unavailable, orders are put on hold and backordered via the Procurement system.
4. **Fulfillment & Delivery**: Handover to warehouse for dispatch, final delivery receipt, and order completion.

---

## 🛠️ D. Helpdesk & Post-Sale Case Resolution Process

This workflow tracks incoming post-sale inquiries to ensure compliance with service agreement windows.

```mermaid
flowchart TD
    %% Styling
    classDef help fill:#6b46c1,stroke:#805ad5,stroke-width:2px,color:#fff;
    classDef decision fill:#d69e2e,stroke:#ecc94b,stroke-width:2px,color:#1a202c;

    H1([Start: Post-Sale Incident Triggered]):::help --> H2[Instantiate Incident Log row in Tickets Table]:::help
    H2 --> H3[Map Context Fields: customer_id, Optional order_id]:::help
    H3 --> H4[Set Priority Configuration Level based on Severity]:::help
    H4 --> H5[Apply SLA Rules Matrix for Target Resolution Timestamp]:::help
    
    H5 --> H6[Assign Ticket Ownership to Target Customer Support Agent]:::help
    H6 --> H7[Set Ticket Status = 'In Progress']:::help
    
    H7 --> H8{Can Issue Be Resolved Directly via Knowledge Base / Self-Service?}:::decision
    H8 -->|Yes| H9[Send Article Link & Resolution Instructions to Client]:::help --> H11
    H8 -->|No| H10[Escalate to Specialized Technical / Warehouse Department]:::help --> H11
    
    H11 --> H12{Does Resolution Window Violate SLA Targets?}:::decision
    H12 -->|Yes| H12Alert[Trigger Auto-Escalation Warning Alert to Operations Manager]:::help --> H13
    H12 -->|No| H13[Apply System Patch / Refund / Item Replacement]:::help
    
    H13 --> H14[Update Ticket Status Value = 'Resolved']:::help
    H14 --> H15[Gather User Feedback Metrics & Close Transaction Loop]:::help
    H15 --> H16([End Process]):::help
```

### Key Stages
1. **Ticket Creation**: Tickets link customers to orders, ensuring full context.
2. **SLA Assignment**: Escalation deadlines are mapped instantly based on severity (Low, Medium, High).
3. **Self-Service Check**: First-line support searches the solutions knowledge base to reduce team load.
4. **SLA Monitoring & Escalation**: Background tasks verify ticket age; breaches trigger operational manager alerts.
