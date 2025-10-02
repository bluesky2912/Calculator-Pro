let currentExpression = '';
let result = '0';
let history = [];
let isDarkMode = true;

const expressionDisplay = document.getElementById('expression');
const resultDisplay = document.getElementById('result');
const historyList = document.getElementById('history-list');

// Function to update the calculator's main display
function updateDisplay() {
    expressionDisplay.textContent = currentExpression;
    resultDisplay.textContent = result;
}

// Function to create a ripple animation on button click
function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.classList.add('ripple');
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// Global functions exposed to HTML (onclick attributes)
function appendNumber(num) {
    if (result !== '0' && currentExpression === '') {
        currentExpression = result;
    }
    currentExpression += num;
    updateDisplay();
}

function appendOperator(op) {
    if (currentExpression === '' && result !== '0') {
        currentExpression = result;
    }
    // Simple logic to prevent starting with an operator unless it's a parenthesis
    const lastChar = currentExpression.slice(-1);
    const isLastCharOperator = lastChar === '+' || lastChar === '-' || lastChar === '*' || lastChar === '/';
    
    if (currentExpression !== '' && !isLastCharOperator) {
        currentExpression += op;
    } else if (op === '(' || op === ')') {
        currentExpression += op;
    }
    updateDisplay();
}

function appendFunction(func) {
    if (result !== '0' && currentExpression === '') {
        currentExpression = result;
    }
    currentExpression += func;
    updateDisplay();
}

function appendConstant(constant) {
    if (result !== '0' && currentExpression === '') {
        currentExpression = result;
    }
    let value = '';
    if (constant === 'π') {
        value = Math.PI.toFixed(10);
    } else if (constant === 'e') {
        value = Math.E.toFixed(10);
    }
    currentExpression += value;
    updateDisplay();
}

function clearAll() {
    currentExpression = '';
    result = '0';
    updateDisplay();
}

function clearEntry() {
    if (currentExpression.length > 0) {
        currentExpression = currentExpression.slice(0, -1);
        updateDisplay();
    }
}

function calculate() {
    if (currentExpression === '') return;

    try {
        let expression = currentExpression;
        
        // Replace user-friendly functions/symbols with Math equivalents
        expression = expression.replace(/π/g, 'Math.PI');
        expression = expression.replace(/e/g, 'Math.E');
        expression = expression.replace(/sqrt\(/g, 'Math.sqrt(');
        expression = expression.replace(/pow\(/g, 'Math.pow(');
        expression = expression.replace(/log\(/g, 'Math.log10(');
        expression = expression.replace(/ln\(/g, 'Math.log(');
        expression = expression.replace(/sin\(/g, 'Math.sin(');
        expression = expression.replace(/cos\(/g, 'Math.cos(');
        expression = expression.replace(/tan\(/g, 'Math.tan(');
        expression = expression.replace(/×/g, '*');
        expression = expression.replace(/÷/g, '/');
        
        // Simple fix for 'x²' used with the 'pow(' function: if it's 'pow(', assume the expression just before it is the base, and add ',2' for the exponent
        // This is a simplification and would need more robust parsing for a full scientific calculator.
        expression = expression.replace(/Math\.pow\(([^)]+)\)/g, 'Math.pow($1,2)');
        
        const calculatedResult = eval(expression);
        
        if (isNaN(calculatedResult) || !isFinite(calculatedResult)) {
            throw new Error('Invalid calculation');
        }

        result = parseFloat(calculatedResult.toFixed(10)).toString();
        
        // Add to history
        addToHistory(currentExpression, result);
        
        currentExpression = '';
        updateDisplay();
        
        // Add success animation
        resultDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            resultDisplay.style.transform = 'scale(1)';
        }, 200);
        
    } catch (error) {
        result = 'Error';
        updateDisplay();
        
        // Add error animation
        resultDisplay.style.color = '#e74c3c';
        setTimeout(() => {
            result = '0';
            currentExpression = '';
            resultDisplay.style.color = '';
            updateDisplay();
        }, 2000);
    }
}

function addToHistory(expression, result) {
    const historyItem = {
        expression: expression,
        result: result,
        timestamp: new Date().toLocaleTimeString()
    };
    
    history.unshift(historyItem);
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">No calculations yet</div>';
        return;
    }

    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="useHistoryResult('${item.result}')" style="animation-delay: ${index * 0.1}s">
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">= ${item.result}</div>
        </div>
    `).join('');
}

function useHistoryResult(historyResult) {
    // Escape single quotes for use in HTML onclick
    const cleanResult = historyResult.replace(/'/g, "\\'"); 
    result = cleanResult;
    currentExpression = '';
    updateDisplay();
    
    // Add selection animation
    resultDisplay.style.transform = 'scale(1.05)';
    setTimeout(() => {
        resultDisplay.style.transform = 'scale(1)';
    }, 200);
}

function clearHistory() {
    history = [];
    updateHistoryDisplay();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light', !isDarkMode);
    document.querySelector('.theme-toggle').textContent = isDarkMode ? '☀️' : '🌙';
}

// Initialization and Event Listeners

document.addEventListener('DOMContentLoaded', () => {
    // Add ripple effect to all buttons
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', createRipple);
    });

    // Enhanced keyboard support
    document.addEventListener('keydown', function(event) {
        // Prevent default action (e.g., spacebar scrolling, browser shortcuts)
        event.preventDefault(); 
        
        const key = event.key;
        
        // Find the button with a matching data-key
        const button = document.querySelector(`[data-key="${key.replace(' ', 'Space')}"], [data-key="${key.toLowerCase()}"]`);

        // Add visual feedback for key presses
        if (button) {
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 100);
        }

        // Logic for key presses
        if (key >= '0' && key <= '9' || key === '.') {
            appendNumber(key);
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            appendOperator(key);
        } else if (key === '(' || key === ')') {
            appendOperator(key);
        } else if (key === 'Enter' || key === '=') {
            calculate();
        } else if (key === 'Escape') {
            clearAll();
        } else if (key === 'Backspace') {
            clearEntry();
        } else if (key.toLowerCase() === 'q') {
            appendFunction('sqrt(');
        } else if (key === '^') {
            appendFunction('pow(');
        } else if (key.toLowerCase() === 'l') {
            appendFunction('log(');
        } else if (key.toLowerCase() === 's') {
            appendFunction('sin(');
        } else if (key.toLowerCase() === 'c') {
            appendFunction('cos(');
        } else if (key.toLowerCase() === 't') {
            appendFunction('tan(');
        } else if (key.toLowerCase() === 'n') {
            appendFunction('ln(');
        } else if (key.toLowerCase() === 'p') {
            appendConstant('π');
        } else if (key.toLowerCase() === 'e') {
            appendConstant('e');
        }
    });

    // Initial setup
    updateDisplay();
    updateHistoryDisplay();
    
    // Add smooth transitions to display elements
    resultDisplay.style.transition = 'all 0.3s ease';
    expressionDisplay.style.transition = 'all 0.3s ease';
});