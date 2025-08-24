# 🛡 Guía de Limpieza y Verificación de Troyano Detectado en Escritorio

## 🧩 Situación inicial

- El sistema mostraba que el Escritorio pesaba ~48 GB, a pesar de tener solo archivos pequeños visibles.
- Se ejecutó el siguiente comando en `cmd` para revisar a fondo:

```cmd
dir /a /s
```

- Resultado: Se detectó un archivo sospechoso:
  ```
  Trojan:Win32/Hidcon!MSR
  ```
  ubicado dentro de una carpeta descargada para reparar Windows:
  ```
  D:\medicant torrent\Password_Removal\Jayro's_Lockpick\Lockpick.wim
  ```

## ✅ Proceso de Limpieza

### 1. **Mover carpeta infectada**
- Se movió la carpeta `medicant torrent` desde el Escritorio a otra unidad (`D:`).
- Windows Defender detectó automáticamente el troyano al mover el archivo.

### 2. **Eliminar carpeta**
- Se ejecutó una eliminación manual completa de la carpeta desde el Explorador o terminal:

```cmd
rmdir /s /q "D:\medicant torrent"
```

### 3. **Escaneo completo con Defender**
- Se inició un escaneo completo desde el Centro de Seguridad de Windows.
- Tiempo estimado: 2 a 3 horas.

## 🔍 Verificaciones adicionales

### 4. **Verificar arranque automático (Registro)**

#### Claves revisadas:

- `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`
- `HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Run`

✅ Limpias, salvo una entrada legítima:

```
SecurityHealth   REG_EXPAND_SZ   %windir%\system32\SecurityHealthSystray.exe
```

### 5. **Tareas programadas**
- Ejecutado `taskschd.msc` → sin tareas sospechosas.

### 6. **Configuración de inicio**
- Ejecutado `msconfig` → pestaña `Inicio de Windows` limpia.

### 7. **Carpetas comunes de infección (pendiente de revisar)**

Revisar manualmente si hay restos en las siguientes carpetas:

```
%APPDATA%
%LOCALAPPDATA%
%TEMP%
C:\ProgramData\
C:\Windows\Temp\
```

### 8. **Liberar espacio (opcional)**

Ejecutar:

```cmd
cleanmgr
```

✔ Recomendado marcar:

- Archivos temporales  
- Papelera de reciclaje  
- Miniaturas  
- Archivos temporales del sistema  
- Informes de errores de Windows  

❌ No borra archivos personales ni programas.

## 🎯 Recomendación final

Crear un punto de restauración:

1. `Win + R` → escribir: `SystemPropertiesProtection`
2. Seleccionar disco `C:`
3. Clic en **Crear**
4. Nombre sugerido:
   ```
   Post-Troyano Limpio - [fecha]
   ```

## ✅ Estado final

| Elemento                            | Estado   |
|------------------------------------|----------|
| Carpeta sospechosa eliminada       | ✔️        |
| Troyano neutralizado               | ✔️        |
| Escaneo completo ejecutándose      | ⏳        |
| Registros limpios                  | ✔️        |
| Arranque limpio                    | ✔️        |
| Verificación visual                | ✔️        |

---

**Autor:** Usuario de CompuMásSoft 🧠  
**Fecha:** [Completar con fecha real]
