import { useState } from "react";

// ── CONFIG ─────────────────────────────────────────────────────────
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwG031Wp-c4SVBI26IWKo9gedaL9FyIyYLsMI5ZEk4moQNrfcMxlRf09vooY4_zCxNpQw/exec";
// ───────────────────────────────────────────────────────────────────

// Generate and add event to calendar (works on iOS, Android, Desktop)
function addToCalendar() {
  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Chá de Fralda do José//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:cha-jose-${Date.now()}@example.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z
DTSTART:20260627T143000
DTEND:20260627T153000
SUMMARY:Chá de Fralda do José
DESCRIPTION:Chá de Fralda do José - QI 19, Res. Vivace, Taguatinga
LOCATION:QI 19, Res. Vivace, Taguatinga, Brazil
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cha-jose-2026.ics";
  link.click();
  URL.revokeObjectURL(link.href);
}

// Animated gradient background with subtle blobs
function GradientBg() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 40%, #F8FAFC 100%)",
        }}
      />

      <div
        className="animate-blob absolute rounded-full opacity-10"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, #2563EB 0%, transparent 70%)",
          top: -200,
          right: -150,
          filter: "blur(100px)",
        }}
      />

      <div
        className="animate-blob-2 absolute rounded-full opacity-10"
        style={{
          width: 500,
          height: 500,
          background: "radial-gradient(circle, #0D9488 0%, transparent 70%)",
          bottom: -150,
          left: -120,
          filter: "blur(100px)",
        }}
      />
    </div>
  );
}

// Confirmed person badge — colorful, modern style
function PersonBadge({ name, index }) {
  const colors = [
    { bg: "#E0F2FE", text: "#0369A1", border: "#BAE6FD" },
    { bg: "#CCFBF1", text: "#0D7377", border: "#99F6E4" },
    { bg: "#E0E7FF", text: "#3730A3", border: "#C7D2FE" },
    { bg: "#FCE7F3", text: "#BE185D", border: "#FBCFE8" },
  ];
  const c = colors[index % colors.length];
  return (
    <div
      className="animate-badge-in flex items-center gap-2 px-4 py-2 rounded-2xl border text-sm font-semibold"
      style={{
        animationDelay: `${index * 0.05}s`,
        backgroundColor: c.bg,
        color: c.text,
        borderColor: c.border,
      }}
    >
      <span className="text-base">✓</span>
      <span>{name}</span>
    </div>
  );
}

// Guest input row — modern minimal style
function GuestField({ index, value, onChange, error }) {
  return (
    <div
      className="animate-fade-up flex items-center gap-3"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center border-2"
        style={{
          backgroundColor: "#2563EB",
          borderColor: "#1D4ED8",
        }}
      >
        {index + 1}
      </div>
      <div className="flex-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nome completo"
          className={`w-full px-4 py-3 rounded-xl bg-white border text-sm font-body text-ink placeholder-gray-400 outline-none transition-all
            ${
              error
                ? "border-red-400 ring-2 ring-red-100"
                : "border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            }`}
        />
        {error && (
          <p className="text-red-500 text-xs mt-1">
            Nome completo (nome e sobrenome ) obrigatório.
          </p>
        )}
      </div>
    </div>
  );
}

// Success screen
function SuccessScreen({ names }) {
  return (
    <div className="flex flex-col items-center text-center py-8 gap-6">
      <div className="animate-pop text-7xl">🎉</div>
      <div>
        <h3 className="font-display text-3xl font-bold text-ink mb-2">
          Presença confirmada!
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
          Anotamos tudo. Mal podemos esperar para celebrar com vocês os
          preparativos do nascimento do José!
        </p>
      </div>
      <div className="w-full bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl border-2 border-blue-100 p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">
          ✓ Lista confirmada · {names.length}{" "}
          {names.length === 1 ? "pessoa" : "pessoas"}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {names.map((name, i) => (
            <PersonBadge key={i} name={name} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [mainName, setMainName] = useState("");
  const [guests, setGuests] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [confirmedNames, setConfirmedNames] = useState([]);
  const [toast, setToast] = useState("");
  const [showKidsNote, setShowKidsNote] = useState(false);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  const addGuest = () => {
    if (guests.length < 10) {
      setGuests((g) => [...g, ""]);
      setShowKidsNote(true);
    }
  };

  const removeGuest = () => {
    if (guests.length > 0) {
      const next = guests.slice(0, -1);
      setGuests(next);
      if (next.length === 0) setShowKidsNote(false);
    }
  };

  const updateGuest = (i, val) => {
    setGuests((g) => g.map((v, idx) => (idx === i ? val : v)));
  };

  const validate = () => {
    const e = {};
    const isFullName = (v) => v.trim().split(/\s+/).length >= 2;
    if (!isFullName(mainName)) e.main = true;
    guests.forEach((g, i) => {
      if (!isFullName(g)) e[`guest_${i}`] = true;
    });
    setErrors(e);
    if (Object.keys(e).length > 0)
      showToast("Preencha todos os nomes completos (nome e sobrenome).");
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const allNames = [mainName.trim(), ...guests.map((g) => g.trim())];
    const payload = {
      names: allNames,
      responsavel: mainName.trim(),
      timestamp: new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      }),
    };
    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      setConfirmedNames(allNames);
      setSuccess(true);
    } catch {
      showToast("Ops! Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-white font-body overflow-x-hidden">
      <GradientBg />

      {/* ── HERO SECTION ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-8 pb-8 min-h-[100svh]">
        {/* Main hero content */}
        <div className="relative z-20 max-w-3xl w-full flex flex-col items-center justify-center">
          {/* Image container */}
          <div className="relative mb-4">
            {/* Baby Looney Tunes illustration */}
            <div
              className="animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <div
                className="animate-bounce-gentle"
                style={{
                  width: "min(240px, 60vw)",
                  height: "min(240px, 60vw)",
                  margin: "0 auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/bb.webp"
                  alt="Baby Looney Tunes"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Title */}
          <div
            className="animate-fade-up mb-6 sm:mb-8"
            style={{ animationDelay: "0.2s" }}
          >
            <h1
              className="font-display font-800 leading-tight text-ink"
              style={{ fontSize: "clamp(36px, 10vw, 72px)" }}
            >
              Chá de
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #0D9488 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Fralda
              </span>
              <br />
              do José
            </h1>
          </div>

          {/* CTA Button */}
          <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <a
              href="#confirmar"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm sm:text-base px-8 sm:px-10 py-3 sm:py-4 rounded-full shadow-2xl transition-all hover:shadow-3xl hover:-translate-y-1 active:translate-y-0"
            >
              Confirmar presença
              <span className="text-lg sm:text-xl">↓</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── FORM SECTION ── */}
      <section
        id="confirmar"
        className="relative z-10 px-5 pb-24 max-w-xl mx-auto"
      >
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3">
            Confirmação de presença
          </p>
          <h2 className="font-display text-5xl sm:text-6xl font-bold text-ink mb-3 leading-tight">
            Quem vai marcar
            <br className="sm:hidden" /> presença?
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Informe o nome completo de todos. Os nomes são necessários para a
            lista de acesso ao condomínio.
          </p>
        </div>

        <div className="bg-white rounded-4xl border-2 border-blue-100 p-8 shadow-2xl shadow-blue-100/30">
          {success ? (
            <SuccessScreen names={confirmedNames} />
          ) : (
            <div className="flex flex-col gap-6">
              {/* Main person input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
                  Seu nome completo
                </label>
                <input
                  type="text"
                  value={mainName}
                  onChange={(e) => setMainName(e.target.value)}
                  placeholder="Ex: Gustavo Fernandes"
                  autoComplete="off"
                  className={`w-full px-5 py-4 rounded-2xl bg-blue-50 border-2 text-sm font-body text-ink placeholder-gray-400 outline-none transition-all
                    ${
                      errors.main
                        ? "border-red-400 ring-2 ring-red-100"
                        : "border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    }`}
                />
                {errors.main && (
                  <p className="text-red-500 text-xs mt-1 font-semibold">
                    Nome completo obrigatório.
                  </p>
                )}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

              {/* Guest counter section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">
                  Acompanhantes
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={removeGuest}
                    disabled={guests.length === 0}
                    className="w-11 h-11 rounded-full border-2 border-blue-200 bg-white text-blue-600 text-2xl font-bold flex items-center justify-center transition-all hover:bg-blue-50 hover:border-blue-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                  >
                    −
                  </button>
                  <span className="text-4xl font-black text-ink min-w-[40px] text-center">
                    {guests.length}
                  </span>
                  <button
                    onClick={addGuest}
                    disabled={guests.length >= 10}
                    className="w-11 h-11 rounded-full border-2 border-blue-200 bg-white text-blue-600 text-2xl font-bold flex items-center justify-center transition-all hover:bg-blue-50 hover:border-blue-400 disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                  >
                    +
                  </button>
                  <span className="text-sm font-semibold text-gray-600">
                    {guests.length === 0
                      ? "Sem acompanhantes"
                      : guests.length === 1
                        ? "1 acompanhante"
                        : `${guests.length} acompanhantes`}
                  </span>
                </div>

                {/* Kids info note */}
                {showKidsNote && (
                  <div className="animate-fade-up mt-4 flex items-start gap-3 bg-teal-50 border-2 border-teal-200 rounded-2xl px-5 py-4">
                    <span className="text-base mt-0.5 flex-shrink-0">ℹ️</span>
                    <p className="text-xs text-teal-800 leading-relaxed font-medium">
                      <strong>Crianças até 6 anos</strong> não precisam ser
                      incluídas — apenas maiores de 6 anos.
                    </p>
                  </div>
                )}
              </div>

              {/* Guest fields */}
              {guests.length > 0 && (
                <div className="flex flex-col gap-4">
                  {guests.map((g, i) => (
                    <GuestField
                      key={i}
                      index={i}
                      value={g}
                      onChange={(v) => updateGuest(i, v)}
                      error={!!errors[`guest_${i}`]}
                    />
                  ))}
                </div>
              )}

              <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent" />

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base rounded-full flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:-translate-y-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-5 h-5 rounded-full border-3 border-white/30 border-t-white inline-block" />
                    Enviando…
                  </>
                ) : (
                  <>
                    Confirmar presença
                    <span>🎉</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="relative z-10 text-center pb-8 text-xs font-semibold text-gray-500">
        Feito com 💙 para o José
      </footer>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-sm font-bold px-6 py-3 rounded-full shadow-xl z-50 animate-fade-up whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  );
}
