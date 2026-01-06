// script.js — Calculator logic (vanilla JS, no eval)
// Clear separation between UI updates and evaluation logic

document.addEventListener('DOMContentLoaded', () => {
  const previousEl = document.getElementById('previous');
  const currentEl = document.getElementById('current');

  let previous = ''; // previous operand (string)
  let current = '0'; // current operand (string)
  let operator = null; // current operator (one of + − × ÷)
  let error = false; // error state (e.g., division by zero)

  // Utility: update the on-screen display
  function updateDisplay() {
    previousEl.textContent = previous ? `${previous} ${operator ?? ''}`.trim() : '';
    currentEl.textContent = current;
  }

  // Reset everything
  function allClear() {
    previous = '';
    current = '0';
    operator = null;
    error = false;
    updateDisplay();
  }

  // Delete last char from current input
  function deleteChar() {
    if (error) return;
    if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
      current = '0';
    } else {
      current = current.slice(0, -1);
    }
    updateDisplay();
  }

  // Append a number or decimal to current input (prevent multiple decimals)
  function appendNumber(num) {
    if (error) return;
    if (num === '.') {
      if (current.includes('.')) return; // prevent multiple decimals
      current += '.';
    } else {
      if (current === '0') current = num;
      else current += num;
    }
    updateDisplay();
  }

  // Convert current to percent (divide by 100)
  function applyPercent() {
    if (error) return;
    const value = parseFloat(current);
    current = String(value / 100);
    updateDisplay();
  }

  // When the user chooses an operator
  function chooseOperator(op) {
    if (error) return;

    // If there's an existing operator and a previous value, compute first
    if (operator && previous !== '') {
      const result = compute(previous, current, operator);
      if (result === null) return setError('Cannot divide by 0');
      previous = String(result);
      current = '0';
      operator = op;
      updateDisplay();
      return;
    }

    // Move current to previous and set operator
    operator = op;
    previous = current;
    current = '0';
    updateDisplay();
  }

  // Compute a op b (strings)
  function compute(aStr, bStr, op) {
    const a = parseFloat(aStr);
    const b = parseFloat(bStr);
    let res;
    switch (op) {
      case '+': res = a + b; break;
      case '−': res = a - b; break;
      case '×': res = a * b; break;
      case '÷':
        if (b === 0) return null;
        res = a / b;
        break;
      default: return b;
    }
    // Limit to reasonable precision
    return roundAccurately(res, 12);
  }

  // Round to avoid weird floating point results
  function roundAccurately(number, places) {
    return parseFloat(Number(number).toFixed(places));
  }

  // Show an error message and lock the calculator until AC
  function setError(message) {
    current = message;
    previous = '';
    operator = null;
    error = true;
    updateDisplay();
  }

  // Evaluate the expression (previous operator current)
  function evaluate() {
    if (error) return;
    if (!operator || previous === '') return;
    const result = compute(previous, current, operator);
    if (result === null) return setError('Cannot divide by 0');
    current = String(result);
    previous = '';
    operator = null;
    updateDisplay();
  }

  // Keyboard support
  function handleKey(e) {
    const key = e.key;
    if ((/^[0-9]$/).test(key)) appendNumber(key);
    else if (key === '.' ) appendNumber('.');
    else if (key === 'Backspace') deleteChar();
    else if (key === 'Escape') allClear();
    else if (key === 'Enter' || key === '=') evaluate();
    else if (key === '%' ) applyPercent();
    else if (key === '+') chooseOperator('+');
    else if (key === '-') chooseOperator('−');
    else if (key === '*' || key === 'x' || key === 'X') chooseOperator('×');
    else if (key === '/') chooseOperator('÷');
  }

  // Hook up button events
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.num !== undefined) appendNumber(btn.dataset.num);
      else if (btn.dataset.action === 'all-clear') allClear();
      else if (btn.dataset.action === 'delete') deleteChar();
      else if (btn.dataset.action === 'percent') applyPercent();
      else if (btn.dataset.action === 'equals') evaluate();
      else if (btn.dataset.op) chooseOperator(btn.dataset.op);
    });
  });

  // global keyboard listener
  window.addEventListener('keydown', handleKey);

  // Initialize
  allClear();
});
