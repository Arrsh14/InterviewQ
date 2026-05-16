// utils/generatePDF.js
// Generates a clean printable PDF of the interview results.
// Uses the browser's built-in window.print() — no external library needed.
// Opens a new window with a styled HTML report, then triggers print dialog.
// User can "Save as PDF" from the print dialog.

const generatePDF = ({
    userName      = "Candidate",
    role          = "General Interview",
    date          = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    questionsAnswered = 0,
    questionsTotal    = 5,
    overallScore      = 0,
    confidenceScore   = 0,
    communicationScore = 0,
    attentionScore    = 0,
    dimensionBars     = [],
    feedbackItems     = [],
    feedbackSummary   = "",
  }) => {
  
    // ── Score colour helper ───────────────────────────────────────────────────
    const scoreColor = (s) => {
      if (s >= 80) return "#2f8d46";
      if (s >= 60) return "#4a90d9";
      if (s >= 40) return "#f4a426";
      return "#e53935";
    };
  
    // ── Score label helper ────────────────────────────────────────────────────
    const scoreLabel = (s) => {
      if (s >= 80) return "Excellent";
      if (s >= 60) return "Good";
      if (s >= 40) return "Average";
      return "Needs Work";
    };
  
    // ── Build dimension rows HTML ─────────────────────────────────────────────
    const dimensionRows = dimensionBars.map((d) => `
      <div style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">
          <span style="color:#444;font-weight:600">${d.label}</span>
          <span style="color:${scoreColor(d.score)};font-weight:700">${d.score === 0 ? "—" : d.score + "%"}</span>
        </div>
        <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden">
          <div style="height:100%;width:${d.score}%;background:${d.color};border-radius:4px"></div>
        </div>
      </div>
    `).join("");
  
    // ── Build feedback cards HTML ─────────────────────────────────────────────
    const feedbackCards = feedbackItems.map((fb) => `
      <div style="background:${fb.bg};border:1px solid ${fb.border};border-radius:8px;padding:16px;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
          <span style="font-size:16px">${fb.icon}</span>
          <span style="font-size:14px;font-weight:700;color:${fb.color}">${fb.category}</span>
        </div>
        <p style="font-size:13px;color:#555;margin:0;line-height:1.7">${fb.point}</p>
      </div>
    `).join("");
  
    // ── Full PDF HTML ─────────────────────────────────────────────────────────
    const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>InterviewQ Report — ${userName}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700;800&display=swap');
  
      * { box-sizing: border-box; margin: 0; padding: 0; }
  
      body {
        font-family: 'Open Sans', 'Segoe UI', Arial, sans-serif;
        background: #fff;
        color: #2d2d2d;
        padding: 0;
      }
  
      /* ── Hide everything when not printing ── */
      .no-print { display: block; }
  
      @media print {
        .no-print { display: none !important; }
        body { padding: 0; }
        .page-break { page-break-before: always; }
      }
  
      .page {
        max-width: 800px;
        margin: 0 auto;
        padding: 40px 48px;
      }
  
      /* ── Header ── */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 20px;
        border-bottom: 3px solid #2f8d46;
        margin-bottom: 28px;
      }
      .logo {
        font-size: 24px;
        font-weight: 900;
        color: #1a1a1a;
      }
      .logo span { color: #2f8d46; }
      .report-meta { text-align: right; font-size: 12px; color: #888; line-height: 1.8; }
      .report-meta strong { color: #444; }
  
      /* ── Section title ── */
      .section-title {
        font-size: 16px;
        font-weight: 800;
        color: #1a1a1a;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-title::before {
        content: '';
        display: inline-block;
        width: 4px;
        height: 18px;
        border-radius: 2px;
        background: #2f8d46;
      }
      .section-title.blue::before   { background: #4a90d9; }
      .section-title.purple::before { background: #7b5ea7; }
      .section-title.orange::before { background: #f4a426; }
  
      /* ── Overall hero ── */
      .hero {
        background: #f5fdf8;
        border: 1px solid #b7e4c7;
        border-left: 5px solid #2f8d46;
        border-radius: 8px;
        padding: 24px 28px;
        display: flex;
        align-items: center;
        gap: 28px;
        margin-bottom: 28px;
      }
      .score-circle {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background: #eaf7ee;
        border: 3px solid #b7e4c7;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .score-circle .big { font-size: 28px; font-weight: 900; color: #2f8d46; line-height: 1; }
      .score-circle .sub { font-size: 11px; color: #aaa; font-weight: 600; }
      .hero-text h2 { font-size: 18px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
      .hero-text p  { font-size: 13px; color: #666; line-height: 1.6; }
  
      /* ── 4 score cards grid ── */
      .score-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 28px;
      }
      .score-card {
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        padding: 16px 14px;
        background: #fff;
      }
      .score-card .label {
        font-size: 10px;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 700;
        margin-bottom: 8px;
      }
      .score-card .value {
        font-size: 32px;
        font-weight: 900;
        line-height: 1;
        margin-bottom: 4px;
      }
      .score-card .unit { font-size: 13px; color: #aaa; }
      .score-card .bar-bg {
        height: 5px;
        background: #f0f0f0;
        border-radius: 3px;
        overflow: hidden;
        margin: 8px 0;
      }
      .score-card .bar-fill {
        height: 100%;
        border-radius: 3px;
      }
      .score-card .desc { font-size: 11px; color: #aaa; line-height: 1.5; }
      .score-card .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 700;
        margin-top: 6px;
      }
  
      /* ── Two column layout ── */
      .two-col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 18px;
        margin-bottom: 28px;
      }
  
      /* ── White card ── */
      .white-card {
        background: #fff;
        border: 1px solid #e8e8e8;
        border-radius: 8px;
        padding: 20px;
      }
  
      /* ── Feedback section ── */
      .feedback-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 16px;
      }
  
      /* ── Summary box ── */
      .summary-box {
        background: #f9f9f9;
        border: 1px dashed #ddd;
        border-radius: 8px;
        padding: 16px 20px;
        font-size: 13px;
        color: #555;
        line-height: 1.8;
        margin-top: 4px;
      }
  
      /* ── Footer ── */
      .footer {
        margin-top: 32px;
        padding-top: 16px;
        border-top: 1px solid #e8e8e8;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        color: #aaa;
      }
  
      /* ── Print button (only visible on screen) ── */
      .print-btn {
        display: block;
        margin: 24px auto;
        padding: 12px 32px;
        background: #2f8d46;
        color: #fff;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        font-family: 'Open Sans', sans-serif;
      }
      .print-btn:hover { background: #257a3c; }
    </style>
  </head>
  <body>
  
    <!-- Print button — only shows on screen, hidden when printing -->
    <div class="no-print" style="text-align:center;padding:20px;background:#f5f5f5;border-bottom:1px solid #e8e8e8">
      <p style="font-size:13px;color:#888;margin-bottom:12px">
        Click the button below to save as PDF, or press <strong>Cmd+P</strong> / <strong>Ctrl+P</strong>
      </p>
      <button class="print-btn" onclick="window.print()">
        📥 Save as PDF
      </button>
    </div>
  
    <div class="page">
  
      <!-- ── Header ── -->
      <div class="header">
        <div>
          <div class="logo">Interview<span>Q</span></div>
          <div style="font-size:11px;color:#aaa;margin-top:3px">AI Interview Performance Report</div>
        </div>
        <div class="report-meta">
          <div><strong>Candidate:</strong> ${userName}</div>
          <div><strong>Role:</strong> ${role}</div>
          <div><strong>Date:</strong> ${date}</div>
          <div><strong>Questions:</strong> ${questionsAnswered} of ${questionsTotal} answered</div>
        </div>
      </div>
  
      <!-- ── Overall score hero ── -->
      <div class="hero">
        <div class="score-circle">
          <span class="big">${overallScore}</span>
          <span class="sub">/100</span>
        </div>
        <div class="hero-text">
          <h2>${overallScore >= 80 ? "Outstanding Performance! 🌟" : overallScore >= 60 ? "Good Performance! 👍" : overallScore >= 40 ? "Room to grow — practice makes perfect! 📈" : "Keep Practising — You'll Get There! 💪"}</h2>
          <p>
            You scored <strong>${overallScore}/100</strong> overall across all evaluation dimensions.
            Confidence: <strong style="color:${scoreColor(confidenceScore)}">${confidenceScore}/100</strong> ·
            Communication: <strong style="color:${scoreColor(communicationScore)}">${communicationScore}/100</strong> ·
            Attention: <strong style="color:${scoreColor(attentionScore)}">${attentionScore}/100</strong>
          </p>
        </div>
      </div>
  
      <!-- ── 4 Score cards ── -->
      <div class="section-title">Performance Scores</div>
      <div class="score-grid">
  
        ${[
          { label: "Overall Score",       value: overallScore,       color: "#2f8d46", desc: "Composite score across all dimensions."         },
          { label: "Confidence Score",    value: confidenceScore,    color: "#4a90d9", desc: "Vocal steadiness and assertive delivery."        },
          { label: "Communication Score", value: communicationScore, color: "#7b5ea7", desc: "Clarity, structure and answer relevance."        },
          { label: "Attention Score",     value: attentionScore,     color: "#f4a426", desc: "Eye contact and facial engagement."              },
        ].map(({ label, value, color, desc }) => `
          <div class="score-card" style="border-top:3px solid ${color}">
            <div class="label">${label}</div>
            <div class="value" style="color:${color}">${value}<span class="unit">/100</span></div>
            <div class="bar-bg">
              <div class="bar-fill" style="width:${value}%;background:${color}"></div>
            </div>
            <div class="desc">${desc}</div>
            <div class="badge" style="background:${color}22;color:${color}">${scoreLabel(value)}</div>
          </div>
        `).join("")}
  
      </div>
  
      <!-- ── Dimension Scores ── -->
      <div class="two-col">
        <div class="white-card">
          <div class="section-title">Dimension Scores</div>
          ${dimensionRows || `<p style="font-size:12px;color:#aaa;text-align:center;padding:20px 0">No dimension data yet</p>`}
        </div>
  
        <div class="white-card">
          <div class="section-title blue">Score Summary</div>
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead>
              <tr style="background:#f9f9f9">
                <th style="text-align:left;padding:8px 10px;color:#888;font-weight:600;border-bottom:1px solid #e8e8e8">Metric</th>
                <th style="text-align:right;padding:8px 10px;color:#888;font-weight:600;border-bottom:1px solid #e8e8e8">Score</th>
                <th style="text-align:right;padding:8px 10px;color:#888;font-weight:600;border-bottom:1px solid #e8e8e8">Rating</th>
              </tr>
            </thead>
            <tbody>
              ${[
                ["Overall",       overallScore],
                ["Confidence",    confidenceScore],
                ["Communication", communicationScore],
                ["Attention",     attentionScore],
              ].map(([name, val]) => `
                <tr style="border-bottom:1px solid #f5f5f5">
                  <td style="padding:8px 10px;color:#444">${name}</td>
                  <td style="padding:8px 10px;text-align:right;font-weight:700;color:${scoreColor(val)}">${val}/100</td>
                  <td style="padding:8px 10px;text-align:right">
                    <span style="background:${scoreColor(val)}22;color:${scoreColor(val)};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700">${scoreLabel(val)}</span>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
  
      <!-- ── AI Feedback Report ── -->
      <div class="section-title purple" style="margin-bottom:14px">AI Feedback Report</div>
      <div class="feedback-grid">
        ${feedbackCards}
      </div>
  
      ${feedbackSummary ? `
        <div class="summary-box">
          <strong>📝 AI Summary:</strong> ${feedbackSummary}
        </div>
      ` : ""}
  
      <!-- ── Footer ── -->
      <div class="footer">
        <span>InterviewQ · AI Interview Evaluation Framework</span>
        <span>Generated on ${new Date().toLocaleString("en-IN")}</span>
        <span>Candidate: ${userName}</span>
      </div>
  
    </div>
  
    <script>
      // Auto-trigger print after fonts load
      window.onload = () => {
        // Small delay so fonts render properly before print
        setTimeout(() => {
          // Don't auto-print — let user click the button
        }, 500);
      };
    </script>
  
  </body>
  </html>
    `;
  
    // ── Open in new window and trigger print ─────────────────────────────────
    const printWindow = window.open("", "_blank", "width=900,height=700");
    printWindow.document.write(html);
    printWindow.document.close();
  };
  
  export default generatePDF;