/**
 * Kalkulačka nadmořské výšky – hlavní logika
 * Výpočet výšky vzdáleného bodu na základě známé výšky, vzdálenosti a sklonu.
 */

(function () {
  'use strict';

  // ──── DOM References ────
  const h1El        = document.getElementById('h1');
  const distEl      = document.getElementById('dist');
  const slopeEl     = document.getElementById('slope');
  const resultEl    = document.getElementById('result');
  const resultEmpty = document.getElementById('resultEmpty');
  const calcBtn     = document.getElementById('calcBtn');

  // ──── Helpers ────

  /**
   * Parse a numeric input, tolerating Czech-style comma as decimal separator.
   */
  function parseInput(input) {
    return parseFloat((input.value || '').replace(',', '.'));
  }

  /**
   * Copy text to clipboard and provide visual feedback on the button.
   */
  function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      btn.classList.add('copied');
      btn.innerHTML = '<span class="copy-icon"><i class="ph-bold ph-check"></i></span> Zkopírováno';
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.innerHTML = '<span class="copy-icon"><i class="ph ph-clipboard"></i></span> Kopírovat výšku';
      }, 2000);
    }).catch(function () {
      // Fallback for older browsers / insecure contexts
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);

      btn.classList.add('copied');
      btn.innerHTML = '<span class="copy-icon"><i class="ph-bold ph-check"></i></span> Zkopírováno';
      setTimeout(function () {
        btn.classList.remove('copied');
        btn.innerHTML = '<span class="copy-icon"><i class="ph ph-clipboard"></i></span> Kopírovat výšku';
      }, 2000);
    });
  }

  /**
   * Show the result panel (hides the empty state).
   */
  function showResult(html, isError) {
    resultEl.classList.remove('error', 'visible');
    resultEmpty.classList.add('hidden');

    // Force reflow so the enter animation replays
    void resultEl.offsetWidth;

    if (isError) {
      resultEl.classList.add('error');
    }
    resultEl.innerHTML = html;
    resultEl.classList.add('visible');
  }

  // ──── Main Calculation ────

  function vypocitat() {
    var h1        = parseInput(h1El);
    var dist      = parseInput(distEl);
    var slope     = parseInput(slopeEl);
    var direction = document.querySelector('input[name="direction"]:checked').value;

    // Validation
    if (isNaN(h1) || isNaN(dist) || isNaN(slope)) {
      showResult(
        '<div class="result-value-box">' +
          '<div class="result-label">Chyba</div>' +
          '<div class="result-value"><i class="ph-bold ph-warning"></i> Vyplň všechna pole</div>' +
        '</div>',
        true
      );
      return;
    }

    if (dist < 0 || slope < 0) {
      showResult(
        '<div class="result-value-box">' +
          '<div class="result-label">Chyba</div>' +
          '<div class="result-value"><i class="ph-bold ph-warning"></i> Kladné hodnoty</div>' +
          '<div class="result-label">Vzdálenost a sklon musí být kladné (směr zvol přepínačem).</div>' +
        '</div>',
        true
      );
      return;
    }

    // Compute
    var deltaH = dist * (slope / 100);
    var h2     = direction === 'klesa' ? (h1 - deltaH) : (h1 + deltaH);

    var dirArrow = direction === 'klesa' ? '<i class="ph-bold ph-arrow-down"></i>' : '<i class="ph-bold ph-arrow-up"></i>';
    var dirText  = direction === 'klesa' ? 'klesá' : 'stoupá';
    var sign     = direction === 'klesa' ? '−' : '+';
    var h2Str    = h2.toFixed(3);

    showResult(
      '<div class="result-direction">' + dirArrow + ' ' + dirText + '</div>' +

      '<div class="result-steps">' +
        '<span class="step-line">Δh = <code>' + dist + ' m</code> × <code>' + slope + ' %</code> = <code>' + deltaH.toFixed(3) + ' m</code></span>' +
        '<span class="step-line"><code>' + h1.toFixed(3) + '</code> ' + sign + ' <code>' + deltaH.toFixed(3) + '</code> = <code>' + h2Str + '</code></span>' +
      '</div>' +

      '<div class="result-value-box">' +
        '<div class="result-label">Nadmořská výška hledaného bodu</div>' +
        '<div class="result-value" id="resultH2">' + h2Str + ' m n. m.</div>' +
        '<button type="button" class="btn-copy" id="copyBtn">' +
          '<span class="copy-icon"><i class="ph ph-clipboard"></i></span> Kopírovat výšku' +
        '</button>' +
      '</div>',
      false
    );

    // Bind copy handler
    document.getElementById('copyBtn').addEventListener('click', function () {
      copyToClipboard(h2Str, this);
    });
  }

  // ──── Event Binding ────

  calcBtn.addEventListener('click', vypocitat);

  // Enter key in any input triggers calculation
  [h1El, distEl, slopeEl].forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        vypocitat();
      }
    });
  });
})();
