import React, { useMemo, useRef, useState, useEffect } from "react";
import { Download, Upload, Wand2, CheckCircle2, AlertTriangle, ClipboardCopy, Trash2, AlertCircle, Zap, Camera, Settings, MapPin, Film, Image, Mic, Palette, Target } from "lucide-react";
import * as YAML from "yaml";
import * as RadixSwitch from "@radix-ui/react-switch";

/** ---------------- I18N ---------------- */
const translations = {
  en: {
    app_title: "Frigate YAML Doctor · NVR Config Validator",
    app_desc: "Specialized YAML validator for Frigate NVR configuration. Validates syntax and Frigate-specific schema rules.",
    autofmt: "Auto format after fix",
    input_title: "Frigate Config (YAML)",
    clear: "Clear",
    upload: "Upload",
    validate: "Validate",
    format: "Format",
    load_sample: "Load Sample",
    result_title: "Validation Result",
    auto_fix: "Auto Fix",
    copy_fixed: "Copy Fixed",
    download_fixed: "Download Fixed",
    error_first: "First Error:",
    fixed_result: "Fixed Result",
    line_preview: "Line Numbers",
    tips: "This validator checks Frigate-specific rules like camera names, required fields, PTZ settings, zone coordinates, and configuration constraints.",
    ph_input: "Paste your Frigate config.yaml here or drag .yml/.yaml file...",
    ph_fixed: "Click 'Auto Fix' to see corrected configuration...",
    status_ok: "Config Valid",
    status_bad: "Config Issues",
    lang_label: "Language",
    frigate_specific: "Frigate Rules",
    camera_errors: "Camera Configuration Errors",
    global_errors: "Global Configuration Errors",
    missing_required: "Missing required field",
    invalid_pattern: "Invalid pattern",
    invalid_range: "Value out of range",
    zone_errors: "Zone Configuration Errors",
    ptz_errors: "PTZ/Autotrack Errors",
    record_errors: "Recording Errors",
    snapshot_errors: "Snapshot Errors"
  },
  zh: {
    app_title: "Frigate YAML Doctor · NVR 配置校验器",
    app_desc: "专为 Frigate NVR 配置设计的 YAML 校验工具。验证语法和 Frigate 特定规则。",
    autofmt: "修复后自动格式化",
    input_title: "Frigate 配置 (YAML)",
    clear: "清空",
    upload: "上传",
    validate: "校验",
    format: "格式化",
    load_sample: "载入示例",
    result_title: "校验结果",
    auto_fix: "自动修复",
    copy_fixed: "复制修复结果",
    download_fixed: "下载修复结果",
    error_first: "首条错误：",
    fixed_result: "修复后的结果",
    line_preview: "行号预览",
    tips: "此校验器检查 Frigate 特定规则，如相机名称、必需字段、PTZ设置、区域坐标和配置约束。",
    ph_input: "在此粘贴您的 frigate config.yaml，或拖放 .yml/.yaml 文件...",
    ph_fixed: "点击「自动修复」查看修正后的配置...",
    status_ok: "配置有效",
    status_bad: "配置问题",
    lang_label: "语言",
    frigate_specific: "Frigate 规则",
    camera_errors: "相机配置错误",
    global_errors: "全局配置错误",
    missing_required: "缺少必需字段",
    invalid_pattern: "格式不正确",
    invalid_range: "数值超出范围",
    zone_errors: "区域配置错误",
    ptz_errors: "PTZ/自动跟踪错误",
    record_errors: "录像配置错误",
    snapshot_errors: "快照配置错误"
  },
  fr: {
	app_title: "Frigate YAML Doctor · Validateur de configuration NVR",
	app_desc: "Outil de validation YAML spécialement conçu pour la configuration Frigate NVR. Vérifie la syntaxe et les règles spécifiques à Frigate.",
	autofmt: "Formatage automatique après correction",
	input_title: "Configuration Frigate (YAML)",
	clear: "Effacer",
	upload: "Téléverser",
	validate: "Valider",
	format: "Formater",
	load_sample: "Charger un exemple",
	result_title: "Résultat de la validation",
	auto_fix: "Correction automatique",
	copy_fixed: "Copier la configuration corrigée",
	download_fixed: "Télécharger la configuration corrigée",
	error_first: "Première erreur :",
	fixed_result: "Résultat corrigé",
	line_preview: "Aperçu avec numéros de ligne",
	tips: "Ce validateur vérifie les règles spécifiques à Frigate, comme les noms de caméras, les champs obligatoires, les réglages PTZ, les coordonnées de zones et les contraintes de configuration.",
	ph_input: "Collez ici votre config.yaml de Frigate ou déposez un fichier .yml/.yaml...",
	ph_fixed: "Cliquez sur « Correction automatique » pour voir la configuration corrigée...",
	status_ok: "Configuration valide",
	status_bad: "Problèmes de configuration",
	lang_label: "Langue",
	frigate_specific: "Règles Frigate",
	camera_errors: "Erreurs de configuration des caméras",
	global_errors: "Erreurs de configuration globales",
	missing_required: "Champ obligatoire manquant",
	invalid_pattern: "Format invalide",
	invalid_range: "Valeur hors plage",
	zone_errors: "Erreurs de configuration des zones",
	ptz_errors: "Erreurs PTZ/Suivi automatique",
	record_errors: "Erreurs d’enregistrement",
	snapshot_errors: "Erreurs de capture d’images"
  },
};

function useI18n(defaultLang = "zh") {
  const [lang, setLang] = useState(defaultLang);
  const t = (key) => translations[lang]?.[key] ?? key;
  return { lang, setLang, t };
}

/** ---------- UI Primitives ---------- */
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

/** ---------- Enhanced Frigate Schema Validation ---------- */
const CAMERA_NAME_REGEX = /^[a-zA-Z0-9_-]+$/;
const VALID_CAMERA_TYPES = ['generic', 'lpr'];
const VALID_PROVIDERS = ['openai', 'azure_openai', 'gemini', 'ollama'];
const VALID_ZOOM_MODES = ['disabled', 'absolute', 'relative'];
const VALID_RETAIN_MODES = ['all', 'motion', 'active_objects'];
const VALID_RECORD_QUALITIES = ['very_low', 'low', 'medium', 'high', 'very_high'];
const VALID_TIMESTAMP_POSITIONS = ['tl', 'tr', 'bl', 'br'];
const VALID_TIMESTAMP_EFFECTS = ['solid', 'shadow'];

function validateCoordinateString(coordStr) {
  if (!coordStr) return false;
  
  // Check for list format: "1.0,0.5,0.5,0.5,0.5,1.0,1.0,1.0"
  if (typeof coordStr === 'string' && coordStr.includes(',')) {
    const points = coordStr.split(',');
    if (points.length % 2 !== 0) return false;
    
    for (let i = 0; i < points.length; i += 2) {
      const x = parseFloat(points[i]);
      const y = parseFloat(points[i + 1]);
      if (isNaN(x) || isNaN(y) || x < 0 || x > 1 || y < 0 || y > 1) {
        return false;
      }
    }
    return true;
  }
  
  // Check for array format: ["1.0,0.5", "0.5,0.5", "0.5,1.0", "1.0,1.0"]
  if (typeof coordStr === 'string' && coordStr.startsWith('[')) {
    try {
      const coords = JSON.parse(coordStr);
      if (!Array.isArray(coords)) return false;
      
      for (const point of coords) {
        if (typeof point !== 'string' || !point.includes(',')) return false;
        const [x, y] = point.split(',').map(p => parseFloat(p));
        if (isNaN(x) || isNaN(y) || x < 0 || x > 1 || y < 0 || y > 1) {
          return false;
        }
      }
      return coords.length >= 3; // At least 3 points for a polygon
    } catch {
      return false;
    }
  }
  
  // Direct array format
  if (Array.isArray(coordStr)) {
    for (const point of coordStr) {
      if (typeof point !== 'string' || !point.includes(',')) return false;
      const [x, y] = point.split(',').map(p => parseFloat(p));
      if (isNaN(x) || isNaN(y) || x < 0 || x > 1 || y < 0 || y > 1) {
        return false;
      }
    }
    return coordStr.length >= 3;
  }
  
  return false;
}

function processEnvironmentVariables(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const processed = Array.isArray(obj) ? [] : {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.match(/^\$\{[A-Z_][A-Z_0-9]*\}$/)) {
      // Found environment variable, replace with placeholder for validation
      const varName = value.slice(2, -1);
      processed[key] = `ENV_${varName}`; // Placeholder for validation
    } else if (value && typeof value === 'object') {
      processed[key] = processEnvironmentVariables(value);
    } else {
      processed[key] = value;
    }
  }
  
  return processed;
}

function validateFrigateConfig(obj) {
  const errors = [];
  
  // Process environment variables first
  obj = processEnvironmentVariables(obj);

  // Global validation
  if (obj.cameras) {
    if (!Array.isArray(obj.cameras) && typeof obj.cameras !== 'object') {
      errors.push({ 
        message: "cameras must be an array or object", 
        path: ['cameras'],
        type: 'global',
        severity: 'error'
      });
    }
  }

  if (obj.ffmpeg) {
    if (obj.ffmpeg.hwaccel_args && obj.ffmpeg.hwaccel_args !== 'auto' && 
        typeof obj.ffmpeg.hwaccel_args !== 'string' && !Array.isArray(obj.ffmpeg.hwaccel_args)) {
      errors.push({ 
        message: "ffmpeg.hwaccel_args must be a string, array, or 'auto'", 
        path: ['ffmpeg', 'hwaccel_args'],
        type: 'global',
        severity: 'error'
      });
    }
  }

  // Enhanced ONVIF/PTZ validation - now checking both global and per-camera
  function validateOnvif(onvif, basePath = ['onvif']) {
    if (onvif.host && !onvif.host.trim()) {
      errors.push({
        message: "onvif.host cannot be empty string",
        path: [...basePath, 'host'],
        type: 'global',
        severity: 'error'
      });
    }
    
    if (onvif.port && (onvif.port < 1 || onvif.port > 65535)) {
      errors.push({
        message: "onvif.port must be between 1 and 65535",
        path: [...basePath, 'port'],
        type: 'global',
        severity: 'error'
      });
    }
    
    if (onvif.autotracking && onvif.autotracking.enabled) {
      if (onvif.autotracking.zoom_factor && (onvif.autotracking.zoom_factor < 0.1 || onvif.autotracking.zoom_factor > 0.75)) {
        errors.push({
          message: "onvif.autotracking.zoom_factor must be between 0.1 and 0.75",
          path: [...basePath, 'autotracking', 'zoom_factor'],
          type: 'ptz',
          severity: 'error'
        });
      }
      
      if (onvif.autotracking.timeout && onvif.autotracking.timeout < 1) {
        errors.push({
          message: "onvif.autotracking.timeout must be at least 1 second",
          path: [...basePath, 'autotracking', 'timeout'],
          type: 'ptz',
          severity: 'error'
        });
      }
      
      if (onvif.autotracking.movement_weights) {
        let weights = [];
        if (Array.isArray(onvif.autotracking.movement_weights)) {
          weights = onvif.autotracking.movement_weights.map(w => parseFloat(w));
        } else if (typeof onvif.autotracking.movement_weights === 'string') {
          weights = onvif.autotracking.movement_weights.split(',').map(w => parseFloat(w.trim()));
        }
        
        if (weights.length !== 0 && weights.length !== 6) {
          errors.push({
            message: "onvif.autotracking.movement_weights must be empty or contain exactly 6 numeric values",
            path: [...basePath, 'autotracking', 'movement_weights'],
            type: 'ptz',
            severity: 'error'
          });
        } else if (weights.length === 6) {
          const invalidWeights = weights.filter(w => isNaN(w) || w < 0);
          if (invalidWeights.length > 0) {
            errors.push({
              message: "All onvif.autotracking.movement_weights values must be non-negative numbers",
              path: [...basePath, 'autotracking', 'movement_weights'],
              type: 'ptz',
              severity: 'error'
            });
          }
        }
      }
      
      if (onvif.autotracking.zooming && !VALID_ZOOM_MODES.includes(onvif.autotracking.zooming)) {
        errors.push({
          message: `onvif.autotracking.zooming must be one of: ${VALID_ZOOM_MODES.join(', ')}`,
          path: [...basePath, 'autotracking', 'zooming'],
          type: 'ptz',
          severity: 'error'
        });
      }
    }
  }

  // Check global onvif if present
  if (obj.onvif) {
    validateOnvif(obj.onvif);
  }

  // Enhanced Record validation
  if (obj.record) {
    const record = obj.record;
    
    if (record.detections && record.detections.pre_capture > 30) {
      errors.push({
        message: "record.detections.pre_capture should not exceed 30 seconds",
        path: ['record', 'detections', 'pre_capture'],
        type: 'record',
        severity: 'warning'
      });
    }
    
    if (record.alerts && record.alerts.pre_capture > 30) {
      errors.push({
        message: "record.alerts.pre_capture should not exceed 30 seconds",
        path: ['record', 'alerts', 'pre_capture'],
        type: 'record',
        severity: 'warning'
      });
    }
    
    if (record.retain && record.retain.mode && !VALID_RETAIN_MODES.includes(record.retain.mode)) {
      errors.push({
        message: `record.retain.mode must be one of: ${VALID_RETAIN_MODES.join(', ')}`,
        path: ['record', 'retain', 'mode'],
        type: 'record',
        severity: 'error'
      });
    }
    
    if (record.expire_interval && record.expire_interval < 1) {
      errors.push({
        message: "record.expire_interval must be at least 1 minute",
        path: ['record', 'expire_interval'],
        type: 'record',
        severity: 'error'
      });
    }
    
    if (record.preview && record.preview.quality && !VALID_RECORD_QUALITIES.includes(record.preview.quality)) {
      errors.push({
        message: `record.preview.quality must be one of: ${VALID_RECORD_QUALITIES.join(', ')}`,
        path: ['record', 'preview', 'quality'],
        type: 'record',
        severity: 'error'
      });
    }
  }

  // Enhanced Object validation
  if (obj.objects && obj.objects.filters) {
    Object.entries(obj.objects.filters).forEach(([objType, filter]) => {
      if (filter.min_area && filter.min_area < 0) {
        errors.push({
          message: `objects.filters.${objType}.min_area must be non-negative`,
          path: ['objects', 'filters', objType, 'min_area'],
          type: 'global',
          severity: 'error'
        });
      }
      
      if (filter.max_area && filter.max_area < 0) {
        errors.push({
          message: `objects.filters.${objType}.max_area must be non-negative`,
          path: ['objects', 'filters', objType, 'max_area'],
          type: 'global',
          severity: 'error'
        });
      }
      
      if (filter.min_ratio && filter.min_ratio < 0) {
        errors.push({
          message: `objects.filters.${objType}.min_ratio must be non-negative`,
          path: ['objects', 'filters', objType, 'min_ratio'],
          type: 'global',
          severity: 'error'
        });
      }
      
      if (filter.max_ratio && filter.max_ratio < 0) {
        errors.push({
          message: `objects.filters.${objType}.max_ratio must be non-negative`,
          path: ['objects', 'filters', objType, 'max_ratio'],
          type: 'global',
          severity: 'error'
        });
      }
      
      if (filter.threshold && (filter.threshold < 0 || filter.threshold > 1)) {
        errors.push({
          message: `objects.filters.${objType}.threshold must be between 0 and 1`,
          path: ['objects', 'filters', objType, 'threshold'],
          type: 'global',
          severity: 'error'
        });
      }
      
      if (filter.min_score && (filter.min_score < 0 || filter.min_score > 1)) {
        errors.push({
          message: `objects.filters.${objType}.min_score must be between 0 and 1`,
          path: ['objects', 'filters', objType, 'min_score'],
          type: 'global',
          severity: 'error'
        });
      }
    });
  }

  // Enhanced Review validation
  if (obj.review) {
    const review = obj.review;
    
    if (review.alerts && review.alerts.required_zones) {
      if (typeof review.alerts.required_zones === 'string' && !review.alerts.required_zones.includes(',') && review.alerts.required_zones.trim()) {
        // Single zone string - valid
      } else if (!Array.isArray(review.alerts.required_zones)) {
        errors.push({
          message: "review.alerts.required_zones must be a string (single zone) or array of strings",
          path: ['review', 'alerts', 'required_zones'],
          type: 'global',
          severity: 'error'
        });
      }
    }
    
    if (review.detections && review.detections.required_zones) {
      if (typeof review.detections.required_zones === 'string' && !review.detections.required_zones.includes(',') && review.detections.required_zones.trim()) {
        // Single zone string - valid
      } else if (!Array.isArray(review.detections.required_zones)) {
        errors.push({
          message: "review.detections.required_zones must be a string (single zone) or array of strings",
          path: ['review', 'detections', 'required_zones'],
          type: 'global',
          severity: 'error'
        });
      }
    }
  }

  // Enhanced Timestamp validation
  if (obj.timestamp) {
    const timestamp = obj.timestamp;
    
    if (timestamp.position && !VALID_TIMESTAMP_POSITIONS.includes(timestamp.position)) {
      errors.push({
        message: `timestamp.position must be one of: ${VALID_TIMESTAMP_POSITIONS.join(', ')}`,
        path: ['timestamp', 'position'],
        type: 'global',
        severity: 'error'
      });
    }
    
    if (timestamp.effect && !VALID_TIMESTAMP_EFFECTS.includes(timestamp.effect)) {
      errors.push({
        message: `timestamp.effect must be one of: ${VALID_TIMESTAMP_EFFECTS.join(', ')}`,
        path: ['timestamp', 'effect'],
        type: 'global',
        severity: 'error'
      });
    }
    
    if (timestamp.color) {
      const { red, green, blue } = timestamp.color;
      if ((red !== undefined && (red < 0 || red > 255)) || 
          (green !== undefined && (green < 0 || green > 255)) || 
          (blue !== undefined && (blue < 0 || blue > 255))) {
        errors.push({
          message: "timestamp.color values (red, green, blue) must be between 0 and 255",
          path: ['timestamp', 'color'],
          type: 'global',
          severity: 'error'
        });
      }
    }
    
    if (timestamp.thickness && timestamp.thickness < 1) {
      errors.push({
        message: "timestamp.thickness must be at least 1",
        path: ['timestamp', 'thickness'],
        type: 'global',
        severity: 'error'
      });
    }
  }

  // Enhanced Camera validation - 支持数组和对象两种格式
  if (obj.cameras) {
    let cameras = [];
    
    // 如果是数组，直接使用
    if (Array.isArray(obj.cameras)) {
      cameras = obj.cameras;
    } 
    // 如果是对象，转换为数组格式
    else if (typeof obj.cameras === 'object' && obj.cameras !== null) {
      cameras = Object.entries(obj.cameras).map(([cameraKey, cameraConfig]) => {
        // 如果配置中已经有 name，使用它；否则使用 key 作为 name
        const cameraWithName = { ...cameraConfig };
        if (!cameraWithName.name && cameraKey && typeof cameraKey === 'string') {
          cameraWithName.name = cameraKey;
        }
        return cameraWithName;
      });
    }

    cameras.forEach((camera, index) => {
      const camPath = ['cameras', index];
      const cameraName = camera.name || `camera_${index}`;
      
      // Camera name validation
      if (cameraName && !CAMERA_NAME_REGEX.test(cameraName)) {
        errors.push({
          message: `Camera name '${cameraName}' contains invalid characters. Use only letters, numbers, underscores, and hyphens.`,
          path: [...camPath, 'name'],
          type: 'camera',
          severity: 'error'
        });
      }

      // Check per-camera onvif
      if (camera.onvif) {
        validateOnvif(camera.onvif, [...camPath, 'onvif']);
      }

      // Enhanced Zone validation for each camera
      if (camera.zones && typeof camera.zones === 'object') {
        Object.entries(camera.zones).forEach(([zoneName, zone]) => {
          const zonePath = [...camPath, 'zones', zoneName];
          
          // Zone coordinates validation
          if (zone.coordinates !== undefined) {
            if (!validateCoordinateString(zone.coordinates)) {
              errors.push({
                message: `zones.${zoneName}.coordinates contains invalid coordinate format. Use "x1,y1,x2,y2,x3,y3..." or ["x1,y1", "x2,y2", ...] with values between 0-1`,
                path: [...zonePath, 'coordinates'],
                type: 'zone',
                severity: 'error'
              });
            }
          } else {
            errors.push({
              message: `zones.${zoneName} requires a 'coordinates' field`,
              path: [...zonePath, 'coordinates'],
              type: 'zone',
              severity: 'error'
            });
          }
          
          // Zone distances validation
          if (zone.distances) {
            let distances = [];
            if (Array.isArray(zone.distances)) {
              distances = zone.distances.map(d => parseFloat(d)).filter(d => !isNaN(d));
            } else if (typeof zone.distances === 'string') {
              distances = zone.distances.split(',').map(d => parseFloat(d.trim())).filter(d => !isNaN(d));
            }
            
            if (distances.length !== 4) {
              errors.push({
                message: `zones.${zoneName}.distances must contain exactly 4 numeric values`,
                path: [...zonePath, 'distances'],
                type: 'zone',
                severity: 'error'
              });
            } else {
              const invalidDistances = distances.filter(d => d < 0);
              if (invalidDistances.length > 0) {
                errors.push({
                  message: `All zones.${zoneName}.distances values must be non-negative numbers`,
                  path: [...zonePath, 'distances'],
                  type: 'zone',
                  severity: 'error'
                });
              }
            }
          }
          
          // Zone constraints
          if (zone.inertia && zone.inertia < 1) {
            errors.push({
              message: `zones.${zoneName}.inertia must be at least 1`,
              path: [...zonePath, 'inertia'],
              type: 'zone',
              severity: 'error'
            });
          }
          
          if (zone.loitering_time && zone.loitering_time < 0) {
            errors.push({
              message: `zones.${zoneName}.loitering_time must be non-negative`,
              path: [...zonePath, 'loitering_time'],
              type: 'zone',
              severity: 'error'
            });
          }
          
          if (zone.speed_threshold && zone.speed_threshold < 0.1) {
            errors.push({
              message: `zones.${zoneName}.speed_threshold must be at least 0.1`,
              path: [...zonePath, 'speed_threshold'],
              type: 'zone',
              severity: 'error'
            });
          }
          
          // Warn about loitering_time with speed/distance
          if (zone.loitering_time > 0 && (zone.speed_threshold || zone.distances)) {
            errors.push({
              message: `zones.${zoneName}: loitering_time should not be used with speed_threshold or distances`,
              path: [...zonePath, 'loitering_time'],
              type: 'zone',
              severity: 'warning'
            });
          }
        });
      }

      // Enhanced Snapshot validation
      if (camera.snapshots) {
        const snapshots = camera.snapshots;
        
        if (snapshots.quality !== undefined && (snapshots.quality < 0 || snapshots.quality > 100)) {
          errors.push({
            message: `snapshots.quality must be between 0 and 100`,
            path: [...camPath, 'snapshots', 'quality'],
            type: 'snapshot',
            severity: 'error'
          });
        }
        
        if (snapshots.height && snapshots.height < 1) {
          errors.push({
            message: `snapshots.height must be at least 1 pixel`,
            path: [...camPath, 'snapshots', 'height'],
            type: 'snapshot',
            severity: 'error'
          });
        }
        
        if (snapshots.retain && snapshots.retain.mode && !VALID_RETAIN_MODES.includes(snapshots.retain.mode)) {
          errors.push({
            message: `snapshots.retain.mode must be one of: ${VALID_RETAIN_MODES.join(', ')}`,
            path: [...camPath, 'snapshots', 'retain', 'mode'],
            type: 'snapshot',
            severity: 'error'
          });
        }
        
        if (snapshots.retain && snapshots.retain.objects) {
          Object.entries(snapshots.retain.objects).forEach(([objName, days]) => {
            if (typeof days === 'number' && days < 0) {
              errors.push({
                message: `snapshots.retain.objects.${objName} retention days must be non-negative`,
                path: [...camPath, 'snapshots', 'retain', 'objects', objName],
                type: 'snapshot',
                severity: 'error'
              });
            }
          });
        }
      }

      // Detect configuration
      if (camera.detect) {
        const detect = camera.detect;
        if (detect.enabled !== undefined && typeof detect.enabled !== 'boolean') {
          errors.push({
            message: "detect.enabled must be a boolean",
            path: [...camPath, 'detect', 'enabled'],
            type: 'camera',
            severity: 'warning'
          });
        }
        
        if (detect.fps && (detect.fps < 1 || detect.fps > 30)) {
          errors.push({
            message: "detect.fps must be between 1 and 30",
            path: [...camPath, 'detect', 'fps'],
            type: 'camera',
            severity: 'error'
          });
        }

        if (detect.height && (detect.height < 240 || detect.height > 1080)) {
          errors.push({
            message: "detect.height should be between 240 and 1080",
            path: [...camPath, 'detect', 'height'],
            type: 'camera',
            severity: 'warning'
          });
        }
      }

      // FFmpeg validation
      if (camera.ffmpeg && camera.ffmpeg.inputs) {
        const inputs = camera.ffmpeg.inputs;
        if (!Array.isArray(inputs)) {
          errors.push({
            message: "ffmpeg.inputs must be an array",
            path: [...camPath, 'ffmpeg', 'inputs'],
            type: 'camera',
            severity: 'error'
          });
        } else {
          const roles = [];
          inputs.forEach((input, i) => {
            if (!input.path) {
              errors.push({
                message: "Each ffmpeg input requires a 'path' field",
                path: [...camPath, 'ffmpeg', 'inputs', i, 'path'],
                type: 'camera',
                severity: 'error'
              });
            }
            
            if (input.roles && Array.isArray(input.roles)) {
              input.roles.forEach(role => {
                if (roles.includes(role)) {
                  errors.push({
                    message: `Role '${role}' is assigned to multiple inputs`,
                    path: [...camPath, 'ffmpeg', 'inputs', i, 'roles'],
                    type: 'camera',
                    severity: 'error'
                  });
                }
                roles.push(role);
              });
            }
          });
          
          if (!roles.includes('detect')) {
            errors.push({
              message: "At least one input must have the 'detect' role",
              path: [...camPath, 'ffmpeg', 'inputs'],
              type: 'camera',
              severity: 'error'
            });
          }
        }
      }

      // Live stream validation
      if (camera.live && camera.live.streams && typeof camera.live.streams === 'object') {
        Object.entries(camera.live.streams).forEach(([name, stream]) => {
          if (typeof name === 'string' && !name.match(/^[a-zA-Z0-9_-]+$/)) {
            errors.push({
              message: `Live stream name '${name}' contains invalid characters`,
              path: [...camPath, 'live', 'streams', name],
              type: 'camera',
              severity: 'warning'
            });
          }
        });
      }

      // Quality validation
      if (camera.live && camera.live.quality !== undefined) {
        if (typeof camera.live.quality === 'number' && (camera.live.quality < 1 || camera.live.quality > 31)) {
          errors.push({
            message: "live.quality must be between 1 and 31",
            path: [...camPath, 'live', 'quality'],
            type: 'camera',
            severity: 'error'
          });
        }
      }

      // MQTT quality validation
      if (camera.mqtt && camera.mqtt.quality !== undefined) {
        if (typeof camera.mqtt.quality === 'number' && (camera.mqtt.quality < 0 || camera.mqtt.quality > 100)) {
          errors.push({
            message: "mqtt.quality must be between 0 and 100",
            path: [...camPath, 'mqtt', 'quality'],
            type: 'camera',
            severity: 'error'
          });
        }
      }

      // GenAI provider validation
      if (camera.genai && camera.genai.provider) {
        if (!VALID_PROVIDERS.includes(camera.genai.provider)) {
          errors.push({
            message: `genai.provider must be one of: ${VALID_PROVIDERS.join(', ')}`,
            path: [...camPath, 'genai', 'provider'],
            type: 'camera',
            severity: 'error'
          });
        }
      }

      // Camera type validation
      if (camera.type && !VALID_CAMERA_TYPES.includes(camera.type)) {
        errors.push({
          message: `camera.type must be one of: ${VALID_CAMERA_TYPES.join(', ')}`,
          path: [...camPath, 'type'],
          type: 'camera',
          severity: 'error'
        });
      }
    });
  }

  // Birdseye mode validation
  if (obj.birdseye && obj.birdseye.mode) {
    const validModes = ['objects', 'motion', 'continuous'];
    if (!validModes.includes(obj.birdseye.mode)) {
      errors.push({
        message: `birdseye.mode must be one of: ${validModes.join(', ')}`,
        path: ['birdseye', 'mode'],
        type: 'global',
        severity: 'error'
      });
    }
  }

  // Audio listen validation
  if (obj.audio && obj.audio.listen && !Array.isArray(obj.audio.listen)) {
    errors.push({
      message: "audio.listen must be an array of strings",
      path: ['audio', 'listen'],
      type: 'global',
      severity: 'error'
    });
  }

  // Global GenAI validation
  if (obj.genai && obj.genai.provider && !VALID_PROVIDERS.includes(obj.genai.provider)) {
    errors.push({
      message: `Global genai.provider must be one of: ${VALID_PROVIDERS.join(', ')}`,
      path: ['genai', 'provider'],
      type: 'global',
      severity: 'error'
    });
  }

  return errors;
}

function formatPath(path) {
  return path.join('.');
}

function autoFixFrigateConfig(obj, errors) {
  const fixed = JSON.parse(JSON.stringify(obj)); // Deep copy
  const fixSummary = [];

  // Helper to fix onvif autotracking
  function fixAutotracking(autotrack, path) {
    // Fix zoom_factor
    if (autotrack.zoom_factor !== undefined) {
      const original = autotrack.zoom_factor;
      if (original < 0.1) {
        autotrack.zoom_factor = 0.1;
        fixSummary.push(`${path}.zoom_factor: ${original} → 0.1 (min)`);
      } else if (original > 0.75) {
        autotrack.zoom_factor = 0.3; // Default per docs
        fixSummary.push(`${path}.zoom_factor: ${original} → 0.3 (default, max 0.75)`);
      }
    } else if (autotrack.enabled) {
      autotrack.zoom_factor = 0.3; // Add default if missing and enabled
      fixSummary.push(`${path}.zoom_factor: missing → 0.3 (default)`);
    }

    // Fix timeout
    if (autotrack.timeout !== undefined && autotrack.timeout < 1) {
      const original = autotrack.timeout;
      autotrack.timeout = 10; // Default per docs
      fixSummary.push(`${path}.timeout: ${original} → 10 (default)`);
    }

    // Fix zooming mode
    if (autotrack.zooming && !VALID_ZOOM_MODES.includes(autotrack.zooming)) {
      const original = autotrack.zooming;
      autotrack.zooming = 'disabled'; // Default
      fixSummary.push(`${path}.zooming: ${original} → disabled (default)`);
    }

    // Fix movement_weights
    if (autotrack.movement_weights) {
      let weights = [];
      if (Array.isArray(autotrack.movement_weights)) {
        weights = autotrack.movement_weights.map(w => parseFloat(w)).filter(w => !isNaN(w));
      } else if (typeof autotrack.movement_weights === 'string') {
        weights = autotrack.movement_weights.split(',').map(w => parseFloat(w.trim())).filter(w => !isNaN(w));
      }
      
      if (weights.length !== 0 && weights.length !== 6) {
        autotrack.movement_weights = []; // Set to default empty
        fixSummary.push(`${path}.movement_weights: invalid length ${weights.length} → [] (default)`);
      } else if (weights.length === 6) {
        const fixedWeights = weights.map(w => Math.max(0, w));
        if (JSON.stringify(fixedWeights) !== JSON.stringify(weights)) {
          autotrack.movement_weights = fixedWeights;
          fixSummary.push(`${path}.movement_weights: fixed negative values to 0`);
        }
      }
    } else if (autotrack.calibrate_on_startup) {
      autotrack.movement_weights = []; // Ensure empty if calibration enabled
      fixSummary.push(`${path}.movement_weights: missing → [] (for calibration)`);
    }
  }

  // Fix global onvif if present
  if (fixed.onvif && fixed.onvif.autotracking) {
    fixAutotracking(fixed.onvif.autotracking, 'onvif.autotracking');
  }

  // Fix objects filters
  if (fixed.objects && fixed.objects.filters) {
    Object.entries(fixed.objects.filters).forEach(([objType, filter]) => {
      ['min_area', 'max_area', 'min_ratio', 'max_ratio'].forEach(key => {
        if (filter[key] !== undefined && filter[key] < 0) {
          const original = filter[key];
          filter[key] = 0;
          fixSummary.push(`objects.filters.${objType}.${key}: ${original} → 0 (non-negative)`);
        }
      });

      ['threshold', 'min_score'].forEach(key => {
        if (filter[key] !== undefined) {
          const original = filter[key];
          if (original < 0) {
            filter[key] = 0;
            fixSummary.push(`objects.filters.${objType}.${key}: ${original} → 0 (min)`);
          } else if (original > 1) {
            filter[key] = 1;
            fixSummary.push(`objects.filters.${objType}.${key}: ${original} → 1 (max)`);
          }
        }
      });
    });
  }

  // Fix record
  if (fixed.record) {
    const record = fixed.record;
    
    if (record.detections && record.detections.pre_capture > 30) {
      const original = record.detections.pre_capture;
      record.detections.pre_capture = 30;
      fixSummary.push(`record.detections.pre_capture: ${original} → 30 (recommended max)`);
    }
    
    if (record.alerts && record.alerts.pre_capture > 30) {
      const original = record.alerts.pre_capture;
      record.alerts.pre_capture = 30;
      fixSummary.push(`record.alerts.pre_capture: ${original} → 30 (recommended max)`);
    }

    if (record.expire_interval < 1) {
      const original = record.expire_interval;
      record.expire_interval = 1;
      fixSummary.push(`record.expire_interval: ${original} → 1 (min)`);
    }

    if (record.retain && record.retain.mode && !VALID_RETAIN_MODES.includes(record.retain.mode)) {
      const original = record.retain.mode;
      record.retain.mode = 'all';
      fixSummary.push(`record.retain.mode: ${original} → all (default)`);
    }
  }

  // Fix review required_zones
  if (fixed.review) {
    const review = fixed.review;
    
    // Fix review.alerts.required_zones
    if (review.alerts && review.alerts.required_zones !== undefined) {
      const zones = review.alerts.required_zones;
      
      if (typeof zones === 'string') {
        // 如果是逗号分隔的字符串，转换为数组
        if (zones.includes(',')) {
          const zoneArray = zones.split(',').map(z => z.trim()).filter(z => z.length > 0);
          if (zoneArray.length > 0) {
            review.alerts.required_zones = zoneArray;
            fixSummary.push(`review.alerts.required_zones: "${zones}" → [${zoneArray.join(', ')}] (comma-separated to array)`);
          } else {
            review.alerts.required_zones = []; // 空数组作为默认
            fixSummary.push(`review.alerts.required_zones: empty string → [] (default)`);
          }
        }
        // 单个区域字符串保持不变（已经是有效格式）
      } else if (!Array.isArray(zones)) {
        // 无效类型，转换为数组
        if (zones && typeof zones === 'object') {
          review.alerts.required_zones = []; // 空数组作为默认
          fixSummary.push(`review.alerts.required_zones: invalid object → [] (default)`);
        } else {
          review.alerts.required_zones = []; // 空数组作为默认
          fixSummary.push(`review.alerts.required_zones: invalid type → [] (default)`);
        }
      } else {
        // 是数组，清理空字符串和无效区域名
        const cleanedZones = zones.filter(z => typeof z === 'string' && z.trim().length > 0);
        if (JSON.stringify(cleanedZones) !== JSON.stringify(zones)) {
          review.alerts.required_zones = cleanedZones;
          fixSummary.push(`review.alerts.required_zones: cleaned ${zones.length} → ${cleanedZones.length} valid zones`);
        }
      }
    }

    // Fix review.detections.required_zones
    if (review.detections && review.detections.required_zones !== undefined) {
      const zones = review.detections.required_zones;
      
      if (typeof zones === 'string') {
        // 如果是逗号分隔的字符串，转换为数组
        if (zones.includes(',')) {
          const zoneArray = zones.split(',').map(z => z.trim()).filter(z => z.length > 0);
          if (zoneArray.length > 0) {
            review.detections.required_zones = zoneArray;
            fixSummary.push(`review.detections.required_zones: "${zones}" → [${zoneArray.join(', ')}] (comma-separated to array)`);
          } else {
            review.detections.required_zones = []; // 空数组作为默认
            fixSummary.push(`review.detections.required_zones: empty string → [] (default)`);
          }
        }
        // 单个区域字符串保持不变（已经是有效格式）
      } else if (!Array.isArray(zones)) {
        // 无效类型，转换为数组
        if (zones && typeof zones === 'object') {
          review.detections.required_zones = []; // 空数组作为默认
          fixSummary.push(`review.detections.required_zones: invalid object → [] (default)`);
        } else {
          review.detections.required_zones = []; // 空数组作为默认
          fixSummary.push(`review.detections.required_zones: invalid type → [] (default)`);
        }
      } else {
        // 是数组，清理空字符串和无效区域名
        const cleanedZones = zones.filter(z => typeof z === 'string' && z.trim().length > 0);
        if (JSON.stringify(cleanedZones) !== JSON.stringify(zones)) {
          review.detections.required_zones = cleanedZones;
          fixSummary.push(`review.detections.required_zones: cleaned ${zones.length} → ${cleanedZones.length} valid zones`);
        }
      }
    }
  }

  // Fix cameras
  if (fixed.cameras) {
    // Normalize to object format if array
    if (Array.isArray(fixed.cameras)) {
      const camObj = {};
      fixed.cameras.forEach((cam, idx) => {
        const name = cam.name || `camera_${idx}`;
        camObj[name] = cam;
      });
      fixed.cameras = camObj;
      fixSummary.push(`cameras: converted array to object format`);
    }

    Object.entries(fixed.cameras).forEach(([camName, camera]) => {
      // Fix camera name if invalid
      if (!CAMERA_NAME_REGEX.test(camName)) {
        const fixedName = camName.replace(/[^a-zA-Z0-9_-]/g, '_');
        fixed.cameras[fixedName] = camera;
        delete fixed.cameras[camName];
        if (camera.name) camera.name = fixedName;
        fixSummary.push(`camera name ${camName} → ${fixedName} (sanitized)`);
        camName = fixedName; // Update for further fixes
      }

      // Move global onvif to this camera if global exists and camera has no onvif
      if (fixed.onvif && !camera.onvif) {
        camera.onvif = fixed.onvif;
        delete fixed.onvif;
        fixSummary.push(`Moved global onvif to camera ${camName}`);
      }

      // Fix per-camera onvif
      if (camera.onvif && camera.onvif.autotracking) {
        fixAutotracking(camera.onvif.autotracking, `cameras.${camName}.onvif.autotracking`);
      }

      // Fix zones
      if (camera.zones) {
        Object.entries(camera.zones).forEach(([zoneName, zone]) => {
          // Fix coordinates if invalid
          if (zone.coordinates && !validateCoordinateString(zone.coordinates)) {
            zone.coordinates = "0,0,1,0,1,1,0,1"; // Default rectangle
            fixSummary.push(`zones.${zoneName}.coordinates: invalid → default rectangle`);
          } else if (!zone.coordinates) {
            zone.coordinates = "0,0,1,0,1,1,0,1";
            fixSummary.push(`zones.${zoneName}.coordinates: missing → default rectangle`);
          }

          // Fix inertia
          if (zone.inertia !== undefined && zone.inertia < 1) {
            zone.inertia = 1;
            fixSummary.push(`zones.${zoneName}.inertia: <1 → 1 (min)`);
          }

          // Fix loitering_time
          if (zone.loitering_time !== undefined && zone.loitering_time < 0) {
            zone.loitering_time = 0;
            fixSummary.push(`zones.${zoneName}.loitering_time: <0 → 0`);
          }

          // Remove conflicting speed_threshold/distances if loitering_time >0
          if (zone.loitering_time > 0) {
            if (zone.speed_threshold !== undefined) {
              delete zone.speed_threshold;
              fixSummary.push(`zones.${zoneName}: removed speed_threshold (conflict with loitering_time)`);
            }
            if (zone.distances !== undefined) {
              delete zone.distances;
              fixSummary.push(`zones.${zoneName}: removed distances (conflict with loitering_time)`);
            }
          }

          // Fix speed_threshold
          if (zone.speed_threshold !== undefined && zone.speed_threshold < 0.1) {
            zone.speed_threshold = 0.1;
            fixSummary.push(`zones.${zoneName}.speed_threshold: <0.1 → 0.1 (min)`);
          }

          // Fix distances
          if (zone.distances) {
            let distances = [];
            if (Array.isArray(zone.distances)) {
              distances = zone.distances.map(d => parseFloat(d)).filter(d => !isNaN(d));
            } else if (typeof zone.distances === 'string') {
              distances = zone.distances.split(',').map(d => parseFloat(d.trim())).filter(d => !isNaN(d));
            }
            
            if (distances.length !== 4) {
              zone.distances = [0, 0, 0, 0]; // Default, but docs may have better
              fixSummary.push(`zones.${zoneName}.distances: invalid length → [0,0,0,0] (default)`);
            } else {
              const fixedDistances = distances.map(d => Math.max(0, d));
              if (JSON.stringify(fixedDistances) !== JSON.stringify(distances)) {
                zone.distances = fixedDistances;
                fixSummary.push(`zones.${zoneName}.distances: fixed negative values to 0`);
              }
            }
          }
        });
      }

      // Fix snapshots
      if (camera.snapshots) {
        if (camera.snapshots.quality !== undefined) {
          const q = camera.snapshots.quality;
          if (q < 0) {
            camera.snapshots.quality = 0;
            fixSummary.push(`snapshots.quality: ${q} → 0 (min)`);
          } else if (q > 100) {
            camera.snapshots.quality = 100;
            fixSummary.push(`snapshots.quality: ${q} → 100 (max)`);
          }
        }

        if (camera.snapshots.height !== undefined && camera.snapshots.height < 1) {
          camera.snapshots.height = 1;
          fixSummary.push(`snapshots.height: <1 → 1 (min)`);
        }

        if (camera.snapshots.retain && camera.snapshots.retain.mode && !VALID_RETAIN_MODES.includes(camera.snapshots.retain.mode)) {
          camera.snapshots.retain.mode = 'motion'; // Common default
          fixSummary.push(`snapshots.retain.mode: invalid → motion (default)`);
        }

        if (camera.snapshots.retain && camera.snapshots.retain.objects) {
          Object.entries(camera.snapshots.retain.objects).forEach(([obj, days]) => {
            if (days < 0) {
              camera.snapshots.retain.objects[obj] = 0;
              fixSummary.push(`snapshots.retain.objects.${obj}: ${days} → 0 (non-negative)`);
            }
          });
        }
      }

      // Fix detect
      if (camera.detect) {
        if (camera.detect.fps !== undefined) {
          let fps = camera.detect.fps;
          if (fps < 1) {
            camera.detect.fps = 1;
            fixSummary.push(`detect.fps: ${fps} → 1 (min)`);
          } else if (fps > 30) {
            camera.detect.fps = 30;
            fixSummary.push(`detect.fps: ${fps} → 30 (max)`);
          }
        }

        if (camera.detect.height !== undefined) {
          let h = camera.detect.height;
          if (h < 240) {
            camera.detect.height = 240;
            fixSummary.push(`detect.height: ${h} → 240 (recommended min)`);
          } else if (h > 1080) {
            camera.detect.height = 1080;
            fixSummary.push(`detect.height: ${h} → 1080 (recommended max)`);
          }
        }
      }

      // Fix live quality
      if (camera.live && camera.live.quality !== undefined) {
        let q = camera.live.quality;
        if (q < 1) {
          camera.live.quality = 1;
          fixSummary.push(`live.quality: ${q} → 1 (min)`);
        } else if (q > 31) {
          camera.live.quality = 31;
          fixSummary.push(`live.quality: ${q} → 31 (max)`);
        }
      }

      // Fix mqtt quality
      if (camera.mqtt && camera.mqtt.quality !== undefined) {
        let q = camera.mqtt.quality;
        if (q < 0) {
          camera.mqtt.quality = 0;
          fixSummary.push(`mqtt.quality: ${q} → 0 (min)`);
        } else if (q > 100) {
          camera.mqtt.quality = 100;
          fixSummary.push(`mqtt.quality: ${q} → 100 (max)`);
        }
      }

      // Fix genai provider
      if (camera.genai && camera.genai.provider && !VALID_PROVIDERS.includes(camera.genai.provider)) {
        camera.genai.provider = 'openai'; // Default
        fixSummary.push(`genai.provider: invalid → openai (default)`);
      }
    });
  }

  // Fix birdseye mode
  if (fixed.birdseye && fixed.birdseye.mode && !['objects', 'motion', 'continuous'].includes(fixed.birdseye.mode)) {
    fixed.birdseye.mode = 'objects'; // Common default
    fixSummary.push(`birdseye.mode: invalid → objects (default)`);
  }

  // Fix audio listen
  if (fixed.audio && fixed.audio.listen && !Array.isArray(fixed.audio.listen)) {
    fixed.audio.listen = [];
    fixSummary.push(`audio.listen: not array → []`);
  }

  // Fix global genai provider
  if (fixed.genai && fixed.genai.provider && !VALID_PROVIDERS.includes(fixed.genai.provider)) {
    fixed.genai.provider = 'openai';
    fixSummary.push(`genai.provider: invalid → openai (default)`);
  }

  return { fixed, fixSummary };
}

/**
 * Enhanced Frigate NVR Configuration Validator
 */
export default function App() {
    const { lang, setLang, t } = useI18n("zh");
    const [isCopying, setIsCopying] = useState(false);
    const [copyBtnLabel, setCopyBtnLabel] = useState(t("copy_fixed"));
	  useEffect(() => {
		setCopyBtnLabel(t("copy_fixed"));
	  }, [lang]);
  
    const [text, setText] = useState(defaultEnhancedFrigateSample);
    const [result, setResult] = useState(null);
    const [fixed, setFixed] = useState("");
    const [autoFormatOnFix, setAutoFormatOnFix] = useState(true);
    const [showFrigateRules, setShowFrigateRules] = useState(true);
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
		try {
		  const doc = YAML.parseDocument(src, { prettyErrors: true });
		  const syntaxOk = !doc.errors?.length;
		  let errors = [];
		  
		  if (syntaxOk) {
			// Parse to object for schema validation
			const obj = doc.toJSON();
			const frigateErrors = validateFrigateConfig(obj);
			errors = frigateErrors.map(err => ({
			  message: err.message,
			  path: err.path,
			  line: 1, // Approximate for schema errors
			  col: 1,
			  type: err.type,
			  severity: err.severity || 'error'
			}));
		  } else {
			// Syntax errors
			errors = doc.errors.map((e) => {
			  const pos = e?.pos || [0, 0];
			  const { line, col } = indexToLineCol(src, pos[0]);
			  return { 
				message: e.message, 
				line, 
				col,
				type: 'syntax',
				severity: 'error'
			  };
			});
		  }
		  
		  return { 
			ok: syntaxOk && errors.length === 0, 
			errors, 
			doc,
			hasWarnings: errors.some(e => e.severity === 'warning')
		  };
		} catch (e) {
		  return {
			ok: false,
			errors: [{ 
			  message: `Parse error: ${e.message}`, 
			  line: 1, 
			  col: 1,
			  type: 'syntax',
			  severity: 'error'
			}],
			doc: null
		  };
		}
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
		  setResult({ ok: false, errors: [{ message: e.message, line: 1, col: 1, type: 'syntax' }], doc: null });
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

	function fixCameraNames(input) {
		// Basic camera name sanitization
		return input.replace(/name:\s*['"]([^'"\s]+[^a-zA-Z0-9_-]['"][\s,]*)/g, (match, name) => {
		  const fixedName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
		  return match.replace(name, fixedName);
		});
	}

	function fixZoneCoordinates(input) {
		// Basic coordinate validation and normalization
		return input.replace(/coordinates:\s*([^,\n]+)/g, (match, coords) => {
		  if (validateCoordinateString(coords)) {
			return match; // Valid, keep as is
		  }
		  // Try to fix simple cases
		  const fixedCoords = coords.replace(/[^\d.,]/g, '');
		  return match.replace(coords, fixedCoords);
		});
	}

	function handleAutoFix() {
	  try {
		// 基础文本清理（总是执行）
		let candidate = text
		  .replace(/^\uFEFF/, "")  // 移除 BOM
		  .replace(/\r\n?/g, "\n")  // 统一换行符
		  .replace(/\t/g, "  ");    // Tab 转空格

		// 如果关闭了 Frigate 规则，使用通用 YAML 修复策略
		if (!showFrigateRules) {
		  return handleGenericYamlFix(candidate);
		}

		// 否则使用 Frigate 特定修复
		// 解析 YAML
		const doc = YAML.parseDocument(candidate);
		if (doc.errors?.length) {
		  setFixed("");
		  setResult({
			ok: false,
			errors: doc.errors.map(e => {
			  const pos = e?.pos || [0, 0];
			  const { line, col } = indexToLineCol(candidate, pos[0]);
			  return { message: e.message, line, col, type: 'syntax', severity: 'error' };
			}),
			doc: null
		  });
		  return;
		}

		// 进行 Frigate 特定验证
		let obj = doc.toJSON();
		let frigateErrors = validateFrigateConfig(obj);
		
		if (frigateErrors.length === 0) {
		  // 已经有效
		  const output = autoFormatOnFix 
			? doc.toString({ indent: 2, lineWidth: 120 })
			: text;  // 使用原始文本
		  setFixed(output);
		  setResult({ ok: true, errors: [], doc });
		  return;
		}

		// 智能修复
		const { fixed: fixedObj, fixSummary } = autoFixFrigateConfig(obj, frigateErrors);
		
		// 重新验证
		frigateErrors = validateFrigateConfig(fixedObj);
		
		const fixedDoc = new YAML.Document(fixedObj);
		
		// 当不格式化时，使用原始文本的格式，应用修复后的内容
		let output;
		if (autoFormatOnFix) {
		  output = fixedDoc.toString({ indent: 2, lineWidth: 120 });
		} else {
		  // 保持原始文本的格式，只修改需要修复的值
		  output = applyMinimalFixes(text, fixedObj, fixSummary);
		}

		if (frigateErrors.length === 0) {
		  setFixed(output);
		  setResult({ ok: true, errors: [], doc: fixedDoc, fixSummary });
		} else {
		  setFixed(output);
		  setResult({ 
			ok: false, 
			errors: frigateErrors.map(err => ({
			  message: err.message,
			  path: err.path,
			  line: 1,
			  col: 1,
			  type: err.type,
			  severity: err.severity || 'error'
			})), 
			doc: fixedDoc, 
			fixSummary, 
			partialFix: true 
		  });
		}

		// 在控制台显示修复摘要
		if (fixSummary.length > 0) {
		  console.log("Auto-fix summary:\n" + fixSummary.join("\n"));
		}

	  } catch (error) {
		setFixed("");
		setResult({
		  ok: false,
		  errors: [{ message: `Auto-fix failed: ${error.message}`, line: 1, col: 1, type: 'syntax', severity: 'error' }],
		  doc: null
		});
	  }
	}

	// ✅ 新增：通用 YAML 修复函数（从备份中提取）
	function handleGenericYamlFix(candidate) {
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
	  let currentCandidate = candidate;
	  
	  for (const step of attempts) {
		currentCandidate = step.apply(currentCandidate);
		const res = validate(currentCandidate);
		if (res.ok) {
		  const output = autoFormatOnFix
			? YAML.stringify(res.doc?.toJSON(), { indent: 2, lineWidth: 120 })
			: currentCandidate; // Fixed: use currentCandidate instead of text
		  setFixed(output);
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
		  : [{ message: "Cannot auto fix, please check manually.", line: 1, col: 1, type: 'syntax', severity: 'error' }],
		doc: null,
	  });
	}

	// ✅ 保留最小化修复函数（用于 Frigate 特定修复）
	function applyMinimalFixes(originalText, fixedObj, fixSummary) {
	  let result = originalText;
	  
	  // 根据 fixSummary 中的修复内容，精确替换原始文本中的对应值
	  fixSummary.forEach(fixInfo => {
		const match = fixInfo.match(/^(.*):\s*([^→]+?)\s*→\s*(.+?)(?:\s*\(.*\))?$/);
		if (match) {
		  const [_, path, oldValue, newValue] = match;
		  // 创建更精确的正则表达式来匹配路径和旧值
		  const escapedPath = path.replace(/[\.^$*+?()[{\\|\-] /g, '\\$&');
		  const escapedOldValue = escapeRegExp(oldValue.trim());
		  const regex = new RegExp(`\\b${escapedPath}\\s*:\\s*${escapedOldValue}`, 'gi');
		  const replacement = `${path}: ${newValue.trim()}`;
		  result = result.replace(regex, replacement);
		}
	  });
	  
	  return result;
	}

	// ✅ 辅助函数：转义正则表达式
	function escapeRegExp(string) {
		return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
  
	function handleDownload(str, name = "frigate-fixed.yaml") {
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
    <div className="flex items-center gap-2 text-green-600">
      <CheckCircle2 className="h-5 w-5"/> {t("status_ok")}
    </div>
  ) : result ? (
    <div className="flex items-center gap-2 text-amber-600">
      <AlertTriangle className="h-5 w-5"/> {t("status_bad")}
      {result.hasWarnings && (
        <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
          {result.errors.filter(e => e.severity === 'warning').length} warnings
        </span>
      )}
    </div>
  ) : null;

  const syntaxErrors = result?.errors?.filter(e => e.type === 'syntax') || [];
  const frigateErrors = result?.errors?.filter(e => e.type !== 'syntax') || [];
  const cameraErrors = frigateErrors.filter(e => e.type === 'camera');
  const zoneErrors = frigateErrors.filter(e => e.type === 'zone');
  const ptzErrors = frigateErrors.filter(e => e.type === 'ptz');
  const recordErrors = frigateErrors.filter(e => e.type === 'record');
  const snapshotErrors = frigateErrors.filter(e => e.type === 'snapshot');
  const globalErrors = frigateErrors.filter(e => !['camera', 'zone', 'ptz', 'record', 'snapshot'].includes(e.type));

  return (
    <div className="w-full min-h-screen p-6 md:p-10 bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Zap className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl md:text-3xl font-bold">{t("app_title")}</h1>
            </div>
            <p className="text-slate-600">{t("app_desc")}</p>
          </div>

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
              <Switch 
                checked={showFrigateRules} 
                onCheckedChange={setShowFrigateRules} 
                id="frigate-rules" 
              />
              <label htmlFor="frigate-rules" className="text-sm text-slate-600">
                {t("frigate_specific")}
              </label>
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
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  <h2 className="font-semibold">{t("input_title")}</h2>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setText("")}>
                    <Trash2 className="h-4 w-4 mr-1"/>{t("clear")}
                  </Button>
                  <Button variant="secondary" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-1"/>{t("upload")}
                  </Button>
                  <input 
                    ref={fileRef} 
                    type="file" 
                    accept=".yml,.yaml,.json,.txt" 
                    className="hidden" 
                    onChange={onPickFile}
                  />
                </div>
              </div>

              <div
                className="rounded-2xl border bg-white overflow-hidden focus-within:ring-2 focus-within:ring-slate-200"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <Textarea
                  className="min-h-[400px]"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("ph_input")}
                />
              </div>

              <div className="flex flex-wrap gap-2 mt-3">
                <Button onClick={handleValidate}>
                  <Settings className="h-4 w-4 mr-1" />{t("validate")}
                </Button>
                <Button variant="outline" onClick={handleFormat}>{t("format")}</Button>
                <Button variant="ghost" onClick={() => setText(defaultEnhancedFrigateSample)}>
                  {t("load_sample")}
                </Button>
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

              {/* Enhanced Error Summary */}
              {result && !result.ok && (
                <div className="space-y-3">
                  {/* Syntax Errors */}
                  {syntaxErrors.length > 0 && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="font-medium">{t("error_first")} ({syntaxErrors.length} syntax)</p>
                      </div>
                      {syntaxErrors.slice(0, 2).map((e, i) => (
                        <div key={i} className="text-sm leading-relaxed">
                          <span className="font-mono bg-white/70 px-2 py-0.5 rounded">
                            Line {e.line}, Col {e.col}
                          </span>
                          <span className="ml-2 text-red-700">{e.message}</span>
                        </div>
                      ))}
                      {syntaxErrors.length > 2 && (
                        <p className="text-sm text-red-600">... and {syntaxErrors.length - 2} more</p>
                      )}
                    </div>
                  )}

                  {/* Frigate-specific Errors - Enhanced Categorization */}
                  {showFrigateRules && frigateErrors.length > 0 && (
                    <div className="space-y-2">
                      {/* Camera Errors */}
                      {cameraErrors.length > 0 && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Camera className="h-4 w-4 text-amber-600" />
                            <p className="font-medium">{t("camera_errors")} ({cameraErrors.length})</p>
                          </div>
                          {cameraErrors.slice(0, 2).map((e, i) => (
                            <div key={i} className="text-sm leading-relaxed">
                              <span className="font-mono bg-white/70 px-2 py-0.5 rounded text-xs">
                                {formatPath(e.path)}
                              </span>
                              <span className="ml-2 text-amber-700">{e.message}</span>
                            </div>
                          ))}
                          {cameraErrors.length > 2 && (
                            <p className="text-sm text-amber-600">... and {cameraErrors.length - 2} more</p>
                          )}
                        </div>
                      )}

                      {/* Zone Errors */}
                      {zoneErrors.length > 0 && (
                        <div className="rounded-xl border border-purple-200 bg-purple-50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <p className="font-medium">{t("zone_errors")} ({zoneErrors.length})</p>
                          </div>
                          {zoneErrors.slice(0, 2).map((e, i) => (
                            <div key={i} className="text-sm leading-relaxed">
                              <span className="font-mono bg-white/70 px-2 py-0.5 rounded text-xs">
                                {formatPath(e.path)}
                              </span>
                              <span className="ml-2 text-purple-700">{e.message}</span>
                            </div>
                          ))}
                          {zoneErrors.length > 2 && (
                            <p className="text-sm text-purple-600">... and {zoneErrors.length - 2} more</p>
                          )}
                        </div>
                      )}

                      {/* PTZ/Autotrack Errors */}
                      {ptzErrors.length > 0 && (
                        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-indigo-600" />
                            <p className="font-medium">{t("ptz_errors")} ({ptzErrors.length})</p>
                          </div>
                          {ptzErrors.slice(0, 2).map((e, i) => (
                            <div key={i} className="text-sm leading-relaxed">
                              <span className="font-mono bg-white/70 px-2 py-0.5 rounded text-xs">
                                {formatPath(e.path)}
                              </span>
                              <span className="ml-2 text-indigo-700">{e.message}</span>
                            </div>
                          ))}
                          {ptzErrors.length > 2 && (
                            <p className="text-sm text-indigo-600">... and {ptzErrors.length - 2} more</p>
                          )}
                        </div>
                      )}

                      {/* Record Errors */}
                      {recordErrors.length > 0 && (
                        <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Film className="h-4 w-4 text-green-600" />
                            <p className="font-medium">{t("record_errors")} ({recordErrors.length})</p>
                          </div>
                          {recordErrors.slice(0, 2).map((e, i) => (
                            <div key={i} className="text-sm leading-relaxed">
                              <span className="font-mono bg-white/70 px-2 py-0.5 rounded text-xs">
                                {formatPath(e.path)}
                              </span>
                              <span className="ml-2 text-green-700">{e.message}</span>
                            </div>
                          ))}
                          {recordErrors.length > 2 && (
                            <p className="text-sm text-green-600">... and {recordErrors.length - 2} more</p>
                          )}
                        </div>
                      )}

                      {/* Snapshot Errors */}
                      {snapshotErrors.length > 0 && (
                        <div className="rounded-xl border border-pink-200 bg-pink-50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Image className="h-4 w-4 text-pink-600" />
                            <p className="font-medium">{t("snapshot_errors")} ({snapshotErrors.length})</p>
                          </div>
                          {snapshotErrors.slice(0, 2).map((e, i) => (
                            <div key={i} className="text-sm leading-relaxed">
                              <span className="font-mono bg-white/70 px-2 py-0.5 rounded text-xs">
                                {formatPath(e.path)}
                              </span>
                              <span className="ml-2 text-pink-700">{e.message}</span>
                            </div>
                          ))}
                          {snapshotErrors.length > 2 && (
                            <p className="text-sm text-pink-600">... and {snapshotErrors.length - 2} more</p>
                          )}
                        </div>
                      )}

                      {/* Global Errors */}
                      {globalErrors.length > 0 && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Settings className="h-4 w-4 text-blue-600" />
                            <p className="font-medium">{t("global_errors")} ({globalErrors.length})</p>
                          </div>
                          {globalErrors.slice(0, 2).map((e, i) => (
                            <div key={i} className="text-sm leading-relaxed">
                              <span className="font-mono bg-white/70 px-2 py-0.5 rounded text-xs">
                                {formatPath(e.path)}
                              </span>
                              <span className="ml-2 text-blue-700">{e.message}</span>
                            </div>
                          ))}
                          {globalErrors.length > 2 && (
                            <p className="text-sm text-blue-600">... and {globalErrors.length - 2} more</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm text-slate-600 flex items-center gap-1">
                  <span>{t("fixed_result")}</span>
                  {fixed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </h3>
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
        {text && (
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
        )}

        <footer className="text-center text-xs text-slate-500 py-4">
          <p>{t("tips")}</p>
          <p className="mt-1 text-slate-400">
            Enhanced validation for Frigate 2024 | Supports Object Format | Runs locally in browser
          </p>
        </footer>
      </div>
    </div>
  );
}

const defaultEnhancedFrigateSample = `# Enhanced Frigate config sample with various validation issues
# Supports both array and object camera formats

mqtt:
  host: 127.0.0.1
  user: mqtt_user
  password: mqtt_password

# ONVIF/PTZ with issues
onvif:
  host: 192.168.1.100
  port: 8000
  user: admin
  password: admin123
  autotracking:
    enabled: true
    calibrate_on_startup: true
    zooming: absolute  # Valid
    zoom_factor: 0.8  # Invalid: should be 0.1-0.75
    track:
      - person
      - car
    required_zones: 
      - driveway
    return_preset: home
    timeout: 5
    movement_weights: "1.0,2.0,3.0"  # Invalid: needs 6 values

# Global objects with filter issues
objects:
  track:
    - person
    - car
    - dog
  filters:
    person:
      min_area: -100  # Invalid: negative
      max_area: 50000
      min_ratio: 0.2
      max_ratio: 5.0
      threshold: 0.7
      min_score: 0.8
    car:
      threshold: 1.2  # Invalid: > 1.0

# Enhanced recording config
record:
  enabled: true
  sync_recordings: true
  expire_interval: 30
  retain:
    days: 7
    mode: all
  detections:
    pre_capture: 35  # Warning: > 30 recommended
    post_capture: 5
    retain:
      days: 5
      mode: motion
  alerts:
    pre_capture: 25
    post_capture: 10
    retain:
      days: 30
      mode: active_objects
  export:
    timelapse_args: "-vf setpts=0.04*PTS -r 30"
  preview:
    quality: medium  # Valid

# Review config
review:
  alerts:
    enabled: true
    labels:
      - person
      - car
    required_zones: "driveway,front_yard"  # Valid comma-separated
  detections:
    enabled: true
    labels:
      - all
    required_zones: backyard  # Valid single zone

# Timestamp config
timestamp:
  position: tl  # Valid
  format: "%m/%d/%Y %H:%M:%S"
  color:
    red: 255
    green: 255
    blue: 255
  thickness: 2
  effect: shadow  # Valid

# Birdseye
birdseye:
  enabled: true
  mode: objects
  width: 1280
  height: 720
  quality: 8
  restream: true

# Audio
audio:
  enabled: true
  max_not_heard: 30
  min_volume: 500
  listen:
    - bark
    - scream
    - speech
  filters:
    speech:
      threshold: 0.85

# Cameras - OBJECT FORMAT (most common)
cameras:
  front_door_invalid_name:  # Key becomes camera name - contains invalid characters
    enabled: true
    ffmpeg:
      inputs:
        - path: rtsp://user:pass@192.168.1.100:554/stream1
          roles:
            - detect
            - record
        - path: rtsp://user:pass@192.168.1.100:554/stream2
          roles:
            - rtmp  # Invalid role
    detect:
      width: 1280
      height: 720
      fps: 5
    live:
      quality: 5  # Too low, should be 8-15 typically
      streams:
        low_quality: rtmp://localhost/low
        high_quality: rtmp://localhost/high
    motion:
      threshold: 25
    objects:
      track:
        - person
        - "car"  # Unnecessary quotes
    snapshots:  # Snapshot issues
      enabled: true
      quality: 105  # Invalid: > 100
      height: 480
      retain:
        default: 10
        mode: motion
        objects:
          person: 15
          car: -5  # Invalid: negative
    zones:  # Zone issues
      driveway:
        coordinates: "0.1,0.1,0.9,0.1,0.9,0.9,0.1,0.9"  # Valid
        distances: "10,20,15,25"  # Valid
        inertia: 3
        objects: person
        loitering_time: 30
        speed_threshold: 0.5  # Warning: loitering with speed
      invalid_zone:
        coordinates: "invalid"  # Invalid format
        inertia: 0  # Invalid: < 1

  backyard_cam:
    name: backyard_cam  # Explicit name (optional when using object format)
    enabled: true
    ffmpeg:
      inputs:
        - path: rtsp://admin:password@192.168.1.101:554/main
          roles:
            - detect
            - record
    detect:
      enabled: true
      width: 1920  # Too high for efficient detection
      height: 1080
      fps: 10
    live:
      height: 480
      quality: 12
    genai:
      enabled: true
      provider: openai  # Valid
      model: gpt-4o-mini
    snapshots:
      enabled: true
      clean_copy: true
      timestamp: true
      bounding_box: true
      crop: true
      quality: 85
      retain:
        default: 7
        mode: active_objects
    zones:
      backyard:
        coordinates: ["0.2,0.2", "0.8,0.2", "0.8,0.8", "0.2,0.8"]  # Valid array format
        objects:
          - person
          - dog
        inertia: 5

# Alternative ARRAY FORMAT example (commented out)
# cameras:
#   - name: front_door_array
#     enabled: true
#     ffmpeg:
#       inputs:
#         - path: rtsp://user:pass@192.168.1.100:554/stream1
#           roles:
#             - detect
#     detect:
#       width: 1280
#       height: 720
#       fps: 5

# Global GenAI
genai:
  enabled: true
  provider: openai
  model: gpt-4o
  api_key: "sk-your-openai-api-key-here"  # Replace with actual key
  base_url: "https://api.openai.com/v1"
  prompt: "Analyze the {label} behavior and intent based on its movement pattern."
`;