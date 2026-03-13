import { useState, useMemo, useCallback, useEffect } from "react";

// ==================== DATA ====================
const ZONES = [
  { id: "latam", name: "LATAM", seats: 100, budget: 850000, countries: ["Brazil", "Mexico", "Argentina", "Colombia", "Chile"] },
];

const COUNTRY_SEATS = [
  { country: "Brazil", seats: 30, budget: 255000 },
  { country: "Mexico", seats: 25, budget: 212500 },
  { country: "Argentina", seats: 20, budget: 170000 },
  { country: "Colombia", seats: 15, budget: 127500 },
  { country: "Chile", seats: 10, budget: 85000 },
];

const COURSES = [
  { id: 1, name: "Strategic Leadership Accelerator", code: "SBN-SLA", investment: 12500, seats: 25, category: "Leadership", format: "In-Person", duration: "5 days", provider: "INSEAD", description: "Advanced strategic leadership program for future executives.", objective: "Develop strategic vision and transformational leadership capabilities.", skills: ["Strategic Thinking", "Change Management", "Executive Presence"], prereqs: { minMonthsCompany: 24, minMonthsDivision: 12, maxAge: 45, requiredCourse: null, divisionRange: null }, status: "Active" },
  { id: 2, name: "Digital Transformation Mastery", code: "SBN-DTM", investment: 9800, seats: 30, category: "Digital", format: "In-Person", duration: "4 days", provider: "MIT Sloan", description: "Immersion in digital transformation and technological innovation.", objective: "Empower leaders to drive digital transformation initiatives.", skills: ["Digital Strategy", "AI & Analytics", "Innovation"], prereqs: { minMonthsCompany: 18, minMonthsDivision: 6, maxAge: 50, requiredCourse: null, divisionRange: null }, status: "Active" },
  { id: 3, name: "Global Marketing Excellence", code: "SBN-GME", investment: 11200, seats: 20, category: "Marketing", format: "In-Person", duration: "4 days", provider: "HEC Paris", description: "Excellence program in global marketing and brand management.", objective: "Deepen strategic marketing competencies on a global scale.", skills: ["Brand Strategy", "Consumer Insights", "Market Analysis"], prereqs: { minMonthsCompany: 36, minMonthsDivision: 18, maxAge: 42, requiredCourse: "SBN-DTM", divisionRange: null }, status: "Active" },
  { id: 4, name: "Financial Acumen for Leaders", code: "SBN-FAL", investment: 8500, seats: 35, category: "Finance", format: "In-Person", duration: "3 days", provider: "London Business School", description: "Financial acumen development for decision-making.", objective: "Strengthen financial analysis and P&L management capabilities.", skills: ["Financial Analysis", "P&L Management", "Business Planning"], prereqs: { minMonthsCompany: 12, minMonthsDivision: 6, maxAge: 55, requiredCourse: null, divisionRange: null }, status: "Active" },
  { id: 5, name: "People Leadership Program", code: "SBN-PLP", investment: 7800, seats: 40, category: "People", format: "In-Person", duration: "3 days", provider: "CCL", description: "Program focused on people leadership and team development.", objective: "Develop coaching, feedback, and talent management skills.", skills: ["Coaching", "Team Building", "Talent Development"], prereqs: { minMonthsCompany: 12, minMonthsDivision: 6, maxAge: 50, requiredCourse: null, divisionRange: null }, status: "Active" },
  { id: 6, name: "Supply Chain Innovation", code: "SBN-SCI", investment: 9200, seats: 25, category: "Operations", format: "In-Person", duration: "4 days", provider: "IMD", description: "Innovation in supply chain and global operations.", objective: "Transform the supply chain with technology and agility.", skills: ["Supply Chain Optimization", "Sustainability", "Operations Strategy"], prereqs: { minMonthsCompany: 24, minMonthsDivision: 12, maxAge: 48, requiredCourse: null, divisionRange: [12, 60] }, status: "Active" },
  { id: 7, name: "Sustainability & ESG Leadership", code: "SBN-ESG", investment: 8900, seats: 30, category: "ESG", format: "In-Person", duration: "3 days", provider: "Cambridge Judge", description: "Leadership in sustainability and ESG practices.", objective: "Integrate ESG into business strategy and operations.", skills: ["ESG Strategy", "Sustainable Innovation", "Stakeholder Management"], prereqs: { minMonthsCompany: 18, minMonthsDivision: 6, maxAge: 55, requiredCourse: null, divisionRange: null }, status: "Active" },
  { id: 8, name: "Luxury Brand Management", code: "SBN-LBM", investment: 14000, seats: 15, category: "Marketing", format: "In-Person", duration: "5 days", provider: "Bocconi", description: "Luxury brand management and premium experience.", objective: "Master the codes of luxury and create memorable brand experiences.", skills: ["Luxury Marketing", "Brand Equity", "Premium Positioning"], prereqs: { minMonthsCompany: 36, minMonthsDivision: 24, maxAge: 40, requiredCourse: "SBN-GME", divisionRange: null }, status: "Active" },
];

const TALENT_CLASSES = ["Essential Players", "Rising Players", "Future Leaders"];
const DIVISIONS = ["Luxe", "Consumer Products", "Professional Products", "Active Cosmetics", "Operations", "Finance", "HR", "Digital"];
const PERFORMANCE_RATINGS = ["Exceeds Expectations", "Strong Performer", "Meets Expectations", "Developing"];
const RISK_LEVELS = ["High", "Medium", "Low"];

const CURRENT_USER = { name: "Dione", email: "dione@loreal.com", role: "BP" };

const STAGE_APPROVERS = {
  nominated: "HR Local",
  first_validation: "Zone Forum",
  zone_validation: "Global Team",
  final: "Approved",
};

const STAGE_DESCRIPTIONS = {
  nominated: "Aguardando 1ª Validação - HR Local",
  first_validation: "Aguardando Validação do Fórum de Zona",
  zone_validation: "Aguardando Aprovação Final - Global",
  final: "Aprovado - Vaga Confirmada",
};

const generateEmployees = () => {
  const firstNames = ["Ana", "Carlos", "Mariana", "Pedro", "Juliana", "Rafael", "Beatriz", "Lucas", "Camila", "Gabriel", "Isabella", "Thiago", "Fernanda", "Diego", "Larissa", "Matheus", "Amanda", "Bruno", "Letícia", "Gustavo", "Valentina", "André", "Sophia", "Ricardo", "Helena", "Felipe", "Maria", "Eduardo", "Laura", "Henrique", "Paula", "João", "Luiza", "Daniel", "Clara", "Rodrigo", "Alice", "Marcelo", "Giovanna", "Vinícius"];
  const lastNames = ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Rodrigues", "Almeida", "Nascimento", "Lima", "Araújo", "Fernandes", "Carvalho", "Gomes", "Martins", "Rocha", "Ribeiro", "Moreira", "Barros", "Freitas"];
  const titles = ["Brand Manager", "Marketing Director", "Regional Manager", "Operations Lead", "Finance Manager", "HR Business Partner", "Digital Strategist", "Supply Chain Manager", "Product Manager", "Commercial Director", "Innovation Lead", "Trade Marketing Manager", "Key Account Manager", "Category Manager", "Retail Excellence Manager"];
  const completedCourses = [null, null, null, "SBN-DTM", "SBN-PLP", "SBN-FAL", "SBN-SLA", null, "SBN-GME", null];

  return Array.from({ length: 45 }, (_, i) => {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[Math.floor(i / 2) % lastNames.length];
    const age = 28 + Math.floor(Math.random() * 20);
    const monthsCompany = 6 + Math.floor(Math.random() * 96);
    const monthsDivision = Math.min(monthsCompany, 3 + Math.floor(Math.random() * 48));
    const monthsRole = Math.min(monthsDivision, 2 + Math.floor(Math.random() * 30));
    const pastSBN = Math.floor(Math.random() * 3);
    return {
      id: `EMP-${String(i + 1).padStart(4, "0")}`,
      name: `${fn} ${ln}`,
      gender: i % 3 === 0 ? "M" : "F",
      age,
      title: titles[i % titles.length],
      country: ZONES[0].countries[i % 5 === 4 ? 4 : i % 5 === 3 ? 3 : i % 5 === 2 ? 2 : i % 5 === 1 ? 1 : 0],
      zone: "latam",
      division: DIVISIONS[i % DIVISIONS.length],
      monthsCompany,
      monthsDivision,
      monthsRole,
      talentClass: TALENT_CLASSES[i % 3],
      performance: PERFORMANCE_RATINGS[i % 4],
      successionPipeline: i % 3 === 0,
      pastSBNCount: pastSBN,
      flightRisk: RISK_LEVELS[i % 3],
      completedCourses: completedCourses[i % completedCourses.length] ? [completedCourses[i % completedCourses.length]] : [],
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@loreal.com`,
      bp: `BP-${String((i % 5) + 1).padStart(3, "0")}`,
    };
  });
};

const EMPLOYEES = generateEmployees();

const WORKFLOW_STAGES = [
  { key: "nominated", label: "Nominated", icon: "📋" },
  { key: "first_validation", label: "1st Validation", icon: "✅" },
  { key: "zone_validation", label: "Zone Validation", icon: "🌍" },
  { key: "final", label: "Final", icon: "🏆" },
];

// ==================== SCORING ====================
const calcScore = (emp) => {
  let score = 0;
  if (emp.talentClass === "Future Leaders") score += 30;
  else if (emp.talentClass === "Rising Players") score += 22;
  else if (emp.talentClass === "Essential Players") score += 15;
  if (emp.successionPipeline) score += 20;
  if (emp.pastSBNCount === 0) score += 15;
  else if (emp.pastSBNCount === 1) score += 5;
  if (emp.flightRisk === "High") score += 15;
  else if (emp.flightRisk === "Medium") score += 8;
  if (emp.performance === "Exceeds Expectations") score += 20;
  else if (emp.performance === "Strong Performer") score += 14;
  else if (emp.performance === "Meets Expectations") score += 8;
  else score += 3;
  return score;
};

const checkEligibility = (emp, course) => {
  const reasons = [];
  const p = course.prereqs;
  if (p.minMonthsCompany && emp.monthsCompany < p.minMonthsCompany) reasons.push(`Min ${p.minMonthsCompany} months at company (current: ${emp.monthsCompany})`);
  if (p.minMonthsDivision && emp.monthsDivision < p.minMonthsDivision) reasons.push(`Min ${p.minMonthsDivision} months in division (current: ${emp.monthsDivision})`);
  if (p.maxAge && emp.age > p.maxAge) reasons.push(`Max age ${p.maxAge} years (current: ${emp.age})`);
  if (p.requiredCourse && !emp.completedCourses.includes(p.requiredCourse)) reasons.push(`Prerequisite: ${p.requiredCourse}`);
  if (p.divisionRange) {
    const [min, max] = p.divisionRange;
    if (emp.monthsDivision < min || emp.monthsDivision > max) reasons.push(`${min}-${max} months in division (current: ${emp.monthsDivision})`);
  }
  return { eligible: reasons.length === 0, reasons };
};

// ==================== STYLES ====================
const colors = {
  black: "#000000",
  darkGray: "#1a1a1a",
  medGray: "#2d2d2d",
  gray: "#4a4a4a",
  lightGray: "#8a8a8a",
  silver: "#b8b8b8",
  offWhite: "#f5f0eb",
  white: "#ffffff",
  gold: "#c4a265",
  goldLight: "#d4b87a",
  goldDark: "#a88a4e",
  accent: "#c4a265",
  success: "#4a9b6e",
  warning: "#d4a843",
  danger: "#c75050",
  info: "#5a8fb8",
};

// ==================== COMPONENTS ====================
const Badge = ({ children, variant = "default", size = "sm" }) => {
  const variants = {
    default: { bg: colors.medGray, color: colors.silver },
    gold: { bg: `${colors.gold}22`, color: colors.gold, border: `1px solid ${colors.gold}44` },
    success: { bg: `${colors.success}22`, color: colors.success },
    warning: { bg: `${colors.warning}22`, color: colors.warning },
    danger: { bg: `${colors.danger}22`, color: colors.danger },
    info: { bg: `${colors.info}22`, color: colors.info },
    dark: { bg: colors.black, color: colors.white },
  };
  const v = variants[variant] || variants.default;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: size === "xs" ? "2px 6px" : "4px 10px",
      borderRadius: 4, fontSize: size === "xs" ? 10 : 11, fontWeight: 600, letterSpacing: "0.04em",
      textTransform: "uppercase", background: v.bg, color: v.color, border: v.border || "none", whiteSpace: "nowrap",
    }}>{children}</span>
  );
};

const Card = ({ children, style = {}, onClick, hover = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: colors.darkGray, borderRadius: 10, border: `1px solid ${hovered && hover ? colors.gold + "44" : "#333"}`,
        padding: 20, transition: "all 0.25s ease",
        transform: hovered && hover ? "translateY(-2px)" : "none",
        boxShadow: hovered && hover ? `0 8px 24px ${colors.black}66` : "none",
        cursor: onClick ? "pointer" : "default", ...style,
      }}
    >{children}</div>
  );
};

const StatCard = ({ label, value, sub, icon }) => (
  <Card style={{ textAlign: "center", padding: "24px 16px" }}>
    <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 800, color: colors.white, fontFamily: "'Playfair Display', serif" }}>{value}</div>
    <div style={{ fontSize: 12, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>{label}</div>
    {sub && <div style={{ fontSize: 11, color: colors.gold, marginTop: 4 }}>{sub}</div>}
  </Card>
);

const ProgressStep = ({ stage, index, currentIndex }) => {
  const isActive = index === currentIndex;
  const isDone = index < currentIndex;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, position: "relative" }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, background: isDone ? colors.success : isActive ? colors.gold : colors.medGray,
        color: isDone || isActive ? colors.white : colors.lightGray, fontWeight: 700, border: isActive ? `2px solid ${colors.gold}` : "2px solid transparent",
        transition: "all 0.3s ease", zIndex: 1,
      }}>
        {isDone ? "✓" : stage.icon}
      </div>
      <div style={{
        fontSize: 9, textAlign: "center", color: isActive ? colors.gold : isDone ? colors.success : colors.lightGray,
        marginTop: 6, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: isActive ? 700 : 400, maxWidth: 90, lineHeight: 1.3,
      }}>{stage.label}</div>
    </div>
  );
};

const WorkflowTracker = ({ currentStage = 0 }) => (
  <div style={{ position: "relative", padding: "0 10px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
      <div style={{ position: "absolute", top: 18, left: 40, right: 40, height: 2, background: colors.medGray, zIndex: 0 }}>
        <div style={{ width: `${(currentStage / (WORKFLOW_STAGES.length - 1)) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${colors.success}, ${colors.gold})`, transition: "width 0.6s ease" }} />
      </div>
      {WORKFLOW_STAGES.map((s, i) => <ProgressStep key={s.key} stage={s} index={i} currentIndex={currentStage} />)}
    </div>
  </div>
);

const SeatGauge = ({ used, total, label }) => {
  const pct = Math.min((used / total) * 100, 100);
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  const color = pct > 90 ? colors.danger : pct > 70 ? colors.warning : colors.gold;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r={radius} fill="none" stroke={colors.medGray} strokeWidth="6" />
        <circle cx="45" cy="45" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 45 45)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
        <text x="45" y="42" textAnchor="middle" fill={colors.white} fontSize="16" fontWeight="800" fontFamily="'Playfair Display', serif">{used}</text>
        <text x="45" y="56" textAnchor="middle" fill={colors.lightGray} fontSize="9">/ {total}</text>
      </svg>
      <div style={{ fontSize: 10, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>{label}</div>
    </div>
  );
};

// ==================== NOMINATION FORM (shared) ====================
const NominationMiniForm = ({ onConfirm, onCancel }) => {
  const [justText, setJustText] = useState("");
  return (
    <div style={{ marginTop: 10, padding: 14, background: colors.medGray, borderRadius: 8, border: `1px solid ${colors.gold}44` }}>
      <textarea
        value={justText}
        onChange={e => setJustText(e.target.value)}
        placeholder="Motivo da indicação..."
        rows={3}
        style={{ width: "100%", padding: 10, background: colors.darkGray, border: "1px solid #444", borderRadius: 6, color: colors.white, fontSize: 12, resize: "vertical", outline: "none", boxSizing: "border-box" }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
        <span style={{ fontSize: 11, color: colors.lightGray }}>Indicado por: <span style={{ color: colors.gold }}>{CURRENT_USER.email}</span> ({CURRENT_USER.role})</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel}
            style={{ padding: "6px 14px", background: colors.darkGray, color: colors.silver, border: "1px solid #444", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>
            Cancelar
          </button>
          <button onClick={() => onConfirm(justText, CURRENT_USER.role)}
            style={{ padding: "6px 14px", background: colors.gold, color: colors.black, border: "none", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== PAGES ====================
const DashboardPage = ({ nominations, onNavigate }) => {
  const totalInvestment = nominations.reduce((s, n) => s + n.investment, 0);
  const approvedCount = nominations.filter(n => n.status === "final").length;
  const pendingCount = nominations.filter(n => !["final", "rejected"].includes(n.status)).length;

  const byCountry = {};
  nominations.forEach(n => {
    const emp = EMPLOYEES.find(e => e.id === n.employeeId);
    if (emp) { byCountry[emp.country] = (byCountry[emp.country] || 0) + 1; }
  });
  const byCourse = {};
  nominations.forEach(n => { byCourse[n.courseName] = (byCourse[n.courseName] || 0) + 1; });
  const byTalent = {};
  nominations.forEach(n => {
    const emp = EMPLOYEES.find(e => e.id === n.employeeId);
    if (emp) { byTalent[emp.talentClass] = (byTalent[emp.talentClass] || 0) + 1; }
  });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: colors.white, margin: 0, fontFamily: "'Playfair Display', serif" }}>
          Dashboard <span style={{ color: colors.gold }}>LATAM</span>
        </h2>
        <p style={{ color: colors.lightGray, fontSize: 13, marginTop: 4 }}>Seminar by Nomination — Consolidated zone overview</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard icon="📊" label="Nominations" value={nominations.length} sub={`${pendingCount} pending`} />
        <StatCard icon="💰" label="Investment" value={`$${(totalInvestment / 1000).toFixed(0)}K`} sub={`of $850K budget`} />
        <StatCard icon="✅" label="Approved" value={approvedCount} sub={`${nominations.length ? Math.round((approvedCount / nominations.length) * 100) : 0}% rate`} />
      </div>

      <Card style={{ marginBottom: 28, padding: 28 }}>
        <div style={{ fontSize: 13, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, fontWeight: 600 }}>
          Workflow Progress
        </div>
        <WorkflowTracker currentStage={1} />
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
        <Card>
          <div style={{ fontSize: 13, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontWeight: 600 }}>
            Seats by Country
          </div>
          <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 12 }}>
            {COUNTRY_SEATS.map(cs => {
              const used = byCountry[cs.country] || 0;
              return <SeatGauge key={cs.country} used={used} total={cs.seats} label={cs.country} />;
            })}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize: 13, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontWeight: 600 }}>
            Budget by Country
          </div>
          <div style={{ padding: "0 8px" }}>
            {COUNTRY_SEATS.map(cs => {
              const countryNoms = nominations.filter(n => {
                const emp = EMPLOYEES.find(e => e.id === n.employeeId);
                return emp && emp.country === cs.country;
              });
              const used = countryNoms.reduce((s, n) => s + n.investment, 0);
              const pct = ((used / cs.budget) * 100).toFixed(0);
              return (
                <div key={cs.country} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: colors.silver }}>{cs.country}</span>
                    <span style={{ color: colors.gold }}>${(used / 1000).toFixed(0)}K / ${(cs.budget / 1000).toFixed(0)}K ({pct}%)</span>
                  </div>
                  <div style={{ height: 5, background: `${colors.white}08`, borderRadius: 3 }}>
                    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldLight})`, borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Card>
          <div style={{ fontSize: 13, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontWeight: 600 }}>
            By Country
          </div>
          {Object.entries(byCountry).sort((a, b) => b[1] - a[1]).map(([country, count]) => (
            <div key={country} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.medGray}` }}>
              <span style={{ color: colors.silver, fontSize: 13 }}>{country}</span>
              <span style={{ color: colors.white, fontWeight: 700, fontSize: 13 }}>{count}</span>
            </div>
          ))}
          {Object.keys(byCountry).length === 0 && <p style={{ color: colors.lightGray, fontSize: 12, fontStyle: "italic" }}>No nominations yet</p>}
        </Card>
        <Card>
          <div style={{ fontSize: 13, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontWeight: 600 }}>
            By Course (Top 5)
          </div>
          {Object.entries(byCourse).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => (
            <div key={name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.medGray}` }}>
              <span style={{ color: colors.silver, fontSize: 12, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
              <span style={{ color: colors.white, fontWeight: 700, fontSize: 13 }}>{count}</span>
            </div>
          ))}
          {Object.keys(byCourse).length === 0 && <p style={{ color: colors.lightGray, fontSize: 12, fontStyle: "italic" }}>No nominations yet</p>}
        </Card>
        <Card>
          <div style={{ fontSize: 13, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontWeight: 600 }}>
            By Classification
          </div>
          {TALENT_CLASSES.map(tc => (
            <div key={tc} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${colors.medGray}` }}>
              <Badge variant={tc === "Future Leaders" ? "gold" : tc === "Rising Players" ? "info" : "warning"} size="xs">{tc}</Badge>
              <span style={{ color: colors.white, fontWeight: 700, fontSize: 13 }}>{byTalent[tc] || 0}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
};

const CourseCatalog = ({ onSelectCourse, nominations = [] }) => {
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const categories = ["All", ...new Set(COURSES.map(c => c.category))];
  const filtered = COURSES.filter(c => {
    if (filterCat !== "All" && c.category !== filterCat) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.code.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const formatMap = { "In-Person": "danger" };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: colors.white, margin: 0, fontFamily: "'Playfair Display', serif" }}>
          SBN Course <span style={{ color: colors.gold }}>Catalog</span>
        </h2>
        <p style={{ color: colors.lightGray, fontSize: 13, marginTop: 4 }}>{COURSES.length} programs available — Click a course to nominate employees</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search course..."
          style={{ flex: 1, minWidth: 200, padding: "10px 16px", background: colors.medGray, border: `1px solid #444`, borderRadius: 6, color: colors.white, fontSize: 13, outline: "none" }} />
        <div style={{ display: "flex", gap: 6 }}>
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              style={{
                padding: "8px 14px", borderRadius: 6, border: `1px solid ${filterCat === c ? colors.gold : "#444"}`,
                background: filterCat === c ? `${colors.gold}22` : colors.medGray, color: filterCat === c ? colors.gold : colors.silver,
                fontSize: 12, cursor: "pointer", fontWeight: 600, letterSpacing: "0.03em",
              }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
        {filtered.map(course => (
          <Card key={course.id} hover onClick={() => onSelectCourse(course)}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: colors.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{course.code}</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.white }}>{course.name}</div>
              </div>
              <Badge variant={formatMap[course.format]}>{course.format}</Badge>
            </div>
            <p style={{ fontSize: 12, color: colors.lightGray, lineHeight: 1.5, margin: "0 0 14px" }}>{course.description}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {course.skills.map(s => <Badge key={s} variant="default" size="xs">{s}</Badge>)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: `1px solid #333` }}>
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: colors.silver }}>
                <span>🏛️ {course.provider}</span>
                <span>⏱ {course.duration}</span>
                <span>👥 {course.seats} seats</span>
                <span>📋 {nominations.filter(n => n.courseId === course.id).length} nominated</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 800, color: colors.gold, fontFamily: "'Playfair Display', serif" }}>
                ${course.investment.toLocaleString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ==================== COURSE NOMINATION VIEW (Change 5) ====================
const CourseNominationView = ({ course, nominations, onNominate, onBack }) => {
  const [search, setSearch] = useState("");
  const [nominatingEmpId, setNominatingEmpId] = useState(null);

  const eligibleEmployees = useMemo(() => {
    return EMPLOYEES.map(emp => {
      const elig = checkEligibility(emp, course);
      const alreadyNominated = nominations.some(n => n.employeeId === emp.id && n.courseId === course.id);
      return { ...emp, ...elig, alreadyNominated };
    }).filter(emp => emp.eligible);
  }, [course, nominations]);

  const filtered = eligibleEmployees.filter(e => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const courseNomCount = nominations.filter(n => n.courseId === course.id).length;
  const talentColors = { "Future Leaders": "gold", "Rising Players": "info", "Essential Players": "warning" };

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: colors.gold, fontSize: 13, cursor: "pointer", marginBottom: 20, padding: 0 }}>
        ← Voltar ao Catálogo
      </button>

      <Card style={{ marginBottom: 24, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, color: colors.gold, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{course.code}</div>
            <h2 style={{ margin: 0, fontSize: 22, color: colors.white, fontFamily: "'Playfair Display', serif" }}>{course.name}</h2>
            <p style={{ color: colors.lightGray, fontSize: 13, marginTop: 6 }}>{course.description}</p>
          </div>
          <div style={{ textAlign: "right", minWidth: 140 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.gold, fontFamily: "'Playfair Display', serif" }}>${course.investment.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: colors.lightGray, marginTop: 4 }}>🏛️ {course.provider} • {course.duration}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: `1px solid #333` }}>
          <div style={{ fontSize: 12, color: colors.silver }}>💺 Seats: <strong style={{ color: colors.white }}>{courseNomCount} / {course.seats}</strong></div>
          <div style={{ fontSize: 12, color: colors.silver }}>👤 Eligible: <strong style={{ color: colors.white }}>{eligibleEmployees.length}</strong></div>
        </div>
      </Card>

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search eligible employees..."
          style={{ width: "100%", padding: "10px 16px", background: colors.medGray, border: "1px solid #444", borderRadius: 6, color: colors.white, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {filtered.map(emp => (
          <Card key={emp.id} style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.gold}44, ${colors.goldDark}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: colors.gold }}>
                  {emp.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.white }}>{emp.name}</div>
                  <div style={{ fontSize: 11, color: colors.lightGray }}>{emp.title} • {emp.country}</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge variant={talentColors[emp.talentClass]} size="xs">{emp.talentClass}</Badge>
                {emp.alreadyNominated ? (
                  <Badge variant="success" size="xs">✓ Nominated</Badge>
                ) : nominatingEmpId === emp.id ? null : (
                  <button onClick={() => setNominatingEmpId(emp.id)}
                    style={{ padding: "6px 14px", background: colors.gold, color: colors.black, border: "none", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Nominate
                  </button>
                )}
              </div>
            </div>
            {nominatingEmpId === emp.id && (
              <NominationMiniForm
                onConfirm={(justText, nominatorRole) => {
                  onNominate(emp, course, justText, nominatorRole);
                  setNominatingEmpId(null);
                }}
                onCancel={() => setNominatingEmpId(null)}
              />
            )}
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card style={{ textAlign: "center", padding: 40 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📚</div>
            <div style={{ color: colors.lightGray, fontSize: 14 }}>No eligible employees found</div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ==================== EMPLOYEE DIRECTORY ====================
const EmployeeDirectory = ({ nominations, onNominate }) => {
  const [search, setSearch] = useState("");
  const [filterTalent, setFilterTalent] = useState("All");
  const [filterCountry, setFilterCountry] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [selectedEmp, setSelectedEmp] = useState(null);

  const enriched = useMemo(() =>
    EMPLOYEES.map(e => ({ ...e, score: calcScore(e) })).sort((a, b) => sortBy === "name" ? a.name.localeCompare(b.name) : a.name.localeCompare(b.name)),
    [sortBy]
  );

  const filtered = enriched.filter(e => {
    if (filterTalent !== "All" && e.talentClass !== filterTalent) return false;
    if (filterCountry !== "All" && e.country !== filterCountry) return false;
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const talentColors = { "Future Leaders": "gold", "Rising Players": "info", "Essential Players": "warning" };
  const riskColors = { High: "danger", Medium: "warning", Low: "success" };
  const perfColors = { "Exceeds Expectations": "success", "Strong Performer": "info", "Meets Expectations": "warning", "Developing": "danger" };

  const EmployeeDetail = ({ emp }) => {
    const eligibility = COURSES.map(c => ({ course: c, ...checkEligibility(emp, c) }));
    const nominated = nominations.filter(n => n.employeeId === emp.id);
    const [nominatingCourseId, setNominatingCourseId] = useState(null);

    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 100, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}
        onClick={() => setSelectedEmp(null)}>
        <div onClick={e => e.stopPropagation()} style={{ background: colors.darkGray, borderRadius: 14, maxWidth: 800, width: "100%", maxHeight: "90vh", overflow: "auto", border: `1px solid #444` }}>
          <div style={{ padding: 28, borderBottom: `1px solid #333` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.gold}, ${colors.goldDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: colors.white }}>
                    {emp.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, color: colors.white, fontFamily: "'Playfair Display', serif" }}>{emp.name}</h3>
                    <div style={{ fontSize: 12, color: colors.lightGray }}>{emp.title} • {emp.division}</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEmp(null)} style={{ background: "none", border: "none", color: colors.lightGray, fontSize: 22, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
              <Badge variant={talentColors[emp.talentClass]}>{emp.talentClass}</Badge>
              <Badge variant={perfColors[emp.performance]}>{emp.performance}</Badge>
              <Badge variant={riskColors[emp.flightRisk]}>Risk: {emp.flightRisk}</Badge>
              {emp.successionPipeline && <Badge variant="gold">🔄 Succession Pipeline</Badge>}
            </div>
          </div>
          <div style={{ padding: 28 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Company", value: `${emp.monthsCompany} months`, icon: "🏢" },
                { label: "Division", value: `${emp.monthsDivision} months`, icon: "📁" },
                { label: "Role", value: `${emp.monthsRole} months`, icon: "💼" },
                { label: "Past SBN", value: `${emp.pastSBNCount}x`, icon: "🎓" },
                { label: "Age", value: `${emp.age} years`, icon: "📅" },
              ].map(item => (
                <div key={item.label} style={{ background: colors.medGray, borderRadius: 8, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: colors.white }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
                </div>
              ))}
            </div>
            {nominated.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, color: colors.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 600 }}>Active Nominations</div>
                {nominated.map(n => (
                  <div key={n.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: colors.medGray, borderRadius: 6, marginBottom: 6 }}>
                    <span style={{ color: colors.silver, fontSize: 12 }}>{n.courseName}</span>
                    <Badge variant="info" size="xs">{n.status.replace(/_/g, " ")}</Badge>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 12, color: colors.gold, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10, fontWeight: 600 }}>Eligibility by Course</div>
            <div style={{ display: "grid", gap: 8 }}>
              {eligibility.map(({ course, eligible, reasons }) => (
                <div key={course.id} style={{ borderLeft: `3px solid ${eligible ? colors.success : colors.danger}`, background: colors.medGray, borderRadius: 6, padding: "10px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 13, color: colors.white, fontWeight: 500 }}>{course.name}</div>
                      {!eligible && <div style={{ fontSize: 10, color: colors.danger, marginTop: 2 }}>{reasons.join(" • ")}</div>}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {eligible ? <Badge variant="success" size="xs">Eligible</Badge> : <Badge variant="danger" size="xs">Not Eligible</Badge>}
                      {eligible && !nominated.find(n => n.courseId === course.id) && nominatingCourseId !== course.id && (
                        <button onClick={() => setNominatingCourseId(course.id)}
                          style={{ padding: "4px 10px", background: colors.gold, color: colors.black, border: "none", borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                          Nominate
                        </button>
                      )}
                    </div>
                  </div>
                  {nominatingCourseId === course.id && (
                    <NominationMiniForm
                      onConfirm={(justText, nominatorRole) => {
                        onNominate(emp, course, justText, nominatorRole);
                        setNominatingCourseId(null);
                      }}
                      onCancel={() => setNominatingCourseId(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {selectedEmp && <EmployeeDetail emp={selectedEmp} />}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: colors.white, margin: 0, fontFamily: "'Playfair Display', serif" }}>
          Eligible <span style={{ color: colors.gold }}>Employees</span>
        </h2>
        <p style={{ color: colors.lightGray, fontSize: 13, marginTop: 4 }}>{filtered.length} of {EMPLOYEES.length} employees</p>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or ID..."
          style={{ flex: 1, minWidth: 200, padding: "10px 16px", background: colors.medGray, border: "1px solid #444", borderRadius: 6, color: colors.white, fontSize: 13, outline: "none" }} />
        <select value={filterTalent} onChange={e => setFilterTalent(e.target.value)}
          style={{ padding: "10px 14px", background: colors.medGray, border: "1px solid #444", borderRadius: 6, color: colors.silver, fontSize: 12, cursor: "pointer" }}>
          <option value="All">All Talent Classes</option>
          {TALENT_CLASSES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}
          style={{ padding: "10px 14px", background: colors.medGray, border: "1px solid #444", borderRadius: 6, color: colors.silver, fontSize: 12, cursor: "pointer" }}>
          <option value="All">All Countries</option>
          {ZONES[0].countries.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: "10px 14px", background: colors.medGray, border: "1px solid #444", borderRadius: 6, color: colors.silver, fontSize: 12, cursor: "pointer" }}>
          <option value="name">Sort by Name</option>
        </select>
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 130px 100px 100px 80px", gap: 12, padding: "10px 16px", fontSize: 10, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
          <span></span><span>Employee</span><span>Classification</span><span>Performance</span><span>Flight Risk</span><span>SBN Past</span>
        </div>
        {filtered.map(emp => (
          <div key={emp.id} onClick={() => setSelectedEmp(emp)}
            style={{ display: "grid", gridTemplateColumns: "50px 1fr 130px 100px 100px 80px", gap: 12, padding: "14px 16px", background: colors.darkGray, borderRadius: 8, alignItems: "center", cursor: "pointer", border: "1px solid transparent", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.gold + "44"; e.currentTarget.style.background = colors.medGray; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = colors.darkGray; }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.gold}44, ${colors.goldDark}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: colors.gold }}>
              {emp.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.white }}>{emp.name}</div>
              <div style={{ fontSize: 11, color: colors.lightGray }}>{emp.title} • {emp.country}</div>
            </div>
            <Badge variant={talentColors[emp.talentClass]} size="xs">{emp.talentClass}</Badge>
            <Badge variant={perfColors[emp.performance]} size="xs">{emp.performance.split(" ")[0]}</Badge>
            <Badge variant={riskColors[emp.flightRisk]} size="xs">{emp.flightRisk}</Badge>
            <div style={{ fontSize: 13, color: emp.pastSBNCount === 0 ? colors.success : colors.silver, fontWeight: 600, textAlign: "center" }}>
              {emp.pastSBNCount === 0 ? "New ✨" : `${emp.pastSBNCount}x`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== NOMINATION PAGE (Change 8) ====================
const NominationPage = ({ nominations, setNominations }) => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterNominator, setFilterNominator] = useState("All");
  const [viewMode, setViewMode] = useState("course");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [sortByPriority, setSortByPriority] = useState(false);

  const statuses = ["All", "nominated", "first_validation", "zone_validation", "final", "rejected"];
  const statusLabels = { nominated: "Nominated", first_validation: "1st Validation", zone_validation: "Zone Validation", final: "Final", rejected: "Rejected" };
  const statusColors = { nominated: "info", first_validation: "warning", zone_validation: "success", final: "gold", rejected: "danger" };

  const filtered = nominations.filter(n => {
    if (filterStatus !== "All" && n.status !== filterStatus) return false;
    if (filterNominator !== "All" && n.nominatorRole !== filterNominator) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortByPriority) {
      const ap = a.priority || 999;
      const bp = b.priority || 999;
      return ap - bp;
    }
    return 0;
  });

  const advanceStatus = (nomId) => {
    setNominations(prev => prev.map(n => {
      if (n.id !== nomId) return n;
      const stages = ["nominated", "first_validation", "zone_validation", "final"];
      const idx = stages.indexOf(n.status);
      if (idx < stages.length - 1) return { ...n, status: stages[idx + 1] };
      return n;
    }));
  };

  const rejectNom = (nomId, reason) => {
    setNominations(prev => prev.map(n => n.id === nomId ? { ...n, status: "rejected", rejectionReason: reason } : n));
    setRejectingId(null);
    setRejectReason("");
  };

  const updatePriority = (nomId, priority) => {
    setNominations(prev => prev.map(n => n.id === nomId ? { ...n, priority: priority || null } : n));
  };

  const NomCard = ({ nom }) => {
    const emp = EMPLOYEES.find(e => e.id === nom.employeeId);
    const stageIdx = WORKFLOW_STAGES.findIndex(s => s.key === nom.status);
    return (
      <Card style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${colors.gold}44, ${colors.goldDark}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: colors.gold, flexShrink: 0 }}>
              {emp?.name.split(" ").map(n => n[0]).join("") || "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.white }}>{emp?.name || "N/A"}</div>
              <div style={{ fontSize: 11, color: colors.lightGray }}>{emp?.title} • {emp?.country}</div>
              <div style={{ fontSize: 13, color: colors.silver, fontWeight: 500, marginTop: 4 }}>{nom.courseName}</div>
              {nom.justification && (
                <div style={{ fontSize: 11, color: colors.lightGray, fontStyle: "italic", marginTop: 4, lineHeight: 1.4 }}>
                  "{nom.justification}"
                </div>
              )}
              {nom.status === "rejected" && nom.rejectionReason && (
                <div style={{ fontSize: 11, color: colors.danger, marginTop: 4, lineHeight: 1.4 }}>
                  Motivo: {nom.rejectionReason}
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, minWidth: 180 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              <Badge variant={statusColors[nom.status]} size="xs">{statusLabels[nom.status] || nom.status}</Badge>
              <Badge variant={nom.nominatorRole === "Head" ? "gold" : "info"} size="xs">{nom.nominatorRole || "BP"}</Badge>
              {nom.priority && <Badge variant="gold" size="xs">P{nom.priority}</Badge>}
              <span style={{ fontSize: 12, color: colors.gold, fontWeight: 700 }}>${nom.investment.toLocaleString()}</span>
            </div>
            {nom.status !== "final" && nom.status !== "rejected" && (
              <div style={{ fontSize: 10, color: colors.lightGray }}>
                Pendente com: {STAGE_APPROVERS[nom.status]}
              </div>
            )}
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <select
                value={nom.priority || ""}
                onChange={e => updatePriority(nom.id, parseInt(e.target.value) || null)}
                style={{ padding: "3px 6px", background: colors.medGray, border: "1px solid #444", borderRadius: 4, color: colors.silver, fontSize: 11, cursor: "pointer" }}
              >
                <option value="">Priority</option>
                {[1,2,3,4,5,6,7,8,9,10].map(p => <option key={p} value={p}>P{p}</option>)}
              </select>
              {nom.status !== "final" && nom.status !== "rejected" && (
                <>
                  <button onClick={() => advanceStatus(nom.id)}
                    style={{ padding: "5px 10px", background: colors.success, color: colors.white, border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Advance ▶
                  </button>
                  <button onClick={() => setRejectingId(nom.id)}
                    style={{ padding: "5px 10px", background: colors.danger, color: colors.white, border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Reject
                  </button>
                </>
              )}
              {nom.status === "final" && <Badge variant="gold">✓ Approved</Badge>}
              {nom.status === "rejected" && <Badge variant="danger">✕ Rejected</Badge>}
            </div>
          </div>
        </div>
        {rejectingId === nom.id && (
          <div style={{ marginTop: 12, padding: 14, background: colors.medGray, borderRadius: 8, border: `1px solid ${colors.danger}44` }}>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="Motivo da rejeição (obrigatório)..."
              rows={2}
              style={{ width: "100%", padding: 10, background: colors.darkGray, border: "1px solid #444", borderRadius: 6, color: colors.white, fontSize: 12, resize: "vertical", outline: "none", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
              <button onClick={() => { setRejectingId(null); setRejectReason(""); }}
                style={{ padding: "5px 12px", background: colors.darkGray, color: colors.silver, border: "1px solid #444", borderRadius: 4, fontSize: 11, cursor: "pointer" }}>
                Cancelar
              </button>
              <button
                onClick={() => rejectReason.trim() ? rejectNom(nom.id, rejectReason.trim()) : null}
                style={{ padding: "5px 12px", background: rejectReason.trim() ? colors.danger : colors.gray, color: colors.white, border: "none", borderRadius: 4, fontSize: 11, fontWeight: 600, cursor: rejectReason.trim() ? "pointer" : "not-allowed" }}>
                Confirmar Rejeição
              </button>
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Group by course for course view
  const groupedByCourse = {};
  sorted.forEach(nom => {
    if (!groupedByCourse[nom.courseId]) {
      const course = COURSES.find(c => c.id === nom.courseId);
      groupedByCourse[nom.courseId] = { course, noms: [] };
    }
    groupedByCourse[nom.courseId].noms.push(nom);
  });

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: colors.white, margin: 0, fontFamily: "'Playfair Display', serif" }}>
          Nomination <span style={{ color: colors.gold }}>Management</span>
        </h2>
        <p style={{ color: colors.lightGray, fontSize: 13, marginTop: 4 }}>{nominations.length} nominations • {filtered.length} filtered</p>
      </div>

      <Card style={{ marginBottom: 20, padding: 20 }}>
        <WorkflowTracker currentStage={1} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginTop: 16 }}>
          {WORKFLOW_STAGES.map(s => (
            <div key={s.key} style={{ textAlign: "center", padding: 8, background: colors.medGray, borderRadius: 6 }}>
              <div style={{ fontSize: 10, color: colors.lightGray, lineHeight: 1.4 }}>{STAGE_DESCRIPTIONS[s.key]}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap", alignItems: "center" }}>
        {statuses.map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${filterStatus === s ? colors.gold : "#444"}`, background: filterStatus === s ? `${colors.gold}22` : colors.medGray, color: filterStatus === s ? colors.gold : colors.silver, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            {s === "All" ? `All (${nominations.length})` : `${statusLabels[s] || s} (${nominations.filter(n => n.status === s).length})`}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: "#444", margin: "0 4px" }} />
        {["All", "Head", "BP"].map(r => (
          <button key={r} onClick={() => setFilterNominator(r)}
            style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${filterNominator === r ? colors.gold : "#444"}`, background: filterNominator === r ? `${colors.gold}22` : colors.medGray, color: filterNominator === r ? colors.gold : colors.silver, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
            {r === "All" ? "All Roles" : r}
          </button>
        ))}
        <div style={{ width: 1, height: 24, background: "#444", margin: "0 4px" }} />
        <button onClick={() => setSortByPriority(!sortByPriority)}
          style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${sortByPriority ? colors.gold : "#444"}`, background: sortByPriority ? `${colors.gold}22` : colors.medGray, color: sortByPriority ? colors.gold : colors.silver, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
          Sort by Priority
        </button>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        <button onClick={() => setViewMode("course")}
          style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${viewMode === "course" ? colors.gold : "#444"}`, background: viewMode === "course" ? `${colors.gold}22` : colors.medGray, color: viewMode === "course" ? colors.gold : colors.silver, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
          Por Curso
        </button>
        <button onClick={() => setViewMode("list")}
          style={{ padding: "7px 12px", borderRadius: 6, border: `1px solid ${viewMode === "list" ? colors.gold : "#444"}`, background: viewMode === "list" ? `${colors.gold}22` : colors.medGray, color: viewMode === "list" ? colors.gold : colors.silver, fontSize: 11, cursor: "pointer", fontWeight: 600 }}>
          Lista
        </button>
      </div>

      {filtered.length === 0 ? (
        <Card style={{ textAlign: "center", padding: 48 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 16, color: colors.lightGray }}>No nominations found</div>
          <div style={{ fontSize: 12, color: colors.gray, marginTop: 4 }}>Go to "Catalog" to create nominations</div>
        </Card>
      ) : viewMode === "list" ? (
        <div style={{ display: "grid", gap: 8 }}>
          {sorted.map(nom => <NomCard key={nom.id} nom={nom} />)}
        </div>
      ) : (
        <div style={{ display: "grid", gap: 20 }}>
          {Object.values(groupedByCourse).map(({ course, noms }) => (
            <CourseGroup key={course?.id || "unknown"} course={course} noms={noms} NomCard={NomCard} nominations={nominations} />
          ))}
        </div>
      )}
    </div>
  );
};

const CourseGroup = ({ course, noms, NomCard, nominations }) => {
  const [collapsed, setCollapsed] = useState(false);
  const courseNomTotal = nominations.filter(n => n.courseId === course?.id).length;
  const totalInv = noms.reduce((s, n) => s + n.investment, 0);

  return (
    <div>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: colors.medGray, borderRadius: collapsed ? 8 : "8px 8px 0 0", cursor: "pointer", border: `1px solid #444` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ color: colors.lightGray, fontSize: 14 }}>{collapsed ? "▶" : "▼"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: colors.white }}>{course?.name || "Unknown Course"}</div>
            <div style={{ fontSize: 11, color: colors.lightGray }}>{course?.code} • {course?.provider}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Badge variant="info" size="xs">{courseNomTotal} / {course?.seats || "?"} seats</Badge>
          <span style={{ fontSize: 12, color: colors.gold, fontWeight: 700 }}>${totalInv.toLocaleString()}</span>
          <span style={{ fontSize: 12, color: colors.lightGray }}>{noms.length} shown</span>
        </div>
      </div>
      {!collapsed && (
        <div style={{ display: "grid", gap: 6, padding: 8, background: `${colors.medGray}44`, borderRadius: "0 0 8px 8px", border: `1px solid #444`, borderTop: "none" }}>
          {noms.map(nom => <NomCard key={nom.id} nom={nom} />)}
        </div>
      )}
    </div>
  );
};

// ==================== SEATS OVERVIEW (Change 4/7) ====================
const SeatsOverviewPage = ({ nominations }) => {
  const totalSeatsUsed = nominations.filter(n => n.status !== "rejected").length;
  const totalSeats = COUNTRY_SEATS.reduce((s, c) => s + c.seats, 0);
  const totalBudget = COUNTRY_SEATS.reduce((s, c) => s + c.budget, 0);
  const totalBudgetUsed = nominations.filter(n => n.status !== "rejected").reduce((s, n) => s + n.investment, 0);

  const countryData = COUNTRY_SEATS.map(cs => {
    const countryNoms = nominations.filter(n => {
      if (n.status === "rejected") return false;
      const emp = EMPLOYEES.find(e => e.id === n.employeeId);
      return emp && emp.country === cs.country;
    });
    return {
      ...cs,
      used: countryNoms.length,
      budgetUsed: countryNoms.reduce((s, n) => s + n.investment, 0),
    };
  });

  const courseData = COURSES.map(course => {
    const courseNoms = nominations.filter(n => n.courseId === course.id && n.status !== "rejected").length;
    return { ...course, used: courseNoms, remaining: course.seats - courseNoms };
  });

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 300, color: colors.white, margin: 0, fontFamily: "'Playfair Display', serif" }}>
          Seats Overview — <span style={{ color: colors.gold }}>LATAM</span>
        </h2>
        <p style={{ color: colors.lightGray, fontSize: 13, marginTop: 4 }}>Allocation and availability of seats across countries and courses</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard icon="💺" label="Seats Used" value={totalSeatsUsed} sub={`of ${totalSeats} total`} />
        <StatCard icon="🪑" label="Seats Available" value={totalSeats - totalSeatsUsed} sub={`${Math.round(((totalSeats - totalSeatsUsed) / totalSeats) * 100)}% remaining`} />
        <StatCard icon="💰" label="Budget Used" value={`$${(totalBudgetUsed / 1000).toFixed(0)}K`} sub={`of $${(totalBudget / 1000).toFixed(0)}K`} />
        <StatCard icon="💵" label="Budget Available" value={`$${((totalBudget - totalBudgetUsed) / 1000).toFixed(0)}K`} sub={`${Math.round(((totalBudget - totalBudgetUsed) / totalBudget) * 100)}% remaining`} />
      </div>

      <Card style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20, fontWeight: 600 }}>
          By Country
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20 }}>
          {countryData.map(cd => (
            <div key={cd.country} style={{ textAlign: "center" }}>
              <SeatGauge used={cd.used} total={cd.seats} label={cd.country} />
              <div style={{ marginTop: 8, fontSize: 11, color: colors.lightGray }}>
                Budget: ${(cd.budgetUsed / 1000).toFixed(0)}K / ${(cd.budget / 1000).toFixed(0)}K
              </div>
              <div style={{ height: 4, background: `${colors.white}08`, borderRadius: 2, marginTop: 4 }}>
                <div style={{ height: "100%", width: `${Math.min((cd.budgetUsed / cd.budget) * 100, 100)}%`, background: `linear-gradient(90deg, ${colors.gold}, ${colors.goldLight})`, borderRadius: 2, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontSize: 11, color: colors.silver, marginTop: 4 }}>{cd.used} nominations</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 13, color: colors.lightGray, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16, fontWeight: 600 }}>
          By Course — Remaining Seats
        </div>
        <div style={{ display: "grid", gap: 8 }}>
          {courseData.map(cd => {
            const pct = (cd.used / cd.seats) * 100;
            const barColor = pct > 90 ? colors.danger : pct > 70 ? colors.warning : colors.gold;
            return (
              <div key={cd.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${colors.medGray}` }}>
                <div style={{ width: 240, minWidth: 240 }}>
                  <div style={{ fontSize: 13, color: colors.white, fontWeight: 500 }}>{cd.name}</div>
                  <div style={{ fontSize: 10, color: colors.lightGray }}>{cd.code}</div>
                </div>
                <div style={{ flex: 1, height: 6, background: `${colors.white}08`, borderRadius: 3 }}>
                  <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: barColor, borderRadius: 3, transition: "width 0.5s" }} />
                </div>
                <div style={{ minWidth: 80, textAlign: "right" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: cd.remaining <= 3 ? colors.danger : colors.white }}>{cd.used}</span>
                  <span style={{ fontSize: 11, color: colors.lightGray }}> / {cd.seats}</span>
                </div>
                <div style={{ minWidth: 60, textAlign: "right" }}>
                  <Badge variant={cd.remaining <= 0 ? "danger" : cd.remaining <= 3 ? "warning" : "success"} size="xs">
                    {cd.remaining <= 0 ? "Full" : `${cd.remaining} left`}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

// ==================== CRITERIA PAGE ====================
const CriteriaPage = () => (
  <div>
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 24, fontWeight: 300, color: colors.white, margin: 0, fontFamily: "'Playfair Display', serif" }}>
        Prioritization <span style={{ color: colors.gold }}>Criteria</span>
      </h2>
      <p style={{ color: colors.lightGray, fontSize: 13, marginTop: 4 }}>Scoring model to support nomination decisions</p>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {[
        {
          title: "Talent Classification", icon: "⭐", maxPts: 30, items: [
            { label: "Future Leaders", pts: 30, color: colors.gold },
            { label: "Rising Players", pts: 22, color: colors.info },
            { label: "Essential Players", pts: 15, color: colors.warning },
          ]
        },
        {
          title: "Succession Pipeline", icon: "🔄", maxPts: 20, items: [
            { label: "In pipeline", pts: 20, color: colors.success },
            { label: "Not in pipeline", pts: 0, color: colors.gray },
          ]
        },
        {
          title: "SBN History", icon: "📚", maxPts: 15, items: [
            { label: "Never attended", pts: 15, color: colors.success },
            { label: "1 attendance", pts: 5, color: colors.warning },
            { label: "2+ attendances", pts: 0, color: colors.gray },
          ]
        },
        {
          title: "Flight Risk", icon: "⚠️", maxPts: 15, items: [
            { label: "High risk", pts: 15, color: colors.danger },
            { label: "Medium risk", pts: 8, color: colors.warning },
            { label: "Low risk", pts: 0, color: colors.success },
          ]
        },
        {
          title: "Performance", icon: "📈", maxPts: 20, items: [
            { label: "Exceeds Expectations", pts: 20, color: colors.success },
            { label: "Strong Performer", pts: 14, color: colors.info },
            { label: "Meets Expectations", pts: 8, color: colors.warning },
            { label: "Developing", pts: 3, color: colors.danger },
          ]
        },
      ].map(section => (
        <Card key={section.title}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 24 }}>{section.icon}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.white }}>{section.title}</div>
              <div style={{ fontSize: 11, color: colors.gold }}>Max: {section.maxPts} points</div>
            </div>
          </div>
          {section.items.map(item => (
            <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid #333` }}>
              <span style={{ fontSize: 13, color: colors.silver }}>{item.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 60, height: 4, background: `${colors.white}10`, borderRadius: 2 }}>
                  <div style={{ width: `${(item.pts / section.maxPts) * 100}%`, height: "100%", background: item.color, borderRadius: 2 }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: item.color, minWidth: 28, textAlign: "right" }}>{item.pts}</span>
              </div>
            </div>
          ))}
        </Card>
      ))}
      <Card style={{ background: `linear-gradient(135deg, ${colors.darkGray}, ${colors.medGray})`, border: `1px solid ${colors.gold}33` }}>
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <div style={{ fontSize: 20, fontWeight: 300, color: colors.white, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>
            Total Score: <span style={{ color: colors.gold }}>0 — 100</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginTop: 20 }}>
            {[{ label: "High Priority", range: "75+", color: colors.success }, { label: "Medium Priority", range: "50-74", color: colors.gold }, { label: "Low Priority", range: "<50", color: colors.danger }].map(p => (
              <div key={p.label} style={{ padding: 14, background: `${p.color}11`, borderRadius: 8, border: `1px solid ${p.color}33` }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: p.color }}>{p.range}</div>
                <div style={{ fontSize: 10, color: colors.lightGray, textTransform: "uppercase", marginTop: 4 }}>{p.label}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

// ==================== LOGIN SCREEN ====================
const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "dione@loreal.com" && password === "sbn4ever") {
      onLogin();
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px", background: colors.medGray,
    border: `1px solid #444`, borderRadius: 6, color: colors.white,
    fontSize: 14, outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <Card style={{ width: 380, padding: 36 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "0.15em", color: colors.white, fontFamily: "'Playfair Display', serif" }}>
            L'ORÉAL
          </div>
          <div style={{ fontSize: 11, color: colors.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 6, fontWeight: 600 }}>
            SBN Nominations
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, color: colors.silver, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }} placeholder="you@loreal.com" style={inputStyle} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 11, color: colors.silver, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Password</label>
            <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError(""); }} placeholder="••••••••" style={inputStyle} />
          </div>
          {error && (
            <div style={{ padding: "10px 14px", background: `${colors.danger}22`, border: `1px solid ${colors.danger}44`, borderRadius: 6, color: colors.danger, fontSize: 12, marginBottom: 16 }}>
              {error}
            </div>
          )}
          <button type="submit" style={{
            width: "100%", padding: "12px 0", background: colors.gold, border: "none", borderRadius: 6,
            color: colors.black, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.05em",
          }}>
            Sign In
          </button>
        </form>
      </Card>
    </div>
  );
};

// ==================== MAIN APP ====================
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [nominations, setNominations] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleNominate = (emp, course, justification = "", nominatorRole = "BP") => {
    const elig = checkEligibility(emp, course);
    const newNom = {
      id: `NOM-${String(nominations.length + 1).padStart(4, "0")}`,
      employeeId: emp.id,
      employeeName: emp.name,
      courseId: course.id,
      courseName: course.name,
      investment: course.investment,
      eligible: elig.eligible,
      score: calcScore(emp),
      status: "nominated",
      date: new Date().toISOString().slice(0, 10),
      justification,
      nominatorRole,
      priority: null,
      rejectionReason: "",
    };
    setNominations(prev => [...prev, newNom]);
    showToast(`✅ ${emp.name} nominated for ${course.name}`);
  };

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  const navItems = [
    { key: "dashboard", label: "Dashboard", icon: "📊" },
    { key: "courses", label: "Catalog", icon: "📚" },
    { key: "employees", label: "Employees", icon: "👥" },
    { key: "nominations", label: "Nominations", icon: "📋" },
    { key: "seats", label: "Seats", icon: "💺" },
    { key: "criteria", label: "Criteria", icon: "⚙️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#111", fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif", color: colors.white }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: 240, background: colors.black, borderRight: `1px solid #222`, display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50 }}>
        <div style={{ padding: "28px 24px", borderBottom: `1px solid #222` }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", color: colors.white, fontFamily: "'Playfair Display', serif" }}>
            L'ORÉAL
          </div>
          <div style={{ fontSize: 10, color: colors.gold, letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4, fontWeight: 600 }}>
            SBN Nominations
          </div>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setSelectedCourse(null); setPage(item.key); }}
              style={{
                display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px", marginBottom: 4,
                background: page === item.key ? `${colors.gold}15` : "transparent", border: "none",
                borderRadius: 8, color: page === item.key ? colors.gold : colors.silver, cursor: "pointer",
                fontSize: 13, fontWeight: page === item.key ? 600 : 400, textAlign: "left", transition: "all 0.2s",
                borderLeft: page === item.key ? `2px solid ${colors.gold}` : "2px solid transparent",
              }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: `1px solid #222`, fontSize: 10, color: colors.gray }}>
          <div style={{ color: colors.silver, marginBottom: 4 }}>{CURRENT_USER.email}</div>
          <div>LATAM • 2026 • {CURRENT_USER.role}</div>
          <div style={{ marginTop: 4, color: colors.gold }}>~{COUNTRY_SEATS.reduce((s, c) => s + c.seats, 0)} seats available</div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 240, padding: "28px 36px", minHeight: "100vh" }}>
        {page === "dashboard" && <DashboardPage nominations={nominations} onNavigate={setPage} />}
        {page === "courses" && !selectedCourse && <CourseCatalog nominations={nominations} onSelectCourse={c => { setSelectedCourse(c); setPage("course_detail"); }} />}
        {page === "course_detail" && selectedCourse && (
          <CourseNominationView
            course={selectedCourse}
            nominations={nominations}
            onNominate={handleNominate}
            onBack={() => { setSelectedCourse(null); setPage("courses"); }}
          />
        )}
        {page === "employees" && <EmployeeDirectory nominations={nominations} onNominate={handleNominate} />}
        {page === "nominations" && <NominationPage nominations={nominations} setNominations={setNominations} />}
        {page === "seats" && <SeatsOverviewPage nominations={nominations} />}
        {page === "criteria" && <CriteriaPage />}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "14px 24px", background: colors.darkGray,
          border: `1px solid ${colors.gold}44`, borderRadius: 10, color: colors.white, fontSize: 13,
          boxShadow: `0 8px 32px ${colors.black}88`, zIndex: 200, animation: "fadeIn 0.3s ease",
        }}>
          {toast}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
