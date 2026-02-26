// Stages Definition
const STAGES = [
    { id: 'inquiry', name: 'Inquiry', icon: 'ri-mail-send-line' },
    { id: 'quotation', name: 'Quotation', icon: 'ri-file-list-3-line' },
    { id: 'design', name: 'Design & Drawing', icon: 'ri-ruler-line' },
    { id: 'production', name: 'Production', icon: 'ri-tools-line' },
    { id: 'testing', name: 'Testing', icon: 'ri-test-tube-line' },
    { id: 'delivery', name: 'Delivery', icon: 'ri-truck-line' }
];

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbjie3anp54P3cD4V_v2QNmBGcuDN-R-A",
    authDomain: "yashintha-2e03d.firebaseapp.com",
    projectId: "yashintha-2e03d",
    storageBucket: "yashintha-2e03d.firebasestorage.app",
    messagingSenderId: "489246293910",
    appId: "1:489246293910:web:0978678e9460893ec427b7",
    measurementId: "G-N9H3RRNPDS"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// State
let projects = [];
let inquiries = [];
let currentEditingStage = null;
let conversionChart = null;

// DOM Elements
const projectsGrid = document.getElementById('projectsGrid');
const emptyState = document.getElementById('emptyState');
const totalProjectsStat = document.getElementById('totalProjectsStat');
const onTrackStat = document.getElementById('onTrackStat');

const projectModal = document.getElementById('projectModal');
const projectForm = document.getElementById('projectForm');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const addProjectBtn = document.getElementById('addProjectBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');

const stageModal = document.getElementById('stageModal');
const closeStageModalBtn = document.getElementById('closeStageModalBtn');
const stageNameDisplay = document.getElementById('stageNameDisplay');
const stageProjectDisplay = document.getElementById('stageProjectDisplay');
const markPendingBtn = document.getElementById('markPendingBtn');
const markOnTimeBtn = document.getElementById('markOnTimeBtn');
const markDelayedBtn = document.getElementById('markDelayedBtn');

// Tabs -> Modal
const completedStat = document.getElementById('completedStat');
const totalValueStat = document.getElementById('totalValueStat');

// Tabs -> Modal
const viewCompletedBtn = document.getElementById('viewCompletedBtn');
const completedModal = document.getElementById('completedModal');
const closeCompletedModalBtn = document.getElementById('closeCompletedModalBtn');
const completedGrid = document.getElementById('completedGrid');
const completedEmptyState = document.getElementById('completedEmptyState');

// Inquiries Elements
const inquiriesModal = document.getElementById('inquiriesModal');
const closeInquiriesModalBtn = document.getElementById('closeInquiriesModalBtn');
const viewInquiriesBtn = document.getElementById('viewInquiriesBtn');
const inquiriesList = document.getElementById('inquiriesList');
const inquiriesEmptyState = document.getElementById('inquiriesEmptyState');

const addInquiryModal = document.getElementById('addInquiryModal');
const closeAddInquiryModalBtn = document.getElementById('closeAddInquiryModalBtn');
const cancelInquiryModalBtn = document.getElementById('cancelInquiryModalBtn');
const addInquiryBtn = document.getElementById('addInquiryBtn');
const inquiryForm = document.getElementById('inquiryForm');

// Analytics Elements
const analyticsModal = document.getElementById('analyticsModal');
const viewAnalyticsBtn = document.getElementById('viewAnalyticsBtn');
const closeAnalyticsModalBtn = document.getElementById('closeAnalyticsModalBtn');
const conversionRateStat = document.getElementById('conversionRateStat');

// Inquiry Stage Details Elements
const inquiryStageDetailModal = document.getElementById('inquiryStageDetailModal');
const closeInquiryStageDetailModalBtn = document.getElementById('closeInquiryStageDetailModalBtn');
const cancelInquiryDetailBtn = document.getElementById('cancelInquiryDetailBtn');
const saveInquiryDetailBtn = document.getElementById('saveInquiryDetailBtn');
const inquiryDetailProjectName = document.getElementById('inquiryDetailProjectName');
const projectValueInput = document.getElementById('projectValueInput');
const quotationFileUpload = document.getElementById('quotationFileUpload');
const designFileUpload = document.getElementById('designFileUpload');
const quotationFileName = document.getElementById('quotationFileName');
const designFileName = document.getElementById('designFileName');
const quotationFileLink = document.getElementById('quotationFileLink');
const designFileLink = document.getElementById('designFileLink');
const approveInquiryBtn = document.getElementById('approveInquiryBtn');
const rejectInquiryBtn = document.getElementById('rejectInquiryBtn');

const infoInquiryDate = document.getElementById('infoInquiryDate');
const infoInquiryCompany = document.getElementById('infoInquiryCompany');
const infoInquiryContact = document.getElementById('infoInquiryContact');
const infoInquiryPhone = document.getElementById('infoInquiryPhone');
const requirementFileName = document.getElementById('requirementFileName');
const requirementFileLink = document.getElementById('requirementFileLink');

const inquiryRequirementUpload = document.getElementById('inquiryRequirementUpload');
const inquiryRequirementFileName = document.getElementById('inquiryRequirementFileName');
const inquiryRequirementUrl = document.getElementById('inquiryRequirementUrl');
const inquiryRequirementLink = document.getElementById('inquiryRequirementLink');

// Initialize
function init() {
    setupEventListeners();
    listenForProjects();
    listenForInquiries();
}

function listenForInquiries() {
    console.log("[DEBUG] listenForInquiries: Setting up listener on 'inquiries' ref");
    const inquiriesRef = database.ref('inquiries');
    inquiriesRef.on('value', (snapshot) => {
        console.log("[DEBUG] listenForInquiries: Received snapshot", snapshot.val());
        try {
            const data = snapshot.val();
            inquiries = [];
            if (data) {
                console.log("[DEBUG] listenForInquiries: Data exists, parsing keys...");
                Object.keys(data).forEach(key => {
                    if (data[key] && typeof data[key] === 'object') {
                        inquiries.push({ ...data[key], id: key });
                    } else {
                        console.warn("[DEBUG] listenForInquiries: Skipping invalid data format for key:", key, data[key]);
                    }
                });
                console.log("[DEBUG] listenForInquiries: Parsed inquiries array before sort:", JSON.parse(JSON.stringify(inquiries)));

                // Sort by creation exact time ascending (newest first) robustly
                inquiries.sort((a, b) => {
                    const dateA = a.created ? new Date(a.created).getTime() : 0;
                    const dateB = b.created ? new Date(b.created).getTime() : 0;
                    return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
                });
                console.log("[DEBUG] listenForInquiries: Sorted inquiries array:", inquiries);
            } else {
                console.log("[DEBUG] listenForInquiries: No data found in snapshot");
            }
            console.log("[DEBUG] listenForInquiries: Calling renderInquiries");
            renderInquiries();
            console.log("[DEBUG] listenForInquiries: Calling updateStats");
            updateStats();
            console.log("[DEBUG] listenForInquiries: Calling updateConversionChart");
            updateConversionChart();
            console.log("[DEBUG] listenForInquiries: Render cycle complete");
        } catch (error) {
            console.error("[DEBUG-ERROR] listenForInquiries: Error processing inquiries:", error);
            // Fallback render to prevent stuck states
            renderInquiries();
        }
    });
}

function listenForProjects() {
    const projectsRef = database.ref('projects');
    projectsRef.on('value', (snapshot) => {
        const data = snapshot.val();
        projects = [];
        if (data) {
            // Convert object to array
            Object.keys(data).forEach(key => {
                projects.push(data[key]);
            });
            // Sort by creation date descending
            projects.sort((a, b) => new Date(b.created) - new Date(a.created));
        }
        renderDashboard();
    });
}

// Rendering
function renderDashboard() {
    renderProjects();
    updateStats();
}

function updateStats() {
    const activeProjectsCount = projects.filter(p => !isProjectCompleted(p)).length;
    const completedProjectsCount = projects.filter(p => isProjectCompleted(p)).length;

    if (totalProjectsStat) totalProjectsStat.textContent = activeProjectsCount;
    if (completedStat) completedStat.textContent = completedProjectsCount;
    if (onTrackStat) onTrackStat.textContent = projects.filter(p => !isProjectCompleted(p) && !isProjectDelayed(p)).length;

    // Update Total Value
    const totalValue = projects.reduce((sum, p) => {
        if (!isProjectCompleted(p)) {
            return sum + (Number(p.inquiryData?.value) || 0);
        }
        return sum;
    }, 0);
    if (totalValueStat) totalValueStat.textContent = totalValue.toLocaleString();

    // Update Conversion Rate
    const totalInquiries = inquiries.length;
    const convertedInquiries = inquiries.filter(i => i.converted).length;
    const rate = totalInquiries > 0 ? Math.round((convertedInquiries / totalInquiries) * 100) : 0;
    if (conversionRateStat) conversionRateStat.textContent = `${rate}%`;
}

function isProjectDelayed(project) {
    // A project is delayed if any finished stage is 'delayed' or any pending stage is past its deadline
    if (!project.stages) return false;
    const today = new Date();

    // Check finished stages
    if (Object.values(project.stages).some(status => status === 'delayed')) return true;

    // Check pending stages for overdue
    for (const stage of STAGES) {
        const status = project.stages[stage.id] || 'pending';
        const deadline = project.stageDeadlines ? project.stageDeadlines[stage.id] : null;
        if (status === 'pending' && deadline && new Date(deadline) < today) {
            return true;
        }
    }
    return false;
}

function isProjectCompleted(project) {
    // A project is completed if the Delivery stage is explicitly marked as "ontime" or "delayed"
    return project.stages && (project.stages.delivery === 'ontime' || project.stages.delivery === 'delayed');
}

function renderProjects() {
    // Clear existing
    const cardsActive = projectsGrid.querySelectorAll('.project-card');
    cardsActive.forEach(card => card.remove());
    const cardsCompleted = completedGrid.querySelectorAll('.project-card');
    cardsCompleted.forEach(card => card.remove());

    const activeProjects = projects.filter(p => !isProjectCompleted(p));
    const completedProjects = projects.filter(p => isProjectCompleted(p));

    // Handle Empty States
    emptyState.style.display = activeProjects.length === 0 ? 'block' : 'none';
    completedEmptyState.style.display = completedProjects.length === 0 ? 'block' : 'none';

    // Render Active
    activeProjects.forEach(project => renderCard(project, projectsGrid));

    // Render Completed
    completedProjects.forEach(project => renderCard(project, completedGrid));
}

function renderCard(project, container) {
    const card = document.createElement('div');
    card.className = 'project-card';

    const formattedDate = new Date(project.deadline).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });

    let stagesHTML = '';
    STAGES.forEach((stage, index) => {
        const status = project.stages[stage.id] || 'pending'; // pending, ontime, delayed
        const stageDeadline = project.stageDeadlines ? project.stageDeadlines[stage.id] : '';
        const formattedStageDate = stageDeadline ? new Date(stageDeadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date';

        let statusClass = 'pending';
        let statusText = 'Pending';
        let iconHtml = `<i class="${stage.icon}"></i>`;

        if (status === 'ontime') {
            statusClass = 'green';
            statusText = 'On Time';
            iconHtml = '<i class="ri-check-line"></i>';
        } else if (status === 'delayed') {
            statusClass = 'red';
            statusText = 'Delayed';
            iconHtml = '<i class="ri-close-line"></i>';
        }

        const clickAction = `openStageModal('${project.id}', '${stage.id}')`;

        stagesHTML += `
          <div class="stage-item ${statusClass}" onclick="${clickAction}">
            <div class="stage-indicator">
              ${iconHtml}
            </div>
            <div class="stage-info">
              <div style="display: flex; flex-direction: column;">
                <span class="stage-name">${index + 1}. ${stage.name}</span>
                <span style="font-size: 0.75rem; opacity: 0.7; margin-top: 2px;"><i class="ri-calendar-todo-line"></i> ${formattedStageDate}</span>
              </div>
              <span class="stage-status-text">${statusText}</span>
            </div>
          </div>
        `;
    });

    card.innerHTML = `
            <div class="card-header">
              <div>
                <h4 class="project-title">${project.name}</h4>
                <div class="client-name"><i class="ri-building-line"></i> ${project.client}</div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                <div class="deadline-badge">
                  <i class="ri-calendar-event-line"></i> ${formattedDate}
                </div>
                <div style="display: flex; gap: 5px;">
                  <button class="btn btn-ghost btn-sm" onclick="openProjectInformationModal('${project.id}')" title="Project Information">
                    <i class="ri-information-line" style="font-size: 1.1rem; color: var(--primary);"></i>
                  </button>
                  <button class="btn btn-ghost delete-project-btn btn-sm" onclick="deleteProject('${project.id}')" title="Delete Project">
                    <i class="ri-delete-bin-line" style="font-size: 1rem;"></i>
                  </button>
                </div>
              </div>
            </div>
        <div class="stage-tracker">
          ${stagesHTML}
        </div>
      `;

    container.appendChild(card);
}

function renderInquiries() {
    try {
        // Clear existing cards but keep empty state
        const existingCards = inquiriesList.querySelectorAll('.inquiry-card');
        existingCards.forEach(card => card.remove());

        inquiriesEmptyState.style.display = inquiries.length === 0 ? 'block' : 'none';

        inquiries.forEach(inquiry => {
            if (!inquiry || typeof inquiry !== 'object') return; // Skip invalid entries

            const card = document.createElement('div');
            card.className = 'inquiry-card';

            let formattedDate = 'No Date';
            try {
                if (inquiry.date) {
                    const d = new Date(inquiry.date);
                    if (!isNaN(d.getTime())) {
                        formattedDate = d.toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric'
                        });
                    }
                }
            } catch (e) {
                console.error("Date parsing error", e);
            }

            const company = inquiry.company || 'Unknown Company';
            const contactName = inquiry.contactName || 'No Contact Name';
            const contactNumber = inquiry.contactNumber || 'No Contact Number';

            card.innerHTML = `
                <div class="inquiry-main-info">
                    <span class="inquiry-date">${formattedDate}</span>
                    <h4 class="inquiry-company">${company}</h4>
                    <div class="inquiry-contact">
                        <span><i class="ri-user-line"></i> ${contactName}</span>
                        <span><i class="ri-phone-line"></i> ${contactNumber}</span>
                    </div>
                    ${inquiry.requirementUrl
                    ? `<div style="margin-top: 10px;">
                            <a href="${inquiry.requirementUrl}" target="_blank" class="btn btn-outline btn-sm">
                                <i class="ri-eye-line"></i> View Document
                            </a>
                           </div>`
                    : ''
                }
                </div>
                <div class="inquiry-actions">
                    ${inquiry.converted
                    ? `<span class="converted-badge"><i class="ri-checkbox-circle-line"></i> Converted</span>`
                    : `<button class="btn btn-primary btn-sm" onclick="startConversion('${inquiry.id}')">
                            <i class="ri-arrow-right-up-line"></i> Convert to Project
                           </button>`
                }
                    <button class="btn btn-ghost btn-sm delete-inquiry-btn" tabindex="0" onclick="deleteInquiry('${inquiry.id}')">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
            `;
            inquiriesList.appendChild(card);
        });
    } catch (globalError) {
        console.error("Error in renderInquiries: ", globalError);
        alert("An error occurred while displaying inquiries. Please check the console.");
    }
}

function startConversion(inquiryId) {
    const inquiry = inquiries.find(i => i.id === inquiryId);
    if (!inquiry) return;

    // Close inquiries modal
    inquiriesModal.classList.remove('active');

    // Open project modal with pre-filled data
    openProjectModal();
    document.getElementById('projectName').value = `Project for ${inquiry.company}`;
    document.getElementById('clientName').value = inquiry.company;

    // Store inquiry source for tagging after save
    document.getElementById('projectIdInput').dataset.sourceInquiryId = inquiryId;
}

function updateConversionChart() {
    const ctx = document.getElementById('conversionChart');
    if (!ctx) return;

    const totalInquiries = inquiries.length;
    const convertedCount = inquiries.filter(i => i.converted).length;
    const pendingCount = totalInquiries - convertedCount;

    if (conversionChart) {
        conversionChart.destroy();
    }

    if (totalInquiries === 0) {
        document.getElementById('chartLegend').innerHTML = '<p style="color: #94a3b8;">No data available to display chart.</p>';
        return;
    }

    conversionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Converted', 'Pending'],
            datasets: [{
                data: [convertedCount, pendingCount],
                backgroundColor: ['#10b981', '#3b82f6'],
                borderColor: '#1e293b',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percent = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percent}%)`;
                        }
                    }
                }
            }
        }
    });

    document.getElementById('chartLegend').innerHTML = `
        <div style="display: flex; justify-content: center; gap: 20px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #10b981; border-radius: 50%;"></div>
                <span>Converted: ${convertedCount}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 12px; height: 12px; background: #3b82f6; border-radius: 50%;"></div>
                <span>Pending: ${pendingCount}</span>
            </div>
        </div>
    `;
}

// Modals
function openProjectModal() {
    projectForm.reset();
    document.getElementById('projectIdInput').value = '';
    document.getElementById('modalTitle').textContent = 'Create New Project';
    projectModal.classList.add('active');

    // Set default deadline to 1 month from now
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    document.getElementById('deadline').value = nextMonth.toISOString().split('T')[0];
}

function closeProjectModal() {
    projectModal.classList.remove('active');
}

function openStageModal(projectId, stageId) {
    const project = projects.find(p => p.id === projectId);
    const stageDef = STAGES.find(s => s.id === stageId);

    if (!project || !stageDef) return;

    currentEditingStage = { projectId, stageId };

    stageNameDisplay.textContent = stageDef.name;
    stageProjectDisplay.textContent = project.name;

    stageModal.classList.add('active');
}

function openProjectInformationModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    currentEditingStage = { projectId };

    if (inquiryDetailProjectName) inquiryDetailProjectName.textContent = project.name;

    // Prefill Inquiry Details
    if (infoInquiryDate) infoInquiryDate.textContent = project.inquirySource?.date ? new Date(project.inquirySource.date).toLocaleDateString() : 'N/A';
    if (infoInquiryCompany) infoInquiryCompany.textContent = project.inquirySource?.company || project.client || 'N/A';
    if (infoInquiryContact) infoInquiryContact.textContent = project.inquirySource?.contactName || 'N/A';
    if (infoInquiryPhone) infoInquiryPhone.textContent = project.inquirySource?.contactNumber || 'N/A';

    // Requirements Document
    if (requirementFileName) {
        if (project.inquirySource?.requirementUrl) {
            requirementFileName.textContent = project.inquirySource.requirementFileName || 'Requirements.pdf';
            requirementFileLink.href = project.inquirySource.requirementUrl;
            requirementFileLink.style.display = 'inline-flex';
        } else {
            requirementFileName.textContent = 'No file available';
            requirementFileLink.style.display = 'none';
        }
    }

    // Value
    if (projectValueInput) projectValueInput.value = project.inquiryData?.value || '';

    // Existing Uploads
    if (quotationFileName) quotationFileName.textContent = project.inquiryData?.quotationFileName || 'No file';
    if (designFileName) designFileName.textContent = project.inquiryData?.designFileName || 'No file';

    if (quotationFileLink) {
        if (project.inquiryData?.quotationUrl) {
            quotationFileLink.href = project.inquiryData.quotationUrl;
            quotationFileLink.style.display = 'inline-flex';
        } else {
            quotationFileLink.style.display = 'none';
        }
    }

    if (designFileLink) {
        if (project.inquiryData?.designUrl) {
            designFileLink.href = project.inquiryData.designUrl;
            designFileLink.style.display = 'inline-flex';
        } else {
            designFileLink.style.display = 'none';
        }
    }

    // Update Status Buttons
    const status = project.stages ? (project.stages.inquiry || 'pending') : 'pending';
    updateApprovalButtonsUI(status);

    if (inquiryStageDetailModal) inquiryStageDetailModal.classList.add('active');
}

function openInquiryStageDetailModal(project) {
    inquiryDetailProjectName.textContent = project.name;
    projectValueInput.value = project.inquiryData?.value || '';

    quotationFileName.textContent = project.inquiryData?.quotationFileName || 'No file uploaded';
    designFileName.textContent = project.inquiryData?.designFileName || 'No file uploaded';

    if (project.inquiryData?.quotationUrl) {
        quotationFileLink.href = project.inquiryData.quotationUrl;
        quotationFileLink.style.display = 'inline';
    } else {
        quotationFileLink.style.display = 'none';
    }

    if (project.inquiryData?.designUrl) {
        designFileLink.href = project.inquiryData.designUrl;
        designFileLink.style.display = 'inline';
    } else {
        designFileLink.style.display = 'none';
    }

    // Status UI
    const status = project.stages.inquiry || 'pending';
    updateApprovalButtonsUI(status);

    inquiryStageDetailModal.classList.add('active');
}

function updateApprovalButtonsUI(status) {
    approveInquiryBtn.classList.remove('btn-success');
    approveInquiryBtn.classList.add('btn-outline');
    rejectInquiryBtn.classList.remove('btn-danger');
    rejectInquiryBtn.classList.add('btn-outline');

    if (status === 'ontime') {
        approveInquiryBtn.classList.remove('btn-outline');
        approveInquiryBtn.classList.add('btn-success');
    } else if (status === 'delayed') {
        rejectInquiryBtn.classList.remove('btn-outline');
        rejectInquiryBtn.classList.add('btn-danger');
    }
}

function closeStageModal() {
    stageModal.classList.remove('active');
    currentEditingStage = null;
}

// Actions
function handleProjectSubmit(e) {
    e.preventDefault();

    const idValue = document.getElementById('projectIdInput').value;
    const name = document.getElementById('projectName').value;
    const client = document.getElementById('clientName').value;
    const deadline = document.getElementById('deadline').value;

    // Collect deadlines for stages
    const deadlineInquiry = document.getElementById('deadlineInquiry').value;
    const deadlineQuotation = document.getElementById('deadlineQuotation').value;
    const deadlineDesign = document.getElementById('deadlineDesign').value;
    const deadlineProduction = document.getElementById('deadlineProduction').value;
    const deadlineTesting = document.getElementById('deadlineTesting').value;
    const deadlineDelivery = document.getElementById('deadlineDelivery').value;

    const stageDeadlines = {
        inquiry: deadlineInquiry,
        quotation: deadlineQuotation,
        design: deadlineDesign,
        production: deadlineProduction,
        testing: deadlineTesting,
        delivery: deadlineDelivery
    };

    let projId = idValue;
    if (!projId) {
        projId = 'proj_' + Date.now();
    }

    const projectData = {
        id: projId,
        name,
        client,
        deadline,
        created: idValue ? projects.find(p => p.id === idValue).created : new Date().toISOString(),
        stageDeadlines,
        inquirySource: idValue ? projects.find(p => p.id === idValue).inquirySource : (
            document.getElementById('projectIdInput').dataset.sourceInquiryId ?
                inquiries.find(i => i.id === document.getElementById('projectIdInput').dataset.sourceInquiryId) : null
        ),
        stages: idValue ? projects.find(p => p.id === idValue).stages : {
            inquiry: 'pending',
            quotation: 'pending',
            design: 'pending',
            production: 'pending',
            testing: 'pending',
            delivery: 'pending'
        }
    };

    // Save to Firebase
    database.ref('projects/' + projId).set(projectData).then(() => {
        // If it came from an inquiry, mark the inquiry as converted
        const sourceInquiryId = document.getElementById('projectIdInput').dataset.sourceInquiryId;
        if (sourceInquiryId) {
            database.ref(`inquiries/${sourceInquiryId}/converted`).set(true);
            delete document.getElementById('projectIdInput').dataset.sourceInquiryId;
        }
    });

    closeProjectModal();
}

async function handleInquirySubmit(e) {
    e.preventDefault();
    console.log("[DEBUG] handleInquirySubmit: Form submitted");

    const date = document.getElementById('inquiryDate').value;
    const company = document.getElementById('inquiryCompany').value;
    const contactName = document.getElementById('inquiryContactName').value;
    const contactNumber = document.getElementById('inquiryContactNumber').value;

    const requirementUrlValue = inquiryRequirementUrl.value;
    const requirementFileNameValue = inquiryRequirementFileName.textContent;

    const dataToSave = {
        date,
        company,
        contactName,
        contactNumber,
        converted: false,
        created: new Date().toISOString()
    };

    console.log("[DEBUG] handleInquirySubmit: Harvested data:", dataToSave);

    if (requirementUrlValue && requirementUrlValue.trim() !== '') {
        dataToSave.requirementUrl = requirementUrlValue;
        dataToSave.requirementFileName = requirementFileNameValue;
        console.log("[DEBUG] handleInquirySubmit: Adding requirement URL", requirementUrlValue);
    }

    try {
        console.log("[DEBUG] handleInquirySubmit: Attempting push to Firebase...");
        const inquiryRef = database.ref('inquiries').push();
        console.log("[DEBUG] handleInquirySubmit: Pushing with key", inquiryRef.key);
        await inquiryRef.set(dataToSave);
        console.log("[DEBUG] handleInquirySubmit: Push successful! Closing modal.");
        closeAddInquiryModal();
        alert("Inquiry saved successfully!");

        // Force an immediate fetch from Firebase to bypass potential listener sleep
        console.log("[DEBUG] handleInquirySubmit: Forcing manual refresh of list.");
        listenForInquiries();
    } catch (error) {
        console.error("[DEBUG-ERROR] handleInquirySubmit: FATAL ERROR saving inquiry: ", error);
        alert("Failed to save inquiry: " + error.message);
    }
}

async function handleRequirementUpload(file, inputElement) {
    if (!file) return;
    inquiryRequirementFileName.textContent = "Uploading...";
    // Saving to 'projects/' prefix to bypass potential Firebase Storage rule restrictions
    const storageRef = storage.ref(`projects/inquiry_requirements/temp_${Date.now()}_${file.name}`);
    try {
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();
        inquiryRequirementUrl.value = url;
        inquiryRequirementFileName.textContent = file.name;
        inquiryRequirementLink.href = url;
        inquiryRequirementLink.style.display = 'inline-flex';
        alert("Customer Requirement uploaded successfully!");
    } catch (e) {
        console.error("Upload failed: ", e);
        inquiryRequirementFileName.textContent = "Error uploading. File size or permissions issue.";
        alert("Upload failed: " + e.message);
    } finally {
        if (inputElement) inputElement.value = '';
    }
}

function deleteInquiry(id) {
    if (confirm("Delete this inquiry?")) {
        database.ref(`inquiries/${id}`).remove();
    }
}

function closeAddInquiryModal() {
    addInquiryModal.classList.remove('active');
}

function handleInquiryDetailSave() {
    if (!currentEditingStage) return;
    const { projectId } = currentEditingStage;
    const value = projectValueInput.value;
    const project = projects.find(p => p.id === projectId);
    const currentStatus = project.stages.inquiry || 'pending';

    const updates = {
        'inquiryData/value': value,
        [`stages/inquiry`]: currentStatus
    };

    database.ref(`projects/${projectId}`).update(updates);
    inquiryStageDetailModal.classList.remove('active');
}

async function handleFileUpload(file, type) {
    if (!currentEditingStage || !file) return;
    const { projectId } = currentEditingStage;
    const storageRef = storage.ref(`projects/${projectId}/${type}_${file.name}`);

    try {
        const snapshot = await storageRef.put(file);
        const url = await snapshot.ref.getDownloadURL();

        const updates = {};
        updates[`inquiryData/${type}Url`] = url;
        updates[`inquiryData/${type}FileName`] = file.name;

        await database.ref(`projects/${projectId}`).update(updates);

        if (type === 'quotation') {
            quotationFileName.textContent = file.name;
            quotationFileLink.href = url;
            quotationFileLink.style.display = 'inline';
        } else {
            designFileName.textContent = file.name;
            designFileLink.href = url;
            designFileLink.style.display = 'inline';
        }
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully!`);
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Make sure Firebase Storage rules allow uploads.");
    }
}

function updateStageStatus(status) {
    if (!currentEditingStage) return;

    const { projectId, stageId } = currentEditingStage;

    // Update Firebase
    database.ref(`projects/${projectId}/stages/${stageId}`).set(status);

    closeStageModal();
}

function deleteProject(projectId) {
    if (confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
        // Remove from Firebase
        database.ref('projects/' + projectId).remove();
    }
}

// Events Setup
function setupEventListeners() {
    // Keyboard accessibility for delete buttons
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('delete-inquiry-btn')) {
            document.activeElement.click();
        }
    });

    // Completed Modal
    viewCompletedBtn.addEventListener('click', () => completedModal.classList.add('active'));
    closeCompletedModalBtn.addEventListener('click', () => completedModal.classList.remove('active'));

    // Project Modal
    addProjectBtn.addEventListener('click', openProjectModal);
    emptyAddBtn.addEventListener('click', openProjectModal);
    closeModalBtn.addEventListener('click', closeProjectModal);
    cancelModalBtn.addEventListener('click', closeProjectModal);
    projectForm.addEventListener('submit', handleProjectSubmit);

    // Stage Modal
    closeStageModalBtn.addEventListener('click', closeStageModal);

    markPendingBtn.addEventListener('click', () => updateStageStatus('pending'));
    markOnTimeBtn.addEventListener('click', () => updateStageStatus('ontime'));
    markDelayedBtn.addEventListener('click', () => updateStageStatus('delayed'));

    markDelayedBtn.addEventListener('click', () => updateStageStatus('delayed'));

    // Inquiries Events
    viewInquiriesBtn.addEventListener('click', () => inquiriesModal.classList.add('active'));
    closeInquiriesModalBtn.addEventListener('click', () => inquiriesModal.classList.remove('active'));

    addInquiryBtn.addEventListener('click', () => {
        inquiryForm.reset();
        document.getElementById('inquiryDate').value = new Date().toISOString().split('T')[0];
        inquiryRequirementFileName.textContent = "No file selected";
        inquiryRequirementUrl.value = "";
        inquiryRequirementLink.style.display = 'none';
        addInquiryModal.classList.add('active');
    });
    closeAddInquiryModalBtn.addEventListener('click', closeAddInquiryModal);
    cancelInquiryModalBtn.addEventListener('click', closeAddInquiryModal);
    inquiryForm.addEventListener('submit', handleInquirySubmit);
    inquiryRequirementUpload.addEventListener('change', (e) => handleRequirementUpload(e.target.files[0], e.target));

    // Analytics Events
    viewAnalyticsBtn.addEventListener('click', () => {
        analyticsModal.classList.add('active');
        setTimeout(updateConversionChart, 100); // Small delay to ensure canvas is ready
    });
    closeAnalyticsModalBtn.addEventListener('click', () => analyticsModal.classList.remove('active'));

    // Inquiry Stage Detail Events
    if (closeInquiryStageDetailModalBtn) closeInquiryStageDetailModalBtn.addEventListener('click', () => inquiryStageDetailModal.classList.remove('active'));
    if (cancelInquiryDetailBtn) cancelInquiryDetailBtn.addEventListener('click', () => inquiryStageDetailModal.classList.remove('active'));
    if (saveInquiryDetailBtn) saveInquiryDetailBtn.addEventListener('click', handleInquiryDetailSave);

    if (quotationFileUpload) quotationFileUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'quotation'));
    if (designFileUpload) designFileUpload.addEventListener('change', (e) => handleFileUpload(e.target.files[0], 'design'));

    if (approveInquiryBtn) approveInquiryBtn.addEventListener('click', () => {
        if (!currentEditingStage) return;
        database.ref(`projects/${currentEditingStage.projectId}/stages/inquiry`).set('ontime');
        updateApprovalButtonsUI('ontime');
    });

    if (rejectInquiryBtn) rejectInquiryBtn.addEventListener('click', () => {
        if (!currentEditingStage) return;
        database.ref(`projects/${currentEditingStage.projectId}/stages/inquiry`).set('delayed');
        updateApprovalButtonsUI('delayed');
    });

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === projectModal) closeProjectModal();
        if (e.target === stageModal) closeStageModal();
        if (e.target === inquiriesModal) inquiriesModal.classList.remove('active');
        if (e.target === addInquiryModal) closeAddInquiryModal();
        if (e.target === analyticsModal) analyticsModal.classList.remove('active');
        if (e.target === inquiryStageDetailModal) inquiryStageDetailModal.classList.remove('active');
    });
}

// Start
init();
