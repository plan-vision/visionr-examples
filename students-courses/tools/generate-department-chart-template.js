#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const ExcelJS = require("exceljs");
const JSZip = require("jszip");

const outputPath = path.resolve(
    __dirname,
    "../share/documents/courses/reports/courses-by-department.xlsx"
);
const temporaryPath = path.resolve(
    __dirname,
    "../work/tmp/courses-by-department.template.xlsx"
);

async function main() {
    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    fs.mkdirSync(path.dirname(temporaryPath), {recursive: true});

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "VisionR students-courses";
    workbook.created = new Date("2026-07-27T00:00:00.000Z");
    workbook.modified = workbook.created;

    const sheet = workbook.addWorksheet("Courses by department", {
        pageSetup: {
            orientation: "landscape",
            fitToPage: true,
            fitToWidth: 1,
            fitToHeight: 1,
            printArea: "B1:L22",
            margins: {
                left: 0.3,
                right: 0.3,
                top: 0.4,
                bottom: 0.4,
                header: 0.2,
                footer: 0.2
            }
        }
    });

    sheet.getColumn("A").hidden = true;
    sheet.getColumn("B").width = 34;
    sheet.getColumn("C").width = 14;
    sheet.getColumn("D").hidden = true;
    for (let column = 5; column <= 12; column++)
        sheet.getColumn(column).width = 12;

    sheet.mergeCells("B1:L1");
    sheet.getCell("B1").value = "Courses by department (XLSX)";
    sheet.getCell("B1").font = {name: "Aptos Display", size: 20, bold: true};
    sheet.getCell("B1").alignment = {horizontal: "center"};
    sheet.getRow(1).height = 30;

    sheet.getCell("B3").value = "Department";
    sheet.getCell("C3").value = "Courses";
    for (const address of ["B3", "C3"]) {
        sheet.getCell(address).font = {name: "Aptos", bold: true, color: {argb: "FFFFFFFF"}};
        sheet.getCell(address).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: {argb: "FF4472C4"}
        };
    }

    sheet.getCell("A4").value =
        "<jt:forEach items=\"${jsc['get_department_chart_rows'](data)}\" " +
        "var=\"row\" indexVar=\"idx\">";
    sheet.getCell("B4").value = "${row.name}";
    sheet.getCell("C4").value = "${row.count}";
    sheet.getCell("D4").value = "</jt:forEach>";
    sheet.getCell("C4").numFmt = "0";

    for (let row = 4; row <= 103; row++) {
        for (const column of [2, 3]) {
            const cell = sheet.getRow(row).getCell(column);
            cell.font = {name: "Aptos", size: 11};
            cell.border = {
                bottom: {style: "hair", color: {argb: "FFD9E2F3"}}
            };
        }
    }

    await workbook.xlsx.writeFile(temporaryPath);
    await addNativePieChart(temporaryPath);
    await validateWorkbook(temporaryPath);
    fs.copyFileSync(temporaryPath, outputPath);
    fs.unlinkSync(temporaryPath);
    console.log(outputPath);
}

async function addNativePieChart(filename) {
    const zip = await JSZip.loadAsync(fs.readFileSync(filename));
    const sheetPath = "xl/worksheets/sheet1.xml";
    let sheetXml = await zip.file(sheetPath).async("string");
    const drawingTag = '<drawing r:id="rId1"/>';
    sheetXml = sheetXml.includes("<pageMargins")
        ? sheetXml.replace("<pageMargins", drawingTag + "<pageMargins")
        : sheetXml.replace("</worksheet>", drawingTag + "</worksheet>");
    zip.file(sheetPath, sheetXml);

    zip.file("xl/worksheets/_rels/sheet1.xml.rels", relationshipsXml(
        "../drawings/drawing1.xml",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing"
    ));
    zip.file("xl/drawings/drawing1.xml", drawingXml());
    zip.file("xl/drawings/_rels/drawing1.xml.rels", relationshipsXml(
        "../charts/chart1.xml",
        "http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart"
    ));
    zip.file("xl/charts/chart1.xml", chartXml());
    let workbookXml = await zip.file("xl/workbook.xml").async("string");
    const definedNames =
        "<definedNames>" +
        '<definedName name="CourseDepartmentNames">' +
        "OFFSET('Courses by department'!$B$4,0,0," +
        "COUNT('Courses by department'!$C$4:$C$103),1)" +
        "</definedName>" +
        '<definedName name="CourseDepartmentCounts">' +
        "OFFSET('Courses by department'!$C$4,0,0," +
        "COUNT('Courses by department'!$C$4:$C$103),1)" +
        "</definedName>" +
        "</definedNames>";
    workbookXml = workbookXml.includes("<definedNames>")
        ? workbookXml.replace("</definedNames>",
            definedNames.replace(/^<definedNames>|<\/definedNames>$/g, "") +
            "</definedNames>")
        : workbookXml.replace("</workbook>", definedNames + "</workbook>");
    zip.file("xl/workbook.xml", workbookXml);

    let contentTypes = await zip.file("[Content_Types].xml").async("string");
    contentTypes = contentTypes.replace(
        "</Types>",
        '<Override PartName="/xl/drawings/drawing1.xml" ' +
        'ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>' +
        '<Override PartName="/xl/charts/chart1.xml" ' +
        'ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>' +
        "</Types>"
    );
    zip.file("[Content_Types].xml", contentTypes);

    fs.writeFileSync(filename, await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE"
    }));
}

function relationshipsXml(target, type) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="' + type + '" Target="' + target + '"/>' +
        "</Relationships>";
}

function drawingXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" ' +
        'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">' +
        '<xdr:twoCellAnchor>' +
        '<xdr:from><xdr:col>4</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>2</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>' +
        '<xdr:to><xdr:col>12</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>22</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>' +
        '<xdr:graphicFrame macro=""><xdr:nvGraphicFramePr>' +
        '<xdr:cNvPr id="2" name="Courses by department"/><xdr:cNvGraphicFramePr/>' +
        '</xdr:nvGraphicFramePr><xdr:xfrm/><a:graphic><a:graphicData ' +
        'uri="http://schemas.openxmlformats.org/drawingml/2006/chart">' +
        '<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" ' +
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="rId1"/>' +
        '</a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/>' +
        '</xdr:twoCellAnchor></xdr:wsDr>';
}

function chartXml() {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" ' +
        'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">' +
        '<c:date1904 val="0"/><c:lang val="en-US"/><c:roundedCorners val="0"/>' +
        '<c:chart><c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:r>' +
        '<a:rPr lang="en-US" sz="1600" b="1"/><a:t>Courses by department</a:t>' +
        '</a:r></a:p></c:rich></c:tx><c:layout/><c:overlay val="0"/></c:title>' +
        '<c:autoTitleDeleted val="0"/><c:plotArea><c:layout/><c:pieChart>' +
        '<c:varyColors val="1"/><c:ser><c:idx val="0"/><c:order val="0"/>' +
        '<c:tx><c:v>Courses</c:v></c:tx>' +
        '<c:cat><c:strRef><c:f>CourseDepartmentNames</c:f></c:strRef></c:cat>' +
        '<c:val><c:numRef><c:f>CourseDepartmentCounts</c:f></c:numRef></c:val>' +
        '</c:ser><c:dLbls><c:showLegendKey val="0"/><c:showVal val="1"/>' +
        '<c:showCatName val="1"/><c:showSerName val="0"/><c:showPercent val="0"/>' +
        '<c:showLeaderLines val="1"/></c:dLbls><c:firstSliceAng val="270"/>' +
        '</c:pieChart></c:plotArea><c:legend><c:legendPos val="r"/>' +
        '<c:layout/><c:overlay val="0"/></c:legend><c:plotVisOnly val="1"/>' +
        '<c:dispBlanksAs val="gap"/><c:showDLblsOverMax val="0"/></c:chart>' +
        '<c:printSettings><c:headerFooter/><c:pageMargins b="0.75" l="0.7" r="0.7" t="0.75" ' +
        'header="0.3" footer="0.3"/><c:pageSetup/></c:printSettings></c:chartSpace>';
}

async function validateWorkbook(filename) {
    const zip = await JSZip.loadAsync(fs.readFileSync(filename));
    const required = [
        "xl/charts/chart1.xml",
        "xl/drawings/drawing1.xml",
        "xl/worksheets/_rels/sheet1.xml.rels"
    ];
    for (const entry of required)
        if (!zip.file(entry))
            throw new Error("Generated workbook is missing " + entry);

    const chart = await zip.file("xl/charts/chart1.xml").async("string");
    if (!chart.includes("<c:pieChart>"))
        throw new Error("Generated workbook is missing its native pie chart.");
    if (!chart.includes("CourseDepartmentNames") ||
        !chart.includes("CourseDepartmentCounts"))
        throw new Error("Generated chart is missing its dynamic data ranges.");

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filename);
    const sheet = workbook.getWorksheet("Courses by department");
    if (!sheet || !String(sheet.getCell("A4").value).includes(
        "get_department_chart_rows"
    ))
        throw new Error("Generated workbook is missing its data loop.");
}

main().catch(function(error) {
    console.error(error);
    process.exitCode = 1;
});
