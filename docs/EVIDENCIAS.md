# Evidencias locales de Lomax

Pruebas realizadas el 29/09/2026. El documento Lomax Cloud local con evidencias.docx incorpora 14 capturas reales y registros R1 a R3. Los originales están en evidencias/.

Docker Compose se ejecutó como proyecto independiente lomax-evidencia en el puerto 8081 y con un volumen nuevo. Kubernetes mantuvo el port-forward 8080, contexto docker-desktop y namespace default. Las bases son independientes.

| Prueba | Evidencia | Resultado |
|---|---|---|
| Cuatro contenedores | Captura 1 | Activos |
| Imágenes propias | Captura 2 | Backend y frontend con etiqueta local |
| Dos redes | Registro R1 | Miembros comprobados |
| Volumen y persistencia Compose | Captura 3 y R1 | Pedido 1 idéntico tras recrear PostgreSQL |
| Seed automático | Captura 4 y R1 | 10 clientes, 20 productos, 20 pedidos |
| Backend una réplica | Captura 5 | 1/1 |
| Backend tres réplicas | Captura 6 y R2 | 3/3 |
| Services y PVC | Captura 7 y R2 | Cuatro Services; PVC Bound |
| Recuperación del backend | Registro R2 | Pod nuevo y tres réplicas disponibles |
| Productos y clientes | Capturas 8 y 9 | 20 productos y 10 clientes |
| Crear pedido | Capturas 10 y 11 | Pedido 22 registrado desde la interfaz |
| Listado | Captura 12 | Pedido 22 presente |
| Persistencia Kubernetes | Capturas 13 y 14; R3 | JSON completo del pedido 21 idéntico |
| Salud y distintas réplicas | Registro R3 | status ok y distintos hostnames |

La primera consulta inmediatamente después de recuperar PostgreSQL devolvió HTTP 500. Un reintento posterior recuperó el pedido completo. Esto acredita persistencia, pero no disponibilidad ininterrumpida durante el reinicio.

El proyecto Compose de evidencias se detuvo sin borrar volúmenes. El volumen original lomax_postgres_data se conservó y Kubernetes quedó con tres réplicas. El pedido 22 permanece como registro de la demostración.

Pendientes: publicación real en Docker Hub (E04), asignación de roles y tablero del equipo.

