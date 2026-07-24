function ref(schema, code) {
    return {
        SCHEMA: schema,
        code: code
    };
}

const departmentIcons = require("./department-icons.data");

function departmentIcon(code) {
    return departmentIcons[code];
}

function define(schema, code, values, propertyModes) {
    if (schema === "courses.course" && values.begin_time) {
        const courseDate = values.begin_time.slice(0, 10);
        values.begin_time = courseDate + "T09:00:00.000Z";
        values.end_time = courseDate + "T19:00:00.000Z";
    }

    vr.defineObject({
        SCHEMA: schema,
        code: code,
        values: values
    }, propertyModes);
}

define("courses.department", "SCI", {
    name: {
        "en-US": "Faculty of Science",
        "de-DE": "Naturwissenschaftliche Fakultät"
    },
    color: "#B0BEC5",
    icon: departmentIcon("SCI")
});

define("courses.department", "CS", {
    name: {
        "en-US": "Computer Science",
        "de-DE": "Informatik"
    },
    color: "#9FA8DA",
    icon: departmentIcon("CS"),
    parent: ref("courses.department", "SCI")
});

define("courses.department", "DS", {
    name: {
        "en-US": "Data Science",
        "de-DE": "Datenwissenschaft"
    },
    color: "#80CBC4",
    icon: departmentIcon("DS"),
    parent: ref("courses.department", "CS")
});

define("courses.student", "STU-001", {
    name: {
        "en-US": "Ada Lovelace",
        "de-DE": "Ada Lovelace"
    },
    email: "ada@example.edu"
});

define("courses.student", "STU-002", {
    name: {
        "en-US": "Alan Turing",
        "de-DE": "Alan Turing"
    },
    email: "alan@example.edu"
});

define("courses.student", "STU-003", {
    name: {
        "en-US": "Grace Hopper",
        "de-DE": "Grace Hopper"
    },
    email: "grace@example.edu"
});

define("courses.course_status", "planned", {
    name: {
        "en-US": "Planned",
        "de-DE": "Geplant"
    },
    color: "#6E94FF66"
});

define("courses.course_status", "in_progress", {
    name: {
        "en-US": "In progress",
        "de-DE": "In Bearbeitung"
    },
    color: "#F2A93B66"
});

define("courses.course_status", "completed", {
    name: {
        "en-US": "Completed",
        "de-DE": "Abgeschlossen"
    },
    color: "#4F9D6966"
});

define("courses.course", "ADM-301", {
    name: {
        "en-US": "Applied Data Modeling",
        "de-DE": "Angewandte Datenmodellierung"
    },
    department: ref("courses.department", "DS"),
    status: ref("courses.course_status", "completed"),
    credits: 6,
    begin_time: "2026-09-01T09:00:00.000Z",
    end_time: "2026-09-01T11:00:00.000Z",
    participants: [
        ref("courses.student", "STU-001"),
        ref("courses.student", "STU-002")
    ]
}, {
    participants: "replace"
});

define("courses.course", "ALG-201", {
    name: {
        "en-US": "Algorithms and Data Structures",
        "de-DE": "Algorithmen und Datenstrukturen"
    },
    department: ref("courses.department", "CS"),
    status: ref("courses.course_status", "in_progress"),
    credits: 5,
    begin_time: "2026-09-02T10:00:00.000Z",
    end_time: "2026-09-02T12:00:00.000Z",
    participants: [
        ref("courses.student", "STU-002"),
        ref("courses.student", "STU-003")
    ]
}, {
    participants: "replace"
});

define("courses.department", "MATH", {
    name: {
        "en-US": "Mathematics",
        "de-DE": "Mathematik"
    },
    color: "#B39DDB",
    icon: departmentIcon("MATH"),
    parent: ref("courses.department", "SCI")
});

define("courses.department", "PHYS", {
    name: {
        "en-US": "Physics",
        "de-DE": "Physik"
    },
    color: "#90CAF9",
    icon: departmentIcon("PHYS"),
    parent: ref("courses.department", "SCI")
});

define("courses.department", "CHEM", {
    name: {
        "en-US": "Chemistry",
        "de-DE": "Chemie"
    },
    color: "#EF9A9A",
    icon: departmentIcon("CHEM"),
    parent: ref("courses.department", "SCI")
});

define("courses.department", "BIO", {
    name: {
        "en-US": "Biology",
        "de-DE": "Biologie"
    },
    color: "#A5D6A7",
    icon: departmentIcon("BIO"),
    parent: ref("courses.department", "SCI")
});

define("courses.department", "AI", {
    name: {
        "en-US": "Artificial Intelligence",
        "de-DE": "Künstliche Intelligenz"
    },
    color: "#CE93D8",
    icon: departmentIcon("AI"),
    parent: ref("courses.department", "CS")
});

define("courses.department", "SE", {
    name: {
        "en-US": "Software Engineering",
        "de-DE": "Softwaretechnik"
    },
    color: "#FFAB91",
    icon: departmentIcon("SE"),
    parent: ref("courses.department", "CS")
});

define("courses.department", "STAT", {
    name: {
        "en-US": "Statistics",
        "de-DE": "Statistik"
    },
    color: "#FFCC80",
    icon: departmentIcon("STAT"),
    parent: ref("courses.department", "MATH")
});

define("courses.student", "STU-004", {
    name: {
        "en-US": "Katherine Johnson",
        "de-DE": "Katherine Johnson"
    },
    email: "katherine@example.edu"
});

define("courses.student", "STU-005", {
    name: {
        "en-US": "Edsger Dijkstra",
        "de-DE": "Edsger Dijkstra"
    },
    email: "edsger@example.edu"
});

define("courses.student", "STU-006", {
    name: {
        "en-US": "Margaret Hamilton",
        "de-DE": "Margaret Hamilton"
    },
    email: "margaret@example.edu"
});

define("courses.student", "STU-007", {
    name: {
        "en-US": "Donald Knuth",
        "de-DE": "Donald Knuth"
    },
    email: "donald@example.edu"
});

define("courses.student", "STU-008", {
    name: {
        "en-US": "Barbara Liskov",
        "de-DE": "Barbara Liskov"
    },
    email: "barbara@example.edu"
});

define("courses.student", "STU-009", {
    name: {
        "en-US": "John von Neumann",
        "de-DE": "John von Neumann"
    },
    email: "john@example.edu"
});

define("courses.student", "STU-010", {
    name: {
        "en-US": "Emmy Noether",
        "de-DE": "Emmy Noether"
    },
    email: "emmy@example.edu"
});

define("courses.course", "AI-401", {
    name: {
        "en-US": "Introduction to Artificial Intelligence",
        "de-DE": "Einführung in die Künstliche Intelligenz"
    },
    department: ref("courses.department", "AI"),
    status: ref("courses.course_status", "planned"),
    credits: 6,
    begin_time: "2026-09-03T09:30:00.000Z",
    end_time: "2026-09-03T11:30:00.000Z",
    participants: [
        ref("courses.student", "STU-001"),
        ref("courses.student", "STU-004"),
        ref("courses.student", "STU-008")
    ]
}, {
    participants: "replace"
});

define("courses.course", "SE-310", {
    name: {
        "en-US": "Software Architecture",
        "de-DE": "Softwarearchitektur"
    },
    department: ref("courses.department", "SE"),
    status: ref("courses.course_status", "planned"),
    credits: 5,
    begin_time: "2026-09-04T13:00:00.000Z",
    end_time: "2026-09-04T15:00:00.000Z",
    participants: [
        ref("courses.student", "STU-005"),
        ref("courses.student", "STU-006")
    ]
}, {
    participants: "replace"
});

define("courses.course", "MATH-210", {
    name: {
        "en-US": "Linear Algebra",
        "de-DE": "Lineare Algebra"
    },
    department: ref("courses.department", "MATH"),
    status: ref("courses.course_status", "in_progress"),
    credits: 5,
    begin_time: "2026-09-07T08:00:00.000Z",
    end_time: "2026-09-07T10:00:00.000Z",
    participants: [
        ref("courses.student", "STU-003"),
        ref("courses.student", "STU-010")
    ]
}, {
    participants: "replace"
});

define("courses.course", "STAT-320", {
    name: {
        "en-US": "Applied Statistics",
        "de-DE": "Angewandte Statistik"
    },
    department: ref("courses.department", "STAT"),
    status: ref("courses.course_status", "planned"),
    credits: 6,
    begin_time: "2026-09-08T11:00:00.000Z",
    end_time: "2026-09-08T13:00:00.000Z",
    participants: [
        ref("courses.student", "STU-004"),
        ref("courses.student", "STU-009"),
        ref("courses.student", "STU-010")
    ]
}, {
    participants: "replace"
});

define("courses.course", "PHYS-101", {
    name: {
        "en-US": "Classical Mechanics",
        "de-DE": "Klassische Mechanik"
    },
    department: ref("courses.department", "PHYS"),
    status: ref("courses.course_status", "completed"),
    credits: 5,
    begin_time: "2026-09-09T09:00:00.000Z",
    end_time: "2026-09-09T11:00:00.000Z",
    participants: [
        ref("courses.student", "STU-002"),
        ref("courses.student", "STU-007")
    ]
}, {
    participants: "replace"
});

define("courses.course", "CHEM-110", {
    name: {
        "en-US": "General Chemistry",
        "de-DE": "Allgemeine Chemie"
    },
    department: ref("courses.department", "CHEM"),
    status: ref("courses.course_status", "in_progress"),
    credits: 4,
    begin_time: "2026-09-10T12:30:00.000Z",
    end_time: "2026-09-10T14:30:00.000Z",
    participants: [
        ref("courses.student", "STU-006"),
        ref("courses.student", "STU-008")
    ]
}, {
    participants: "replace"
});

define("courses.course", "BIO-120", {
    name: {
        "en-US": "Cell Biology",
        "de-DE": "Zellbiologie"
    },
    department: ref("courses.department", "BIO"),
    status: ref("courses.course_status", "planned"),
    credits: 4,
    begin_time: "2026-09-11T10:00:00.000Z",
    end_time: "2026-09-11T12:00:00.000Z",
    participants: [
        ref("courses.student", "STU-003"),
        ref("courses.student", "STU-009")
    ]
}, {
    participants: "replace"
});

define("courses.course", "DS-410", {
    name: {
        "en-US": "Machine Learning Systems",
        "de-DE": "Systeme für maschinelles Lernen"
    },
    department: ref("courses.department", "DS"),
    status: ref("courses.course_status", "completed"),
    credits: 6,
    begin_time: "2026-09-14T14:00:00.000Z",
    end_time: "2026-09-14T16:00:00.000Z",
    participants: [
        ref("courses.student", "STU-001"),
        ref("courses.student", "STU-005"),
        ref("courses.student", "STU-007")
    ]
}, {
    participants: "replace"
});

[
    ["STU-011", "Frances Allen", "frances@example.edu"],
    ["STU-012", "Claude Shannon", "claude@example.edu"],
    ["STU-013", "Mary Jackson", "mary@example.edu"],
    ["STU-014", "Niklaus Wirth", "niklaus@example.edu"],
    ["STU-015", "Dorothy Vaughan", "dorothy@example.edu"],
    ["STU-016", "Linus Pauling", "linus@example.edu"],
    ["STU-017", "Rachel Carson", "rachel@example.edu"],
    ["STU-018", "Srinivasa Ramanujan", "srinivasa@example.edu"],
    ["STU-019", "Vera Rubin", "vera@example.edu"],
    ["STU-020", "Tim Berners-Lee", "tim@example.edu"]
].forEach(function(student) {
    define("courses.student", student[0], {
        name: {
            "en-US": student[1],
            "de-DE": student[1]
        },
        email: student[2]
    });
});

function defineCourse(code, name, nameDe, department, status, credits,
    beginTime, endTime, participants) {
    define("courses.course", code, {
        name: {
            "en-US": name,
            "de-DE": nameDe
        },
        department: ref("courses.department", department),
        status: ref("courses.course_status", status),
        credits: credits,
        begin_time: beginTime,
        end_time: endTime,
        participants: participants.map(function(studentCode) {
            return ref("courses.student", studentCode);
        })
    }, {
        participants: "replace"
    });
}

[
    [
        "CS-150", "Programming Foundations", "Grundlagen der Programmierung",
        "CS", "completed", 5,
        "2026-07-27T08:00:00.000Z", "2026-07-27T10:00:00.000Z",
        ["STU-001", "STU-006", "STU-011", "STU-014", "STU-020"]
    ],
    [
        "MATH-130", "Discrete Mathematics", "Diskrete Mathematik",
        "MATH", "completed", 5,
        "2026-07-28T10:30:00.000Z", "2026-07-28T12:30:00.000Z",
        ["STU-002", "STU-007", "STU-010", "STU-012", "STU-018"]
    ],
    [
        "BIO-205", "Genetics", "Genetik",
        "BIO", "in_progress", 4,
        "2026-07-29T13:00:00.000Z", "2026-07-29T15:00:00.000Z",
        ["STU-003", "STU-009", "STU-013", "STU-017"]
    ],
    [
        "PHYS-220", "Electromagnetism", "Elektromagnetismus",
        "PHYS", "planned", 5,
        "2026-07-31T09:00:00.000Z", "2026-07-31T11:30:00.000Z",
        ["STU-004", "STU-008", "STU-015", "STU-019"]
    ],
    [
        "DS-230", "Data Visualization", "Datenvisualisierung",
        "DS", "completed", 5,
        "2026-08-04T09:00:00.000Z", "2026-08-04T11:00:00.000Z",
        ["STU-001", "STU-005", "STU-011", "STU-013", "STU-020"]
    ],
    [
        "CHEM-240", "Organic Chemistry", "Organische Chemie",
        "CHEM", "in_progress", 5,
        "2026-08-07T12:00:00.000Z", "2026-08-07T14:30:00.000Z",
        ["STU-006", "STU-010", "STU-016", "STU-017"]
    ],
    [
        "AI-250", "Intelligent Agents", "Intelligente Agenten",
        "AI", "planned", 6,
        "2026-08-13T08:30:00.000Z", "2026-08-13T10:30:00.000Z",
        ["STU-002", "STU-004", "STU-008", "STU-012", "STU-015"]
    ],
    [
        "SE-260", "Requirements Engineering", "Anforderungsanalyse",
        "SE", "in_progress", 4,
        "2026-08-20T14:00:00.000Z", "2026-08-20T16:00:00.000Z",
        ["STU-003", "STU-007", "STU-014", "STU-019", "STU-020"]
    ],
    [
        "ALG-330", "Advanced Algorithms", "Fortgeschrittene Algorithmen",
        "CS", "completed", 6,
        "2026-10-02T09:00:00.000Z", "2026-10-02T11:30:00.000Z",
        ["STU-002", "STU-005", "STU-007", "STU-012", "STU-014", "STU-018"]
    ],
    [
        "STAT-340", "Probability Models", "Wahrscheinlichkeitsmodelle",
        "STAT", "in_progress", 5,
        "2026-10-08T11:00:00.000Z", "2026-10-08T13:00:00.000Z",
        ["STU-004", "STU-009", "STU-010", "STU-013", "STU-019"]
    ],
    [
        "BIO-315", "Ecology", "Oekologie",
        "BIO", "planned", 4,
        "2026-10-15T13:30:00.000Z", "2026-10-15T15:30:00.000Z",
        ["STU-003", "STU-011", "STU-015", "STU-017"]
    ],
    [
        "PHYS-350", "Quantum Physics", "Quantenphysik",
        "PHYS", "planned", 6,
        "2026-10-23T08:00:00.000Z", "2026-10-23T10:30:00.000Z",
        ["STU-001", "STU-006", "STU-008", "STU-016", "STU-018"]
    ],
    [
        "DS-360", "Data Engineering", "Datenengineering",
        "DS", "in_progress", 6,
        "2026-11-03T09:30:00.000Z", "2026-11-03T11:30:00.000Z",
        ["STU-001", "STU-005", "STU-011", "STU-014", "STU-020"]
    ],
    [
        "CHEM-320", "Analytical Chemistry", "Analytische Chemie",
        "CHEM", "completed", 5,
        "2026-11-09T12:30:00.000Z", "2026-11-09T14:30:00.000Z",
        ["STU-006", "STU-010", "STU-013", "STU-016"]
    ],
    [
        "AI-420", "Deep Learning", "Deep Learning",
        "AI", "planned", 6,
        "2026-11-18T08:30:00.000Z", "2026-11-18T11:00:00.000Z",
        ["STU-002", "STU-004", "STU-008", "STU-012", "STU-015", "STU-019"]
    ],
    [
        "SE-430", "Distributed Systems", "Verteilte Systeme",
        "SE", "planned", 6,
        "2026-11-26T14:00:00.000Z", "2026-11-26T16:30:00.000Z",
        ["STU-003", "STU-007", "STU-011", "STU-014", "STU-020"]
    ],
    [
        "MATH-410", "Numerical Analysis", "Numerische Mathematik",
        "MATH", "in_progress", 5,
        "2026-12-02T09:00:00.000Z", "2026-12-02T11:00:00.000Z",
        ["STU-005", "STU-009", "STU-010", "STU-012", "STU-018"]
    ],
    [
        "CS-440", "Compiler Construction", "Compilerbau",
        "CS", "planned", 6,
        "2026-12-08T11:30:00.000Z", "2026-12-08T14:00:00.000Z",
        ["STU-002", "STU-006", "STU-007", "STU-014", "STU-020"]
    ],
    [
        "BIO-440", "Computational Biology", "Computergestuetzte Biologie",
        "BIO", "planned", 5,
        "2026-12-15T13:00:00.000Z", "2026-12-15T15:00:00.000Z",
        ["STU-003", "STU-008", "STU-013", "STU-015", "STU-017"]
    ],
    [
        "STAT-450", "Bayesian Statistics", "Bayessche Statistik",
        "STAT", "planned", 6,
        "2026-12-21T08:30:00.000Z", "2026-12-21T11:00:00.000Z",
        ["STU-001", "STU-004", "STU-011", "STU-016", "STU-018", "STU-019"]
    ]
].forEach(function(course) {
    defineCourse.apply(null, course);
});
