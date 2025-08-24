# 🐍 PIP QuickGuide — CompuMásSoft

📆 Guía esencial para gestión de paquetes en proyectos Python  
📆 Compatible con entornos virtuales (`venv`, `env`)  
🛠️ Uso diario + mantenimiento a largo plazo

---

## ✅ Crear y activar entorno virtual

```bash
# Crear entorno virtual
python -m venv venv

# Activar en Windows (CMD o PowerShell)
venv\Scripts\activate

# Activar en Git Bash o WSL
source venv/bin/activate
```

---

## 📥 Instalar paquetes

```bash
# Instalar uno
pip install flask

# Instalar múltiples
pip install flask flask-login flask-wtf
```

---

## 📜 Guardar dependencias en archivo

```bash
# Recomendado luego de instalar o actualizar
pip freeze > requirements.txt
```

---

## 📄 Instalar desde requirements.txt

```bash
pip install -r requirements.txt
```

---

## 🔍 Ver qué está instalado

```bash
pip list
```

---

## 🛘 Ver paquetes desactualizados

```bash
pip list --outdated
```

---

## ♻️ Actualizar paquete individual

```bash
pip install -U nombre_paquete

# Ejemplo:
pip install -U Flask
```

---

## 🔁 Actualizar TODO (con cuidado)

```bash
pip list --outdated --format=freeze | cut -d '=' -f1 | xargs -n1 pip install -U
```

🚧 *Requiere shell tipo Unix (Git Bash, WSL, Linux). No usar si no se entiende el riesgo.*

---

## ❌ Desinstalar paquetes

```bash
pip uninstall flask
```

---

## 🧠 Herramientas útiles

```bash
# Ver árbol de dependencias
pip install pipdeptree
pipdeptree

# Mostrar versiones y origen de paquetes
pip show flask
```

---

## 📌 Comandos frecuentes en CompuMásSoft

```bash
pip install -r requirements.txt
pip list --outdated
pip install -U flask sqlalchemy
pip freeze > requirements.txt
```

---

💡 **Tip:** siempre activa tu entorno virtual antes de correr `pip` para evitar conflictos globales.

```bash
(venv) PS C:\web_project2>
```

---

\ua9 CompuMásSoft — Pip QuickGuide v1.0

