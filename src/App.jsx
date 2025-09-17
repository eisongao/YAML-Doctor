import React, { useMemo, useRef, useState, useEffect } from "react";
import { Download, Upload, Wand2, CheckCircle2, AlertTriangle, ClipboardCopy, Trash2 } from "lucide-react";
import * as YAML from "yaml";
import * as RadixSwitch from "@radix-ui/react-switch";

/** ---------------- I18N ---------------- */
const translations = {
  en: {
    app_title: "YAML Doctor · Online Syntax Validator & Auto Fixer",
    app_desc:
      "This tool runs locally in the browser, no data uploaded. Supports validate, format, auto fix, JSON to YAML, one-click download.",
    autofmt: "Auto format after fix",
    input_title: "Input YAML / JSON",
    clear: "Clear",
    upload: "Upload",
    validate: "Validate",
    format: "Format",
    json2yaml: "JSON→YAML",
    load_sample: "Load Sample",
    result_title: "Result / Fix",
    auto_fix: "Auto Fix",
    copy_fixed: "Copy Fixed",
    download_fixed: "Download Fixed",
    error_first: "Error (First One):",
    fixed_result: "Fixed Result",
    line_preview: "Line Numbers (Read Only)",
    tips:
      "Tips: Auto fix uses heuristic strategies for common issues (Tabs, smart quotes, JSON commas, indentation, quoting values with colons). For complex syntax, manual review recommended.",
    ph_input: "Paste YAML here or drag .yml/.yaml/.json file...",
    ph_fixed: "Click 'Auto Fix' to show fixed/formatted result...",
    status_ok: "Syntax Valid",
    status_bad: "Issues Found",
    lang_label: "Language",
  },
  zh: {
    app_title: "YAML Doctor · 在线语法校验与自动修复",
    app_desc:
      "本工具在浏览器本地运行，不上传数据。支持：校验、格式化、自动修复、JSON 转 YAML、一键下载。",
    autofmt: "修复后自动格式化",
    input_title: "输入 YAML / JSON",
    clear: "清空",
    upload: "上传",
    validate: "校验",
    format: "格式化",
    json2yaml: "JSON→YAML",
    load_sample: "载入示例",
    result_title: "结果 / 修复",
    auto_fix: "自动修复",
    copy_fixed: "复制修复结果",
    download_fixed: "下载修复结果",
    error_first: "首条错误：",
    fixed_result: "修复后的结果",
    line_preview: "行号预览（只读）",
    tips:
      "提示：自动修复使用启发式策略处理常见问题（Tab、智能引号、JSON 尾逗号、缩进、含冒号的值等）。复杂语法建议人工复核。",
    ph_input: "在此粘贴 YAML，或拖放 .yml/.yaml/.json 文件……",
    ph_fixed: "点击「自动修复」以显示修复/格式化后的结果……",
    status_ok: "语法有效",
    status_bad: "发现问题",
    lang_label: "语言",
  },
  fr: {
    app_title: "YAML Doctor · Validateur & Réparateur automatique",
    app_desc:
      "Cet outil s’exécute localement dans le navigateur, sans envoi de données. Fonctions : valider, formater, réparer automatiquement, JSON vers YAML, téléchargement en un clic.",
    autofmt: "Mettre en forme après réparation",
    input_title: "Entrée YAML / JSON",
    clear: "Effacer",
    upload: "Téléverser",
    validate: "Valider",
    format: "Formater",
    json2yaml: "JSON→YAML",
    load_sample: "Charger l’exemple",
    result_title: "Résultat / Réparation",
    auto_fix: "Réparation auto",
    copy_fixed: "Copier le résultat",
    download_fixed: "Télécharger le résultat",
    error_first: "Première erreur :",
    fixed_result: "Résultat corrigé",
    line_preview: "Numéros de ligne (Lecture seule)",
    tips:
      "Conseil : la réparation automatique utilise des heuristiques (tabulations, guillemets typographiques, virgules JSON finales, indentation, valeurs contenant des deux-points). Pour les cas complexes, vérifiez manuellement.",
    ph_input: "Collez du YAML ici ou glissez un fichier .yml/.yaml/.json…",
    ph_fixed: "Cliquez « Réparation auto » pour afficher le résultat…",
    status_ok: "Syntaxe valide",
    status_bad: "Problèmes détectés",
    lang_label: "Langue",
  },
};

function useI18n(defaultLang = "zh") {
  const [lang, setLang] = useState(defaultLang);
  const t = (key) => translations[lang]?.[key] ?? key;
  return { lang, setLang, t };
}

/** ---------- Tiny UI primitives (no shadcn required) ---------- */
function cn(...a) { return a.filter(Boolean).join(" "); }

function Button({ variant = "default", className, ...props }) {
  const base = "inline-flex items-center justify-center rounded-2xl px-3 py-2 text-sm font-medium transition";
  const styles = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-slate-300 bg-white hover:bg-slate-50",
    secondary: "bg-slate-100 hover:bg-slate-200",
    ghost: "hover:bg-slate-100",
  }[variant] || "";
  return <button className={cn(base, styles, className)} {...props} />;
}

function Card({ className, ...props }) {
  return <div className={cn("rounded-2xl border bg-white", className)} {...props} />;
}
function CardContent({ className, ...props }) {
  return <div className={cn("p-4 md:p-6", className)} {...props} />;
}

function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "w-full min-h-[160px] rounded-2xl border border-slate-200 bg-white p-3 outline-none focus:ring-2 focus:ring-slate-200 font-mono text-sm",
        className
      )}
      spellCheck={false}
      {...props}
    />
  );
}

// Radix-based Switch wrapper with the same API you used
function Switch({ id, checked, onCheckedChange }) {
  return (
    <div className="inline-flex items-center gap-2">
      <RadixSwitch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "relative h-6 w-11 cursor-pointer rounded-full border border-slate-300",
          checked ? "bg-blue-600" : "bg-slate-200"
        )}
      >
        <RadixSwitch.Thumb
          className={cn(
            "block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform",
            checked && "translate-x-[11px]"
          )}
        />
      </RadixSwitch.Root>
    </div>
  );
}

/**
 * Online YAML Syntax Validator & Auto Fixer
 * - Runs offline in browser (using eemeli/yaml)
 * - Features: Validate, Format, Auto Fix (heuristic steps), JSON to YAML, Download/Upload, Copy Result
 * - Design: No backend dependency, embeddable in any page
 */
export default function App() {
  const { lang, setLang, t } = useI18n("zh"); // 默认中文
  const [copyBtnLabel, setCopyBtnLabel] = useState(t("copy_fixed"));
  useEffect(() => {
	setCopyBtnLabel(t("copy_fixed"));
  }, [lang]);
  const [text, setText] = useState(defaultSample);
  const [result, setResult] = useState(null);
  const [fixed, setFixed] = useState("");
  const [autoFormatOnFix, setAutoFormatOnFix] = useState(true);
  const fileRef = useRef(null);

  const lines = useMemo(() => text.split(/\r?\n/), [text]);

  function indexToLineCol(src, index) {
    let line = 1, col = 1;
    for (let i = 0; i < index && i < src.length; i++) {
      if (src[i] === "\n") { line++; col = 1; } else { col++; }
    }
    return { line, col };
  }

  function validate(src) {
    const doc = YAML.parseDocument(src, { prettyErrors: true });
    const ok = !doc.errors?.length;
    let errors = [];
    if (!ok) {
      errors = doc.errors.map((e) => {
        const pos = e?.pos || [0, 0];
        const { line, col } = indexToLineCol(src, pos[0]);
        return { message: e.message, line, col };
      });
    }
    return { ok, errors, doc };
  }

  function handleValidate() {
    const res = validate(text);
    setResult(res);
    if (res.ok) setFixed("");
  }

  function handleFormat() {
    try {
      const doc = YAML.parseDocument(text);
      if (doc.errors?.length) throw new Error(doc.errors[0].message);
      const pretty = doc.toString({ indent: 2, lineWidth: 120 });
      setFixed(pretty);
      setResult({ ok: true, errors: [], doc });
    } catch (e) {
      setResult({ ok: false, errors: [{ message: e.message, line: 1, col: 1 }], doc: null });
      setFixed("");
    }
  }

  function handleJsonToYaml() {
    try {
      const obj = JSON.parse(text);
      const pretty = YAML.stringify(obj, { indent: 2, lineWidth: 120 });
      setFixed(pretty);
      setResult({ ok: true, errors: [], doc: null });
    } catch (e) {
      setResult({ ok: false, errors: [{ message: "Invalid JSON: " + e.message, line: 1, col: 1 }], doc: null });
      setFixed("");
    }
  }

  function fixIndentBlocks(input) {
    const lines = input.split(/\r?\n/);
    const lead = (s) => { let n = 0; while (n < s.length && s[n] === " ") n++; return n; };
    const ign = (s) => /^\s*(#.*)?$/.test(s);

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (ign(line)) { i++; continue; }
      const indent = lead(line);

      if (
        /^[\s-]*[^#\n]+:\s*(#.*)?$/.test(line) &&
        !/^\s*-\s+[^#\n]+:\s*(#.*)?$/.test(line)
      ) {
        const parentIndent = indent;
        const siblings = [{ index: i, indent }];
        let j = i + 1;
        while (j < lines.length) {
          const l = lines[j];
          if (ign(l)) { j++; continue; }
          const ind = lead(l);
          if (ind < parentIndent) break;
          if (
            ind === parentIndent &&
            /^[\s-]*[^#\n]+:\s*(#.*)?$/.test(l) &&
            !/^\s*-\s+[^#\n]+:\s*(#.*)?$/.test(l)
          ) siblings.push({ index: j, indent: ind });
          j++;
        }

        const minSiblingIndent = Math.min(...siblings.map((s) => s.indent));
        for (const { index } of siblings) {
          const l = lines[index];
          const ind = lead(l);
          lines[index] = " ".repeat(minSiblingIndent) + l.slice(ind);
        }

        for (const { index } of siblings) {
          let k = index + 1;
          let minChildIndent = Infinity;
          while (k < lines.length) {
            const l = lines[k];
            if (ign(l)) { k++; continue; }
            const ind = lead(l);
            if (ind <= minSiblingIndent) break;
            minChildIndent = Math.min(minChildIndent, ind);
            k++;
          }
          if (minChildIndent !== Infinity) {
            const target = minSiblingIndent + 2;
            const delta = target - minChildIndent;
            for (let m = index + 1; m < k; m++) {
              const l = lines[m];
              if (ign(l)) continue;
              const ind = lead(l);
              if (ind >= minChildIndent) {
                lines[m] = delta > 0 ? " ".repeat(delta) + l : l.slice(Math.min(-delta, ind));
              }
            }
          }
        }
        i = j;
      } else {
        i++;
      }
    }
    return lines.join("\n");
  }

  function handleAutoFix() {
    const attempts = [];
    attempts.push({ name: "Original", apply: (s) => s });
    attempts.push({
      name: "Clean characters / Tab->spaces",
      apply: (s) => s.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n").replace(/\t/g, "  "),
    });
    attempts.push({
      name: "Replace smart quotes and full-width",
      apply: (s) =>
        s
          .replace(/[“”]/g, '"')
          .replace(/[‘’]/g, "'")
          .replace(/：/g, ": ")
          .replace(/，/g, ", ")
          .replace(/；/g, "; ")
          .replace(/（/g, "(")
          .replace(/）/g, ")")
          .replace(/【/g, "[")
          .replace(/】/g, "]"),
    });
    attempts.push({
      name: "Remove trailing commas",
      // safer: only remove a final comma if nothing but comment/EOL follows
      apply: (s) => s.replace(/:(.*?)\s*,\s*(#.*)?$/gm, (_m, g1, g2) => `:${g1}${g2 ? " " + g2 : ""}`),
    });
    attempts.push({ name: "Fix indentation", apply: fixIndentBlocks });
    attempts.push({
      name: "JSON->YAML",
      apply: (s) => {
        const t = s.trim();
        const looksJson = (t.startsWith("{") && t.endsWith("}")) || (t.startsWith("[") && t.endsWith("]"));
        if (!looksJson) return s;
        try {
          const obj = JSON.parse(s);
          return YAML.stringify(obj, { indent: 2 });
        } catch {
          return s;
        }
      },
    });
    attempts.push({
      name: "Quote values with colons",
      apply: (s) =>
        s.replace(
          /(^\s*[^:#\n]+:\s*)([^"'[{ \n][^\n]*?:[^\n]*?)(?=\s*(#|$))/gm,
          (_m, g1, g2) => `${g1}"${g2.replace(/"/g, '\\"')}"`
        ),
    });

    let lastErr = null;
    let candidate = text;
    for (const step of attempts) {
      candidate = step.apply(candidate);
      const res = validate(candidate);
      if (res.ok) {
        const pretty = autoFormatOnFix
          ? YAML.stringify(res.doc?.toJSON(), { indent: 2, lineWidth: 120 })
          : candidate;
        setFixed(pretty);
        setResult({ ok: true, errors: [], doc: res.doc });
        return;
      } else {
        lastErr = res.errors[0] || null;
      }
    }
    setFixed("");
    setResult({
      ok: false,
      errors: lastErr
        ? [lastErr]
        : [{ message: "Cannot auto fix, please check manually.", line: 1, col: 1 }],
      doc: null,
    });
  }

  function handleCopy(str) {
	   if (!str) return;
	   navigator.clipboard.writeText(str);
	   const copied =
		 lang === "zh" ? "已复制" :
		 lang === "fr" ? "Copié" : "Copied";
	   setCopyBtnLabel(copied);
	   setTimeout(() => setCopyBtnLabel(t("copy_fixed")), 3000);
  }

  function handleDownload(str, name = "fixed.yaml") {
    const blob = new Blob([str], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    file.text().then((t) => setText(t));
  }

  function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((t) => setText(t));
  }

  const status = result?.ok ? (
    <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5"/> {t("status_ok")}</div>
  ) : result ? (
    <div className="flex items-center gap-2 text-amber-600"><AlertTriangle className="h-5 w-5"/> {t("status_bad")}</div>
  ) : null;

  return (
    <div className="w-full min-h-screen p-6 md:p-10 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Top bar: title + language + autoformat */}
<header className="flex flex-col md:flex-row md:items-center gap-3">
  {/* 标题＋副标题：在 md 及以上占满一行并文本居中 */}
  <div className="flex-1 text-center space-y-2">
    <h1 className="text-2xl md:text-3xl font-bold">{t("app_title")}</h1>
    <p className="text-slate-600">{t("app_desc")}</p>
  </div>

  {/* 右侧语言 & 开关：小屏居中，md 起靠右 */}
  <div className="flex items-center gap-4 justify-center md:justify-end md:ml-auto">
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-600">{t("lang_label")}:</label>
      <select
        className="rounded-xl border border-slate-300 bg-white px-2 py-1 text-sm"
        value={lang}
        onChange={(e) => setLang(e.target.value)}
      >
        <option value="zh">中文</option>
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>

    <div className="flex items-center gap-2">
      <Switch checked={autoFormatOnFix} onCheckedChange={setAutoFormatOnFix} id="autofmt" />
      <label htmlFor="autofmt" className="text-sm text-slate-600">
        {t("autofmt")}
      </label>
    </div>
  </div>
</header>


        <div className="grid md:grid-cols-2 gap-6">
          {/* Input */}
          <Card className="shadow-sm border-slate-200">
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">{t("input_title")}</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setText("")}>
                    <Trash2 className="h-4 w-4 mr-1"/>{t("clear")}
                  </Button>
                  <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1"/>{t("upload")}
                  </Button>
                  <input ref={fileRef} type="file" accept=".yml,.yaml,.json,.txt" className="hidden" onChange={onPickFile}/>
                </div>
              </div>

              <div
                className="rounded-2xl border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-200"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <Textarea
                  className="min-h-[340px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("ph_input")}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Button onClick={handleValidate}>{t("validate")}</Button>
                <Button variant="outline" onClick={handleFormat}>{t("format")}</Button>
                <Button variant="outline" onClick={handleJsonToYaml}>{t("json2yaml")}</Button>
                <Button variant="ghost" onClick={() => setText(defaultSample)}>{t("load_sample")}</Button>
              </div>
            </CardContent>
          </Card>

            {/* Result */}
          <Card className="shadow-sm border-slate-200">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{t("result_title")}</h2>
                {status}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleAutoFix}><Wand2 className="h-4 w-4 mr-1"/>{t("auto_fix")}</Button>
                <Button variant="outline" disabled={!fixed} onClick={() => handleCopy(fixed)}>
				  <ClipboardCopy className="h-4 w-4 mr-1"/>{copyBtnLabel}
				</Button>
                <Button variant="outline" disabled={!fixed} onClick={() => handleDownload(fixed)}>
                  <Download className="h-4 w-4 mr-1"/>{t("download_fixed")}
                </Button>
              </div>

              {result && !result.ok && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="font-medium mb-2">{t("error_first")}</p>
                  {result.errors.slice(0, 1).map((e, i) => (
                    <div key={i} className="text-sm leading-relaxed">
                      <span className="font-mono bg-white/70 px-2 py-0.5 rounded">Line {e.line}, Col {e.col}</span>
                      <span className="ml-2">{e.message}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm text-slate-600">{t("fixed_result")}</h3>
                <Textarea
                  className="min-h-[260px]"
                  value={fixed}
                  onChange={(e) => setFixed(e.target.value)}
                  placeholder={t("ph_fixed")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Line Number Preview */}
        <Card className="shadow-sm border-slate-200">
          <CardContent>
            <h2 className="font-semibold mb-3">{t("line_preview")}</h2>
            <pre className="overflow-auto max-h-72 rounded-xl border bg-slate-50 p-4 text-xs leading-6">
              {lines.map((l, i) => (
                <div key={i} className="whitespace-pre">
                  <span className="inline-block w-10 text-right mr-3 text-slate-400 select-none">{i + 1}</span>
                  <span>{l || "\u00A0"}</span>
                </div>
              ))}
            </pre>
          </CardContent>
        </Card>

        <footer className="text-center text-xs text-slate-500 py-4">
          <p>{t("tips")}</p>
        </footer>
      </div>
    </div>
  );
}

const defaultSample = `# Sample with common issues (Tab, smart quotes, JSON comma)
root:
\tname: "Frigate NVR",
  version:  0.16
  cameras: 
    - id: front_cam
      url: rtsp://user:pass@ip/profile1
      detect: true
      note: 值中含有:冒号
`;
