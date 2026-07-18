// AmbatuGrow ERP - Interactive Dashboard Controller

// 1. Mermaid Flowchart Definitions (Template Strings)
const flowcharts = {
  orchestration: `flowchart TB
    classDef core fill:#2d3748,stroke:#4a5568,stroke-width:2px,color:#fff;
    classDef proc fill:#2b6cb0,stroke:#3182ce,stroke-width:2px,color:#fff;
    classDef inv fill:#2f855a,stroke:#38a169,stroke-width:2px,color:#fff;
    classDef sales fill:#c05621,stroke:#dd6b20,stroke-width:2px,color:#fff;
    classDef fin fill:#9b2c2c,stroke:#e53e3e,stroke-width:2px,color:#fff;
    classDef help fill:#6b46c1,stroke:#805ad5,stroke-width:2px,color:#fff;

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
    SO -->|Post-Sale Issue| TICK`,

  procurement: `flowchart TD
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
    Step10 --> Step11[AP Specialist Receives Supplier_Invoices]:::proc
    
    Step11 --> Step12{3-Way Match Validation: PO vs. Goods Receipt vs. Invoice}:::decision
    Step12 -->|Mismatch Found| Step12Err[Flag Transaction & Hold Payment]:::proc
    Step12 -->|Match Successful| Step13[Approve Invoice Payment & Adjust General Ledger]:::proc
    Step13 --> Step14([End Process]):::proc`,

  inventory: `flowchart TD
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
    I16 --> I17([End: Automated Procurement Notification Dispatched]):::inv`,

  crm: `flowchart TD
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
    S11 --> S12[Accounts Receivable Compiles Customer Invoice]:::sales
    S12 --> S13[Record Customer Payment and Update General Ledger]:::sales
    S13 --> S14[Order Status Set to 'Delivered']:::sales
    S14 --> S15([End Process]):::sales`,

  helpdesk: `flowchart TD
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
    H15 --> H16([End Process]):::help`
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
    category: "procurement",
    question: "What is the 3-Way Match validation process in Accounts Payable?",
    answer: "The 3-way match is a validation gate run by the Accounts Payable (AP) specialist before releasing vendor payments. It compares: (1) The original Purchase Order quantities and rates, (2) The Goods Receipt / Inbound Stock transaction logs from the loading dock, and (3) The Supplier's Invoice. If all three match successfully, the payment is approved and ledger entries are logged.",
    tags: ["3-way match", "invoice", "verification", "payment", "accounts payable"]
  },
  {
    id: 3,
    category: "inventory",
    question: "What triggers an automated Stock Reorder notification?",
    answer: "Whenever WMS stock levels are updated (via sales fulfillment, supplier delivery, or transfer), the system automatically checks if the remaining quantity is less than or equal to the defined 'min_quantity_threshold' for that SKU. If yes, it fires an alert through the Business Intelligence (BI) module to notify the Procurement team to initialize a PR.",
    tags: ["reorder", "threshold", "minimum quantity", "safety stock", "WMS"]
  },
  {
    id: 4,
    category: "inventory",
    question: "How are stock transactions structured (Stock-In, Stock-Out, Transfer)?",
    answer: "Every physical change in stock is recorded in the Stock_Transactions table. Stock-In occurs during supplier delivery receipts; Stock-Out represents sales order fulfillment; and Transfer records shifts between warehouse zones. Transfers use double-entry logic, deducting quantities from the source node and adding them to the destination node simultaneously.",
    tags: ["stock transactions", "warehouse zones", "transfers", "stock-in", "stock-out"]
  },
  {
    id: 5,
    category: "sales",
    question: "What happens if a Sales Order contains out-of-stock items?",
    answer: "When a Sales Order is placed, the CRM queries the WMS Inventory_Locations table. If stock is available, it progresses to 'Processed'. If unavailable, the Sales Order status changes to 'On Hold' and triggers a Backorder Requisition in the Procurement module to secure the inventory from a supplier.",
    tags: ["stockout", "backorder", "sales order", "CRM", "hold"]
  },
  {
    id: 6,
    category: "helpdesk",
    question: "How do support tickets verify SLA compliance?",
    answer: "Upon ticket creation, the system assigns a priority (Low, Medium, High, Critical) based on incident severity. It then references the SLA Rules Matrix to stamp a target resolution timestamp. A background daemon monitors tickets; if a ticket is unresolved as it approaches this deadline, it triggers an auto-escalation warning to the Operations Manager.",
    tags: ["SLA", "helpdesk", "ticket", "priority", "escalation"]
  },
  {
    id: 7,
    category: "finance",
    question: "How do AR and AP connect back to the General Ledger?",
    answer: "Accounts Receivable (AR) logs customer debts from billing details, and Accounts Payable (AP) logs supplier obligations. Once payments are registered (customer pays, or vendor is paid), accounting scripts execute balanced double-entry adjustments (debits and credits) in the central General Ledger table.",
    tags: ["general ledger", "AP", "AR", "finance", "double-entry"]
  },
  {
    id: 8,
    category: "ecommerce",
    question: "How does the E-Commerce Integration sync data in real time?",
    answer: "The E-Commerce Integration module handles real-time webhooks. When a customer pays online, the web API transfers items, customer details, and payment tokens into the ERP's Sales_Orders table, while WMS automatically updates stock counts on the online shop to prevent overselling.",
    tags: ["ecommerce", "synchronization", "webhooks", "api", "orders"]
  },
  {
    id: 9,
    category: "projects",
    question: "How are project budgets integrated with Finance?",
    answer: "Project Managers assign equipment and labor rates to project tasks. As hours are submitted and materials are consumed, the actual expenses are logged in the project budget. The budget integrates directly with the Finance module to record operational expenditures (OpEx) automatically.",
    tags: ["project management", "budget", "expenses", "finance"]
  },
  {
    id: 10,
    category: "hr",
    question: "Who can see employee payroll records?",
    answer: "Based on RBAC permissions, employee payroll details are restricted. General Employees can only view their own profile and payslips. HR Managers have read/write access to run payroll computations, and Accountants have read access to execute general ledger pay runs. All other roles have zero access.",
    tags: ["payroll", "confidentiality", "HR", "access control", "RBAC"]
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
      "Access and export all reports, audit trails, and financial files.",
      "Override system locks, blockages, or invalid transactions."
    ],
    perms: { core: "Full Access", proc: "Full Access", wms: "Full Access", scm: "Full Access", sales: "Full Access", help: "Full Access", fin: "Full Access", ecom: "Full Access", proj: "Full Access", hr: "Full Access", bi: "Full Access" }
  },
  employee: {
    title: "General Employee",
    desc: "Standard departmental user with basic transactional access for daily operational tasks and personal records management.",
    duties: [
      "Create and submit internal Purchase Requisitions.",
      "Log personal working hours, timesheets, and leave requests.",
      "Submit helpdesk support tickets for equipment or account issues.",
      "View and execute tasks assigned within project workspaces."
    ],
    perms: { core: "No Access", proc: "Read & Write (Requisitions)", wms: "No Access", scm: "No Access", sales: "No Access", help: "Read & Write (Tickets)", fin: "No Access", ecom: "No Access", proj: "Read & Write (Tasks)", hr: "Read-Only (Self)", bi: "No Access" }
  },
  pm: {
    title: "Project Manager",
    desc: "Coordinates projects, work breakdown structures, schedules, and resource planning across active contracts.",
    duties: [
      "Define project scopes, timelines, tasks, and task dependencies.",
      "Allocate employees, budget, and materials to task nodes.",
      "Track project expenditures against budget estimates in real-time.",
      "Monitor task completion rates and compile progress dashboards."
    ],
    perms: { core: "No Access", proc: "No Access", wms: "No Access", scm: "No Access", sales: "No Access", help: "No Access", fin: "Read-Only (Project Costs)", ecom: "No Access", proj: "Full Access", hr: "Read-Only (Staff Assignees)", bi: "Read-Only" }
  },
  hrm: {
    title: "HR Specialist / Manager",
    desc: "Oversees employee lifecycle, payroll processing, attendance tracking, recruitment, and organizational roles.",
    duties: [
      "Maintain employee personnel records, contract files, and certifications.",
      "Process payroll runs, including tax withholdings and deductions.",
      "Manage recruitment, coordinate applicant pipelines, and onboarding tasks.",
      "Administer leaves, timesheets, and biometric attendance reports."
    ],
    perms: { core: "No Access", proc: "No Access", wms: "No Access", scm: "No Access", sales: "No Access", help: "No Access", fin: "Read-Only (Payroll Allocations)", ecom: "No Access", proj: "Read-Only", hr: "Full Access", bi: "Read-Only" }
  },
  fm: {
    title: "Finance Manager",
    desc: "Oversees company financial health. Audits ledgers, performs financial consolidation, and oversees budgets.",
    duties: [
      "Audit and sign off on General Ledger adjustments and financial statements.",
      "Perform budget vs. actual operational performance reviews.",
      "Oversee regulatory compliance, tax submissions, and external audits.",
      "Approve high-value invoices and payments locked by specialists."
    ],
    perms: { core: "Read-Only", proc: "Read-Only", wms: "No Access", scm: "No Access", sales: "Read-Only", help: "No Access", fin: "Full Access", ecom: "No Access", proj: "Read-Only", hr: "Read-Only", bi: "Full Access" }
  },
  accountant: {
    title: "Accountant",
    desc: "Handles daily transactional bookkeeping, invoice validation, accounts payable, accounts receivable, and ledger posts.",
    duties: [
      "Log incoming vendor invoices and process Accounts Payable runs.",
      "Generate customer invoices and apply payments to Accounts Receivable.",
      "Reconcile bank statements and post credit/debit entries to the General Ledger.",
      "Review employee payroll computations for accounting integration."
    ],
    perms: { core: "No Access", proc: "Read-Only (Supplier Invoices)", wms: "No Access", scm: "No Access", sales: "Read-Only (Sales Billing)", help: "No Access", fin: "Read & Write", ecom: "No Access", proj: "No Access", hr: "Read-Only (Payroll Ledger)", bi: "Read-Only" }
  },
  salesrep: {
    title: "Sales Representative",
    desc: "Front-line sales operations agent managing customer pipelines, quotes, and active sales orders.",
    duties: [
      "Maintain customer files and records inside the CRM.",
      "Draft quotations applying pricing rules and discount policies.",
      "Convert quotes into Sales Orders and verify initial stock availability.",
      "Sync order contexts and customer details with E-Commerce modules."
    ],
    perms: { core: "No Access", proc: "No Access", wms: "Read-Only (Stock Balance)", scm: "No Access", sales: "Read & Write", help: "Read-Only", fin: "No Access", ecom: "Read & Write", proj: "No Access", hr: "No Access", bi: "Read-Only" }
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
    perms: { core: "No Access", proc: "No Access", wms: "No Access", scm: "No Access", sales: "Read-Only (Customer Orders)", help: "Read & Write", fin: "No Access", ecom: "No Access", proj: "No Access", hr: "No Access", bi: "Read-Only" }
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
    perms: { core: "No Access", proc: "Read-Only (Supplier POs)", wms: "Full Access", scm: "Read & Write", sales: "No Access", help: "No Access", fin: "No Access", ecom: "Read-Only", proj: "No Access", hr: "No Access", bi: "Read-Only" }
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
    perms: { core: "No Access", proc: "No Access", wms: "Read & Write", scm: "Read & Write", sales: "No Access", help: "No Access", fin: "No Access", ecom: "No Access", proj: "No Access", hr: "No Access", bi: "No Access" }
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
    perms: { core: "No Access", proc: "Read & Write", wms: "Read-Only", scm: "Read & Write", sales: "No Access", help: "No Access", fin: "Read-Only (Vendor Invoices)", ecom: "No Access", proj: "No Access", hr: "No Access", bi: "Read-Only" }
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
    perms: { core: "No Access", proc: "No Access", wms: "Read-Only", scm: "No Access", sales: "Read-Only", help: "No Access", fin: "No Access", ecom: "Read & Write", proj: "No Access", hr: "No Access", bi: "Read-Only" }
  }
};

// 4. Flowchart Pan & Zoom Controls Module
let scale = 1.0;
let panX = 0;
let panY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

function initPanZoomEngine() {
  const wrapper = document.getElementById('diagram-canvas-wrapper');
  const container = document.getElementById('mermaid-container');
  
  if (!wrapper || !container) return;

  const applyTransform = () => {
    container.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
  };

  // Mouse Dragging
  wrapper.addEventListener('mousedown', (e) => {
    // Only drag with left click
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
  scale = 1.0;
  panX = 0;
  panY = 0;
  const container = document.getElementById('mermaid-container');
  if (container) {
    container.style.transform = `translate(0px, 0px) scale(1.0)`;
  }
}

// 5. Tab Routing & Views Management
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

// 6. Mermaid Diagram Handler
let renderingDiagram = false;
async function renderMermaidDiagram(key) {
  if (renderingDiagram) return;
  renderingDiagram = true;
  
  const container = document.getElementById('mermaid-container');
  const code = flowcharts[key];
  
  container.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Rendering Vector Graphics...</div>`;
  
  try {
    container.removeAttribute('data-processed');
    
    const id = `mermaid-render-${Date.now()}`;
    const rawHTML = `<div class="mermaid" id="${id}">${code}</div>`;
    container.innerHTML = rawHTML;
    
    await mermaid.run({
      nodes: [document.getElementById(id)]
    });
  } catch (err) {
    console.error("Mermaid Render Error:", err);
    container.innerHTML = `<div class="error-box"><i class="fa-solid fa-triangle-exclamation"></i> Rendering failed. Mermaid syntax is compiling on GitHub natively.</div>`;
  } finally {
    renderingDiagram = false;
  }
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

// 7. FAQ Renderer (Integrated)
function renderFAQs(faqs) {
  const container = document.getElementById('faq-accordion-container');
  if (!container) return;

  if (faqs.length === 0) {
    container.innerHTML = `
      <div class="empty-results">
        <i class="fa-regular fa-folder-open"></i>
        <p>No FAQs match your search keywords.</p>
        <span>Try searching terms like "3-way match", "reorder", "hold", or "SLA".</span>
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
          <div class="faq-tags">
            ${faq.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
          </div>
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

// 8. Documentation Center & Unified Search
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
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    clearBtn.style.display = searchQuery ? 'block' : 'none';
    executeSearch();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchQuery = '';
    clearBtn.style.display = 'none';
    executeSearch();
  });

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

// 9. RBAC Simulator Engine (Spells out permissions in full)
function initRBACSimulator() {
  const roleSelect = document.getElementById('rbac-role-select');
  const cardTitle = document.getElementById('rbac-card-title');
  const cardDesc = document.getElementById('rbac-card-desc');
  const dutiesList = document.getElementById('rbac-duties-list');
  const gridContainer = document.getElementById('rbac-permissions-grid');

  const modulesMap = {
    core: "Core Master Data",
    proc: "Procurement & Purchase",
    wms: "Inventory & WMS",
    scm: "Supply Chain / Logistics",
    sales: "Sales & CRM",
    help: "Helpdesk / Support",
    fin: "Finance & Accounting",
    ecom: "E-Commerce Integrations",
    proj: "Project Management",
    hr: "Human Resources",
    bi: "Business Intelligence"
  };

  const updateRoleDisplay = (roleKey) => {
    const role = rbacRoles[roleKey];
    if (!role) return;

    cardTitle.textContent = role.title;
    cardDesc.textContent = role.desc;
    
    // Render duties
    dutiesList.innerHTML = role.duties.map(d => `
      <li>
        <i class="fa-solid fa-circle-check"></i>
        <span>${d}</span>
      </li>
    `).join('');

    // Render permission badges grid with full spelled out titles
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
  };

  roleSelect.addEventListener('change', (e) => {
    updateRoleDisplay(e.target.value);
  });

  // Load first role by default
  updateRoleDisplay(roleSelect.value);
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  // Config Mermaid theme
  mermaid.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      primaryColor: '#1e293b',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#475569',
      lineColor: '#6366f1',
      secondaryColor: '#3b82f6',
      tertiaryColor: '#1e293b'
    }
  });

  initTabs();
  initFlowchartTabs();
  initPanZoomEngine();
  initDocsAndSearchEngine();
  initRBACSimulator();
});
