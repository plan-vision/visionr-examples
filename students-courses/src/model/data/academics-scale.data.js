// Scale seed data for the courses example.
//
// The semantic sample set in academics.data.js stays small and exact. Bulk
// records use the BULK- code prefix so the AI search acceptance corpus in
// src/srv/ai-search-evaluation.corpus.js can exclude them the same way it
// already excludes the optional PERF-* performance fixture. Without that
// separation, dataset-sized expectations such as "students whose email ends
// with @example.edu" would have to enumerate every bulk record.
//
// Everything here is generated deterministically from fixed name/topic pools,
// so a repeated import produces identical objects.

const BULK_STUDENT_COUNT = 1000;
const BULK_COURSE_COUNT = 30;
const BULK_STUDENT_PREFIX = "BULK-S-";
const BULK_COURSE_PREFIX = "BULK-C-";

const firstNames = [
    "Ana", "Bilal", "Camila", "Dmitri", "Elena", "Farid", "Greta", "Hiroshi",
    "Ines", "Jonas", "Kavya", "Lorenzo", "Maja", "Nadia", "Omar", "Petra",
    "Qasim", "Rosa", "Sven", "Tara", "Ulrich", "Vera", "Wiktor", "Ximena",
    "Yusuf", "Zofia", "Amara", "Bruno", "Chiara", "Duarte", "Elif", "Felix",
    "Gulnara", "Hugo", "Iris", "Jakub", "Klara", "Leandro", "Mirela", "Nikolai"
];

const lastNames = [
    "Almeida", "Bauer", "Costa", "Dimitrov", "Eriksen", "Fischer", "Garcia",
    "Hansen", "Ivanova", "Jansen", "Kowalski", "Lindqvist", "Moreau",
    "Novak", "Oduya", "Petrov", "Quintero", "Rossi", "Schmidt", "Takahashi",
    "Ueda", "Varga", "Weber", "Yilmaz", "Zielinski", "Andersen", "Bianchi",
    "Chowdhury", "Dubois", "Engel", "Fernandez", "Grimaldi", "Horvath",
    "Iqbal", "Jovanovic", "Keller", "Larsen", "Mammadova", "Nguyen", "Okafor"
];

const departments = ["AI", "BIO", "CHEM", "CS", "DS", "MATH", "PHYS", "SE", "STAT"];

const courseTopics = {
    AI: [
        ["Applied Machine Learning", "Angewandtes maschinelles Lernen"],
        ["Computer Vision", "Computer Vision"],
        ["Natural Language Processing", "Sprachverarbeitung"],
        ["Knowledge Representation", "Wissensrepräsentation"],
        ["Autonomous Systems", "Autonome Systeme"]
    ],
    BIO: [
        ["Molecular Genetics", "Molekulargenetik"],
        ["Ecology Field Studies", "Ökologische Feldstudien"],
        ["Systems Biology", "Systembiologie"],
        ["Neurobiology", "Neurobiologie"],
        ["Marine Microbiology", "Marine Mikrobiologie"]
    ],
    CHEM: [
        ["Organic Synthesis", "Organische Synthese"],
        ["Analytical Chemistry", "Analytische Chemie"],
        ["Physical Chemistry", "Physikalische Chemie"],
        ["Catalysis", "Katalyse"],
        ["Spectroscopy", "Spektroskopie"]
    ],
    CS: [
        ["Operating Systems", "Betriebssysteme"],
        ["Computer Networks", "Rechnernetze"],
        ["Programming Languages", "Programmiersprachen"],
        ["Cryptography", "Kryptographie"],
        ["Software Verification", "Softwareverifikation"]
    ],
    DS: [
        ["Statistical Learning", "Statistisches Lernen"],
        ["Data Engineering", "Datenengineering"],
        ["Visual Analytics", "Visuelle Analytik"],
        ["Time Series Forecasting", "Zeitreihenprognose"],
        ["Causal Inference", "Kausale Inferenz"]
    ],
    MATH: [
        ["Linear Algebra", "Lineare Algebra"],
        ["Real Analysis", "Analysis"],
        ["Topology", "Topologie"],
        ["Number Theory", "Zahlentheorie"],
        ["Optimization", "Optimierung"]
    ],
    PHYS: [
        ["Classical Mechanics", "Klassische Mechanik"],
        ["Quantum Field Theory", "Quantenfeldtheorie"],
        ["Thermodynamics", "Thermodynamik"],
        ["Astrophysics", "Astrophysik"],
        ["Condensed Matter", "Festkörperphysik"]
    ],
    SE: [
        ["Software Architecture", "Softwarearchitektur"],
        ["Agile Methods", "Agile Methoden"],
        ["Requirements Engineering", "Anforderungsanalyse"],
        ["Quality Assurance", "Qualitätssicherung"],
        ["DevOps Engineering", "DevOps-Engineering"]
    ],
    STAT: [
        ["Probability Theory", "Wahrscheinlichkeitstheorie"],
        ["Experimental Design", "Versuchsplanung"],
        ["Multivariate Statistics", "Multivariate Statistik"],
        ["Nonparametric Methods", "Nichtparametrische Methoden"],
        ["Bayesian Computing", "Bayessche Verfahren"]
    ]
};

function pad(value, length) {
    value = String(value);
    while (value.length < length)
        value = "0" + value;
    return value;
}

function ref(schema, code) {
    return {
        SCHEMA: schema,
        code: code
    };
}

function define(schema, code, values, propertyModes) {
    vr.defineObject({
        SCHEMA: schema,
        code: code,
        values: values
    }, propertyModes);
}

function studentCode(index) {
    return BULK_STUDENT_PREFIX + pad(index + 1, 4);
}

function courseCode(index) {
    return BULK_COURSE_PREFIX + pad(index + 1, 4);
}

// Deterministic spread so bulk courses do not bunch onto one weekday.
function courseBegin(index) {
    return new Date(Date.UTC(2026, 8, 1 + index * 7, 9 + (index % 2) * 3, 0, 0));
}

function deliveryModeFor(department) {
    if (department === "AI" || department === "DS" || department === "STAT")
        return "hybrid";
    if (department === "CS" || department === "SE")
        return "online";
    return "on_campus";
}

// Round-robin assignment guarantees every bulk student is enrolled in at
// least one bulk course; the extra pass then fills each course to a size that
// looks realistic in the participant-load dashboard.
const participantsByCourse = [];
for (let index = 0; index < BULK_COURSE_COUNT; index++)
    participantsByCourse.push([]);

for (let index = 0; index < BULK_STUDENT_COUNT; index++)
    participantsByCourse[index % BULK_COURSE_COUNT].push(index);

for (let courseIndex = 0; courseIndex < BULK_COURSE_COUNT; courseIndex++) {
    const assigned = participantsByCourse[courseIndex];
    const target = 30 + ((courseIndex * 13) % 26);
    let cursor = (courseIndex * 37) % BULK_STUDENT_COUNT;

    while (assigned.length < target) {
        if (assigned.indexOf(cursor) < 0)
            assigned.push(cursor);
        cursor = (cursor + 1) % BULK_STUDENT_COUNT;
    }
}

for (let index = 0; index < BULK_STUDENT_COUNT; index++) {
    const firstName = firstNames[index % firstNames.length];
    const lastName = lastNames[Math.floor(index / firstNames.length) % lastNames.length];
    const displayName = firstName + " " + lastName;

    define("courses.student", studentCode(index), {
        name: {
            "en-US": displayName,
            "de-DE": displayName
        },
        email: firstName.toLowerCase() + "." + lastName.toLowerCase() +
            (index + 1) + "@example.edu"
    });
}

for (let index = 0; index < BULK_COURSE_COUNT; index++) {
    const department = departments[index % departments.length];
    const topics = courseTopics[department];
    const topic = topics[Math.floor(index / departments.length) % topics.length];
    const suffix = " Seminar " + pad(index + 1, 2);
    const code = courseCode(index);
    const begin = courseBegin(index);
    const end = new Date(begin.getTime() + (2 + (index % 2)) * 60 * 60 * 1000);

    define("courses.course", code, {
        name: {
            "en-US": topic[0] + suffix,
            "de-DE": topic[1] + suffix
        },
        department: ref("courses.department", department),
        status: ref("courses.course_status",
            ["planned", "in_progress", "completed"][index % 3]),
        credits: 3 + (index % 4),
        delivery_mode: deliveryModeFor(department),
        requires_lab: department === "BIO" || department === "CHEM" ||
            department === "PHYS",
        begin_time: begin.toISOString(),
        end_time: end.toISOString(),
        participants: participantsByCourse[index].map(function (student) {
            return ref("courses.student", studentCode(student));
        })
    }, {
        participants: "replace"
    });
}

module.exports = {
    studentCount: BULK_STUDENT_COUNT,
    courseCount: BULK_COURSE_COUNT,
    studentPrefix: BULK_STUDENT_PREFIX,
    coursePrefix: BULK_COURSE_PREFIX
};
