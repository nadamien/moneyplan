// Money Planner Application
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
    }
    
    bindEvents() {
        // Currency change
        document.getElementById('currency').addEventListener('change', (e) => {
            this.currentCurrency = e.target.value;
            this.updateDisplay();
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
    
    saveData() {
        // In a real app, this would save to localStorage or a database
        // For this demo, we'll just keep data in memory
        console.log('Data saved:', this.data);
    }
    
    loadData() {
        // In a real app, this would load from localStorage or a database
        // For this demo, we'll start with empty data
        console.log('Data loaded');
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
    
    // Add some demo data for demonstration
    setTimeout(() => {
        // Uncomment the lines below to add demo data
        /*
        window.moneyPlanner.data.currentBalance = 1500;
        window.moneyPlanner.data.monthlyIncome = 3000;
        window.moneyPlanner.data.monthlyExpenses = 1800;
        window.moneyPlanner.data.savingsGoal = 5000;
        window.moneyPlanner.data.budgetLimit = 2000;
        window.moneyPlanner.data.transactions = [
            {
                id: 1,
                type: 'income',
                amount: 3000,
                description: 'Monthly Salary',
                date: new Date().toISOString(),
                category: 'income'
            },
            {
                id: 2,
                type: 'expense',
                amount: 800,
                description: '🏠 Housing',
                date: new Date().toISOString(),
                category: 'housing'
            },
            {
                id: 3,
                type: 'expense',
                amount: 300,
                description: '🍕 Food',
                date: new Date().toISOString(),
                category: 'food'
            }
        ];
        window.moneyPlanner.data.expenses = {
            housing: 800,
            food: 300,
            transport: 200
        };
        window.moneyPlanner.updateDisplay();
        */
    }, 1000);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R to reset data
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        window.moneyPlanner.resetData();
    }
});