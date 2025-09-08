// Money Planner Application with Save/Export Features
class MoneyPlanner {
    constructor() {
        this.data = {
            currentBalance: 0,
            monthlyIncome: 0,
            monthlyExpenses: 0,
            savingsGoal: 0,
            budgetLimit: 0,
            transactions: [],
            expenses: {}
        };
        
        this.currencies = {
            USD: { symbol: '$', code: 'USD' },
            EUR: { symbol: '€', code: 'EUR' },
            GBP: { symbol: '£', code: 'GBP' },
            JPY: { symbol: '¥', code: 'JPY' },
            CAD: { symbol: 'C$', code: 'CAD' },
            AUD: { symbol: 'A$', code: 'AUD' },
            INR: { symbol: '₹', code: 'INR' },
            LKR: { symbol: '₨', code: 'LKR' }
        };
        
        this.currentCurrency = 'USD';
        this.expenseCategories = {
            food: '🍕',
            transport: '🚗',
            housing: '🏠',
            utilities: '⚡',
            entertainment: '🎮',
            healthcare: '🏥',
            shopping: '🛍️',
            other: '📝'
        };
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.bindEvents();
        this.updateDisplay();
        this.updateCurrency();
        this.addExportButtons();
    }
    
    addExportButtons() {
        // Add export buttons to the header
        const header = document.querySelector('.header');
        const exportDiv = document.createElement('div');
        exportDiv.className = 'export-buttons';
        exportDiv.innerHTML = `
            <div class="export-controls">
                <button onclick="moneyPlanner.exportToJSON()" class="btn-export" title="Download as JSON">
                    📁 Export JSON
                </button>
                <button onclick="moneyPlanner.exportToCSV()" class="btn-export" title="Download as CSV">
                    📊 Export CSV
                </button>
                <button onclick="moneyPlanner.copyForGoogleSheets()" class="btn-export" title="Copy for Google Sheets">
                    📋 Copy Data
                </button>
                <button onclick="window.print()" class="btn-export" title="Print/Save as PDF">
                    🖨️ Print/PDF
                </button>
                <input type="file" id="importFile" accept=".json" style="display: none;" onchange="moneyPlanner.importFromJSON(event)">
                <button onclick="document.getElementById('importFile').click()" class="btn-export" title="Import JSON file">
                    📂 Import
                </button>
            </div>
        `;
        
        // Add CSS for export buttons
        const style = document.createElement('style');
        style.textContent = `
            .export-controls {
                display: flex;
                gap: 0.5rem;
                flex-wrap: wrap;
                margin-top: 1rem;
            }
            
            .btn-export {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 8px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                font-size: 0.9rem;
                cursor: pointer;
                transition: all 0.3s ease;
                white-space: nowrap;
            }
            
            .btn-export:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            }
            
            @media (max-width: 768px) {
                .export-controls {
                    justify-content: center;
                }
                .btn-export {
                    font-size: 0.8rem;
                    padding: 0.4rem 0.8rem;
                }
            }
            
            @media print {
                .header .export-controls,
                .input-section,
                .btn-primary,
                .btn-secondary,
                .btn-accent {
                    display: none !important;
                }
                
                body {
                    background: white !important;
                }
                
                .card, .progress-card, .transactions-section, .expense-breakdown {
                    background: white !important;
                    box-shadow: none !important;
                    border: 1px solid #ddd !important;
                }
            }
        `;
        document.head.appendChild(style);
        
        const currencySelector = header.querySelector('.currency-selector');
        currencySelector.parentNode.insertBefore(exportDiv, currencySelector.nextSibling);
    }
    
    bindEvents() {
        // Currency change
        document.getElementById('currency').addEventListener('change', (e) => {
            this.currentCurrency = e.target.value;
            this.updateDisplay();
            this.saveData();
        });
        
        // Enter key support for inputs
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const target = e.target;
                if (target.id === 'incomeAmount' || target.id === 'incomeSource') {
                    this.addIncome();
                } else if (target.id === 'expenseAmount') {
                    this.addExpense();
                } else if (target.id === 'goalAmount' || target.id === 'budgetAmount') {
                    this.setGoals();
                }
            }
        });
        
        // Auto-save every 30 seconds
        setInterval(() => {
            this.saveData();
        }, 30000);
    }
    
    formatCurrency(amount) {
        const currency = this.currencies[this.currentCurrency];
        const formatter = new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        
        return `${currency.symbol}${formatter.format(Math.abs(amount))}`;
    }
    
    addIncome() {
        const amountInput = document.getElementById('incomeAmount');
        const sourceInput = document.getElementById('incomeSource');
        
        const amount = parseFloat(amountInput.value);
        const source = sourceInput.value.trim();
        
        if (!amount || amount <= 0) {
            this.showError('Please enter a valid income amount');
            return;
        }
        
        if (!source) {
            this.showError('Please enter an income source');
            return;
        }
        
        // Add transaction
        const transaction = {
            id: Date.now(),
            type: 'income',
            amount: amount,
            description: source,
            date: new Date().toISOString(),
            category: 'income'
        };
        
        this.data.transactions.unshift(transaction);
        this.data.currentBalance += amount;
        this.data.monthlyIncome += amount;
        
        // Clear inputs
        amountInput.value = '';
        sourceInput.value = '';
        
        this.updateDisplay();
        this.showSuccess('Income added successfully!');
        this.saveData();
    }
    
    addExpense() {
        const amountInput = document.getElementById('expenseAmount');
        const categorySelect = document.getElementById('expenseCategory');
        
        const amount = parseFloat(amountInput.value);
        const category = categorySelect.value;
        
        if (!amount || amount <= 0) {
            this.showError('Please enter a valid expense amount');
            return;
        }
        
        // Add transaction
        const transaction = {
            id: Date.now(),
            type: 'expense',
            amount: amount,
            description: `${this.expenseCategories[category]} ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            date: new Date().toISOString(),
            category: category
        };
        
        this.data.transactions.unshift(transaction);
        this.data.currentBalance -= amount;
        this.data.monthlyExpenses += amount;
        
        // Update expense categories
        if (!this.data.expenses[category]) {
            this.data.expenses[category] = 0;
        }
        this.data.expenses[category] += amount;
        
        // Clear inputs
        amountInput.value = '';
        
        this.updateDisplay();
        this.showSuccess('Expense added successfully!');
        this.saveData();
    }
    
    setGoals() {
        const goalInput = document.getElementById('goalAmount');
        const budgetInput = document.getElementById('budgetAmount');
        
        const savingsGoal = parseFloat(goalInput.value);
        const budgetLimit = parseFloat(budgetInput.value);
        
        if (savingsGoal && savingsGoal > 0) {
            this.data.savingsGoal = savingsGoal;
        }
        
        if (budgetLimit && budgetLimit > 0) {
            this.data.budgetLimit = budgetLimit;
        }
        
        if (!savingsGoal && !budgetLimit) {
            this.showError('Please enter at least one goal');
            return;
        }
        
        // Clear inputs
        goalInput.value = '';
        budgetInput.value = '';
        
        this.updateDisplay();
        this.showSuccess('Goals updated successfully!');
        this.saveData();
    }
    
    updateDisplay() {
        this.updateOverviewCards();
        this.updateProgressBars();
        this.updateTransactionsList();
        this.updateExpenseBreakdown();
    }
    
    updateOverviewCards() {
        document.getElementById('currentBalance').textContent = this.formatCurrency(this.data.currentBalance);
        document.getElementById('monthlyIncome').textContent = this.formatCurrency(this.data.monthlyIncome);
        document.getElementById('monthlyExpenses').textContent = this.formatCurrency(this.data.monthlyExpenses);
        document.getElementById('savingsGoal').textContent = this.formatCurrency(this.data.savingsGoal);
    }
    
    updateProgressBars() {
        // Budget progress
        const budgetProgress = document.getElementById('budgetProgress');
        const budgetText = document.getElementById('budgetText');
        
        if (this.data.budgetLimit > 0) {
            const budgetPercentage = Math.min((this.data.monthlyExpenses / this.data.budgetLimit) * 100, 100);
            budgetProgress.style.width = `${budgetPercentage}%`;
            budgetText.textContent = `${Math.round(budgetPercentage)}% of budget used`;
            
            // Change color based on usage
            if (budgetPercentage >= 90) {
                budgetProgress.style.background = 'linear-gradient(90deg, #f44336, #d32f2f)';
            } else if (budgetPercentage >= 75) {
                budgetProgress.style.background = 'linear-gradient(90deg, #ff9800, #f57c00)';
            } else {
                budgetProgress.style.background = 'linear-gradient(90deg, #FF5722, #FF9800)';
            }
        } else {
            budgetProgress.style.width = '0%';
            budgetText.textContent = 'Set a budget to track progress';
        }
        
        // Savings progress
        const savingsProgress = document.getElementById('savingsProgress');
        const savingsText = document.getElementById('savingsText');
        
        if (this.data.savingsGoal > 0) {
            const currentSavings = Math.max(0, this.data.currentBalance);
            const savingsPercentage = Math.min((currentSavings / this.data.savingsGoal) * 100, 100);
            savingsProgress.style.width = `${savingsPercentage}%`;
            savingsText.textContent = `${Math.round(savingsPercentage)}% of goal reached`;
        } else {
            savingsProgress.style.width = '0%';
            savingsText.textContent = 'Set a savings goal to track progress';
        }
    }
    
    updateTransactionsList() {
        const transactionList = document.getElementById('transactionList');
        
        if (this.data.transactions.length === 0) {
            transactionList.innerHTML = '<div class="no-transactions">No transactions yet. Add your first income or expense!</div>';
            return;
        }
        
        const recentTransactions = this.data.transactions.slice(0, 10);
        const transactionsHTML = recentTransactions.map(transaction => {
            const date = new Date(transaction.date).toLocaleDateString();
            const isIncome = transaction.type === 'income';
            const amountClass = isIncome ? 'positive' : 'negative';
            const sign = isIncome ? '+' : '-';
            
            return `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <span class="transaction-type ${transaction.type}">${transaction.type}</span>
                        <div>
                            <div class="transaction-desc">${transaction.description}</div>
                            <div class="transaction-desc" style="font-size: 0.8rem;">${date}</div>
                        </div>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${sign}${this.formatCurrency(transaction.amount)}
                    </div>
                </div>
            `;
        }).join('');
        
        transactionList.innerHTML = transactionsHTML;
    }
    
    updateExpenseBreakdown() {
        const expenseBreakdown = document.getElementById('expenseBreakdown');
        
        if (Object.keys(this.data.expenses).length === 0) {
            expenseBreakdown.innerHTML = '<div class="no-expenses">No expenses recorded yet</div>';
            return;
        }
        
        const categoriesHTML = Object.entries(this.data.expenses)
            .sort(([,a], [,b]) => b - a)
            .map(([category, amount]) => {
                const percentage = this.data.monthlyExpenses > 0 
                    ? ((amount / this.data.monthlyExpenses) * 100).toFixed(1)
                    : 0;
                
                return `
                    <div class="category-item">
                        <div class="category-info">
                            <span class="category-emoji">${this.expenseCategories[category]}</span>
                            <span class="category-name">${category}</span>
                            <span class="category-percentage">(${percentage}%)</span>
                        </div>
                        <div class="category-amount">${this.formatCurrency(amount)}</div>
                    </div>
                `;
            }).join('');
        
        expenseBreakdown.innerHTML = categoriesHTML;
    }
    
    updateCurrency() {
        const currencySelect = document.getElementById('currency');
        currencySelect.value = this.currentCurrency;
    }
    
    // SAVE/EXPORT METHODS
    
    saveData() {
        try {
            const dataToSave = {
                ...this.data,
                currentCurrency: this.currentCurrency,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('moneyPlannerData', JSON.stringify(dataToSave));
            console.log('Data saved to localStorage');
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    loadData() {
        try {
            const savedData = localStorage.getItem('moneyPlannerData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.data = {
                    currentBalance: parsedData.currentBalance || 0,
                    monthlyIncome: parsedData.monthlyIncome || 0,
                    monthlyExpenses: parsedData.monthlyExpenses || 0,
                    savingsGoal: parsedData.savingsGoal || 0,
                    budgetLimit: parsedData.budgetLimit || 0,
                    transactions: parsedData.transactions || [],
                    expenses: parsedData.expenses || {}
                };
                this.currentCurrency = parsedData.currentCurrency || 'USD';
                console.log('Data loaded from localStorage');
                this.showSuccess('Previous data loaded successfully!');
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    exportToJSON() {
        const dataToExport = {
            ...this.data,
            currentCurrency: this.currentCurrency,
            exportDate: new Date().toISOString(),
            appVersion: '1.0'
        };
        
        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `money-planner-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showSuccess('Budget data exported as JSON!');
    }
    
    exportToCSV() {
        if (this.data.transactions.length === 0) {
            this.showError('No transactions to export');
            return;
        }
        
        // Create CSV content
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency'];
        const csvContent = [
            headers.join(','),
            ...this.data.transactions.map(transaction => [
                new Date(transaction.date).toLocaleDateString(),
                transaction.type,
                transaction.category,
                `"${transaction.description}"`,
                transaction.amount,
                this.currentCurrency
            ].join(','))
        ].join('\n');
        
        // Add summary at the end
        const summary = [
            '',
            'SUMMARY',
            `Total Income,${this.data.monthlyIncome}`,
            `Total Expenses,${this.data.monthlyExpenses}`,
            `Current Balance,${this.data.currentBalance}`,
            `Savings Goal,${this.data.savingsGoal}`,
            `Budget Limit,${this.data.budgetLimit}`
        ].join('\n');
        
        const fullCSV = csvContent + summary;
        
        const dataBlob = new Blob([fullCSV], { type: 'text/csv' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `money-planner-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showSuccess('Budget data exported as CSV!');
    }
    
    copyForGoogleSheets() {
        if (this.data.transactions.length === 0) {
            this.showError('No data to copy');
            return;
        }
        
        // Create tab-separated format for Google Sheets
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency'];
        const sheetData = [
            headers.join('\t'),
            ...this.data.transactions.map(transaction => [
                new Date(transaction.date).toLocaleDateString(),
                transaction.type,
                transaction.category,
                transaction.description,
                transaction.amount,
                this.currentCurrency
            ].join('\t')),
            '',
            'SUMMARY',
            `Total Income\t${this.data.monthlyIncome}`,
            `Total Expenses\t${this.data.monthlyExpenses}`,
            `Current Balance\t${this.data.currentBalance}`,
            `Savings Goal\t${this.data.savingsGoal}`,
            `Budget Limit\t${this.data.budgetLimit}`
        ].join('\n');
        
        navigator.clipboard.writeText(sheetData).then(() => {
            this.showSuccess('Data copied! Paste in Google Sheets (Ctrl+V)');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = sheetData;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showSuccess('Data copied! Paste in Google Sheets (Ctrl+V)');
        });
    }
    
    importFromJSON(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate data structure
                if (importedData.transactions && Array.isArray(importedData.transactions)) {
                    this.data = {
                        currentBalance: importedData.currentBalance || 0,
                        monthlyIncome: importedData.monthlyIncome || 0,
                        monthlyExpenses: importedData.monthlyExpenses || 0,
                        savingsGoal: importedData.savingsGoal || 0,
                        budgetLimit: importedData.budgetLimit || 0,
                        transactions: importedData.transactions || [],
                        expenses: importedData.expenses || {}
                    };
                    
                    if (importedData.currentCurrency) {
                        this.currentCurrency = importedData.currentCurrency;
                    }
                    
                    this.updateDisplay();
                    this.updateCurrency();
                    this.saveData();
                    this.showSuccess('Data imported successfully!');
                } else {
                    this.showError('Invalid file format');
                }
            } catch (error) {
                this.showError('Error reading file');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        
        // Reset input
        event.target.value = '';
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success');
    }
    
    showError(message) {
        this.showNotification(message, 'error');
    }
    
    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        if (type === 'success') {
            notification.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
        } else {
            notification.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    // Utility method to reset all data
    resetData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            this.data = {
                currentBalance: 0,
                monthlyIncome: 0,
                monthlyExpenses: 0,
                savingsGoal: 0,
                budgetLimit: 0,
                transactions: [],
                expenses: {}
            };
            this.updateDisplay();
            this.showSuccess('All data has been reset');
            this.saveData();
        }
    }
}

// Global functions for HTML onclick events
function addIncome() {
    window.moneyPlanner.addIncome();
}

function addExpense() {
    window.moneyPlanner.addExpense();
}

function setGoals() {
    window.moneyPlanner.setGoals();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.moneyPlanner = new MoneyPlanner();
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to reset data
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        window.moneyPlanner.resetData();
    }
    
    // Ctrl/Cmd + S to save/export
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        window.moneyPlanner.exportToJSON();
    }
    
    // Ctrl/Cmd + E to export CSV
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        window.moneyPlanner.exportToCSV();
    }
});