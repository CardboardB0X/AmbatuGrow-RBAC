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
    Step10 --> Step14([End Process: Inbound Items Logged]):::proc`,

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

// 6. Mermaid Diagram Handler (Safe layout check)
let renderingDiagram = false;
async function renderMermaidDiagram(key) {
  if (renderingDiagram) return;
  renderingDiagram = true;
  
  const container = document.getElementById('mermaid-container');
  const code = flowcharts[key];
  
  container.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Rendering Vector Graphics...</div>`;
  
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
    } catch (err) {
      console.error("Mermaid Render Error:", err);
      container.innerHTML = `<div class="error-box" style="color: var(--color-danger); padding: 20px;"><i class="fa-solid fa-triangle-exclamation"></i> Rendering failed. Mermaid syntax is compiling on GitHub natively.</div>`;
    } finally {
      renderingDiagram = false;
    }
  }, 50);
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

// 9. RBAC Simulator Engine (Spells out permissions in full)
function initRBACSimulator() {
  const roleSelect = document.getElementById('rbac-role-select');
  const cardTitle = document.getElementById('rbac-card-title');
  const cardDesc = document.getElementById('rbac-card-desc');
  const dutiesList = document.getElementById('rbac-duties-list');
  const gridContainer = document.getElementById('rbac-permissions-grid');

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

  // Load first role by default
  updateRoleDisplay(roleSelect.value);
}

// 10. Initialization orchestrator (Handles race conditions with ESM script loading)
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
