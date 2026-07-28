const content = `<§
const misc = require("server/misc");
const distribution = require("courses/reports")
    .getDepartmentDistribution(null, null);
const rows = distribution.rows;
const total = rows.reduce((sum, row) => sum + row.value, 0);
const colors = [
    "#2563EB", "#7C3AED", "#DB2777", "#DC2626", "#EA580C",
    "#CA8A04", "#16A34A", "#0891B2", "#4F46E5", "#9333EA",
    "#C026D3", "#E11D48", "#0D9488", "#65A30D", "#D97706"
];
const legend = [];
const slices = [];
let offset = 0;
let colorIndex = 0;

for (const row of rows) {
    const count = row.value;
    const startRatio = total === 0 ? 0 : offset / total;
    offset += count;
    const endRatio = total === 0 ? 0 : offset / total;
    const mappedColor = distribution.colors.find(
        item => item.name === row.name
    );
    const color = mappedColor
        ? mappedColor.value
        : colors[colorIndex % colors.length];
    const startAngle = startRatio * Math.PI * 2 - Math.PI / 2;
    const endAngle = endRatio * Math.PI * 2 - Math.PI / 2;
    const midAngle = (startAngle + endAngle) / 2;
    const radius = 150;
    const labelRadius = 98;
    const x1 = 180 + radius * Math.cos(startAngle);
    const y1 = 180 + radius * Math.sin(startAngle);
    const x2 = 180 + radius * Math.cos(endAngle);
    const y2 = 180 + radius * Math.sin(endAngle);
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    const path = rows.length === 1
        ? "M 180 30 A 150 150 0 1 1 179.999 30 Z"
        : "M 180 180 L " + x1 + " " + y1 +
            " A 150 150 0 " + largeArc + " 1 " + x2 + " " + y2 + " Z";
    const name = misc.escapeHTML(row.name);
    const shortName = name.length > 18
        ? name.substring(0, 16) + "…"
        : name;
    const percentage = total === 0
        ? "0"
        : (100 * count / total).toFixed(1);
    slices.push({
        index: slices.length,
        color,
        count,
        name,
        shortName,
        percentage,
        path,
        labelX: 180 + labelRadius * Math.cos(midAngle),
        labelY: 180 + labelRadius * Math.sin(midAngle)
    });
    legend.push({
        name,
        count,
        color
    });
    colorIndex++;
}
§>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Courses by department</title>
    <style>
        @page { size: A4 landscape; margin: 14mm; }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            color: #172033;
            background: #fff;
            font-family: Arial, Helvetica, sans-serif;
        }
        .page {
            width: 100%;
            min-height: 180mm;
            padding: 8mm 10mm;
        }
        h1 { margin: 0; font-size: 26px; }
        .subtitle { margin-top: 7px; color: #667085; font-size: 14px; }
        .content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 18mm;
            margin-top: 14mm;
        }
        .pie {
            width: 118mm;
            height: 118mm;
            overflow: visible;
            filter: drop-shadow(0 2px 3px rgba(15,23,42,.24));
        }
        .slice {
            stroke: none;
            cursor: pointer;
            filter: none;
            transition: opacity .18s ease;
        }
        .slice-group {
            cursor: pointer;
        }
        .slice-overlay {
            opacity: 0;
            pointer-events: none;
            transform-box: view-box;
            transform-origin: 180px 180px;
            transition: opacity .18s ease, transform .18s ease;
            filter: brightness(1.06) drop-shadow(4px 6px 5px rgba(15,23,42,.38));
        }
        .slice-group:hover .slice-label,
        .slice-group:focus .slice-label {
            font-weight: 700;
        }
        .slice-label {
            fill: #fff;
            stroke: rgba(0,0,0,.38);
            stroke-width: 2px;
            paint-order: stroke fill;
            text-anchor: middle;
            pointer-events: none;
            font-size: 10px;
        }
        .slice-label-group {
            transform-box: view-box;
            transform-origin: 180px 180px;
            transition: transform .18s ease;
        }
        <§ for (const slice of slices) { §>
        .pie:has(.slice-group[data-slice-index="<§= slice.index §>"]:hover)
            .slice-group[data-slice-index="<§= slice.index §>"] .slice,
        .pie:has(.slice-group[data-slice-index="<§= slice.index §>"]:focus)
            .slice-group[data-slice-index="<§= slice.index §>"] .slice {
            opacity: 0;
        }
        .pie:has(.slice-group[data-slice-index="<§= slice.index §>"]:hover)
            .slice-overlay[data-slice-index="<§= slice.index §>"],
        .pie:has(.slice-group[data-slice-index="<§= slice.index §>"]:focus)
            .slice-overlay[data-slice-index="<§= slice.index §>"] {
            opacity: 1;
            transform: scale(1.045);
        }
        .pie:has(.slice-group[data-slice-index="<§= slice.index §>"]:hover)
            .slice-label-group[data-slice-index="<§= slice.index §>"],
        .pie:has(.slice-group[data-slice-index="<§= slice.index §>"]:focus)
            .slice-label-group[data-slice-index="<§= slice.index §>"] {
            transform: scale(1.045);
        }
        <§ } §>
        .slice-count {
            font-size: 14px;
            font-weight: 700;
        }
        .legend {
            min-width: 92mm;
            max-width: 120mm;
            columns: 2;
            column-gap: 10mm;
            font-size: 13px;
        }
        .legend-row {
            break-inside: avoid;
            display: flex;
            align-items: center;
            margin: 0 0 8px;
        }
        .swatch {
            width: 12px;
            height: 12px;
            margin-right: 8px;
            border-radius: 2px;
            flex: 0 0 auto;
        }
        .name { flex: 1; }
        .count { margin-left: 12px; font-weight: bold; }
        .empty { color: #667085; font-size: 18px; }
    </style>
</head>
<body>
<main class="page">
    <h1>Courses by department</h1>
    <div class="subtitle"><§= total §> courses · direct department assignment</div>
    <§ if (total === 0) { §>
        <div class="content empty">No courses with a department.</div>
    <§ } else { §>
        <div class="content">
            <svg class="pie" viewBox="0 0 360 360"
                role="img" aria-label="Courses by department">
                <g class="slices">
                    <§ for (const slice of slices) { §>
                        <g class="slice-group" tabindex="0"
                            data-slice-index="<§= slice.index §>">
                            <path class="slice"
                                d="<§= slice.path §>"
                                fill="<§= slice.color §>">
                                <title><§= slice.name §>: <§= slice.count §> courses (<§= slice.percentage §>%)</title>
                            </path>
                        </g>
                    <§ } §>
                </g>
                <g class="overlays">
                    <§ for (const slice of slices) { §>
                        <path class="slice-overlay"
                            data-slice-index="<§= slice.index §>"
                            d="<§= slice.path §>"
                            fill="<§= slice.color §>">
                        </path>
                    <§ } §>
                </g>
                <g class="labels">
                    <§ for (const slice of slices) { §>
                        <g class="slice-label-group"
                            data-slice-index="<§= slice.index §>">
                            <text class="slice-label"
                                x="<§= slice.labelX §>"
                                y="<§= slice.labelY - 4 §>">
                                <tspan x="<§= slice.labelX §>"><§= slice.shortName §></tspan>
                                <tspan class="slice-count"
                                    x="<§= slice.labelX §>" dy="16"><§= slice.count §></tspan>
                            </text>
                        </g>
                    <§ } §>
                </g>
            </svg>
            <div class="legend">
                <§ for (const item of legend) { §>
                    <div class="legend-row">
                        <span class="swatch" style="background:<§= item.color §>"></span>
                        <span class="name"><§= item.name §></span>
                        <span class="count"><§= item.count §></span>
                    </div>
                <§ } §>
            </div>
        </div>
    <§ } §>
</main>
</body>
</html>`;

vr.defineObject({
    SCHEMA: "reports.report_vsp",
    code: "courses.courses-by-department-html",
    values: {
        name: {
            "en-US": "Courses by department (HTML)",
            "de-DE": "Kurse nach Abteilung (HTML)"
        },
        description: {
            "en-US": "One-page pie chart of direct course counts by department.",
            "de-DE": "Einseitiges Kreisdiagramm der direkten Kursanzahl nach Abteilung."
        },
        objectdef_set: [{
            SCHEMA: "core.objectdef",
            cond: "module.code='courses' AND code='course'"
        }],
        format: {
            SCHEMA: "documents.extension",
            mode: "lookup",
            code: "HTML"
        },
        file_encoding: null,
        content: {
            "en-US": content,
            "de-DE": content
        },
        is_selection_sensitive: false,
        is_selection_obligatory: false,
        is_remote_access_by_code: true
    }
}, {
    objectdef_set: "replace"
});

vr.defineObject({
    SCHEMA: "reports.report_vsp",
    code: "courses.courses-by-department",
    mode: "delete"
});
