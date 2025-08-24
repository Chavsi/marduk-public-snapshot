import '../../tabulator_master/tabulator.js';
import { VALID_TABULATOR_KEYS } from "/static/js/tabulator/valid_tabulator_keys.js";

/**
 * Inicializa una tabla Tabulator con soporte para paginación local/remota.
 *
 * @param {Object} options - Configuración de la tabla.
 * @param {string} options.elementId - ID del elemento DOM (ej. "#user-table").
 * @param {string} [options.url] - URL desde donde cargar los datos vía AJAX.
 * @param {Array} [options.data] - Datos estáticos (si no se usa AJAX).
 * @param {Array} options.columns - Columnas de Tabulator.
 * @param {string} options.csrfToken - Token CSRF para proteger la petición.
 * @param {string} [options.responseKey] - Clave para extraer el array de datos del JSON.
 * @param {string} [options.paginationType] - "local" o "remote" (por defecto "local").
 * @param {number} [options.paginationSize] - Cuántos ítems por página (por defecto 10).
 * @param {Object} [options.extraConfig] - Opciones adicionales para extender Tabulator.
 */
export function initTabulatorTable({
    elementId,
    url,
    data,
    columns,
    csrfToken,
    responseKey = null,
    paginationType = "local",
    paginationSize = 10,
    extraConfig = {}
}) {
    if (!csrfToken) {
        console.error("❌ CSRF Token no encontrado.");
        alert("❌ Error de seguridad: No se encontró el token CSRF.");
        return;
    }

    // 🔧 Alineación por defecto y expansión flexible
    const normalizedColumns = columns.map(col => ({
        hozAlign: col.hozAlign || "left",
        widthGrow: col.widthGrow ?? 1,
        ...col,
    }));

    // 🧠 Configuración base
    const tableConfig = {
        layout: "fitData",
        placeholder: "🚫 No se encontraron datos.",
        pagination: true,
        paginationMode: paginationType,
        paginationSize: paginationSize,
        paginationSizeSelector: [5, 10, 15, 20, 50, 100],
        responsiveLayout: false,
        rowHeight: 35,
        columns: normalizedColumns,
        ...extraConfig,
    };

    // 📡 AJAX (solo si hay URL)
    if (url) {
        tableConfig.ajaxURL = url;
        tableConfig.ajaxConfig = {
            method: "GET",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
                "X-Requested-With": "XMLHttpRequest"
            }
        };

        if (paginationType === "remote") {
            tableConfig.paginationDataSent = {
                page: "page",
                size: "size"
            };
            tableConfig.paginationDataReceived = {
                last_page: "last_page",
                data: "data",
                total: "total"
            };
        }

        // 📦 Adaptador de respuesta para extraer los datos correctamente
        tableConfig.ajaxResponse = (url, params, response) => {
            console.log("🛰️ Respuesta cruda recibida:", response);

            // 🌐 Si viene como array directo (modo local sin metadatos)
            if (Array.isArray(response)) return response;

            // 📦 Si la respuesta usa "responseKey" personalizado
            if (responseKey && Array.isArray(response[responseKey])) return response[responseKey];

            // 📦 Si la respuesta usa "data" con paginación remota
            if (response?.data && Array.isArray(response.data)) return response.data;

            // 🔁 Fallback: buscar en claves conocidas
            for (const key of VALID_TABULATOR_KEYS) {
                if (Array.isArray(response[key])) return response[key];
            }

            console.warn("⚠️ No se encontró data válida en la respuesta.");
            return [];
        };

    } else if (data) {
        tableConfig.data = data;
    }

    //console.log("🧩 Config final:", tableConfig);

    // 🚀 Instanciar y devolver
    const table = new Tabulator(elementId, tableConfig);

    // 🛠️ Fuerza manualmente las claves esperadas por si extraConfig las rompió

    //console.log(`📊 Tabulator cargado en ${elementId} con paginación ${paginationType}`);
    return table;
}
