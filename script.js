let display = document.getElementById('display');
let currentValue = '0';
let previousValue = '';
let operator = null;
let shouldResetDisplay = false;
let lastOperator = null;
let lastOperand = null;

// 계산 기록 관련
let history = [];
let historyDisplay = document.getElementById('history');
const MAX_HISTORY = 10;

function appendNumber(num) {
    if (shouldResetDisplay) {
        currentValue = num;
        shouldResetDisplay = false;
    } else {
        if (currentValue === '0' && num !== '.') {
            currentValue = num;
        } else if (num === '.') {
            if (!currentValue.includes('.')) {
                currentValue += num;
            }
        } else {
            currentValue += num;
        }
    }
    updateDisplay();
}

function appendOperator(op) {
    if (currentValue === 'Error') {
        clearDisplay();
    }

    if (operator !== null && !shouldResetDisplay) {
        calculate();
    }
    previousValue = currentValue;
    operator = op;
    shouldResetDisplay = true;
}

function calculate() {
    if (operator === null) {
        if (lastOperator !== null && lastOperand !== null) {
            previousValue = currentValue;
            operator = lastOperator;
            currentValue = lastOperand;
        } else {
            return;
        }
    } else if (shouldResetDisplay) {
        return;
    }

    let result;
    const prev = parseFloat(previousValue);
    const current = parseFloat(currentValue);

    switch (operator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '×':
            result = prev * current;
            break;
        case '÷':
            if (current === 0) {
                showError('0으로 나눌 수 없습니다');
                return;
            }
            result = prev / current;
            break;
        default:
            return;
    }

    // 계산 기록에 추가
    const calculation = `${formatNumber(prev)} ${operator} ${formatNumber(current)} = ${formatNumber(result)}`;
    addToHistory(calculation);

    lastOperator = operator;
    lastOperand = current;
    currentValue = formatNumber(result);
    operator = null;
    shouldResetDisplay = true;
    updateDisplay();
}

function toggleSign() {
    if (currentValue === '0' || currentValue === 'Error') return;
    currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`;
    updateDisplay();
}

function calculatePercent() {
    if (currentValue === 'Error') return;
    currentValue = formatNumber(parseFloat(currentValue) / 100);
    updateDisplay();
}

function showError(message) {
    currentValue = 'Error';
    previousValue = '';
    operator = null;
    shouldResetDisplay = true;
    updateDisplay();
    setTimeout(() => {
        if (currentValue === 'Error') clearDisplay();
    }, 1400);
}

function formatNumber(value) {
    if (!Number.isFinite(value)) return 'Error';
    return Number.parseFloat(value.toFixed(10)).toString();
}

function clearDisplay() {
    currentValue = '0';
    previousValue = '';
    operator = null;
    shouldResetDisplay = false;
    lastOperator = null;
    lastOperand = null;
    updateDisplay();
}

function deleteLast() {
    if (shouldResetDisplay || currentValue === 'Error') {
        clearDisplay();
        return;
    }
    if (currentValue.length > 1) {
        currentValue = currentValue.slice(0, -1);
    } else {
        currentValue = '0';
    }
    updateDisplay();
}

function updateDisplay() {
    display.value = currentValue;
}

// 계산 기록 추가 함수
function addToHistory(calculation) {
    history.unshift(calculation); // 최신 계산을 맨 앞에 추가
    
    // 최대 개수 초과 시 가장 오래된 기록 제거
    if (history.length > MAX_HISTORY) {
        history.pop();
    }
    
    updateHistoryDisplay();
    // 브라우저 localStorage에도 저장
    localStorage.setItem('calcHistory', JSON.stringify(history));
}

// 계산 기록 표시 함수
function updateHistoryDisplay() {
    if (!historyDisplay) return;
    
    if (history.length === 0) {
        historyDisplay.innerHTML = '<div class="history-empty">계산 기록이 없습니다</div>';
        return;
    }
    
    let historyHTML = '<div class="history-title">📋 최근 계산</div>';
    history.forEach((item, index) => {
        historyHTML += `<div class="history-item" onclick="loadFromHistory(${index})">${item}</div>`;
    });
    historyHTML += '<button class="history-clear" onclick="clearHistory()">기록 삭제</button>';
    
    historyDisplay.innerHTML = historyHTML;
}

// 기록에서 값 불러오기
function loadFromHistory(index) {
    const calculationStr = history[index];
    const result = calculationStr.split('=')[1].trim();
    currentValue = result;
    shouldResetDisplay = true;
    updateDisplay();
}

// 계산 기록 초기화
function clearHistory() {
    if (confirm('계산 기록을 모두 삭제하시겠습니까?')) {
        history = [];
        updateHistoryDisplay();
        localStorage.removeItem('calcHistory');
    }
}

// 저장된 기록 로드 (페이지 새로고침 시)
function loadHistoryFromStorage() {
    const saved = localStorage.getItem('calcHistory');
    if (saved) {
        try {
            history = JSON.parse(saved);
            updateHistoryDisplay();
        } catch (e) {
            console.log('기록 로드 실패');
        }
    }
}

function handleKeyboard(event) {
    const key = event.key;
    if (/^[0-9.]$/.test(key)) appendNumber(key);
    else if (['+', '-', '*', '/'].includes(key)) appendOperator(key === '*' ? '×' : key === '/' ? '÷' : key);
    else if (key === 'Enter' || key === '=') calculate();
    else if (key === 'Escape') clearDisplay();
    else if (key === 'Backspace') deleteLast();
    else if (key === '%') calculatePercent();
    else return;
    event.preventDefault();
}

// 초기 설정
document.addEventListener('keydown', handleKeyboard);
updateDisplay();
loadHistoryFromStorage();
