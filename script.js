// Simple calculator logic
(() => {
  const displayEl = document.getElementById('display');
  const calculator = document.getElementById('calculator');
  let current = '0';
  let overwrite = true;

  const setDisplay = (value) => {
    // limit length for display
    if (String(value).length > 20) {
      displayEl.textContent = String(value).slice(0, 20) + '…';
    } else {
      displayEl.textContent = String(value);
    }
  };

  const inputDigit = (digit) => {
    if (overwrite) {
      current = digit === '.' ? '0.' : String(digit);
      overwrite = false;
    } else {
      // prevent multiple leading zeros
      if (current === '0' && digit === '0') return;
      // prevent multiple decimals
      if (digit === '.' && current.includes('.')) return;
      current = current + String(digit);
    }
    setDisplay(current);
  };

  const performCalculate = () => {
    // Basic validation: allow digits, operators, decimal, parenthesis, percent, spaces
    const safe = /^[0-9+\-*/().% \t]+$/;
    let expr = current.replace(/×/g, '*').replace(/÷/g, '/').trim();

    // convert percent (e.g., "50%") into "/100"
    expr = expr.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    if (!safe.test(expr)) {
      setDisplay('Error');
      overwrite = true;
      return;
    }

    try {
      // Use Function to evaluate expression instead of eval (slightly safer)
      // Note: This is still evaluating JS expressions, so avoid running untrusted input.
      // For a production app use a proper expression parser.
      const result = Function('"use strict"; return (' + expr + ')')();
      current = (Number.isFinite(result)) ? String(result) : 'Error';
      setDisplay(current);
      overwrite = true;
    } catch (e) {
      setDisplay('Error');
      overwrite = true;
    }
  };

  const clearAll = () => {
    current = '0';
    overwrite = true;
    setDisplay(current);
  };

  const backspace = () => {
    if (overwrite || current.length <= 1) {
      current = '0';
      overwrite = true;
    } else {
      current = current.slice(0, -1);
    }
    setDisplay(current);
  };

  // Handle button clicks
  calculator.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const val = btn.dataset.value;
    const action = btn.dataset.action;

    if (action === 'calculate') {
      performCalculate();
      return;
    }

    if (action === 'clear') {
      clearAll();
      return;
    }

    if (action === 'back') {
      backspace();
      return;
    }

    if (action === 'percent') {
      // append percent to current number if valid
      if (overwrite) {
        current = '0%';
        overwrite = false;
      } else if (!current.endsWith('%')) {
        current = current + '%';
      }
      setDisplay(current);
      return;
    }

    if (val !== undefined) {
      // Normal key (digit, operator, decimal)
      // If an operator is clicked after a result, allow chaining
      const isOperator = /[+\-*/]/.test(val);
      if (isOperator && overwrite && current !== '0') {
        // continue from current (allows chaining results)
        overwrite = false;
      }
      inputDigit(val);
    }
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') {
      inputDigit(e.key);
      e.preventDefault();
      return;
    }

    if (e.key === '.') {
      inputDigit('.');
      e.preventDefault();
      return;
    }

    if (['+', '-', '*', '/','(',')'].includes(e.key)) {
      inputDigit(e.key);
      e.preventDefault();
      return;
    }

    if (e.key === 'Enter' || e.key === '=') {
      performCalculate();
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace') {
      backspace();
      e.preventDefault();
      return;
    }

    if (e.key === 'Escape') {
      clearAll();
      e.preventDefault();
      return;
    }

    if (e.key === '%') {
      // append percent
      if (overwrite) {
        current = '0%';
        overwrite = false;
      } else if (!current.endsWith('%')) {
        current = current + '%';
      }
      setDisplay(current);
      e.preventDefault();
      return;
    }
  });

  // initialize
  setDisplay(current);
})();