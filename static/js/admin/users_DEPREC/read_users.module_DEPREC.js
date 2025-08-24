// C:\web_project2\static\js\admin\users\read_users.module.js
import { initTabulatorTable } from "/static/js/tabulator/tabulator_loader.js";
import { getDropdownEditor } from "/static/js/components/inline_dropdown_util.js";
import { attachInlineActionListeners } from "/static/js/admin/users/inline_users_actions.module.js";



document.addEventListener("DOMContentLoaded", async () => {
    const csrfToken = document.querySelector("meta[name='csrf-token']")?.content;

    const style = document.createElement("style");
    style.innerHTML = `
    .tabulator-cell.wrap-cell {
        white-space: normal !important;
        overflow-wrap: break-word !important;
        word-break: break-word !important;
    }
    `;
    document.head.appendChild(style);    

    const roleMap = {}; // { value: { label, icon } }
    let dropdownOptions = []; // [{ label, value }]

    try {
        const response = await fetch("/admin/roles/api/roles");
        const roles = await response.json();

        if (Array.isArray(roles)) {
            roles.forEach(r => {
                if (r?.value && r?.role_label) {
                    roleMap[r.value] = { label: r.role_label, icon: r.icon || "🔧" };
                    dropdownOptions.push({ label: `${r.icon || "🔧"} ${r.role_label}`, value: r.value });
                }
            });
        } else {
            console.warn("⚠️ Respuesta inesperada desde /api/roles:", roles);
        }

    } catch (err) {
        console.error("❌ Error cargando roles", err);
    }

    const formatRoleCell = value => {
        const role = roleMap[value];
        return role ? `${role.icon} ${role.label}` : `🔧 ${value}`;
    };

    const roleDropdownEditor = getDropdownEditor(dropdownOptions);

    // ✅ Guardamos la tabla globalmente para poder accederla desde otros módulos
    window.userTable = initTabulatorTable({
        elementId: "#user-table",
        url: "/admin/users/api/read-users",
        csrfToken,
        paginationType: "local",
        paginationSize: 10,
        columns: [
            {
                title: "Acciones",
                field: "actions",
                formatter: function(cell) {
                    const id = cell.getRow().getData().id;
                    return `
                        <button class="btn-mini red btn-delete" data-id="${id}" data-action="delete">🗑️</button>
                        <button class="btn-mini yellow btn-edit" data-id="${id}" data-action="edit">✏️</button>                        
                        <button class="btn-mini green btn-save" data-id="${id}" data-action="save" style="display:none;">💾</button>
                        <button class="btn-mini gray btn-cancel" data-id="${id}" data-action="cancel" style="display:none;">❌</button>
                        <button class="btn-mini blue btn-view" data-id="${id}" data-action="view">👁️</button>
                        `;
                },
                minWidth: 64,
                hozAlign: "center",
                headerSort: false
            },
            { title: "ID", field: "id", sorter: "number", editor: false },
            { title: "Usuario", field: "username", sorter: "string", cssClass: "wrap-cell" },
            { title: "Nombre", field: "name", sorter: "string", editor: "input", cssClass: "wrap-cell" },
            {
                title: "Rol",
                field: "role",
                sorter: "string",
                ...roleDropdownEditor,
                formatter: cell => formatRoleCell(cell.getValue())
            },
            {
                title: "Plan Actual",
                field: "plan_name",
                formatter: cell => cell.getValue() || "—"
            },
            {
                title: "Plan Activo",
                field: "active_plan_name",
                formatter: cell => cell.getValue() || "—"
            },
            {
                title: "Precio Plan",
                field: "plan_price",
                cssClass: "wrap-cell",
                formatter: cell => {
                    const val = cell.getValue();
                    return val !== null && val !== undefined ? `$${val.toFixed(2)}` : "—";
                }
            },
            {
                title: "Plan",
                field: "plan_action",
                cssClass: "wrap-cell",
                formatter: function(cell) {
                    const id = cell.getRow().getData().id;
                    return `<button class="btn-mini blue" data-id="${id}" data-action="assign-plan">🪪 Plan</button>`;
                },
                minWidth: 64,
                hozAlign: "center",
                headerSort: false
            },
            { title: "Estado", field: "estado", formatter: cell => cell.getValue() === 1 ? "Activo" : "Inactivo", cssClass: "wrap-cell" },
            { title: "Último login", field: "last_login", sorter: "datetime", sorterParams: { format: "iso" }, editor: false, cssClass: "wrap-cell" },
            { title: "Creado por", field: "created_by", sorter: "number", editor: false },
            { title: "Creado", field: "created_at", sorter: "datetime", sorterParams: { format: "iso" }, editor: false },
            { title: "Modificado", field: "modified_at", sorter: "datetime", sorterParams: { format: "iso" }, editor: false },
            { title: "Email", field: "email", sorter: "string", editor: "input", cssClass: "wrap-cell" },
            { title: "Teléfono", field: "phone_number", sorter: "string", editor: "input", cssClass: "wrap-cell" },
            { title: "Dirección", field: "address", sorter: "string", editor: "input", cssClass: "wrap-cell" }
        ]
    });

    setTimeout(() => {
        attachInlineActionListeners(csrfToken);
    }, 100);

    // ✅ Abrir modal al hacer clic en el botón "Añadir Usuario"
    const openBtn = document.getElementById("btnAddUser");
    const modal = document.getElementById("userModal");
    const closeBtn = document.getElementById("modalClose");

    if (openBtn && modal && closeBtn) {
        openBtn.addEventListener("click", () => modal.classList.remove("hidden"));
        closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    } else {
        console.warn("⚠️ Elementos del modal no encontrados (btnAddUser, userModal, modalClose).");
    }
});
