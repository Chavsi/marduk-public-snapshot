import { initTabulatorTable } from "/static/js/tabulator/tabulator_loader.js";

document.addEventListener("DOMContentLoaded", () => {
    const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

    // 🔧 Forzar wrap desde JS ya que no podemos tocar el CSS
    const style = document.createElement("style");
    style.innerHTML = `
      .tabulator-cell.wrap-cell {
        white-space: normal !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
      }
    `;
    document.head.appendChild(style);

    const table = initTabulatorTable({
        elementId: "#routes-table",
        url: "/admin/routes/api",
        csrfToken,
        columns: [
            { title: "Endpoint", field: "endpoint", sorter: "string", widthGrow: 2, cssClass: "wrap-cell" },
            { title: "URL", field: "rule", sorter: "string", widthGrow: 2, cssClass: "wrap-cell" },
            {
                title: "Métodos",
                field: "methods",
                widthGrow: 1,
                cssClass: "wrap-cell",
                formatter: function(cell) {
                    const methods = cell.getValue();
                    if (!Array.isArray(methods)) return "";
                    return methods.map(method => `<span class="badge badge-method">${method}</span>`).join(" ");
                }
            },
            { title: "¿API?", field: "is_api", formatter: "tickCross", widthGrow: 0.5, hozAlign: "center"},
            { title: "¿Pública?", field: "is_public", formatter: "tickCross", widthGrow: 0.5, hozAlign: "center" },
            {
                title: "Roles requeridos",
                field: "required_roles",
                widthGrow: 1.5,
                formatter: function(cell) {
                    const roles = cell.getValue();
                    if (!Array.isArray(roles) || roles.length === 0) return "—";
                    return roles.map(r => `<span class="badge badge-role">${r}</span>`).join(" ");
                },
                hozAlign: "left"
            },
            { title: "¿Retorna JSON?", field: "returns_json", formatter: "tickCross", widthGrow: 0.5, hozAlign: "center" },
            {
                title: "✅ Revisión",
                field: "checked",
                formatter: "tickCross",
                editor: true,
                hozAlign: "center"
            },
            {
                title: "📝 Nota",
                field: "note",
                editor: "input",
                cssClass: "wrap-cell"
            }
        ],
        extraConfig: {
            layout: "fitData",
            columnDefaults: {
                resizable: true
            }
        }
    });
    
    table.on("cellEdited", async (cell) => {
        const rowData = cell.getRow().getData();

        try {
            const response = await fetch("/admin/routes/api/update-note", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrfToken,
                },
                body: JSON.stringify({
                    endpoint: rowData.endpoint,
                    note: rowData.note,
                    checked: rowData.checked,
                })
            });

            if (!response.ok) throw new Error("Error al guardar");

            const result = await response.json();
            console.log("✅ Guardado:", result.message || result);

        } catch (error) {
            console.error("❌ Error al guardar:", error);
            alert("⚠️ Hubo un problema al guardar la nota o el check.");
        }
    });
});
