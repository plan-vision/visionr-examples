#!/usr/bin/env node

const path = require("node:path");
const fs = require("node:fs");
const ExcelJS = require("exceljs");

const outputPath = path.resolve(
    __dirname,
    "../share/documents/courses/reports/course-participants.xlsx"
);

async function main() {
    fs.mkdirSync(path.dirname(outputPath), {recursive: true});

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "VisionR students-courses";
    workbook.created = new Date("2026-07-25T00:00:00.000Z");
    workbook.modified = workbook.created;

    const sheet = workbook.addWorksheet("Course", {
        pageSetup: {
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 0,
            printArea: "B1:E10",
            margins: {
                left: 0.35,
                right: 0.35,
                top: 0.5,
                bottom: 0.5,
                header: 0.2,
                footer: 0.2
            }
        }
    });

    sheet.getColumn("A").hidden = true;
    sheet.getColumn("F").hidden = true;
    sheet.getColumn("B").width = 7;
    sheet.getColumn("C").width = 18;
    sheet.getColumn("D").width = 34;
    sheet.getColumn("E").width = 32;

    sheet.mergeCells("B1:E1");
    sheet.getCell("B1").value = "Course participant report";
    sheet.getCell("B1").font = {name: "Aptos", size: 18, bold: true};
    sheet.getCell("B1").alignment = {
        horizontal: "center",
        vertical: "middle"
    };
    sheet.getCell("B1").fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {argb: "FFBDD7EE"}
    };
    sheet.getRow(1).height = 30;

    setLabel(sheet, "B2", "Course code");
    sheet.mergeCells("C2:E2");
    sheet.getCell("C2").value = "${data.code}";

    setLabel(sheet, "B3", "Name");
    sheet.mergeCells("C3:E3");
    sheet.getCell("C3").value = "${data.name}";

    setLabel(sheet, "B4", "Description");
    sheet.mergeCells("C4:E4");
    sheet.getCell("C4").value = "${data.description}";
    sheet.getCell("C4").alignment = {vertical: "middle", wrapText: true};
    sheet.getRow(4).height = 42;

    setLabel(sheet, "B5", "Begin");
    sheet.getCell("C5").value = "${data.begin_time}";
    sheet.getCell("C5").numFmt = "yyyy-mm-dd hh:mm";
    setLabel(sheet, "D5", "End");
    sheet.getCell("E5").value = "${data.end_time}";
    sheet.getCell("E5").numFmt = "yyyy-mm-dd hh:mm";

    applyBorders(sheet, "B2:E5");

    sheet.mergeCells("B8:E8");
    sheet.getCell("B8").value = "Participants";
    sheet.getCell("B8").font = {name: "Aptos", size: 14, bold: true};

    ["#", "Student code", "Name", "Email"].forEach(function(value, index) {
        const cell = sheet.getRow(9).getCell(index + 2);
        cell.value = value;
        cell.font = {name: "Aptos", bold: true};
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {argb: "FFBDD7EE"}
        };
    });
    applyBorders(sheet, "B9:E9");

    sheet.getCell("A10").value =
        "<jt:forEach " +
        "items=\"${jsc['get_participant_rows'](data)}\" " +
        "var=\"participant\" indexVar=\"idx\">";
    sheet.getCell("B10").value = "${idx + 1}";
    sheet.getCell("C10").value = "${participant.code}";
    sheet.getCell("D10").value = "${participant.name}";
    sheet.getCell("E10").value = "${participant.email}";
    sheet.getCell("F10").value = "</jt:forEach>";
    applyBorders(sheet, "B10:E10");

    sheet.getRange = function(range) {
        const [start, end] = range.split(":");
        const cells = [];
        const startCell = this.getCell(start);
        const endCell = this.getCell(end);
        for (let row = startCell.row; row <= endCell.row; row += 1) {
            for (let column = startCell.col;
                column <= endCell.col;
                column += 1) {
                cells.push(this.getRow(row).getCell(column));
            }
        }
        return cells;
    };
    sheet.getRange("B1:E10").forEach(function(cell) {
        cell.font = {...cell.font, name: "Aptos"};
        cell.alignment = {...cell.alignment, vertical: "middle"};
    });

    await workbook.xlsx.writeFile(outputPath);
    await validateWorkbook(outputPath);
    console.log(outputPath);
}

function setLabel(sheet, address, value) {
    const cell = sheet.getCell(address);
    cell.value = value;
    cell.font = {name: "Aptos", bold: true};
    cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: {argb: "FFD9EAF7"}
    };
}

function applyBorders(sheet, range) {
    const [start, end] = range.split(":");
    const startCell = sheet.getCell(start);
    const endCell = sheet.getCell(end);
    const border = {
        top: {style: "thin"},
        left: {style: "thin"},
        bottom: {style: "thin"},
        right: {style: "thin"}
    };

    for (let row = startCell.row; row <= endCell.row; row += 1) {
        for (let column = startCell.col;
            column <= endCell.col;
            column += 1) {
            sheet.getRow(row).getCell(column).border = border;
        }
    }
}

async function validateWorkbook(filename) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filename);
    const sheet = workbook.getWorksheet("Course");
    const expected = {
        C2: "${data.code}",
        C3: "${data.name}",
        C4: "${data.description}",
        C5: "${data.begin_time}",
        E5: "${data.end_time}",
        B10: "${idx + 1}",
        C10: "${participant.code}",
        D10: "${participant.name}",
        E10: "${participant.email}",
        F10: "</jt:forEach>"
    };

    if (!sheet)
        throw new Error("Generated workbook is missing the Course sheet.");
    if (!sheet.getCell("A10").value.includes(
        "jsc['get_participant_rows'](data)"
    ))
        throw new Error("Generated workbook is missing the participant loop.");

    Object.entries(expected).forEach(function(entry) {
        if (sheet.getCell(entry[0]).value !== entry[1])
            throw new Error("Unexpected workbook value at " + entry[0] + ".");
    });
}

main().catch(function(error) {
    console.error(error);
    process.exitCode = 1;
});
