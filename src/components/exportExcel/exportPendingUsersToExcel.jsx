import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportPendingUsersToExcel = async (
  data,
  title = "Pending Users List"
) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Pending Users");

  // Define columns
  const columns = [
    { header: "S.No", key: "sno", width: 10 },
    { header: "Full Name", key: "full_name", width: 30 },
    { header: "Address", key: "address", width: 45 },
    { header: "Mobile", key: "mobile", width: 30 },
    { header: "Email", key: "email", width: 30 },
  ];
  worksheet.columns = columns;

  const columnCount = columns.length;

  // ----- TITLE ROW -----
  worksheet.mergeCells(1, 1, 1, columnCount);
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: "center", vertical: "middle", indent: 1 };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "f3f4f6" },
  };
  worksheet.getRow(1).height = 30;

  // ----- HEADER ROW -----
  const headerRow = worksheet.getRow(2);
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = col.header;
    cell.font = { bold: true };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f3f4f6" },
    };
    cell.alignment = { horizontal: "center", vertical: "middle", indent: 1 };
    worksheet.getColumn(index + 1).width = col.width;
  });
  headerRow.commit();

  // ----- DATA ROWS -----
  data.forEach((item, i) => {
    const row = worksheet.getRow(i + 3);
    row.getCell(1).value = i + 1;
    row.getCell(2).value = item.full_name || "";
    row.getCell(3).value = item.address || item.related_address || "";
    row.getCell(4).value = item.mobile || item.related_mobile || "";
    row.getCell(5).value = item.email || item.related_email || "";

    for (let j = 1; j <= columnCount; j++) {
      const cell = row.getCell(j);
      cell.alignment = {
        vertical: "middle",
        horizontal: j === 1 ? "center" : "left",
        indent: 1,
        wrapText: true,
      };
    }

    row.commit();
  });

  // ----- EXPORT -----
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${title.replace(/\s+/g, "_")}.xlsx`);
};
