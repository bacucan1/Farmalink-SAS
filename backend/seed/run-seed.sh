#!/bin/bash

# Farmalink - Script de Seed de Datos
# Ejecuta todos los scripts de seed en orden

echo "========================================"
echo "  FARALINK - SEED DE DATOS"
echo "========================================"
echo ""

MONGODB_URI=${MONGODB_URI:-"mongodb://localhost:27017/farmalink"}

echo "Conectando a: $MONGODB_URI"
echo ""

echo "Paso 1/4: Insertando Usuarios..."
mongosh "$MONGODB_URI" --file backend/seed/1_users.js

echo ""
echo "Paso 2/4: Insertando Farmacias..."
mongosh "$MONGODB_URI" --file backend/seed/2_farmacias.js

echo ""
echo "Paso 3/4: Insertando Medicamentos..."
mongosh "$MONGODB_URI" --file backend/seed/3_medicamentos.js

echo ""
echo "Paso 4/4: Insertando Precios..."
mongosh "$MONGODB_URI" --file backend/seed/4_precios.js

echo ""
echo "========================================"
echo "  SEED COMPLETADO"
echo "========================================"
echo ""
echo "Resumen de datos:"
mongosh "$MONGODB_URI" --quiet --eval '
  print("  Usuarios: " + db.users.countDocuments());
  print("  Farmacias: " + db.farmacias.countDocuments());
  print("  Medicamentos: " + db.medicamentos.countDocuments());
  print("  Precios: " + db.precios.countDocuments());
'
