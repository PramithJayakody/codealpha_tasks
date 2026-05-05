document.addEventListener('DOMContentLoaded', () => {
    const currentInputDisplay = document.getElementById('current-input');
    const historyDisplay = document.getElementById('history');
    const modeIndicator = document.getElementById('mode-indicator');
    const stackIndicator = document.getElementById('stack-indicator');
    const degBtn = document.getElementById('deg-btn');
    const buttons = document.querySelectorAll('.btn');

    let currentInput = '0';
    let previousInput = '';
    let operation = null;
    let shouldResetScreen = false;
    let isDegree = true;
    let stack = [];

    const formatNumber = (number) => {
        if (number === '-' || number === '' || number === 'Error') return number;
        
        // Handle scientific notation
        if (number.toString().includes('e')) return number.toString();
        
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        
        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    };

    const updateDisplay = () => {
        currentInputDisplay.textContent = formatNumber(currentInput);
        
        let historyText = '';
        if (operation != null) {
            let opSymbol = operation;
            if (opSymbol === '*') opSymbol = '×';
            if (opSymbol === '/') opSymbol = '÷';
            if (opSymbol === '^') opSymbol = 'xʸ';
            historyText = `${formatNumber(previousInput)} ${opSymbol}`;
        }
        historyDisplay.textContent = historyText;
        
        modeIndicator.textContent = isDegree ? 'DEG' : 'RAD';
        degBtn.textContent = isDegree ? 'DEG' : 'RAD';
        
        if (stack.length > 0) {
            stackIndicator.textContent = `( `.repeat(stack.length);
        } else {
            stackIndicator.textContent = '';
        }
    };

    const appendNumber = (number) => {
        if (shouldResetScreen) {
            currentInput = '';
            shouldResetScreen = false;
        }
        if (number === '.' && currentInput.includes('.')) return;
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            currentInput += number;
        }
    };

    const chooseOperation = (op) => {
        if (currentInput === '' && op === '-') {
            currentInput = '-';
            updateDisplay();
            return;
        }
        if (currentInput === '' && currentInput !== '-') return;
        if (previousInput !== '') {
            calculate();
        }
        operation = op;
        previousInput = currentInput;
        currentInput = '';
    };

    const factorial = (n) => {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    };

    const mathAction = (action) => {
        let val = parseFloat(currentInput);
        if (isNaN(val) && action !== 'pi' && action !== 'e') return;

        let result;
        const radFactor = isDegree ? (Math.PI / 180) : 1;

        switch(action) {
            case 'sin': result = Math.sin(val * radFactor); break;
            case 'cos': result = Math.cos(val * radFactor); break;
            case 'tan': result = Math.tan(val * radFactor); break;
            case 'log': result = Math.log10(val); break;
            case 'ln': result = Math.log(val); break;
            case 'x2': result = Math.pow(val, 2); break;
            case 'sqrt': result = Math.sqrt(val); break;
            case 'fact': result = factorial(val); break;
            case '1/x': result = 1 / val; break;
            case 'pi': result = Math.PI; break;
            case 'e': result = Math.E; break;
        }

        if (isNaN(result) || !isFinite(result)) {
            currentInput = 'Error';
            shouldResetScreen = true;
        } else {
            // Fix floating point issues for trig functions
            result = Math.round(result * 10000000000000) / 10000000000000;
            currentInput = result.toString();
            shouldResetScreen = true;
        }
    };

    const handleParen = (action) => {
        if (action === '(') {
            // Only push if there's an operation pending, or start fresh
            if (operation) {
                stack.push({ previousInput, operation });
            } else {
                stack.push({ previousInput: '0', operation: '+' }); // dummy to hold state
            }
            previousInput = '';
            operation = null;
            currentInput = '0';
        } else if (action === ')') {
            if (stack.length === 0) return;
            if (previousInput !== '') {
                calculate();
            }
            let state = stack.pop();
            let innerResult = parseFloat(currentInput);
            previousInput = state.previousInput;
            operation = state.operation;
            currentInput = innerResult.toString();
        }
    };

    const calculate = () => {
        let computation;
        const prev = parseFloat(previousInput);
        const current = parseFloat(currentInput);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        switch (operation) {
            case '+': computation = prev + current; break;
            case '-': computation = prev - current; break;
            case '*': computation = prev * current; break;
            case '/': 
                if (current === 0) {
                    currentInput = 'Error';
                    operation = null;
                    previousInput = '';
                    shouldResetScreen = true;
                    return;
                }
                computation = prev / current; 
                break;
            case '%': computation = prev % current; break;
            case '^': computation = Math.pow(prev, current); break;
            default: return;
        }
        
        // Handle floating point precision issues
        computation = Math.round(computation * 10000000000000) / 10000000000000;
        
        currentInput = computation.toString();
        operation = null;
        previousInput = '';
    };

    const clear = () => {
        currentInput = '0';
        previousInput = '';
        operation = null;
        stack = [];
    };

    const deleteNumber = () => {
        if (currentInput === 'Error') {
            clear();
            return;
        }
        if (shouldResetScreen) {
            currentInput = '0';
            return;
        }
        currentInput = currentInput.toString().slice(0, -1);
        if (currentInput === '' || currentInput === '-') {
            currentInput = '0';
        }
    };

    // Button click handlers
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            // Animation
            button.classList.add('btn-click-anim');
            setTimeout(() => {
                button.classList.remove('btn-click-anim');
            }, 200);

            // Logic
            if (button.classList.contains('number')) {
                appendNumber(button.dataset.value);
            } else if (button.dataset.action === 'operator') {
                chooseOperation(button.dataset.value);
            } else if (button.dataset.action === 'calculate') {
                calculate();
                
                // If there are unclosed parenthesis, close them all and calculate
                while(stack.length > 0) {
                    let state = stack.pop();
                    let innerResult = parseFloat(currentInput);
                    previousInput = state.previousInput;
                    operation = state.operation;
                    currentInput = innerResult.toString();
                    calculate();
                }

                shouldResetScreen = true;
            } else if (button.dataset.action === 'clear') {
                clear();
            } else if (button.dataset.action === 'delete') {
                deleteNumber();
            } else if (button.dataset.action === 'toggle-deg') {
                isDegree = !isDegree;
            } else if (button.dataset.action === 'math') {
                mathAction(button.dataset.value);
            } else if (button.dataset.action === 'paren') {
                handleParen(button.dataset.value);
            }
            updateDisplay();
        });
    });

    // Keyboard support
    window.addEventListener('keydown', (e) => {
        let key = e.key;
        
        let targetBtn = null;

        if (/[0-9\.]/.test(key)) {
            e.preventDefault();
            appendNumber(key);
            targetBtn = Array.from(buttons).find(b => b.dataset.value === key && b.classList.contains('number'));
        } else if (key === '+' || key === '-' || key === '*' || key === '/' || key === '%' || key === '^') {
            e.preventDefault();
            chooseOperation(key);
            targetBtn = Array.from(buttons).find(b => b.dataset.value === key && b.classList.contains('operator'));
        } else if (key === 'Enter' || key === '=') {
            e.preventDefault();
            calculate();
            while(stack.length > 0) {
                let state = stack.pop();
                let innerResult = parseFloat(currentInput);
                previousInput = state.previousInput;
                operation = state.operation;
                currentInput = innerResult.toString();
                calculate();
            }
            shouldResetScreen = true;
            targetBtn = Array.from(buttons).find(b => b.dataset.action === 'calculate');
        } else if (key === 'Backspace') {
            e.preventDefault();
            deleteNumber();
            targetBtn = Array.from(buttons).find(b => b.dataset.action === 'delete');
        } else if (key === 'Escape') {
            e.preventDefault();
            clear();
            targetBtn = Array.from(buttons).find(b => b.dataset.action === 'clear');
        } else if (key === '(' || key === ')') {
            e.preventDefault();
            handleParen(key);
            targetBtn = Array.from(buttons).find(b => b.dataset.value === key && b.classList.contains('paren'));
        }

        if (targetBtn) {
            targetBtn.classList.add('btn-click-anim');
            targetBtn.style.transform = 'scale(0.95)';
            targetBtn.style.background = getComputedStyle(targetBtn).getPropertyValue('--btn-active') || 'rgba(255,255,255,0.2)';
            
            setTimeout(() => {
                targetBtn.classList.remove('btn-click-anim');
                targetBtn.style.transform = '';
                targetBtn.style.background = '';
            }, 150);
        }

        updateDisplay();
    });

    // Initial display update
    updateDisplay();
});
