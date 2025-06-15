// Initialize application
class ExceedApp {
    constructor() {
        this.currentMode = 'notes';
        this.theme = 'light';
        this.isConnected = false;
        this.currentUser = null;
        this.collaborators = [];
        this.init();
    }

    init() {
        this.showAuthModal();
        this.setupEventListeners();
        this.updateWordCount();
    }

    showAuthModal() {
        const authModal = document.getElementById('authModal');
        authModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideAuthModal() {
        const authModal = document.getElementById('authModal');
        authModal.classList.add('hidden');
        document.body.style.overflow = 'visible';
    }

    showLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        loadingScreen.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        const loadingText = document.querySelector('.loading-text');
        const steps = [
            'Connecting to collaboration server...',
            'Loading document data...',
            'Syncing with collaborators...',
            'Initializing real-time features...',
            'Ready to collaborate!'
        ];

        let step = 0;
        const interval = setInterval(() => {
            if (step < steps.length) {
                loadingText.textContent = steps[step];
                step++;
            } else {
                clearInterval(interval);
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    document.body.style.overflow = 'visible';
                    this.isConnected = true;
                    document.getElementById('connectionStatus').textContent = 'Connected';
                    this.simulateInitialCollaborators();
                    this.simulateCollaboration();
                    this.startAutoSave();
                }, 1000);
            }
        }, 500);
    }

    setupEventListeners() {
        // Auth form submission
        document.getElementById('authForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            
            this.currentUser = {
                name: username,
                email: email,
                initial: username.charAt(0).toUpperCase(),
                displayName: username,
                timezone: 'UTC',
                notificationPref: 'mentions',
                darkMode: true
            };
            
            document.getElementById('userAvatar').textContent = this.currentUser.initial;
            document.getElementById('userAvatar').style.backgroundColor = this.getRandomColor();
            
            // Update profile panel
            document.getElementById('profileAvatar').textContent = this.currentUser.initial;
            document.getElementById('profileAvatar').style.backgroundColor = this.getRandomColor();
            document.getElementById('profileName').textContent = this.currentUser.name;
            document.getElementById('profileEmail').textContent = this.currentUser.email;
            document.getElementById('displayName').value = this.currentUser.displayName;
            document.getElementById('timezone').value = this.currentUser.timezone;
            document.getElementById('notificationPref').value = this.currentUser.notificationPref;
            document.getElementById('darkModeToggle').checked = this.currentUser.darkMode;
            
            this.hideAuthModal();
            this.showLoadingScreen();
            
            // Add current user to collaborators list
            this.addCollaborator(this.currentUser.name, this.currentUser.initial, this.currentUser.email);
        });

        // User dropdown
        document.getElementById('userAvatar').addEventListener('click', () => {
            document.getElementById('userDropdown').classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.user-menu')) {
                document.getElementById('userDropdown').classList.remove('show');
            }
        });

        // Profile item click
        document.getElementById('profileItem').addEventListener('click', () => {
            document.getElementById('profilePanel').classList.add('open');
            document.getElementById('userDropdown').classList.remove('show');
        });

        // Settings item click
        document.getElementById('settingsItem').addEventListener('click', () => {
            document.getElementById('profilePanel').classList.add('open');
            document.getElementById('userDropdown').classList.remove('show');
        });

        // Close profile panel
        document.getElementById('closeProfile').addEventListener('click', () => {
            document.getElementById('profilePanel').classList.remove('open');
        });

        // Save settings
        document.getElementById('saveSettings').addEventListener('click', () => {
            if (!this.currentUser) return;
            
            this.currentUser.displayName = document.getElementById('displayName').value;
            this.currentUser.timezone = document.getElementById('timezone').value;
            this.currentUser.notificationPref = document.getElementById('notificationPref').value;
            this.currentUser.darkMode = document.getElementById('darkModeToggle').checked;
            
            // Update profile name if changed
            document.getElementById('profileName').textContent = this.currentUser.displayName;
            
            this.showNotification('Settings saved successfully');
            document.getElementById('profilePanel').classList.remove('open');
        });

        // Dark mode toggle in profile
        document.getElementById('darkModeToggle').addEventListener('change', (e) => {
            this.toggleTheme();
        });

        // Logout
        document.getElementById('logoutItem').addEventListener('click', () => {
            this.showNotification('Logged out successfully');
            this.currentUser = null;
            document.getElementById('userAvatar').textContent = 'U';
            document.getElementById('userAvatar').style.backgroundColor = '';
            document.getElementById('collaboratorsList').innerHTML = '';
            document.getElementById('collaboratorCount').textContent = '0';
            document.getElementById('profilePanel').classList.remove('open');
            this.showAuthModal();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Mode switching
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchMode(e.target.dataset.mode);
            });
        });

        // Editor tabs
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchEditorTab(tabName);
            });
        });

        // Editor content change
        document.getElementById('editor').addEventListener('input', (e) => {
            this.handleContentChange(e);
            this.updateWordCount();
        });

        document.getElementById('codeEditor').addEventListener('input', (e) => {
            this.handleContentChange(e);
            this.updateWordCount();
        });

        // Spreadsheet cell changes
        document.querySelectorAll('#spreadsheet td').forEach(cell => {
            cell.addEventListener('input', () => {
                this.handleContentChange();
            });
        });

        // Chat functionality
        document.getElementById('sendMessage').addEventListener('click', () => {
            this.sendChatMessage();
        });

        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });

        // Document title
        document.getElementById('docTitle').addEventListener('input', (e) => {
            this.updateDocumentTitle(e.target.value);
        });

        // Save button
        document.getElementById('saveBtn').addEventListener('click', () => {
            this.saveDocument();
        });

        // Share button
        document.getElementById('shareBtn').addEventListener('click', () => {
            this.shareDocument();
        });

        // Toolbar buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleToolbarAction(e.target);
            });
        });

        // Add collaborator button
        document.getElementById('addCollaboratorBtn').addEventListener('click', () => {
            if (!this.currentUser) {
                this.showNotification('Please sign in to invite collaborators');
                return;
            }
            document.getElementById('addCollaboratorModal').classList.remove('hidden');
        });

        // Close add collaborator modal
        document.getElementById('closeModal').addEventListener('click', () => {
            document.getElementById('addCollaboratorModal').classList.add('hidden');
        });

        document.getElementById('cancelInvite').addEventListener('click', () => {
            document.getElementById('addCollaboratorModal').classList.add('hidden');
        });

        // Invite form submission
        document.getElementById('inviteForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('inviteEmail').value;
            this.inviteCollaborator(email);
            document.getElementById('inviteEmail').value = '';
            document.getElementById('addCollaboratorModal').classList.add('hidden');
        });
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.theme);
        document.getElementById('themeToggle').textContent = this.theme === 'light' ? '🌙' : '☀️';
        
        if (this.currentUser) {
            this.currentUser.darkMode = this.theme === 'dark';
            document.getElementById('darkModeToggle').checked = this.currentUser.darkMode;
        }
        
        this.showNotification(`Switched to ${this.theme} mode`);
    }

    switchMode(mode) {
        this.currentMode = mode;
        const editor = document.getElementById('editor');
        const codeEditor = document.getElementById('codeEditor');
        const spreadsheet = document.getElementById('spreadsheetContainer');
        const modeButtons = document.querySelectorAll('.mode-btn');

        // Update active button
        modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Update editor content and style
        switch(mode) {
            case 'notes':
                editor.style.display = 'block';
                codeEditor.style.display = 'none';
                spreadsheet.style.display = 'none';
                editor.placeholder = 'Start writing your notes...';
                break;
            case 'code':
                editor.style.display = 'none';
                codeEditor.style.display = 'block';
                spreadsheet.style.display = 'none';
                codeEditor.placeholder = '// Start coding...';
                break;
            case 'table':
                editor.style.display = 'none';
                codeEditor.style.display = 'none';
                spreadsheet.style.display = 'block';
                this.initializeSpreadsheet();
                break;
        }

        this.showNotification(`Switched to ${mode} mode`);
    }

    switchEditorTab(tabName) {
        const tabs = document.querySelectorAll('.editor-tab');
        tabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        if (tabName === 'settings') {
            this.showNotification('Document settings panel coming soon');
            // Reset to document tab
            setTimeout(() => {
                tabs[0].classList.add('active');
                tabs[1].classList.remove('active');
            }, 100);
        }
    }

    initializeSpreadsheet() {
        // Add event listeners to all cells
        document.querySelectorAll('#spreadsheet td').forEach(cell => {
            if (!cell.classList.contains('row-header') && !cell.classList.contains('column-header')) {
                cell.addEventListener('focus', () => {
                    cell.style.backgroundColor = 'var(--surface-variant)';
                });
                
                cell.addEventListener('blur', () => {
                    cell.style.backgroundColor = 'var(--surface)';
                });
            }
        });
    }

    handleContentChange(e) {
        // Simulate real-time sync
        this.showSyncIndicator();
        
        // Update last modified time
        this.updateStatusBar();
    }

    updateWordCount() {
        let content = '';
        if (this.currentMode === 'notes') {
            content = document.getElementById('editor').value;
        } else if (this.currentMode === 'code') {
            content = document.getElementById('codeEditor').value;
        } else if (this.currentMode === 'table') {
            // Count words in spreadsheet cells
            const cells = document.querySelectorAll('#spreadsheet td');
            cells.forEach(cell => {
                if (cell.textContent.trim()) {
                    content += cell.textContent + ' ';
                }
            });
        }
        
        const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
        document.getElementById('wordCount').textContent = words;
    }

    sendChatMessage() {
        if (!this.currentUser) {
            this.showNotification('Please sign in to send messages');
            return;
        }

        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (message) {
            const messagesContainer = document.getElementById('chatMessages');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message fade-in';
            
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            messageDiv.innerHTML = `
                <div class="message-avatar" style="background: ${this.getRandomColor()}">${this.currentUser.initial}</div>
                <div class="message-content">
                    <div class="message-author">${this.currentUser.name}</div>
                    <div class="message-text">${message}</div>
                    <div class="message-time">${timeStr}</div>
                </div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            input.value = '';
            
            // Simulate response after a delay
            setTimeout(() => {
                this.simulateChatResponse();
            }, 1000 + Math.random() * 2000);
        }
    }

    simulateChatResponse() {
        if (this.collaborators.length === 0) return;

        const responses = [
            "Great point! Let me check that section.",
            "I agree with that approach 👍",
            "Should we schedule a quick call to discuss this?",
            "I've made some updates to that part",
            "Thanks for the feedback!",
            "Let me know when you're ready to review",
            "Perfect! That looks much better now"
        ];
        
        const randomCollaborator = this.collaborators[Math.floor(Math.random() * this.collaborators.length)];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message fade-in';
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        messageDiv.innerHTML = `
            <div class="message-avatar" style="background: ${randomCollaborator.color}">${randomCollaborator.initial}</div>
            <div class="message-content">
                <div class="message-author">${randomCollaborator.name}</div>
                <div class="message-text">${randomResponse}</div>
                <div class="message-time">${timeStr}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    updateDocumentTitle(title) {
        document.title = `${title} - Exceed`;
        this.showNotification('Document title updated');
    }

    saveDocument() {
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.innerHTML;
        
        saveBtn.innerHTML = '⏳ Saving...';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.innerHTML = '✅ Saved!';
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }, 1000);
        }, 1500);
        
        this.updateStatusBar();
        this.addVersionHistory();
    }

    shareDocument() {
        if (!this.currentUser) {
            this.showNotification('Please sign in to share documents');
            return;
        }

        const shareData = {
            title: document.getElementById('docTitle').value,
            text: 'Check out this collaborative document on Exceed!',
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href).then(() => {
                this.showNotification('Share link copied to clipboard!');
            });
        }
    }

    handleToolbarAction(button) {
        const title = button.getAttribute('title');
        
        switch(title) {
            case 'Bold':
            case 'Italic':
            case 'Underline':
                this.applyTextFormatting(title.toLowerCase());
                break;
            case 'Undo':
                document.execCommand('undo');
                break;
            case 'Redo':
                document.execCommand('redo');
                break;
            case 'Export PDF':
                this.exportDocument('pdf');
                break;
            case 'Export MD':
                this.exportDocument('markdown');
                break;
        }
        
        button.classList.add('active');
        setTimeout(() => button.classList.remove('active'), 200);
    }

    applyTextFormatting(format) {
        let editor;
        if (this.currentMode === 'notes') {
            editor = document.getElementById('editor');
        } else if (this.currentMode === 'code') {
            editor = document.getElementById('codeEditor');
        } else {
            return; // No formatting for table mode
        }
        
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        const selectedText = editor.value.substring(start, end);
        
        if (selectedText) {
            let formattedText;
            switch(format) {
                case 'bold':
                    formattedText = `**${selectedText}**`;
                    break;
                case 'italic':
                    formattedText = `*${selectedText}*`;
                    break;
                case 'underline':
                    formattedText = `<u>${selectedText}</u>`;
                    break;
            }
            
            editor.value = editor.value.substring(0, start) + formattedText + editor.value.substring(end);
            editor.focus();
            editor.setSelectionRange(start, start + formattedText.length);
        }
    }

    exportDocument(format) {
        let content = '';
        let title = document.getElementById('docTitle').value;
        
        if (this.currentMode === 'notes') {
            content = document.getElementById('editor').value;
        } else if (this.currentMode === 'code') {
            content = document.getElementById('codeEditor').value;
        } else if (this.currentMode === 'table') {
            // Convert table to CSV
            const rows = document.querySelectorAll('#spreadsheet tr');
            let csvContent = '';
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                let rowContent = [];
                
                cells.forEach(cell => {
                    if (cell.classList.contains('row-header') || cell.classList.contains('column-header')) {
                        rowContent.push(cell.textContent);
                    } else {
                        rowContent.push(cell.textContent);
                    }
                });
                
                csvContent += rowContent.join(',') + '\n';
            });
            
            content = csvContent;
            title += '-table';
        }
        
        let blob, filename;
        
        if (format === 'pdf') {
            // In a real app, you'd use a library like jsPDF
            blob = new Blob([content], { type: 'text/plain' });
            filename = `${title}.txt`; // Simplified for demo
            this.showNotification('PDF export coming soon! Exported as text for now.');
        } else if (format === 'markdown') {
            if (this.currentMode === 'table') {
                // Convert table to markdown
                const rows = document.querySelectorAll('#spreadsheet tr');
                let mdContent = '';
                
                rows.forEach((row, index) => {
                    const cells = row.querySelectorAll('td, th');
                    let rowContent = '|';
                    
                    cells.forEach(cell => {
                        rowContent += ` ${cell.textContent} |`;
                    });
                    
                    mdContent += rowContent + '\n';
                    
                    // Add separator after header row
                    if (index === 0) {
                        let separator = '|';
                        for (let i = 0; i < cells.length; i++) {
                            separator += ' --- |';
                        }
                        mdContent += separator + '\n';
                    }
                });
                
                content = mdContent;
                filename = `${title}.md`;
            } else {
                blob = new Blob([content], { type: 'text/markdown' });
                filename = `${title}.md`;
            }
            this.showNotification('Document exported as Markdown!');
        }
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    showSyncIndicator() {
        const statusBar = document.querySelector('.status-bar');
        const syncIndicator = document.createElement('div');
        syncIndicator.innerHTML = '🔄 Syncing...';
        syncIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-blue);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.75rem;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(syncIndicator);
        
        setTimeout(() => {
            syncIndicator.innerHTML = '✅ Synced';
            setTimeout(() => {
                syncIndicator.remove();
            }, 1000);
        }, 800);
    }

    updateStatusBar() {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        document.getElementById('lastSaved').textContent = timeStr;
    }

    addVersionHistory() {
        const versionHistory = document.querySelector('.version-history');
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        const versionItem = document.createElement('div');
        versionItem.className = 'version-item fade-in';
        versionItem.innerHTML = `
            <div class="version-time">${timeStr}</div>
            <div class="version-author">Saved by ${this.currentUser ? this.currentUser.name : 'Anonymous'}</div>
        `;
        
        versionHistory.insertBefore(versionItem, versionHistory.children[1]);
        
        // Keep only last 5 versions
        const versions = versionHistory.querySelectorAll('.version-item');
        if (versions.length > 5) {
            versions[versions.length - 1].remove();
        }
    }

    startAutoSave() {
        setInterval(() => {
            this.updateStatusBar();
            this.showNotification('Document auto-saved');
        }, 30000); // Auto-save every 30 seconds
    }

    simulateInitialCollaborators() {
        if (!this.currentUser) return;

        // Add some initial collaborators
        const initialCollaborators = [
            { name: "Alex Chen", email: "alex@example.com", initial: "A", color: "#ea4335" },
            { name: "Sarah Kim", email: "sarah@example.com", initial: "S", color: "#34a853" },
            { name: "Mike Johnson", email: "mike@example.com", initial: "M", color: "#fbbc04" }
        ];

        initialCollaborators.forEach(collab => {
            this.addCollaborator(collab.name, collab.initial, collab.email, collab.color);
        });
    }

    addCollaborator(name, initial, email, color = null) {
        if (!color) {
            color = this.getRandomColor();
        }

        const collaborator = {
            name,
            initial,
            email,
            color,
            id: Date.now().toString()
        };

        // Check if collaborator already exists
        if (this.collaborators.some(c => c.email === email)) {
            return;
        }

        this.collaborators.push(collaborator);
        this.renderCollaborators();
    }

    removeCollaborator(id) {
        this.collaborators = this.collaborators.filter(c => c.id !== id);
        this.renderCollaborators();
    }

    renderCollaborators() {
        const collaboratorsList = document.getElementById('collaboratorsList');
        collaboratorsList.innerHTML = '';

        // Add current user first if logged in
        if (this.currentUser) {
            const userElement = document.createElement('div');
            userElement.className = 'collaborator';
            userElement.innerHTML = `
                <div class="avatar" style="background: ${this.getRandomColor()}">${this.currentUser.initial}</div>
                <div class="collaborator-info">
                    <div class="collaborator-name">${this.currentUser.name} (You)</div>
                    <div class="collaborator-status status-online">Online</div>
                </div>
            `;
            collaboratorsList.appendChild(userElement);
        }

        // Add other collaborators
        this.collaborators.forEach(collab => {
            const collabElement = document.createElement('div');
            collabElement.className = 'collaborator';
            collabElement.innerHTML = `
                <div class="avatar" style="background: ${collab.color}">${collab.initial}</div>
                <div class="collaborator-info">
                    <div class="collaborator-name">${collab.name}</div>
                    <div class="collaborator-status status-online">Online</div>
                </div>
                <div class="collaborator-actions">
                    <button class="remove-collaborator" data-id="${collab.id}">✕</button>
                </div>
            `;
            collaboratorsList.appendChild(collabElement);

            // Add event listener for remove button
            collabElement.querySelector('.remove-collaborator').addEventListener('click', (e) => {
                this.removeCollaborator(e.target.dataset.id);
            });
        });

        // Update collaborator count
        const totalCollaborators = this.currentUser ? this.collaborators.length + 1 : this.collaborators.length;
        document.getElementById('collaboratorCount').textContent = totalCollaborators;
        document.getElementById('collaboratorStatus').textContent = `${totalCollaborators} collaborator${totalCollaborators !== 1 ? 's' : ''}`;
    }

    inviteCollaborator(email) {
        if (!this.currentUser) return;

        // Generate a random name for the new collaborator
        const names = ["Jamie", "Taylor", "Casey", "Jordan", "Morgan", "Riley"];
        const randomName = names[Math.floor(Math.random() * names.length)];
        const randomInitial = randomName.charAt(0).toUpperCase();
        
        this.addCollaborator(randomName, randomInitial, email);
        this.showNotification(`Invitation sent to ${email}`);
    }

    simulateCollaboration() {
        // Simulate typing indicators
        setInterval(() => {
            if (this.collaborators.length === 0) return;

            const collaborators = document.querySelectorAll('.collaborator');
            const randomCollaborator = collaborators[Math.floor(Math.random() * collaborators.length)];
            const status = randomCollaborator.querySelector('.collaborator-status');
            
            if (Math.random() > 0.7) {
                status.innerHTML = `Typing <span class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </span>`;
                status.className = 'collaborator-status status-typing';
                
                setTimeout(() => {
                    status.textContent = 'Online';
                    status.className = 'collaborator-status status-online';
                }, 3000);
            }
        }, 8000);

        // Simulate cursor movements
        this.simulateCursors();
    }

    simulateCursors() {
        const editor = document.querySelector('.editor');
        
        // Clear existing cursors
        document.querySelectorAll('.cursor').forEach(cursor => cursor.remove());
        
        // Create simulated cursors for collaborators
        this.collaborators.forEach((collab, index) => {
            const cursor = document.createElement('div');
            cursor.className = 'cursor';
            cursor.style.background = collab.color;
            cursor.setAttribute('data-user', collab.name);
            cursor.style.left = `${100 + index * 200}px`;
            cursor.style.top = `${150 + index * 30}px`;
            
            editor.appendChild(cursor);
            
            // Animate cursor movement
            setInterval(() => {
                const editorRect = editor.getBoundingClientRect();
                const newX = Math.random() * (editorRect.width - 100) + 50;
                const newY = Math.random() * (editorRect.height - 100) + 50;
                cursor.style.left = `${newX}px`;
                cursor.style.top = `${newY}px`;
            }, 5000 + Math.random() * 10000);
        });
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getRandomColor() {
        const colors = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#673ab7', '#9c27b0'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new ExceedApp();
});