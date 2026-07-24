const departments = [
    ["SCI", "faculty-of-science.png", "Faculty of Science"],
    ["CS", "computer-science.png", "Computer Science"],
    ["DS", "data-science.png", "Data Science"],
    ["MATH", "mathematics.png", "Mathematics"],
    ["PHYS", "physics.png", "Physics"],
    ["CHEM", "chemistry.png", "Chemistry"],
    ["BIO", "biology.png", "Biology"],
    ["AI", "artificial-intelligence.png", "Artificial Intelligence"],
    ["SE", "software-engineering.png", "Software Engineering"],
    ["STAT", "statistics.png", "Statistics"]
];

const icons = {};

departments.forEach(function(department) {
    const departmentCode = department[0];
    const filename = department[1];
    const name = department[2];

    icons[departmentCode] = vr.defineDocument({
        code: "courses_department_" + departmentCode.toLowerCase() + "_icon",
        source: "share/documents/courses/department-icons/" + filename,
        folder: "/courses/department-icons",
        folderName: {
            "en-US": "Department icons",
            "de-DE": "Fachbereichssymbole"
        },
        schema: "documents.icon",
        name: {
            "en-US": name + " icon",
            "de-DE": name + " Symbol"
        },
        version: departmentCode === "MATH" ? "1.5" : "1.1",
        values: {
            width: 128,
            height: 128
        },
        access: {
            read: "logged_users",
            owner: "administrators",
            mutate: "administrators"
        }
    });
});

module.exports = icons;
